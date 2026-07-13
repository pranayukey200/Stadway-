# Smart Stadiums & Tournament Operations — 3D Website Build Pack
For: Challenge 4 (FIFA World Cup 2026 GenAI Hackathon) — prompt to run in Antigravity

---

## 1. Resource Pack (assets, libraries, repos, inspiration)

### 3D / Scroll-animation engines (pick the stack)
- **React Three Fiber + Drei** — `@react-three/fiber`, `@react-three/drei` — https://github.com/pmndrs/react-three-fiber
- **GSAP + ScrollTrigger** for scroll-synced camera/timeline animation — https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- **r3f-scroll-rig** (14islands) — syncs DOM sections to WebGL meshes, good for "content over 3D scene" layouts — https://github.com/14islands/r3f-scroll-rig
- **Wawa Sensei scroll tutorial** — the actual pattern (GLTF model + `useScroll` + gsap timeline seeked by scroll offset) to copy — https://wawasensei.dev/tuto/react-three-fiber-tutorial-scroll-animations
- **Lenis** (smooth scroll) — pairs well with GSAP/R3F for the "buttery" scroll feel
- **Spline** (https://spline.design) — if you want a no-code 3D scene (stadium, hologram, AI orb) exported as `.splinecode` and embedded via `@splinetool/react-spline` — fastest path to a good-looking 3D hero without writing shader/GLTF code yourself
- Reference repo showing R3F+GSAP scroll pinned sections + parallax + scroll-synced video: "GTA VI website recreation" repos on GitHub (search `gta-vi-clone gsap scrolltrigger`) — good structural reference for pinned full-bleed sections

### Free 3D stadium / sports models (glb/gltf, for the hero scene or "digital twin" section)
- Sketchfab stadium tag (filter by "Downloadable" + CC license): https://sketchfab.com/tags/stadium and https://sketchfab.com/tags/soccer-stadium
- Low Poly Stadium (free, CC Attribution) — https://sketchfab.com/3d-models/low-poly-stadium-e338c8ecbac5465b94106516f371f22c
- Low Poly Football Stadium (free, CC Attribution) — https://sketchfab.com/3d-models/low-poly-football-stadium-2ef76246010e435eafb316539cd9c260
- Low Poly Stadium (free) — https://sketchfab.com/3d-models/low-poly-stadium-999bd88971ae49338a3263027895bebe
> Download as glTF/GLB, run through `gltfjsx` (https://github.com/pmndrs/gltfjsx) to turn into a React component. Always check each model's license before shipping.

### Free stadium / crowd / drone stock video (background reels, section headers)
- Mixkit stadium clips (no watermark, free license) — https://mixkit.co/free-stock-video/stadium/
- Mixkit crowd clips — https://mixkit.co/free-stock-video/crowd/
- Mixkit drone clips (for aerial "digital twin" transitions) — https://mixkit.co/free-stock-video/drone/
- Pexels stadium crowd videos (free, no attribution required) — https://www.pexels.com/search/videos/stadium%20crowd/
- Pexels drone-over-stadium clip — https://www.pexels.com/video/drone-footage-of-a-concert-performance-at-the-stadium-with-the-audience-crowd-3895039/
- Pixabay stadium videos (royalty-free) — https://pixabay.com/videos/search/stadium/
- Coverr stadium footage — https://coverr.co/stock-video-footage/stadium
> Use these as: (1) fullscreen looped `<video>` hero background, (2) section-transition B-roll, (3) muted ambient texture behind glass-morphism cards. Compress with Handbrake/ffmpeg to <8MB per loop for web performance.

### Icons
- **Lucide React** (already used in your hero example) — good matches for this theme: `ScanLine`/`QrCode` (ticket/entry), `MapPin`/`Navigation` (wayfinding), `Users`/`UserCheck` (crowd density), `Globe`/`Languages` (multilingual assistant), `Accessibility`, `Bus`/`TrainFront` (transport), `Leaf`/`Recycle` (sustainability), `Radio`/`Activity` (real-time ops), `ShieldAlert` (safety), `Bot`/`Sparkles` (GenAI)
- **Phosphor Icons** as an alternate/duotone set if you want a more "control-room HUD" feel — https://phosphoricons.com

### Fonts (stadium / broadcast / futuristic feel)
- **Display/Hero**: "Unbounded" or "Bebas Neue" (Google Fonts) — bold condensed, reads like a scoreboard/jersey number
- **Body/UI**: "Inter" or "Space Grotesk" (Google Fonts) — clean, technical, good for data-dense HUD panels
- **Data/mono accents** (for live stats, timers, coordinates): "JetBrains Mono" or "Space Mono"

### Imagery (for non-video sections: staff dashboards, fan app mockups, accessibility)
Search terms to pull consistent, on-theme photography from Pexels/Unsplash/Pixabay (all free, no attribution required):
- "stadium control room screens" / "operations center dashboard"
- "football fans stadium entrance gate" (for the AI wayfinding section)
- "stadium volunteer staff" 
- "accessible seating stadium wheelchair"
- "stadium aerial night lights"
- "electric shuttle bus transport" (sustainability/transport section)
- "AI chatbot interface mockup screen" (for the GenAI assistant section — better to actually design this as a real UI mockup in the site itself rather than a stock photo)

### Direct design/inspiration references (structure, not to copy verbatim)
- Awwwards "Sports" and "3D" categories — https://www.awwwards.com/websites/sports/ and https://www.awwwards.com/websites/3d/
- FIFA World Cup 26 official site — https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026 (for correct 2026 branding cues: colors, wordmark tone — do not copy logos/trademarks, just tone)
- Codrops (Tympanus) — scroll-driven 3D article, good technical reference for shader-driven scroll scenes — https://tympanus.net/codrops/

### Rights/safety note
Don't reuse FIFA's actual logo, mascot, or trademarked marks — those are protected IP. Build an original "VANGUARD-style" fictional brand identity inspired by the tournament theme (e.g., a fictional ops-platform name like "MATCHDAY OS", "PITCHSIGHT", "STADIA.AI") rather than an unofficial FIFA-branded product, since this is a hackathon concept site, not a licensed FIFA deliverable.

---

## 2. The Combined Master Prompt — paste this into Antigravity

```
ROLE
You are an expert frontend engineer, 3D web developer (Three.js / React Three Fiber), and motion designer. Convert the current design system (Maximalism/Dopamine tokens: 5-accent rotating palette on #0D0D1A, stacked hard+glow shadows, thick clashing borders, oversized uppercase display type, layered background patterns) into a fully 3D, scroll-animated single-page website.

PROJECT
Build "STADIA.AI" (working name — an original, non-FIFA-affiliated fictional brand) — a landing page pitching a GenAI-powered Smart Stadium & Tournament Operations platform, built for a hackathon challenge themed:
"Smart Stadiums & Tournament Operations — a GenAI-enabled solution that enhances stadium operations and the overall tournament experience for fans, organizers, volunteers, and venue staff, improving navigation, crowd management, accessibility, transportation, sustainability, multilingual assistance, operational intelligence, and real-time decision support during a major international football tournament."

Do NOT use FIFA's name, logo, mascot, or official 2026 branding assets — use generic "World Cup era global football tournament" language and original visual identity only.

STACK
- Vite + React + TypeScript
- Tailwind CSS (v4 arbitrary-value syntax) for layout/utility classes
- react-three-fiber + @react-three/drei for the 3D scene
- GSAP + ScrollTrigger (or @14islands/r3f-scroll-rig) to drive the 3D scene from scroll position — follow the pattern of seeking a GSAP timeline via useFrame + useScroll offset
- Lenis for smooth inertial scrolling
- lucide-react for icons

3D SCENE REQUIREMENTS
- A single persistent WebGL canvas that runs behind/through the whole page (not per-section canvases) — camera moves, rotates, and dollies as the user scrolls, revealing a different "stage" of the stadium story at each section.
- Import a free low-poly stadium GLB model (convert via gltfjsx), positioned as the anchor object. Camera starts high above (bird's-eye "digital twin" view) and descends into the bowl, then into the concourse, then into a HUD/data-overlay close-up as the user scrolls.
- Floating holographic data-panels (translucent glass planes with glowing edges, one of the 5 accent colors each) orbit or drift near the stadium model — representing live crowd density, gate wait times, sustainability metrics, multilingual chat bubbles — animate with the float/pulse-glow keyframes from the design system.
- Particle field (stars/sparks in accent colors) in the deep background for depth.
- Add a looped, muted, autoplay background video (from Mixkit/Pexels stadium-crowd or drone footage — placeholder URL is fine, note where to swap in the real asset) composited behind the 3D canvas in the hero section only, with the WebGL scene and glass UI on top.

SECTIONS (each is a scroll "stage" with its own camera position + one dominant accent color per the design system's rotation rule)
1. HERO — massive uppercase display headline ("SEE EVERY MATCH. MANAGE EVERY MOMENT.") over the descending drone shot into the stadium bowl, tagline about GenAI-powered operations, primary CTA button (gradient + clashing border + stacked shadow per design system).
2. NAVIGATION / WAYFINDING — 3D scene shows a stylized concourse with a glowing path line guiding a fan icon to their seat/gate; UI cards describe the GenAI multilingual wayfinding assistant.
3. CROWD & SAFETY INTELLIGENCE — camera pulls back to bowl-level heatmap overlay (color-coded density blobs on the 3D seating bowl); cards describe real-time crowd prediction and volunteer/staff alerts.
4. ACCESSIBILITY & MULTILINGUAL ASSISTANT — a floating holographic chat-bubble UI mockup (not a stock photo — actually build a small chat widget component) showing a GenAI assistant answering in multiple languages / flagging accessible routes.
5. TRANSPORT & SUSTAINABILITY — camera pans outside the stadium to a stylized transit/shuttle line; stats row (buses rerouted, emissions saved, avg wait time) using the design system's big-number stat pattern.
6. OPERATIONAL INTELLIGENCE (control room) — camera settles into a HUD dashboard view: live tiles for gate throughput, incident alerts, volunteer deployment, staffing gaps, each a glassmorphic card with stacked shadow + accent border.
7. CTA / FOOTER — closing statement, "Request a Demo" button, footer nav, small print noting this is a hackathon concept (not an official FIFA product).

MOTION RULES
- Reuse the existing fade-up / fade-up-delay-1..4 keyframe system for all HTML overlay content entering each section.
- Drive the 3D camera path with a GSAP timeline scrubbed by scroll progress (ScrollTrigger `scrub: true` or the useScroll().offset pattern) — smooth, cinematic, not jumpy.
- Respect prefers-reduced-motion: fall back to static camera positions per section and disable continuous float/pulse/spin animations, but keep colors/shadows/borders intact.
- Keep 60fps target: use transform/opacity only for DOM motion, cap particle counts, and lazy-mount off-screen 3D detail.

DELIVERABLE
Single Vite React+TS app, mobile-first responsive (on mobile: disable the heavy WebGL scrub-camera and instead show a lighter looping 3D hero + static imagery per section, per the design system's "keep chaos, just stack it vertically" mobile rule). Note clearly in code comments where I need to swap in: (a) the real stadium GLB path, (b) the real background video URL, (c) real GenAI assistant copy/screenshots once available.
```

---

### How to use this
1. Paste the block inside the triple backticks into Antigravity as your build instruction.
2. Attach/reference the existing design-system doc and the VANGUARD hero example doc alongside it so Antigravity inherits the token system and coding conventions.
3. Swap in real asset URLs from the resource pack above once you've downloaded/licensed them.
