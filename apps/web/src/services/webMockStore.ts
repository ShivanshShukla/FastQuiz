/**
 * FastQuiz Web Mock Store
 * Powers the interactive learner experience matching the Stitch Design templates.
 */

export interface QuestionOption {
  id: string;
  label: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
}

export interface QuestionData {
  id: string;
  order: number;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tag: string;
  stem: string;
  highlightPhrase?: string;
  contextSnippet?: string;
  options: QuestionOption[];
  correctOptionIndex: number;
  correctLabel: string;
  optimalBadge?: string;
  explanation: string;
  codeSnippet?: string;
  diagramTitle?: string;
  diagramSubtitle?: string;
}

export interface QuizData {
  id: string;
  topicId: string;
  title: string;
  subtitle: string;
  description: string;
  durationMinutes: number;
  questionsCount: number;
  passMarkPercent: number;
  price: number; // in INR
  status: 'free_available' | 'locked' | 'purchased' | 'completed';
  lastScore?: number;
  lastAttemptDaysAgo?: number;
  questions: QuestionData[];
}

export interface TopicData {
  id: string;
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  description: string;
  totalQuizzes: number;
  freeGrantAvailable: boolean;
  faangRelevancePercent: number;
  engineersTestedCount: string;
  quizzes: QuizData[];
}

export interface AttemptSubmission {
  attemptId: string;
  quizId: string;
  answers: Record<number, number>; // { questionIndex: selectedOptionIndex }
  flaggedQuestions: number[]; // questionIndices
  timeSpentSeconds: number;
}

export interface DiagnosticResult {
  attemptId: string;
  quizTitle: string;
  topicTitle: string;
  scorePercent: number;
  correctCount: number;
  totalCount: number;
  benchmarkPassed: boolean;
  candidateTier: string;
  latencyFormatted: string;
  targetLatencyFormatted: string;
  percentile: string;
  levelBand: string;
  streakDays: number;
  xpEarned: number;
  subSkills: Array<{
    name: string;
    description: string;
    scorePercent: number;
    questionCountText: string;
    status: 'Mastered' | 'Needs Review';
  }>;
  questionsReview: Array<{
    questionNumber: number;
    categoryTag: string;
    stem: string;
    userAnswerText: string;
    correctAnswerText: string;
    isCorrect: boolean;
    durationSeconds: number;
    explanation: string;
    codeSnippet?: string;
    diagramTitle?: string;
    diagramSubtitle?: string;
  }>;
}

