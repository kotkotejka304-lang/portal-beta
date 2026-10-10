# Portal — Liquid Glass Web Browser & Arcade

**Portal** is a premium, Apple-inspired web browser and discovery interface built with React, TypeScript, and Tailwind CSS. Featuring the **Liquid Glass** design language, it runs inside standard web browsers on desktop and school-issued iPads without external API keys, tracking, or proxies.

---

## 1. Liquid Glass Design & Architecture

- **Apple Liquid Glass Aesthetic**: Translucent frosted surfaces (`backdrop-blur-2xl`), multi-layered specular edge highlights (`shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]`), deep charcoal glass tones, and glowing mint accents.
- **Portal Arcade Hub**: Integrated gaming discovery hub featuring hero spotlights, genre filters (Arcade, Puzzle, Action, Strategy), ratings, instant play badges, and favorites tracking.
- **5 Original Built-in Mini-Games**:
  1. **Cyber Snake** (`portal://game/snake`): High-speed neon serpent with particle trails, speed bonuses, on-screen touch D-Pad, and Web Audio chimes.
  2. **Liquid Breakout** (`portal://game/breakout`): Frosted glass brick breaker with paddle spin physics, multi-colored brick tiers, and glass shatter particles.
  3. **Quantum 2048** (`portal://game/2048`): Apple Liquid Glass sliding tile puzzle with undo move support, silky transitions, and swipe touch gestures.
  4. **Orbital Defender** (`portal://game/orbital`): 360° space interceptor physics shooter, thrust exhaust particles, and crystal asteroid splitting.
  5. **Glass Reflex Matrix** (`portal://game/reflex`): High-speed cognitive memory recall training with glowing musical pads and increasing complexity.
- **Zero External Assets Synthesizer**: Web Audio API audio synthesizer (`src/utils/audio.ts`) providing crisp chimes, laser zaps, score chimes, and thuds without network latency or external audio files.
- **Multi-Tab Engine**: Open, switch, and close unlimited tabs (`Cmd/Ctrl+T`, `Cmd/Ctrl+W`). Tabs can render web pages, internal discovery pages, or full mini-games.
- **Omnibox & URL Engine**: Automatic HTTPS normalization, strict protocol sanitization (blocking `javascript:`, `file:`, `data:`), and search redirection.
- **Honest Embed Diagnostics**: Transparent detection of `X-Frame-Options` and CSP `frame-ancestors` restrictions with instant one-click external window fallback.
- **100% LocalStorage Persistence**: Bookmarks, history, session tabs, and settings are preserved in local storage.

---

## 2. File Structure

```text
├── index.html                      # HTML entry point with Plus Jakarta Sans & JetBrains Mono
├── metadata.json                   # Applet metadata configuration
├── package.json                    # Dependencies & npm scripts
├── tsconfig.json                   # TypeScript compiler configuration
├── vite.config.ts                  # Vite build tooling with React & Tailwind plugins
├── src/
│   ├── main.tsx                    # React application bootstrap
│   ├── App.tsx                     # Main browser shell & state coordination
│   ├── index.css                   # Liquid Glass styles, glass-panel, glass-card classes
│   ├── types/
│   │   └── browser.ts              # Tab, Game, Bookmark, History, Settings interfaces
│   ├── utils/
│   │   ├── audio.ts                # Web Audio API sound effects synthesizer
│   │   ├── games.ts                # Built-in and curated games registry
│   │   ├── url.ts                  # URL sanitation, scheme validation, embed check
│   │   └── storage.ts              # LocalStorage persistence & settings defaults
│   └── components/
│       ├── TabBar.tsx              # Liquid Glass floating tab strip with glowing indicators
│       ├── NavigationToolbar.tsx   # Glass Omnibar, arcade quick button, security lock
│       ├── BookmarksBar.tsx        # Translucent quick-access bookmarks toolbar
│       ├── WelcomePage.tsx         # Discovery Hub with Arcade & Web Navigator views
│       ├── WebView.tsx             # Sandboxed iframe viewer & game router
│       ├── HistoryDrawer.tsx       # Liquid Glass history drawer with search & clear
│       ├── BookmarksModal.tsx      # Comprehensive bookmarks manager modal
│       ├── SettingsModal.tsx       # Browser preferences & sandbox permission controls
│       ├── SecurityInfoModal.tsx   # Architectural disclosure on iframe security & CSP
│       ├── TestPages.tsx           # Controlled embedding denial & embeddable site tests
│       └── games/
│           ├── GameContainer.tsx   # Apple Liquid Glass game wrapper with audio & controls
│           ├── SnakeGame.tsx       # Cyber Snake mini-game
│           ├── BreakoutGame.tsx    # Liquid Breakout mini-game
│           ├── Game2048.tsx        # Quantum 2048 mini-game
│           ├── OrbitalGame.tsx     # Orbital Defender mini-game
│           └── ReflexGame.tsx      # Glass Reflex Matrix mini-game
```

---

## 3. Development & Build

```bash
# Start development server
npm run dev

# Run type checker
npm run lint

# Build production bundle
npm run build
```
