# 009 cart interactions: code review

Reviewer: fresh context, static reading of the working tree only. No browser run, no tests executed. Everything below is "not verified in Chrome" unless the scenario follows directly from the code.

Files read: `src/components/cart/cart-button.tsx`, `src/components/cart/mini-cart.tsx`, `src/components/cart/cart-modal.tsx`, `src/store/cart-ui.ts`, `src/components/catalog/product-card.tsx` (diff), `src/components/layout/header.tsx` (130-210), `src/app/globals.css` (tint-btn block 390-467), `src/components/product/buy-box.tsx` (75-105), `src/components/product/sticky-buy-bar.tsx` (76-104), `src/i18n/ua.ts`/`ru.ts` keys.

Counts: high 3, medium 9, low 6.

---

## High

### H1. Stale auto-close timer from `resume()` closes the cart modal (or a hover-opened mini-cart) by itself
- `src/components/cart/mini-cart.tsx:259-263, 301-308, 355-358, 265-275`
- `onMouseLeave={resume}` / `onBlur={resume}` call `restartTimer()` in every mode. `restartTimer` does not check `hoverOpenRef`, and the timer it starts is only cleared by the effect cleanup, which is not registered in hover mode (`if (hoverOpenRef.current) return undefined`). The timer calls the store's `close()`, which sets `panel: null` whatever panel is open.
- Scenario A (mouse): hover the cart button, the mini-cart opens. Move into the dropdown, then back up onto the button (dropdown `mouseleave` fires `resume`, 4 s timer starts). Click the button: the modal opens. About 4 s after the mouse left the dropdown, the timer fires `close()` and the modal disappears on its own.
- Scenario B (keyboard): Tab to the cart (mini opens), Tab into the dropdown, Shift+Tab back to the button. The focusout from the close button fires `resume`, the timer starts. Press Enter within 4 s: the modal opens and then closes itself.
- Scenario C: hover-open, enter and leave the dropdown while staying on the button: the dropdown closes under the cursor after 4 s.
- Fix: in `resume` and `restartTimer`, return early when `hoverOpenRef.current` is true. Clear `timerRef` in an unconditional cleanup (on `open` change and unmount). Safer still: the timer should call `close` only if `useCartUI.getState().panel === "mini"`.

### H2. Escape cannot close the mini-cart for keyboard users; it re-opens at once and pulls focus into the header
- `src/components/cart/mini-cart.tsx:280-284` together with `src/components/cart/cart-button.tsx:105-112`
- The Escape handler calls `close()` and then `triggerRef.current?.focus()`. When focus was on an element that matched `:focus-visible` (anything inside the dropdown reached by Tab, the "У кошик" card button pressed with Enter, any text input), the programmatically focused trigger also matches `:focus-visible` (Chrome heuristic). The wrapper's `onFocus` then passes all its checks and calls `openViaHover()`. The panel was just set to `null`, so `canOpenViaHover()` is true and `show("mini")` runs in the same tick. Net result: the panel never leaves `"mini"` and nothing visibly changes.
- Scenario 1: Tab to the cart, Tab onto a trash button, press Escape. The dropdown stays open. This breaks the request's own criterion ("Escape закриває").
- Scenario 2: the user presses Enter on "У кошик" on a card. `announceAdded` opens the mini-cart. Escape: focus jumps from the card in the grid to the header cart button, and the mini-cart reopens in "hover" mode with no auto-close. The user lost their place in the catalog and the dropdown stays open.
- Scenario 3: the user types in the search box and the mouse rests over the cart button, so the mini-cart is open. Escape (to clear search suggestions) moves focus out of the search input.
- Fix: return focus to the trigger only when `rootRef.current.contains(document.activeElement)`. Add a "suppress next focus-open" ref (set before the programmatic `focus()`, read and reset in `onFocus`), or open on focus only after a real Tab keydown.

### H3. The card's in-cart button fails label-in-name, and keyboard or touch users get no visible hint that activation removes the item
- `src/components/catalog/product-card.tsx` (new button block, about lines 125-162 of the working copy)
- The visible text is "✓ У кошику". The accessible name is `dict.cart.removeItem(name)` = "Прибрати Milwaukee … з кошика". WCAG 2.5.3 (Label in Name, level A) fails: a voice-control user who says "натисни У кошику" gets no match. Visible text and spoken name also describe opposite things: state versus action.
- "Прибрати з кошика" appears only through `group-hover/cart:*`. Tailwind v4 wraps hover variants in `@media (hover: hover)`, so on focus-visible and on touch devices the button always reads "✓ У кошику", and one Enter or tap silently removes the item. On a phone's two-column grid a mis-tap on an in-cart card deletes the line with no confirmation (see M4 on quantity).
- Fix: keep the visible text as the accessible name. Use `aria-pressed="true"` for toggle semantics, or a name that contains the visible text ("У кошику, прибрати Milwaukee …"). Show the remove text on `:focus-visible` as well (for example `group-focus-visible/cart:`). Decide what touch users get: a visible "×" affordance, or a confirmation through the mini-cart.

