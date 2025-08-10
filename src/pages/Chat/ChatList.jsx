import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  MessageCircle, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  User,
  Clock,
  Send
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { formatDate } from '../../utils/helpers'
import Card, { CardHeader, CardBody } from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Badge from '../../components/UI/Badge'
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/UI/Table'
import { chatService } from '../../services/chatService'
import toast from 'react-hot-toast'

const ChatList = () => {
  const { user } = useAuth()
  const [chatRooms, setChatRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const loadChatRooms = async () => {
      try {
        setLoading(true)
        const response = await chatService.getChatRooms()
        const chatRoomsData = response.data || response || []
        setChatRooms(chatRoomsData)
      } catch (error) {
        console.error('Error loading chat rooms:', error)
        toast.error('Gagal memuat data chat')
      } finally {
        setLoading(false)
      }
    }

    loadChatRooms()
  }, [])

  const getStatusBadge = (status) => {
    const variants = {
      aktif: 'success',
      nonaktif: 'danger',
      archived: 'default'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const getUnreadBadge = (count) => {
    if (count === 0) return null
    return (
      <Badge variant="danger" size="sm">
        {count > 99 ? '99+' : count}
      </Badge>
    )
  }

  const getTimeAgo = (date) => {
    const now = new Date()
    const diffTime = now - new Date(date)
    const diffMinutes = Math.floor(diffTime / (1000 * 60))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return 'Baru saja'
    if (diffMinutes < 60) return `${diffMinutes}m yang lalu`
    if (diffHours < 24) return `${diffHours}j yang lalu`
    if (diffDays < 7) return `${diffDays}h yang lalu`
    return formatDate(date)
  }

  const filteredRooms = chatRooms.filter(room => {
    // Get the other user's name for search
    const otherUser = room.user1_id === user?.id ? room.user2 : room.user1
    const otherUserName = otherUser?.nama || otherUser?.username || ''
    
    const matchesSearch = otherUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.last_message?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || room.status_deleted === 0
    return matchesSearch && matchesStatus
  })

  const getUnreadCount = (room) => {
    if (room.user1_id === user?.id) {
      return room.user1_unread_count || room.unread_count_user1 || 0
    } else {
      return room.user2_unread_count || room.unread_count_user2 || 0
    }
  }

  const getOtherUser = (room) => {
    return room.user1_id === user?.id ? room.user2 : room.user1
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data chat room...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Chat Room</h1>
          <p className="text-gray-600 mt-1">Kelola semua chat room dan percakapan</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link to="/chat/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Buat Chat Room
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari chat room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
              <option value="archived">Arsip</option>
            </select>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter Lainnya
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Chat Room</p>
                <p className="text-2xl font-bold text-gray-900">{chatRooms.length}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Room Aktif</p>
                <p className="text-2xl font-bold text-gray-900">
                  {chatRooms.filter(room => room.status_deleted === 0).length}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Send className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pesan Belum Dibaca</p>
                <p className="text-2xl font-bold text-gray-900">
                  {chatRooms.reduce((total, room) => total + getUnreadCount(room), 0)}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Kontak</p>
                <p className="text-2xl font-bold text-gray-900">
                  {chatRooms.length}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Daftar Chat Room</h3>
        </CardHeader>
        <CardBody>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kontak</TableHead>
                <TableHead>Pesan Terakhir</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pesan Belum Dibaca</TableHead>
                <TableHead>Waktu Terakhir</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRooms.map((room) => {
                const otherUser = getOtherUser(room)
                return (
                  <TableRow key={room.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          <User className="h-4 w-4 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <p className="font-medium text-gray-900">{otherUser?.nama || otherUser?.username}</p>
                            {getUnreadBadge(getUnreadCount(room))}
                          </div>
                          <p className="text-sm text-gray-500">{otherUser?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {room.last_message || 'Belum ada pesan'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(room.status_deleted === 0 ? 'aktif' : 'nonaktif')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getUnreadCount(room) > 0 ? (
                          <Badge variant="danger">{getUnreadCount(room)}</Badge>
                        ) : (
                          <span className="text-sm text-gray-500">Semua dibaca</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-900">{getTimeAgo(room.last_message_time)}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end space-x-2">
                        <Link to={`/chat/${room.room_id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          
          {filteredRooms.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada chat room ditemukan</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export default ChatList 