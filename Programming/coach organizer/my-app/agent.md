# Growial — Coach Edition

**Product brief · MVP scope**

---

## Table of contents

1. [Overview](#overview)
2. [Target users](#target-users)
3. [Core value proposition](#core-value-proposition)
4. [Product positioning](#product-positioning)
5. [Core MVP features](#core-mvp-features)
6. [Out of scope (MVP)](#out-of-scope-mvp)
7. [Design principles](#design-principles)

---

## Overview

Growial is like **Fiverr for coaches**: clients can search and find coaches on the platform, and coaches can organise everything inside one place—onboarding, tasks, reminders, and a simple client portal. It combines **discovery** (find coaches) with **execution** (run client journeys in-app).

**Access model:** Everyone must **log in**. There is no anonymous or one-way link. Clients can only join coaching via an **invitation** from a coach. Coach invites client → client signs up or logs in → client sees their portal and coaching content.

**What it does for coaches:**

- Invite clients (invitation-only; no public magic link)
- Onboard new clients and assign structured tasks and milestones
- Automate reminders and check-ins
- Track client progress and reduce churn
- Organise all client work inside the platform

**MVP assumption:** Clients join only when invited. Payments and billing are not part of the MVP.

---

## Target users

**In scope:**

- Solo coaches
- Business mentors
- Fitness coaches (online)
- Mindset and performance coaches
- Program-based educators (e.g. 8–12 week programs)

**Out of scope:**

- Agencies and large teams  
- **Positioning:** Built for simplicity and solo practitioners only.

---

## Core value proposition

> “Like Fiverr for coaches—find coaches here, and organise everything inside.”

**Discovery:** One place to search and find coaches; clients discover coaches on the platform (Fiverr for coaches).

**Execution:** Coaches and clients organise everything inside Growial:

- Coaches invite clients (invitation-only); clients must log in to access their coaching
- Every client follows the same proven structure; no steps forgotten
- Tasks, milestones, reminders, and client portal all in one place
- Coaches save time; retention improves

---

## Product positioning

- **Not Kajabi** — No course hosting or community.
- **Not HubSpot** — No CRM complexity or sales pipeline clutter.
- **Not Skool** — No community feed or course layers.

**What it is:** A discovery and client-journey platform—like Fiverr for coaches, with everything organised inside. Built for coaching workflows, quick to set up (~10 minutes), and focused on progress rather than leads. Login required; clients join only by invitation.

---

## Core MVP features

### 1. Prebuilt coaching flows

- **Templates:** 1:1 onboarding, 8–12 week program, high-ticket mentorship.
- **Per flow:** Welcome message, intro task (e.g. intake form), 3–5 milestones, weekly check-ins, final feedback.
- **Coach controls:** Drag-and-drop steps, edit copy, add or remove tasks, adjust timing. No complex automation builder.

### 2. Coach dashboard

- **Main view:** All active clients, current stage, upcoming tasks, clients stuck in a step.
- **Stages:** Onboarding → Active → At Risk → Completed (color-coded).
- **Goal:** Coach opens the dashboard and immediately sees who needs attention.

### 3. Client portal

- **Access:** Invitation-only. Coach sends an invitation; client must **sign up or log in** to access their coaching. No anonymous or one-way magic link.
- **Client can:** See current milestone, view and complete tasks, read coach messages, view progress bar—all after logging in.
- **Experience:** Clean, focused, minimal, and motivating.

### 4. Automated messaging (email only — MVP)

- **Triggers:** Invitation email; welcome after client accepts; reminder if task incomplete; check-in after milestone; “falling behind” nudge.
- **Personalization:** `{client_name}`, `{program_name}`, `{coach_name}`.
- **Scope:** Email only. No SMS or Slack in MVP.

### 5. Lightweight analytics

- Completion rate per client
- Average time to finish onboarding
- Drop-off points and clients inactive for X days  
- **Approach:** Useful signals only; no heavy charts.

### 6. V1 integrations (optional / later)

- Google Calendar (tasks), Calendly (appointments), Slack (notifications).
- Later: Stripe, Twilio, Notion, HubSpot for advanced flows.

---

## Out of scope (MVP)

The following are explicitly **not** in the MVP:

| Area | Not in MVP |
|------|------------|
| Monetization | Payments, billing |
| Content | Course hosting, video streaming |
| Community | Community feed |
| CRM | Full contact management, pipeline CRM |
| Advanced | AI coaching tools, multi-team support |

---

## Design principles

- **Audience:** Focus on coaches (and clients finding coaches), not agencies.
- **Access:** Login required. No one-way or anonymous links; clients get into coaching only via a coach’s invitation.
- **Scope:** Discovery (Fiverr for coaches) + execution (organise everything inside). No community, courses, or payments in MVP.
- **Simplicity:** Setup in under 10 minutes; no complex builders.
- **Discovery:** Like Fiverr for coaches—people search for coaches and find them on the platform; coaches organise all client work inside.
- **Experience:** The product should feel straightforward and “magical” for a coach to save time.
- **Company:** DesignAxe.