const CACHING_QUESTIONS: QuestionData[] = [
  {
    id: 'q-cach-1',
    order: 1,
    category: 'High Concurrency',
    difficulty: 'Medium',
    tag: 'High-Frequency Interview Concept',
    stem: 'In a distributed cache-aside architecture under heavy concurrent read traffic, what is the most effective pattern to prevent a "Cache Stampede" (Thundering Herd problem) when an expensive key expires?',
    highlightPhrase: '"Cache Stampede"',
    contextSnippet: 'System context: Redis 7 cluster caching synthesized customer profiles from a 6-node PostgreSQL replica pool with 85,000 requests/sec.',
    options: [
      { id: 'opt-a', label: 'A', text: 'Purge all downstream replica caches and immediately reject incoming HTTP requests with HTTP 429 Too Many Requests until the key is recomputed.' },
      { id: 'opt-b', label: 'B', text: 'Use probabilistic early expiration (such as the XFetch algorithm) or a distributed mutex so only one worker recalculates the cache while others wait or serve stale data.' },
      { id: 'opt-c', label: 'C', text: 'Increase the Redis TTL indefinitely and rely purely on LRU (Least Recently Used) memory eviction when total memory utilization reaches 95%.' },
      { id: 'opt-d', label: 'D', text: 'Execute synchronous write-through operations on every read cache miss directly against the primary SQL replica to refresh stale read pools.' },
    ],
    correctOptionIndex: 1,
    correctLabel: 'B',
    optimalBadge: 'Optimal Staff Architecture',
    explanation: 'The XFetch algorithm approximates optimal early recomputation: delta * beta * ln(rand()). By probabilistically triggering background cache regenerations before hard TTL expiry, lock contention drops by 94% across distributed Redis clusters.',
    codeSnippet: 'func ShouldRefresh(key string, ttl time.Duration, computeTime float64) bool {\n    // Optimal XFetch early refresh heuristic\n    return -(computeTime * beta * math.Log(rand.Float64())) > ttl.Seconds()\n}',
    diagramTitle: 'Staff Solution & Go Impl',
    diagramSubtitle: 'Probabilistic early recomputation via optimal XFetch delta heuristic',
  },
  {
    id: 'q-cach-2',
    order: 2,
    category: 'Cluster Partitioning',
    difficulty: 'Hard',
    tag: 'High-Frequency Interview Concept',
    stem: 'How does Redis Sentinel resolve split-brain scenarios when a partition heals?',
    highlightPhrase: 'split-brain scenarios',
    contextSnippet: 'System context: 3 Sentinels, 1 Master, 2 Replicas deployed across multi-AZ AWS VPCs with occasional net-split blips.',
    options: [
      { id: 'opt-a', label: 'A', text: 'Immediately merges state by performing a two-way differential merge of in-memory keyspaces.' },
      { id: 'opt-b', label: 'B', text: 'Demotes unacknowledged master and flushes unsynced lag buffer via quorum consensus, ensuring only the elected leader accepts writes.' },
      { id: 'opt-c', label: 'C', text: 'Halts all read queries and forces a cold reboot of the minority partition nodes.' },
      { id: 'opt-d', label: 'D', text: 'Executes automated DNS failback while preserving both partitions as active-active write targets.' },
    ],
    correctOptionIndex: 1,
    correctLabel: 'B',
    optimalBadge: 'Optimal Consensus Strategy',
    explanation: 'Epoch monotonic advancement diagram: Sentinel leader election quorum checks min-replicas-to-write and min-replicas-max-lag before accepting slave re-point commands.',
    diagramTitle: 'Redis Sentinel Split-Brain Sequence',
    diagramSubtitle: 'Epoch monotonic advancement & raft quorum consensus graph',
  },
  {
    id: 'q-cach-3',
    order: 3,
    category: 'Data Consistency',
    difficulty: 'Hard',
    tag: 'Critical Architecture Dilemma',
    stem: 'Which caching write pattern ensures strong consistency for high-frequency banking ledgers without async lag?',
    highlightPhrase: 'strong consistency for high-frequency banking ledgers',
    contextSnippet: 'System context: Ledger system processing $40M/hr in settlement transactions where ghost writes or double-debit anomalies cause immediate regulatory breach.',
    options: [
      { id: 'opt-a', label: 'A', text: 'Write-Back (Write-Behind) Caching with asynchronous background queue flush to PostgreSQL.' },
      { id: 'opt-b', label: 'B', text: 'Write-Through with 2PC Synchronous Commit across primary database and cache.' },
      { id: 'opt-c', label: 'C', text: 'Cache-Aside with eventual consistency TTL expiration set to 15 seconds.' },
      { id: 'opt-d', label: 'D', text: 'Refresh-Ahead background batch predictive updater.' },
    ],
    correctOptionIndex: 1,
    correctLabel: 'B',
    optimalBadge: 'Optimal Staff Architecture',
    explanation: 'Guarantees strict linearizability between persistence layer and read replicas during node failover. Write-back causes silent ledger desync if host terminates prior to async WAL flush.',
    diagramTitle: 'Why Write-Back Causes Silent Ledger Desync',
    diagramSubtitle: 'Idempotent lock strategy & ghost charge double-spend prevention',
  },
  {
    id: 'q-cach-4',
    order: 4,
    category: 'Memory Management',
    difficulty: 'Medium',
    tag: 'Interview Frequency: High',
    stem: 'When using Memcached in a multi-core environment, how does slab allocator slab-reassignment eliminate fragmentation?',
    highlightPhrase: 'slab allocator slab-reassignment',
    contextSnippet: 'Context: Heavy memory churn with variable payload sizes from 100 bytes to 512KB.',
    options: [
      { id: 'opt-a', label: 'A', text: 'Dynamically reallocates unused 1MB slab pages from cold classes to hot classes experiencing evictions.' },
      { id: 'opt-b', label: 'B', text: 'Compresses all string payloads with zstd before storing in standard OS heap memory.' },
      { id: 'opt-c', label: 'C', text: 'Delegates memory fragmentation defragmentation to Linux kernel jemalloc background threads.' },
      { id: 'opt-d', label: 'D', text: 'Restarts worker threads sequentially using zero-downtime rolling reload.' },
    ],
    correctOptionIndex: 0,
    correctLabel: 'A',
    explanation: 'Slab automove and slab reassign transfer full 1MB memory pages from classes that no longer receive traffic to classes with high eviction pressure.',
  },
  {
    id: 'q-cach-5',
    order: 5,
    category: 'Topology & Partitioning',
    difficulty: 'Medium',
    tag: 'Standard Distributed Systems Pattern',
    stem: 'Why do production consistent hashing rings (like Dynamo or Cassandra) assign 100–256 virtual nodes (vnodes) per physical machine?',
    highlightPhrase: '100–256 virtual nodes (vnodes)',
    contextSnippet: 'Context: Hash ring with 10 physical machines of unequal hardware CPU/RAM capacities.',
    options: [
      { id: 'opt-a', label: 'A', text: 'To ensure uniform key distribution across the ring and prevent hot-spot load skew when nodes join or leave.' },
      { id: 'opt-b', label: 'B', text: 'To encrypt hash token slots using 256-bit TLS key pairs.' },
      { id: 'opt-c', label: 'C', text: 'To enable synchronous multi-master masterless consensus replication.' },
      { id: 'opt-d', label: 'D', text: 'To bypass operating system TCP file descriptor socket limits.' },
    ],
    correctOptionIndex: 0,
    correctLabel: 'A',
    explanation: 'Vnodes ensure variance in key counts between nodes approaches zero (standard deviation < 5%), and when a physical node fails, its workload distributes evenly across all remaining machines rather than overwhelming a single successor.',
  },
  {
    id: 'q-cach-6',
    order: 6,
    category: 'Security & Penetration',
    difficulty: 'Medium',
    tag: 'Defense in Depth',
    stem: 'How does placing a Bloom filter in front of a cache prevent Cache Penetration attacks targeting non-existent database keys?',
    highlightPhrase: 'Cache Penetration attacks',
    contextSnippet: 'Attacker generating random UUID queries at 50,000 req/sec that will never exist in the database.',
    options: [
      { id: 'opt-a', label: 'A', text: 'Quickly rejects queries with guaranteed zero false negatives before hitting the cache or backing DB.' },
      { id: 'opt-b', label: 'B', text: 'Encrypts the SQL queries using SHA-256 HMAC.' },
      { id: 'opt-c', label: 'C', text: 'Automatically provisions autoscaled read replicas on AWS Aurora.' },
      { id: 'opt-d', label: 'D', text: 'Returns synthetic HTTP 200 responses with mock payload.' },
    ],
    correctOptionIndex: 0,
    correctLabel: 'A',
    explanation: 'A Bloom filter provides definitive negative answers: if the filter says the key does not exist, it certainly does not exist, sparing the database completely.',
  },
  {
    id: 'q-cach-7',
    order: 7,
    category: 'Probabilistic Data Structures',
    difficulty: 'Medium',
    tag: 'Redis Advanced Primitives',
    stem: 'Redis HyperLogLog (PFADD/PFCOUNT) estimates unique visitor cardinality with standard error < 1% using strictly how much memory?',
    highlightPhrase: 'estimates unique visitor cardinality',
    contextSnippet: 'Tracking 500,000,000 unique daily active user IDs on high-traffic analytics dashboard.',
    options: [
      { id: 'opt-a', label: 'A', text: 'Strictly 12 KB constant memory regardless of cardinality count.' },
      { id: 'opt-b', label: 'B', text: '8 MB per 10 million distinct records.' },
      { id: 'opt-c', label: 'C', text: 'O(N) memory proportional to the length of user UUID strings.' },
      { id: 'opt-d', label: 'D', text: '1 GB virtual memory page mapped to NVMe storage.' },
    ],
    correctOptionIndex: 0,
    correctLabel: 'A',
    explanation: 'HyperLogLog requires a maximum of 12 kilobytes of memory to count up to 2^64 unique items with a standard error of 0.81%.',
  },
  {
    id: 'q-cach-8',
    order: 8,
    category: 'Multi-Tier Caching',
    difficulty: 'Hard',
    tag: 'Production Architecture',
    stem: 'In a Two-Tier caching architecture (L1 In-Process Memory + L2 Distributed Redis), what is the optimal invalidation bus mechanism?',
    highlightPhrase: 'L1 In-Process Memory + L2 Distributed Redis',
    contextSnippet: '100 containerized Go microservice instances with local sync.Map cache backed by Redis cluster.',
    options: [
      { id: 'opt-a', label: 'A', text: 'Redis Pub/Sub or Redis Client-Side Caching (Tracking mode with RESP3 invalidation messages).' },
      { id: 'opt-b', label: 'B', text: 'Polling Redis every 100ms from every application pod.' },
      { id: 'opt-c', label: 'C', text: 'Triggering Kubernetes rolling restarts whenever a key is written.' },
      { id: 'opt-d', label: 'D', text: 'Disabling L1 cache completely to guarantee consistency.' },
    ],
    correctOptionIndex: 0,
    correctLabel: 'A',
    explanation: 'Redis 6+ Client-Side Caching pushes invalidation messages over a dedicated connection, purging L1 memory immediately when another client modifies the key.',
  },
  {
    id: 'q-cach-9',
    order: 9,
    category: 'Race Conditions',
    difficulty: 'Hard',
    tag: 'Staff Level Evaluation',
    stem: 'In Cache-Aside, how do you mitigate the race condition where a read query reads stale DB data and writes it to cache AFTER a concurrent write transaction has committed and evicted the cache?',
    highlightPhrase: 'stale DB data and writes it to cache AFTER a concurrent write',
    contextSnippet: 'Thread 1: DB Read -> Cache Miss -> Context Switch. Thread 2: DB Write -> DB Commit -> Cache Evict. Thread 1: Writes stale read to Cache.',
    options: [
      { id: 'opt-a', label: 'A', text: 'Use short cache TTLs combined with delayed asynchronous double-deletion (evict, wait 500ms, evict again).' },
      { id: 'opt-b', label: 'B', text: 'Never evict keys; only update them synchronously in place.' },
      { id: 'opt-c', label: 'C', text: 'Lock the entire database during all read transactions.' },
      { id: 'opt-d', label: 'D', text: 'Switch database from PostgreSQL to MongoDB.' },
    ],
    correctOptionIndex: 0,
    correctLabel: 'A',
    explanation: 'Delayed double-deletion (or versioned lease tokens like Memcached check-and-set) guarantees that even if a thread wakes up late and writes a stale value, the second eviction will wipe it out.',
  },
  {
    id: 'q-cach-10',
    order: 10,
    category: 'Edge & CDN',
    difficulty: 'Medium',
    tag: 'Web Performance Standards',
    stem: 'What HTTP Cache-Control directive instructs modern CDNs and browsers to immediately serve a stale cached response while asynchronously fetching the updated version in the background?',
    highlightPhrase: 'serve a stale cached response while asynchronously fetching',
    contextSnippet: 'Optimizing LCP and edge latency on high-traffic news and dashboard views.',
    options: [
      { id: 'opt-a', label: 'A', text: 'stale-while-revalidate=<seconds> (RFC 5861)' },
      { id: 'opt-b', label: 'B', text: 'must-revalidate, proxy-revalidate' },
      { id: 'opt-c', label: 'C', text: 'no-cache, private' },
      { id: 'opt-d', label: 'D', text: 's-maxage=0' },
    ],
    correctOptionIndex: 0,
    correctLabel: 'A',
    explanation: 'stale-while-revalidate tells clients to return the stale asset instantly for zero user-perceived latency, while triggering a background validation with origin.',
  },
];

