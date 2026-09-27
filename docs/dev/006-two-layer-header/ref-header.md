# ProfiTool Site Header Reference

## Desktop Header (≥1024px) — Two-Layer Structure

### Layer 1: Top Navigation Bar
- **Height**: 52px
- **Background**: `var(--anchor)` (#413B35 — dark chocolate brown)
- **Border**: 1px solid #574F47 (darker brown) at bottom
- **Layout**: flex | justify-content: space-between | gap: 24px
- **Padding**: 0 `var(--pad)` (responsive horizontal padding)

**Elements (left to right)**:
1. **Logo Button** (icon only)
   - No background/border
   - Height: `var(--logoH)` | Width: auto
   - Image alt="PROFITOOL"

2. **Right Cluster** (flex | gap: 12px):
   - **City Selector** (icon + label)
     - Height: 34px | Padding: 0 4px | Gap: 7px
     - Icon: map-pin (16px, colored `var(--brand)`)
     - Text: dynamic city name
     - Text size: body-sm
   
   - **Support Button** (icon + label, bordered)
     - Height: 34px | Min-width: `var(--supportW)`
     - Padding: 0 12px
     - Border: 1px solid #6B6259 | Radius: small
     - Text: dynamic support label (body-sm)
     - Chevron icon (14px)
   
   - **Language Selector** (icon + label, bordered)
     - Height: 34px | Padding: 0 12px
     - Border: 1px solid #6B6259 | Radius: small
     - Text: "Укр" (uppercase, button weight)
     - Chevron icon (14px)

**Text Color**: `var(--ink-inverse)` (#F9F7F3 — light cream)

---

### Layer 2: Main Header (Catalog → Search → Actions)
- **Height**: `var(--headH)` (responsive variable, typically 52–60px)
- **Layout**: flex | align-items: center
- **Gap**: `var(--headGap)` (responsive, typically 16–20px)
- **Padding**: 0 `var(--pad)`
- **Background**: inherits from pt-dark container (#413B35)

**Elements (left to right)**:
1. **Catalog Button** (icon + label)
   - Flex: 0 0 auto | Height: 44px | Padding: 0 4px
   - Gap: 10px
   - Display: flex | align-items: center
   - Icon: layout-grid (22px, colored `var(--brand)`)
   - Text: dynamic catalog label, uppercase, bold
   - Font size: `var(--catFs)` (responsive, typically 14–16px)

2. **Search Box** (interactive, flex container)
   - Flex: 1 1 auto | Max-width: 660px | Min-width: 0 | Height: 44px
   - Background: `var(--surface)` (#FFFFFF — white)
   - Border-radius: small
   - Padding: 0 6px 0 16px (left-padded for text)
   - Layout: flex | align-items: center
   
   **Sub-elements**:
   - Text placeholder (flex: 1 | overflow: hidden, ellipsis)
   - Blinking caret cursor (animated, `var(--brand-strong)`)
   - Search icon button (36×36px, background `var(--brand-strong)` #BE4E19)

3. **Action Icons Cluster** (flex: 0 0 auto)
   - Gap: `var(--actGap)` (responsive, typically 4–8px)
   - Layout: flex | align-items: center
   - Margin-left: auto (pushes to right)
   
   **Buttons** (all icon-only, 44×44px):
   - **Account** (user icon, 24px)
   - **Wishlist** (heart icon, 24px) — *visible ≥1024px*
     - Badge: 17×17px, top-right (red `var(--brand-strong)` bg, white text)
   - **Compare** (git-compare icon, 24px)
     - Badge: 17×17px, top-right (red `var(--brand-strong)` bg, white text)
   - **Cart** (shopping-cart icon, 24px)
     - Badge: 17×17px, top-right (red `var(--brand-strong)` bg, white text), dynamic count

**Text/Icon Color**: `var(--ink-inverse)` (#F9F7F3)

---

## Tablet (768–1023px) — Intermediate Layout

Tablet layout bridges desktop and mobile. Based on `L.tab` variable:
- Likely **hides or compresses** top navigation bar OR collapses into one row
- **Wishlist may hide**, keeping only Account, Compare, Cart
- Search box may reduce max-width or become full-width
- Icon sizes may reduce slightly (20–22px instead of 24px)
- Gap values reduced for tighter spacing

---

## Mobile (<768px) — Single-Layer Compact Header

### Single Header Row
- **Height**: 52px
- **Layout**: flex | align-items: center | gap: 4px
- **Padding**: 0 6px (tight horizontal padding)
- **Background**: `var(--anchor)` (#413B35)

**Elements (left to right)**:
1. **Menu Trigger** (icon only)
   - Width: 44px | Height: 44px
   - Icon: menu (24px)

2. **Logo** (flex: 1 1 auto)
   - Min-width: 0
   - Height: 31px | Width: auto (smaller than desktop)

3. **Account** (icon only)
   - Width: 44px | Height: 44px
   - Icon: user (22px, slightly smaller)

4. **Cart** (icon only with badge)
   - Width: 44px | Height: 44px
   - Icon: shopping-cart (22px)
   - Badge: 16×16px, top-right (red bg, white text)

**Text/Icon Color**: `var(--ink-inverse)` (#F9F7F3)

---

## Promo Banner (Sticky, Dismissible)

- **Height**: `var(--bannerH)` (responsive, typically 40–60px)
- **Background**: `var(--surface-2)` (#EDEAE3 — warm light beige)
- **Position**: relative | overflow: hidden
- **Visibility**: conditional `showBanner` flag

**Content**:
- **Badge** (flex: 0 0 auto)
  - Background: `var(--brand-strong)` (#BE4E19)
  - Text: "14 днів знижок" (14 Days Discount) — bold, uppercase, white
  - Padding: 6px 11px | Border-radius: xs
  - Font size: `var(--bannerFs)` (responsive)

- **Promo Text** (≥1024px only, L.wide)
  - Bold uppercase text: "до 40% на складські залишки" (up to 40% on stock clearance)
  - Color: `var(--ink)` (#35302B)

- **Close Button** (icon only)
  - Position: absolute | top: 0 | right: 0 | bottom: 0 | width: 44px
  - Background: none | border: none
  - Icon: x (16px, text color `var(--ink)`)

---

## Gradient Stripe

- **Height**: `var(--stripeH)` (typically 3–4px)
- **Background**: `var(--gradient)` = linear-gradient(135deg, #ED7C53 0%, #F5A21A 100%)
  - **Coral/salmon** (#ED7C53) to **orange/gold** (#F5A21A)
- **Position**: immediately after header, before content

This thin stripe provides visual separation and brand reinforcement.

---

## Z-Index & Sticky Behavior

- **Main header** (pt-dark): position: relative | z-index: 100
- **Designed for** sticky container wrapper to lock header on scroll
- **Dropdowns**: z-index: 150 (appear above header)

---

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--anchor` | #413B35 | Header background (dark brown) |
| `--surface` | #FFFFFF | Search box, cards |
| `--surface-2` | #EDEAE3 | Banner background |
| `--ink-inverse` | #F9F7F3 | Text on dark backgrounds |
| `--brand` | #ED7C53 | Icon accents (coral) |
| `--brand-strong` | #BE4E19 | Buttons, badges (dark orange) |
| `--gradient` | #ED7C53→#F5A21A | Stripe (coral to gold) |

---

## Raw Markup Excerpt (≈55 lines)

```html
<!-- Promo Banner (height: L.bannerH) -->
<sc-if value="{{ showBanner }}" hint-placeholder-val="{{ true }}">
  <div style="position:relative;height:{{ L.bannerH }};background:var(--surface-2);overflow:hidden">
    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:12px;padding:0 44px">
      <span style="flex:0 0 auto;background:var(--brand-strong);color:#fff;font:var(--fw-bold) {{ L.bannerFs }};padding:6px 11px;border-radius:var(--radius-xs)">14 днів знижок</span>
      <sc-if value="{{ L.wide }}" hint-placeholder-val="{{ true }}">
        <span style="font:var(--fw-bold) {{ L.bannerFs }};color:var(--ink)">до 40% на складські залишки</span>
      </sc-if>
    </div>
    <button sc-camel-on-click="{{ hideBanner }}" style="position:absolute;top:0;right:0;bottom:0;width:44px;background:none;border:0;cursor:pointer;color:var(--ink)">
      <x-import component-from-global-scope="PtIcon" name="x" size="16"></x-import>
    </button>
  </div>
</sc-if>

<!-- Main Header Container -->
<div class="pt-dark" style="background:var(--anchor);position:relative;z-index:100">
  <!-- Desktop: Layer 1 (52px top bar with logo, city, support, language) -->
  <sc-if value="{{ L.desk }}" hint-placeholder-val="{{ true }}">
    <div style="height:52px;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:0 {{ L.pad }};border-bottom:1px solid #574F47">
      <button sc-camel-on-click="{{ goHome }}" style="background:none;border:0;cursor:pointer">
        <img src="db3c0fb7-6eaa-4dc1-afdb-247a58e1ed5b" alt="PROFITOOL" style="height:{{ L.logoH }};width:auto">
      </button>
      <div style="display:flex;align-items:center;gap:12px">
        <button sc-camel-on-click="{{ tCity }}" style="display:flex;align-items:center;gap:7px;height:34px;padding:0 4px;background:none;border:0;cursor:pointer;color:var(--ink-inverse);font:var(--type-body-sm)">
          <span style="color:var(--brand)"><x-import component-from-global-scope="PtIcon" name="map-pin" size="16"></x-import></span>
          {{ city }}
        </button>
        <button style="height:34px;min-width:{{ L.supportW }};padding:0 12px;border:1px solid #6B6259;border-radius:var(--radius-sm);cursor:pointer;color:var(--ink-inverse);font:var(--type-body-sm)">
          {{ L.supportLabel }}
        </button>
        <button style="height:34px;padding:0 12px;border:1px solid #6B6259;border-radius:var(--radius-sm);color:var(--ink-inverse);font:var(--type-button);text-transform:uppercase">Укр</button>
      </div>
    </div>

    <!-- Desktop: Layer 2 (52-60px main header with catalog, search, actions) -->
    <div style="height:{{ L.headH }};display:flex;align-items:center;gap:{{ L.headGap }};padding:0 {{ L.pad }}">
      <button sc-camel-on-click="{{ tMenu }}" style="flex:0 0 auto;display:flex;align-items:center;gap:10px;height:44px;background:none;border:0;cursor:pointer;color:var(--ink-inverse);font:var(--type-button);text-transform:uppercase;font-size:{{ L.catFs }}">
        <span style="color:var(--brand)"><x-import component-from-global-scope="PtIcon" name="layout-grid" size="22"></x-import></span>
        <span>{{ L.catLabel }}</span>
      </button>
      <div style="flex:1 1 auto;max-width:660px;height:44px;background:var(--surface);border-radius:var(--radius-sm);display:flex;align-items:center;padding:0 6px 0 16px">
        <span style="flex:1;min-width:0;color:var(--muted);overflow:hidden;white-space:nowrap;text-overflow:ellipsis">{{ searchText }}</span>
        <span style="flex:0 0 auto;width:36px;height:36px;background:var(--brand-strong);border-radius:var(--radius-xs);color:#fff;display:flex;align-items:center;justify-content:center">
          <x-import component-from-global-scope="PtIcon" name="search" size="18"></x-import>
        </span>
      </div>
      <div style="flex:0 0 auto;margin-left:auto;display:flex;align-items:center;gap:{{ L.actGap }};color:var(--ink-inverse)">
        <button style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;background:none;border:0;cursor:pointer">
          <x-import component-from-global-scope="PtIcon" name="user" size="24"></x-import>
        </button>
        <button style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;background:none;border:0;cursor:pointer">
          <x-import component-from-global-scope="PtIcon" name="heart" size="24"></x-import>
          <span style="position:absolute;top:2px;right:0;min-width:17px;height:17px;background:var(--brand-strong);color:#fff;border-radius:var(--radius-pill);font:var(--type-overline)">5</span>
        </button>
        <button sc-camel-on-click="{{ goCompare }}" style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;background:none;border:0;cursor:pointer">
          <x-import component-from-global-scope="PtIcon" name="git-compare" size="24"></x-import>
          <span style="position:absolute;top:2px;right:0;min-width:17px;height:17px;background:var(--brand-strong);color:#fff;border-radius:var(--radius-pill)">2</span>
        </button>
        <button sc-camel-on-click="{{ tMini }}" style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;background:none;border:0;cursor:pointer">
          <x-import component-from-global-scope="PtIcon" name="shopping-cart" size="24"></x-import>
          <span style="position:absolute;top:2px;right:0;min-width:17px;height:17px;background:var(--brand-strong);color:#fff;border-radius:var(--radius-pill)">{{ cartCount }}</span>
        </button>
      </div>
    </div>
  </sc-if>

  <!-- Mobile: Single row (52px) with menu, logo, account, cart -->
  <sc-if value="{{ L.mob }}" hint-placeholder-val="{{ false }}">
    <div style="height:52px;display:flex;align-items:center;gap:4px;padding:0 6px">
      <button sc-camel-on-click="{{ tMenu }}" style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;background:none;border:0;cursor:pointer;color:var(--ink-inverse)">
        <x-import component-from-global-scope="PtIcon" name="menu" size="24"></x-import>
      </button>
      <button sc-camel-on-click="{{ goHome }}" style="flex:1 1 auto;background:none;border:0;cursor:pointer">
        <img src="db3c0fb7-6eaa-4dc1-afdb-247a58e1ed5b" alt="PROFITOOL" style="height:31px;width:auto">
      </button>
      <button style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;background:none;border:0;cursor:pointer;color:var(--ink-inverse)">
        <x-import component-from-global-scope="PtIcon" name="user" size="22"></x-import>
      </button>
      <button sc-camel-on-click="{{ tMini }}" style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;background:none;border:0;cursor:pointer;color:var(--ink-inverse)">
        <x-import component-from-global-scope="PtIcon" name="shopping-cart" size="22"></x-import>
        <span style="position:absolute;top:3px;right:2px;min-width:16px;height:16px;background:var(--brand-strong);color:#fff;border-radius:var(--radius-pill)">{{ cartCount }}</span>
      </button>
    </div>
  </sc-if>
</div>

<!-- Gradient Stripe (3–4px, brand gradient) -->
<div style="height:{{ L.stripeH }};background:var(--gradient)"></div>
```