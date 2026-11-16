---
title: "NOAA Weather Analytics"
description: "A Big Data course project: yearly temperature statistics for every NOAA weather station, computed with Hadoop MapReduce and stored in HBase."
status: "Completed"
tags: ["Java", "Hadoop", "MapReduce", "HBase", "Python", "Docker"]
github: "https://github.com/kimson99/big-data-noaa"
type: "project"
group: "study"
weight: 11
role: "MapReduce & HBase"
teamSize: "3"
duration: "3 months"
platform: "CLI"
---

## Overview

A course project for Big Data at UIT, in a team of three. It processes NOAA's GHCN-Daily climate records to show how temperatures change over time at each station.

### What I did

- **MapReduce job** Filters the daily minimum and maximum temperatures by their quality flag and computes the yearly maximum, minimum and average for each station, keyed by `StationID#Year`.
- **HBase output** Writes the results to HBase for the team's command-line tool and trend chart to read.
