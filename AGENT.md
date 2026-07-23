# Doclang Boba NextJS — Agent Memory

## Project Goal
Rebuild the public-facing pages of Doclang Boba (KPKNL Bogor) from Laravel+MySQL to **NextJS App Router + Google Spreadsheet**. Back office/admin stays in existing Google Spreadsheet. This project (Laravel) is the reference for UI/behavior.

## Key Decisions (2026-07-22)
- **Stack:** NextJS (App Router), TypeScript, Tailwind CSS
- **Database:** Google Spreadsheet (existing spreadsheet from KPKNL Bogor) — no MySQL
- **File Upload:** Google Drive API via Service Account; store file IDs/links in spreadsheet cells
- **WhatsApp:** Undecided (Meta Cloud API / Fonnte / self-hosted — TBD later)
- **Auth:** None for public pages. Admin is spreadsheet-only (no admin UI in web)

## Pages Built (Phase 1 — UI without backend)
| Route | Status | Description |
|---|---|---|
| `/` | ✅ | Landing (hero, lacak/search, layanan cards, stats) |
| `/form` | ✅ | Multi-step form (5 steps: pilih layanan → data pemohon → data permohonan → upload → konfirmasi) |
| `/persyaratan` | ✅ | Document requirements per service type |

## Phase 1 Complete (2026-07-22)
- [x] Install deps: `google-spreadsheet`, `googleapis`, `lucide-react`, `react-hook-form`, `zod`, `@hookform/resolvers`
- [x] Setup folder structure (components, lib, types, api routes)
- [x] Layout with Navbar + Footer + Floating WA button
- [x] Brand colors: `#123C69` (navy), `#C7D2E3`, `#F4F7FB`, `#f28e2b` (orange), `#1E56A0`
- [x] Landing page with hero, lacak search, layanan cards
- [x] Multi-step form page (UI only, no backend)
- [x] Persyaratan page static content

## Backlog
- [ ] Google Sheets integration (Service Account, Sheets API)
- [ ] Google Drive integration (file upload)
- [ ] Form submission → write to spreadsheet
- [ ] Lacak → read from spreadsheet
- [ ] WhatsApp notification (future)
- [ ] Deploy

## WhatsApp Messages (Current Laravel Reference)
- **Submission:** Includes Waktu Pengerjaan (Kuitansi=3hr, RL=5hr, Validasi PPh=7hr)
- **Invalid:** Sent manually by admin with rejection notes
- Implementation uses self-hosted `whatsapp-web.js` gateway

## UI Reference
- Brand colors: `#123C69` (navy), `#C7D2E3`, `#F4F7FB`, `#f28e2b` (orange), `#1E56A0`
- Floating WhatsApp button → `https://wa.me/6282323040445`
- Footer with KPKNL Bogor address + social links

## Data Flow
```
User → NextJS (Form submit) → Google Sheets API → Write row
                            → Google Drive API → Upload file → Save link
                            → (Future: WhatsApp API → Send notification)

User → NextJS (Lacak) → Google Sheets API → Read row → Display status
```
