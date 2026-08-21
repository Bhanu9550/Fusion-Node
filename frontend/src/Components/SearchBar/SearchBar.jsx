
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../Configure/axiosConfigure.jsx'
import './SearchBar.css'

const SearchBar = () => {

    const [search, setUserSearch] = useState("")
    const [searchedData, setSearchedData] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const searchRef = useRef(null)
    const navigate = useNavigate()

    //* Debouncing , for search the users, projects... 
    useEffect(() => {
        if (!search.trim()) {
            setSearchedData([])
            setShowSuggestions(false)
            return
        }

        setIsLoading(true)
        const timer = setTimeout(async () => {
            try {
                const response = await api.get('/dashboard/searchUser', { params: { search } })
                setSearchedData(response.data)
                setShowSuggestions(true)
            } catch (err) {
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }, 500)

        return () => {
            clearTimeout(timer)
        }
    }, [search])

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSuggestions(false)
                setIsLoading(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <>
            <div className='topNavContainer' ref={searchRef}>
                <div className={`search-bar ${showSuggestions ? 'search-bar-active' : ''}`}>
                    <span className="search-icon">
                        {isLoading
                            ? <span className="search-spinner" />
                            : '🔍'
                        }
                    </span>
                    <input
                        className="search-input"
                        type="text"
                        value={search}
                        placeholder="Search people with usernames..."
                        onChange={(e) => setUserSearch(e.target.value)}
                        onFocus={() => searchedData.length > 0 && setShowSuggestions(true)}
                    />
                    {search && (
                        <button
                            className="search-clear-btn"
                            onClick={() => {
                                setUserSearch('')
                                setSearchedData([])
                                setShowSuggestions(false)
                            }}
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Suggestion Dropdown */}
                {showSuggestions && searchedData.length > 0 && (
                    <div className="search-suggestions">
                        <p className="suggestions-label">Users</p>
                        {searchedData.map((user, index) => (
                            <div
                                className="suggestion-item"
                                key={user._id || index}
                                onClick={() => {
                                    setShowSuggestions(false)
                                    setUserSearch('')
                                    navigate(`/profile/${user.username}`)
                                }}
                            >
                                {/* Profile Picture */}
                                <div className="suggestion-avatar-wrapper">
                                    {user.profilePicture ? (
                                        <img
                                            src={ user.profilePicture}
                                            alt={user.username}
                                            className="suggestion-avatar"
                                        />
                                    ) : (
                                        <div className="suggestion-avatar-fallback">
                                            {user.username?.[0]?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                    <span className="suggestion-online-dot" />
                                </div>

                                {/* User Info */}
                                <div className="suggestion-info">
                                    <span className="suggestion-username">@{user.username}</span>
                                    <span className="suggestion-fullname">{user.fullname || user.name || 'DevCollab User'}</span>
                                </div>

                                {/* Arrow */}
                                <span className="suggestion-arrow">›</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* No results */}
                {showSuggestions && searchedData.length === 0 && search && !isLoading && (
                    <div className="search-suggestions">
                        <div className="suggestion-empty">
                            <span>😕</span>
                            <p>No users found for "<strong>{search}</strong>"</p>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default SearchBar