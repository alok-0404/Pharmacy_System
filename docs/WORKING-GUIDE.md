# Working Guide — Click-by-Click
## BTbiz Pharmacy Dashboard & WhatsApp Bot

**Live app:** https://pharmacy-system.replit.app  

This document explains **what happens when you click or do each action** — for pharmacists, admins, and patients.

---

## Part A — Patient (WhatsApp)

### A1. Patient sends "Hi" / "Hello"

| Step | What happens |
|------|--------------|
| 1 | Meta sends webhook to server |
| 2 | Patient auto-created if new (by mobile number) |
| 3 | Conversation opened in database |
| 4 | Bot sends: **Welcome text** ("Welcome to {pharmacy}! 👋") |
| 5 | Bot sends: **Welcome image** (Ayudha/BTbiz banner) |
| 6 | After 2.5 sec: **Service menu** ("View Services" button) |
| 7 | All messages appear in **Dashboard → Inbox** |

---

### A2. Patient taps "View Services" → selects option

| Menu click | Bot reply | Dashboard effect |
|------------|-----------|------------------|
| **Upload Prescription** | "Please send photo or PDF..." | None until file sent |
| **Order Status** | Latest order status OR "no order found" + menu | None |
| **Refill Medicine** | Ask for prescription or medicine names | None |
| **Check Medicine** | "Type medicine name..." | None |
| **Repeat Last Order** | New order created OR "no previous order" | **New order** in Orders |
| **Store Location** | Address, hours, map from Settings | None |
| **FAQ Support** | List of all FAQs | None |
| **Talk to Pharmacist** | "Pharmacist will respond shortly..." | Message in Inbox for staff |

---

### A3. Patient sends prescription (image or PDF)

| Step | What happens |
|------|--------------|
| 1 | File downloaded from Meta → saved to server |
| 2 | Message saved in Inbox (image preview + Open/Download) |
| 3 | **Order created** — status: Prescription Received |
| 4 | WhatsApp: "Thank you! Prescription received. Order ref: #XXXXXX" |
| 5 | Order appears in **Dashboard → Orders** |
| 6 | **No bot menu** after prescription (only confirmation) |

---

### A4. Patient types medicine name (e.g. "Paracetamol")

| Step | What happens |
|------|--------------|
| 1 | Bot searches **Medicines** catalog |
| 2 | If found: price, stock, unit |
| 3 | If not found: "not in catalog" + suggest Menu |

---

### A5. Patient receives order updates

| Trigger | Patient gets on WhatsApp |
|---------|------------------------|
| Pharmacist changes order status | Status message (text or Meta template) |
| Status → Payment Pending | Payment link text + QR image |
| 30 days after Order Completed | Refill reminder (daily cron 9 AM) |

---

## Part B — Landing Page (`/`)

| Action | What happens |
|--------|--------------|
| **Login** | Modal → email/password → sessionStorage saves pharmacyId → redirect `/dashboard` |
| **Register** | Create pharmacy + admin user → auto login → `/dashboard` |
| Already logged in | `/` redirects to `/dashboard` |
| **Close browser** | sessionStorage cleared → must login again |

---

## Part C — Dashboard Overview (`/dashboard`)

| Element | Click / View | What happens |
|---------|--------------|--------------|
| **Total Orders** card | View only | Shows count from database |
| **Active Patients** | View only | Patient count |
| **Pending Prescriptions** | View only | Orders in prescription_received / order_verified |
| **Active Deliveries** | View only | Orders in processing/delivery states |
| **Revenue** | View only | Sum of confirmed payments |
| **Recent Activity** | View only | Last 5 order updates |
| **Open Inbox** link | Click | Navigate to `/dashboard/inbox` |

---

## Part D — Inbox (`/dashboard/inbox`)

### D1. Left panel — Conversation list

| Action | What happens |
|--------|--------------|
| **Refresh** (↻) | Reload all conversations from API |
| **Click conversation** | Opens chat on right panel |
| Patient name / mobile | Display only |

### D2. Right panel — Chat header

| Display | Meaning |
|---------|---------|
| Green: "WhatsApp connected · webhook active" | Meta tokens + pharmacy number configured |
| Amber: "WhatsApp not fully connected" | Check Settings / env variables |

### D3. Chat messages

| Message type | What you see | Actions |
|--------------|--------------|---------|
| Text | Message bubble | Read only |
| Prescription image | Image preview | **Open in new tab** · **Download** |
| PDF / document | File card | **Open in new tab** · **Download** |
| Bot message | Grey bubble (left) | Read only |
| Your reply | Purple bubble (right) | Read only |

### D4. Bottom bar

| Action | What happens |
|--------|--------------|
| **Simulate patient** | Opens modal → type test message → saved as PATIENT in inbox only (**does NOT go to WhatsApp, does NOT trigger bot**) |
| **Type reply + Send** | Message saved → sent to patient **WhatsApp** (if connected) → toast: "Sent to patient" or warning |
| **Enter key** | Same as Send |

---

## Part E — Orders (`/dashboard/orders`)

### E1. Order list (left)

| Action | What happens |
|--------|--------------|
| **Click order** | Detail panel opens on right |
| Status badge | Current order status |

### E2. Order detail (right)

| Element | What happens |
|---------|--------------|
| **Prescription** | Image/PDF with Open & Download |
| **Open in Inbox →** | Link to inbox (same conversation) |
| **Status timeline** | History of all status changes with timestamps |

