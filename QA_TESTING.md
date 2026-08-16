# FULL QA AUDIT & END-TO-END TESTING — DOCLANG BOBA

Kamu bertindak sebagai **Senior QA Engineer, Full-Stack Engineer, Security Auditor, dan Code Reviewer**.

Project yang sedang kamu audit adalah:

**Doclang Boba — Dokumen Pasca Lelang Bogor Bageur**

Project ini sudah berada pada tahap **siap digunakan**, sehingga tujuan utama kamu bukan membuat fitur baru, tetapi memastikan bahwa seluruh sistem benar-benar siap digunakan oleh user nyata.

## TUJUAN UTAMA

Lakukan audit dan testing menyeluruh terhadap aplikasi dari:

1. Frontend
2. Backend
3. Database
4. API
5. Authentication & Authorization
6. Business Logic
7. Form validation
8. CRUD
9. Workflow dokumen
10. Admin & Super Admin
11. User/pegawai
12. Error handling
13. Security
14. Responsive UI
15. Integrasi frontend-backend
16. Konsistensi data
17. Edge cases
18. Production readiness

JANGAN hanya membaca source code.

Kamu WAJIB melakukan kombinasi:

* Static code analysis
* Source code review
* Database/schema inspection
* API inspection
* Automated testing jika tersedia
* Manual testing menggunakan browser jika environment mendukung
* End-to-end workflow testing
* Negative testing
* Edge-case testing

---

# ATURAN PENTING

## 1. JANGAN MENGUBAH SOURCE CODE DI AWAL

Sebelum melakukan perubahan apa pun:

* pahami struktur project
* identifikasi frontend
* identifikasi backend
* identifikasi database
* identifikasi authentication
* identifikasi seluruh route
* identifikasi API
* identifikasi role/permission
* identifikasi workflow utama

Jangan langsung memperbaiki bug.

Pertama lakukan AUDIT.

---

# PHASE 1 — PROJECT DISCOVERY

Periksa seluruh struktur project.

Cari dan pahami:

* package.json
* composer.json
* .env.example
* konfigurasi Laravel
* konfigurasi Next.js/Vite jika ada
* routes
* controllers
* models
* migrations
* seeders
* middleware
* policies
* services
* requests/validation
* API
* frontend pages
* components
* hooks
* state management
* utility/helper
* authentication
* authorization
* database relationship

Buat pemetaan:

FRONTEND
↓
API / HTTP REQUEST
↓
BACKEND ROUTE
↓
CONTROLLER
↓
SERVICE / LOGIC
↓
MODEL
↓
DATABASE

Pastikan setiap alur benar-benar terhubung.

---

# PHASE 2 — IDENTIFIKASI BUSINESS FLOW

Pahami terlebih dahulu business process Doclang Boba.

Cari dari source code bagaimana alur berikut bekerja:

### User/Pegawai

Login
→ Dashboard
→ Melihat data
→ Membuat/menginput data jika diperbolehkan
→ Mengunggah/mengelola dokumen
→ Melihat status
→ Tracking dokumen
→ Logout

### Admin

Login
→ Dashboard Admin
→ Melihat data
→ Mengelola data
→ Memproses dokumen
→ Mengubah status
→ Monitoring workflow
→ Logout

### Super Admin

Login
→ Dashboard Super Admin
→ User management
→ Role/permission
→ Data management
→ Monitoring sistem
→ Logout

JANGAN berasumsi workflow di atas benar.

Verifikasi berdasarkan source code yang sebenarnya.

Jika menemukan workflow berbeda, dokumentasikan.

---

# PHASE 3 — AUTHENTICATION TEST

Test seluruh authentication.

### Test:

* login dengan credential valid
* login dengan password salah
* login dengan email/user tidak terdaftar
* field kosong
* format email invalid
* password kosong
* logout
* akses halaman protected tanpa login
* akses API protected tanpa authentication
* session expiration
* refresh browser setelah login
* membuka URL dashboard secara langsung
* mencoba kembali ke halaman protected setelah logout

Pastikan:

* user yang belum login tidak dapat mengakses halaman private
* backend juga melakukan protection
* bukan hanya frontend redirect
* token/session ditangani dengan benar

Cari kemungkinan:

