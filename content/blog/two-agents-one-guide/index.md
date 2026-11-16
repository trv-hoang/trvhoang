---
title: "Two agents, one user guide, and why they don't share notes"
date: 2026-11-16T17:00:00+07:00
draft: true
summary: "A routine Jira ticket became a pair of AI skills that write operator guides and review them independently. Most of the work was deciding who gets to see what."
tags: ["tech", "ai"]
coverImage: "/blog/two-agents-one-guide/cover.svg"
---

It started as a Jira ticket like any other. At [Zetamotion](/about/work/zetamotion/) I work on [Spectron](/project/spectron/), an AI system that inspects products for surface defects on factory lines. The people who run it need user guides, and the ticket was about drafting them with AI.

What came out is a pair of agent skills, `spectron-guide-writer` and `spectron-guide-reviewer`. Together they read the app's source code, take real screenshots, write a guide, review it independently, and export a Word file once a person approves it. They run in both Claude Code and Codex.

![Diagram: source code feeds the writer agent, which produces the guide and images plus private notes. The reviewer agent gets the guide, images and original source, but not the writer's notes. Findings either send corrections back to the writer or go to a person for approval, and only then is a Word file exported.](workflow.svg)

---

## From simple to too much

I went through a lot of versions. The first ones were simple: point an agent at the code and ask for a guide. Later ones went the other way, and I made the problem more complicated than it needed to be.

Every version pushed on the same three questions. How many tokens does this burn? How far can I trust the AI to check its own work? And how does a person check the result without redoing it?

---

## A reviewer that hasn't seen the answers

The writer and the reviewer are two fresh sub-agents in the same session. They share files, not reasoning.

The writer has to back every claim. It keeps a `facts.md` with stable IDs, each pointing to a file and line, a procedure, or a recorded observation. Anything it can't prove stays in the guide as an explicit `MISSING` marker instead of a confident guess. Even "this feature doesn't exist" needs the search scope behind it, not just a text search that found nothing.

The reviewer never sees any of that. It gets the finished guide, the images, the original source, and a small generated packet with scope and hashes. The writer's facts, its coverage ledger, the full metadata and earlier reviews are all withheld, because, as the skill puts it, they "can leak conclusions". The reviewer builds its own inventory from the source and compares. If any of the withheld files reach it anyway, it has to say so and call its result an advisory audit, not an independent review.

A reviewer that has read the writer's notes isn't really reviewing.

---

## Something a person can actually check

The last step belongs to a human. You read the guide and the review findings, then approve in your own words. The skill records that sentence, the date, and a hash of the exact content you approved. Change one line or one screenshot and the hash no longer matches, so it needs a new review and a new approval.

A guide that still has `MISSING` or `SCREENSHOT` markers can't get a normal Word export. It can only go out as a labelled internal test, and there is no `--draft` flag to skip that.

Token cost came down to the same idea. `SKILL.md` stays short and points to reference files that are only read when needed, like the screenshot rules when there are screenshots to plan. Approval and export live in one policy file instead of being repeated. The reviewer reads the shared writing rules from the writer's skill rather than its own copy. Each worker gets only its task and the original evidence. The less each agent is handed, the cheaper it runs and the more its review means.

---

## One more ticket

It was one ticket among many. But the more I worked on it, the more ways I found to make the product better, and most of them came back to the same question: who checks this, and what are they allowed to see?
