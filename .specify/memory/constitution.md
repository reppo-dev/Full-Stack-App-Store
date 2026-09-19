<!--
# Sync Impact Report
- Version change: 1.1.0 -> 1.2.0
- List of modified principles:
  * Added Principle XLIV: Target Authentication & Multi-Session Governance (JWT, Refresh Token Rotation & Session Security).
  * Updated Principle XIV (Defense-in-Depth Validation & Security) and Principle XXXII (Stateless Application Core) cross-references.
  * Synchronized Architectural Gap Matrix with PostgreSQL-backed session storage, token rotation, and reuse mitigation.
- Added sections:
  * Principle XLIV:
    - Access Token Architecture (15-minute TTL, minimal claims, env-driven keys).
    - Refresh Token Architecture (Opaque 256-bit string, 7d sliding / 30d max, SHA-256 hash storage).
    - Multi-Device & Session Governance (`user_sessions` PostgreSQL SSOT, autonomous session revocation).
    - Refresh Flow & Automatic Token Reuse Detection (Replay attack detection and breach containment).
    - Browser Transport & Web Security (HttpOnly, Secure, SameSite=Lax cookies, strict CORS).
    - Decoupled Authorization & RBAC (Resource ownership verification).
    - Stateless Scaling & High Availability (Independent of in-memory state).
    - Credential Sanitization & Structured Security Audit Logging.
    - Scope Phasing (Phase 0 hygiene vs. Phase 3 multi-session execution).
    - XXIII. Production-Grade Containerization
    - XXIV. Local Infrastructure & Environment Orchestration (Docker Compose)
    - XXV. Discoverable Developer Workflows (Makefile Standards)
    - XXVI. Continuous Integration & Delivery Automation (GitHub Actions)
    - XXVII. Branch Hygiene & Pull Request Governance
    - XXVIII. Distributed Caching & Redis Governance
    - XXIX. Defensive Rate Limiting
    - XXX. Health Check Semantics & Graceful Shutdown
    - XXXI. Reverse Proxy & Multi-Instance Load Balancing
    - XXXII. Stateless Application Core
    - XXXIII. Full-Spectrum Observability & Request Tracing
    - XXXIV. Continuous Security & Supply-Chain Integrity
    - XXXV. Database Reliability, Indexing & Transaction Integrity
    - XXXVI. Twelve-Factor Configuration & Secret Segregation
    - XXXVII. Discoverable & Type-Safe API Contracts (OpenAPI/Swagger)
    - XXXVIII. Scalability Hierarchy (Correctness-First)
    - XXXIX. External Dependency Resilience & Failure Boundaries
    - XL. Asynchronous Background Job Processing
    - XLI. Architecture Decision Records (ADR)
    - XLII. Development Environment Parity
    - XLIII. Technology Justification Principle (No Tech for Tech's Sake)
  * Expanded Current Limitations, Migration Rules & Future Targets (Architectural Gap Matrix) with infrastructure and DevOps concerns.
  * Updated Quality Gates & Verification Standards pipeline.
- Removed sections: None.
- Follow-up TODOs: None.
-->

# DashStack Full-Stack App Store Constitution

## Core Principles

### I. Backend Layered Architecture (Clean Boundaries & SQL-First)
The backend MUST maintain strict unidirectional separation between architectural layers:
1. **HTTP / Transport Layer**: Fiber handlers, request decoding, HTTP status codes, and cookie serialization. Handlers MUST NOT execute database queries or contain business logic.
2. **Application / Use-Case Layer**: Orchestrates use cases, coordinates domain entities, and invokes port interfaces.
3. **Domain / Business Logic Layer**: Pure business rules, validations, and domain models free of framework or database dependencies.
4. **Data Access Layer**: SQL-first repository implementations.
5. **Infrastructure Layer**: External SDKs (S3, mailers, payment gateways).

- **Data Access Strategy**: GORM is a transitional dependency and MUST NOT be used for new modules. All new data access MUST be designed SQL-first using versioned raw SQL schemas. [SQLC](https://sqlc.dev/) MUST be used to generate type-safe, boilerplate-free Go database code from pure SQL queries.
- **Migration Engine**: Database schema changes MUST be managed by an independent, versioned migration tool (e.g. `golang-migrate` or `goose`) decoupled from SQLC code generation. GORM `AutoMigrate` MUST NOT be extended to new tables.

### II. Scalability & Modular Monolith
The application MUST be architected as a modular monolith capable of scaling to approximately 1,000,000 active users without premature distributed microservice decomposition:
- Application servers MUST remain stateless to allow horizontal scaling behind a reverse proxy/load balancer.
- Scalability decisions MUST prioritize relational database correctness, deterministic index strategy, connection pooling, deterministic limit/offset or cursor pagination, and query execution plan optimization (`EXPLAIN ANALYZE`).
- Caching (e.g. Redis) and asynchronous worker queues MUST only be introduced when justified by verified throughput bottlenecks or IO latency metrics, not speculative performance claims.

### III. Domain-Driven Frontend Architecture
The frontend codebase MUST be organized by feature domain so that any software engineer can immediately discern:
- The location of each feature and its bounded context (`frontend/features/<domain>` or `frontend/app/(routes)/...`).
- Domain-specific state, validation schemas, and UI components.
- Centralized server communication and client-side view state.
- Global shared UI primitives versus domain-specific widgets.

### IV. Strict State Segregation (Server State vs. Client State)
Frontend state MUST be strictly categorized into two mutually exclusive buckets:
1. **Server State (TanStack Query)**:
   - All asynchronous remote data (products, user profiles, orders, tickets, dashboard metrics, wishlist items) MUST be managed via TanStack Query.
   - TanStack Query is the single source of truth for remote data caching, background revalidation, stale-time management, pagination, and optimistic updates.
2. **Client State (Redux Toolkit)**:
   - Purely synchronous or client-local ephemeral state (shopping cart operations requiring offline capability, interactive modal/dialog visibility, sidebar navigation toggles, complex multi-step form workflows, client-side filter selections, and user display preferences) MUST be managed via Redux Toolkit slices.
- **Single Source of Truth Rule**: Remote API entities MUST NOT be copied or mirrored into Redux state without documented architectural justification.

### V. Centralized API Client & Transport Layer
All frontend HTTP communication with the backend MUST flow through a single, centralized Axios client instance:
- The central HTTP client MUST encapsulate `baseURL`, default timeout, request headers, credential inclusion (`withCredentials: true`), request/response interceptors, centralized token expiration handling, and response/error payload normalization.
- Individual components, pages, or features MUST NOT instantiate ad-hoc Axios instances, make un-intercepted raw `fetch()` calls, or implement private authentication handling.
- Transport logic, API request functions, and component rendering logic MUST remain cleanly decoupled.

### VI. Component Hierarchy & Separation of Concerns
UI development MUST adhere to strict component stratification:
- **Shared UI Primitives** (`components/ui`): Reusable, headless/atomic design primitives (buttons, inputs, dialogs, cards) that are completely decoupled from business domain models.
- **Feature-Specific Components**: Domain-aware widgets containing domain markup and event bindings, colocated within their respective feature modules.
- Components MUST adhere to the Single Responsibility Principle. Abstractions MUST only be extracted when genuine duplication or clean interface boundaries exist—never purely to compress line counts.

### VII. Explicit Feature & Domain Boundaries
The codebase MUST enforce modular boundaries around business domains:
- Recognized core domains: `Authentication`, `Users & Roles`, `Products`, `Categories`, `Cart`, `Wishlist / Favorites`, `Orders`, `Payments`, `Ticketing / Messaging`, `Dashboard & Analytics`, `Profile`, and `Administration`.
- Cross-domain coupling MUST occur exclusively through defined domain service interfaces or clean public API endpoints, never via internal implementation leakage.

### VIII. Autonomous Ticketing Domain
Customer support and internal ticketing MUST be treated as an autonomous core domain:
- Ticket data models, communication threads, and workflow logic MUST NOT be entangled with generic e-commerce storefront views or admin overview dashboards.
- The Ticketing UI MUST provide a robust workflow covering ticket listing, full-text searching, faceted filtering, detail inspection, conversational timeline/replies, status transitions, priority tags, and agent assignment.
- Visual inspiration (e.g. Gmail-style master-detail views) is permitted only where it enhances productivity and UX; superficial aesthetic imitation with mock data is strictly prohibited.

### IX. Actionable & Operational Dashboard
The administrative dashboard MUST provide actionable operational intelligence rather than superficial cosmetic charts:
- Every metric, KPI card, and graph MUST answer a concrete operational or business question (e.g., revenue run-rate, inventory depletion velocity, pending ticket SLA breach, order fulfillment backlogs).
- Decorative, non-interactive, or duplicate charts with synthetic hardcoded data are strictly banned.
- All visualization components MUST consume real aggregated backend data and utilize standard, reusable chart primitives.

### X. Accessible & State-Resilient E-Commerce UX
Customer-facing catalog interfaces MUST maintain production-grade UX resilience:
- Product listing sections (New Arrivals, Best Sellers, Flash Discounts) MUST feature responsive, horizontally scrollable rows or responsive grids.
- Every async component MUST explicitly implement and test 5 visual states: **Initial/Idle**, **Loading (Skeleton)**, **Error with Retry**, **Empty Data**, and **Populated**.
- Interactive widgets MUST preserve semantic HTML structure and accessibility standards (WCAG 2.1 AA keyboard navigation, contrast ratios, and screen-reader labels).

### XI. Product Scope & Functional Completeness
The architectural modernization roadmap MUST account for missing or structurally incomplete areas identified during repository indexing:
- User Profile self-management.
- Functional persistent Shopping Cart.
- Integrated Wishlist connected to user identity.
- Customer & Admin Order management with lifecycle status tracking.
- Production Ticketing system.
- Operational Admin Dashboard connected to real metrics.
- Hardened Authentication & Password Recovery flows.
- Product Category Browsing & Faceted Filtering.
- Product Detail pages for customer storefront (`/products/[id]`).
- Checkout & Payment settlement flows.

### XII. Explicit API Contracts & Schema Predictability
Every HTTP endpoint exposed by the backend MUST adhere to a documented, predictable schema contract:
- Request payloads MUST be strictly validated before entering use-case logic.
- Successful responses MUST conform to standardized JSON envelope formats.
- Errors MUST return standardized error envelopes with programmatic error codes and human-readable messages.
- Frontend data contracts MUST match backend JSON serialization tags exactly (snake_case vs. camelCase consistency).

### XIII. Centralized & Sanitized Error Handling
Error handling across both tiers MUST be deterministic, centralized, and secure:
- Handlers MUST NOT expose internal infrastructure details, stack traces, database schema names, or raw SQL errors to external clients.
- Errors MUST be categorized by domain failure types (e.g., `NotFound`, `Unauthorized`, `Forbidden`, `ValidationFailed`, `Conflict`, `InternalError`) mapped consistently to standard HTTP status codes.
- Backend errors MUST be logged with diagnostic context; frontend errors MUST be normalized by the central API client and displayed through non-intrusive toast notifications or inline field alerts.

### XIV. Defense-in-Depth Validation & Security
Security and input integrity MUST be enforced at multiple architectural layers:
- The backend MUST validate all inputs independently; frontend form validation (Zod) is considered an ergonomic UX assistant, never an authoritative security boundary.
- Authentication (JWT verification) and Role-Based Access Control (RBAC) MUST be enforced at the HTTP middleware layer before request execution reaches controller handlers.
- Secrets, private keys, database passwords, and cloud access keys MUST NEVER be committed to version control or hardcoded in source files. All configuration MUST be resolved from external environment variables.

### XV. Non-Negotiable Testing & Behavioral Parity
Refactoring, modernization, and feature addition MUST be guarded by verifiable automated tests:
- **Unit Tests**: Core domain logic, validation schemas, token parsing, and algorithmic calculations.
- **Integration Tests**: Repository SQL queries, database migrations, and external service adapters.
- **API Contract Tests**: Endpoint status codes, payload shapes, and authentication boundaries.
- **Behavioral Parity**: Refactoring existing modules MUST NOT alter existing functional behavior unless explicitly demanded by a formal specification.

### XVI. Incremental Observability
The system MUST provide transparency into runtime behavior:
- Structured logging (JSON format) with standardized severity levels (`DEBUG`, `INFO`, `WARN`, `ERROR`).
- Critical checkpoints (authentication attempts, order checkout, payments, database query latency, and unhandled panics) MUST emit contextual logs containing correlation identifiers.
- Observability capabilities MUST be introduced incrementally without degrading request throughput.

### XVII. Evidence-Based Legacy Migration
Legacy code MUST NOT be altered or removed through arbitrary "Big Bang" rewrites:
- Migration MUST follow the **Strangler Fig Pattern**: new domain modules are developed alongside legacy components, with traffic routed incrementally once the new module passes full validation.
- Every migration step MUST define: clear boundaries, quantifiable scope, rollback contingency plans, and automated verification before deprecating legacy pathways.

### XVIII. Rigorous Dead Code Elimination
Code removal MUST be governed by verifiable factual evidence:
- A file, function, or dependency MUST NOT be removed based solely on the assumption that it "appears unused."
- Before removing any candidate, the engineer MUST verify: dynamic reflection, route registry entries, indirect exports, framework naming conventions (e.g., Next.js conventions), environment configurations, and external integrations.
- Unregistered controllers, orphaned templates, and abandoned starter files with confirmed zero references MUST be quarantined or removed with clear commit rationales.

### XIX. Disciplined Dependency Governance
Third-party libraries MUST be treated as liabilities requiring ongoing maintenance:
- No dependency may be introduced based on fashion or temporary convenience.
- Proposed dependencies MUST demonstrate: active maintenance, security audit clean bill, minimal transitive footprint, acceptable bundle weight, and clear necessity over standard library or existing framework features.

### XX. Controlled Architectural Evolution
Architectural modernization MUST proceed through disciplined, reversible increments:
- The repository MUST transition towards clean modular boundaries feature by feature.
- Wholesale structural overhauls that halt product delivery or destabilize current functionality are strictly forbidden.
- Changes MUST maintain a continuous green build and runnable local development environment at every step.

### XXI. Living Architectural Documentation
All significant technical decisions, boundary demarcations, and data contracts MUST be documented and kept current:
- Architectural Decision Records (ADRs) MUST document non-trivial technical trade-offs.
- Documentation MUST be accurate to reality, allowing any onboarding engineer to comprehend directory layouts, run environments, domain boundaries, and coding conventions without oral history.

### XXII. Definition of Done (DoD)
No migration task, architectural enhancement, or feature implementation shall be deemed complete unless it satisfies the following non-negotiable quality criteria:
1. **Spec Alignment**: All functional and non-functional requirements in the governing specification are satisfied.
2. **Automated Verification**: Associated unit, integration, or contract tests are written, passing, and verifiable via command-line execution.
3. **Clean Build**: Backend compiles cleanly with zero warnings/errors (`go build`); frontend builds cleanly without TypeScript or ESLint errors (`pnpm build`).
4. **Contract Verification**: API response shapes, HTTP status codes, and TypeScript contracts match without runtime mismatches.
5. **Architectural Conformance**: Layer boundaries, dependency directions, and state rules (Server vs. Client) are strictly respected.
6. **No Scope Creep**: Changes are strictly confined to the agreed scope; no gratuitous reformatting or unrelated code modifications exist.

---

### XXIII. Production-Grade Containerization
The project MUST provide reproducible, isolated build and execution environments via Docker:
- **Image Optimization**: Images MUST utilize multi-stage builds separating build tools, source code, and intermediate caches from the final runtime image. Final images MUST be minimal (e.g. distroless or alpine for Go, node-alpine with standalone output for Next.js).
- **Security Boundaries**: Application processes MUST NOT run as `root` inside containers. Dedicated non-root system users (`UID > 1000`) MUST be defined in Dockerfiles.
- **Determinism**: Images MUST produce identical builds across developer machines and CI runners. Dynamic runtime package installations inside container entrypoints are strictly prohibited.

### XXIV. Local Infrastructure & Environment Orchestration (Docker Compose)
All local development and integration dependencies MUST be launchable via Docker Compose:
- **Service Parity**: Dependencies including PostgreSQL, Redis, and local development service configurations MUST be declared in version-controlled `docker-compose.yml`.
- **Decoupled Configuration**: Docker Compose configuration MUST rely on environment variables (`.env`) for ports and credentials. Hardcoded secrets in compose files are forbidden.
- **Scope Limit**: Docker Compose is designated for local development, testing, and CI environments; it MUST NOT be assumed as the default production orchestration strategy unless explicitly specified by infrastructure architecture.

### XXV. Discoverable Developer Workflows (Makefile Standards)
Common development, testing, database, and build lifecycle tasks MUST be codified into a root `Makefile`:
- Standardized target names MUST be provided:
  * `make dev`: Launches local development environments.
  * `make test`: Runs backend and frontend test suites.
  * `make lint`: Executes static analysis, linters, and type checkers.
  * `make format`: Auto-formats codebases according to language standards.
  * `make build`: Compiles production binaries and frontend production artifacts.
  * `make migrate`: Applies pending database migrations.
  * `make migration`: Scaffolds a new versioned migration file.
  * `make docker-up` / `make docker-down`: Manages local infrastructure containers.
  * `make ci`: Executes the full local pre-flight suite matching CI gates.
- Workflows MUST NOT rely on undocumented oral knowledge or manual multi-step shell commands.

### XXVI. Continuous Integration & Delivery Automation (GitHub Actions)
All verification gates MUST be automated via GitHub Actions pipelines:
- **Pipeline Scope**: Automated pipelines MUST trigger on all pull requests and merges to mainline branches, executing:
  1. Formatting and linting checks (`golangci-lint`, `eslint`).
  2. Static type checking (`tsc --noEmit`, Go type checks).
  3. Unit and integration tests.
  4. Docker multi-stage build validation.
  5. Database migration syntax and rollback validation.
  6. Dependency and container vulnerability scanning.
- **Fail-Fast & Transparency**: Pipelines MUST fail immediately on first critical failure and output human-readable diagnostic logs.
- **Deployment Automation**: Production deployments MUST be fully automated, repeatable, and auditable from tagged releases or protected branches; manual deployment from local developer laptops is prohibited.

### XXVII. Branch Hygiene & Pull Request Governance
All architectural mutations and feature additions MUST undergo structured review:
- **Scoped Pull Requests**: PRs MUST address a single coherent problem with a clearly stated scope, testing evidence, and an assessment of architectural/migration impact.
- **Atomic Decompositions**: Large refactorings MUST be partitioned into small, reviewable increments (e.g. interface introduction -> implementation -> migration of call sites -> legacy deprecation).
- Direct unreviewed commits to mainline release branches are prohibited.

### XXVIII. Distributed Caching & Redis Governance
Where distributed server-side caching is required, Redis is the primary architectural candidate, governed by strict rules:
- **Not a Primary Database**: Redis MUST NOT serve as the primary source of truth for persistent business entities (users, orders, payments). The primary relational database (PostgreSQL) is the sole system of record.
- **Explicit Cache Policy**: Every cached key MUST define:
  * Documented naming conventions with domain namespaces (e.g. `catalog:product:{id}`).
  * Mandatory Time-To-Live (TTL).
  * Explicit invalidation hooks on entity mutations.
  * Deterministic stale-data behavior.
- **Resilient Fallback**: Cache unavailability MUST NOT cause fatal application downtime. If Redis is unreachable, the system MUST log a warning and fall back gracefully to the primary database.
- **No Masking of Defects**: Caching MUST NOT be used to paper over unindexed tables, N+1 query loops, or fundamentally flawed database schemas.

### XXIX. Defensive Rate Limiting
Sensitive, computationally expensive, or public entry points MUST enforce rate limiting:
- Rate limiting MUST be enforced on: authentication (`/login`, `/register`), password reset flows, payment submissions, ticket creations, and public search endpoints.
- In multi-instance deployments, rate limiting MUST be distributed (backed by Redis or an API gateway token-bucket) to prevent perimeter bypass across replicated servers.

### XXX. Health Check Semantics & Graceful Shutdown
Backend application processes MUST expose standardized operational lifecycle semantics:
- **Health Probes**:
  * **Liveness Probe** (`/health/live`): Confirms the HTTP server process is responsive.
  * **Readiness Probe** (`/health/ready`): Confirms the server is prepared to accept user traffic (database connection pool verified, required migrations present). Readiness probes MUST NOT trigger cascading thundering herds on transient external service blips.
- **Graceful Shutdown**: On receiving termination signals (`SIGINT`, `SIGTERM`), the application MUST cease accepting new requests, complete in-flight transactions within a defined timeout (e.g. 15-30s), flush buffers, close connection pools, and exit cleanly.

### XXXI. Reverse Proxy & Multi-Instance Load Balancing
The backend architecture MUST support horizontal replication across multiple concurrent instances:
- The system MUST be deployable behind a reverse proxy/load balancer (e.g. Nginx, Envoy, AWS ALB) with automated round-robin or least-connections distribution.
- The application process MUST NOT rely on local server process affinity (sticky sessions) or local filesystem persistence for core request processing.

### XXXII. Stateless Application Core
Application servers MUST remain strictly stateless:
- User session authentication MUST NOT reside in server process RAM. State MUST be carried via signed stateless tokens (JWT) or stored in external distributed infrastructure (Redis).
- Temporary files (e.g. multipart uploads) MUST NOT be assumed to exist on the local disk of a subsequent request; persistent files MUST be stored in S3-compatible cloud object storage.

### XXXIII. Full-Spectrum Observability & Request Tracing
The system MUST provide real-time runtime transparency:
- **Correlation Tracking**: Every incoming HTTP request MUST be tagged with a unique request correlation ID (`X-Request-ID`), propagated across HTTP response headers, internal context, database query logs, and child goroutines.
- **Machine-Readable Logs**: Logs MUST be output in structured JSON format with standard fields (`timestamp`, `level`, `request_id`, `caller`, `message`, `error`).
- **Data Sanitization**: Passwords, tokens, credit card details, and personal identifiable information (PII) MUST NEVER appear in log files.

### XXXIV. Continuous Security & Supply-Chain Integrity
Security MUST be enforced as an automated continuous verification process:
- Automated scanners MUST run in CI to detect vulnerable Go modules (`govulncheck`), npm dependencies (`pnpm audit`), and Docker base image CVEs (`trivy`).
- Secret scanning tools (e.g. `gitleaks`) MUST run pre-commit or in CI to prevent credential leakage.
- Permissions and role authorizations MUST be verified explicitly at runtime on every protected endpoint.

### XXXV. Database Reliability, Indexing & Transaction Integrity
Relational data storage (PostgreSQL) MUST adhere to industrial reliability practices:
- **Transaction Boundaries**: Multi-table or multi-entity business mutations MUST execute inside explicit database transactions (`BEGIN ... COMMIT / ROLLBACK`).
- **Deterministic Indexing**: Foreign keys, unique constraints, and high-cardinality search/filter columns MUST be indexed. Queries MUST be verified against execution plans.
- **Connection Pooling**: PostgreSQL connection pools MUST specify explicit limits (`MaxOpenConns`, `MaxIdleConns`, `ConnMaxLifetime`) to prevent database resource exhaustion.
- **Safe Migrations**: Destructive migrations (dropping columns, modifying types) MUST follow multi-phase expand-contract patterns with rollback scripts.

### XXXVI. Twelve-Factor Configuration & Secret Segregation
Application configuration MUST strictly follow the Twelve-Factor App methodology:
- All dynamic settings (ports, URLs, timeouts, pool sizes) and secrets (database passwords, JWT secret keys, cloud storage credentials) MUST be injected via environment variables.
- The codebase MUST maintain sample template files (`.env.example`) documenting all expected variables without real secret values.
- Real credentials MUST NEVER be committed to source control or embedded in Docker images or client-side JavaScript bundles.

### XXXVII. Discoverable & Type-Safe API Contracts (OpenAPI/Swagger)
All external and inter-tier API contracts MUST be formally documented and discoverable:
- Endpoints, query parameters, request bodies, success schemas, and error responses MUST be specified via OpenAPI (v3) or equivalent declarative annotations.
- Frontend data contracts MUST be synchronized against these formal API specifications to prevent silent schema drift.

### XXXVIII. Scalability Hierarchy (Correctness-First)
Architectural trade-offs MUST be evaluated according to an uncompromising priority order:
$$\textbf{1. Correctness} \longrightarrow \textbf{2. Maintainability} \longrightarrow \textbf{3. Observability} \longrightarrow \textbf{4. Performance} \longrightarrow \textbf{5. Scalability}$$
- Scaling to 1,000,000 users MUST NOT serve as an excuse for unmaintainable complexity, premature distributed systems, or skipping testing.
- Every added infrastructure component MUST be justified by an empirical bottleneck or quantifiable operational necessity.

### XXXIX. External Dependency Resilience & Failure Boundaries
Interactions with third-party networks, cloud providers, and external APIs (ParsPack S3, payment gateways, SMS/email relays) MUST be defensively ring-fenced:
- All external HTTP/SDK calls MUST enforce explicit context timeouts.
- Transient network failures MUST employ exponential backoff with jitter.
- Operations MUST be idempotent (via unique idempotency keys) to ensure retries do not trigger duplicate orders, charges, or state mutations.
- Circuit breaking and fallback UI states MUST prevent external provider downtime from causing cascade failures across the main application.

### XL. Asynchronous Background Job Processing
Long-running, computationally heavy, or latency-unpredictable workloads MUST NOT execute synchronously inside the HTTP request/response loop:
- Tasks including bulk CSV generation, email notifications, image optimization, and periodic syncs MUST be delegated to dedicated asynchronous background workers.
- The background task system MUST provide: job persistence, unique execution keys (idempotency), configurable retries with dead-letter queues, and observable job failure metrics.
- Distributed queues (e.g. Redis-backed queues) MUST only be adopted when concurrency and persistence guarantees are formally evaluated.

### XLI. Architecture Decision Records (ADR)
All major architectural pivots, framework selections, and structural refactorings MUST be recorded in version-controlled Architectural Decision Records (`docs/adr/`):
- Mandatory ADR triggers include:
  * Migration from GORM to SQLC.
  * Introduction of Redis caching.
  * State management refactoring (TanStack Query + Redux Toolkit).
  * Selection of background worker infrastructure.
  * Deployment and reverse-proxy architecture.
- Every ADR MUST document: Context, Decision, Status (Proposed/Accepted/Superseded), and Detailed Consequences (positive, negative, operational overhead).

### XLII. Development Environment Parity
Friction between developer machines, continuous integration, and production environments MUST be minimized:
- Development, CI, and staging environments MUST run identical versions of Go, Node.js, PostgreSQL, and Redis.
- Environment drift MUST be eradicated through standard container baselines (`docker-compose`), identical linter rules, and unified Makefile targets.

### XLIII. Technology Justification Principle (No Tech for Tech's Sake)
No technology, library, framework, or architectural pattern shall enter the DashStack repository purely on grounds of popularity, novelty, or abstract recommendation:
- Before any new dependency or infrastructure component is approved, the author MUST document:
  1. What specific concrete problem it solves.
  2. Why the existing tools, standard library, or current architecture cannot solve it.
  3. The ongoing operational, cognitive, and maintenance cost to the team.
  4. The failure modes and disaster recovery impact.
  5. Empirical justification that the added complexity is outweighed by real value.

### XLIV. Target Authentication & Multi-Session Governance (JWT, Refresh Token Rotation & Session Security)
The platform MUST implement an industrial-grade, multi-device authentication architecture:
- **Access Token Architecture**:
  * Format: Signed HMAC-SHA256 (or asymmetric RS256/Ed25519) JSON Web Token (JWT) using `golang-jwt/jwt/v5`.
  * Lifetime (TTL): Strict short-lived duration of **15 minutes** (balancing customer browsing ergonomics with minimal exposure window).
  * Payload / Claims: Strictly minimal standard claims: `sub` (user ID), `role` (primary role string), `jti` (unique token ID), `iss` ("dashstack-api"), `aud` ("dashstack-client"), `exp` (timestamp), `iat` (timestamp). Personal identifiable information (PII), email, passwords, or full profile structures MUST NOT be embedded in access tokens.
  * Secret Resolution: Signing key MUST be resolved strictly from environment variable `JWT_SECRET` (minimum 32 cryptographically random bytes). Hardcoded secret constants in source files are strictly prohibited.
- **Refresh Token Architecture**:
  * Format: Cryptographically random 256-bit opaque string (32 bytes generated via `crypto/rand`, base64url-encoded). Refresh tokens MUST NOT be structured JWTs.
  * Lifetime (TTL): Long-lived duration of **7 days** with a sliding window renewal upon active use, capped at an absolute maximum of **30 days**.
  * Hash-Only Database Persistence: Raw refresh tokens MUST NEVER be stored in the database. Only a cryptographically secure one-way hash (`SHA-256` digest hex) MUST be persisted in PostgreSQL.
  * Mandatory Rotation: Every successful token refresh MUST invalidate the presented refresh token and issue a newly generated refresh token alongside a new access token.
- **Multi-Device & Session Governance**:
  * Every login on a distinct device, browser, or platform (e.g. desktop browser, mobile app, tablet) MUST create an independent session entity in the database.
  * System of Record: The PostgreSQL `user_sessions` table is the sole authoritative Source of Truth (SSOT) for active refresh-token sessions:
    - Fields: `id` (UUIDv7 primary key), `user_id` (foreign key), `refresh_token_hash` (VARCHAR(64), indexed), `device_identifier` (client-provided or fingerprint), `device_platform` (e.g. "Windows", "Android", "iOS", "macOS"), `user_agent` (client string), `ip_address` (client IP), `created_at`, `last_used_at`, `expires_at`, `revoked_at` (nullable TIMESTAMPTZ).
  * User Session Autonomy:
    - Users MUST have the capability to query all active sessions associated with their account, with their current session explicitly demarcated.
    - Users MUST be able to revoke a specific session/device (logging out that device alone).
    - Users MUST be able to revoke all active sessions ("Logout everywhere" / security panic button).
    - Expired or revoked sessions MUST be rejected unconditionally on any subsequent access attempt.
- **Refresh Flow & Automatic Token Reuse Detection (Theft / Replay Attack Mitigation)**:
  * Normal Refresh Sequence:
    `Client presents Refresh Token -> Server hashes token (SHA-256) -> Lookup session in PostgreSQL -> Verify: session exists, NOT revoked (revoked_at IS NULL), NOT expired (expires_at > NOW()) -> Generate new Access Token (15m) + new Refresh Token (opaque) -> Update session with new hash and new expires_at -> Revoke old token -> Return tokens`.
  * Reuse Detection & Breach Containment:
    - If a refresh token that has already been rotated or revoked is presented again to the refresh endpoint, the system MUST treat the event as an active token theft / replay breach.
    - Immediate Action: The entire user session (and optionally all active sessions for that user family) MUST be revoked immediately (`revoked_at = NOW()`).
    - Audit Alert: A high-priority security audit event (`SECURITY_ALERT: refresh_token_reuse_detected`) MUST be emitted with correlation ID, user ID, IP, and user agent.
    - User Experience: The request MUST be rejected with HTTP 401 Unauthorized, forcing re-authentication via original credentials.
- **Browser Transport & Web Security**:
  * In browser-based environments, refresh tokens MUST be stored exclusively in `HttpOnly`, `Secure`, `SameSite=Lax` cookies with `Path=/api/v1/auth/refresh`.
  * Storage of refresh tokens in browser `localStorage` or `sessionStorage` is strictly prohibited due to XSS vulnerability.
  * Cross-Origin Resource Sharing (CORS) MUST restrict `Access-Control-Allow-Credentials: true` strictly to authorized storefront origins; wildcard `*` origins are forbidden.
  * Access tokens MAY be transported via Authorization header (`Bearer <token>`) or a short-lived `HttpOnly`, `Secure` cookie.
- **Decoupled Authorization & RBAC**:
  * Authentication (verifying caller identity) and Authorization (verifying resource permissions) MUST remain decoupled.
  * A cryptographically valid JWT alone MUST NOT grant access to a resource. Handlers and use cases MUST verify:
    1. Role authorization (e.g. `RequireRole("admin")`).
    2. Resource ownership boundaries (e.g. user ID matching entity owner ID).
- **Stateless Scaling & High Availability**:
  * The authentication architecture MUST scale horizontally across multiple backend instances.
  * Session correctness and validation MUST NOT depend on process in-memory state.
  * Redis MAY be utilized as a read-through cache for fast session lookups or distributed rate limiting, but PostgreSQL remains the non-negotiable transactional authority for session state and revocation.
- **Audit Logging & Credential Sanitization**:
  * Passwords, raw refresh tokens, JWT secret keys, and database passwords MUST NEVER be written to application logs.
  * Structured security audit logs MUST be recorded for all key authentication events: `AUTH_LOGIN_SUCCESS`, `AUTH_LOGIN_FAILED`, `AUTH_LOGOUT_SINGLE`, `AUTH_LOGOUT_ALL`, `AUTH_REFRESH_SUCCESS`, `AUTH_REFRESH_REUSE_DETECTED`.
- **Modernization Scope Phasing**:
  * Phase 0 enforces baseline hygiene (removal of hardcoded secrets, externalization to `.env`, attaching authentication middleware to destructive endpoints).
  * Full implementation of the multi-device session schema, opaque token rotation, reuse detection engine, and session management UI is scheduled for execution in **Phase 3**.

---

## Current Limitations, Migration Rules & Future Targets

To maintain complete transparency between current codebase reality and the target architecture, all identified architectural gaps are mapped below:

| Architectural Area | Current Codebase Limitation | Migration Rule (Transition Phase) | Future Target Architecture |
| :--- | :--- | :--- | :--- |
| **Backend Layering** | Controllers directly query global `databases.DB` singleton; business logic is embedded in HTTP handlers ([`authController.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/controllers/authController.go), [`orderController.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/controllers/orderController.go)). | Extract repository interfaces and use-case services feature by feature. Handlers must only parse requests and delegate to use cases. | Clean layered architecture (HTTP Transport -> Application Service -> Domain -> Repository Port -> SQLC Adapter). |
| **Database Access** | GORM ORM with GORM AutoMigrate and hardcoded connection string ([`conected.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/databases/conected.go)). Compilation error with undeclared `dsn`. | Fix `dsn` compilation bug immediately. Retain GORM only for un-migrated legacy tables; create new tables using raw SQL migrations. | Pure SQL queries compiled to type-safe Go via SQLC, with independent schema versioning via `goose` or `golang-migrate`. |
| **Backend Routing & Security** | Routes in [`routes.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/routes/routes.go) are open; [`authMiddleware`](file:///g:/react/next-go/Full-Stack-App-Store/backend/middlewares/authMiddleware.go) and [`permissionMiddleware`](file:///g:/react/next-go/Full-Stack-App-Store/backend/middlewares/permissionMiddleware.go) are defined but never mounted; single 24h JWT with hardcoded secret `"secret"`. | Phase 0: Mount `IsAuthenticated` to destructive routes (`DELETE`, profile `PUT`), move secret to `.env`.<br>Phase 3: Implement 15-min Access JWT + Opaque Refresh Token with DB rotation and multi-device session tracking. | Explicit Fiber route groups guarded by 15m Access JWTs, PostgreSQL-backed multi-device sessions with automatic reuse detection, and granular RBAC. |
| **Frontend State Management** | Ad-hoc mix of Client Component `useEffect` fetching, custom Server Actions, and uncoordinated state. TanStack Query and Redux Toolkit are absent. | Introduce TanStack Query for remote entity queries; migrate client-side state slices (cart, UI modals) to Redux Toolkit. | TanStack Query for all server state (queries, mutations, invalidations) and Redux Toolkit strictly for client/UI state. |
| **Frontend HTTP Transport** | Fragmented calls: some components fetch from `:3000/api/*` via Next rewrites, while Server Actions call `:8000` directly with scattered Axios logic. | Consolidate all frontend-to-backend communication through a single configured API client with standard interceptors and error normalization. | Unified centralized API client with environment-aware baseURL, standard error envelopes, and automated token handling. |
| **Layout & Navigation** | Duplicate `<SidebarProvider>` and `<AppSidebar>` rendered in both `app/layout.tsx` and `(main)/layout.tsx`. Inactive `proxy.ts`. Broken dead navigation links. | Remove inner duplicate sidebar from `(main)/layout.tsx`. Rename `proxy.ts` to `middleware.ts` with correct matcher. Prune dead nav links. | Unified, resilient layout hierarchy with active Next.js edge route protection and functional domain navigation. |
| **Testing Infrastructure** | Zero automated tests in backend or frontend. | Introduce Go test suite (`testify`) for auth/user use cases; introduce Vitest/React Testing Library for frontend primitives. | Comprehensive CI test matrix verifying unit logic, repository SQL, API contract integrity, and critical customer checkout flows. |
| **Configuration & Secrets** | Hardcoded secrets (`"secret"` JWT key in [`jwt.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/util/jwt.go)), hardcoded DB string, hardcoded ports `:8000` and `:3000`. | Move all secrets, ports, database credentials, and S3 credentials to `.env` files with sample `.env.example` templates. | Fully container-ready 12-factor configuration resolved strictly via environment variables. |
| **Containerization & Deployment** | No Dockerfiles; Windows binary committed to [`backend/tmp/main.exe`](file:///g:/react/next-go/Full-Stack-App-Store/backend/tmp/main.exe). No Docker Compose. | Author multi-stage Dockerfiles for backend and frontend. Create `docker-compose.yml` for local Postgres/Redis. Delete committed binary. | Multi-stage, non-root, reproducible container builds orchestrated locally by Docker Compose and deployed via automated CI/CD. |
| **Developer Workflows** | No `Makefile` or unified scripts; commands rely on memory and local setup. | Create root `Makefile` standardizing common operations (`make dev`, `make test`, `make lint`, `make migrate`). | Discoverable, deterministic developer toolchain with local-CI environment parity. |
| **CI/CD Automation** | Zero CI pipelines; pull requests and commits are completely unverified. | Create GitHub Actions workflows running linting, type checks, unit tests, and build validation on every PR. | Fail-fast CI/CD pipeline enforcing static analysis, test execution, security scans, container builds, and automated deployments. |
| **Caching & Rate Limiting** | No caching layer (Redis absent); no rate-limiting on sensitive endpoints (login, register, delete). | Implement in-memory or Redis-backed rate limiting on auth endpoints; introduce Redis caching for read-heavy catalog data. | Distributed Redis caching with explicit TTL/invalidation hooks, and distributed token-bucket rate limiting on sensitive routes. |
| **Operational Lifecycle** | No health check probes (`/health/live`, `/health/ready`); immediate ungraceful exit on server termination. | Implement health probe routes checking DB ping; add OS signal capture with Fiber `ShutdownWithTimeout`. | Production-grade Kubernetes/Docker readiness probes and graceful shutdown draining active connections. |
| **Background Processing** | Synchronous CSV file writing in [`orderController.go`](file:///g:/react/next-go/Full-Stack-App-Store/backend/controllers/orderController.go); no worker queues. | Wrap file generation in asynchronous job structures or separate worker processes. | Dedicated asynchronous worker queue with persistence, idempotency, exponential backoff, and dead-letter monitoring. |

---

## Quality Gates & Verification Standards

All future contributions must pass the following deterministic quality gates prior to integration:

```
[Code Contribution / Pull Request]
       │
       ▼
[Gate 1: Static Type, Lint & Compile Checks]
  • Backend: `go build ./...` passes with 0 errors
  • Backend: `golangci-lint run` passes cleanly
  • Frontend: `pnpm build` passes with 0 TypeScript/ESLint errors
  • Docker: `docker build` succeeds with multi-stage non-root images
       │
       ▼
[Gate 2: Architecture & Layer Boundary Check]
  • No database calls in Fiber controllers
  • No remote data stored directly in Redux
  • No direct un-intercepted Axios/fetch calls outside central client
  • No raw secrets or hardcoded connection strings
  • No in-memory process session storage (stateless backend)
       │
       ▼
[Gate 3: Automated Test Verification]
  • Associated unit, integration, and contract tests execute and pass
  • Migration scripts pass forward and rollback testing
  • No regressions in existing verified behavior
       │
       ▼
[Gate 4: Security & Contract Verification]
  • Dependency vulnerability checks pass (govulncheck / pnpm audit)
  • Secret scan clean (no credentials committed)
  • API request/response structures verified against OpenAPI contracts
  • No out-of-scope code refactoring or dead code re-introduction
       │
       ▼
[Accepted / Merged via CI]
```

---

## Governance

### 1. Precedence of the Constitution
This Constitution is the foundational architectural contract for the DashStack repository. It supersedes informal conventions, transient preferences, and individual development practices. All pull requests, code reviews, architectural discussions, and automated assistant workflows MUST verify compliance against this document.

### 2. Amendment Procedure
1. Any proposed modification or addition to these principles must be submitted as a formal constitutional amendment proposal documenting:
   - Specific principle(s) being altered.
   - Comprehensive technical and operational rationale.
   - Impact analysis on active migrations and codebase reality.
2. Amendments must be approved by repository maintainers and recorded in the Sync Impact Report at the top of this file.
3. Semantic versioning MUST be applied to the Constitution version:
   - **MAJOR**: Incompatible changes to core governance, removal of principles, or fundamental architectural pivots.
   - **MINOR**: Addition of new principles, domain definitions, or substantially expanded operational guidance.
   - **PATCH**: Non-semantic clarifications, typographical corrections, or wording refinements.

### 3. Periodic Compliance Review
A compliance audit MUST be conducted at each major milestone of the modernization roadmap to evaluate adherence, reassess Current Limitations against completed migrations, and update the migration gap matrix accordingly.

---

**Version**: 1.2.0 | **Ratified**: 2026-09-14 | **Last Amended**: 2026-09-14
