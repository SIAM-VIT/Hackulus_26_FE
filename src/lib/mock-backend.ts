/**
 * MOCK BACKEND
 * ------------
 * This file intercepts all axios requests and returns realistic dummy data.
 * Activated when NEXT_PUBLIC_MOCK_BACKEND=true is set in .env.local
 *
 * Aligned with Hackulus_26_BE FastAPI backend:
 *   - Auth: /auth/user/login, /auth/admin/login → { access_token, token_type }
 *   - Users: /users/home, /users/submit/review1, etc.
 *   - Submissions: /submissions/
 *   - Admin: /admin/teams, /admin/team/{id}, /admin/team/{id}/status, /admin/timeline/phase
 *   - Reviews: /reviews/submission/{submission_id}
 *
 * Dummy personas:
 *   - Regular user  → token with role:"participant"
 *   - Admin/Judge   → token with role:"judge"
 *
 * Switch between them by calling switchMockUser("admin") or switchMockUser("user")
 * from the browser console.
 */

import MockAdapter from "axios-mock-adapter";
import api from "./api";

// ─── Fake JWT helpers ────────────────────────────────────────────────────────
// We build a minimal, non-signed JWT just so jwtDecode() can read the payload.
const fakeJwt = (payload: object): string => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fakesignature`;
};

const MOCK_USER_TOKEN = fakeJwt({
  user_id: 1,
  email: "john.doe2023@vitstudent.ac.in",
  role: "participant",
  team_id: 42,
  is_leader: true,
  name: "John Doe",
  exp: 9999999999,
});

const MOCK_ADMIN_TOKEN = fakeJwt({
  user_id: 99,
  email: "rishab.nagwani2023@vitstudent.ac.in",
  role: "judge",
  team_id: 0,
  is_leader: false,
  name: "Rishab Nagwani",
  exp: 9999999999,
});

// ─── Seed the token so the app starts "logged in" ───────────────────────────
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_MOCK_BACKEND === "true") {
  const existing = localStorage.getItem("authToken");
  if (!existing) {
    localStorage.setItem("authToken", MOCK_USER_TOKEN);
  }
}

// Browser console helper to swap personas without page reload
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_MOCK_BACKEND === "true") {
  (window as unknown as { switchMockUser: (role: "user" | "admin") => void }).switchMockUser = (
    role: "user" | "admin"
  ) => {
    localStorage.setItem(
      "authToken",
      role === "admin" ? MOCK_ADMIN_TOKEN : MOCK_USER_TOKEN
    );
    window.location.reload();
  };
  console.info(
    "%c[MockBackend] Active. Call switchMockUser(\"admin\") or switchMockUser(\"user\") in the console to change personas.",
    "color:#7c3aed;font-weight:bold"
  );
}

// ─── Dummy data ──────────────────────────────────────────────────────────────

const MOCK_USER = {
  user_id: 1,
  name: "John Doe",
  email: "john.doe2023@vitstudent.ac.in",
  role: "participant",
  team_id: 42,
  is_leader: true,
};

const MOCK_TEAM = {
  team_id: 42,
  team_name: "Neural Ninjas",
  track_name: "AI and Mathematical Modelling",
  status: "accepted",
  problem_statement: "Adaptive Fleet Rerouting in Congested Cities",
  idea: "We propose an adaptive ML-powered system that ingests real-time traffic, weather and historical delivery data to recompute optimal fleet routes. The core model is a Graph Neural Network operating on a live city-road graph.",
};

const MOCK_MEMBERS = [
  {
    user_id: 1,
    member_id: 1,
    name: "John Doe",
    email: "john.doe2023@vitstudent.ac.in",
    is_leader: true,
  },
  {
    user_id: 2,
    member_id: 2,
    name: "Alice Smith",
    email: "alice.smith2023@vitstudent.ac.in",
    is_leader: false,
  },
  {
    user_id: 3,
    member_id: 3,
    name: "Bob Kumar",
    email: "bob.kumar2023@vitstudent.ac.in",
    is_leader: false,
  },
  {
    user_id: 4,
    member_id: 4,
    name: "Priya Sharma",
    email: "priya.sharma2023@vitstudent.ac.in",
    is_leader: false,
  },
];

const MOCK_WINDOWS = {
  review1: true,
  review2: false,
  final: false,
};

const MOCK_SUBMISSIONS: MockSubmission[] = [
  {
    submission_id: 101,
    type: "review1",
    title: "Adaptive Fleet Rerouting in Congested Cities",
    description:
      "An ML-powered adaptive routing system for delivery fleets using real-time traffic data and Graph Neural Networks to reduce fuel consumption by 30% and improve on-time deliveries.",
    links: {
      presentation_link: "https://docs.google.com/presentation/d/mock",
      github_link: "https://github.com/neural-ninjas/fleet-rerouting",
      figma_link: "https://figma.com/file/mock-design",
    },
  },
];

const MOCK_ADMIN_USER = {
  user_id: 99,
  name: "Rishab Nagwani",
  email: "rishab.nagwani2023@vitstudent.ac.in",
  role: "judge",
  team_id: 0,
  is_leader: false,
};

const MOCK_TEAMS_LIST: MockTeamDetails[] = [];

// Build 12 fake teams for the admin panel
const trackNames = [
  "AI and Mathematical Modelling",
  "Cyber Security",
  "FinTech",
  "Healthcare",
  "VIT-Centric",
  "Open Innovation",
  "Sustainability",
];

const teamNamePrefixes = [
  "Neural", "Cyber", "Quantum", "Pixel", "Alpha", "Sigma",
  "Omega", "Delta", "Vortex", "Phoenix", "Titan", "Nebula",
];
const teamNameSuffixes = [
  "Ninjas", "Hawks", "Force", "Squad", "Crew", "Guild",
  "Pirates", "Wolves", "Coders", "Legends", "Ops", "Surge",
];

interface MockMember {
  member_id: number;
  name: string;
  email: string;
  is_leader: boolean;
}

interface MockSubmission {
  submission_id: number;
  type: "review1" | "review2" | "final";
  title: string;
  description: string;
  links?: {
    presentation_link?: string;
    github_link?: string;
    figma_link?: string;
    file?: string;
  };
}

interface MockReview {
  judge_id: number;
  innovation_score: number;
  technical_complexity_score: number;
  feasibility_score: number;
  ui_ux_score: number;
  presentation_score: number;
  progress_score: number;
  comments: string;
}

interface MockTeamDetails {
  team_id: number;
  team_name: string;
  track_name: string;
  status: string;
  members: MockMember[];
  problem_statement: string;
  idea: string;
  submissions: MockSubmission[];
  reviews?: MockReview[];
}

const MOCK_TEAM_DETAILS: MockTeamDetails = {
  ...MOCK_TEAM,
  members: MOCK_MEMBERS,
  submissions: MOCK_SUBMISSIONS,
  reviews: [
    {
      judge_id: 99,
      innovation_score: 85,
      technical_complexity_score: 78,
      feasibility_score: 72,
      ui_ux_score: 80,
      presentation_score: 90,
      progress_score: 88,
      comments:
        "Strong idea with clear problem understanding. GNN approach is innovative. Work on the demo.",
    },
  ],
};

for (let i = 0; i < 12; i++) {
  MOCK_TEAMS_LIST.push({
    team_id: 42 + i,
    team_name: `${teamNamePrefixes[i]} ${teamNameSuffixes[i]}`,
    track_name: trackNames[i % trackNames.length],
    status: i % 4 === 0 ? "pending" : i % 4 === 1 ? "accepted" : i % 4 === 2 ? "shortlisted" : "rejected",
    problem_statement: "Sample Problem Statement",
    idea: "This team has a great idea that solves a real-world problem using cutting-edge technology.",
    members: [
      {
        member_id: i * 4 + 1,
        name: `Leader ${i + 1}`,
        email: `leader${i + 1}@vitstudent.ac.in`,
        is_leader: true,
      },
      {
        member_id: i * 4 + 2,
        name: `Member ${i + 1}A`,
        email: `member${i + 1}a@vitstudent.ac.in`,
        is_leader: false,
      },
      {
        member_id: i * 4 + 3,
        name: `Member ${i + 1}B`,
        email: `member${i + 1}b@vitstudent.ac.in`,
        is_leader: false,
      },
    ],
    submissions:
      i % 2 === 0
        ? [
            {
              submission_id: 200 + i,
              type: "review1",
              title: `Team ${i + 1} Idea Submission`,
              description: `An innovative solution by team ${i + 1} addressing real-world challenges.`,
              links: {
                github_link: `https://github.com/team${i + 1}/project`,
                presentation_link: `https://docs.google.com/presentation/d/team${i + 1}`,
              },
            },
          ]
        : [],
    reviews:
      i % 3 === 2
        ? [
            {
              judge_id: 99,
              innovation_score: 70 + i * 2,
              technical_complexity_score: 65 + i * 3,
              feasibility_score: 60 + i * 2,
              ui_ux_score: 68 + i * 2,
              presentation_score: 75 + i,
              progress_score: 72 + i * 2,
              comments: `Good work by team ${i + 1}. Solid execution.`,
            },
          ]
        : undefined,
  });
}