### E3. Update status buttons

| Action | What happens |
|--------|--------------|
| Click status button (e.g. **Order Verified**) | API validates transition → order updated → **WhatsApp notification to patient** → timeline updated |
| **Prescription Rejected** | Enter rejection reason first → sent in notification |
| **Payment Pending** | Enter amount (optional), link & QR prefilled from Settings → status change → **auto-sends payment link + QR on WhatsApp** |

### E4. Payment Pending section

| Action | What happens |
|--------|--------------|
| Fields prefilled | From Settings default payment link & QR |
| Edit link/QR | Override for this order only |
| **Send Payment Link & QR** | Resends to patient WhatsApp (even if already sent) |
| **Change defaults** link | Goes to Settings |

---

## Part F — Medicines (`/dashboard/medicines`)

| Action | What happens |
|--------|--------------|
| **Add medicine** | Fill name, unit, price, stock → Save → bot can answer availability |
| **Delete** (trash icon) | Removes from catalog → bot won't find it |
| Patient asks on WhatsApp | Bot uses this catalog for Check Medicine & text queries |

---

## Part G — Patients (`/dashboard/patients`)

| Action | What happens |
|--------|--------------|
| **Add patient** | Name, mobile, email → saved to database |
| **Start chat** | Creates conversation → opens Inbox |
| WhatsApp patient | Auto-created when they first message — no manual add needed |

---

## Part H — Settings (`/dashboard/settings`)

### H1. Store location & hours

| Action | What happens |
|--------|--------------|
| Fill address, hours, map URL | Saved to pharmacy record |
| **Welcome image URL** | Image sent on patient Hi (or upload from device) |
| **Upload from device** | Image uploaded to server → URL auto-filled |
| **Save store settings** | Bot uses for Store Location + greeting |
| Patient taps Store Location | Bot shows saved address, hours, map |

### H2. FAQ support

| Action | What happens |
|--------|--------------|
| **Add FAQ** | Question + answer + keywords |
| Patient asks matching question | Bot replies with FAQ answer |
| Patient taps FAQ Support | Bot lists all FAQs |

### H3. Payment settings

| Action | What happens |
|--------|--------------|
| **Payment link** | Default link for all Payment Pending orders |
| **QR image** | URL or upload from device |
| **Save payment settings** | Used when order moves to Payment Pending |

### H4. WhatsApp integration box

| Display | Meaning |
|---------|---------|
| Green box | Server tokens + pharmacy WhatsApp number ID configured |
| Amber box | Configure Meta tokens and Phone Number ID |

---

## Part I — Sidebar

| Click | Goes to |
|-------|---------|
| Overview | `/dashboard` |
| Inbox | `/dashboard/inbox` |
| Orders | `/dashboard/orders` |
| Medicines | `/dashboard/medicines` |
| Patients | `/dashboard/patients` |
| Settings | `/dashboard/settings` |
| **Logout** | Clears session → Landing page `/` |

---

## Part J — Who replies when? (Quick reference)

| Situation | Who replies | Channel |
|-----------|-------------|---------|
| Patient says Hi | **Bot** | WhatsApp |
| Patient uploads prescription | **Bot** (confirmation) | WhatsApp |
| Patient asks order status | **Bot** (from database) | WhatsApp |
| Patient asks medicine price | **Bot** (from catalog) | WhatsApp |
| Order status changed | **Bot** (notification) | WhatsApp |
| Payment pending | **Bot** (link + QR) | WhatsApp |
| Patient asks custom question | **Pharmacist** (manual from Inbox) | WhatsApp |
| Simulate patient in Inbox | **Nobody** | Dashboard only |
| Refill reminder (30 days) | **Bot** (cron job) | WhatsApp |

---

## Part K — Meta Templates (when enabled)

**Enable:** Replit Secrets → `USE_META_TEMPLATES=true` + Meta templates **Approved**

| When | What patient sees |
|------|-------------------|
| Order status changes (mapped statuses) | Meta-approved template message (not free text) |
| Template fails | Falls back to code text message |
| Bot greeting, menu, payment | Still code messages (not templates) |

---

## Part L — Troubleshooting

| Problem | Check |
|---------|-------|
| Patient message not in Inbox | Webhook URL, META_VERIFY_TOKEN, pharmacy phone_number_id |
| Pharmacist reply not on WhatsApp | Green "WhatsApp connected" in chat header? |
| Prescription not opening | File may be missing after redeploy — patient resend |
| Payment not sent | Settings: payment link or QR configured? |
| Bot not replying | ACTIVE_BOT=PHARMACY, META_ACCESS_TOKEN valid |
| Templates not working | Status must be **Approved** on Meta, not Submitted |

---

## Part M — Environment variables (Replit Secrets)

| Variable | Required for |
|----------|--------------|
| `MONGODB_URI` | Database |
| `META_ACCESS_TOKEN` | Send/receive WhatsApp |
| `META_VERIFY_TOKEN` | Webhook verify |
| `APP_PUBLIC_URL` | Media links (https://pharmacy-system.replit.app) |
| `USE_META_TEMPLATES` | Meta template order notifications |
| `META_TEMPLATE_LANGUAGE` | Template language (en) |

---

*For technical flow diagrams see `docs/FLOW-STRUCTURE.md` · For product requirements see `docs/PRD.md` · For selling points see `docs/USP.md`*
