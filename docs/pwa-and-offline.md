# Progressive Web App (PWA) & Offline Architecture

## Overview

RoofToGrid is architected as an installable Progressive Web App (PWA) compliant with modern W3C standards, delivering app-like performance on Android and iOS devices without requiring an app store download.

---

## 1. Web App Manifest (`app/manifest.ts`)
- Configured dynamically via Next.js metadata route:
  - **Name**: RoofToGrid — India's Rooftop Solar Platform
  - **Short Name**: RoofToGrid
  - **Start URL**: `/`
  - **Display**: `standalone` (removes browser navigation chrome)
  - **Theme Color**: `#0F172A` (Slate 900)
  - **Background Color**: `#FFFFFF`
  - **Icons**: Standard 192x192, 512x512, and maskable application icons.

---

## 2. Service Worker (`public/sw.js`)

### Caching Strategy
- **Static Core Assets & Shell**: Cache-first strategy for app shell assets, fonts, icons, and CSS bundles.
- **Authenticated and API routes**: Network-only. Private or stale account data is not placed in the public app-shell cache.
- **Offline Fallback Page**: If network is entirely unavailable and asset is not yet cached, serves a branded offline fallback screen advising user to reconnect.

### Lifecycle Management (`ServiceWorkerRegister.tsx`)
- Registers on initial client hydration after browser idle.
- Listens for background updates and smoothly transitions to new service worker builds without jarring UI reloads.

---

## 3. Mobile Ergonomics (`MobileBottomNav.tsx`)
- Sticky bottom navigation bar optimized for 1-thumb mobile navigation:
  - **Dashboard** (`/dashboard`)
  - **Sizing** (`/sizing`)
  - **Quotes** (`/quotes`)
  - **Tracker** (`/projects`)
  - **Profile** (`/profile`)
- Automatically hidden on desktop viewports (`hidden md:flex`).