* authentication bypass
* insecure session
* privilege escalation
* route yang lupa middleware

---

# PHASE 4 — AUTHORIZATION / ROLE TEST

Ini WAJIB diuji.

Identifikasi seluruh role yang tersedia.

Untuk setiap role, test:

### User biasa

Apakah bisa:

* mengakses dashboard admin?
* mengakses endpoint admin?
* menghapus data admin?
* mengubah status yang seharusnya hanya admin?
* mengakses user management?
* mengakses super admin?

### Admin

Apakah bisa mengakses fitur super admin?

### Super Admin

Pastikan memiliki permission sesuai desain.

Test juga dengan cara:

* mengganti URL secara manual
* memanggil endpoint langsung
* mengubah parameter ID
* mencoba endpoint yang bukan miliknya

Pastikan authorization dilakukan di BACKEND, bukan hanya menyembunyikan tombol di frontend.

---

# PHASE 5 — DATABASE AUDIT

Periksa seluruh migration dan database relationship.

Audit:

* primary key
* foreign key
* nullable field
* unique constraint
* index
* cascade behavior
* timestamps
* soft delete
* relationship antar model

Cari kemungkinan:

* orphan records
* duplicate data
* foreign key tidak aman
* data dapat dihapus ketika masih digunakan
* relationship salah
* missing index
* inconsistent data type

Periksa juga:

* Model relationship
* belongsTo
* hasMany
* hasOne
* belongsToMany

Pastikan relationship sesuai business logic.

---

# PHASE 6 — CRUD TEST

Untuk SETIAP fitur CRUD:

### CREATE

Test:

* data valid
* data kosong
* data duplicate
* data terlalu panjang
* tipe data salah
* karakter aneh
* field wajib tidak diisi

### READ

Test:

* data tersedia
* data kosong
* pagination
* search
* filter
* sorting
* detail data

### UPDATE

Test:

* update normal
* update sebagian field
* update invalid
* update ID yang tidak ada
* update data milik user lain

### DELETE

Test:

* delete normal
* delete data tidak ada
* delete data yang masih memiliki dependency
* delete tanpa permission

Pastikan response backend benar.

---

# PHASE 7 — DOCUMENT WORKFLOW TEST

Ini merupakan salah satu bagian PALING PENTING.

Pahami bagaimana sistem Doclang Boba menangani dokumen pasca lelang.

Identifikasi:

* jenis dokumen
* status dokumen
* status workflow
* siapa yang boleh mengubah status
* kapan status berubah
* apakah ada validasi
* apakah perubahan status tercatat

Kemudian test:

VALID FLOW

Dokumen dibuat
→ diproses
→ status berubah
→ data tersimpan
→ user melihat status terbaru

INVALID FLOW

Coba:

* melompati status
* mengubah status tanpa permission
* mengubah dokumen yang bukan miliknya
* mengirim status yang tidak tersedia
* mengirim ID dokumen palsu
* mengirim request duplicate
* refresh setelah submit

Pastikan workflow tidak bisa dirusak oleh request manual.

---

# PHASE 8 — FILE UPLOAD TEST

Jika sistem memiliki upload dokumen, test:

* file valid
* file kosong
* file terlalu besar
* extension tidak diperbolehkan
* MIME type salah
* filename aneh
* duplicate file
* file corrupt
* upload tanpa authentication
* upload ke record yang bukan miliknya

Periksa:

* validation backend
* storage
* filename handling
* access control
* URL file
* kemungkinan executable upload
* kemungkinan path traversal

Jangan menghapus file production/user tanpa izin.

---

# PHASE 9 — API AUDIT

Identifikasi seluruh API endpoint.

Buat tabel:

| Method | Endpoint | Auth | Role | Purpose | Validation | Status |
| ------ | -------- | ---- | ---- | ------- | ---------- | ------ |

Test setiap endpoint.

Untuk setiap endpoint:

* valid request
* invalid request
* missing field
* wrong type
* unauthorized
* forbidden
* nonexistent ID
* duplicate request
* malformed request

Pastikan HTTP status code masuk akal:

* 200 / 201
* 400
* 401
* 403
* 404
* 422
* 500

Cari endpoint yang:

* tidak punya authentication
* tidak punya authorization
* membocorkan data
* menerima input tanpa validation
* mengembalikan error internal ke user

