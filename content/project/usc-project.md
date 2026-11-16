---
title: "EADF: Smart Contract Upgrade Analysis"
description: "My graduation thesis at UIT: a static-analysis framework that compares two versions of an upgradeable smart contract and flags the vulnerabilities the upgrade introduced."
status: "Completed"
tags: ["Python", "Slither", "Solidity", "Foundry", "Security"]
github: "https://github.com/trv-hoang/USC-Project"
type: "project"
group: "study"
weight: 8
role: "Sole author"
teamSize: "1"
duration: "Oct 2025 – Jun 2026"
platform: "CLI & web demo"
---

## Overview

Upgradeable smart contracts keep their address and data while their code is replaced through a proxy. Each upgrade can bring new vulnerabilities that tools looking at one version at a time do not see as *caused by the upgrade*: storage layouts that collide between versions, an upgrade function anyone can call, an implementation left uninitialised. My thesis, supervised by Dr. Phan Thế Duy, models how security changes from version to version and builds EADF, a framework that finds those risks.

### What I built

- **EADF** A Python pipeline on top of Slither that compares the storage layouts, syntax trees and detector findings of V1 and V2, with 3 detectors written for cross-version issues.
- **Results** On an 18-pair benchmark I built, EADF caught all 15 upgrade-specific issues where Slither alone caught none, and classified the kind of upgrade correctly on 18 of 18 pairs (Slither: 7). The benchmark is small and synthetic, so I report this as a best-case ceiling.
- **Evaluation harness** A ground-truth manifest and an `eadf evaluate` command that reports precision, recall, F1 and accuracy against a baseline.
- **Attacks and costs** Reproduced storage-collision, uninitialised-implementation and unauthorised-upgrade attacks in Foundry, and measured that a hardened UUPS proxy costs about 2.1× the deployment gas of a naive one.
