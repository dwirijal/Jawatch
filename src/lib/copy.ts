// Centralized Indonesian UX copy — single source of truth for user-facing strings.
// ponytail: ID-only, no i18n framework/locale switcher (no switcher exists = YAGNI).
// If a language switcher is ever added, nest these under a locale key and slot EN alongside.

export const COPY = {
  nav: {
    home: 'Home',
    discover: 'Jelajah',
    search: 'Cari',
    library: 'Library',
  },
  library: {
    resumeEyebrow: 'Lanjut',
    resumeWatch: 'Lanjut tonton',
    resumeRead: 'Lanjut baca',
    bookmarkSaved: 'Tersimpan ke Library',
    bookmarkRemoved: 'Dihapus dari Library',
    removeFromList: 'Hapus dari daftar',
  },
  reader: {
    loadFailed: 'Gagal memuat chapter. Halaman lama tetap ditampilkan.',
    noPages: 'Halaman belum tersedia.',
    chapterDone: 'Selesai bab ini',
    nextChapter: 'Bab berikutnya →',
    autoAdvance: 'Lanjut otomatis',
    progressLabel: 'Progres baca',
    displayMode: 'Tampilan',
    fitWidth: 'Fit lebar',
    fitScreen: 'Fit layar',
    fitMedium: 'Sedang',
  },
  watch: {
    loadFailed: 'Gagal memuat episode. Stream lama tetap diputar.',
    serverUnavailable: 'Server ini tidak tersedia. Coba server lain.',
    noStream: 'Stream belum tersedia untuk episode ini.',
    altServers: 'Server alternatif',
    listFailed: 'Daftar episode gagal dimuat. Episode saat ini tetap bisa diputar.',
    // ponytail: ID-only button labels; swap to i18n key if a locale switcher lands.
    fullscreenEnter: 'Layar penuh',
    fullscreenExit: 'Keluar layar penuh',
    playMirror: (name: string, quality?: string) => `Putar ${name}${quality ? ` ${quality}` : ''}`,
  },
  detail: {
    resume: (isVideo: boolean, n: number) => `Lanjutkan ${isVideo ? 'EP' : 'CH'} ${n}`,
  },
  empty: {
    // "X yang kamu cari mungkin sudah dipindah atau tidak tersedia." — X is Judul/Chapter/Episode
    notAvailableDesc: (subject: string) => `${subject} yang kamu cari mungkin sudah dipindah atau tidak tersedia.`,
    itemUnavailable: (isVideo: boolean) => `${isVideo ? 'Episode' : 'Chapter'} tidak tersedia`,
    pageNotFound: 'Halaman tidak ditemukan',
    backToHome: 'Kembali ke beranda',
    backToDetail: 'Kembali ke detail',
  },
  search: {
    placeholder: 'Cari judul...',
    emptyTitle: 'Tidak ditemukan',
    emptyDesc: (query: string) => `Tidak ada hasil untuk "${query}". Coba kata kunci lain.`,
    count: (n: number) => `${n} hasil`,
    recent: 'Pencarian terakhir',
    clearRecent: 'Hapus',
  },
  error: {
    eyebrow: 'Sedang dimuat ulang',
    title: 'Sebagian konten belum tersedia',
    desc: 'Sumber media sedang tidak dapat dijangkau. Coba muat ulang halaman ini.',
    reload: 'Muat ulang',
    retry: 'Coba lagi',
  },
  support: {
    prompt: 'Suka jawatch? Dukung biar tetap gratis & bebas iklan berlebih.',
    donate: 'Dukung',
    follow: 'Follow @Anvxxr',
  },
} as const;
