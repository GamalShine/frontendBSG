import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { HelpCircle, PlayCircle, FileText, MessageCircle, ChevronDown } from 'lucide-react'

const faqs = [
  { q: 'Bagaimana cara mengelola tugas?', a: 'Masuk ke menu Tugas, gunakan tombol Tambah untuk membuat tugas baru, dan gunakan filter untuk memantau status tugas.' },
  { q: 'Bagaimana cara mengubah password?', a: 'Buka halaman Profil, pilih Change Password, lalu isi password saat ini dan password baru Anda.' },
  { q: 'Bagaimana cara mengelola user?', a: 'Untuk admin/owner, buka menu SDM > Data Tim untuk menambah atau memperbarui data user.' },
  { q: 'Bagaimana cara melihat laporan?', a: 'Buka menu Keuangan > Laporan Keuangan atau Aneka Grafik untuk melihat ringkasan dan detail laporan.' },
  { q: 'Bagaimana cara mengatur notifikasi?', a: 'Masuk ke menu Settings, lalu sesuaikan preferensi notifikasi yang tersedia.' },
  { q: 'Apa yang harus dilakukan jika aplikasi error?', a: 'Silakan muat ulang halaman. Jika tetap terjadi, hubungi tim support melalui Chat Support atau tombol Hubungi Support di bawah.' },
]

const AccordionItem = ({ item, isOpen, onToggle }) => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <button onClick={onToggle} className="w-full flex items-center justify-between px-4 sm:px-5 py-4 text-left hover:bg-gray-50">
      <span className="text-gray-900 font-medium">{item.q}</span>
      <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    {isOpen && (
      <div className="px-4 sm:px-5 pb-4 text-gray-600 text-sm leading-relaxed border-t bg-gray-50">
        {item.a}
      </div>
    )}
  </div>
)

const HelpCenter = () => {
  const [openIdx, setOpenIdx] = useState(null)

  return (
    <div className="p-0">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="bg-red-700 text-white rounded-xl p-6 sm:p-8 shadow-md">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20 flex items-center justify-center">
              <HelpCircle className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold">Butuh Bantuan?</div>
              <div className="text-white/90 text-sm sm:text-base">Temukan jawaban untuk pertanyaan Anda</div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8">
          <div className="text-gray-900 font-semibold text-base md:text-lg mb-4">Bantuan Cepat</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a href="#" className="group bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow transition">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
                <PlayCircle className="h-6 w-6" />
              </div>
              <div className="font-medium text-gray-900">Video Tutorial</div>
              <div className="text-sm text-gray-500">Pelajari langkah demi langkah</div>
            </a>
            <a href="#" className="group bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow transition">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                <FileText className="h-6 w-6" />
              </div>
              <div className="font-medium text-gray-900">Panduan PDF</div>
              <div className="text-sm text-gray-500">Dokumentasi untuk dibaca</div>
            </a>
            <Link to="/contact-support" className="group bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow transition">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div className="font-medium text-gray-900">Chat Support</div>
              <div className="text-sm text-gray-500">Terhubung dengan tim kami</div>
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8">
          <div className="text-gray-900 font-semibold text-base md:text-lg mb-4">Pertanyaan yang Sering Diajukan</div>
          <div className="space-y-3">
            {faqs.map((item, idx) => (
              <AccordionItem key={idx} item={item} isOpen={openIdx === idx} onToggle={() => setOpenIdx(openIdx === idx ? null : idx)} />
            ))}
          </div>
        </div>

        {/* Callout */}
        <div className="mt-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">Masih Butuh Bantuan?</div>
              <div className="text-sm text-gray-500">Hubungi tim support kami untuk bantuan lebih lanjut</div>
            </div>
            <Link to="/contact-support" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium">Hubungi Support</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpCenter
