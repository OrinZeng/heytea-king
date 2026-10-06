# Design QA

- Source visual truth: user browser annotations 1–16 on `https://orinzeng.github.io/heytea-king/`, supplied in the 2026-10-06 request.
- Implementation: `http://127.0.0.1:4173/heytea-king/`
- Desktop viewport: 1326 × 946 CSS px, density 1.
- Mobile viewport: 375 × 812 CSS px, density 1.
- State: homepage hero, metric section, chapter headings, real map, and number cards.
- Full-view evidence: in-app browser captures taken after the production build at desktop and mobile widths.
- Focused evidence: hero Logo and Chapter 04 map were separately inspected at desktop size; mobile Logo and map canvas dimensions were separately checked.

## Findings

- No remaining P0, P1, or P2 issue.
- The hero now contains only the black person-and-cup logo. The registered mark and both text lines are absent.
- All annotation-targeted descriptive lines are absent. The remaining notes are unrelated data labels the user did not request to remove.
- Chapter headings retain the established typography and spacing after their third-column notes were removed.
- The abstract plotting surface has been replaced by a true China provincial-boundary map with verified store coordinates, pan/zoom, proportional markers, and hover details.
- Desktop map canvas renders at 1197 × 520 CSS px. After a fresh mobile render it adapts to 272 × 330 CSS px with no document-level horizontal overflow.
- Browser console check returned no errors or warnings.

## Required fidelity surfaces

- Fonts and typography: existing system Chinese font stack, weights, letter spacing, and hierarchy preserved.
- Spacing and layout rhythm: compact two-column chapter title grid replaces the removed copy without leaving an empty text column.
- Colors and visual tokens: white, ink black, soft gray, and warm gold tokens preserved; map uses the same palette.
- Image quality and asset fidelity: transparent 1254 × 1254 PNG logo; no CSS or text-glyph reconstruction.
- Copy and content: all 16 requested removals/replacements are reflected in the rendered DOM.

## Comparison history

1. Initial map QA found a P1 issue: ECharts initialized with a zero-width canvas because the grid child had no explicit width.
2. Added `.store-map > div { width: 100%; }`, rebuilt, reloaded, and recaptured.
3. Post-fix evidence shows the China map and markers at full desktop width and correct mobile dimensions.

## Follow-up polish

- P3: none required for this annotation pass.

final result: passed
