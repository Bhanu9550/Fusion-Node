import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import AuthContext from "./AuthContext";
import api from "../Configure/axiosConfigure";

const Domain = import.meta.env.VITE_Backend_Domain_Url;

const SocketContext = createContext();

function SocketProvider({ children }) {
    const { User } = useContext(AuthContext);
    const socketRef = useRef(null);
    const [socket, setSocket] = useState(null);
    const [onlineUserIds, setOnlineUserIds] = useState(new Set());

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    //* ── Connect / disconnect socket alongside auth state ──
    useEffect(() => {
        if (!User?._id) {
            socketRef.current?.disconnect();
            socketRef.current = null;
            setSocket(null);
            return;
        }

        const newSocket = io(Domain, {
            withCredentials: true,
            transports: ["websocket", "polling"],
        });
        socketRef.current = newSocket;
        setSocket(newSocket);

        newSocket.on("presence:update", ({ userId, online }) => {
            setOnlineUserIds(prev => {
                const next = new Set(prev);
                online ? next.add(userId) : next.delete(userId);
                return next;
            });
        });

        newSocket.on("notification:new", (notif) => {
            setNotifications(prev => [notif, ...prev].slice(0, 50));
            setUnreadCount(prev => prev + 1);
        });

        return () => {
            newSocket.disconnect();
            socketRef.current = null;
            setSocket(null);
        };
    }, [User?._id]);

    //* ── Initial notification load ──
    const fetchNotifications = useCallback(async () => {
        if (!User?._id) return;
        try {
            const res = await api.get("/notifications");
            setNotifications(res.data.notifications || []);
            setUnreadCount(res.data.unreadCount || 0);
        } catch (err) {
            console.error(err);
        }
    }, [User?._id]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = useCallback(async (notificationId) => {
        setNotifications(prev =>
            prev.map(n => (n._id === notificationId ? { ...n, isRead: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        try {
            await api.patch(`/notifications/${notificationId}/read`);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        try {
            await api.patch("/notifications/read-all");
        } catch (err) {
            console.error(err);
        }
    }, []);

    const deleteNotification = useCallback(async (notificationId) => {
        let wasUnread = false;
        setNotifications(prev => {
            const target = prev.find(n => n._id === notificationId);
            wasUnread = target && !target.isRead;
            return prev.filter(n => n._id !== notificationId);
        });
        if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
        try {
            await api.delete(`/notifications/${notificationId}`);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const isUserOnline = useCallback((userId) => onlineUserIds.has(String(userId)), [onlineUserIds]);

    return (
        <SocketContext.Provider
            value={{
                socket,
                isUserOnline,
                notifications,
                unreadCount,
                markAsRead,
                markAllAsRead,
                deleteNotification,
                refetchNotifications: fetchNotifications,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
}

export { SocketProvider };
export default SocketContext;
