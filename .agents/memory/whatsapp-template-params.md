---
name: WhatsApp Meta template variable mapping
description: How order-status notifications map to Meta-approved template variables, and the gotchas that cause silent fallback-to-text.
---

# WhatsApp order-status templates

Order status changes notify the patient via Meta-approved WhatsApp templates, gated by env `USE_META_TEMPLATES=true` (default false → plain session text). On any template send error the code falls back to plain text, so a *wrong* template still "works" in chat but isn't the real template.

**The contract that bites:** the approved templates in Meta are the source of truth. The code's `buildMetaTemplateBodyParams` (in `Backend/src/config/whatsapp-templates.config.ts`) must produce the EXACT number and positional order of params each template defines, or Meta rejects with:
- `132000` number of params does not match
- `132001` template name does not exist in `<lang>` (name missing OR approved in a different language, e.g. `en_US` vs `en` — controlled by `META_TEMPLATE_LANGUAGE`)

**Key conventions of the approved set:** `{{1}}` is the pharmacy name for all pharmacy-first templates (NOT order ref). `refill_reminder` is the odd one: `{{1}}` is the patient name. Counts vary 1–6.

**Why the `clean()` helper exists:** Meta rejects params that are empty, or contain newlines/tabs/>4 consecutive spaces. `clean()` collapses whitespace and applies a non-empty fallback so optional fields (storeAddress, storeHours, paymentMode, etc.) never fail the send.

**How to apply:** if the director changes/adds a template, re-confirm per template: exact name, language code, and the `{{n}}` variables in order — then update both `META_ORDER_TEMPLATE_MAP` and the switch in `buildMetaTemplateBodyParams`. Data comes from pharmacy (name/storeAddress/storeHours) + patient (name) + order (amount/refillDueAt/createdAt) via `buildNotificationContext`.
