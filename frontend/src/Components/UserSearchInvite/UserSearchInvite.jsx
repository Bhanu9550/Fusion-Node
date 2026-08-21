import { useEffect, useState, useRef, useCallback } from 'react'
import api from '../../Configure/axiosConfigure.jsx'
import './UserSearchInvite.css'

const UserSearchInvite = ({ onSelect, placeholder, disabled }) => {

    const [inputValue, setInputValue]     = useState('')
    const [searchedData, setSearchedData] = useState([])
    const [showDropdown, setShowDropdown] = useState(false)
    const [isLoading, setIsLoading]       = useState(false)

    const [selectedUser, setSelectedUser] = useState(null)
    const selectedUserRef                 = useRef(null)

    const searchRef = useRef(null)

    useEffect(() => {
        selectedUserRef.current = selectedUser
    }, [selectedUser])

    // ── Debounce Search ──
    useEffect(() => {
        const trimmed = inputValue.trim()
        const current = selectedUserRef.current

        if (!trimmed || (current && inputValue === `@${current.username}`)) {
            setSearchedData([])
            setShowDropdown(false)
            setIsLoading(false)
            return
        }

        setIsLoading(true)

        const timer = setTimeout(async () => {
            try {
                const response = await api.get('/dashboard/searchUser', {
                    params: { search: trimmed.replace('@', '') }
                })
                setSearchedData(response.data)
                setShowDropdown(true)
            } catch (err) {
                console.error(err)
                setSearchedData([])
                setShowDropdown(false)
            } finally {
                setIsLoading(false)
            }
        }, 500)

        return () => clearTimeout(timer)

    }, [inputValue]) // only inputValue — ref doesn't need to be here

    // ── Close on outside click ──
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // ── Input Change ──
    const handleInputChange = useCallback((e) => {
        const value = e.target.value
        setInputValue(value)

        if (selectedUserRef.current) {
            setSelectedUser(null)
            onSelect(null)
        }
    }, [onSelect])

    // ── Select User ──
    const handleSelect = useCallback((user) => {
        setSelectedUser(user)
        setInputValue(`@${user.username}`)
        setShowDropdown(false)
        setSearchedData([])
        onSelect(user)
    }, [onSelect])

    // ── Clear ──
    const handleClear = useCallback(() => {
        setSelectedUser(null)
        setInputValue('')
        setSearchedData([])
        setShowDropdown(false)
        setIsLoading(false)
        onSelect(null)
    }, [onSelect])

    //  reading state here — safe for render
    const hasSelectedUser = Boolean(selectedUser)

    const showEmpty = (
        showDropdown &&
        !isLoading &&
        searchedData.length === 0 &&
        inputValue.trim().length > 0
    )

    return (
        <div
            className={`sb-wrapper ${disabled ? 'sb-disabled' : ''}`}
            ref={searchRef}
        >

            {/* ── Input Bar ── */}
            <div className={`
                sb-input-bar
                ${showDropdown    ? 'sb-input-bar-open'     : ''}
                ${hasSelectedUser ? 'sb-input-bar-selected' : ''}
            `}>

                {/* Icon / Spinner — hidden when user selected */}
                {!hasSelectedUser && (
                    <span className="sb-icon">
                        {isLoading
                            ? <span className="sb-spinner" />
                            : <span>🔍</span>
                        }
                    </span>
                )}

                {/* Input */}
                <input
                    className={`sb-input ${hasSelectedUser ? 'sb-input-has-user' : ''}`}
                    type="text"
                    value={inputValue}
                    placeholder={placeholder || 'Search people with usernames...'}
                    onChange={handleInputChange}
                    disabled={disabled}
                    onFocus={() => {
                        if (searchedData.length > 0) setShowDropdown(true)
                    }}
                />

                {/* Clear */}
                {inputValue && !disabled && (
                    <button className="sb-clear-btn" onClick={handleClear}>
                        ✕
                    </button>
                )}

            </div>

            {/* ── Suggestions Dropdown ── */}
            {showDropdown && searchedData.length > 0 && (
                <div className="sb-dropdown">
                    <p className="sb-dropdown-label">Users</p>
                    {searchedData.map((user, index) => (
                        <div
                            className="sb-suggestion-item"
                            key={user._id || index}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSelect(user)}
                        >
                            {/* Avatar */}
                            <div className="sb-avatar-wrapper">
                                {user.profilePic ? (
                                    <img
                                        src={user.profilePic}
                                        alt={user.username}
                                        className="sb-avatar-img"
                                    />
                                ) : (
                                    <div className="sb-avatar-fallback">
                                        {user.username?.[0]?.toUpperCase() || '?'}
                                    </div>
                                )}
                                <span className="sb-online-dot" />
                            </div>

                            {/* Info */}
                            <div className="sb-user-info">
                                <span className="sb-username">@{user.username}</span>
                                <span className="sb-fullname">
                                    {user.fullname || user.name || 'DevCollab User'}
                                </span>
                            </div>

                            {/* Arrow */}
                            <span className="sb-arrow">›</span>

                        </div>
                    ))}
                </div>
            )}

            {/* ── Empty State ── */}
            {showEmpty && (
                <div className="sb-dropdown">
                    <div className="sb-empty">
                        <span>😕</span>
                        <p>No users found for <strong>"{inputValue}"</strong></p>
                    </div>
                </div>
            )}

        </div>
    )
}

export default UserSearchInvite