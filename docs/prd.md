# FastQuiz — Product Requirements Document

*Living doc — edit freely as decisions get made.*

## 1. Vision
Help users land jobs by preparing them for interviews — not limited to CS/tech roles, but for other exams and interview types too. FastQuiz replaces rigid annual-subscription prep platforms with a flexible, pay-as-you-need model.

## 2. Problem
Existing exam/interview-prep platforms lock users into upfront annual subscriptions with no way to try before buying, switch topics, or pay only for what they need.

## 3. Target Users & Platform
- Job seekers preparing for technical interviews (DSA, system design)
- Launch focus: CS interview prep only. Other exam categories are a future expansion, not part of v1.
- **Platform: web + mobile from the start** (v1, not a later add-on)

## 4. Content Strategy
- Mix of: self-authored questions, community/marketplace-contributed questions, and AI-generated questions
- Needs a review/QA step for AI-generated and community content before it goes live (accuracy matters a lot for interview prep)

## 5. Business Model & Pricing
- **Freemium**: one free quiz per topic/category, then pay-per-quiz for the rest of that topic
- **Bundle discounts**: e.g. buy a topic/set of quizzes together cheaper than one-by-one
- No subscription tier in v1

## 6. Core Features (MVP)
- [ ] Browse quizzes by DSA/system-design topic
- [ ] Free quiz attempts (limited count) for new users
- [ ] Paid quiz unlock — single quiz and bundle purchase
- [ ] Take a quiz, get scored, see explanations
- [ ] Score history / progress tracking
- [ ] User accounts & auth
- [ ] Payment integration
- [ ] Content pipeline: self-authored + community submission + AI-generation, with a review/approval step

## 7. Future / Nice-to-have
- [ ] Expansion to other exam categories beyond CS
- [ ] Subscription tier for heavy users
- [ ] Weak-topic tracking & personalized recommendations
- [ ] Leaderboards

## 8. Architecture Decisions
| Decision | Choice | Notes |
|---|---|---|
| Repo structure | Monorepo — needs revisiting now that mobile is in scope for v1 (e.g. `frontend/`, `mobile/`, `backend/`, or a cross-platform framework sharing one client codebase) | |
| Frontend/mobile stack | TBD | Cross-platform (React Native/Flutter) vs. separate web + native — open decision given web+mobile from day one |
| Backend stack | TBD | |
| Database | TBD | |
| Payments | TBD | Needs a provider that supports one-off + bundle payments; India-based options likely relevant |
| Hosting/Infra | TBD | |

## 9. Non-Functional Requirements
- [Performance/scale — personal project scale, or built to handle real paying users from day one?]
- Payment security/compliance (PCI handled by payment provider, not custom)
- [Auth/security requirements]

## 10. Open Questions (remaining)
1. Frontend/mobile approach — cross-platform framework (React Native/Flutter) to share one client codebase, or separate web + native apps?
2. Repo structure — how to fold mobile into the monorepo (or split it out)?
3. Payment provider (Razorpay, Stripe, etc. — India-based payments likely matter here)
4. Content moderation/QA process details for community + AI-generated questions

## 11. Milestones
| Phase | Scope | Status |
|---|---|---|
| Phase 1 | Repo setup, core backend API (quizzes, auth) | Not started |
| Phase 2 | Payment integration + paywall logic | Not started |
| Phase 3 | Frontend MVP | Not started |
| Phase 4 | Content for launch category | Not started |
| Phase 5 | Polish / deploy | Not started |