# Flow Structure Document
## BTbiz Pharmacy WhatsApp Communication System

---

## 1. System Overview

```mermaid
flowchart TB
    subgraph Patient["Patient (WhatsApp)"]
        P1[Send Hi / Menu / Prescription]
    end

    subgraph Meta["Meta Cloud API"]
        M1[Webhook]
        M2[Send Message API]
    end

    subgraph Backend["Express Backend"]
        B1[WhatsApp Service]
        B2[Bot Flow]
        B3[Order Service]
        B4[Notification Service]
    end

    subgraph DB["MongoDB"]
        D1[(Patients)]
        D2[(Conversations)]
        D3[(Messages)]
        D4[(Orders)]
    end

    subgraph Dashboard["Pharmacist Dashboard"]
        F1[Inbox]
        F2[Orders]
        F3[Settings]
    end

    P1 --> M1 --> B1
    B1 --> B2
    B1 --> B3
    B3 --> B4 --> M2 --> P1
    B1 --> D1 & D2 & D3
    B3 --> D4
    F1 & F2 & F3 --> Backend
    F1 --> M2
```

---

## 2. Patient WhatsApp Bot Flow

### 2.1 Greeting flow (patient sends "Hi")

```mermaid
sequenceDiagram
    participant P as Patient
    participant W as WhatsApp
    participant B as Bot

    P->>W: Hi
    W->>B: Webhook
    B->>P: Welcome text
    B->>P: Welcome image
    Note over B,P: 2.5 second delay
    B->>P: Service menu (View Services)
```

### 2.2 Service menu options

| # | Menu option | Bot action |
|---|-------------|------------|
| 1 | Upload Prescription | Ask for photo/PDF |
| 2 | Order Status | Show latest order status |
| 3 | Refill Medicine | Ask for prescription or medicine names |
| 4 | Check Medicine | Ask for medicine name → stock & price |
| 5 | Repeat Last Order | Create new order from last prescription |
| 6 | Store Location | Show address, hours, map link |
| 7 | FAQ Support | List all FAQs |
| 8 | Talk to Pharmacist | Notify team; patient can type question |

### 2.3 Prescription upload flow

```mermaid
flowchart LR
    A[Patient sends image/PDF] --> B[Download from Meta]
    B --> C[Save to /uploads]
    C --> D[Create Message in Inbox]
    D --> E[Create Order: prescription_received]
    E --> F[WhatsApp: Thank you + Order ref]
    F --> G[Pharmacist sees in Dashboard]
```

**Note:** No bot menu reply after prescription — order notification only.

### 2.4 Intent detection (text messages)

```mermaid
flowchart TD
    A[Incoming text] --> B{Button ID?}
    B -->|Yes| C[Map to intent]
    B -->|No| D[Keyword patterns]
    D --> E{Match?}
    E -->|Greeting| F[Greeting sequence]
    E -->|Order status| G[DB lookup]
    E -->|Medicine| H[Catalog search]
    E -->|Store/FAQ| I[Settings/FAQ]
    E -->|No match| J[FAQ match → Medicine search → Default reply]
```

---

## 3. Order Lifecycle Flow

### 3.1 Status transition diagram

```mermaid
stateDiagram-v2
    [*] --> prescription_received: Prescription uploaded

    prescription_received --> order_verified: Pharmacist verifies
    prescription_received --> prescription_rejected: Reject
    prescription_received --> order_cancelled: Cancel

    order_verified --> order_accepted: Accept
    order_verified --> prescription_rejected: Reject
    order_verified --> order_cancelled: Cancel

    prescription_rejected --> [*]

    order_accepted --> payment_pending: Need payment
    order_accepted --> order_processing: Skip payment
    order_accepted --> order_cancelled: Cancel

    payment_pending --> payment_confirmed: Payment received
    payment_pending --> order_cancelled: Cancel

    payment_confirmed --> order_processing

    order_processing --> order_ready_pickup: Pickup ready
    order_processing --> order_ready_delivery: Delivery ready
    order_processing --> order_cancelled: Cancel

    order_ready_pickup --> order_completed: Picked up
    order_ready_delivery --> out_for_delivery: Dispatched

    out_for_delivery --> order_completed: Delivered

    order_completed --> refill_reminder: 30 days later (cron)

    order_cancelled --> [*]
    refill_reminder --> [*]
```

