---
title: "Fountainhead"
description: "Turing Factor's multi-tenant SaaS platform on Cloudflare Workers. Every Turing product is a fork of it."
status: "In Progress"
tags: ["Cloudflare Workers", "Hono JSX", "Hotwire", "D1", "Drizzle", "SQLite FTS5", "PWA"]
type: "project"
group: "turing"
featured: true
cover: ["/images/projects/fountainhead/cover-overview.jpg", "/images/projects/fountainhead/cover-note.jpg"]
coverType: "web"
highlights: ["Custom roles with reach", "Per-tenant installable app", "Audit trail of refused access"]
gallery:
  - src: "/images/projects/fountainhead/01-overview.jpg"
    caption: "Overview of a furniture shop's work, with the PWA install prompt."
  - src: "/images/projects/fountainhead/02-notes.jpg"
    caption: "Records with custom fields: customer, value, department, urgent."
  - src: "/images/projects/fountainhead/03-note-detail.jpg"
    caption: "A record with its comment thread and activity feed."
  - src: "/images/projects/fountainhead/04-roles.jpg"
    caption: "Custom roles, each with its own colour and permissions."
  - src: "/images/projects/fountainhead/05-role-editor.jpg"
    caption: "The role editor."
  - src: "/images/projects/fountainhead/06-members.jpg"
    caption: "Members and the roles they hold."
weight: 2
role: "Core contributor (full-stack)"
teamSize: "3"
duration: "Aug 2026 – now"
platform: "Web & PWA"
---

## Overview

Fountainhead is the shared platform behind every Turing Factor product. It already holds what a B2B SaaS needs (sign-in, organisations, roles, audit, billing, search, jobs, real-time updates and a design system), so each product forks it and writes only its own code. It runs on a single Cloudflare Worker with server-rendered Hono JSX, Hotwire and D1. My co-founder Hieu leads the platform.

### What I built

- **Custom roles with reach** Organisations define their own roles, and each permission can reach *own*, *team* or *everyone's* records. The reach is enforced both in permission checks and in row-level query filters, with no way for a non-owner to escalate and no way to lock yourself out.
- **Installable app per tenant** Each organisation gets its own manifest and icons, generated in the browser from its logo because Workers has no image processing, and a service worker with an offline fallback that also covers Turbo's navigations.
- **Safer rich text** Fixed a stored denial of service, where one ~6 KB comment returned HTTP 500 to everyone who opened it, and a bug that rewrote notes saved without changes. The fix is an escape-first, allowlist-driven Markdown renderer with a nesting cap.
- **Search under concurrent writes** Out-of-order index writes are now rejected by a per-document revision, claimed together with the FTS5 update in one atomic D1 batch.
- **Audit of refused access** Every permission denial at 3 enforcement points is recorded and de-duplicated, without changing the response the user gets.
- **Kanban board** An accessible board for workflow records that works with a mouse, touch and the keyboard, re-checks every move on the server and adds no dependency.
