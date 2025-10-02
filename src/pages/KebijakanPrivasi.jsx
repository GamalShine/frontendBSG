import React from 'react';
import { Link } from 'react-router-dom';

const KebijakanPrivasi = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 sm:px-10">
          <h1 className="text-3xl font-bold text-white text-center">
            Kebijakan dan Privasi
          </h1>
          <p className="mt-2 text-blue-100 text-center">
            Sistem Bosgil Group
          </p>
          <p className="mt-1 text-sm text-blue-200 text-center">
            Terakhir diperbarui: 2 Oktober 2025
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-8 sm:px-10 space-y-8">
          
          {/* Ringkasan Singkat */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Ringkasan Singkat
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Dengan mengunduh atau menggunakan Aplikasi ini, kamu setuju pada syarat & ketentuan berlaku. Bacalah dengan teliti. Hak kekayaan intelektual milik Penyedia Layanan. Dilarang menyalin, memodifikasi, mengekstrak kode sumber, atau membuat turunan tanpa izin.
            </p>
          </section>

          {/* Persetujuan Pengguna */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Persetujuan Pengguna
            </h2>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                Dengan mengunduh atau memakai Aplikasi, kamu otomatis menyetujui syarat ini. Beberapa hal penting:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Tidak boleh menyalin, memodifikasi, atau menggunakan merek dagang tanpa izin.</li>
                <li>Tidak boleh mencoba mengekstrak kode sumber, menerjemahkan untuk distribusi, atau membuat versi turunan.</li>
                <li>Semua hak cipta dan hak kekayaan intelektual tetap milik Penyedia Layanan.</li>
              </ul>
            </div>
          </section>

          {/* Hak Penyedia Layanan */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Hak Penyedia Layanan
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Penyedia Layanan berhak mengubah Aplikasi atau mengenakan biaya kapan saja. Jika dikenakan biaya, akan diberitahukan secara jelas.
            </p>
          </section>

          {/* Data & Keamanan */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Data & Keamanan
            </h2>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                Aplikasi menyimpan dan memproses data pribadi yang kamu berikan. Kamu bertanggung jawab menjaga keamanan perangkat dan akses ke Aplikasi.
              </p>
              <p className="leading-relaxed">
                Penyedia Layanan tidak menyarankan jailbreak atau root karena dapat membahayakan keamanan perangkat dan membuat Aplikasi tidak berfungsi.
              </p>
            </div>
          </section>

          {/* Layanan Pihak Ketiga */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Layanan Pihak Ketiga
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Aplikasi menggunakan layanan pihak ketiga yang memiliki syarat sendiri. Contoh yang dipakai: <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Google Play Services</a>.
            </p>
          </section>

          {/* Tanggung Jawab & Batasan */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Tanggung Jawab & Batasan
            </h2>
            <div className="space-y-3 text-gray-700">
              <ul className="list-disc pl-6 space-y-2">
                <li>Beberapa fitur memerlukan koneksi internet. Penyedia tidak bertanggung jawab jika Aplikasi tidak berjalan penuh karena tidak ada koneksi atau kuota habis.</li>
                <li>Biaya data seluler atau roaming ditanggung pengguna.</li>
                <li>Jika kamu bukan pemegang tagihan, diasumsikan sudah mendapat izin dari pemegang tagihan.</li>
                <li>Penyedia tidak bertanggung jawab jika perangkat kehabisan baterai dan pengguna tidak dapat mengakses layanan.</li>
                <li>Penyedia menggunakan data pihak ketiga; mereka tidak bertanggung jawab atas kerugian yang timbul akibat ketergantungan pada data tersebut.</li>
              </ul>
            </div>
          </section>

          {/* Pembaruan & Penghentian */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Pembaruan & Penghentian
            </h2>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                Penyedia dapat memperbarui Aplikasi kapan saja. Sistem operasi dapat berubah sehingga kamu perlu mengunduh pembaruan agar tetap dapat menggunakan Aplikasi. Kamu setuju untuk menerima pembaruan ketika ditawarkan.
              </p>
              <p className="leading-relaxed">
                Penyedia bisa menghentikan layanan kapan saja tanpa pemberitahuan. Jika dihentikan, hak dan lisensi akan berakhir dan kamu harus menghentikan penggunaan serta menghapus Aplikasi bila diperlukan.
              </p>
            </div>
          </section>

          {/* Perubahan Syarat & Ketentuan */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Perubahan Syarat & Ketentuan
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Penyedia berhak memperbarui syarat ini dari waktu ke waktu. Disarankan untuk memeriksa halaman ini secara berkala. Perubahan akan dipublikasikan di halaman ini.
            </p>
          </section>

          {/* Perubahan Kebijakan */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Perubahan Kebijakan
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Kebijakan ini dapat diperbarui dari waktu ke waktu dan akan diinformasikan melalui aplikasi. Penggunaan setelah perubahan berarti kamu menyetujui kebijakan yang diperbarui.
            </p>
          </section>

          {/* Persetujuan (opsional) */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Persetujuan
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Dengan terus menggunakan Aplikasi, kamu setuju pada seluruh ketentuan yang berlaku pada halaman ini.
            </p>
          </section>

          {/* Kontak */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Kontak
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>
                Jika ada pertanyaan atau saran, silakan hubungi kami:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-3">
                <p><strong>Email:</strong> gamalmusthofa@gmail.com</p>
                <p><strong>Perusahaan:</strong> Bosgil Group</p>
              </div>
            </div>
          </section>

          {/* Footer Button */}
          <div className="pt-6 border-t border-gray-200">
            <Link 
              to="/login" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Kembali ke Login
            </Link>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="bg-gray-50 px-6 py-4 sm:px-10 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} Bosgil Group. Semua hak cipta dilindungi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default KebijakanPrivasi;
