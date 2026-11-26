import { getFutureUTCDateISO } from "@/lib/date";
import type { Material, Subject } from "@/lib/supabase";

/** Builds mock GTU subjects with exam dates computed dynamically from UTC today. */
export function getMockSubjects(): Subject[] {
  return [
    {
      code: "3130702",
      name: "Data Structures",
      branch: "CSE",
      semester: 3,
      exam_date: getFutureUTCDateISO(6),
      passing_target: "12/30 Marks",
      topper_name: "Priya Patel (9.4 SPI)",
      unlocked_by: ["Meet", "Rohan", "Diya"],
    },
    {
      code: "3130703",
      name: "Database Management Systems",
      branch: "CSE",
      semester: 3,
      exam_date: getFutureUTCDateISO(9),
      passing_target: "12/30 Marks",
      topper_name: "Rohan Sharma (9.2 SPI)",
      unlocked_by: ["Karan", "Neha"],
    },
    {
      code: "3130704",
      name: "Digital Fundamentals",
      branch: "IT",
      semester: 3,
      exam_date: getFutureUTCDateISO(12),
      passing_target: "12/30 Marks",
      topper_name: "Aarav Shah (9.1 SPI)",
      unlocked_by: ["Dev"],
    },
  ];
}

export const MOCK_SUBJECTS: Subject[] = getMockSubjects();

