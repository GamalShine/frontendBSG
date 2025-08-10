import React from 'react'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft, AlertTriangle } from 'lucide-react'
import Button from '../components/UI/Button'
import Card, { CardBody } from '../components/UI/Card'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">B</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bosgil Group</h1>
          <p className="text-gray-600">Management System</p>
        </div>

        {/* 404 Card */}
        <Card className="shadow-xl">
          <CardBody className="text-center py-12">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
            
            <h2 className="text-6xl font-bold text-gray-900 mb-4">404</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Halaman Tidak Ditemukan</h3>
            <p className="text-gray-600 mb-8">
              Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="flex items-center justify-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
              <Link to="/">
                <Button className="flex items-center justify-center">
                  <Home className="h-4 w-4 mr-2" />
                  Beranda
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            © 2024 Bosgil Group. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFound 