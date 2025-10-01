// Utility untuk menghitung Next ID di sisi frontend
// Catatan: Idealnya auto-increment ditangani oleh backend untuk mencegah race condition.
// Utility ini dibuat agar kompatibel dengan requirement saat ini: mengirim id = max(id) + 1.

/**
 * Menghitung next id dari sebuah list object yang punya properti `id`.
 * Jika list kosong atau tidak valid, mengembalikan 1.
 * @param {Array} list
 * @returns {number}
 */
export function calcNextIdFromList(list) {
  if (!Array.isArray(list) || list.length === 0) return 1
  const maxId = list.reduce((max, item) => {
    const val = Number(item?.id) || 0
    return val > max ? val : max
  }, 0)
  return maxId + 1
}

/**
 * Helper generik untuk mengambil list dari fetcher (Promise) lalu kembalikan next id.
 * Mendukung response berbentuk { data: [...] } atau langsung array.
 * @param {() => Promise<any>} fetcherFn
 * @returns {Promise<number>}
 */
export async function getNextIdByFetcher(fetcherFn) {
  try {
    const res = await fetcherFn()
    const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
    return calcNextIdFromList(list)
  } catch (err) {
    // fallback default
    return 1
  }
}

/**
 * Next id khusus untuk Tim Merah/Biru (Owner)
 * @param {import('./timService').timService} timService
 * @param {'merah'|'biru'} type
 * @returns {Promise<number>}
 */
export function getNextIdTimOwner(timService, type) {
  return getNextIdByFetcher(() => (
    type === 'merah'
      ? timService.getTimMerahForOwner({ page: 1, limit: 100000 })
      : timService.getTimBiruForOwner({ page: 1, limit: 100000 })
  ))
}

/**
 * Next id khusus untuk Tim Merah/Biru (Admin)
 * @param {import('./timService').timService} timService
 * @param {'merah'|'biru'} type
 * @returns {Promise<number>}
 */
export function getNextIdTimAdmin(timService, type) {
  return getNextIdByFetcher(() => (
    type === 'merah'
      ? timService.getTimMerah({ page: 1, limit: 100000 })
      : timService.getTimBiru({ page: 1, limit: 100000 })
  ))
}
