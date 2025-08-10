import { useEffect, useState, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const useSocket = () => {
    const { user, isAuthenticated } = useAuth()
    const [socket, setSocket] = useState(null)
    const [isConnected, setIsConnected] = useState(false)
    const eventListeners = useRef(new Map())

    const connect = useCallback(() => {
        if (!isAuthenticated || socket?.connected) return

        const token = localStorage.getItem('token')
        if (!user) return

        const newSocket = io('http://localhost:3000', {
            auth: {
                token: localStorage.getItem('token'),
            },
            query: {
                userId: user.id,
            },
            transports: ['websocket', 'polling'],
        })

        newSocket.on('connect', () => {
            setIsConnected(true)
            console.log('Socket connected:', newSocket.id)
            toast.success('Terhubung ke server real-time!')
        })

        newSocket.on('disconnect', (reason) => {
            setIsConnected(false)
            console.log('Socket disconnected:', reason)
            toast.error(`Terputus dari server real-time: ${reason}`)
        })

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message)
            toast.error(`Gagal terhubung ke server real-time: ${error.message}`)
        })

        setSocket(newSocket)
    }, [isAuthenticated, socket, user])

    const disconnect = useCallback(() => {
        if (socket) {
            socket.disconnect()
            setSocket(null)
        }
    }, [socket])

    useEffect(() => {
        if (isAuthenticated && !socket) {
            connect()
        }

        return () => {
            if (socket) {
                socket.off('connect')
                socket.off('disconnect')
                socket.off('connect_error')
                socket.disconnect()
            }
        }
    }, [isAuthenticated, socket, connect])

    const emit = useCallback((event, data) => {
        if (socket && isConnected) {
            socket.emit(event, data)
        } else {
            console.warn('Socket not connected, cannot emit event:', event)
        }
    }, [socket, isConnected])

    const on = useCallback((event, callback) => {
        if (socket) {
            socket.on(event, callback)
            eventListeners.current.set(event, callback)
        }
    }, [socket])

    const off = useCallback((event) => {
        if (socket && eventListeners.current.has(event)) {
            socket.off(event, eventListeners.current.get(event))
            eventListeners.current.delete(event)
        }
    }, [socket])

    return { socket, isConnected, emit, on, off, connect, disconnect }
}

export default useSocket 