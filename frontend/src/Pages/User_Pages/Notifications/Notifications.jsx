import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SideNavbar from '../../../Components/SideNavbar/SideNavbar'
import TopNavbar from '../../../Components/TopNavbar/TopNavbar'
import BottomNavbar from '../../../Components/BottomNavbar/BottomNavbar'
import SocketContext from '../../../Context/SocketContext'
import api from '../../../Configure/axiosConfigure'
import ConfirmModal from '../../../Components/ConfirmModal/ConfirmModal'
import { useRelativeTime } from '../../../Hooks/useRelativeTime'
import './Notifications.css'

const notifIcon = {
    join_request: '📥',
    application_accepted: '✅',
    application_rejected: '❌',
    invite_received: '✉️',
    invite_accepted: '🤝',
    invite_declined: '🙅',
    member_removed: '⚠️',
    member_left: '👋',
    new_message: '💬',
    role_filled: '🧩',
    project_update: '📢',
    follow_request: '➕',
    follow_accepted: '🎉',
}

const NotificationCard = ({ notif, onClick, onFollowDecision, decidedState, onDeleteClick }) => {
    const timeAgo = useRelativeTime(notif.createdAt)
    const isFollowRequest = notif.type === 'follow_request'

    return (
        <div className={`ntf-card ${!notif.isRead ? 'ntf-card-unread' : ''}`}>
            <button className="ntf-card-clickable" onClick={() => onClick(notif)}>
                <span className="ntf-card-icon">{notifIcon[notif.type] || '🔔'}</span>
                <span className="ntf-card-body">
                    <span className="ntf-card-title">{notif.title}</span>
                    {notif.message && <span className="ntf-card-message">{notif.message}</span>}
                    <span className="ntf-card-time">{timeAgo}</span>
                </span>
                {!notif.isRead && <span className="ntf-card-dot" />}
            </button>

            {isFollowRequest && notif.sender?._id && (
                decidedState ? (
                    <span className="ntf-follow-decided">
                        {decidedState === 'accept' ? 'Accepted ✓' : 'Ignored'}
                    </span>
                ) : (
                    <div className="ntf-follow-actions">
                        <button className="ntf-follow-accept" onClick={() => onFollowDecision(notif, 'accept')}>
                            Accept
                        </button>
                        <button className="ntf-follow-ignore" onClick={() => onFollowDecision(notif, 'ignore')}>
                            Ignore
                        </button>
                    </div>
                )
            )}

            <button className="ntf-card-delete-btn" onClick={() => onDeleteClick(notif)} title="Delete notification">
                🗑️
            </button>
        </div>
    )
}

const Notifications = () => {

    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useContext(SocketContext)
    const navigate = useNavigate()
    const [decisions, setDecisions] = useState({}) //* notifId -> 'accept' | 'ignore'
    const [pendingDelete, setPendingDelete] = useState(null)

    function handleClick(notif) {
        if (!notif.isRead) markAsRead(notif._id)
        if (notif.type === 'new_message' && notif.project?._id) {
            navigate(`/messages/${notif.project._id}`)
        } else if (notif.type === 'follow_request' || notif.type === 'follow_accepted') {
            if (notif.sender?.username) navigate(`/profile/${notif.sender.username}`)
        } else if (notif.project?._id) {
            navigate(`/projects/${notif.project._id}`)
        }
    }

    async function handleFollowDecision(notif, decision) {
        setDecisions(prev => ({ ...prev, [notif._id]: decision }))
        if (!notif.isRead) markAsRead(notif._id)
        try {
            await api.post(`/users/me/follow-requests/${notif.sender._id}/${decision}`)
        } catch (err) {
            console.error(err)
        }
    }

    function confirmDelete() {
        if (!pendingDelete) return
        deleteNotification(pendingDelete._id)
        setPendingDelete(null)
    }

    return (
        <section className="page-wrapper">
            <SideNavbar />

            <div className="right-dashboard">
                <TopNavbar />

                <div className="ntf-page">
                    <div className="ntf-header">
                        <div>
                            <h1 className="ntf-title">Notifications</h1>
                            <p className="ntf-subtitle">
                                {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : "You're all caught up"}
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <button className="ntf-mark-all-btn" onClick={markAllAsRead}>
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="ntf-list">
                        {notifications.length === 0 ? (
                            <div className="ntf-empty">
                                <span className="ntf-empty-icon">🔔</span>
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <NotificationCard
                                    key={n._id}
                                    notif={n}
                                    onClick={handleClick}
                                    onFollowDecision={handleFollowDecision}
                                    decidedState={decisions[n._id]}
                                    onDeleteClick={setPendingDelete}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            <BottomNavbar />

            {pendingDelete && (
                <ConfirmModal
                    title="Delete this notification?"
                    message="This can't be undone."
                    confirmLabel="Delete"
                    danger
                    onConfirm={confirmDelete}
                    onCancel={() => setPendingDelete(null)}
                />
            )}
        </section>
    )
}

export default Notifications
