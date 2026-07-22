// Comprehensive Mock Dataset for Automated Answer Script Evaluation Platform

export const INITIAL_CLASSES = [
  { id: 'CS-101', name: 'CS-101: Data Structures & Algorithms', term: 'Fall 2026' },
  { id: 'PHY-201', name: 'PHY-201: Quantum Mechanics & Waves', term: 'Fall 2026' },
  { id: 'CHEM-301', name: 'CHEM-301: Advanced Organic Chemistry', term: 'Fall 2026' },
];

export const INITIAL_SECTIONS = ['Sec A', 'Sec B', 'Sec C'];.

export const INITIAL_QUESTIONS = [
  {
    id: 'Q1',
    number: 1,
    section: 'Sec A',
    title: "Dijkstra's Shortest Path Algorithm",
    prompt: "Explain Dijkstra's shortest path algorithm. Provide its pseudo-code and analyze its time complexity using min-priority queues.",
    maxMarks: 10,
    modelAnswer: "Dijkstra's algorithm finds the shortest path from a single source node to all other nodes in a weighted graph with non-negative edge weights. It maintains a set of visited nodes and tentative distances initialized to infinity (0 for source). At each step, it selects the unvisited node with the smallest tentative distance using a min-heap, relaxes all adjacent edge weights: dist[v] = min(dist[v], dist[u] + weight(u,v)). Time complexity with Min-Heap binary queue is O((V + E) log V).",
    textbookContext: "Introduction to Algorithms (CLRS 4th Ed.), Chapter 24.3, pp. 658-662: 'Dijkstra's algorithm solves the single-source shortest-paths problem on a weighted, directed graph G = (V, E) for the case in which all edge weights are nonnegative. Relaxation guarantees optimal distance bounds.'"
  },
  {
    id: 'Q2',
    number: 2,
    section: 'Sec A',
    title: 'Process vs. Thread & IPC Mechanisms',
    prompt: 'Differentiate between a Process and a Thread. Describe Inter-Process Communication (IPC) techniques including Shared Memory and Message Passing.',
    maxMarks: 10,
    modelAnswer: 'A process is an executing program instance with its own isolated memory address space (code, data, heap, stack). A thread is an execution unit within a process sharing memory, code, and descriptors but maintaining its own stack and registers. Threads have lower context switching overhead. IPC techniques include: 1) Shared Memory: multiple processes attach to a common memory segment, requiring mutex/semaphore synchronization; 2) Message Passing: kernel-assisted communication via message queues or sockets (send/receive primitives).',
    textbookContext: "Operating System Concepts (Silberschatz 10th Ed.), Chapter 3.4 & 4.1: 'Processes do not share address space without explicit OS calls. Threads share data and heap, reducing IPC latency significantly.'"
  },
  {
    id: 'Q3',
    number: 3,
    section: 'Sec B',
    title: 'B-Tree Structures in Database Indexing',
    prompt: 'Describe the structure and key properties of a B-Tree of order m. Explain why B-Trees are preferred over Binary Search Trees for disk storage.',
    maxMarks: 10,
    modelAnswer: 'A B-Tree of order m is a self-balancing search tree where: 1) Every node has at most m children; 2) Non-leaf nodes (except root) have at least ceil(m/2) children; 3) All leaves appear at the same depth; 4) A node with k children contains k-1 sorted keys. B-Trees are preferred over BSTs for disk storage because disk access (I/O) is slow. B-Trees have a high branching factor (m is large, e.g., 100-1000), reducing tree height to O(log_m N) and matching disk block page sizes.',
    textbookContext: "Database System Concepts (Korth 7th Ed.), Chapter 14.3: 'B-Trees minimize disk page reads by maximizing keys stored per node, ensuring search height remains under 3 or 4 levels even for millions of records.'"
  },
  {
    id: 'Q4',
    number: 4,
    section: 'Sec B',
    title: 'Virtual Memory & Page Fault Handler',
    prompt: 'Explain Virtual Memory, Paging, and trace the sequence of events that occurs when a Page Fault is triggered by the MMU.',
    maxMarks: 10,
    modelAnswer: 'Virtual Memory abstracts physical RAM, giving processes the illusion of contiguous memory larger than physical memory. Memory is split into fixed-size pages mapped to physical page frames via a Page Table. When CPU references an unmapped virtual address, MMU raises a Page Fault interrupt: 1) OS traps to kernel mode; 2) Saves CPU state; 3) Checks valid bit; 4) Allocates free frame or triggers page replacement (LRU/FIFO); 5) Fetches missing page from disk (swap space) via disk I/O; 6) Updates Page Table and TLB; 7) Restarts faulting instruction.',
    textbookContext: "Modern Operating Systems (Tanenbaum 4th Ed.), Chapter 3.3 Virtual Memory: 'Page fault handling involves context switches, disk controller interrupts, and TLB invalidation routines.'"
  },
  {
    id: 'Q5',
    number: 5,
    section: 'Sec C',
    title: 'ACID Properties in Relational Databases',
    prompt: 'Define the ACID properties of database transactions. Give concrete examples of how DBMS guarantees Atomicity and Consistency.',
    maxMarks: 10,
    modelAnswer: 'ACID stands for: 1) Atomicity: All operations in a transaction execute completely or none at all (All-or-Nothing), guaranteed by Write-Ahead Logging (WAL) and Rollback segment; 2) Consistency: Database transitions from one valid state to another satisfying all schema constraints; 3) Isolation: Concurrent transactions do not interfere, managed via 2PL (Two-Phase Locking) or MVCC; 4) Durability: Committed updates survive system crashes, ensured by WAL flushed to disk.',
    textbookContext: "Fundamentals of Database Systems (Elmasri 7th Ed.), Chapter 20.1: 'Atomicity relies on undo logs during crash recovery. Consistency is maintained by constraint enforcement and domain validation before commit.'"
  }
];

