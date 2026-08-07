<!--
Sync Impact Report
- Version change: 1.0.0 -> 1.1.0
- Modified principles: none
- Added principles:
  - VI. Container-Only Execution
- Added sections: none
- Removed sections: none
- Follow-up TODOs: none
-->
# Revi Constitution

## Core Principles

### I. Domain-Driven Design
The codebase MUST model the business domain explicitly. Domain terminology used by stakeholders MUST
be used consistently in specifications, types, modules, tests, and interface text. Business rules
MUST live in the domain layer and MUST NOT depend on React, browser APIs, transport formats, or
persistence details. Each bounded context MUST have a clear responsibility and explicit contracts at
its boundaries. Shared abstractions MUST be introduced only when they represent a genuine shared
domain concept, not merely similar implementation. This keeps business knowledge visible and prevents
framework concerns from dictating the model.

### II. Expressive, Maintainable Code
Code MUST communicate intent through precise domain names, small cohesive units, explicit types, and
simple control flow. Comments MUST explain decisions or constraints, never compensate for unclear
code. Functions and components MUST have one clear reason to change; dependencies MUST point toward
stable domain abstractions. Duplication MAY remain when removing it would create a misleading or
premature abstraction. Implementations MUST follow Clean Code practices, SOLID where applicable,
YAGNI, and the simplest design that preserves domain boundaries. A future change to one responsibility
MUST be possible without unrelated edits across the codebase.

### III. Tests Are a Delivery Requirement
Every business rule and defect fix MUST be covered by an automated test that fails without the intended
behavior. Domain logic MUST have fast unit tests; component behavior MUST be tested through observable
user outcomes; integration tests MUST cover boundaries such as browser storage, network clients, and
cross-module contracts. Tests MUST be deterministic, isolated, readable as behavioral documentation,
and independent of implementation details. The test suite, type checking, and static analysis MUST
pass before a change is merged. Critical user journeys MUST have end-to-end coverage when they are
introduced. Coverage percentages MUST inform review but MUST NOT substitute for meaningful assertions.

### IV. Consistent and Accessible User Experience
The interface MUST use a shared design language for spacing, typography, color, controls, feedback,
loading, empty, and error states. Equivalent actions MUST behave and read consistently throughout the
product. All interactive experiences MUST support keyboard operation, visible focus, semantic HTML,
appropriate labels, and sufficient color contrast, targeting WCAG 2.2 AA. Responsive behavior MUST be
defined and verified for supported viewport sizes. User-facing changes MUST include explicit acceptance
criteria for success, failure, loading, empty, and recovery paths. Internal domain names MUST be
translated into language users understand when the terms differ.

### V. Measured Performance and Simplicity
Performance requirements MUST be defined as measurable budgets for each user-critical flow before
optimization work begins. Production builds MUST avoid unnecessary dependencies, rendering, network
requests, and shipped JavaScript. Components MUST minimize avoidable re-renders; expensive computation
and data loading MUST be measured before adding caching or memoization. Regressions against an agreed
budget MUST block release unless explicitly documented and approved. Performance techniques MUST NOT
obscure domain intent without profiling evidence and a recorded trade-off.

### VI. Container-Only Execution
All application execution and project tooling MUST run inside Docker containers. This includes
dependency installation, development servers, builds, tests, linting, formatting, type checking,
code generation, database operations, and production runtime. Developers MUST NOT depend on locally
installed Node.js, package managers, or project-specific toolchains. The host environment MAY provide
only Docker, Docker Compose, Git, and an editor or IDE. Container images, Compose configuration, lock
files, environment examples, and documented commands MUST be sufficient to reproduce the same workflow
on a clean machine. This prevents host-specific behavior and keeps development, CI, and production
execution aligned.

## Technology and Architecture Constraints

- The application MUST be built with React and MUST NOT use Next.js.
- Framework-specific code MUST remain at the application boundary; domain modules MUST be plain
  TypeScript or JavaScript and independently testable.
- TypeScript SHOULD be the default language. Any choice to use untyped JavaScript MUST be justified in
  the implementation plan with equivalent validation safeguards.
- Routing, data access, state management, styling, build tooling, and test tooling MUST be selected in
  the feature plan based on demonstrated needs; libraries MUST NOT be added speculatively.
- UI components MUST be organized by domain capability or cohesive product area, not by arbitrary
  technical categories alone.
- Public module contracts MUST be explicit. Circular dependencies and imports that bypass a module's
  public boundary are prohibited.
- Docker Compose MUST provide the canonical commands for installing dependencies, running the
  development server, testing, linting, type checking, building, and any supporting services.
- Dependencies and generated artifacts MUST be created by containers. Files written to mounted host
  volumes MUST use permissions that remain editable by the developer and MUST NOT require a local
  project runtime.
- CI and production MUST build from the same versioned Docker definitions used for development, with
  environment-specific configuration supplied externally rather than baked into images.

## Development Workflow and Quality Gates

Each feature MUST begin with observable acceptance criteria and relevant domain terminology. The plan
MUST identify bounded contexts, affected contracts, accessibility behavior, test strategy, and any
performance budget. Implementation MUST proceed in small, reviewable increments, with refactoring kept
behavior-preserving and covered by tests.

Before merge, reviewers MUST verify:

1. Domain rules remain independent of React and infrastructure concerns.
2. Names and module boundaries make intent clear without explanatory comments.
3. Automated tests cover the new behavior, boundary failures, and regression risk.
4. User states and accessibility requirements are complete and consistent.
5. Performance budgets are met or an exception is measured, justified, and approved.
6. Type checking, linting, tests, and the production build complete successfully.
7. Every project command used by the change executes through the documented Docker or Docker Compose
   workflow without requiring a locally installed project runtime.

Complexity, new dependencies, and exceptions to these gates MUST be documented in the plan with the
rejected simpler alternative and a migration or removal path when temporary.

## Governance

This constitution is the highest-priority engineering guidance for Revi. Specifications, plans, tasks,
implementations, and reviews MUST demonstrate compliance. When another project document conflicts with
this constitution, this constitution prevails.

Amendments MUST be proposed as a documented change that states the rationale, affected principles,
migration impact, and adoption date. Approval requires explicit project-owner review. Existing work
affected by an amendment MUST receive a migration plan or a documented, time-bounded exception.

Constitution versions follow semantic versioning: MAJOR for incompatible governance or principle
changes, MINOR for new principles or materially expanded obligations, and PATCH for clarifications that
do not change obligations. Every feature plan and code review MUST include a constitution compliance
check. Exceptions MUST identify an owner, justification, scope, and expiry condition; silent exceptions
are prohibited.

**Version**: 1.1.0 | **Ratified**: 2026-08-07 | **Last Amended**: 2026-08-07
