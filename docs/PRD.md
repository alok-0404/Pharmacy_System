# Product Requirements Document (PRD)
## BTbiz Pharmacy WhatsApp Communication System

**Product:** BTBIZ Pharmacy AI Assistant  
**Version:** 1.0  
**Live URL:** https://pharmacy-system.replit.app  
**Last updated:** June 2025  

---

## 1. Executive Summary

BTbiz Pharmacy Communication System is a **multi-tenant WhatsApp-first platform** that connects pharmacies with patients for prescription uploads, order tracking, medicine inquiries, payments, and pharmacist support — all from a single dashboard.

The product targets **Ayudha Pharmacy / BTbiz** partner pharmacies that want to digitize patient communication without forcing patients to install an app. Patients use **WhatsApp**; pharmacists use a **web dashboard**.

---

## 2. Problem Statement

| Problem | Impact |
|---------|--------|
| Patients send prescriptions on WhatsApp with no structured workflow | Lost orders, manual tracking |
| No central inbox for pharmacy staff | Messages scattered across phones |
| Order status updates are manual | Patients call repeatedly for updates |
| Payment collection is unstructured | Delayed confirmations |
| Medicine availability queries are repetitive | Staff time wasted |
| No refill reminders | Missed repeat business |

---

## 3. Goals & Success Metrics

### Business goals
- Reduce prescription-to-order processing time
- Increase patient satisfaction via automated WhatsApp updates
- Enable pharmacists to manage all conversations from one dashboard
- Support multiple pharmacies on one platform (multi-tenant)

### Success metrics (KPIs)
| Metric | Target |
|--------|--------|
| Prescription received → order created | Automatic within seconds of WhatsApp upload |
| Order status notification delivery | 95%+ when WhatsApp connected |
| Pharmacist response from dashboard | Delivered to patient WhatsApp |
| Refill reminder sent | Daily cron for eligible completed orders |
| Dashboard session security | Re-login required after browser close |

---

## 4. User Personas

### 4.1 Patient (WhatsApp user)
- **Channel:** WhatsApp only (no login)
- **Needs:** Upload prescription, check order status, pay, ask medicine price, get store info, talk to pharmacist
- **Technical level:** Low — expects simple chat and buttons

### 4.2 Pharmacist / Pharmacy staff (Dashboard user)
- **Channel:** Web dashboard
- **Needs:** View inbox, reply to patients, manage orders, update status, send payment details, manage medicines & FAQs
- **Technical level:** Medium — comfortable with web apps

### 4.3 Pharmacy admin (Owner)
- **Channel:** Web dashboard + Settings
- **Needs:** Configure store info, payment link/QR, greeting image, FAQs, WhatsApp integration
- **Technical level:** Medium

---

## 5. Product Scope

### 5.1 In scope (v1 — built)

| Module | Features |
|--------|----------|
| **Authentication** | Pharmacy login/register; session-based auth (sessionStorage) |
| **WhatsApp Bot** | Greeting + welcome image, service menu, intent detection, auto-replies |
| **Prescriptions** | Image/PDF receive via WhatsApp; save to inbox; auto-create order |
| **Orders** | 13-status lifecycle; timeline; status transitions; notifications |
| **Payments** | Payment link + QR via WhatsApp; Settings defaults; per-order override |
| **Inbox** | Unified chat (patient, bot, pharmacist); media preview; download |
| **Medicines** | Catalog CRUD; bot availability lookup |
| **FAQs** | CRUD; keyword matching in bot |
| **Patients** | Manual add; start conversation |
| **Refill** | Daily 9 AM cron reminder for completed orders |
| **Meta templates** | Optional (`USE_META_TEMPLATES=true`) for approved order notifications |
| **Multi-tenant** | Pharmacy isolation via `pharmacyId` / `x-tenant-id` |

### 5.2 Out of scope (v1)

- Patient mobile app
- Full JWT auth on frontend API
- Role-based access (pharmacist vs admin) enforcement
- Inventory ERP integration
- Delivery partner API (Swiggy, Dunzo, etc.)
- Meta template management UI inside dashboard
- Hindi/regional language bot (English-first)

---

## 6. Functional Requirements

### 6.1 WhatsApp Bot