---

# PHASE 10 — FRONTEND AUDIT

Periksa semua halaman.

Untuk setiap halaman:

* apakah loading state tersedia?
* apakah error state tersedia?
* apakah empty state tersedia?
* apakah API failure ditangani?
* apakah tombol bekerja?
* apakah form validation bekerja?
* apakah data benar-benar berasal dari backend?
* apakah data stale?
* apakah refresh mempertahankan state yang seharusnya?
* apakah navigation benar?

Cari:

* console error
* hydration error
* React warning
* broken image
* broken link
* incorrect API URL
* hardcoded data
* fake/mock data yang masih tertinggal
* unused component
* dead code

---

# PHASE 11 — FRONTEND ↔ BACKEND CONSISTENCY

Pastikan field frontend dan backend sama.

Contoh:

Frontend:
name
email
status
document_id

Backend:
name
email
status
document_id

Cari mismatch seperti:

* frontend mengirim `userId`
* backend mengharapkan `user_id`

atau:

* frontend mengharapkan `data`
* backend mengembalikan `result`

Periksa SEMUA endpoint penting.

---

# PHASE 12 — VALIDATION AUDIT

Jangan hanya percaya validation frontend.

Pastikan backend juga melakukan validation.

Test:

* required
* min/max
* string
* integer
* email
* enum/status
* date
* file
* unique
* exists

Coba bypass frontend dengan request langsung.

Jika backend menerima data yang seharusnya ditolak → FLAG AS BUG.

---

# PHASE 13 — SECURITY AUDIT

Lakukan audit keamanan dasar.

Cari:

* SQL injection
* XSS
* CSRF
* IDOR
* authentication bypass
* authorization bypass
* mass assignment
* sensitive data exposure
* hardcoded credentials
* exposed API keys
* secret di frontend
* insecure file upload
* path traversal
* excessive data exposure
* debug mode
* stack trace exposure

JANGAN melakukan destructive attack.

Gunakan payload aman untuk membuktikan vulnerability.

Jika menemukan secret/API key/password:

JANGAN tampilkan nilainya di report.

Cukup tulis:

`SECRET EXPOSED — location: ...`

---

# PHASE 14 — EDGE CASE TESTING

Test kondisi yang sering dilupakan developer:

* database kosong
* hanya ada 1 data
* ribuan data
* nama sangat panjang
* input dengan emoji
* input bahasa Indonesia
* special characters
* duplicate data
* ID tidak ditemukan
* network lambat
* API timeout
* API 500
* user refresh ketika submit
* double click submit
* membuka dua tab
* session expired ketika sedang mengisi form

---

# PHASE 15 — RESPONSIVE TEST

Jika browser testing tersedia, test minimal:

* Desktop
* Tablet
* Mobile

Periksa:

* navbar
* sidebar
* dashboard
* table
* form
* modal
* button
* typography
* overflow
* horizontal scrolling
* document viewer
* upload UI

Jangan hanya melihat apakah halaman "muncul".

Cari masalah usability.

---

# PHASE 16 — PERFORMANCE

Cari bottleneck:

Backend:

* N+1 query
* query berulang
* eager loading yang kurang
* query terlalu berat
* pagination tidak digunakan

Frontend:

* unnecessary re-render
* excessive API request
* fetch duplicate
* huge component
* large asset
* unnecessary dependency

Jika menemukan masalah performance, klasifikasikan:

LOW / MEDIUM / HIGH / CRITICAL

---

# PHASE 17 — ERROR HANDLING

Pastikan sistem tidak crash ketika:

* API down
* database error
* invalid input
* unauthorized
* record tidak ditemukan
* upload gagal
* network disconnected

User harus mendapatkan error yang jelas.

Jangan menampilkan:

* SQL query
* stack trace
* secret
* internal server path
* sensitive backend information

---

# PHASE 18 — TEST SCENARIO END-TO-END

Lakukan simulasi seperti USER NYATA.

## Scenario A — User

1. Buka website
2. Login
3. Masuk dashboard
4. Melihat data
5. Membuka detail
6. Melakukan action yang diperbolehkan
7. Memastikan data tersimpan
8. Refresh
9. Pastikan data tetap benar
10. Logout
11. Coba kembali ke dashboard