---

## Medium

### M1. Closing the modal with the keyboard reopens the mini-cart
- `src/components/cart/cart-modal.tsx:58-62` + `src/components/cart/cart-button.tsx:105-112`
- The modal cleanup calls `trigger?.focus()`. If the modal was opened or used by keyboard, the close button matched `:focus-visible`, so the trigger matches it too. `onFocus` calls `openViaHover()`: the panel is `null` now, so the mini-cart pops open right after the modal closes. The same happens after "Відкрити кошик" inside the mini-cart, then Escape in the modal.
- Fix: the same suppression flag as H2, set before the refocus in the modal cleanup (for example a store field `suppressFocusOpen` or an exported `markProgrammaticFocus()`).

### M2. Hovering the button while an announce-opened mini-cart is up does not stop its 4 s auto-close
- `src/components/cart/cart-button.tsx:76-82`, `src/components/cart/mini-cart.tsx:251-257, 265-275`
- `openViaHover` sets `lastMiniCartSource = "hover"` and calls `show("mini")`, but the panel is already `"mini"`. The `[open]` effects do not re-run, `hoverOpenRef` stays false and the announce timer keeps running. Only `mouseenter` on the dropdown itself pauses it.
- Scenario: add from a card, move the mouse to the cart button to look. The dropdown closes under the cursor within 4 s, and it does not reopen until the pointer leaves the wrapper and enters again.
- Fix: in `openViaHover`, when the panel is already `"mini"`, tell the MiniCart to switch to hover mode (pause and clear the timer). The simplest route is to move `source` into the `cart-ui` store (`show(panel, source)`) and drop the module-level flag.

### M3. Keyboard/mouse blur closes the dropdown when the user clicks non-focusable content inside it
- `src/components/cart/cart-button.tsx:113-120`
- If the trigger has focus (after a click, after the modal closes, or after keyboard focus) and the dropdown is hover-open, a mousedown on text inside the dropdown (price, title, total) blurs the trigger with `relatedTarget === null`. `contains(null)` is false, so the dropdown closes under the click.
- Fix: ignore blur while the pointer is inside the wrapper (keep a `pointerInsideRef`), or check `event.currentTarget.matches(":hover")`, or make the dropdown `tabIndex={-1}` so a click focuses it and `relatedTarget` stays inside.

### M4. The card toggle removes the whole line, including quantity added on the product page
- `src/components/catalog/product-card.tsx` click handler → `useCart.remove` (`src/store/shop.ts:39`, filters the slug out)
- Scenario: the user sets qty 3 in the buy-box, returns to the catalog, clicks "✓ У кошику" (or taps it on a touch screen, see H3). All 3 units are gone. The card shows no quantity, so the user cannot know that. A second click adds back 1, not 3, so the "undo" is lossy.
- Fix: when `qty > 1`, show the quantity on the card button ("✓ У кошику · 3") and make the hover text say that everything goes ("Прибрати всі 3"). Or remove one unit. Or offer a real undo in the live region or mini-cart. The owner should decide which.

### M5. The same label "✓ У кошику" does opposite things on the card and on the product page
- `src/components/product/buy-box.tsx:77-92`, `src/components/product/sticky-buy-bar.tsx:78-91`
- On the card, clicking "✓ У кошику" removes the item. In the buy-box and the sticky bar, the identically worded button opens the cart modal (or `/cart`). A user who learned "click again to remove" on the card opens the modal on the product page. A user who learned "click to open the cart" on the product page deletes the item from the card.
- Fix: align them. Either the card's in-cart state also opens the cart and removal sits behind a separate control, or buy-box and sticky bar get the same toggle / hover "Прибрати" (with quantity, see M4). The brief only asked about the card, so the owner has to pick.

### M6. The raw CSS `[data-armed]:hover` rule is not gated by `(hover: hover)`, so sticky hover on touch turns the added state neutral
- `src/app/globals.css:464-467` + `onPointerLeave={() => setArmed(true)}` in product-card
- On touch, `pointerleave` fires right after `pointerup`, so `armed` becomes true straight after the add tap. iOS/iPadOS Safari and Android Chrome keep `:hover` on the tapped element. The rule then paints the border `--hair-strong` and the text bone, while the text still reads "✓ У кошику" (the text swap is correctly hover-gated by Tailwind). The green "added" confirmation disappears the moment it should appear.
- Hybrid laptops (touchscreen plus `hover: hover`): a finger tap adds, `pointerleave` re-arms, sticky `:hover` matches and the Tailwind `group-hover` does apply, so the button flips to "Прибрати з кошика" right after the add. This is the flip-flop that `armed` was built to prevent.
- Fix: wrap the rule in `@media (hover: hover) and (pointer: fine)`. Re-arm only on `pointerType === "mouse"` pointerleave.

