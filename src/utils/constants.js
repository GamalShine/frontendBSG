export const ROLES = {
    OWNER: 'owner',
    ADMIN: 'admin',
    LEADER: 'leader',
    DIVISI: 'divisi',
}

export const KATEGORI_KOMPLAIN = {
    SISTEM: 'sistem',
    LAYANAN: 'layanan',
    PRODUK: 'produk',
    LAINNYA: 'lainnya',
}

export const PRIORITAS = {
    MENDESAK: 'mendesak',
    PENTING: 'penting',
    BERPROSES: 'berproses',
}

export const STATUS_KOMPLAIN = {
    MENUNGGU: 'menunggu',
    DIPROSES: 'diproses',
    SELESAI: 'selesai',
    DITOLAK: 'ditolak',
}

export const STATUS_TUGAS = {
    BELUM: 'belum',
    PROSES: 'proses',
    REVISI: 'revisi',
    SELESAI: 'selesai',
}

export const MESSAGE_TYPES = {
    TEXT: 'text',
    IMAGE: 'image',
    FILE: 'file',
}

export const KATEGORI_KOMPLAIN_LABELS = {
    [KATEGORI_KOMPLAIN.SISTEM]: 'Sistem',
    [KATEGORI_KOMPLAIN.LAYANAN]: 'Layanan',
    [KATEGORI_KOMPLAIN.PRODUK]: 'Produk',
    [KATEGORI_KOMPLAIN.LAINNYA]: 'Lainnya',
}

export const PRIORITAS_LABELS = {
    [PRIORITAS.MENDESAK]: 'Mendesak',
    [PRIORITAS.PENTING]: 'Penting',
    [PRIORITAS.BERPROSES]: 'Berproses',
}

export const STATUS_KOMPLAIN_LABELS = {
    [STATUS_KOMPLAIN.MENUNGGU]: 'Menunggu',
    [STATUS_KOMPLAIN.DIPROSES]: 'Diproses',
    [STATUS_KOMPLAIN.SELESAI]: 'Selesai',
    [STATUS_KOMPLAIN.DITOLAK]: 'Ditolak',
}

export const STATUS_TUGAS_LABELS = {
    [STATUS_TUGAS.BELUM]: 'Belum',
    [STATUS_TUGAS.PROSES]: 'Proses',
    [STATUS_TUGAS.REVISI]: 'Revisi',
    [STATUS_TUGAS.SELESAI]: 'Selesai',
}

export const ROLES_LABELS = {
    [ROLES.OWNER]: 'Owner',
    [ROLES.ADMIN]: 'Admin',
    [ROLES.LEADER]: 'Leader',
    [ROLES.DIVISI]: 'Divisi',
}

export const STATUS_COLORS = {
    [STATUS_KOMPLAIN.MENUNGGU]: 'warning',
    [STATUS_KOMPLAIN.DIPROSES]: 'info',
    [STATUS_KOMPLAIN.SELESAI]: 'success',
    [STATUS_KOMPLAIN.DITOLAK]: 'danger',
    [STATUS_TUGAS.BELUM]: 'danger',
    [STATUS_TUGAS.PROSES]: 'warning',
    [STATUS_TUGAS.REVISI]: 'info',
    [STATUS_TUGAS.SELESAI]: 'success',
    [PRIORITAS.MENDESAK]: 'danger',
    [PRIORITAS.PENTING]: 'warning',
    [PRIORITAS.BERPROSES]: 'info',
} 