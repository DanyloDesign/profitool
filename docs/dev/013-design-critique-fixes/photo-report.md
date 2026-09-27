# Task 013 · Per-model product photos

Pipeline: `tools/products/rozetka-ids-by-slug.json` (slug → rozetka product id, `null`
where no exact-model listing was confirmed) + `tools/products/prepare_slug_photos.py`
(new, additive script — imports `cut_background`/`fit_square` from `prepare_photos.py`
unchanged, writes `public/products/{slug}-photo.png` at 760×760, never touches the
`{category}-{brand}-photo.png` files). Source jpgs live in `public/products/real/{slug}.jpg`,
same convention as the existing category+brand jpgs.

**rozetka.com.ua could not be scraped directly.** Every product page and the
homepage returned a Cloudflare "checking your browser" interstitial in both a
plain HTTP client and the Chrome extension (waited 15s+, no captcha/checkbox
ever appeared to interact with — bypassing bot detection is out of scope
regardless). Rozetka product ids below were only recoverable from Google search
result titles/URLs, so the map records the id for provenance but the actual
source image for every row was downloaded from the manufacturer's own site or
another reachable retailer, then verified by eye. Where no exact-model rozetka
listing turned up in search, the id is `null`.

## Priority 1 — wrong tool type / counterfeit "Mackita"

| slug | model | rozetka id | file | verdict | shows battery? |
|---|---|---|---|---|---|
| bosch-glm-50-27c | Bosch GLM 50-27 C | not confirmed | bosch-glm-50-27c-photo.png | ok | no (2×AA internal, not a kit item) |
| makita-ga5030 | Makita GA5030 | 71722179 | makita-ga5030-photo.png | ok | n/a (corded) |
| dewalt-dwe4157 | DeWalt DWE4157 | 185385068 | dewalt-dwe4157-photo.png | ok | n/a (corded) |
| makita-dhr243z | Makita DHR243Z | not confirmed | makita-dhr243z-photo.png | ok | no (bare, battery rail empty) |
| makita-hr001gz | Makita HR001GZ | not confirmed | makita-hr001gz-photo.png | ok | no (bare) |
| milwaukee-m18-bos125 | Milwaukee M18 BOS125-0 | not confirmed | milwaukee-m18-bos125-photo.png | ok | no (bare) |
| makita-sk209gdz | Makita SK209GDZ | not confirmed | makita-sk209gdz-photo.png | ok | no (case + tripod bracket only) |
| makita-dbo180z | Makita DBO180Z | 423022461 | makita-dbo180z-photo.png | ok | no — real Makita, "Mackita" replaced |

## Priority 2 — other models that shared a photo

| slug | model | rozetka id | file | verdict | shows battery? |
|---|---|---|---|---|---|
| makita-bo5041 | Makita BO5041 | 160695 | makita-bo5041-photo.png | ok | n/a (corded) — was also showing the fake "Mackita" via the shared sander-makita fallback |
| makita-dga504z | Makita DGA504Z | 42322560 | makita-dga504z-photo.png | ok | no (bare) — was also on the noBattery/battery list below |

`makita-hr2470` (3rd Makita rotary hammer) and `bosch-gll-3-80` (2nd Bosch
measuring tool) were left on the category+brand fallback: the shared photo
already is that exact model, so a separate file would be a byte-different
duplicate.

## Priority 3 — bare tools whose (old) fallback photo showed a battery/charger

| slug | model | rozetka id | file | verdict | shows battery? |
|---|---|---|---|---|---|
| makita-ddf484z | Makita DDF484Z | 95136597 | makita-ddf484z-photo.png | ok | no (Makita's own "no battery" ghost-outline graphic) |
| bosch-gsr-18v-55 | Bosch GSR 18V-55 | 445760309 | bosch-gsr-18v-55-photo.png | ok | no (Bosch's own dashed-outline "battery not included" graphic) |
| milwaukee-m18-fpd2 | Milwaukee M18 FPD2-0X | 134456550 | milwaukee-m18-fpd2-photo.png | ok | no — source had a "FREE 5.0Ah battery redemption" promo sticker painted out before processing |
| metabo-bs-18-lt-bl | Metabo BS 18 LT BL | not confirmed | metabo-bs-18-lt-bl-photo.png | ok | no (bare) |
| ryobi-r18dd5 | Ryobi R18DD5-0 | not confirmed | ryobi-r18dd5-photo.png | ok | no (bare) |
| milwaukee-m18-fcs66 | Milwaukee M18 FCS66-0 | not confirmed | milwaukee-m18-fcs66-photo.png | ok | no (bare) |

## Extra — found during verification, not in the original list

Checking every category+brand fallback used by a `K.noBattery` product turned
up three more mismatches the critique's audit missed (none show a battery, so
its battery-focused sweep would not have caught them):

| slug | model | rozetka id | file | verdict | shows battery? | why it needed a photo |
|---|---|---|---|---|---|---|
| milwaukee-m12-3pl | Milwaukee M12 3PL-0C | not confirmed | milwaukee-m12-3pl-photo.png | ok | no | fallback (`laser_level-milwaukee`) showed a large rotary tripod laser, wrong tool entirely; source was a "+battery" bundle shot, cropped to the tool only |
| metabo-ks-18-ltx-57 | Metabo KS 18 LTX 57 | 208219597 | metabo-ks-18-ltx-57-photo.png | ok | no | fallback (`circular_saw-metabo`) showed a **corded** saw; KS 18 LTX 57 is cordless |
| ryobi-r18cs7 | Ryobi R18CS7-0 | 240166435 | ryobi-r18cs7-photo.png | ok | no | fallback (`circular_saw-ryobi`) showed a 1600W corded-look saw; R18CS7-0 is cordless ONE+ |

`milwaukee-m18-cag125` (grinder-milwaukee fallback) and `milwaukee-m18-chx`
(rotary_hammer-milwaukee fallback) were checked too and are already correct —
both fallbacks are genuinely bare-tool shots of those exact models, no new
photo needed.

## Result

19 of 19 attempted slugs got a correct `{slug}-photo.png`, all verified by eye
(`Read` on the PNG) against the exact model, none skipped:

```
bosch-glm-50-27c, makita-ga5030, dewalt-dwe4157, makita-dhr243z, makita-hr001gz,
milwaukee-m18-bos125, makita-sk209gdz, makita-dbo180z, makita-bo5041,
makita-dga504z, makita-ddf484z, bosch-gsr-18v-55, milwaukee-m18-fpd2,
metabo-bs-18-lt-bl, ryobi-r18dd5, milwaukee-m18-fcs66, milwaukee-m12-3pl,
metabo-ks-18-ltx-57, ryobi-r18cs7
```

Contact sheet: `docs/dev/013-design-critique-fixes/shots/photo-contact-sheet.png`.

## Known weaknesses

- `bosch-glm-50-27c-photo.png` is the best packshot found but the object itself
  is smaller in frame than the others (source was 1500×1500 from a Shopify CDN,
  not a manufacturer packshot at full bleed) — worth a second pass if a tighter
  crop turns up later.
- Rozetka ids are unconfirmed for 9 of 19 slugs (marked `null` in the JSON map);
  they were left `null` rather than guessed, per "never substitute a similar
  model."
- `prepare_slug_photos.py`'s `try_fetch_from_rozetka()` is wired up but unused
  in this run (network calls to rozetka's API also 403/Cloudflare from a plain
  client) — it's there so a session with a real rozetka session cookie can
  extend the map later without hand-downloading every source jpg again.
