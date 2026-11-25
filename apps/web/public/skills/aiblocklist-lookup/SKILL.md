---
name: aiblocklist-lookup
description: Query AIBlockList behavioral intelligence for X and Meta Threads accounts, verify public evidence URLs, and check registry statistics.
---

# AIBlockList Lookup Skill

Use this skill to check whether an X or Meta Threads account is indexed on AIBlockList (`https://aiblocklist.com`), inspect public evidence URLs, or retrieve registry statistics.

## Endpoints

- **Lookup Account:** `GET https://aiblocklist.com/api/v1/accounts/{platform}/{username}`
  - `platform`: `x` or `threads`
  - `username`: handle without `@`
- **Search Registry:** `GET https://aiblocklist.com/api/v1/blocklists?platform=x&q={query}&limit=24`
- **Registry Statistics:** `GET https://aiblocklist.com/api/v1/statistics`
- **Submit Public Appeal:** `https://aiblocklist.com/appeals`

## Policy Note

AIBlockList supports people who use AI responsibly in everyday work and only filters automated reply bots farming impressions or monetization.