| ID | Requirement | Priority |
|----|-------------|----------|
| BOT-01 | Respond to greeting (Hi/Hello) with welcome text + image + service menu | P0 |
| BOT-02 | Interactive service menu with 8 options | P0 |
| BOT-03 | Accept prescription as image or document (JPG, PNG, PDF, etc.) | P0 |
| BOT-04 | Auto-create order on prescription upload | P0 |
| BOT-05 | Return latest order status on request | P0 |
| BOT-06 | Medicine availability lookup from catalog | P1 |
| BOT-07 | Repeat last order from previous prescription | P1 |
| BOT-08 | Store location, hours, map from Settings | P1 |
| BOT-09 | FAQ keyword matching | P1 |
| BOT-10 | Talk to pharmacist — flag for human follow-up | P1 |

### 6.2 Order Management

| ID | Requirement | Priority |
|----|-------------|----------|
| ORD-01 | 13 order statuses with defined transitions | P0 |
| ORD-02 | WhatsApp notification on every status change | P0 |
| ORD-03 | Prescription preview in Orders and Inbox | P0 |
| ORD-04 | Rejection reason on prescription rejected | P0 |
| ORD-05 | Payment pending → auto-send link + QR | P0 |
| ORD-06 | Refill reminder 30 days after completion | P1 |
| ORD-07 | Optional Meta template for status notifications | P2 |

### 6.3 Dashboard

| ID | Requirement | Priority |
|----|-------------|----------|
| DASH-01 | Overview stats (orders, patients, revenue) | P0 |
| DASH-02 | Inbox with scrollable chat | P0 |
| DASH-03 | Pharmacist reply → WhatsApp delivery | P0 |
| DASH-04 | Simulate patient (inbox test only) | P2 |
| DASH-05 | Medicines catalog management | P1 |
| DASH-06 | Settings: store, payment, FAQ, image upload | P0 |

---

## 7. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Availability** | VM deployment (Replit) for 24/7 webhook |
| **Security** | Tenant isolation; secrets in env; sessionStorage for auth |
| **Performance** | Webhook response < 5s; media download async |
| **Scalability** | Multi-tenant MongoDB; indexed queries |
| **Media** | `/uploads` served statically; `APP_PUBLIC_URL` for Meta access |
| **Compliance** | Prescription data stored per pharmacy; soft delete on models |

---

## 8. Technical Architecture

```
Patient (WhatsApp)
       ↓
Meta Cloud API (Webhook)
       ↓
Express Backend (Bot + Orders + Notifications)
       ↓
MongoDB (Pharmacy, Patient, Conversation, Message, Order, Medicine, FAQ)
       ↑
React Dashboard (Pharmacist)
```

**Stack:** React 19 + Vite + Tailwind | Express + TypeScript + Mongoose | Meta WhatsApp Cloud API | MongoDB Atlas

---

## 9. Integrations

| Integration | Purpose |
|-------------|---------|
| Meta WhatsApp Cloud API | Inbound/outbound messages, media, templates |
| MongoDB Atlas | Primary database |
| QR code generation | Auto-generate payment QR from link |

---

## 10. Environment & Configuration

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | Database |
| `META_ACCESS_TOKEN` | Send/receive WhatsApp |
| `META_VERIFY_TOKEN` | Webhook verification |
| `APP_PUBLIC_URL` | Public URL for media links |
| `USE_META_TEMPLATES` | Enable Meta-approved templates |
| `META_TEMPLATE_LANGUAGE` | Template language (e.g. `en`) |

Pharmacy-level (database): payment link, QR image, greeting image, store info, WhatsApp phone number ID.

---

## 11. Release Phases

| Phase | Delivered |
|-------|-----------|
| **Phase 0** | Auth, pharmacy setup, WhatsApp webhook |
| **Phase 1** | Bot service menu, store info, FAQs, order lifecycle |
| **Phase 2** | Medicine catalog, repeat order, payment QR |
| **Phase 3** | Inbox UX, media download, Meta template support (optional) |

---

## 12. Open Items / Future Roadmap

- [ ] Meta templates fully approved and `USE_META_TEMPLATES=true` in production
- [ ] JWT-based API auth
- [ ] Role-based permissions (admin vs pharmacist)
- [ ] Persistent file storage on Replit (uploads survive redeploy)
- [ ] Analytics dashboard
- [ ] Multi-language bot (Hindi)
- [ ] Delivery tracking link integration

---

## 13. Appendix — Order Status List

1. Prescription Received  
2. Order Verified  
3. Prescription Rejected  
4. Order Accepted  
5. Payment Pending  
6. Payment Confirmed  
7. Order Processing  
8. Ready for Pickup  
9. Ready for Delivery  
10. Out for Delivery  
11. Order Completed  
12. Order Cancelled  
13. Refill Reminder  

See `docs/FLOW-STRUCTURE.md` for transition diagram.