// Helper to SVG Data URI for realistic simulated student handwriting & diagram preview
const generateHandwritingSVG = (textLines, scoreColor = "#6366f1") => {
  const linesSvg = textLines.map((line, idx) =>
    `<text x="30" y="${60 + idx * 36}" font-family="Dancing Script, Caveat, cursive, sans-serif" font-size="20" fill="#1e293b" font-weight="600">${line}</text>`
  ).join('');

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
    <rect width="600" height="380" fill="#faf8f5" rx="8" />
    <!-- Notebook Lined Pattern -->
    <line x1="0" y1="40" x2="600" y2="40" stroke="#cbd5e1" stroke-width="1"/>
    <line x1="0" y1="76" x2="600" y2="76" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="0" y1="112" x2="600" y2="112" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="0" y1="148" x2="600" y2="148" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="0" y1="184" x2="600" y2="184" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="0" y1="220" x2="600" y2="220" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="0" y1="256" x2="600" y2="256" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="0" y1="292" x2="600" y2="292" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="0" y1="328" x2="600" y2="328" stroke="#e2e8f0" stroke-width="1"/>
    <!-- Red Margin Line -->
    <line x1="75" y1="0" x2="75" y2="380" stroke="#f87171" stroke-width="1.5" stroke-dasharray="4,2"/>
    <!-- Simulated Handcrafted Diagram -->
    <circle cx="480" cy="180" r="22" fill="none" stroke="#475569" stroke-width="2"/>
    <text x="475" y="185" font-family="sans-serif" font-size="14" fill="#1e293b">A</text>
    <circle cx="540" cy="130" r="22" fill="none" stroke="#475569" stroke-width="2"/>
    <text x="535" y="135" font-family="sans-serif" font-size="14" fill="#1e293b">B</text>
    <circle cx="540" cy="230" r="22" fill="none" stroke="#475569" stroke-width="2"/>
    <text x="535" y="235" font-family="sans-serif" font-size="14" fill="#1e293b">C</text>
    <line x1="500" y1="168" x2="520" y2="145" stroke="#475569" stroke-width="2"/>
    <line x1="500" y1="192" x2="520" y2="215" stroke="#475569" stroke-width="2"/>
    <text x="502" y="150" font-family="sans-serif" font-size="11" fill="#4f46e5">w=4</text>
    <text x="502" y="215" font-family="sans-serif" font-size="11" fill="#4f46e5">w=2</text>
    <!-- TrOCR Bounding Overlay simulated -->
    <rect x="25" y="45" width="420" height="290" fill="none" stroke="${scoreColor}" stroke-width="1.5" stroke-dasharray="6,3" opacity="0.6"/>
    <text x="375" y="325" font-family="sans-serif" font-size="10" fill="${scoreColor}" font-weight="bold">TrOCR Conf: 97.8%</text>
    <!-- Handwriting Text -->
    ${linesSvg}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
};