### M7. Opening the mini-cart on keyboard focus adds 2N+3 tab stops to every Tab pass through the header; the trigger has no disclosure state
- `src/components/cart/cart-button.tsx:105-112, 122-145`; `src/components/cart/mini-cart.tsx:353-361`
- Every Tab through the header opens the dropdown and moves the user through close, N × (link, trash), "Кошик", "Оформити" before they get past the cart. With 5 items that is 13 extra stops on every page, every time.
- The trigger has no `aria-expanded`, `aria-controls` or `aria-haspopup`, so screen readers do not announce that anything opened. The popup is `role="dialog"` without `aria-modal` and does not receive focus. A dialog that appears on focus and is not focused is the wrong pattern.
- Fix: use a disclosure. On focus, show nothing (or only a hint). Open on ArrowDown/Enter/Space, with `aria-expanded` on the trigger and `aria-controls` pointing at the panel. Drop `role="dialog"` from the hover panel, or keep it and move focus into it when opened by keyboard. This changes the request's "open from focus" criterion, so confirm it with the designer.

### M8. Escape moves focus to the trigger even when focus was never inside the mini-cart
- `src/components/cart/mini-cart.tsx:280-284`
- Covered in H2 as a cause. Listed separately because it is a focus-loss bug even where no reopen happens: with the mouse, a hover-open panel plus Escape while the page body or any non-focus-visible element is focused silently moves focus to the header.
- Fix: as H2, refocus only if `rootRef.current?.contains(document.activeElement)`.

### M9. A second `announceAdded` while the panel is already "mini" does not restart the 4 s timer
- `src/store/cart-ui.ts:25`, `src/components/cart/mini-cart.tsx:265-275`
- `show("mini")` with the same value does not change the `panel` selector, so the `[open, close]` effect does not re-run. Add product A (timer starts), add product B 3.5 s later: the dropdown with B closes 0.5 s later. The new card remove/add toggle makes rapid repeated adds more likely: remove, then add again within 4 s.
- Fix: keep a counter or timestamp in the store (`announceId`) and restart the timer on its change.

---

## Low

### L1. Duplicate `id="mini-cart-title"` in the DOM
- `src/components/cart/mini-cart.tsx:360, 364`. Both MiniCart instances render the dropdown when `panel === "mini"` (one inside a `display:none` half), so the id appears twice. HTML is invalid. At <768 px the phone panel's `aria-labelledby` resolves to the desktop copy (first in DOM). The name is still computed, but by luck.
- Fix: `useId()`.

### L2. Cart trigger accessible name does not contain its visible text
- `src/components/cart/cart-button.tsx:133, 137-139`. The visible text at ≥sm is "12 345 ₴", the name is "Кошик, 3". This fails WCAG 2.5.3 for voice users.
- Fix: include the sum in the label, or drop `aria-label` and add sr-only text next to the visible sum.

### L3. The hover-close timer can swallow an announce that arrives within 250 ms
- `src/components/cart/cart-button.tsx:84-92`. The timer closes whenever `panel === "mini"`, whatever the source. If an announce happens in that window (for example the sticky buy bar, or a keyboard add while the mouse drifts off the header), the confirmation closes right away. This is unlikely.
- Fix: close only if the current source is still "hover" (see M2's store-level source).

### L4. `armed` stays false after a keyboard activation until a pointer leaves
- product-card click handler. After Enter or Space, `setArmed(false)` is never undone without a `pointerleave`. A later mouse hover shows "✓ У кошику" instead of "Прибрати з кошика" on the first pass. Minor.
- Fix: reset `armed` on `blur` as well, or set it to false only for `pointerType === "mouse"` clicks (`event.detail > 0`).

### L5. "Прибрати з кошика" with `white-space: nowrap` may overflow narrow cards
- `globals.css:407` (`tint-btn` nowrap), product-card button. On a hover-capable desktop in a narrow window or a tight rail, 17 characters at 16 px/600 plus 28 px padding on each side may exceed the card width. I did not check this.
- Fix: check at 768 and 1024 in the grid and in rails. Allow wrapping or reduce `--btn-px` inside the card.

### L6. Non-added card buttons have no product in their accessible name
- product-card: `aria-label` is `undefined` when not added, so a screen-reader button list shows dozens of identical "У кошик" entries. This predates the change, but the change adds a named remove label on the same button, which makes the two states inconsistent.
- Fix: `aria-describedby` pointing at the product title, or a visually hidden product name.

---

## Brief coverage
- Toggle on the card: present. Its failures on keyboard, touch and voice are described in H3, M4 and M6.
- Hover shows the mini-cart with removal: present. Timing defects are H1, M2 and M3.
- Click opens the modal: present at ≥768 px. At <768 px it goes to `/cart` (as planned in `request.md`).
- Empty cart, hover shows nothing: present (`cartItems.length > 0` in `canOpenViaHover`).
- One animation: no new animation was added. The existing 150 ms colour transition covers the armed hover change. OK.
- No uppercase: none found in the changed code.
- `prefers-reduced-motion`: nothing new to gate.
- Not covered by the brief but now inconsistent: buy-box and sticky bar (M5).
