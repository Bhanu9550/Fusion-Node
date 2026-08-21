import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../Configure/axiosConfigure'
import './FollowListModal.css'

const FollowListModal = ({ username, mode, onClose }) => {
    //* mode: 'followers' | 'following'

    const navigate = useNavigate()
    const [list, setList] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        setIsLoading(true)
        setError('')
        api.get(`/users/${username}/${mode}`)
            .then(res => setList(res.data[mode] || []))
            .catch(err => setError(err.response?.data?.message || 'Unable to load this list'))
            .finally(() => setIsLoading(false))
    }, [username, mode])

    function goToProfile(u) {
        onClose()
        navigate(`/profile/${u.username}`)
    }

    return (
        <div className="flm-overlay" onClick={onClose}>
            <div className="flm-modal" onClick={(e) => e.stopPropagation()}>

                <div className="flm-header">
                    <span className="flm-title">{mode === 'followers' ? 'Followers' : 'Following'}</span>
                    <button className="flm-close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="flm-body">
                    {isLoading ? (
                        <div className="flm-empty">Loading…</div>
                    ) : error ? (
                        <div className="flm-empty">🔒 {error}</div>
                    ) : list.length === 0 ? (
                        <div className="flm-empty">
                            {mode === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
                        </div>
                    ) : (
                        list.map(u => (
                            <button className="flm-row" key={u._id} onClick={() => goToProfile(u)}>
                                <div className="flm-avatar">
                                    {u.profilePicture ? (
                                        <img src={ import.meta.env.VITE_Images_URL + '/' + u.profilePicture} alt={u.username} />
                                    ) : (
                                        <span>{u.fullname?.[0]?.toUpperCase() || u.username?.[0]?.toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="flm-info">
                                    <span className="flm-name">{u.fullname}</span>
                                    <span className="flm-username">@{u.username}</span>
                                </div>
                            </button>
                        ))
                    )}
                </div>

            </div>
        </div>
    )
}

export default FollowListModal