## Scenario B — Admin

1. Login admin
2. Membuka dashboard
3. Melihat data
4. Mengelola data
5. Memproses workflow
6. Mengubah status
7. Refresh
8. Pastikan status tetap benar
9. Logout

## Scenario C — Unauthorized User

1. Login sebagai user biasa
2. Coba akses URL admin
3. Coba endpoint admin
4. Coba mengubah data yang bukan haknya
5. Pastikan semuanya ditolak

---

# PHASE 19 — BUG CLASSIFICATION

Setiap masalah yang ditemukan harus dikategorikan:

### CRITICAL

Sistem tidak aman / workflow rusak / kehilangan data / authentication bypass.

### HIGH

Fitur utama tidak berjalan atau data dapat dimanipulasi.

### MEDIUM

Fitur berjalan tetapi terdapat masalah logic atau UX signifikan.

### LOW

Minor UI issue / warning / improvement.

---

# PHASE 20 — FIX

SETELAH seluruh audit selesai:

Jangan langsung memperbaiki semua hal tanpa laporan.

Buat terlebih dahulu:

1. Audit result
2. Bug list
3. Severity
4. Root cause
5. Recommended fix

Kemudian, jika bug tersebut jelas dan aman untuk diperbaiki:

* perbaiki bug
* jangan mengubah business logic yang memang sudah benar
* jangan membuat fitur baru
* jangan melakukan refactor besar tanpa alasan
* jangan mengubah database production secara destructive

Setelah memperbaiki bug:

WAJIB TEST ULANG.

---

# FINAL REPORT

Buat laporan akhir dengan format:

## 1. Overall Status

Berikan salah satu:

🟢 READY FOR PRODUCTION
🟡 READY WITH MINOR FIXES
🟠 NOT READY
🔴 CRITICAL ISSUES FOUND

## 2. System Health

Frontend:
[PASS / WARNING / FAIL]

Backend:
[PASS / WARNING / FAIL]

Database:
[PASS / WARNING / FAIL]

API:
[PASS / WARNING / FAIL]

Authentication:
[PASS / WARNING / FAIL]

Authorization:
[PASS / WARNING / FAIL]

Business Logic:
[PASS / WARNING / FAIL]

Security:
[PASS / WARNING / FAIL]

Responsive:
[PASS / WARNING / FAIL]

Performance:
[PASS / WARNING / FAIL]

## 3. Test Summary

Tampilkan:

* total test
* passed
* failed
* skipped
* critical
* high
* medium
* low

## 4. Bugs Found

Untuk setiap bug:

BUG #1

* Severity:
* Location:
* Feature:
* Steps to reproduce:
* Expected:
* Actual:
* Root cause:
* Recommended fix:
* Fixed: YES/NO
* Retested: YES/NO

## 5. Security Findings

Pisahkan security issue dari functional bug.

## 6. Business Logic Findings

Jelaskan jika ada logic yang secara teknis berjalan tetapi tidak sesuai workflow bisnis.

## 7. Final Recommendation

Berikan jawaban tegas:

"Apakah Doclang Boba sudah layak digunakan?"

Jawab:

YES / NO

dan jelaskan alasannya.

---

# ATURAN TERAKHIR

Jangan mengatakan "semua aman" hanya karena aplikasi bisa dibuka.

Jangan mengatakan "PASS" hanya karena halaman tidak error.

Verifikasi data dari:

Frontend
→ API
→ Backend
→ Database

Jika memungkinkan, lakukan pengujian secara langsung.

Jika ada sesuatu yang tidak dapat dites karena environment/credential tidak tersedia, tuliskan secara eksplisit:

`NOT TESTED — REASON: ...`

Jangan mengarang hasil testing.

Prioritaskan:

1. Data integrity
2. Business logic
3. Authentication
4. Authorization
5. Security
6. API correctness
7. Frontend correctness
8. UX
9. Performance

Mulai dari DISCOVERY terlebih dahulu.

Setelah memahami project, lanjutkan ke testing secara sistematis.

**Jangan berhenti hanya karena menemukan satu bug. Tetap lanjutkan seluruh audit agar mendapatkan gambaran kondisi sistem secara menyeluruh.**
