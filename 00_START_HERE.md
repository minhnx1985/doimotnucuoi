# ĐỢI MỘT NỤ CƯỜI — CLINE AUTONOMOUS CODER PACK

## Goal

Build a polished Vietnamese landing page for:

# **Đợi một nụ cười**
## *Hành trình của một người bà đồng hành cùng cháu tự kỷ*

Author:
**Nguyễn Thị Quỳnh Anh**

Primary business goal:
> **Maximize qualified clicks to the book purchase destination.**

Secondary goals:
- make readers emotionally understand what the book is;
- build trust through the true story, real photographs and author identity;
- allow readers to sample the book before buying.

This is a **book marketing landing page**, not:
- a medical landing page;
- an autism information portal;
- a generic motivational page;
- an ecommerce product-detail clone.

---

# AUTONOMOUS EXECUTION

Cline must run:

**SCAN → SOURCE VALIDATION → BUILD → BROWSER QA → REFINE → DONE**

Do not pause for intermediate checkpoints.

Only ask the Human when facing a Level-3 blocker:
- final purchase URL cannot be resolved and a temporary store-homepage fallback is unacceptable;
- official book metadata conflicts across approved sources;
- architecture/scope must materially change;
- critical source asset is unusable;
- destructive/irreversible action is required.

Reversible design and implementation decisions should be made autonomously and documented afterward.

---

# SOURCE ASSETS INCLUDED

Inside `source-assets/`:

- `cover.jpg`
- `logo-nhanam.jpg`
- `read-sample.pdf`
- `back-cover-copy.docx`
- `author-portrait.jpg`

These are the primary approved sources.

Do not replace them with stock imagery or AI-generated equivalents.

---

# PURCHASE LINK

The exact direct product URL was not verified when this pack was prepared.

Builder must first search/verify an exact Nhã Nam product page.

If found:
- use it everywhere through one centralized `purchaseUrl`.

If no exact product page is available:
- use `https://nhanam.vn` only as a temporary fallback;
- label CTA **“Tìm mua tại Nhã Nam”**, not “Mua ngay”;
- report the missing direct product link as a non-blocker requiring replacement before a conversion campaign is launched.

Never invent a product slug.
