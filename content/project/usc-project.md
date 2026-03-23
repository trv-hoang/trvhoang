---
title: "USC-Project - Smart Contract Security"
description: "Educational project demonstrating smart contract vulnerabilities and secure upgrade patterns — covering UUPS proxies, storage collision attacks, and implementation takeover risks using Solidity & Foundry."
status: "Completed"
tags: ["Solidity", "Foundry", "Blockchain", "Security"]
github: "https://github.com/trv-hoang/USC-Project"
type: "project"
weight: 5
role: "Solo Developer"
teamSize: "1"
duration: "2 months"
platform: "Blockchain"
---

## Overview

A security-focused educational project demonstrating smart contract vulnerabilities and best practices. The project showcases practical demonstrations of common attack vectors and their mitigations in the Ethereum ecosystem.

### Key Topics Covered

1. **Secure UUPS Upgrade Pattern** — proper EIP-1822 implementation following OpenZeppelin standards for safe contract upgrades
2. **Storage Collision Attack** — how incorrect storage layout can corrupt proxy contracts and lead to unauthorized access
3. **Uninitialized Implementation Attack** — methods attackers use to compromise unprotected implementation contracts

### Technical Details

- **16 comprehensive tests** across four test categories covering both vulnerable and secure implementations
- **Demo scripts** illustrating both proper upgrades and attack scenarios
- Built with **Foundry** (forge + anvil) for modern Solidity development and testing
- Uses **OpenZeppelin** libraries for secure contract patterns

### My Responsibilities

- Researched and documented common smart contract security vulnerabilities
- Built vulnerable contract examples alongside their secure counterparts
- Wrote comprehensive test suites to demonstrate each attack and its mitigation
- Created demo scripts for hands-on learning
