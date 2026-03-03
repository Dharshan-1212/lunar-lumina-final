/**
 * Unit-based curriculum for Study Planner.
 * Each topic: { name, description, url } — GeeksforGeeks links.
 */
export const studyCurriculum = [
  {
    id: "dsa",
    category: "Data Structures & Algorithms",
    topics: [
      { name: "Arrays & Basics", description: "Foundational arrays, time complexity, and basic operations.", url: "https://www.geeksforgeeks.org/array-data-structure/" },
      { name: "Stack", description: "LIFO structure, push/pop operations, and applications.", url: "https://www.geeksforgeeks.org/stack-data-structure/" },
      { name: "Queue", description: "FIFO structure, enqueue/dequeue, and queue variants.", url: "https://www.geeksforgeeks.org/queue-data-structure/" },
      { name: "Linked List", description: "Singly and doubly linked lists, traversal, and operations.", url: "https://www.geeksforgeeks.org/data-structures/linked-list/" },
      { name: "Binary Search", description: "Divide-and-conquer search in sorted arrays.", url: "https://www.geeksforgeeks.org/binary-search/" },
      { name: "Sorting Algorithms", description: "Bubble, merge, quick sort, and time complexities.", url: "https://www.geeksforgeeks.org/sorting-algorithms/" },
      { name: "Recursion", description: "Base case, recursive calls, and stack usage.", url: "https://www.geeksforgeeks.org/recursion/" },
      { name: "Binary Tree", description: "Tree structure, traversals (inorder, preorder, postorder).", url: "https://www.geeksforgeeks.org/binary-tree-data-structure/" },
      { name: "Heap", description: "Heap property, heapify, and priority queues.", url: "https://www.geeksforgeeks.org/heap-data-structure/" },
      { name: "Hash Table", description: "Hashing, collision handling, and O(1) lookup.", url: "https://www.geeksforgeeks.org/hashing-data-structure/" },
      { name: "Graphs", description: "Graph representation, adjacency list/matrix.", url: "https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/" },
      { name: "DFS & BFS", description: "Depth-first and breadth-first graph traversal.", url: "https://www.geeksforgeeks.org/depth-first-search-or-dfs-for-a-graph/" },
      { name: "Dynamic Programming", description: "Memoization, tabulation, and classic DP problems.", url: "https://www.geeksforgeeks.org/dynamic-programming/" },
      { name: "AVL Tree", description: "Self-balancing BST, rotations.", url: "https://www.geeksforgeeks.org/avl-tree-set-1-insertion/" },
      { name: "Trie", description: "Prefix tree for string operations.", url: "https://www.geeksforgeeks.org/trie-insert-and-search/" },
      { name: "Topological Sort", description: "Ordering DAG vertices for dependencies.", url: "https://www.geeksforgeeks.org/topological-sorting/" },
    ],
  },
  {
    id: "oops",
    category: "OOPS",
    topics: [
      { name: "Classes & Objects", description: "Defining classes, instantiating objects.", url: "https://www.geeksforgeeks.org/object-oriented-programming-oops-concept-in-java/" },
      { name: "Encapsulation", description: "Data hiding, access modifiers, getters/setters.", url: "https://www.geeksforgeeks.org/encapsulation-in-c/" },
      { name: "Inheritance", description: "Code reuse, parent-child relationships.", url: "https://www.geeksforgeeks.org/inheritance-in-c/" },
      { name: "Polymorphism", description: "Compile-time and runtime polymorphism.", url: "https://www.geeksforgeeks.org/polymorphism-in-c/" },
      { name: "Abstraction", description: "Abstract classes and interfaces.", url: "https://www.geeksforgeeks.org/abstraction-in-c/" },
      { name: "SOLID Principles", description: "Design principles for maintainable code.", url: "https://www.geeksforgeeks.org/solid-principle-in-programming/" },
      { name: "Design Patterns", description: "Singleton, Factory, Observer, and more.", url: "https://www.geeksforgeeks.org/software-design-patterns/" },
    ],
  },
  {
    id: "os",
    category: "Operating Systems",
    topics: [
      { name: "OS Basics", description: "Kernel, processes, and system calls.", url: "https://www.geeksforgeeks.org/operating-systems/" },
      { name: "Process Scheduling", description: "CPU scheduling algorithms: FCFS, SJF, Round Robin.", url: "https://www.geeksforgeeks.org/cpu-scheduling-in-operating-systems/" },
      { name: "Memory Management", description: "Paging, segmentation, virtual memory.", url: "https://www.geeksforgeeks.org/memory-management-in-operating-system/" },
      { name: "Process Synchronization", description: "Critical sections, mutex, semaphores.", url: "https://www.geeksforgeeks.org/process-synchronization-in-operating-system/" },
      { name: "Deadlock", description: "Deadlock conditions, prevention, avoidance.", url: "https://www.geeksforgeeks.org/deadlock-in-operating-system/" },
    ],
  },
  {
    id: "dbms",
    category: "DBMS",
    topics: [
      { name: "DBMS Basics", description: "Database models, ACID properties.", url: "https://www.geeksforgeeks.org/dbms/" },
      { name: "ER Model", description: "Entities, relationships, and ER diagrams.", url: "https://www.geeksforgeeks.org/introduction-of-er-model/" },
      { name: "SQL", description: "SELECT, JOIN, subqueries, and aggregations.", url: "https://www.geeksforgeeks.org/sql-tutorial/" },
      { name: "Normalization", description: "1NF, 2NF, 3NF, BCNF.", url: "https://www.geeksforgeeks.org/normalization-in-dbms/" },
      { name: "Indexing", description: "B-tree, hash index, and query optimization.", url: "https://www.geeksforgeeks.org/indexing-in-databases/" },
      { name: "ACID Properties", description: "Atomicity, consistency, isolation, durability.", url: "https://www.geeksforgeeks.org/acid-properties-in-dbms/" },
    ],
  },
  {
    id: "python",
    category: "Python Core",
    topics: [
      { name: "Python Basics", description: "Variables, data types, and control flow.", url: "https://www.geeksforgeeks.org/python-programming-language/" },
      { name: "Functions & Modules", description: "Defining functions, scope, and imports.", url: "https://www.geeksforgeeks.org/python-functions/" },
      { name: "Data Structures in Python", description: "Lists, tuples, sets, dictionaries.", url: "https://www.geeksforgeeks.org/python-data-structures/" },
      { name: "Lambda & Map", description: "Anonymous functions and functional tools.", url: "https://www.geeksforgeeks.org/python-lambda-anonymous-functions-filter-map-reduce/" },
      { name: "List Comprehension", description: "Concise list creation and filtering.", url: "https://www.geeksforgeeks.org/python-list-comprehension/" },
      { name: "Exception Handling", description: "try/except, raising exceptions.", url: "https://www.geeksforgeeks.org/python-exception-handling/" },
      { name: "File Handling", description: "Reading and writing files.", url: "https://www.geeksforgeeks.org/file-handling-python/" },
      { name: "Generators", description: "yield, lazy evaluation.", url: "https://www.geeksforgeeks.org/generators-in-python/" },
      { name: "Decorators", description: "Function decorators and wrappers.", url: "https://www.geeksforgeeks.org/decorators-in-python/" },
    ],
  },
  {
    id: "ml",
    category: "Machine Learning",
    topics: [
      { name: "ML Basics", description: "Introduction to machine learning concepts.", url: "https://www.geeksforgeeks.org/machine-learning/" },
      { name: "Supervised Learning", description: "Regression and classification.", url: "https://www.geeksforgeeks.org/supervised-machine-learning/" },
      { name: "Unsupervised Learning", description: "Clustering and dimensionality reduction.", url: "https://www.geeksforgeeks.org/unsupervised-learning/" },
    ],
  },
];

/** Map quiz topic names to curriculum category ids */
export const topicToCategory = {
  "Data Structures": "dsa",
  OOPS: "oops",
  Python: "python",
  DBMS: "dbms",
  "Operating Systems": "os",
  "Machine Learning": "ml",
  Custom: "dsa",
};
