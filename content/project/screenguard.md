---
title: "ScreenGuard"
description: "A macOS menu-bar app that finds and masks sensitive data in screenshots, entirely on your Mac. Not released yet."
status: "In Progress"
tags: ["Rust", "Tauri", "On-device OCR", "macOS"]
type: "project"
group: "side"
weight: 7
role: "Solo developer"
teamSize: "1"
duration: "Apr – Jul 2026"
platform: "macOS"
---

## Overview

People share screenshots of chats, terminals and forms all the time, and often leak an email, a card number or an API key by accident. ScreenGuard sits in the menu bar, picks up new screenshots from the clipboard or a folder, reads them with OCR that runs on the Mac, and masks what it finds before you share. Nothing leaves the machine and the original image is never stored.

### What I built

- **On-device pipeline** Capture, OCR, detect, merge and redact, in Rust with Tauri v2. Detectors run in parallel, and every stage falls back to the original screenshot rather than losing it.
- **11 kinds of sensitive data** Cards, emails, phone numbers, API keys, passwords, bank accounts, IP addresses, addresses, names and custom patterns. High-risk types are validated, for example with a Luhn check for cards and provider prefixes for AWS, Google, GitHub and Slack keys.
- **Vietnamese labels that survive OCR** OCR often drops Vietnamese accents (`KHÁCH` becomes `KH?CH`). Labels are matched with wildcard positions, and ALL-CAPS labels are told apart from names.
- **Review before masking** 4 redaction styles (blur, blackout, pixelate, pattern) and a preview where you keep or discard each detection.