### 3.2 Notification on status change

```mermaid
sequenceDiagram
    participant PH as Pharmacist
    participant D as Dashboard
    participant API as Backend
    participant W as WhatsApp
    participant P as Patient

    PH->>D: Click status button
    D->>API: PATCH /orders/:id/status
    API->>API: Validate transition
    API->>API: Save order + history
    alt USE_META_TEMPLATES=true & template exists
        API->>W: Send Meta template
    else
        API->>W: Send session text
    end
    W->>P: Status notification
    alt payment_pending
        API->>W: Payment link + QR image
        W->>P: Payment details
    end
    API->>D: Updated order
```

---

## 4. Payment Flow

```mermaid
flowchart TD
    A[Order → Payment Pending] --> B{Payment link in order?}
    B -->|No| C{Settings default?}
    C -->|Yes| D[Use pharmacy paymentLinkUrl]
    C -->|No| E[Error: configure in Settings]
    B -->|Yes| D
    D --> F[Send link text on WhatsApp]
    F --> G{QR available?}
    G -->|Settings QR| H[Send QR image]
    G -->|No QR| I[Auto-generate QR from link]
    H --> J[Patient pays]
    I --> J
    J --> K[Pharmacist → Payment Confirmed]
```

---

## 5. Dashboard Data Flow

```mermaid
flowchart LR
    subgraph Pages
        O[Overview]
        I[Inbox]
        OR[Orders]
        M[Medicines]
        S[Settings]
        PT[Patients]
    end

    subgraph APIs
        A1[/orders/stats]
        A2[/conversations + /messages]
        A3[/orders]
        A4[/medicines]
        A5[/pharmacies + /faqs]
        A6[/patients]
    end

    O --> A1
    I --> A2
    OR --> A3
    M --> A4
    S --> A5
    PT --> A6
```

---

## 6. Multi-Tenant Flow

```mermaid
flowchart TD
    A[Request with x-tenant-id header] --> B{Valid pharmacyId?}
    B -->|No| C[403 Forbidden]
    B -->|Yes| D[Filter all queries by pharmacyId]
    D --> E[Patients, Orders, Messages, Medicines, FAQs]
```

Each pharmacy has:
- Own WhatsApp `phone_number_id`
- Own patients, conversations, orders
- Own settings (payment, store, greeting, FAQs)

---

## 7. Refill Reminder Flow (Cron)

```
Daily 9:00 AM
    ↓
Find orders: status = order_completed
    AND refillDueAt <= today
    AND refillReminderSentAt is null
    ↓
For each order → send refill_reminder WhatsApp message
    ↓
Set refillReminderSentAt = now
```

---

## 8. Meta Template Flow (Optional)

**When:** `USE_META_TEMPLATES=true` AND template status = **Approved** on Meta

| Order status | Template name |
|--------------|---------------|
| order_verified | `order_verified` |
| prescription_rejected | `prescription_rejected` |
| order_accepted | `order_accepted` |
| order_ready_pickup | `order_ready_pickup` |
| order_ready_delivery | `order_ready_delivery` |
| order_cancelled | `order_cancelled` |
| order_completed | `order_completed` |
| payment_confirmed | `payment_confirmed` |
| refill_reminder | `refill_reminder` |

**Fallback:** If template send fails → session text from `order-notification.service.ts`

**Not using templates:** Bot greeting, menu, prescription_received, payment_pending, pharmacist manual replies

---

## 9. File / Media Flow

```
WhatsApp media (prescription)
    → Meta media API download
    → Backend/uploads/prescriptions/{pharmacyId}/
    → URL saved in Message.content
    → Dashboard Inbox: Open / Download

Settings image upload (QR, greeting)
    → POST /pharmacies/:id/upload-asset
    → Backend/uploads/
    → URL saved on pharmacy record
```

---

## 10. Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant L as Landing Page
    participant API as Backend
    participant D as Dashboard

    U->>L: Login / Register
    L->>API: POST /auth/login or /pharmacy-register
    API->>L: pharmacyId
    L->>L: Save to sessionStorage
    L->>D: Redirect /dashboard
    Note over U,D: Browser close → session cleared → login again
```
