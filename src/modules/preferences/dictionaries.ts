export const dictionaries = {
  en: {
    "common.language": "Language",
    "language.english": "English",
    "language.indonesian": "Indonesian",

    "layout.workspace": "Workspace",
    "layout.title": "OpenSuite Console",
    "layout.login": "Login",

    "dashboard.title": "Architecture health",
    "dashboard.description":
      "Example dashboard route mapped by App Router, rendered from a versioned feature page, and filtered by a demo access snapshot.",
    "dashboard.metric.routes.label": "Routes",
    "dashboard.metric.routes.description":
      "Route groups, dashboard shell, and auth shell are active.",
    "dashboard.metric.features.label": "Features",
    "dashboard.metric.features.description":
      "Auth, dashboard, and user-management are split by feature.",
    "dashboard.metric.permissions.label": "Permissions",
    "dashboard.metric.permissions.value": "SDK-ready",
    "dashboard.metric.permissions.description":
      "Access checks are consumed through module boundaries.",
    "dashboard.action.eyebrow": "Permission rendering",
    "dashboard.action.title": "Create action is visible",
    "dashboard.action.description":
      "This block is rendered through the `Can` component using the demo access snapshot from the auth module.",
    "dashboard.action.button": "Open user management",

    "users.title": "User management",
    "users.description":
      "A lightweight page to verify feature routing, table composition, and permission-based commands.",
    "users.create": "Create user",
    "users.col.name": "Name",
    "users.col.role": "Role",
    "users.col.status": "Status",
  },
  id: {
    "common.language": "Bahasa",
    "language.english": "Inggris",
    "language.indonesian": "Indonesia",

    "layout.workspace": "Workspace",
    "layout.title": "OpenSuite Console",
    "layout.login": "Masuk",

    "dashboard.title": "Kesehatan arsitektur",
    "dashboard.description":
      "Contoh route dashboard yang dipetakan oleh App Router, dirender dari halaman fitur berversi, dan difilter oleh snapshot akses demo.",
    "dashboard.metric.routes.label": "Route",
    "dashboard.metric.routes.description":
      "Route group, shell dashboard, dan shell auth sudah aktif.",
    "dashboard.metric.features.label": "Fitur",
    "dashboard.metric.features.description":
      "Auth, dashboard, dan user-management dipisahkan per fitur.",
    "dashboard.metric.permissions.label": "Izin",
    "dashboard.metric.permissions.value": "Siap SDK",
    "dashboard.metric.permissions.description":
      "Pemeriksaan akses dikonsumsi melalui batasan modul.",
    "dashboard.action.eyebrow": "Rendering permission",
    "dashboard.action.title": "Aksi create terlihat",
    "dashboard.action.description":
      "Blok ini dirender melalui komponen `Can` menggunakan snapshot akses demo dari modul auth.",
    "dashboard.action.button": "Buka user management",

    "users.title": "Manajemen pengguna",
    "users.description":
      "Halaman ringan untuk memverifikasi routing fitur, komposisi tabel, dan perintah berbasis permission.",
    "users.create": "Buat pengguna",
    "users.col.name": "Nama",
    "users.col.role": "Role",
    "users.col.status": "Status",
  },
} as const;

export type Language = keyof typeof dictionaries;
export type TranslationKey = keyof (typeof dictionaries)["id"];
