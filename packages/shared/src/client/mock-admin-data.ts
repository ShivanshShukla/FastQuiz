/**
 * FastQuiz Realistic Mock Data Generator & In-Memory Store
 * Powers Admin Dashboard and Users management in Mock / Demo mode.
 */

import type {
  AdminAttentionData,
  AdminAuditActivityItem,
  AdminDashboardDateRange,
  AdminDashboardSummary,
  AdminFunnelData,
  AdminRecentPurchase,
  AdminRecentSignup,
  AdminTimeseriesData,
  AdminTopQuizItem,
  AdminUserActivityItem,
  AdminUserAttemptItem,
  AdminUserDetail,
  AdminUserFreeGrantItem,
  AdminUserListItem,
  AdminUserNoteItem,
  AdminUserPurchaseItem,
  AdminUserQuestionBreakdown,
  AdminUsersListParams,
  AdminUsersListResponse,
  AdminUsersSummaryChips,
  UUID,
} from "../types";

export class AdminMockStore {
  private users: AdminUserDetail[] = [];
  private auditActivity: AdminAuditActivityItem[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    const rawUsers: Array<{
      id: string;
      name: string;
      email: string;
      status: "active" | "suspended";
      source: "email" | "google";
      createdDaysAgo: number;
      lastActiveHoursAgo: number;
      purchasedCount: number;
      totalSpent: number;
      attemptsCount: number;
      avgScore: number;
    }> = [
      {
        id: "usr-1",
        name: "Sarah Connor",
        email: "sarah.connor@sky.net",
        status: "active",
        source: "google",
        createdDaysAgo: 0.5,
        lastActiveHoursAgo: 2,
        purchasedCount: 3,
        totalSpent: 34.97,
        attemptsCount: 18,
        avgScore: 88,
      },
      {
        id: "usr-2",
        name: "Marcus Vance",
        email: "dev.marcus@gmail.com",
        status: "active",
        source: "email",
        createdDaysAgo: 38,
        lastActiveHoursAgo: 6,
        purchasedCount: 1,
        totalSpent: 4.99,
        attemptsCount: 12,
        avgScore: 72,
      },
      {
        id: "usr-3",
        name: "Elena Rostova",
        email: "elena.rostova@yandex.com",
        status: "suspended",
        source: "email",
        createdDaysAgo: 50,
        lastActiveHoursAgo: 360,
        purchasedCount: 0,
        totalSpent: 0,
        attemptsCount: 4,
        avgScore: 45,
      },
      {
        id: "usr-4",
        name: "David Kim",
        email: "david.kim@seoultech.ac.kr",
        status: "active",
        source: "google",
        createdDaysAgo: 22,
        lastActiveHoursAgo: 1,
        purchasedCount: 2,
        totalSpent: 19.98,
        attemptsCount: 24,
        avgScore: 94,
      },
      {
        id: "usr-5",
        name: "Aisha Al-Mansoor",
        email: "aisha.tech@almansoor.ae",
        status: "active",
        source: "email",
        createdDaysAgo: 15,
        lastActiveHoursAgo: 12,
        purchasedCount: 2,
        totalSpent: 18.98,
        attemptsCount: 15,
        avgScore: 81,
      },
      {
        id: "usr-6",
        name: "Liam O’Connor",
        email: "liam.dublin@gmail.com",
        status: "active",
        source: "google",
        createdDaysAgo: 60,
        lastActiveHoursAgo: 48,
        purchasedCount: 4,
        totalSpent: 49.96,
        attemptsCount: 31,
        avgScore: 89,
      },
      {
        id: "usr-7",
        name: "Ananya Sharma",
        email: "ananya.s@iitb.ac.in",
        status: "active",
        source: "google",
        createdDaysAgo: 12,
        lastActiveHoursAgo: 3,
        purchasedCount: 1,
        totalSpent: 9.99,
        attemptsCount: 9,
        avgScore: 84,
      },
      {
        id: "usr-8",
        name: "Lucas Silva",
        email: "lucas.silva@nubank.com.br",
        status: "active",
        source: "email",
        createdDaysAgo: 29,
        lastActiveHoursAgo: 18,
        purchasedCount: 0,
        totalSpent: 0,
        attemptsCount: 6,
        avgScore: 65,
      },
      {
        id: "usr-9",
        name: "Chloe Dubois",
        email: "chloe.dubois@sorbonne.fr",
        status: "active",
        source: "google",
        createdDaysAgo: 4,
        lastActiveHoursAgo: 1,
        purchasedCount: 1,
        totalSpent: 4.99,
        attemptsCount: 5,
        avgScore: 78,
      },
      {
        id: "usr-10",
        name: "Kenji Takahashi",
        email: "kenji.takahashi@u-tokyo.ac.jp",
        status: "active",
        source: "google",
        createdDaysAgo: 3,
        lastActiveHoursAgo: 4,
        purchasedCount: 0,
        totalSpent: 0,
        attemptsCount: 3,
        avgScore: 90,
      },
      {
        id: "usr-11",
        name: "Fatima Zahra",
        email: "fatima.zahra@casablanca.ma",
        status: "active",
        source: "email",
        createdDaysAgo: 19,
        lastActiveHoursAgo: 72,
        purchasedCount: 1,
        totalSpent: 4.99,
        attemptsCount: 8,
        avgScore: 70,
      },
      {
        id: "usr-12",
        name: "Priya Patel",
        email: "priya.patel@accenture.com",
        status: "active",
        source: "google",
        createdDaysAgo: 8,
        lastActiveHoursAgo: 8,
        purchasedCount: 2,
        totalSpent: 24.98,
        attemptsCount: 14,
        avgScore: 92,
      },
      {
        id: "usr-13",
        name: "Dmitri Ivanov",
        email: "dmitri.ivanov@mail.ru",
        status: "suspended",
        source: "email",
        createdDaysAgo: 70,
        lastActiveHoursAgo: 720,
        purchasedCount: 0,
        totalSpent: 0,
        attemptsCount: 2,
        avgScore: 30,
      },
      {
        id: "usr-14",
        name: "Sophia Mueller",
        email: "sophia.m@tum.de",
        status: "active",
        source: "email",
        createdDaysAgo: 2,
        lastActiveHoursAgo: 2,
        purchasedCount: 0,
        totalSpent: 0,
        attemptsCount: 2,
        avgScore: 80,
      },
      {
        id: "usr-15",
        name: "Carlos Mendoza",
        email: "carlos.m@bbva.es",
        status: "active",
        source: "google",
        createdDaysAgo: 33,
        lastActiveHoursAgo: 96,
        purchasedCount: 3,
        totalSpent: 29.97,
        attemptsCount: 20,
        avgScore: 86,
      },
      {
        id: "usr-16",
        name: "Wei Zhang",
        email: "wei.zhang@tsinghua.edu.cn",
        status: "active",
        source: "email",
        createdDaysAgo: 1,
        lastActiveHoursAgo: 1,
        purchasedCount: 1,
        totalSpent: 14.99,
        attemptsCount: 7,
        avgScore: 96,
      },
      {
        id: "usr-17",
        name: "Amara Okafor",
        email: "amara.okafor@andela.com",
        status: "active",
        source: "google",
        createdDaysAgo: 17,
        lastActiveHoursAgo: 20,
        purchasedCount: 1,
        totalSpent: 4.99,
        attemptsCount: 11,
        avgScore: 75,
      },
      {
        id: "usr-18",
        name: "Tariq Hassan",
        email: "tariq.hassan@aucegypt.edu",
        status: "suspended",
        source: "email",
        createdDaysAgo: 40,
        lastActiveHoursAgo: 400,
        purchasedCount: 1,
        totalSpent: 4.99,
        attemptsCount: 5,
        avgScore: 52,
      },
      {
        id: "usr-19",
        name: "Jessica Taylor",
        email: "jessica.taylor@stanford.edu",
        status: "active",
        source: "google",
        createdDaysAgo: 5,
        lastActiveHoursAgo: 5,
        purchasedCount: 2,
        totalSpent: 19.98,
        attemptsCount: 10,
        avgScore: 91,
      },
      {
        id: "usr-20",
        name: "Mateo Rossi",
        email: "mateo.rossi@polimi.it",
        status: "active",
        source: "email",
        createdDaysAgo: 26,
        lastActiveHoursAgo: 110,
        purchasedCount: 0,
        totalSpent: 0,
        attemptsCount: 4,
        avgScore: 68,
      },
      {
        id: "usr-21",
        name: "Hannah Schmidt",
        email: "hannah.schmidt@berlin.de",
        status: "active",
        source: "google",
        createdDaysAgo: 9,
        lastActiveHoursAgo: 14,
        purchasedCount: 1,
        totalSpent: 9.99,
        attemptsCount: 8,
        avgScore: 85,
      },
      {
        id: "usr-22",
        name: "Yuki Tanaka",
        email: "yuki.tanaka@sony.jp",
        status: "active",
        source: "google",
        createdDaysAgo: 55,
        lastActiveHoursAgo: 30,
        purchasedCount: 5,
        totalSpent: 64.95,
        attemptsCount: 42,
        avgScore: 95,
      },
      {
        id: "usr-23",
        name: "Bogdan Popescu",
        email: "bogdan.p@upb.ro",
        status: "suspended",
        source: "email",
        createdDaysAgo: 48,
        lastActiveHoursAgo: 500,
        purchasedCount: 0,
        totalSpent: 0,
        attemptsCount: 1,
        avgScore: 20,
      },
      {
        id: "usr-24",
        name: "Grace Hopper",
        email: "grace.h@navy.mil",
        status: "active",
        source: "google",
        createdDaysAgo: 14,
        lastActiveHoursAgo: 1,
        purchasedCount: 3,
        totalSpent: 39.97,
        attemptsCount: 22,
        avgScore: 99,
      },
      {
        id: "usr-25",
        name: "Naveen Reddy",
        email: "naveen.r@swiggy.in",
        status: "active",
        source: "email",
        createdDaysAgo: 7,
        lastActiveHoursAgo: 9,
        purchasedCount: 1,
        totalSpent: 4.99,
        attemptsCount: 6,
        avgScore: 79,
      },
    ];

    const now = new Date();

    this.users = rawUsers.map((u) => {
      const createdDate = new Date(now.getTime() - u.createdDaysAgo * 86400000);
      const lastSeenDate = new Date(
        now.getTime() - u.lastActiveHoursAgo * 3600000,
      );

      // Generate attempts
      const attempts: AdminUserAttemptItem[] = [
        {
          id: `att-${u.id}-1`,
          quiz_id: "quiz-sliding-window",
          quiz_title: "Sliding Window Mastery",
          topic_name: "Arrays & Two Pointers",
          score: Math.min(10, Math.round((u.avgScore / 100) * 10)),
          total_questions: 10,
          is_free_attempt: true,
          explanations_unlocked: true,
          started_at: new Date(lastSeenDate.getTime() - 1200000).toISOString(),
          completed_at: lastSeenDate.toISOString(),
          duration_seconds: 640,
        },
        {
          id: `att-${u.id}-2`,
          quiz_id: "quiz-cache-design",
          quiz_title: "Distributed Caching (Redis & Memcached)",
          topic_name: "System Design Fundamentals",
          score: Math.max(1, Math.round(((u.avgScore - 10) / 100) * 10)),
          total_questions: 10,
          is_free_attempt: false,
          explanations_unlocked: u.purchasedCount > 0,
          started_at: new Date(lastSeenDate.getTime() - 86400000).toISOString(),
          completed_at: new Date(
            lastSeenDate.getTime() - 85500000,
          ).toISOString(),
          duration_seconds: 900,
        },
      ];

      // Generate purchases
      const purchases: AdminUserPurchaseItem[] = [];
      if (u.purchasedCount > 0) {
        purchases.push({
          id: `pur-${u.id}-1`,
          item_title: "Sliding Window Mastery Quiz Access",
          amount: 4.99,
          status: "completed",
          payment_provider_ref: `pay_rzp_${Math.floor(100000000 + Math.random() * 900000000)}`,
          created_at: new Date(createdDate.getTime() + 86400000).toISOString(),
        });
      }
      if (u.purchasedCount > 1) {
        purchases.push({
          id: `pur-${u.id}-2`,
          item_title: "System Design Fundamentals Bundle",
          amount: 14.99,
          status: "completed",
          payment_provider_ref: `pay_rzp_${Math.floor(100000000 + Math.random() * 900000000)}`,
          created_at: new Date(createdDate.getTime() + 172800000).toISOString(),
        });
      }
      if (u.id === "usr-3") {
        purchases.push({
          id: `pur-${u.id}-fail`,
          item_title: "Concurrency Concepts Quiz",
          amount: 4.99,
          status: "failed",
          payment_provider_ref: "pay_rzp_fail_card_declined",
          created_at: new Date(lastSeenDate.getTime() - 3600000).toISOString(),
        });
      }

      // Free grants
      const free_grants: AdminUserFreeGrantItem[] = [
        {
          topic_id: "topic-dsa-1",
          topic_name: "Arrays & Two Pointers",
          status: "used",
          used_at: createdDate.toISOString(),
        },
        {
          topic_id: "topic-sys-2",
          topic_name: "System Design Fundamentals",
          status: u.attemptsCount > 5 ? "used" : "available",
          used_at:
            u.attemptsCount > 5
              ? new Date(createdDate.getTime() + 86400000).toISOString()
              : null,
        },
        {
          topic_id: "topic-os-3",
          topic_name: "Concurrency & OS Concepts",
          status: "available",
          used_at: null,
        },
      ];

      // Activity timeline
      const activity: AdminUserActivityItem[] = [
        {
          id: `act-${u.id}-1`,
          event_type: "login",
          title: "Learner Signed In",
          description: `Authenticated via ${u.source === "google" ? "Google OAuth2" : "Email/Password"} from IP 192.168.1.1`,
          timestamp: lastSeenDate.toISOString(),
        },
        {
          id: `act-${u.id}-2`,
          event_type: "quiz_submit",
          title: "Submitted Quiz Attempt",
          description: `Completed 'Sliding Window Mastery' with score ${attempts[0].score}/10`,
          timestamp: attempts[0].completed_at || lastSeenDate.toISOString(),
        },
        {
          id: `act-${u.id}-3`,
          event_type: "login",
          title: "Account Registered",
          description: `Created account via ${u.source}`,
          timestamp: createdDate.toISOString(),
        },
      ];

      // Notes
      const notes: AdminUserNoteItem[] = [];
      if (u.status === "suspended") {
        notes.push({
          id: `note-${u.id}-1`,
          user_id: u.id,
          admin_id: "adm-001",
          admin_name: "Alex Reviewer",
          admin_role: "super_admin",
          text: "Account suspended due to excessive rate limiting and abnormal automated quiz scrapers.",
          created_at: new Date(lastSeenDate.getTime() + 3600000).toISOString(),
        });
      }
      if (u.purchasedCount > 2) {
        notes.push({
          id: `note-${u.id}-vip`,
          user_id: u.id,
          admin_id: "adm-002",
          admin_name: "Taylor Finance",
          admin_role: "finance",
          text: "Power learner: VIP status. Multiple bundle purchases completed.",
          created_at: new Date(createdDate.getTime() + 259200000).toISOString(),
        });
      }

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        status: u.status,
        source: u.source,
        created_at: createdDate.toISOString(),
        last_seen_at: lastSeenDate.toISOString(),
        quizzes_purchased: u.purchasedCount,
        total_spent: u.totalSpent,
        attempts_count: u.attemptsCount,
        avg_score: u.avgScore,
        streak_days: Math.floor(Math.random() * 8) + 1,
        attempts,
        purchases,
        free_grants,
        activity,
        notes,
      };
    });