const MOCK_TOPICS: TopicData[] = [
  {
    id: 'topic-caching',
    slug: 'distributed-caching',
    title: 'Distributed Caching: Redis, Memcached & Cache Invalidation',
    category: 'System Design',
    difficulty: 'Medium - Hard',
    description: 'Master cache topologies, cache-aside vs write-through patterns, stampede mitigation, and TTL eviction policies asked at FAANG and tier-1 tech interviews.',
    totalQuizzes: 8,
    freeGrantAvailable: true,
    faangRelevancePercent: 85,
    engineersTestedCount: '2.4k',
    quizzes: [
      {
        id: 'quiz-cache-1',
        topicId: 'topic-caching',
        title: 'Quiz 1: Cache Strategies & Invalidation Dilemmas',
        subtitle: 'Entrypoint Diagnostic',
        description: 'Evaluate your instincts on Cache-Aside vs Write-Through topologies, the two-phase commit hazard, and eventual consistency bounds across replica nodes.',
        durationMinutes: 15,
        questionsCount: 10,
        passMarkPercent: 80,
        price: 0, // Free attempt available
        status: 'free_available',
        questions: CACHING_QUESTIONS,
      },
      {
        id: 'quiz-cache-2',
        topicId: 'topic-caching',
        title: 'Quiz 2: Cache Stampede, Thundering Herd & Mutex Locking',
        subtitle: 'Advanced Concurrency',
        description: 'Probabilistic early expiration (XFetch algorithm), distributed locks via Redlock, and cold-start warming patterns.',
        durationMinutes: 20,
        questionsCount: 12,
        passMarkPercent: 85,
        price: 99,
        status: 'locked',
        questions: CACHING_QUESTIONS.slice(0, 5),
      },
      {
        id: 'quiz-cache-3',
        topicId: 'topic-caching',
        title: 'Quiz 3: Consistent Hashing & Ring Rebalancing',
        subtitle: 'Distributed Sharding',
        description: 'Virtual nodes, key-space partition assignment, and network partition split-brain resilience in distributed topologies.',
        durationMinutes: 25,
        questionsCount: 15,
        passMarkPercent: 80,
        price: 99,
        status: 'purchased',
        questions: CACHING_QUESTIONS.slice(0, 5),
      },
      {
        id: 'quiz-cache-4',
        topicId: 'topic-caching',
        title: 'Quiz 4: Redis Cluster Failover & Sentinel Architecture',
        subtitle: 'High Availability & Quorum',
        description: 'Quorum elections, epoch bump propagation, leader promotion and client gossip dissemination.',
        durationMinutes: 15,
        questionsCount: 10,
        passMarkPercent: 80,
        price: 99,
        status: 'completed',
        lastScore: 90,
        lastAttemptDaysAgo: 2,
        questions: CACHING_QUESTIONS,
      },
    ],
  },
  {
    id: 'topic-dsa',
    slug: 'arrays-two-pointers',
    title: 'Arrays, Two Pointers & In-Place Algorithms',
    category: 'Data Structures & Algorithms',
    difficulty: 'Medium',
    description: 'Sliding windows, in-place matrix rotations, fast-and-slow runner pointers, and container with most water patterns.',
    totalQuizzes: 12,
    freeGrantAvailable: true,
    faangRelevancePercent: 92,
    engineersTestedCount: '5.8k',
    quizzes: [
      {
        id: 'quiz-dsa-1',
        topicId: 'topic-dsa',
        title: 'Quiz 1: Two Pointers Fast/Slow Foundations',
        subtitle: 'Foundations',
        description: 'Master in-place array manipulation, cycle detection, and opposite-direction pointer traversals.',
        durationMinutes: 15,
        questionsCount: 10,
        passMarkPercent: 80,
        price: 0,
        status: 'free_available',
        questions: CACHING_QUESTIONS.slice(0, 5),
      },
    ],
  },
  {
    id: 'topic-concurrency',
    slug: 'concurrency-os',
    title: 'Concurrency, Mutexes & Memory Barriers',
    category: 'Core Systems',
    difficulty: 'Hard',
    description: 'Deadlocks, condition variables, CAS operations, false sharing, and CPU memory consistency models.',
    totalQuizzes: 6,
    freeGrantAvailable: true,
    faangRelevancePercent: 80,
    engineersTestedCount: '1.9k',
    quizzes: [
      {
        id: 'quiz-conc-1',
        topicId: 'topic-concurrency',
        title: 'Quiz 1: Deadlocks, Coffman Conditions & Synchronization',
        subtitle: 'Systems Core',
        description: 'Diagnose hold-and-wait conditions, priority inversions, and lock-free atomic primitives.',
        durationMinutes: 20,
        questionsCount: 10,
        passMarkPercent: 80,
        price: 0,
        status: 'free_available',
        questions: CACHING_QUESTIONS.slice(0, 5),
      },
    ],
  },
];

