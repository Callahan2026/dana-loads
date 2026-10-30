# Dana Mazor · Callahan Transportation

Public site: https://callahan2026.github.io/dana-loads/

## Who updates what (please read before changing anything)

Live at https://loads.callahantrans.com (GitHub Pages, custom domain set by `CNAME`; leave that file alone).
More than one person, and more than one Claude, edits this repo. Always `git pull` before you start and right before you push; never force-push.

| Page | Owner | Notes |
|---|---|---|
| `index.html`, `open-loads.html`, `check-in.html`, `loads-we-moved.html`, `my-story.html`, `dana.html`, shared CSS/JS | Dana | Dana's loads live in the `<script id="data">` JSON block in `open-loads.html`; covered loads in `covered.json` / `covered/` |
| `cait/index.html` (+ `cait/covered.json`) | Cait Super, via Brian | Same loads JSON format as Dana's page; requests go to csuper@callahantrans.com |
| `pam/index.html` (+ `pam/covered.json`) | Pam Bruno, via Brian | Same format; requests go to pbruno@callahantrans.com |

- `cait/` and `pam/` reuse the shared CSS, images and `night.js` from the root (`../`). If you rename or remove a shared file, check those two pages still load.
- Keep each page's loads JSON in the same shape (`updated`, `loads: [{load, from, to, when, equip, freight, weight, notes, tag}]`); a planned automation will fill it from LOADPlus.
- The company site, callahantrans.com, is separate (Netlify, managed by Brian). It links here as "Loads available" → Dana's / Cait's / Pam's loads. Don't rename `open-loads.html`, `cait/` or `pam/` without telling Brian, or those links break.
