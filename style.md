# MATCH visual language

This is the design language of the MATCH landing page. Values come from `src/styles.css` and the Chapter 3 spacecraft view.

## Color

The page is black. Text is near-white. Color is used to name a direction or a selected control, not to decorate the spacecraft.

| Role | Value |
| --- | --- |
| Page background | `#000000` |
| Primary text | `#f4f4f5` |
| Chapter titles | `#ffffff` |
| Lead and body prose | `#c8c8d0` |
| Muted | `#a8a8b2` |
| Faint, kickers | `#8b8b95` |
| Hairline | `rgba(255, 255, 255, 0.12)` |
| Quiet panel | `rgba(255, 255, 255, 0.04)` |
| Selection | white background, black text |
| Focus ring | `2px solid #fff`, offset `3px` |

Particle directions:

| Direction | Color |
| --- | --- |
| Space-facing, incoming | `#7fd0ee` |
| Moon-facing, leaving | `#8fe3cf` |

Spacecraft model:

| State | Color |
| --- | --- |
| Shown or selected | `#fafafa` |
| Unselected | `#666666` |

The spacecraft material is matte: roughness `0.82`, metalness `0`. The transfer path is white on black. The ghost path is `rgba(255, 255, 255, 0.18)` and the flown path is `#fff`.

## Typeface

Poppins, then `"Avenir Next"`, `"Segoe UI"`, sans-serif. Loaded from `@fontsource/poppins`.

Titles use weight `600` and letter-spacing `-0.04em`. Body uses weight `400`. Kickers are `12px`, weight `500`, letter-spacing `0.16em`, uppercase, color `--faint`.

| Token | Size |
| --- | --- |
| `--type-chapter` | `clamp(40px, 4.8vw, 56px)` |
| `--type-section` | `clamp(28px, 3vw, 36px)` |
| `--type-subhead` | `20px` |
| `--type-lead` | `19px` |
| `--type-body` | `17px` |
| `--type-note` | `15px` |

Title line-height is `1.12`. Body line-height is `1.7`. Chapter titles stay within `16em`. Prose stays within about `42rem`.

## Space

| Token | Size |
| --- | --- |
| `--gap-kicker` | `20px` |
| `--gap-title` | `24px` |
| `--gap-text` | `20px` |
| `--gap-stack` | `64px` |
| `--gap-section` | `96px` |

The page column is `min(1180px, 100% - 48px)`. The chapter nav is `248px`. The header is `56px` plus the top safe area. The SpaceTH logo is `18px` tall and centered. Frames use a `28px` radius and a hairline border.

At `860px` the chapter nav becomes a drawer, sticky diagrams stack, and the spacecraft frame drops to `420px` tall. On a phone the page inset tightens to `28px`.

## Buttons

Buttons inherit the typeface. A press scales to `0.97` over `100ms ease-out`. Background color fades over `120ms ease-out`. A disabled button is `0.35` opacity and does not scale. Chapter links scale to `0.98`.

Selected controls invert: background `#f4f4f5`, text `#111`. That applies to mode pills, orbit controls, and spacecraft part buttons.

| Control | Shape |
| --- | --- |
| Chapter link | `12px` radius, current item on `rgba(255, 255, 255, 0.08)` |
| Mode pills | full pill, group border `rgba(255, 255, 255, 0.08)` |
| Spacecraft parts | `16px` radius, `52px` minimum height, border `rgba(255, 255, 255, 0.16)` |
| Orbit and view controls | full pill, `44px` minimum height, frosted `rgba(8, 8, 10, 0.72)` |
| Menu and full screen | `44px` square, `14px` radius, same frost |

Frosted controls use `backdrop-filter: blur(12px)`. The header uses `blur(20px) saturate(140%)` on `rgba(0, 0, 0, 0.72)`.

## Motion

The page scrolls smoothly. Sticky chapters pin under the header: the mission model, the magnetotail, and the Earth-to-Moon route. The route section is `460vh` tall.

Press feedback is a short scale. It is not a spring. People-list chevrons turn over `0.3s ease`.

`prefers-reduced-motion` turns scroll smoothing and those transitions off. Scroll diagrams then show their finished state, or the full list of steps, instead of a scrubbed animation. The spacecraft separation snaps instead of easing. `prefers-reduced-transparency` drops the blur and uses solid black. `prefers-contrast: more` uses solid black and white rules.

## What to keep

Keep the spacecraft white. Keep the transfer path white. Keep mint and cyan for particle directions. Do not add a second typeface or a colored brand fill behind the chapters.
