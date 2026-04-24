const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ── Identity (replace with your real details) ──────────────────────────────
const USER_ID = "kaivalya_07072005";          // e.g. "johndoe_17091999"
const EMAIL_ID = "kaivalya_basu@srmap.edu.in";  // your college email
const COLLEGE_ROLL = "AP23110011311";        // your roll number
// ───────────────────────────────────────────────────────────────────────────

/**
 * Validate a single entry.
 * Returns the parsed { parent, child } or null if invalid.
 */
function parseEntry(raw) {
  const entry = raw.trim();
  // Must match exactly X->Y where X,Y are single uppercase letters
  const match = entry.match(/^([A-Z])->([A-Z])$/);
  if (!match) return null;
  if (match[1] === match[2]) return null; // self-loop
  return { parent: match[1], child: match[2], raw: entry };
}

/**
 * Build hierarchies from valid, de-duplicated edges.
 */
function buildHierarchies(edges) {
  // childParent map: child -> first parent that claimed it
  const childParent = {};
  const childrenOf = {};

  for (const { parent, child } of edges) {
    // Diamond rule: first-encountered parent wins
    if (child in childParent) continue; // silently discard extra parents
    childParent[child] = parent;
    if (!childrenOf[parent]) childrenOf[parent] = [];
    if (!childrenOf[child]) childrenOf[child] = [];
    childrenOf[parent].push(child);
  }

  // Collect all nodes
  const allNodes = new Set();
  for (const { parent, child } of edges) {
    allNodes.add(parent);
    allNodes.add(child);
  }
  // Ensure childrenOf has entry for every node
  for (const n of allNodes) {
    if (!childrenOf[n]) childrenOf[n] = [];
  }

  // Find roots: nodes that are never a child (in childParent)
  const roots = [...allNodes].filter((n) => !(n in childParent));

  // Group nodes into connected components using Union-Find on the ORIGINAL edge set
  const uf = {};
  function find(x) {
    if (uf[x] === undefined) uf[x] = x;
    if (uf[x] !== x) uf[x] = find(uf[x]);
    return uf[x];
  }
  function union(a, b) {
    const ra = find(a), rb = find(b);
    if (ra !== rb) uf[ra] = rb;
  }
  for (const { parent, child } of edges) {
    union(parent, child);
  }

  // Group nodes by component
  const components = {};
  for (const n of allNodes) {
    const r = find(n);
    if (!components[r]) components[r] = [];
    components[r].push(n);
  }

  const hierarchies = [];

  for (const compKey of Object.keys(components)) {
    const compNodes = components[compKey];
    const compRoots = compNodes.filter((n) => !(n in childParent));

    // Detect cycle: do a DFS from each root; if we can't reach all nodes → cycle
    // Also detect pure cycles (no natural root)
    let hasCycle = false;

    if (compRoots.length === 0) {
      // Pure cycle — no natural root
      hasCycle = true;
    } else {
      // Check for cycle via DFS from roots
      for (const root of compRoots) {
        const visited = new Set();
        const stack = [root];
        const inStack = new Set();
        function dfs(node) {
          visited.add(node);
          inStack.add(node);
          for (const ch of childrenOf[node]) {
            if (inStack.has(ch)) { hasCycle = true; return; }
            if (!visited.has(ch)) dfs(ch);
          }
          inStack.delete(node);
        }
        dfs(root);
        if (hasCycle) break;
      }
    }

    if (hasCycle) {
      // Lexicographically smallest node as root for pure cycles
      const cycleRoot =
        compRoots.length > 0
          ? compRoots.sort()[0]
          : [...compNodes].sort()[0];
      hierarchies.push({ root: cycleRoot, tree: {}, has_cycle: true });
    } else {
      // One or more natural roots — each forms its own tree
      for (const root of compRoots.sort()) {
        function buildTree(node) {
          const obj = {};
          for (const child of (childrenOf[node] || []).sort()) {
            obj[child] = buildTree(child);
          }
          return obj;
        }
        const treeContent = buildTree(root);
        const wrappedTree = { [root]: treeContent };

        // Depth: longest root-to-leaf path (node count)
        function calcDepth(node) {
          const children = childrenOf[node] || [];
          if (children.length === 0) return 1;
          return 1 + Math.max(...children.map(calcDepth));
        }
        const depth = calcDepth(root);

        hierarchies.push({ root, tree: wrappedTree, depth });
      }
    }
  }

  return hierarchies;
}

app.post("/bfhl", (req, res) => {
  const { data } = req.body;

  if (!Array.isArray(data)) {
    return res.status(400).json({ error: "data must be an array of strings" });
  }

  const invalidEntries = [];
  const duplicateEdges = [];
  const seenEdges = new Set();
  const validEdges = [];

  for (const item of data) {
    if (typeof item !== "string") {
      invalidEntries.push(String(item));
      continue;
    }
    const parsed = parseEntry(item);
    if (!parsed) {
      invalidEntries.push(item.trim() || item);
      continue;
    }
    const key = `${parsed.parent}->${parsed.child}`;
    if (seenEdges.has(key)) {
      // Only add to duplicates once (first duplicate occurrence)
      if (!duplicateEdges.includes(key)) duplicateEdges.push(key);
    } else {
      seenEdges.add(key);
      validEdges.push(parsed);
    }
  }

  const hierarchies = buildHierarchies(validEdges);

  // Summary
  const nonCyclic = hierarchies.filter((h) => !h.has_cycle);
  const cyclic = hierarchies.filter((h) => h.has_cycle);

  let largestTreeRoot = "";
  if (nonCyclic.length > 0) {
    const sorted = [...nonCyclic].sort((a, b) => {
      if (b.depth !== a.depth) return b.depth - a.depth;
      return a.root < b.root ? -1 : 1;
    });
    largestTreeRoot = sorted[0].root;
  }

  return res.json({
    user_id: USER_ID,
    email_id: EMAIL_ID,
    college_roll_number: COLLEGE_ROLL,
    hierarchies,
    invalid_entries: invalidEntries,
    duplicate_edges: duplicateEdges,
    summary: {
      total_trees: nonCyclic.length,
      total_cycles: cyclic.length,
      largest_tree_root: largestTreeRoot,
    },
  });
});

// Health check
app.get("/", (req, res) => res.json({ status: "BFHL API running" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
