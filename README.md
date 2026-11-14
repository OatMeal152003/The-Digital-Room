# The Digital Room

> An immersive 3D room. The objects are the navigation. The environment is the experience.

A browser museum in a single room. Built with [Next.js](https://nextjs.org), [React Three Fiber](https://docs.pmnd.rs/react-three-fiber), [drei](https://github.com/pmndrs/drei), [GSAP](https://gsap.com) and Tailwind. No page transitions, no menus, no links — you look, you touch, the room answers.

## How to visit

Move the mouse (or drag a finger) — the room leans toward you. Click anything that glows.

### In the room — eight exhibits

| Exhibit | When you touch it |
| --- | --- |
| **The monitor** | A `digital.room` browser opens — tabs switch, `Esc` closes it. Home is `src/content/projects.json`. |
| **The bookshelf** | Pull a volume and read it in place. The spines are `src/content/books.json`. |
| **The record player** | Drag the tonearm and mix the room's three lamps. The sleeve card carries the track notes. |
| **The camera** | A contact sheet of the evening's photographs (`src/content/photos.json`). |
| **The window** | A slow pan across the view. |
| **The drawer** | It holds the guestbook — and a quiet green octahedron. |
| **The door** | Walks you through to the Long Hall. |
| **The wall switch** | No placard, no marker of its own — the lamps answer instead. |

### Through the door — the Long Hall

Four paintings and three sculptures hang under the track lights, and a bench sits you down facing the collection. The brass plate by the doorway walks you back.

- The paintings are the **evening collection** — `src/content/paintings.json`, with tombstones and notes at table-label size.
- The sculptures each keep their own files.
- The niche at the end of the hall stays lit.

## Design notes

- **Objects are navigation.** There is no hamburger menu and no URL bar; the placards on the walls and the markers above the furniture *are* the site map. If an exhibit has been touched, its marker retires for good.
- **The room remembers your evenings.** Visits are counted, exhibits are tracked as *visited*, and a returning visitor gets the short title card instead of the long one — `localStorage`, nothing more.
- **Light is the interface.** A three-channel mix warms or cools the lamps; the pilot light above the switch tells you which state the room is in; the hallway track lights follow the middle channel.
- **Reduced motion is honored.** Everything can be skipped straight to the result.
- **Content is data.** Every artifact — paintings, sculptures, books, records, projects, links, notes — lives in `src/content/*.json`, parsed at load time by Zod schemas in `src/types/content.ts`.

## Tech

| Layer | Choice |
| --- | --- |
| Framework | [Next.js](https://nextjs.org) 16 · [React](https://react.dev) 19 |
| 3D | [Three.js](https://threejs.org) + [react-three-fiber](https://docs.pmnd.rs/react-three-fiber) + [drei](https://github.com/pmndrs/drei) + [postprocessing](https://github.com/pmndrs/react-postprocessing) |
| Motion | [GSAP](https://gsap.com) with `prefers-reduced-motion` fallbacks |
| Style | [Tailwind CSS 4](https://tailwindcss.com) · Bodoni Moda for the museum's voice, Geist for the chrome |
| State | [Zustand](https://zustand.docs.pmnd.rs) for the room, `[Zod](https://zod.dev)` for the content |
| Deploy | Vercel — no environment variables, see [DEPLOY.md](./DEPLOY.md) |

## Getting started

```bash
npm install
npm run dev
# open http://localhost:3000
```

Build checks before pushing: `npx tsc --noEmit && npm run build`.

## Project structure

```
src/
  app/
    page.tsx            # the stage: room underneath, title card on top
    layout.tsx          # fonts and the void
    loading.tsx
    error.tsx
  features/
    room/               # the room itself: scene, camera rig, lighting,
                        # markers, the hall, the intro card, the visitor guide
    objects/            # the exhibits: monitor, books, record, camera,
                        # window, drawer, door, switch
    audio/
  content/              # the collection — JSON, schematized by Zod
  types/
```

---

*The room remembers your evenings.*