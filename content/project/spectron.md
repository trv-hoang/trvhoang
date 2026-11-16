---
title: "Spectron"
description: "ZetaMotion's AI visual inspection platform for factory production lines. I worked across the React dashboard, the Flask backend and the Python vision runtime."
status: "Live"
tags: ["React", "TypeScript", "Python", "Flask", "WebRTC", "OpenCV"]
type: "project"
group: "product"
highlights: ["WebRTC live camera view", "One interface instead of two", "Automatic report clean-up"]
weight: 6
role: "Software engineer (full-stack)"
duration: "Jul 2025 – now"
platform: "Web & edge devices"
---

## Overview

Spectron inspects products for surface defects on factory lines. Industrial cameras photograph each item, AI models on an edge machine find the defects, and operators run scans, watch the cameras live and review reports in a web dashboard. I worked on all three parts: the React dashboard, the Flask backend and the Python vision runtime.

### What I built

- **Live camera view** Replaced image polling at about 1 frame per second with a continuous WebRTC stream per camera (configured at 10 fps). I built the aiortc signalling endpoint and a custom video track in the Flask backend, and a React hook on the dashboard. It works offline on the factory network, with no STUN or TURN server.
- **One UI instead of two** Removed a legacy parallel version of the interface. I wrote the widget migration plan and moved it screen by screen with type-check gates, without losing a feature.
- **Disk safety on edge machines** A configurable report retention job, keep the last N reports on a validated cron schedule, that picks up config changes without a restart.
- **Inspection bugs** Fixed front-and-back scans resetting to the front side, and defect-map notes drifting between report tabs, by tracing each to its root cause.
- **AI-drafted operator guides** A prototype workflow where a writer agent and an independent reviewer agent draft user guides from the source code, with every claim traced to a file and line and gaps left for a person to fill.
