---
title: "Software Engineer at Zetamotion"
company: "Zetamotion"
logo: "/images/company-zetamotion.webp"
location: "Remote, United Kingdom"
roles:
  - title: "Software Engineer"
    period: "Jul 2025 – Present"
    description: "Working on Spectron, an AI system that inspects products on factory lines: live WebRTC camera streams, one unified dashboard, and a retention job that keeps edge machines healthy."
tags: ["WebRTC", "React", "TypeScript", "Python", "Flask", "Computer Vision"]
type: "work"
url: "/about/work/zetamotion/"
weight: 1
---

## Overview

At Zetamotion I work on Spectron, an AI system that inspects products for surface defects on factory lines. I work across the React dashboard, the Flask backend and the Python vision runtime, picking up bugs and features from the team's tracker.

### What I do

- **Live camera view** Replaced ~1 fps image polling with a continuous WebRTC stream per camera: an aiortc signalling endpoint and video track in Flask, and a React hook on the dashboard. It runs offline on the factory network.
- **One interface** Removed a legacy parallel version of the UI by planning the widget migration and moving it screen by screen, without losing a feature.
- **Edge machines** A configurable report retention job on a cron schedule, so inspection machines never run out of disk.
- **Inspection bugs** Fixed scans resetting to the front side and defect-map notes drifting between report tabs.
- **AI-drafted guides** Prototyped writer and reviewer agents that draft operator guides from the source code, with every claim traced to a file and line.

More detail on the [Spectron project page](/project/spectron/).