export const INITIAL_STUDENTS = [
  {
    id: 'STU-001',
    name: 'Alex Johnson',
    rollNumber: '2026-CS-014',
    classId: 'CS-101',
    section: 'Sec A',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    email: 'alex.johnson@university.edu',
    overallMarks: 45.5, // out of 50
    percentage: 91.0,
    grade: 'A+',
    status: 'APPROVED',
    evaluations: {
      Q1: {
        marks: 9.5,
        sbertScore: 0.94,
        status: 'APPROVED',
        scannedImageUrl: generateHandwritingSVG([
          "Dijkstra's algorithm computes shortest paths from single source.",
          "We initialize dist[source]=0 & dist[v]=inf for others.",
          "Using Min-Heap Priority Queue, we pick node with min distance.",
          "For each neighbor, dist[v] = min(dist[v], dist[u] + weight(u,v)).",
          "Time Complexity: O((V + E) log V) using Binary Heap."
        ], "#10b981"),
        trocrText: "Dijkstra's algorithm computes shortest paths from single source. We initialize dist[source]=0 & dist[v]=inf for others. Using Min-Heap Priority Queue, we pick node with min distance. For each neighbor, dist[v] = min(dist[v], dist[u] + weight(u,v)). Time Complexity: O((V + E) log V) using Binary Heap.",
        rubric: {
          accuracy: { score: 5, rationale: "Flawless explanation of relaxation step and algorithm initialization." },
          completeness: { score: 4.5, rationale: "Covers initialization, edge relaxation, and queue mechanism." },
          reasoning: { score: 5, rationale: "Correct greedy logic for edge relaxation." },
          relevance: { score: 5, rationale: "Directly addresses all prompt requirements." },
          clarity: { score: 4.5, rationale: "Structured cleanly with mathematical notation." }
        },
        strengths: ["Accurate time complexity analysis", "Correct edge relaxation formula"],
        weaknesses: ["Could briefly mention non-negative weight constraint"],
        aiRationale: "Student demonstrated comprehensive understanding of Dijkstra algorithm mechanics and priority queue complexities.",
        textbookRef: "CLRS 4th Ed. Chapter 24.3 (Single-Source Shortest Paths)",
        teacherOverrideNote: null
      },
      Q2: {
        marks: 9.0,
        sbertScore: 0.91,
        status: 'APPROVED',
        scannedImageUrl: generateHandwritingSVG([
          "Process is an independent program instance with separate address space.",
          "Thread is light execution unit sharing memory & heap within process.",
          "IPC Methods: Shared Memory (fastest, needs mutex lock)",
          "and Message Passing (OS kernel queues via send/receive).",
          "Threads have faster context switching overhead."
        ], "#10b981"),
        trocrText: "Process is an independent program instance with separate address space. Thread is light execution unit sharing memory & heap within process. IPC Methods: Shared Memory (fastest, needs mutex lock) and Message Passing (OS kernel queues via send/receive). Threads have faster context switching overhead.",
        rubric: {
          accuracy: { score: 4.5, rationale: "Precise distinction between process and thread memory model." },
          completeness: { score: 4.5, rationale: "Explains both Shared Memory and Message Passing IPC." },
          reasoning: { score: 4.5, rationale: "Logical explanation of context switching overhead." },
          relevance: { score: 5, rationale: "Focused answer." },
          clarity: { score: 4.5, rationale: "Clear breakdown." }
        },
        strengths: ["Clear IPC categorization", "Mentioned mutex sync requirements"],
        weaknesses: ["Minor detail on socket primitives left out"],
        aiRationale: "Excellent technical breakdown of OS memory boundaries and IPC primitives.",
        textbookRef: "Silberschatz OS Concepts 10th Ed. Chapter 3.4",
        teacherOverrideNote: null
      },
      Q3: {
        marks: 9.0,
        sbertScore: 0.89,
        status: 'APPROVED',
        scannedImageUrl: generateHandwritingSVG([
          "B-Tree of order m is self-balancing multi-way search tree.",
          "All leaf nodes reside at exact same height level.",
          "Keys are stored in sorted order within internal nodes.",
          "Preferred over BST for Disk Storage because disk I/O is slow.",
          "High branching factor reduces tree height to O(log_m N)."
        ], "#10b981"),
        trocrText: "B-Tree of order m is self-balancing multi-way search tree. All leaf nodes reside at exact same height level. Keys are stored in sorted order within internal nodes. Preferred over BST for Disk Storage because disk I/O is slow. High branching factor reduces tree height to O(log_m N).",
        rubric: {
          accuracy: { score: 4.5, rationale: "Accurate properties regarding node capacity and height." },
          completeness: { score: 4.5, rationale: "Explains disk block I/O alignment." },
          reasoning: { score: 4.5, rationale: "Understands log_m N branching advantages." },
          relevance: { score: 5, rationale: "Direct response." },
          clarity: { score: 4.5, rationale: "Well structured." }
        },
        strengths: ["Strong understanding of disk block page alignment", "Correct complexity formula"],
        weaknesses: ["Didn't specify exact minimum key count formula (ceil(m/2)-1)"],
        aiRationale: "High factual accuracy comparing disk access latency vs tree depth.",
        textbookRef: "Korth Database System Concepts Ch. 14.3",
        teacherOverrideNote: null
      },
      Q4: {
        marks: 9.0,
        sbertScore: 0.92,
        status: 'APPROVED',
        scannedImageUrl: generateHandwritingSVG([
          "Virtual Memory maps process virtual addresses to physical RAM frames.",
          "Page Fault Sequence: 1. CPU MMU detects invalid bit in Page Table.",
          "2. Trap interrupt to OS kernel; 3. Locate missing page in Swap disk.",
          "4. Read frame from disk to free RAM; 5. Update Page Table & TLB.",
          "6. Restart execution from faulting instruction."
        ], "#10b981"),
        trocrText: "Virtual Memory maps process virtual addresses to physical RAM frames. Page Fault Sequence: 1. CPU MMU detects invalid bit in Page Table. 2. Trap interrupt to OS kernel; 3. Locate missing page in Swap disk. 4. Read frame from disk to free RAM; 5. Update Page Table & TLB. 6. Restart execution from faulting instruction.",
        rubric: {
          accuracy: { score: 4.5, rationale: "Step by step trap handler lifecycle is spot on." },
          completeness: { score: 4.5, rationale: "All 6 fault handling phases mentioned." },
          reasoning: { score: 4.5, rationale: "Correct sequence of hardware interrupt to trap recovery." },
          relevance: { score: 5, rationale: "Fully relevant." },
          clarity: { score: 4.5, rationale: "Easy to follow step sequence." }
        },
        strengths: ["Comprehensive page fault interrupt lifecycle", "Correct TLB invalidation step"],
        weaknesses: ["Could briefly mention page replacement policy (LRU)"],
        aiRationale: "Clear step-by-step trace of hardware and OS page fault handler.",
        textbookRef: "Tanenbaum Modern OS Ch. 3.3",
        teacherOverrideNote: null
      },
      Q5: {
        marks: 9.0,
        sbertScore: 0.90,
        status: 'APPROVED',
        scannedImageUrl: generateHandwritingSVG([
          "ACID: Atomicity (All or Nothing), Consistency (Rules valid),",
          "Isolation (No concurrency interference), Durability (Persisted).",
          "Atomicity guaranteed using Write-Ahead Log (WAL) & Rollback.",
          "Consistency enforced via database integrity constraints."
        ], "#10b981"),
        trocrText: "ACID: Atomicity (All or Nothing), Consistency (Rules valid), Isolation (No concurrency interference), Durability (Persisted). Atomicity guaranteed using Write-Ahead Log (WAL) & Rollback. Consistency enforced via database integrity constraints.",
        rubric: {
          accuracy: { score: 4.5, rationale: "Accurate WAL logging and rollback mechanism description." },
          completeness: { score: 4.5, rationale: "Covers all 4 letters and details guarantees." },
          reasoning: { score: 4.5, rationale: "Logical mapping of logs to atomicity." },
          relevance: { score: 5, rationale: "Direct response." },
          clarity: { score: 4.5, rationale: "Succinct & concise." }
        },
        strengths: ["Correct WAL mechanism mentioned for Atomicity"],
        weaknesses: ["Could add code example of SQL transaction BEGIN/COMMIT"],
        aiRationale: "Solid conceptual grasp of relational transaction guarantees.",
        textbookRef: "Elmasri Database Systems Ch. 20.1",
        teacherOverrideNote: null
      }
    }
  },
  {
    id: 'STU-002',
    name: 'Sophia Chen',
    rollNumber: '2026-CS-028',
    classId: 'CS-101',
    section: 'Sec A',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
    email: 'sophia.chen@university.edu',
    overallMarks: 41.0,
    percentage: 82.0,
    grade: 'A',
    status: 'PENDING_REVIEW',
    evaluations: {
      Q1: {
        marks: 7.5,
        sbertScore: 0.82,
        status: 'PENDING_REVIEW',
        scannedImageUrl: generateHandwritingSVG([
          "Dijkstra algorithm is used for graph shortest paths.",
          "It uses a queue to pick the smallest vertex distance.",
          "Updates distances of adjacent nodes if dist[u]+w < dist[v].",
          "Time complexity is O(V^2) or O(E log V)."
        ], "#f59e0b"),
        trocrText: "Dijkstra algorithm is used for graph shortest paths. It uses a queue to pick the smallest vertex distance. Updates distances of adjacent nodes if dist[u]+w < dist[v]. Time complexity is O(V^2) or O(E log V).",
        rubric: {
          accuracy: { score: 4, rationale: "Mentions relaxation condition dist[u]+w < dist[v]." },
          completeness: { score: 3.5, rationale: "Does not detail min-heap priority queue operations explicitly." },
          reasoning: { score: 4, rationale: "Logic is sound." },
          relevance: { score: 4, rationale: "Answers question." },
          clarity: { score: 3.5, rationale: "A bit brief on priority queue time complexity O((V+E) log V)." }
        },
        strengths: ["Correct relaxation condition"],
        weaknesses: ["Imprecise time complexity notation: missed (V+E) factor"],
        aiRationale: "Good foundational answer but missed formal priority queue data structure detail.",
        textbookRef: "CLRS 4th Ed. Chapter 24.3",
        teacherOverrideNote: null
      },
      Q2: {
        marks: 8.5,
        sbertScore: 0.88,
        status: 'APPROVED',
        scannedImageUrl: generateHandwritingSVG([
          "Process has isolated address space (stack, heap, code).",
          "Thread shares process heap and data section but has own stack.",
          "IPC: 1. Shared memory (fast, needs locks). 2. Message queues."
        ], "#10b981"),
        trocrText: "Process has isolated address space (stack, heap, code). Thread shares process heap and data section but has own stack. IPC: 1. Shared memory (fast, needs locks). 2. Message queues.",
        rubric: {
          accuracy: { score: 4.5, rationale: "Correct memory partitioning explanation." },
          completeness: { score: 4, rationale: "Covers process/thread differences and 2 IPC methods." },
          reasoning: { score: 4, rationale: "Clear logic." },
          relevance: { score: 4.5, rationale: "Fully relevant." },
          clarity: { score: 4, rationale: "Clean bullet points." }
        },
        strengths: ["Clear memory segment distinction"],
        weaknesses: ["Could elaborate on context switching speeds"],
        aiRationale: "Accurate breakdown of process vs thread memory space.",
        textbookRef: "Silberschatz OS Concepts Ch. 3.4",
        teacherOverrideNote: null
      },
      Q3: {
        marks: 8.0,
        sbertScore: 0.84,
        status: 'APPROVED',
        scannedImageUrl: generateHandwritingSVG([
          "B-Trees are balanced search trees used in databases.",
          "Every node can have up to m children.",
          "Better than BST for disk access because disk read is slow",
          "and B-Tree nodes store multiple keys per page block."
        ], "#10b981"),
        trocrText: "B-Trees are balanced search trees used in databases. Every node can have up to m children. Better than BST for disk access because disk read is slow and B-Tree nodes store multiple keys per page block.",
        rubric: {
          accuracy: { score: 4, rationale: "Understands multi-way tree branching." },
          completeness: { score: 3.5, rationale: "Omitted minimum node occupancy rule ceil(m/2)." },
          reasoning: { score: 4, rationale: "Connects disk page blocks to node capacity." },
          relevance: { score: 4.5, rationale: "Relevant." },
          clarity: { score: 4, rationale: "Good explanation." }
        },
        strengths: ["Understands disk page block advantage"],
        weaknesses: ["Missed node key formula details"],
        aiRationale: "Correct qualitative reasoning for database B-Tree indexing.",
        textbookRef: "Korth Database System Concepts Ch. 14.3",
        teacherOverrideNote: null
      },
      Q4: {
        marks: 8.5,
        sbertScore: 0.87,
        status: 'APPROVED',
        scannedImageUrl: generateHandwritingSVG([
          "Virtual memory uses Page Tables to map virtual pages to RAM.",
          "Page Fault occurs when missing page is accessed.",
          "Steps: Trap to OS -> Fetch page from disk -> Update Page Table -> Resume."
        ], "#10b981"),
        trocrText: "Virtual memory uses Page Tables to map virtual pages to RAM. Page Fault occurs when missing page is accessed. Steps: Trap to OS -> Fetch page from disk -> Update Page Table -> Resume.",
        rubric: {
          accuracy: { score: 4.5, rationale: "Accurate page fault resolution flow." },
          completeness: { score: 4, rationale: "Includes page table update and instruction restart." },
          reasoning: { score: 4, rationale: "Logical step order." },
          relevance: { score: 4.5, rationale: "Relevant." },
          clarity: { score: 4, rationale: "Clear flowchart style response." }
        },
        strengths: ["Concise page fault lifecycle"],
        weaknesses: ["Missed mentioning TLB cache update"],
        aiRationale: "Good step-by-step description of OS fault recovery.",
        textbookRef: "Tanenbaum Modern OS Ch. 3.3",
        teacherOverrideNote: null
      },
      Q5: {
        marks: 8.5,
        sbertScore: 0.86,
        status: 'APPROVED',
        scannedImageUrl: generateHandwritingSVG([
          "ACID: Atomicity, Consistency, Isolation, Durability.",
          "Atomicity means all-or-nothing, guaranteed by Rollback logs.",
          "Consistency ensures constraints like foreign keys remain valid."
        ], "#10b981"),
        trocrText: "ACID: Atomicity, Consistency, Isolation, Durability. Atomicity means all-or-nothing, guaranteed by Rollback logs. Consistency ensures constraints like foreign keys remain valid.",
        rubric: {
          accuracy: { score: 4.5, rationale: "Accurate definition of all 4 ACID features." },
          completeness: { score: 4, rationale: "Sufficient detail on atomicity and consistency." },
          reasoning: { score: 4, rationale: "Good reasoning." },
          relevance: { score: 4.5, rationale: "Relevant." },
          clarity: { score: 4, rationale: "Clear." }
        },
        strengths: ["Correct rollback log mention"],
        weaknesses: ["Could mention MVCC or locks for Isolation"],
        aiRationale: "Well articulated ACID property breakdown.",
        textbookRef: "Elmasri Database Systems Ch. 20.1",
        teacherOverrideNote: null
      }
    }
  },
  {
    id: 'STU-003',
    name: 'Marcus Miller',
    rollNumber: '2026-CS-041',
    classId: 'CS-101',
    section: 'Sec B',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    email: 'marcus.m@university.edu',
    overallMarks: 32.5,
    percentage: 65.0,
    grade: 'C+',
    status: 'OVERRIDDEN',
    evaluations: {
      Q1: {
        marks: 7.0, // Overridden from 5.5 by Prof. Vance
        sbertScore: 0.68,
        status: 'OVERRIDDEN',
        scannedImageUrl: generateHandwritingSVG([
          "Dijkstra is used for graph routing.",
          "Finds shortest distance from start node.",
          "Uses greedy choice to pick smallest edge.",
          "Complexity is O(V^2)."
        ], "#ef4444"),
        trocrText: "Dijkstra is used for graph routing. Finds shortest distance from start node. Uses greedy choice to pick smallest edge. Complexity is O(V^2).",
        rubric: {
          accuracy: { score: 3.5, rationale: "Correct greedy choice concept but vague on queue implementation." },
          completeness: { score: 2.5, rationale: "Omitted explicit pseudocode or edge relaxation formula." },
          reasoning: { score: 3, rationale: "Basic understanding." },
          relevance: { score: 3.5, rationale: "Addresses graph topic." },
          clarity: { score: 3, rationale: "Too brief." }
        },
        strengths: ["Identified greedy property"],
        weaknesses: ["No relaxation formula", "Missing priority queue detail"],
        aiRationale: "Minimal response. AI initially assigned 5.5/10 due to missing relaxation formulas.",
        textbookRef: "CLRS 4th Ed. Chapter 24.3",
        teacherOverrideNote: "Overridden +1.5 marks by Dr. Vance: Student clearly outlined greedy vertex selection in diagram attached on page margin."
      },
      Q2: {
        marks: 6.5,
        sbertScore: 0.72,
        status: 'APPROVED',
        scannedImageUrl: generateHandwritingSVG([
          "Process is big and has memory.",
          "Thread is small and runs inside process.",
          "IPC means inter process communication like sockets and shared RAM."
        ], "#f59e0b"),
        trocrText: "Process is big and has memory. Thread is small and runs inside process. IPC means inter process communication like sockets and shared RAM.",
        rubric: {
          accuracy: { score: 3.5, rationale: "Informal wording but technically acceptable." },
          completeness: { score: 3, rationale: "Superficial differentiation." },
          reasoning: { score: 3, rationale: "Basic logic." },
          relevance: { score: 3.5, rationale: "Relevant." },
          clarity: { score: 3, rationale: "Colloquial terminology used." }
        },
        strengths: ["Named sockets and shared memory"],
        weaknesses: ["Lacks formal OS memory model terms (heap, stack)"],
        aiRationale: "Basic answer lacking formal computer science terminology.",
        textbookRef: "Silberschatz OS Concepts Ch. 3.4",
        teacherOverrideNote: null
      },
      Q3: {
        marks: 6.0,
        sbertScore: 0.65,
        status: 'APPROVED',
        scannedImageUrl: generateHandwritingSVG([
          "B-Tree is tree with many child nodes.",
          "Used in database indexing.",
          "Better than BST because BST can become unbalanced and tall."
        ], "#ef4444"),
        trocrText: "B-Tree is tree with many child nodes. Used in database indexing. Better than BST because BST can become unbalanced and tall.",
        rubric: {
          accuracy: { score: 3, rationale: "Partially correct but missed order m properties." },
          completeness: { score: 2.5, rationale: "No disk I/O block page discussion." },
          reasoning: { score: 3, rationale: "Recognizes BST height issue." },
          relevance: { score: 3.5, rationale: "Relevant." },
          clarity: { score: 3, rationale: "Incomplete." }
        },
        strengths: ["Identified BST unbalancing issue"],
        weaknesses: ["Missing disk block paging connection"],
        aiRationale: "Underdeveloped answer regarding B-Tree order m mechanics.",
        textbookRef: "Korth Database Concepts Ch. 14.3",
        teacherOverrideNote: null
      },
      Q4: {
        marks: 6.5,
        sbertScore: 0.70,
        status: 'APPROVED',
        scannedImageUrl: generateHandwritingSVG([
          "Virtual memory makes RAM look bigger.",
          "Page fault happens when page is not in RAM.",
          "OS goes to hard drive, loads page, fixes table."
        ], "#f59e0b"),
        trocrText: "Virtual memory makes RAM look bigger. Page fault happens when page is not in RAM. OS goes to hard drive, loads page, fixes table.",
        rubric: {
          accuracy: { score: 3.5, rationale: "High level summary is accurate." },
          completeness: { score: 3, rationale: "Missing interrupt, MMU, and instruction restart details." },
          reasoning: { score: 3, rationale: "Sound high level intuition." },
          relevance: { score: 3.5, rationale: "Relevant." },
          clarity: { score: 3, rationale: "Overly simplified." }
        },
        strengths: ["Correct basic page swap concept"],
        weaknesses: ["Missing MMU hardware trap details"],
        aiRationale: "Conceptual summary without technical OS primitives.",
        textbookRef: "Tanenbaum Modern OS Ch. 3.3",
        teacherOverrideNote: null
      },
      Q5: {
        marks: 6.5,
        sbertScore: 0.69,
        status: 'APPROVED',
        scannedImageUrl: generateHandwritingSVG([
          "ACID: Atomicity, Consistency, Isolation, Durability.",
          "Atomicity means query finishes or cancels.",
          "Durability means data saved to disk."
        ], "#f59e0b"),
        trocrText: "ACID: Atomicity, Consistency, Isolation, Durability. Atomicity means query finishes or cancels. Durability means data saved to disk.",
        rubric: {
          accuracy: { score: 3.5, rationale: "Correct acronym and definitions." },
          completeness: { score: 3, rationale: "Did not explain WAL or locking protocols." },
          reasoning: { score: 3, rationale: "Reasonable definition." },
          relevance: { score: 3.5, rationale: "Relevant." },
          clarity: { score: 3.5, rationale: "Short." }
        },
        strengths: ["Accurate ACID expansion"],
        weaknesses: ["No mechanism details (WAL/2PL)"],
        aiRationale: "Basic memorized definitions without underlying database engine mechanisms.",
        textbookRef: "Elmasri Database Systems Ch. 20.1",
        teacherOverrideNote: null
      }
    }
  },
  {
    id: 'STU-004',
    name: 'Priya Sharma',
    rollNumber: '2026-CS-055',
    classId: 'CS-101',
    section: 'Sec B',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    email: 'priya.s@university.edu',
    overallMarks: 47.0,
    percentage: 94.0,
    grade: 'A+',
    status: 'APPROVED',
    evaluations: {
      Q1: {
        marks: 9.5,
        sbertScore: 0.96,
        status: 'APPROVED',
        scannedImageUrl: generateHandwritingSVG([
          "Dijkstra Single-Source Shortest Path Algorithm:",
          "1. dist[s]=0, dist[v]=inf for all v != s",
          "2. Insert all vertices into Min-Heap PQ",
          "3. Extract min vertex u, for each neighbor v:",
          "   if dist[u] + w(u,v) < dist[v]: update dist[v] = dist[u] + w(u,v)",
          "Complexity: O((V + E) log V) with Binary Min Heap."
        ], "#10b981"),
        trocrText: "Dijkstra Single-Source Shortest Path Algorithm: 1. dist[s]=0, dist[v]=inf for all v != s 2. Insert all vertices into Min-Heap PQ 3. Extract min vertex u, for each neighbor v: if dist[u] + w(u,v) < dist[v]: update dist[v] = dist[u] + w(u,v) Complexity: O((V + E) log V) with Binary Min Heap.",
        rubric: {
          accuracy: { score: 5, rationale: "Exemplary precision in pseudocode and complexity derivation." },
          completeness: { score: 5, rationale: "Covers algorithm, priority queue, complexity, and relaxation." },
          reasoning: { score: 5, rationale: "Faultless greedy logic explanation." },
          relevance: { score: 5, rationale: "100% relevant." },
          clarity: { score: 4.5, rationale: "Very crisp." }
        },
        strengths: ["Flawless step by step pseudocode", "Exact binary heap complexity"],
        weaknesses: [],
        aiRationale: "Top-tier student answer matching model answer perfectly.",
        textbookRef: "CLRS 4th Ed. Chapter 24.3",
        teacherOverrideNote: null
      },
      Q2: { marks: 9.5, sbertScore: 0.95, status: 'APPROVED', trocrText: 'Process address space vs thread shared memory. IPC via Shared Memory and Kernel Message Queues.', rubric: { accuracy: { score: 5, rationale: "Spot on." }, completeness: { score: 4.5, rationale: "Very thorough." }, reasoning: { score: 5, rationale: "Great." }, relevance: { score: 5, rationale: "Relevant." }, clarity: { score: 4.5, rationale: "Clean." } }, strengths: ['Great OS primitives understanding'], weaknesses: [], aiRationale: 'Comprehensive answer.', textbookRef: 'Silberschatz Ch 3.4', teacherOverrideNote: null },
      Q3: { marks: 9.0, sbertScore: 0.93, status: 'APPROVED', trocrText: 'B-Tree of order m properties: ceiling(m/2) children, sorted key arrays, matching disk page blocks.', rubric: { accuracy: { score: 4.5, rationale: "Accurate." }, completeness: { score: 4.5, rationale: "Thorough." }, reasoning: { score: 4.5, rationale: "Sound." }, relevance: { score: 5, rationale: "Relevant." }, clarity: { score: 4.5, rationale: "Clear." } }, strengths: ['Explicit order m occupancy bounds'], weaknesses: [], aiRationale: 'Very strong database indexing knowledge.', textbookRef: 'Korth Ch 14.3', teacherOverrideNote: null },
      Q4: { marks: 9.5, sbertScore: 0.94, status: 'APPROVED', trocrText: 'Virtual memory paging mechanics, MMU page fault interrupt handler, swap partition I/O, TLB update.', rubric: { accuracy: { score: 5, rationale: "Exact MMU interrupt details." }, completeness: { score: 4.5, rationale: "Covers swap disk fetch." }, reasoning: { score: 5, rationale: "Strong." }, relevance: { score: 5, rationale: "Relevant." }, clarity: { score: 4.5, rationale: "Clean." } }, strengths: ['MMU trap details accurate'], weaknesses: [], aiRationale: 'Perfect OS memory management answer.', textbookRef: 'Tanenbaum Ch 3.3', teacherOverrideNote: null },
      Q5: { marks: 9.5, sbertScore: 0.95, status: 'APPROVED', trocrText: 'ACID transaction guarantees: Atomicity via Write-Ahead Log (WAL) undo logs, Consistency via schema constraints.', rubric: { accuracy: { score: 5, rationale: "Spot on." }, completeness: { score: 4.5, rationale: "Very complete." }, reasoning: { score: 5, rationale: "Great logic." }, relevance: { score: 5, rationale: "Relevant." }, clarity: { score: 4.5, rationale: "Clear." } }, strengths: ['Explicit WAL logging reference'], weaknesses: [], aiRationale: 'Flawless answer.', textbookRef: 'Elmasri Ch 20.1', teacherOverrideNote: null }
    }
  },
  {
    id: 'STU-005',
    name: 'David Kim',
    rollNumber: '2026-CS-062',
    classId: 'CS-101',
    section: 'Sec C',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    email: 'david.kim@university.edu',
    overallMarks: 38.5,
    percentage: 77.0,
    grade: 'B+',
    status: 'APPROVED',
    evaluations: {
      Q1: { marks: 8.0, sbertScore: 0.81, status: 'APPROVED', trocrText: 'Dijkstra shortest path algorithm works on weighted graphs. Updates vertex distances in min priority queue.', rubric: { accuracy: { score: 4, rationale: "Good logic." }, completeness: { score: 4, rationale: "Covers queue and relaxation." }, reasoning: { score: 4, rationale: "Sound." }, relevance: { score: 4, rationale: "Relevant." }, clarity: { score: 4, rationale: "Good." } }, strengths: ['Correct vertex distance update'], weaknesses: ['Minor notation omissions'], aiRationale: 'Well rounded response.', textbookRef: 'CLRS Ch 24.3', teacherOverrideNote: null },
      Q2: { marks: 7.5, sbertScore: 0.79, status: 'APPROVED', trocrText: 'Process vs thread memory sharing. Message passing via sockets and shared memory blocks.', rubric: { accuracy: { score: 4, rationale: "Accurate." }, completeness: { score: 3.5, rationale: "Missing stack details." }, reasoning: { score: 4, rationale: "Sound." }, relevance: { score: 4, rationale: "Relevant." }, clarity: { score: 4, rationale: "Clear." } }, strengths: ['Mentioned socket communication'], weaknesses: ['Omitted context switch details'], aiRationale: 'Solid answer.', textbookRef: 'Silberschatz Ch 3.4', teacherOverrideNote: null },
      Q3: { marks: 7.5, sbertScore: 0.78, status: 'APPROVED', trocrText: 'B-Trees store multiple keys per node matching disk page size to minimize disk reads.', rubric: { accuracy: { score: 4, rationale: "Good disk page rationale." }, completeness: { score: 3.5, rationale: "Brief." }, reasoning: { score: 4, rationale: "Logical." }, relevance: { score: 4, rationale: "Relevant." }, clarity: { score: 4, rationale: "Good." } }, strengths: ['Correct disk read optimization reasoning'], weaknesses: ['Lacks node occupancy formulas'], aiRationale: 'Good practical intuition.', textbookRef: 'Korth Ch 14.3', teacherOverrideNote: null },
      Q4: { marks: 7.5, sbertScore: 0.80, status: 'APPROVED', trocrText: 'Virtual memory paging divides RAM into frames. Page fault fetches missing page from swap space.', rubric: { accuracy: { score: 4, rationale: "Accurate swap fetching." }, completeness: { score: 3.5, rationale: "Missed TLB reload." }, reasoning: { score: 4, rationale: "Logical." }, relevance: { score: 4, rationale: "Relevant." }, clarity: { score: 4, rationale: "Good." } }, strengths: ['Clear swap space explanation'], weaknesses: ['TLB handling omitted'], aiRationale: 'Good OS concept overview.', textbookRef: 'Tanenbaum Ch 3.3', teacherOverrideNote: null },
      Q5: { marks: 8.0, sbertScore: 0.83, status: 'APPROVED', trocrText: 'ACID guarantees: Atomicity via transaction logs, Consistency via schema constraints, Isolation via locks.', rubric: { accuracy: { score: 4, rationale: "Accurate." }, completeness: { score: 4, rationale: "Good coverage." }, reasoning: { score: 4, rationale: "Sound." }, relevance: { score: 4, rationale: "Relevant." }, clarity: { score: 4, rationale: "Clear." } }, strengths: ['Named lock mechanism for Isolation'], weaknesses: [], aiRationale: 'Solid database transaction overview.', textbookRef: 'Elmasri Ch 20.1', teacherOverrideNote: null }
    }
  }
];

