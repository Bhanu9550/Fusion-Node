import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import './TopNavbar.css'
import SocketContext from '../../Context/SocketContext'
import WishlistContext from '../../Context/WishlistContext'
import SearchBar from '../SearchBar/SearchBar'

const TopNavbar = () => {

    const { unreadCount, markAllAsRead } = useContext(SocketContext)
    const { wishlistCount } = useContext(WishlistContext)
    const navigate = useNavigate()

    const handleNotificationClick = () => {
        // Mark all notifications as read before navigating
        if (unreadCount > 0) {
            markAllAsRead();
        }
        // Navigate to the notifications page
        navigate('/notifications');
    };

    return (
        <div className="top-navbar">
            <SearchBar />

            <div className="top-navbar-actions">
                {/* Wishlist Button */}
                <div 
                    className="nav-icon-btn" 
                    onClick={() => navigate('/projects/wishlist')} 
                    title="Wishlist"
                >
                    ❤️
                    {wishlistCount > 0 && (
                        <span className="nav-badge nav-badge-bell">
                            {wishlistCount > 9 ? '9+' : wishlistCount}
                        </span>
                    )}
                </div>

                {/* Notifications Bell - Direct Navigation */}
                <div 
                    className="nav-icon-btn notif-bell-wrapper" 
                    onClick={handleNotificationClick}
                    title="Notifications"
                >
                    🔔
                    {unreadCount > 0 && (
                        <span className="nav-badge nav-badge-bell">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </div>

                {/* Messages Button */}
                <div 
                    className="nav-icon-btn nav-msg-btn" 
                    onClick={() => navigate('/messages')} 
                    title="Messages"
                >
                    💬
                </div>
            </div>
        </div>
    )
}

export default TopNavbar