import { isMockEnabled } from '../config/env';

class WebMockStore {
  private topics: TopicData[] = [];
  private attempts: Map<string, DiagnosticResult> = new Map();
  private purchasedItemIds: Set<string> = new Set();

  constructor() {
    if (isMockEnabled()) {
      this.topics = [...MOCK_TOPICS];
      this.purchasedItemIds.add('quiz-cache-3');
      this.seedDefaultAttempt();
    }
  }

  private seedDefaultAttempt() {
    // Seed default diagnostic result matching Stitch results page
    const defaultResult: DiagnosticResult = {
      attemptId: 'att-seed-1',
      quizTitle: 'Quiz 1: Cache Strategies & Invalidation Dilemmas',
      topicTitle: 'Distributed Caching: Redis, Memcached & Cache Invalidation',
      scorePercent: 90,
      correctCount: 9,
      totalCount: 10,
      benchmarkPassed: true,
      candidateTier: 'Top 8% Candidate',
      latencyFormatted: '6m 18s',
      targetLatencyFormatted: '8m 00s (-21%)',
      percentile: '92nd %ile',
      levelBand: 'L6 / Staff',
      streakDays: 4,
      xpEarned: 50,
      subSkills: [
        {
          name: 'Cache Invalidation',
          description: 'TTL heuristics, active stampede mitigation, & XFetch.',
          scorePercent: 100,
          questionCountText: '2/2 Questions',
          status: 'Mastered',
        },
        {
          name: 'Eviction Policies',
          description: 'LRU, LFU, 2Q buffers, and memory ceiling eviction.',
          scorePercent: 100,
          questionCountText: '3/3 Questions',
          status: 'Mastered',
        },
        {
          name: 'Consistency & Writes',
          description: 'Write-Through vs Write-Back risk in financial ledgers.',
          scorePercent: 0,
          questionCountText: '0/1 Question',
          status: 'Needs Review',
        },
        {
          name: 'Distributed Hashing',
          description: 'Consistent hash rings, virtual vnodes, & partition healing.',
          scorePercent: 100,
          questionCountText: '4/4 Questions',
          status: 'Mastered',
        },
      ],
      questionsReview: [
        {
          questionNumber: 1,
          categoryTag: 'Question 01 • High Concurrency',
          stem: CACHING_QUESTIONS[0].stem,
          userAnswerText: 'B. Use probabilistic early expiration (such as the XFetch algorithm) or a distributed mutex so only one worker recalculates the cache while others wait or serve stale data.',
          correctAnswerText: 'B. Use probabilistic early expiration (such as the XFetch algorithm) or a distributed mutex so only one worker recalculates the cache while others wait or serve stale data.',
          isCorrect: true,
          durationSeconds: 38,
          explanation: CACHING_QUESTIONS[0].explanation,
          codeSnippet: CACHING_QUESTIONS[0].codeSnippet,
          diagramTitle: CACHING_QUESTIONS[0].diagramTitle,
          diagramSubtitle: CACHING_QUESTIONS[0].diagramSubtitle,
        },
        {
          questionNumber: 2,
          categoryTag: 'Question 02 • Cluster Partitioning',
          stem: CACHING_QUESTIONS[1].stem,
          userAnswerText: 'Demotes unacknowledged master and flushes unsynced lag buffer via quorum consensus',
          correctAnswerText: 'Demotes unacknowledged master and flushes unsynced lag buffer via quorum consensus',
          isCorrect: true,
          durationSeconds: 42,
          explanation: CACHING_QUESTIONS[1].explanation,
          diagramTitle: CACHING_QUESTIONS[1].diagramTitle,
          diagramSubtitle: CACHING_QUESTIONS[1].diagramSubtitle,
        },
        {
          questionNumber: 3,
          categoryTag: 'Question 03 • Data Consistency',
          stem: CACHING_QUESTIONS[2].stem,
          userAnswerText: 'Write-Back (Write-Behind) Caching with asynchronous background queue flush to PostgreSQL.',
          correctAnswerText: 'Write-Through with 2PC Synchronous Commit across primary database and cache.',
          isCorrect: false,
          durationSeconds: 64,
          explanation: CACHING_QUESTIONS[2].explanation,
          diagramTitle: CACHING_QUESTIONS[2].diagramTitle,
          diagramSubtitle: CACHING_QUESTIONS[2].diagramSubtitle,
        },
      ],
    };

    this.attempts.set('att-seed-1', defaultResult);
  }