export const INITIAL_ANALYTICS = {
  questionStats: [
    { questionId: 'Q1', title: 'Q1: Dijkstra Algo', maxMarks: 10, avgMarks: 8.7, sbertAvg: 0.89, passRate: 92 },
    { questionId: 'Q2', title: 'Q2: Process vs Thread', maxMarks: 10, avgMarks: 8.2, sbertAvg: 0.86, passRate: 88 },
    { questionId: 'Q3', title: 'Q3: B-Tree Indexing', maxMarks: 10, avgMarks: 7.9, sbertAvg: 0.83, passRate: 84 },
    { questionId: 'Q4', title: 'Q4: Virtual Memory', maxMarks: 10, avgMarks: 8.2, sbertAvg: 0.87, passRate: 89 },
    { questionId: 'Q5', title: 'Q5: ACID Properties', maxMarks: 10, avgMarks: 8.3, sbertAvg: 0.87, passRate: 90 },
  ],
  sectionPerformance: [
    { section: 'Sec A (Q1, Q2)', avgPercentage: 84.5, totalStudents: 22, flagCount: 1 },
    { section: 'Sec B (Q3, Q4)', avgPercentage: 80.5, totalStudents: 18, flagCount: 2 },
    { section: 'Sec C (Q5)', avgPercentage: 83.0, totalStudents: 14, flagCount: 0 },
  ],
  gradeDistribution: [
    { range: '90-100% (A+)', count: 2, color: '#10b981' },
    { range: '80-89% (A)', count: 1, color: '#6366f1' },
    { range: '70-79% (B+)', count: 1, color: '#3b82f6' },
    { range: '60-69% (C+)', count: 1, color: '#f59e0b' },
    { range: '< 60% (F)', count: 0, color: '#ef4444' },
  ]
};
