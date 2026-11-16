---
title: "CRMatrix"
description: "An internal lead-to-deal CRM for 1Matrix on Cloudflare Workers. I built the sales analytics dashboard, full-text search and real-time notifications."
status: "Completed"
tags: ["TypeScript", "React Router", "Hono", "Cloudflare D1", "SQLite FTS5", "Durable Objects"]
type: "project"
kind: "product"
featured: true
cover: ["/images/projects/crmatrix/cover-dashboard.jpg", "/images/projects/crmatrix/cover-deals.jpg"]
coverType: "web"
gallery:
  - src: "/images/projects/crmatrix/01-dashboard.jpg"
    caption: "Sales dashboard: KPIs and pipelines for leads and deals."
  - src: "/images/projects/crmatrix/02-dashboard-revenue.jpg"
    caption: "Revenue by product group and customer group, expected and actual."
  - src: "/images/projects/crmatrix/03-deals.jpg"
    caption: "Deals on a kanban board by stage."
  - src: "/images/projects/crmatrix/04-leads.jpg"
    caption: "Leads."
  - src: "/images/projects/crmatrix/05-contacts.jpg"
    caption: "Contacts."
highlights: ["Analytics for 4 roles", "Full-text search on 4 record types", "Real-time notifications"]
weight: 3
role: "Full-stack developer"
teamSize: "3"
duration: "Jan – Aug 2026"
platform: "Web"
---

## Overview

CRMatrix is the internal CRM of 1Matrix (Vietnam Blockchain Association). It follows a contact from lead to opportunity to closed deal, with KPIs across the funnel and permissions for admins, managers, sales reps and viewers. It runs on Cloudflare Workers with D1, Hono and React Router. We were a team of three, and I took each epic from spec to plan, code, tests and pull request.

### What I built

- **Sales analytics** A dashboard with KPIs, the lead funnel and stage-to-stage conversion for 4 roles, scoped on the server so sales reps only ever see their own data. Revenue from each won deal is split across the product groups of its line items, and stays correct when the dashboard is filtered to one group.
- **Full-text search** Replaced `LIKE '%…%'` scans with ranked SQLite FTS5 search on contacts, leads, deals and companies. Records are indexed on every write, including writes from AI tools and the audit log, and related records are re-indexed when a contact's name changes.
- **Real-time notifications** A Durable Object per user pushes notifications over WebSockets that cost nothing while idle (Hibernation API), and the request that triggers a notification never waits for it.
- **Configuration without code** Pipeline stages, B2B types, lead sources and custom fields on 4 record types are now managed by admins instead of hard-coded.
