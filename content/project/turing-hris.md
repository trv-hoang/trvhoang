---
title: "Turing HRIS"
description: "Turing Factor's HR system for Vietnamese companies. I built the employee app for attendance and leave, live leave approvals, and holidays that follow the lunar calendar."
status: "In Progress"
tags: ["Cloudflare Workers", "Hono", "Hotwire", "D1", "Durable Objects", "PWA"]
type: "project"
group: "turing"
cover: ["/images/projects/turing-hris/cover-approvals.jpg", "/images/projects/turing-hris/cover-holidays.jpg"]
coverType: "web"
gallery:
  - src: "/images/projects/turing-hris/01-approvals.jpg"
    caption: "Leave approvals: the manager step, then HR."
  - src: "/images/projects/turing-hris/02-holidays.jpg"
    caption: "Holidays from yearly rules, including lunar-calendar ones like Tết."
  - src: "/images/projects/turing-hris/03-chart.jpg"
    caption: "The org chart."
  - src: "/images/projects/turing-hris/04-report-leave.jpg"
    caption: "Leave balances by type and department."
  - src: "/images/projects/turing-hris/05-employees.jpg"
    caption: "The employee list."
weight: 4
role: "Full-stack developer"
teamSize: "3"
duration: "Jun – Oct 2026"
platform: "Web & PWA"
---

## Overview

Turing HRIS is the HR product Turing Factor sells: employee records, work schedules, attendance, leave and holidays, built for how Vietnamese companies work. It started as an attendance module, which went to production in mid-2026 with a first customer's real office data, and is now being rebuilt on our Fountainhead platform.

### What I built

- **Employee app** The installable phone app where employees request leave and managers approve it, with notification deep links. Page transitions, live list animations, skeleton loading and a pull-to-refresh that works on iOS make it feel native, with no animation library.
- **Live leave approvals** Before, everyone had to reload to see a new request or decision. A Durable Object WebSocket hub now pushes it to the open tabs of only the people it concerns.
- **Lunar-calendar holidays** Tết, the Hùng Kings' day and Mid-Autumn move every year. I ported Hồ Ngọc Đức's lunar algorithm and built rules that *propose* each year's dates for HR to confirm, checked against the published Tết dates for 2024–2028.
- **Statutory leave** The legal minimum per leave type under the Labour Code (Art. 113/114) can now only be raised, closing a path that let an admin lower a hazardous-work entitlement from 16 to 12 days a year.
- **Fixes that matter to HR** Holiday runs longer than 16 days failed because of D1's 100-parameter limit; they now save in one atomic batch. Approval history is rebuilt from the audit log, so a cancelled request no longer looks like it was passed to HR.
