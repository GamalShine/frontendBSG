import React, { useState } from 'react'
import { Mail, Phone, MessageCircle, HelpCircle, ChevronRight } from 'lucide-react'

const ContactSupport = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.subject || !form.message) return
    try {
      setSending(true)
      // Placeholder submit: kirim ke mailto agar cepat; nanti bisa diganti API backend
      const body = encodeURIComponent(`${form.message}\n\n--\nDari: ${form.name} <${form.email}>`)
      window.location.href = `mailto:support@bosgilgroup.com?subject=${encodeURIComponent(form.subject)}&body=${body}`
      setSent(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="p-0">
      <div className="max-w-3xl mx-auto">
        {/* Hero */}
        <div className="bg-red-700 text-white rounded-xl p-6 sm:p-8 shadow-md">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20 flex items-center justify-center">
              <Mail className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold">Kami Siap Membantu</div>
              <div className="text-white/90 text-sm sm:text-base">Tim support kami siap membantu Anda 24/7</div>
            </div>
          </div>
        </div>

        {/* Kontak List */}
        <div className="mt-8">
          <div className="text-gray-900 font-semibold text-base md:text-lg mb-4">Hubungi Kami</div>
          <div className="space-y-3">
            <a href="mailto:support@bosgilgroup.com" className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Email Support</div>
                  <div className="text-sm text-gray-500">support@bosgilgroup.com</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </a>

            <a href="https://wa.me/628990656996" target="_blank" rel="noreferrer" className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">WhatsApp</div>
                  <div className="text-sm text-gray-500">+62 899-065-6996</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </a>

            <a href="tel:+628990656996" className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Telepon</div>
                  <div className="text-sm text-gray-500">+62 899-065-6996</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </a>
          </div>
        </div>

        {/* Form */}
        <div className="mt-8">
          <div className="text-gray-900 font-semibold text-base md:text-lg mb-4">Kirim Pesan</div>
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Nama Lengkap *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Subjek *</label>
              <input type="text" name="subject" value={form.subject} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Pesan *</label>
              <textarea name="message" rows={5} value={form.message} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" />
            </div>
            <div className="pt-2">
              <button type="submit" disabled={sending} className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-60">
                {sending ? 'Mengirim...' : sent ? 'Buka Email' : 'Kirim Pesan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ContactSupport
