# CI/CD Pipeline & Quality Automation

## Overview

RoofToGrid uses automated GitHub Actions workflows to maintain code quality, zero-regression builds, and strict type safety across both frontend and backend codebases.

---

## Workflow Configuration (`.github/workflows/ci.yml`)

### Triggers
- Automatic execution on `push` to `main`.
- Automatic execution on `pull_request` targeting `main`.
- Manual workflow dispatch capability (`workflow_dispatch`).

---

## Automated Pipeline Jobs

### 1. Frontend Build & Static Analysis (`frontend-build`)
- **Environment**: Ubuntu Latest, Node.js 20.x with npm cache.
- **Tasks**:
  1. `npm ci`: Clean reproducible dependency installation.
  2. `next build`: Next.js production bundle compilation with Turbopack.
  3. Static generation validation: Asserts that all 34 routes (SSG, static pages, and dynamic endpoints) compile cleanly.
  4. TypeScript verification: Strict compiler check (`strict: true`).

### 2. Backend Tests & Database Schema Verification (`backend-test`)
- **Environment**: Ubuntu Latest, Node.js 20.x.
- **Tasks**:
  1. `npm ci`: Dependency installation.
  2. `npx prisma generate`: Prisma client generation from SQLite / PostgreSQL schema.
  3. `npm test`: Test suite execution across sizing calculators, quote normalization, and subsidy determination domain logic.