    this.auditActivity = [
      {
        id: "aud-1",
        admin_name: "Alex Reviewer",
        action: "question_approved",
        target_type: "question",
        target_id: "q-mod-1",
        details:
          "Approved question: Minimum time complexity for two sum in sorted array",
        timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
      },
      {
        id: "aud-2",
        admin_name: "Taylor Finance",
        action: "refund_processed",
        target_type: "purchase",
        target_id: "pur-104",
        details: "Processed refund of $4.99 for user alex.tanaka@tokyo.ac.jp",
        timestamp: new Date(now.getTime() - 75 * 60000).toISOString(),
      },
      {
        id: "aud-3",
        admin_name: "Jordan Admin",
        action: "user_suspended",
        target_type: "user",
        target_id: "usr-3",
        details:
          "Suspended user elena.rostova@yandex.com: Bot attempt frequency",
        timestamp: new Date(now.getTime() - 180 * 60000).toISOString(),
      },
      {
        id: "aud-4",
        admin_name: "Alex Reviewer",
        action: "free_grant_reset",
        target_type: "user",
        target_id: "usr-2",
        details: "Granted free retry for topic Arrays & Two Pointers",
        timestamp: new Date(now.getTime() - 360 * 60000).toISOString(),
      },
    ];
  }

  // --- Users Queries & Mutations ---

  public listUsers(params: AdminUsersListParams = {}): AdminUsersListResponse {
    let filtered = [...this.users];

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q),
      );
    }

    if (params.status && params.status !== "all") {
      filtered = filtered.filter((u) => u.status === params.status);
    }

    if (params.source && params.source !== "all") {
      filtered = filtered.filter((u) => u.source === params.source);
    }

    if (params.has_purchased && params.has_purchased !== "all") {
      if (params.has_purchased === "yes") {
        filtered = filtered.filter((u) => u.quizzes_purchased > 0);
      } else {
        filtered = filtered.filter((u) => u.quizzes_purchased === 0);
      }
    }

    if (params.signup_from) {
      const from = new Date(params.signup_from).getTime();
      filtered = filtered.filter(
        (u) => new Date(u.created_at).getTime() >= from,
      );
    }
    if (params.signup_to) {
      const to = new Date(params.signup_to).getTime();
      filtered = filtered.filter((u) => new Date(u.created_at).getTime() <= to);
    }

    // Sort
    const sortBy = params.sort_by || "created_at";
    const sortOrder = params.sort_order || "desc";
    filtered.sort((a, b) => {
      let valA: number | string = "";
      let valB: number | string = "";

      if (sortBy === "created_at") {
        valA = new Date(a.created_at).getTime();
        valB = new Date(b.created_at).getTime();
      } else if (sortBy === "last_seen_at") {
        valA = a.last_seen_at ? new Date(a.last_seen_at).getTime() : 0;
        valB = b.last_seen_at ? new Date(b.last_seen_at).getTime() : 0;
      } else if (sortBy === "total_spent") {
        valA = a.total_spent;
        valB = b.total_spent;
      } else if (sortBy === "quizzes_purchased") {
        valA = a.quizzes_purchased;
        valB = b.quizzes_purchased;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    const page = params.page || 1;
    const pageSize = params.page_size || 10;
    const start = (page - 1) * pageSize;
    const items: AdminUserListItem[] = filtered
      .slice(start, start + pageSize)
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        status: u.status,
        source: u.source,
        created_at: u.created_at,
        last_seen_at: u.last_seen_at,
        quizzes_purchased: u.quizzes_purchased,
        total_spent: u.total_spent,
        attempts_count: u.attempts_count,
      }));

    const summary: AdminUsersSummaryChips = {
      total_registered: this.users.length,
      active_30d: this.users.filter((u) => {
        if (!u.last_seen_at) return false;
        const diff = Date.now() - new Date(u.last_seen_at).getTime();
        return diff <= 30 * 86400000;
      }).length,
      suspended: this.users.filter((u) => u.status === "suspended").length,
      paying_customers: this.users.filter((u) => u.quizzes_purchased > 0)
        .length,
    };

    return {
      items,
      total: filtered.length,
      page,
      page_size: pageSize,
      summary,
    };
  }

  public getUser(userId: UUID): AdminUserDetail | null {
    return this.users.find((u) => u.id === userId) || null;
  }

  public suspendUser(userId: UUID, reason: string): boolean {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return false;
    user.status = "suspended";
    user.notes.unshift({
      id: `note-${Date.now()}`,
      user_id: userId,
      admin_id: "adm-current",
      admin_name: "Current Admin",
      admin_role: "admin",
      text: `Status changed to SUSPENDED. Reason: ${reason}`,
      created_at: new Date().toISOString(),
    });
    this.auditActivity.unshift({
      id: `aud-${Date.now()}`,
      admin_name: "Current Admin",
      action: "user_suspended",
      target_type: "user",
      target_id: userId,
      details: `Suspended ${user.email}: ${reason}`,
      timestamp: new Date().toISOString(),
    });
    return true;
  }

  public unsuspendUser(userId: UUID, reason: string): boolean {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return false;
    user.status = "active";
    user.notes.unshift({
      id: `note-${Date.now()}`,
      user_id: userId,
      admin_id: "adm-current",
      admin_name: "Current Admin",
      admin_role: "admin",
      text: `Status changed to ACTIVE. Reason: ${reason}`,
      created_at: new Date().toISOString(),
    });
    this.auditActivity.unshift({
      id: `aud-${Date.now()}`,
      admin_name: "Current Admin",
      action: "user_unsuspended",
      target_type: "user",
      target_id: userId,
      details: `Unsuspended ${user.email}: ${reason}`,
      timestamp: new Date().toISOString(),
    });
    return true;
  }

  public grantQuiz(userId: UUID, quizId: UUID, reason: string): boolean {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return false;
    user.quizzes_purchased += 1;
    user.purchases.unshift({
      id: `pur-grant-${Date.now()}`,
      item_title: `Granted: ${quizId}`,
      amount: 0.0,
      status: "completed",
      payment_provider_ref: "admin_comp_grant",
      created_at: new Date().toISOString(),
    });
    user.notes.unshift({
      id: `note-${Date.now()}`,
      user_id: userId,
      admin_id: "adm-current",
      admin_name: "Current Admin",
      admin_role: "admin",
      text: `Admin granted quiz access for '${quizId}'. Reason: ${reason}`,
      created_at: new Date().toISOString(),
    });
    return true;
  }

  public resetFreeGrant(userId: UUID, topicId: UUID, reason: string): boolean {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return false;
    const grant = user.free_grants.find((g) => g.topic_id === topicId);
    if (grant) {
      grant.status = "available";
      grant.used_at = null;
    }
    user.notes.unshift({
      id: `note-${Date.now()}`,
      user_id: userId,
      admin_id: "adm-current",
      admin_name: "Current Admin",
      admin_role: "admin",
      text: `Admin reset free attempt for topic '${topicId}'. Reason: ${reason}`,
      created_at: new Date().toISOString(),
    });
    return true;
  }

  public addNote(userId: UUID, text: string): AdminUserNoteItem | null {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return null;
    const note: AdminUserNoteItem = {
      id: `note-${Date.now()}`,
      user_id: userId,
      admin_id: "adm-current",
      admin_name: "Current Admin",
      admin_role: "admin",
      text,
      created_at: new Date().toISOString(),
    };
    user.notes.unshift(note);
    return note;
  }

  public getQuestionBreakdown(_attemptId: UUID): AdminUserQuestionBreakdown[] {
    return [
      {
        question_id: "q-breakdown-1",
        stem: "What is the time complexity of finding a duplicate in an unsorted array using an in-place Floyd Cycle Detection algorithm?",
        options: ["O(N)", "O(N log N)", "O(N^2)", "O(1)"],
        user_answer_index: 0,
        correct_answer_index: 0,
        is_correct: true,
        explanation:
          "Floyd Cycle Detection traverses the array treating indices as pointers, which completes in linear O(N) time with O(1) space.",
      },
      {
        question_id: "q-breakdown-2",
        stem: "When expanding a sliding window to satisfy a constraint, which pointer advances first?",
        options: [
          "Left pointer",
          "Right pointer",
          "Both simultaneously",
          "Neither",
        ],
        user_answer_index: 1,
        correct_answer_index: 1,
        is_correct: true,
        explanation:
          "The right pointer expands the window boundary until the target condition is met or violated.",
      },
      {
        question_id: "q-breakdown-3",
        stem: "Which distributed cache pattern invalidates the cache by writing only to persistent storage and letting keys expire?",
        options: [
          "Write-Behind",
          "Write-Through",
          "Cache-Aside with TTL",
          "Refresh-Ahead",
        ],
        user_answer_index: 0,
        correct_answer_index: 2,
        is_correct: false,
        explanation:
          "In Cache-Aside with TTL, applications write updates directly to the database and rely on cache key expiration or explicit invalidation.",
      },
      {
        question_id: "q-breakdown-4",
        stem: "Under what condition does a mutex deadlock occur?",
        options: [
          "Mutual exclusion alone",
          "Hold and wait, no preemption, and circular wait conditions met simultaneously",
          "High CPU utilization",
          "Insufficient heap space",
        ],
        user_answer_index: 1,
        correct_answer_index: 1,
        is_correct: true,
        explanation:
          "Coffman conditions: Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait must all hold simultaneously for deadlock to occur.",
      },
      {
        question_id: "q-breakdown-5",
        stem: "What is the primary benefit of Redis Sentinel over standard master-replica replication?",
        options: [
          "Multi-threaded key hashing",
          "Automated failover and master election without manual intervention",
          "ACID transaction guarantees across shards",
          "Eliminates in-memory storage requirements",
        ],
        user_answer_index: 1,
        correct_answer_index: 1,
        is_correct: true,
        explanation:
          "Redis Sentinel monitors master instances and orchestrates automatic failover if the master becomes unresponsive.",
      },
    ];
  }

  // --- Dashboard Analytics ---

  public getDashboardSummary(
    range: AdminDashboardDateRange,
  ): AdminDashboardSummary {
    const multipliers: Record<AdminDashboardDateRange, number> = {
      today: 1,
      "7d": 7,
      "30d": 30,
      custom: 7,
    };
    const mult = multipliers[range];

    return {
      registered_users: 1420 + mult * 18,
      registered_users_delta: 12.4,
      active_dau: 148,
      active_dau_delta: 8.5,
      active_wau: 520,
      active_wau_delta: 11.2,
      active_mau: 1380,
      active_mau_delta: 14.8,
      new_signups: 16 * mult,
      new_signups_delta: 15.2,
      paying_users: 184 + mult * 4,
      paying_users_delta: 18.0,
      free_to_paid_conversion: 15.6,
      free_to_paid_delta: 2.4,
      revenue: Math.round(380 * mult * 1.15),
      revenue_delta: 16.8,
      attempts_started: 190 * mult,
      attempts_completed: 165 * mult,
      attempts_delta: 13.5,
      pending_reviews: 24,
      failed_purchases: 3,
      open_reports: 2,
    };
  }

  public getDashboardTimeseries(
    range: AdminDashboardDateRange,
  ): AdminTimeseriesData {
    const pointsCount = range === "today" ? 12 : range === "30d" ? 30 : 7;
    const points = [];
    const now = new Date();

    for (let i = pointsCount - 1; i >= 0; i--) {
      const d = new Date(
        now.getTime() - i * (range === "today" ? 2 * 3600000 : 86400000),
      );
      const dateLabel =
        range === "today"
          ? `${d.getHours()}:00`
          : d.toISOString().split("T")[0];

      const baseSignups = range === "today" ? 3 : 15;
      const baseActive = range === "today" ? 25 : 140;
      const baseRev = range === "today" ? 45 : 350;

      // Realistic variation
      const variance = Math.sin(i * 0.8) * 0.3;
      points.push({
        date: dateLabel,
        signups: Math.max(2, Math.round(baseSignups * (1 + variance))),
        active_users: Math.max(
          10,
          Math.round(baseActive * (1 + variance * 0.5)),
        ),
        revenue: Math.max(15, Math.round(baseRev * (1 + variance))),
      });
    }

    return { points };
  }

  public getDashboardFunnel(): AdminFunnelData {
    return {
      steps: [
        { name: "Signed Up", count: 1250, percentage: 100 },
        { name: "Started Free Attempt", count: 930, percentage: 74.4 },
        { name: "Completed Free Quiz", count: 730, percentage: 58.4 },
        { name: "Purchased Paid Access", count: 185, percentage: 14.8 },
      ],
    };
  }

  public getTopQuizzes(
    by: "revenue" | "attempts",
    limit: number = 5,
  ): AdminTopQuizItem[] {
    const list: AdminTopQuizItem[] = [
      {
        id: "quiz-sliding-window",
        title: "Sliding Window Mastery",
        topic_name: "Arrays & Two Pointers",
        revenue: 1485.0,
        attempts: 1240,
        completion_rate: 88,
      },
      {
        id: "quiz-cache-design",
        title: "Distributed Caching (Redis & Memcached)",
        topic_name: "System Design Fundamentals",
        revenue: 1120.0,
        attempts: 890,
        completion_rate: 82,
      },
      {
        id: "quiz-bundle-sys",
        title: "System Design Fundamentals Bundle",
        topic_name: "System Design Fundamentals",
        revenue: 2980.0,
        attempts: 710,
        completion_rate: 91,
      },
      {
        id: "quiz-concurrency-os",
        title: "Concurrency & OS Concepts Quiz",
        topic_name: "Concurrency & OS Concepts",
        revenue: 840.0,
        attempts: 650,
        completion_rate: 76,
      },
      {
        id: "quiz-dp-foundations",
        title: "Dynamic Programming Foundations",
        topic_name: "Algorithms & Data Structures",
        revenue: 960.0,
        attempts: 610,
        completion_rate: 70,
      },
    ];

    list.sort((a, b) =>
      by === "revenue" ? b.revenue - a.revenue : b.attempts - a.attempts,
    );
    return list.slice(0, limit);
  }

  public getAttentionItems(): AdminAttentionData {
    return {
      items: [
        {
          id: "att-1",
          type: "pending_review",
          severity: "high",
          title: "24 Questions Pending Review in Queue",
          description:
            "SLA threshold reached for 4 community and AI-generated submissions.",
          link: "/review",
          timestamp: new Date().toISOString(),
        },
        {
          id: "att-2",
          type: "failed_purchase",
          severity: "high",
          title: "3 Failed Stripe / Razorpay Transactions",
          description:
            "Cards declined for user candidate.john@outlook.com and 2 others.",
          link: "/purchases?status=failed",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "att-3",
          type: "user_report",
          severity: "medium",
          title: "Learner Flagged Typo in Question #q-mod-3",
          description:
            "Feedback: 'Write-Through option explanation contains duplicate sentence'",
          link: "/review/q-mod-3",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: "att-4",
          type: "stuck_attempt",
          severity: "low",
          title: "High Drop-Off Detected on Dynamic Programming",
          description:
            "32% of learners exit before question 5 on quiz-dp-foundations.",
          link: "/content",
          timestamp: new Date(Date.now() - 14400000).toISOString(),
        },
      ],
    };
  }

  public getRecentSignups(limit: number = 8): AdminRecentSignup[] {
    return this.users.slice(0, limit).map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      source: u.source,
      created_at: u.created_at,
    }));
  }

  public getRecentPurchases(limit: number = 8): AdminRecentPurchase[] {
    const list: AdminRecentPurchase[] = [];
    for (const u of this.users) {
      for (const p of u.purchases) {
        list.push({
          id: p.id,
          user_id: u.id,
          user_name: u.name,
          user_email: u.email,
          item_title: p.item_title,
          amount: p.amount,
          status: p.status,
          created_at: p.created_at,
        });
      }
    }
    list.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    return list.slice(0, limit);
  }

  public getRecentAuditActivity(limit: number = 8): AdminAuditActivityItem[] {
    return this.auditActivity.slice(0, limit);
  }
}

export const adminMockStore = new AdminMockStore();