// ─── Mount the mock adapter ──────────────────────────────────────────────────

let mockInstance: MockAdapter | null = null;

export function setupMockBackend() {
  if (typeof window === "undefined") return; // SSR: skip
  if (process.env.NEXT_PUBLIC_MOCK_BACKEND !== "true") return; // disabled
  if (mockInstance) return; // already mounted

  const mock = new MockAdapter(api, {
    delayResponse: 400, // realistic ~400ms latency
    onNoMatch: "passthrough",
  });
  mockInstance = mock;

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // ── Auth endpoints ──────────────────────────────────────────────────────────
  // Backend returns { access_token, token_type } per TokenResponse schema

  // User login
  mock.onPost("/auth/user/login").reply(async (config) => {
    await delay(300);
    const body = JSON.parse(config.data || "{}");
    // Accept any email/password in mock mode
    void body;
    return [200, { access_token: MOCK_USER_TOKEN, token_type: "bearer" }];
  });

  // Admin login
  mock.onPost("/auth/admin/login").reply(async (config) => {
    await delay(300);
    void config;
    return [200, { access_token: MOCK_ADMIN_TOKEN, token_type: "bearer" }];
  });

  // Logout
  mock.onPost("/auth/logout").reply(200, { message: "Logged out successfully" });

  // ── User endpoints ──────────────────────────────────────────────────────────

  // Home / dashboard data
  mock.onGet("/users/home").reply(200, {
    user: MOCK_USER,
    team: MOCK_TEAM,
    members: MOCK_MEMBERS,
    windows: MOCK_WINDOWS,
    currentPhase: "Review 1",
  });

  // User's submissions (backend route: GET /submissions/)
  mock.onGet("/submissions/").reply(200, {
    submissions: MOCK_SUBMISSIONS,
  });
  mock.onGet("/submissions").reply(200, {
    submissions: MOCK_SUBMISSIONS,
  });
  mock.onGet("/users/submissions").reply(200, {
    submissions: MOCK_SUBMISSIONS,
  });

  // Teams tracks
  mock.onGet("/teams/tracks").reply(200, []);

  // Idea submission (Review 1)
  mock.onPost("/users/submit/review1").reply(async (config) => {
    await delay(600);
    const body = JSON.parse(config.data || "{}");
    const newSub: MockSubmission = {
      submission_id: 999,
      type: "review1",
      title: body.title || "New Idea",
      description: body.description || "",
      links: body.links,
    };
    MOCK_SUBMISSIONS.splice(0, MOCK_SUBMISSIONS.length, newSub);
    return [201, { message: "Idea submitted successfully", submission: newSub }];
  });

  // Idea modification (Review 1)
  mock.onPut("/users/submit/review1").reply(async (config) => {
    await delay(600);
    const body = JSON.parse(config.data || "{}");
    if (MOCK_SUBMISSIONS[0]) {
      MOCK_SUBMISSIONS[0] = { ...MOCK_SUBMISSIONS[0], ...body };
    }
    return [200, { message: "Idea updated successfully" }];
  });

  // Review 2 submission
  mock.onPost("/users/submit/review2").reply(async (config) => {
    await delay(600);
    const body = JSON.parse(config.data || "{}");
    const newSub: MockSubmission = {
      submission_id: 998,
      type: "review2",
      title: body.title || "Review 2 Project",
      description: body.description || "",
      links: body.links,
    };
    MOCK_SUBMISSIONS.push(newSub);
    return [201, { message: "Review 2 submitted successfully", submission: newSub }];
  });

  mock.onPut("/users/submit/review2").reply(200, { message: "Review 2 updated successfully" });

  // Final submission
  mock.onPost("/users/submit/final").reply(async (config) => {
    await delay(600);
    const body = JSON.parse(config.data || "{}");
    const newSub: MockSubmission = {
      submission_id: 997,
      type: "final",
      title: body.title || "Final Project",
      description: body.description || "",
      links: body.links,
    };
    MOCK_SUBMISSIONS.push(newSub);
    return [201, { message: "Final project submitted successfully", submission: newSub }];
  });

  mock.onPut("/users/submit/final").reply(200, { message: "Final project updated successfully" });

  // ── Admin endpoints ─────────────────────────────────────────────────────────

  // Admin profile
  mock.onGet("/auth/me").reply(200, MOCK_ADMIN_USER);
  mock.onGet("/admin/me").reply(200, { user: MOCK_ADMIN_USER });

  // All teams
  mock.onGet("/admin/teams").reply(200, { teams: MOCK_TEAMS_LIST });

  // Single team details (backend: GET /admin/team/{id})
  mock.onGet(/\/admin\/team\/\d+$/).reply((config) => {
    const id = parseInt(config.url?.split("/").pop() || "0", 10);
    const found = MOCK_TEAMS_LIST.find((t) => t.team_id === id);
    if (found) {
      return [200, { team: found, members: found.members, submissions: found.submissions }];
    }
    // Fallback to main mock team
    return [200, { team: MOCK_TEAM_DETAILS, members: MOCK_TEAM_DETAILS.members, submissions: MOCK_TEAM_DETAILS.submissions }];
  });

  // Update team status (backend: POST /admin/team/{id}/status)
  mock.onPost(/\/admin\/team\/\d+\/status/).reply((config) => {
    const body = JSON.parse(config.data || "{}");
    const urlParts = config.url?.split("/") || [];
    const id = parseInt(urlParts[3] || "0", 10);
    const team = MOCK_TEAMS_LIST.find((t) => t.team_id === id);
    if (team) team.status = body.status || team.status;
    return [200, { message: "Team status updated" }];
  });

  // Get submission details with reviews (for admin judging panel)
  mock.onGet(/\/admin\/submission\/\d+$/).reply((config) => {
    const submissionId = parseInt(config.url?.split("/").pop() || "0", 10);
    // Find the team that owns this submission
    const teamWithSub = MOCK_TEAMS_LIST.find((t) =>
      t.submissions.some((s) => s.submission_id === submissionId)
    );
    return [200, {
      submission: teamWithSub?.submissions.find((s) => s.submission_id === submissionId) || null,
      reviews: teamWithSub?.reviews || [],
    }];
  });

  // Submit review score (backend: POST /reviews/submission/{submission_id})
  mock.onPost(/\/reviews\/submission\/\d+/).reply((config) => {
    const body = JSON.parse(config.data || "{}");
    const submissionId = parseInt(config.url?.split("/").pop() || "0", 10);
    const team = MOCK_TEAMS_LIST.find((t) =>
      t.submissions.some((s) => s.submission_id === submissionId)
    );
    if (team) {
      if (!team.reviews) team.reviews = [];
      team.reviews.push({
        judge_id: 99,
        innovation_score: body.innovation_score || 0,
        technical_complexity_score: body.technical_complexity_score || 0,
        feasibility_score: body.feasibility_score || 0,
        ui_ux_score: body.ui_ux_score || 0,
        presentation_score: body.presentation_score || 0,
        progress_score: body.progress_score || 0,
        comments: body.comments || "",
      });
    }
    return [201, { message: "Review submitted" }];
  });

  // Hackathon phase control (backend: GET/POST /admin/timeline/phase)
  mock.onGet("/admin/timeline/phase").reply(200, { currentPhase: "Review 1" });

  mock.onPost("/admin/timeline/phase").reply((config) => {
    const body = JSON.parse(config.data || "{}");
    return [200, { message: "Phase updated", currentPhase: body.phase }];
  });

  // Batch team status update (backend: POST /admin/teams/batch-status)
  mock.onPost("/admin/teams/batch-status").reply((config) => {
    const body = JSON.parse(config.data || "{}");
    const { team_ids, status } = body;
    if (team_ids && status) {
      for (const id of team_ids) {
        const team = MOCK_TEAMS_LIST.find((t) => t.team_id === id);
        if (team) team.status = status;
      }
    }
    return [200, { message: "Batch status updated" }];
  });

  // Window controls (no backend equivalent — kept for local state management)
  mock.onPost("/admin/windows").reply((config) => {
    const body = JSON.parse(config.data || "{}");
    Object.assign(MOCK_WINDOWS, body);
    return [200, { message: "Windows updated", windows: MOCK_WINDOWS }];
  });

  console.info("[MockBackend] All routes registered ✓");
}
