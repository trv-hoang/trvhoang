---
title: "Q Booking"
description: "An app for booking DJs, singers and MCs for events in Vietnam. I was the lead developer: mobile app, API and admin panel. Live on the App Store and Google Play, with 500+ users before handover."
status: "Live"
tags: ["Expo", "React Native", "TypeScript", "Cloudflare Workers", "Hono", "D1", "Workflows"]
appStore: "https://apps.apple.com/us/app/qbooking-app/id6778668023"
googlePlay: "https://play.google.com/store/apps/details?id=com.vn.qbooking.client"
type: "project"
kind: "product"
featured: true
cover: ["/images/projects/q-booking-home.jpg", "/images/projects/q-booking-bookings.jpg"]
highlights: ["500+ users before handover", "App Store & Google Play", "5 durable workflows"]
weight: 1
role: "Lead developer (full-stack)"
teamSize: "2"
duration: "Apr – Jul 2026"
platform: "iOS, Android & Web admin"
---

## Overview

In Vietnam, hiring a DJ, singer or MC for a wedding or a company event still happens over Facebook, Zalo and personal contacts. Q Booking puts the whole process in one app. Customers find an artist, send a request, get a quote, pay a 20% deposit straight to the artist and leave a review. Artists manage their portfolio, calendar and quotes. Admins verify artists' ID cards.

I built it for a client as the lead developer, on top of a colleague's scaffold and CI. The iOS app went live in June 2026 and the Android app followed on Google Play. It had more than 500 users when I handed it over to the client in September 2026.

### What I built

- **Booking lifecycle** Request, quote, deposit, confirmation, completion and review run as 5 durable Cloudflare Workflows. Deadlines reject, cancel or complete bookings on their own, multi-artist combos run as a saga with compensation, and reconcile sweeps recover any workflow a redeploy killed mid-sleep.
- **Double-booking fix** Two customers once held the same artist on the same date. I traced the race on production data, moved the date claim to booking creation (an atomic `INSERT … ON CONFLICT` plus re-read, since D1 has no interactive transactions) and added a reconciler that releases stale holds.
- **ID card protection** National ID photos are personal data under Decree 13/2023. Each file gets its own AES-256-GCM key, keys rotate without re-encrypting old files, image metadata is stripped before storage, and admins read the files only through a proxy.
- **Admin panel** Moved it to TanStack Start SSR behind a Cloudflare service binding, which removed the public admin API, its CORS rules and the tokens JavaScript could read.
- **Releases** EAS builds and over-the-air updates, App Store submissions and rejection fixes, the Android package migration, and a maintenance switch driven by feature flags.