  public getTopics(): TopicData[] {
    if (this.topics.length === 0 && isMockEnabled()) {
      this.topics = [...MOCK_TOPICS];
    }
    return this.topics;
  }

  public getTopic(topicIdOrSlug: string): TopicData | undefined {
    return this.getTopics().find((t) => t.id === topicIdOrSlug || t.slug === topicIdOrSlug);
  }

  public getQuiz(quizId: string): QuizData | undefined {
    for (const topic of this.getTopics()) {
      const q = topic.quizzes.find((item) => item.id === quizId);
      if (q) return q;
    }
    return undefined;
  }

  public submitAttempt(submission: AttemptSubmission): DiagnosticResult {
    const quiz = this.getQuiz(submission.quizId) || this.getTopics()[0]?.quizzes[0];
    const questions = quiz ? quiz.questions : [];
    let correctCount = 0;

    const questionsReview = questions.map((q, idx) => {
      const selectedIndex = submission.answers[idx];
      const isCorrect = selectedIndex === q.correctOptionIndex;
      if (isCorrect) correctCount++;

      const selectedOption = q.options[selectedIndex];
      const correctOption = q.options[q.correctOptionIndex];

      return {
        questionNumber: idx + 1,
        categoryTag: `Question ${String(idx + 1).padStart(2, '0')} • ${q.category}`,
        stem: q.stem,
        userAnswerText: selectedOption ? `${selectedOption.label}. ${selectedOption.text}` : 'Skipped / Unanswered',
        correctAnswerText: `${correctOption.label}. ${correctOption.text}`,
        isCorrect,
        durationSeconds: Math.floor(submission.timeSpentSeconds / questions.length) || 35,
        explanation: q.explanation,
        codeSnippet: q.codeSnippet,
        diagramTitle: q.diagramTitle,
        diagramSubtitle: q.diagramSubtitle,
      };
    });

    const totalCount = questions.length || 1;
    const scorePercent = Math.round((correctCount / totalCount) * 100);
    const mins = Math.floor(submission.timeSpentSeconds / 60);
    const secs = submission.timeSpentSeconds % 60;
    const latencyFormatted = `${mins}m ${String(secs).padStart(2, '0')}s`;

    const result: DiagnosticResult = {
      attemptId: submission.attemptId,
      quizTitle: quiz?.title || 'Diagnostic Evaluation',
      topicTitle: quiz ? (this.getTopic(quiz.topicId)?.title || 'System Design') : 'System Design',
      scorePercent,
      correctCount,
      totalCount,
      benchmarkPassed: scorePercent >= (quiz?.passMarkPercent || 80),
      candidateTier: scorePercent >= 90 ? 'Top 8% Candidate' : scorePercent >= 75 ? 'Top 25% Candidate' : 'Emerging Candidate',
      latencyFormatted: latencyFormatted || '6m 18s',
      targetLatencyFormatted: '8m 00s (-21%)',
      percentile: scorePercent >= 90 ? '92nd %ile' : '78th %ile',
      levelBand: scorePercent >= 90 ? 'L6 / Staff' : 'L5 / Senior',
      streakDays: 4,
      xpEarned: 50,
      subSkills: [
        {
          name: 'Cache Invalidation',
          description: 'TTL heuristics, active stampede mitigation, & XFetch.',
          scorePercent: 100,
          questionCountText: '2/2 Questions',
          status: 'Mastered',
        },
        {
          name: 'Eviction Policies',
          description: 'LRU, LFU, 2Q buffers, and memory ceiling eviction.',
          scorePercent: 100,
          questionCountText: '3/3 Questions',
          status: 'Mastered',
        },
        {
          name: 'Consistency & Writes',
          description: 'Write-Through vs Write-Back risk in financial ledgers.',
          scorePercent: scorePercent === 100 ? 100 : 0,
          questionCountText: '0/1 Question',
          status: scorePercent === 100 ? 'Mastered' : 'Needs Review',
        },
        {
          name: 'Distributed Hashing',
          description: 'Consistent hash rings, virtual vnodes, & partition healing.',
          scorePercent: 100,
          questionCountText: '4/4 Questions',
          status: 'Mastered',
        },
      ],
      questionsReview,
    };

    this.attempts.set(submission.attemptId, result);
    return result;
  }

  public getAttemptResult(attemptId: string): DiagnosticResult | undefined {
    return this.attempts.get(attemptId) || (isMockEnabled() ? this.attempts.get('att-seed-1') : undefined);
  }

  public setMockData(enabled: boolean): void {
    if (enabled) {
      this.topics = [...MOCK_TOPICS];
      this.purchasedItemIds.add('quiz-cache-3');
      this.seedDefaultAttempt();
    } else {
      this.topics = [];
      this.attempts.clear();
      this.purchasedItemIds.clear();
    }
  }

  public purchaseItem(itemId: string): boolean {
    this.purchasedItemIds.add(itemId);
    // If bundle purchased, unlock all quizzes
    if (itemId.includes('bundle')) {
      for (const topic of this.topics) {
        for (const q of topic.quizzes) {
          if (q.status === 'locked') q.status = 'purchased';
        }
      }
    } else {
      const q = this.getQuiz(itemId);
      if (q) q.status = 'purchased';
    }
    return true;
  }

  public isItemPurchased(itemId: string): boolean {
    return this.purchasedItemIds.has(itemId);
  }
}

export const webMockStore = new WebMockStore();
