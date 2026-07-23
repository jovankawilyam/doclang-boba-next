# Doclang Boba NextJS — Build Plan

## Phase 1: Project Init
- [ ] `npx create-next-app@latest doclang-boba-next --typescript --tailwind --app`
- [ ] Install deps: `google-spreadsheet`, `googleapis`, `lucide-react`, `react-hook-form`, `zod`, `@hookform/resolvers`
- [ ] Set up folder structure

## Phase 2: Google APIs
- [ ] Create Google Cloud Project
- [ ] Enable Sheets API + Drive API
- [ ] Create Service Account + download JSON key
- [ ] Share spreadsheet with Service Account email
- [ ] Map spreadsheet column headers to form field names

## Phase 3: Pages
- [ ] `/` — Landing + Lacak (search by ticket ID from spreadsheet)
- [ ] `/form` — Multi-step form (identical to current Laravel version)
- [ ] `/persyaratan` — Static requirements page

## Phase 4: API Routes
- [ ] `POST /api/permohonan` — Submit form → write to spreadsheet + upload files to Drive
- [ ] `GET /api/lacak` — Search ticket by ID → read from spreadsheet
- [ ] `POST /api/upload` — Upload file to Google Drive

## Phase 5: WhatsApp (Future)
- [ ] Decide provider
- [ ] Implement notification on form submit
- [ ] Implement invalid notification trigger

## Phase 6: Polish
- [ ] Copy UI styling from Laravel (colors, components, layout)
- [ ] Responsive design
- [ ] Deploy (Vercel / Railway / VPS)