export const MOCK_MATERIALS: Material[] = [
  // 3130702 — Data Structures: 8 IMPs (6 unlocked, 2 locked) + 2 Assignments (1 unlocked, 1 locked)
  {
    id: 1,
    subject_code: "3130702",
    type: "IMP",
    unit: 1,
    question: "Explain Asymptotic Notations (Big-O, Omega, Theta) with examples and Time-Space Tradeoff.",
    answer:
      "• Big-O (O): Upper bound (worst-case). f(n) <= c·g(n) for all n >= n0.\n• Omega (Ω): Lower bound (best-case). f(n) >= c·g(n) for all n >= n0.\n• Theta (Θ): Tight bound (average-case). c1·g(n) <= f(n) <= c2·g(n) for n >= n0.\n• Time-Space Tradeoff: Increasing extra memory (like lookup tables or hash maps) reduces execution time, whereas minimizing RAM increases computation steps.",
    proof_tag: "Asked 5x in GTU + Mid-Sem Q1(a)",
    topper_tip:
      "Draw the 3 small growth graphs alongside the inequalities — examiners award 2 full marks just for neat labeled graphs. Always mention a concrete example like Binary Search = O(log n).",
    is_must_do: true,
    is_locked: false,
  },
  {
    id: 2,
    subject_code: "3130702",
    type: "IMP",
    unit: 1,
    question: "Write an algorithm to convert an Infix expression to Postfix using Stack and trace A + (B * C - D) / E.",
    answer:
      "• Scan infix expression left to right.\n• If operand: append directly to postfix output.\n• If '(': push onto stack; if ')': pop until '(' is discarded.\n• If operator: pop operators with >= precedence (respecting associativity), then push current operator.\n• Trace result for A + (B * C - D) / E => A B C * D - E / +.",
    proof_tag: "Asked 4x in GTU + Assignment Q1",
    topper_tip:
      "Make a 3-column trace table (Symbol | Stack | Postfix String) in the exam. Even if you miss one bracket in the final string, the clean step table secures 5/7 marks.",
    is_must_do: true,
    is_locked: false,
  },
  {
    id: 3,
    subject_code: "3130702",
    type: "IMP",
    unit: 1,
    question: "Differentiate Linear Queue vs Circular Queue. Write ENQUEUE and DEQUEUE algorithms for Circular Queue.",
    answer:
      "• Linear Queue wastes memory after front moves forward (false overflow when REAR == MAX - 1).\n• Circular Queue wraps around using modulo arithmetic: REAR = (REAR + 1) % MAX.\n• Full Condition: (REAR + 1) % MAX == FRONT.\n• Empty Condition: FRONT == -1; on last element deletion, reset FRONT = REAR = -1.",
    proof_tag: "Asked 4x in GTU + Assignment Q2",
    topper_tip:
      "Highlight the exact `(REAR + 1) % MAX == FRONT` overflow formula inside a box. Write both the overflow and empty checks before modifying array indices.",
    is_must_do: true,
    is_locked: false,
  },
  {
    id: 4,
    subject_code: "3130702",
    type: "IMP",
    unit: 2,
    question: "Compare Singly Linked List vs Doubly Linked List and write an algorithm to insert a node at a given position.",
    answer:
      "• Singly LL: 1 pointer (next), forward traversal only, less memory per node.\n• Doubly LL: 2 pointers (prev, next), bidirectional traversal, O(1) deletion with node pointer.\n• Insert at pos: Create NEW node -> traverse temp to (pos - 1) -> NEW.next = temp.next -> temp.next = NEW.\n• Edge Case: If pos == 1, update NEW.next = HEAD and HEAD = NEW.",
    proof_tag: "Asked 3x in GTU + Mid-Sem Q2(b)",
    topper_tip:
      "Always draw pointer arrows before/after insertion for 3 nodes (10 -> 20 -> 30). Never forget the `pos == 1` and `NULL` boundary checks in pseudo-code.",
    is_must_do: true,
    is_locked: false,
  },
  {
    id: 5,
    subject_code: "3130702",
    type: "IMP",
    unit: 2,
    question: "Construct a Binary Search Tree (BST) and explain Preorder, Inorder, and Postorder traversals with deletion cases.",
    answer:
      "• BST Property: Left subtree < Root < Right subtree.\n• Traversals: Preorder (Root-Left-Right), Inorder (Left-Root-Right -> sorted output), Postorder (Left-Right-Root).\n• Deletion Case 1 (Leaf): Remove directly.\n• Deletion Case 2 (1 Child): Replace node with its single child.\n• Deletion Case 3 (2 Children): Replace with Inorder Successor (smallest in right subtree) and delete successor.",
    proof_tag: "Asked 5x in GTU + Assignment Q3",
    topper_tip:
      "Remember 'Inorder of BST is always Ascending Sorted' — use it to double-check your tree trace in 10 seconds. For 2-child deletion, clearly show the Inorder Successor swap.",
    is_must_do: true,
    is_locked: false,
  },
  {
    id: 6,
    subject_code: "3130702",
    type: "IMP",
    unit: 2,
    question: "What is an AVL Tree? Explain LL, RR, LR, and RL rotations with balance factor calculation.",
    answer:
      "• AVL Tree is a self-balancing BST where Balance Factor (BF = Height(Left) - Height(Right)) is -1, 0, or +1.\n• LL Rotation: Single right rotation when inserted in left subtree of left child.\n• RR Rotation: Single left rotation when inserted in right subtree of right child.\n• LR / RL Rotations: Double rotations (Left-then-Right for LR; Right-then-Left for RL).",
    proof_tag: "Asked 4x in GTU + Topper Notes",
    topper_tip:
      "Write BF values on top of every node at each insertion step so the examiner sees where imbalance (+2 or -2) triggered the rotation. LR = Left rotate child, then Right rotate parent.",
    is_must_do: true,
    is_locked: false,
  },
  {
    id: 7,
    subject_code: "3130702",
    type: "IMP",
    unit: 3,
    question: "Compare BFS and DFS graph traversal algorithms with data structures used and real-world applications.",
    answer:
      "• BFS (Breadth-First Search): Level-by-level traversal using a Queue (FIFO). Finds shortest path in unweighted graphs.\n• DFS (Depth-First Search): Branch-by-branch deep traversal using a Stack / Recursion (LIFO). Used for cycle detection & topological sort.\n• Time Complexity: O(V + E) for both using Adjacency List.\n• Space Complexity: O(V) for visited array and Queue/Stack.",
    proof_tag: "Asked 4x in GTU + Mid-Sem Q3(a)",
    topper_tip:
      "Write a clean 4-row comparison table (Data Structure, Strategy, Applications, Complexity) first, then trace a small 5-vertex graph step by step.",
    is_must_do: true,
    is_locked: true,
  },
  {
    id: 8,
    subject_code: "3130702",
    type: "IMP",
    unit: 3,
    question: "Compare Quick Sort and Merge Sort on time complexity, space complexity, stability, and pivot behavior.",
    answer:
      "• Quick Sort: Divide & conquer via pivot partitioning. Average O(n log n), Worst O(n²) when array is already sorted. In-place O(log n) stack space, unstable.\n• Merge Sort: Splits array in half and merges sorted halves. Guaranteed O(n log n) in all cases. Requires O(n) extra array space, stable.\n• Use Quick Sort for in-memory arrays; Merge Sort for linked lists & external sorting.",
    proof_tag: "Asked 3x in GTU + Assignment Q4",
    topper_tip:
      "Examiners specifically check whether you mention Quick Sort's O(n²) worst-case trigger (sorted/reverse-sorted input with first/last pivot) and Merge Sort's O(n) auxiliary space.",
    is_must_do: true,
    is_locked: true,
  },
  {
    id: 9,
    subject_code: "3130702",
    type: "ASSIGNMENT",
    unit: 1,
    question: "Assignment 1: Implement Stack using Array (PUSH, POP, PEEP, CHANGE) & Evaluate a Postfix Expression.",
    answer:
      "• Maintain TOP = -1 initially; MAX = array capacity.\n• PUSH(x): Check TOP == MAX - 1 (Overflow), else TOP++, S[TOP] = x.\n• POP(): Check TOP == -1 (Underflow), else return S[TOP--].\n• PEEP(i): Returns ith element from top at S[TOP - i + 1] if valid.\n• Postfix Eval: Push operands; on operator pop B then A, compute (A op B), push result.",
    proof_tag: "College Assignment 1 (Full Solution)",
    topper_tip:
      "Watch the operand pop order in Postfix evaluation: first popped value is right operand `B`, second is left operand `A` (critical for `-` and `/`).",
    is_must_do: true,
    is_locked: false,
  },
  {
    id: 10,
    subject_code: "3130702",
    type: "ASSIGNMENT",
    unit: 3,
    question: "Assignment 2: Hashing Functions & Collision Resolution Techniques (Linear Probing, Quadratic Probing, Chaining).",
    answer:
      "• Hashing maps key k to index h(k) = k mod m in O(1) average lookup.\n• Separate Chaining: Each bucket holds a linked list of colliding keys; avoids table full limit.\n• Linear Probing: h(k, i) = (h'(k) + i) mod m; suffers from primary clustering.\n• Quadratic Probing: h(k, i) = (h'(k) + c1·i + c2·i²) mod m; reduces primary clustering.",
    proof_tag: "College Assignment 2 + GTU 7-Mark Q",
    topper_tip:
      "Show a concrete table of size 10 with keys [12, 22, 32] for Linear Probing vs Chaining — numerical tables are the fastest way to score 7/7 here.",
    is_must_do: true,
    is_locked: true,
  },

  // 3130703 — Database Management Systems: 2 sample IMPs
  {
    id: 11,
    subject_code: "3130703",
    type: "IMP",
    unit: 1,
    question: "Explain the 3-Level ANSI/SPARC Architecture of DBMS and Physical vs Logical Data Independence.",
    answer:
      "• External Level (View Level): Custom user views hiding irrelevant columns/tables.\n• Conceptual Level (Logical Level): Complete database schema, entities, relationships, and constraints.\n• Internal Level (Physical Level): Actual file storage, B+ tree indexes, and compression.\n• Logical Data Independence: Changing conceptual schema without breaking external views.\n• Physical Data Independence: Changing storage/indexes without changing conceptual schema.",
    proof_tag: "Asked 5x in GTU + Mid-Sem Q1",
    topper_tip:
      "Draw the 3-tier stacked block diagram with External -> Conceptual -> Internal mappings. Clearly state that Logical Data Independence is harder to achieve than Physical.",
    is_must_do: true,
    is_locked: false,
  },
  {
    id: 12,
    subject_code: "3130703",
    type: "IMP",
    unit: 2,
    question: "Explain Normalization (1NF, 2NF, 3NF, BCNF) with Functional Dependency conditions.",
    answer:
      "• 1NF: Atomic attribute values only; no repeating groups or multivalued cells.\n• 2NF: Must be in 1NF + no Partial Dependency (non-prime attribute depending on part of candidate key).\n• 3NF: Must be in 2NF + no Transitive Dependency (non-prime -> non-prime).\n• BCNF: For every non-trivial FD X -> Y, X must be a Super Key.",
    proof_tag: "Asked 6x in GTU + Assignment Q2",
    topper_tip:
      "Always pair each normal form with a 3-column mini table showing the anomaly before and after decomposition. Examiners love the exact 'X is a Super Key' rule for BCNF.",
    is_must_do: true,
    is_locked: false,
  },

  // 3130704 — Digital Fundamentals: 2 sample IMPs
  {
    id: 13,
    subject_code: "3130704",
    type: "IMP",
    unit: 1,
    question: "State De Morgan's Theorems and realize AND, OR, NOT gates using Universal Gates (NAND & NOR).",
    answer:
      "• De Morgan Law 1: (A + B)' = A' · B' (Complement of sum = product of complements).\n• De Morgan Law 2: (A · B)' = A' + B' (Complement of product = sum of complements).\n• NAND as NOT: Tie both inputs together (A · A)' = A'.\n• NAND as AND: NAND followed by NAND inverter.\n• NAND as OR: Invert both inputs with NAND, then feed into NAND.",
    proof_tag: "Asked 4x in GTU + Assignment Q1",
    topper_tip:
      "Write the Truth Table for both De Morgan laws side by side AND draw the clean bubble-input NAND symbols — easy guaranteed 4 or 7 marks.",
    is_must_do: true,
    is_locked: false,
  },
  {
    id: 14,
    subject_code: "3130704",
    type: "IMP",
    unit: 2,
    question: "Explain 4-Variable K-Map minimization rules and Don't-Care conditions with SOP simplification.",
    answer:
      "• Arrange 16 cells in Gray Code order (00, 01, 11, 10) so adjacent cells differ by 1 bit.\n• Group powers of 2 (16, 8, 4, 2, 1) — always make the largest possible groups first, including wrap-around corners.\n• Don't-Care (X / d): Include X inside a group only if it helps form a larger power-of-2 group; never force a group of only X.\n• Write final minimal SOP expression by eliminating variables that change within each group.",
    proof_tag: "Asked 5x in GTU + Mid-Sem Q2",
    topper_tip:
      "Double-check the Gray Code header `00 01 11 10` before filling minterms — 80% of students lose marks by writing `10 11` instead of `11 10`.",
    is_must_do: true,
    is_locked: false,
  },
];
