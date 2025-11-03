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
          
          {/* Pendahuluan */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Pendahuluan
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Selamat datang di aplikasi Sistem Bosgil Group. Kami menghormati privasi Anda dan berkomitmen 
              untuk melindungi data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, 
              menggunakan, dan melindungi informasi Anda saat menggunakan aplikasi kami.
            </p>
          </section>

          {/* Informasi yang Dikumpulkan */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Informasi yang Kami Kumpulkan
            </h2>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                Kami dapat mengumpulkan informasi berikut:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Informasi akun (nama, email, nomor telepon)</li>
                <li>Data profil pengguna</li>
                <li>Informasi pekerjaan dan divisi</li>
                <li>Data aktivitas dalam aplikasi</li>
                <li>Informasi perangkat dan log akses</li>
              </ul>
            </div>
          </section>

          {/* Penggunaan Informasi */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Penggunaan Informasi
            </h2>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                Informasi yang kami kumpulkan digunakan untuk:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Menyediakan dan meningkatkan layanan aplikasi</li>
                <li>Mengelola akun pengguna</li>
                <li>Memfasilitasi komunikasi internal perusahaan</li>
                <li>Mengelola tugas, komplain, dan pengumuman</li>
                <li>Analisis kinerja dan pelaporan</li>
                <li>Keamanan dan pencegahan fraud</li>
              </ul>
            </div>
          </section>

          {/* Keamanan Data */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Keamanan Data
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Kami menerapkan langkah-langkah keamanan yang sesuai untuk melindungi informasi pribadi Anda 
              dari akses, penggunaan, atau pengungkapan yang tidak sah. Data Anda disimpan di server yang aman 
              dan hanya dapat diakses oleh personel yang berwenang.
            </p>
          </section>

          {/* Pembagian Informasi */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Pembagian Informasi
            </h2>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                Kami tidak menjual atau menyewakan informasi pribadi Anda kepada pihak ketiga. 
                Informasi Anda hanya dibagikan dalam kondisi berikut:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Dengan anggota tim internal yang memerlukan akses untuk menjalankan tugas</li>
                <li>Ketika diwajibkan oleh hukum atau peraturan yang berlaku</li>
                <li>Untuk melindungi hak, properti, atau keamanan perusahaan</li>
              </ul>
            </div>
          </section>

          {/* Hak Pengguna */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Hak Pengguna
            </h2>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                Anda memiliki hak untuk:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Mengakses informasi pribadi Anda</li>
                <li>Memperbarui atau mengoreksi data Anda</li>
                <li>Meminta penghapusan data (sesuai ketentuan perusahaan)</li>
                <li>Menarik persetujuan penggunaan data tertentu</li>
              </ul>
            </div>
          </section>

          {/* Cookies dan Teknologi Pelacakan */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Cookies dan Teknologi Pelacakan
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Aplikasi kami menggunakan cookies dan teknologi pelacakan serupa untuk meningkatkan pengalaman 
              pengguna, menganalisis penggunaan aplikasi, dan menyimpan preferensi Anda. Anda dapat mengatur 
              browser atau perangkat Anda untuk menolak cookies, tetapi beberapa fitur aplikasi mungkin tidak 
              berfungsi dengan baik.
            </p>
          </section>

          {/* Penyimpanan Data */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Penyimpanan Data
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Data pribadi Anda akan disimpan selama Anda masih menjadi pengguna aktif aplikasi atau 
              selama diperlukan untuk tujuan bisnis yang sah. Data yang tidak lagi diperlukan akan dihapus 
              secara aman sesuai dengan kebijakan retensi data kami.
            </p>
          </section>

          {/* Perubahan Kebijakan */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Perubahan Kebijakan Privasi
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan akan diberitahukan 
              melalui aplikasi atau email. Penggunaan aplikasi setelah perubahan berarti Anda menerima 
              kebijakan yang diperbarui.
            </p>
          </section>

          {/* Persetujuan */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Persetujuan
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Dengan menggunakan aplikasi Sistem Bosgil Group, Anda menyetujui pengumpulan dan penggunaan 
              informasi sesuai dengan Kebijakan Privasi ini.
            </p>
          </section>

          {/* Kontak */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              11. Hubungi Kami
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>
                Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-3">
                <p><strong>Email:</strong> privacy@bosgilgroup.com</p>
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
