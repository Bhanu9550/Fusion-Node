import { useContext, useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import SideNavbar from '../../../Components/SideNavbar/SideNavbar'
import TopNavbar from '../../../Components/TopNavbar/TopNavbar'
import BottomNavbar from '../../../Components/BottomNavbar/BottomNavbar'
import AuthContext from '../../../Context/AuthContext'
import SocketContext from '../../../Context/SocketContext'
import api from '../../../Configure/axiosConfigure'
import { useRelativeTime } from '../../../Hooks/useRelativeTime'
import ConfirmModal from '../../../Components/ConfirmModal/ConfirmModal'
import './Messages.css'

const ConversationRow = ({ conv, isActive, onClick, isOnline }) => {
    const timeAgo = useRelativeTime(conv.lastMessageAt)
    const isDirect = conv.type === 'direct'
    const display = isDirect ? conv.otherUser : conv.project

    return (
        <button className={`msg-conv-row ${isActive ? 'msg-conv-row-active' : ''}`} onClick={onClick}>
            <div className="msg-conv-avatar">
                {display?.profilePicture || display?.logoUrl ? (
                    <img src={(display.profilePicture || display.logoUrl)} alt={display?.name || display?.fullname} />
                ) : (
                    <span>{(display?.name || display?.fullname)?.[0]?.toUpperCase() || '?'}</span>
                )}
                {isOnline && <span className="msg-online-dot" />}
            </div>
            <div className="msg-conv-info">
                <span className="msg-conv-name">
                    {isDirect ? (display?.fullname || `@${display?.username}`) : (display?.name || 'Project')}
                </span>
                <span className="msg-conv-last">
                    {conv.lastMessageSender ? `${conv.lastMessageSender.fullname?.split(' ')[0] || ''}: ` : ''}
                    {conv.lastMessage || 'No messages yet'}
                </span>
            </div>
            {conv.lastMessageAt && <span className="msg-conv-time">{timeAgo}</span>}
        </button>
    )
}

const MessageBubble = ({ message, isOwn }) => {
    const timeAgo = useRelativeTime(message.createdAt)
    return (
        <div className={`msg-bubble-row ${isOwn ? 'msg-bubble-own' : ''}`}>
            {!isOwn && (
                <div className="msg-bubble-avatar">
                    {message.sender?.profilePicture ? (
                        <img src={message.sender.profilePicture} alt="" />
                    ) : (
                        <span>{message.sender?.fullname?.[0]?.toUpperCase() || '?'}</span>
                    )}
                </div>
            )}
            <div className="msg-bubble">
                {!isOwn && <span className="msg-bubble-sender">{message.sender?.fullname || message.sender?.username}</span>}
                <p className="msg-bubble-text">{message.text}</p>
                <span className="msg-bubble-time">{timeAgo}</span>
            </div>
        </div>
    )
}

const Messages = () => {
    const { projectId, dmUserId } = useParams()
    const navigate = useNavigate()
    const { User } = useContext(AuthContext)
    const { socket, isUserOnline } = useContext(SocketContext)

    const isDirectMode = !!dmUserId
    const activeKey = projectId || dmUserId || null

    const [conversations, setConversations] = useState([])
    const [isLoadingList, setIsLoadingList] = useState(true)
    const [activeHeader, setActiveHeader] = useState(null)
    const [externalComms, setExternalComms] = useState(null)
    const [conversationId, setConversationId] = useState(null)
    const [messages, setMessages] = useState([])
    const [isLoadingThread, setIsLoadingThread] = useState(false)
    const [draft, setDraft] = useState('')
    const [typingUser, setTypingUser] = useState(null)
    const [sendError, setSendError] = useState('')
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [canSendMessage, setCanSendMessage] = useState(true)

    const scrollRef = useRef(null)
    const typingTimeoutRef = useRef(null)
    const seenMessageIds = useRef(new Set())

    const loadConversations = useCallback(async () => {
        setIsLoadingList(true)
        try {
            const res = await api.get('/messages')
            setConversations(res.data.conversations || [])
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoadingList(false)
        }
    }, [])

    useEffect(() => { loadConversations() }, [loadConversations])

    useEffect(() => {
        setExternalComms(null)
        setSendError('')

        if (!projectId && !dmUserId) {
            setActiveHeader(null)
            setMessages([])
            setConversationId(null)
            setCanSendMessage(true)
            return
        }

        let cancelled = false
        setIsLoadingThread(true)

        const request = isDirectMode
            ? api.get(`/messages/direct/${dmUserId}`)
            : api.get(`/messages/project/${projectId}`)

        request
            .then(res => {
                if (cancelled) return

                if (!isDirectMode && res.data.externalCommunication) {
                    setExternalComms({
                        communication: res.data.communication,
                        communicationLink: res.data.communicationLink,
                    })
                    setActiveHeader(res.data.project)
                    setMessages([])
                    setCanSendMessage(true)
                    return
                }

                setActiveHeader(isDirectMode ? res.data.otherUser : res.data.project)
                setMessages(res.data.messages || [])
                seenMessageIds.current = new Set((res.data.messages || []).map(m => m._id))

                const newConversationId = res.data.conversationId || null
                setConversationId(newConversationId)

                if (isDirectMode && newConversationId && socket) {
                    socket.emit(
                        'dm:join',
                        { conversationId: newConversationId },
                        (ack) => {
                            if (!ack?.ok) {
                                setSendError(ack?.error || 'Failed to join conversation')
                            }
                        }
                    )
                }

                if (isDirectMode && typeof res.data.hasActiveConnection === 'boolean') {
                    setCanSendMessage(res.data.hasActiveConnection)
                } else if (!isDirectMode) {
                    setCanSendMessage(true)
                }
            })
            .catch(err => {
                setSendError(err.response?.data?.message || 'Failed to load conversation')
            })
            .finally(() => !cancelled && setIsLoadingThread(false))

        return () => { cancelled = true }
    }, [projectId, dmUserId, isDirectMode, socket])

    useEffect(() => {
        if (!socket) return

        if (!isDirectMode && projectId && !externalComms) {
            socket.emit('conversation:join', { projectId })
            return () => {
                socket.emit('conversation:leave', { projectId })
            }
        }
    }, [socket, projectId, conversationId, isDirectMode, externalComms])

    useEffect(() => {
        if (!socket) return

        function handleProjectMessage(payload) {
            // Message is for a different project — just refresh the list preview
            if (isDirectMode || payload.projectId !== projectId) {
                loadConversations()
                return
            }

            // Already processed this message
            if (seenMessageIds.current.has(payload._id)) {
                return
            }

            seenMessageIds.current.add(payload._id)

            // Add message to thread
            setMessages(prev => {
                const pendingIdx = prev.findIndex(
                    m =>
                        String(m._id).startsWith('temp-') &&
                        m.sender?._id === payload.sender?._id &&
                        m.text === payload.text
                )
                if (pendingIdx !== -1) {
                    const next = [...prev]
                    next[pendingIdx] = payload
                    return next
                }
                return [...prev, payload]
            })

            // Update only this project conversation preview — no API call
            setConversations(prev =>
                prev.map(conv => {
                    if (conv.type === 'project' && conv.project?._id === payload.projectId) {
                        return {
                            ...conv,
                            lastMessage: payload.text,
                            lastMessageAt: payload.createdAt,
                            lastMessageSender: payload.sender,
                        }
                    }
                    return conv
                })
            )
        }

        function handleDirectMessage(payload) {
            // Message is for a different conversation — just refresh the list preview
            if (!isDirectMode || payload.conversationId !== conversationId) {
                loadConversations()
                return
            }

            // Already processed this message
            if (seenMessageIds.current.has(payload._id)) {
                return
            }

            seenMessageIds.current.add(payload._id)

            // Add message to thread
            setMessages(prev => {
                const pendingIdx = prev.findIndex(
                    m =>
                        String(m._id).startsWith('temp-') &&
                        m.sender?._id === payload.sender?._id &&
                        m.text === payload.text
                )
                if (pendingIdx !== -1) {
                    const next = [...prev]
                    next[pendingIdx] = payload
                    return next
                }
                return [...prev, payload]
            })

            // Update only this direct conversation preview — no API call
            setConversations(prev =>
                prev.map(conv => {
                    if (
                        conv.type === 'direct' &&
                        conv.otherUser?._id === payload.sender?._id
                    ) {
                        return {
                            ...conv,
                            lastMessage: payload.text,
                            lastMessageAt: payload.createdAt,
                            lastMessageSender: payload.sender,
                        }
                    }
                    return conv
                })
            )
        }

        function handleTyping({ projectId: pid, userId, isTyping }) {
            if (isDirectMode || pid !== projectId || userId === User?._id) return
            setTypingUser(isTyping ? userId : null)
        }

        socket.on('message:new', handleProjectMessage)
        socket.on('dm:new', handleDirectMessage)
        socket.on('conversation:typing', handleTyping)

        return () => {
            socket.off('message:new', handleProjectMessage)
            socket.off('dm:new', handleDirectMessage)
            socket.off('conversation:typing', handleTyping)
        }
    }, [socket, projectId, isDirectMode, conversationId, User?._id, loadConversations])

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }, [messages])

    async function handleDeleteChat() {
        if (!dmUserId) return
        setIsDeleting(true)
        try {
            await api.delete(`/messages/direct/${dmUserId}`)
            setShowDeleteConfirm(false)
            loadConversations()
            navigate('/messages')
        } catch (err) {
            setSendError(err.response?.data?.message || 'Failed to delete conversation')
        } finally {
            setIsDeleting(false)
        }
    }

    function handleDraftChange(value) {
        setDraft(value)
        if (!socket || !projectId || isDirectMode) return
        socket.emit('conversation:typing', { projectId, isTyping: true })
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('conversation:typing', { projectId, isTyping: false })
        }, 1500)
    }

    async function handleSend(e) {
        e.preventDefault()
        const text = draft.trim()

        if (!canSendMessage) {
            setSendError("You cannot send messages because you do not follow this user.")
            return
        }

        if (!text || !socket) return
        setSendError('')

        const optimisticMessage = {
            _id: `temp-${Date.now()}`,
            projectId,
            conversationId,
            text,
            sender: {
                _id: User._id,
                fullname: User.fullname,
                username: User.username,
                profilePicture: User.profilePicture
            },
            createdAt: new Date().toISOString(),
        }

        setMessages(prev => [...prev, optimisticMessage])
        setDraft('')

        if (isDirectMode) {
            if (!conversationId) return
            socket.emit('dm:send', { conversationId, text }, (ack) => {
                if (!ack?.ok) {
                    setSendError(ack?.error || 'Failed to send message')
                    setMessages(prev => prev.filter(m => m._id !== optimisticMessage._id))
                    return
                }
                if (!seenMessageIds.current.has(ack.message._id)) {
                    seenMessageIds.current.add(ack.message._id)
                    setMessages(prev =>
                        prev.map(m => m._id === optimisticMessage._id ? ack.message : m)
                    )
                }
            })
        } else {
            socket.emit('message:send', { projectId, text }, (ack) => {
                if (!ack?.ok) {
                    setSendError(ack?.error || 'Failed to send message')
                    setMessages(prev => prev.filter(m => m._id !== optimisticMessage._id))
                    return
                }
                if (!seenMessageIds.current.has(ack.message._id)) {
                    seenMessageIds.current.add(ack.message._id)
                    setMessages(prev =>
                        prev.map(m => m._id === optimisticMessage._id ? ack.message : m)
                    )
                }
            })
        }
    }

    return (
        <section className="page-wrapper messages-mobile-override">
            <SideNavbar />

            <div className="right-dashboard">
                <TopNavbar />

                <div className="msg-page">

                    {/* Conversation List */}
                    <div className={`msg-sidebar ${activeKey ? 'msg-sidebar-hidden-mobile' : ''}`}>
                        <div className="msg-sidebar-header">
                            <h2>Messages</h2>
                        </div>
                        <div className="msg-conv-list">
                            {isLoadingList ? (
                                <div className="msg-empty-state">Loading conversations…</div>
                            ) : conversations.length === 0 ? (
                                <div className="msg-empty-state">
                                    No conversations yet. Join a project's team, or follow/get followed by someone to start a direct chat.
                                </div>
                            ) : (
                                conversations.map(conv => {
                                    const isDirect = conv.type === 'direct'
                                    const isActive = isDirect
                                        ? conv.otherUser?._id === dmUserId
                                        : conv.project?._id === projectId
                                    return (
                                        <ConversationRow
                                            key={conv._id}
                                            conv={conv}
                                            isActive={isActive}
                                            isOnline={isDirect
                                                ? isUserOnline(conv.otherUser?._id)
                                                : (conv.lastMessageSender && isUserOnline(conv.lastMessageSender._id))
                                            }
                                            onClick={() => navigate(
                                                isDirect
                                                    ? `/messages/user/${conv.otherUser?._id}`
                                                    : `/messages/${conv.project?._id}`
                                            )}
                                        />
                                    )
                                })
                            )}
                        </div>
                    </div>

                    {/* Chat Thread */}
                    <div className={`msg-thread ${!activeKey ? 'msg-thread-hidden-mobile' : ''}`}>
                        {!activeKey ? (
                            <div className="msg-thread-placeholder">
                                <span className="msg-thread-placeholder-icon">💬</span>
                                <p>Select a conversation to start chatting</p>
                            </div>
                        ) : isLoadingThread ? (
                            <div className="msg-thread-placeholder">Loading…</div>
                        ) : externalComms ? (
                            <>
                                <div className="msg-thread-header">
                                    <button className="msg-back-btn" onClick={() => navigate('/messages')}>←</button>
                                    <div className="msg-thread-title-wrap">
                                        <span className="msg-thread-title">{activeHeader?.name}</span>
                                        <span className="msg-thread-subtitle">Using {externalComms.communication}</span>
                                    </div>
                                </div>
                                <div className="msg-external-panel">
                                    <span className="msg-external-icon">
                                        {externalComms.communication === 'Discord' ? '🎮'
                                            : externalComms.communication === 'Slack' ? '💼'
                                            : '📹'}
                                    </span>
                                    <p className="msg-external-text">
                                        This team communicates on <strong>{externalComms.communication}</strong> instead of built-in chat.
                                    </p>
                                    {externalComms.communicationLink ? (
                                        <a
                                            className="msg-external-link-btn"
                                            href={externalComms.communicationLink}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Open {externalComms.communication} →
                                        </a>
                                    ) : (
                                        <p className="msg-external-missing">
                                            The project owner hasn't added an invite link yet.
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="msg-thread-header">
                                    <button className="msg-back-btn" onClick={() => navigate('/messages')}>←</button>
                                    <div className="msg-thread-avatar">
                                        {activeHeader?.logoUrl || activeHeader?.profilePicture ? (
                                            <img
                                                src={activeHeader?.logoUrl || activeHeader?.profilePicture}
                                                alt=""
                                            />
                                        ) : (
                                            <span>
                                                {(activeHeader?.name || activeHeader?.fullname)?.[0]?.toUpperCase() || '?'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="msg-thread-title-wrap">
                                        <span className="msg-thread-title">
                                            {isDirectMode
                                                ? (activeHeader?.fullname || `@${activeHeader?.username}`)
                                                : activeHeader?.name}
                                        </span>
                                        <Link
                                            className="msg-thread-subtitle"
                                            to={isDirectMode
                                                ? `/profile/${activeHeader?.username}`
                                                : `/projects/${projectId}`}
                                        >
                                            {typingUser
                                                ? 'typing…'
                                                : (isDirectMode ? `@${activeHeader?.username}` : 'Team discussion')}
                                        </Link>
                                    </div>
                                    {!isDirectMode && (
                                        <button
                                            className="msg-view-project-btn"
                                            onClick={() => navigate(`/projects/${projectId}`)}
                                        >
                                            View Project
                                        </button>
                                    )}
                                    {isDirectMode && (
                                        <button
                                            className="msg-delete-chat-btn"
                                            onClick={() => setShowDeleteConfirm(true)}
                                            title="Delete conversation"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>

                                <div className="msg-thread-content">
                                    <div className="msg-thread-body" ref={scrollRef}>
                                        {messages.length === 0 ? (
                                            <div className="msg-empty-state">
                                                No messages yet. Say hello! 👋
                                            </div>
                                        ) : (
                                            messages.map(m => (
                                                <MessageBubble
                                                    key={m._id}
                                                    message={m}
                                                    isOwn={m.sender?._id === User?._id}
                                                />
                                            ))
                                        )}

                                        {isDirectMode && !canSendMessage && messages.length > 0 && (
                                            <div className="msg-locked-banner">
                                                ⚠️ You can no longer send messages to {activeHeader?.fullname} because you don't follow each other.
                                            </div>
                                        )}
                                    </div>

                                    {sendError && <div className="msg-send-error">{sendError}</div>}

                                    <form className="msg-input-row" onSubmit={handleSend}>
                                        <input
                                            className="msg-input"
                                            type="text"
                                            placeholder={!canSendMessage ? "Chat is read-only" : "Type a message…"}
                                            value={draft}
                                            disabled={!canSendMessage}
                                            onChange={(e) => handleDraftChange(e.target.value)}
                                        />
                                        <button
                                            className="msg-send-btn"
                                            type="submit"
                                            disabled={!draft.trim() || !canSendMessage}
                                        >
                                            {!canSendMessage ? '🔒' : 'Send'}
                                        </button>
                                    </form>
                                </div>
                            </>
                        )}
                    </div>

                </div>
            </div>

            <BottomNavbar />

            {showDeleteConfirm && (
                <ConfirmModal
                    title="Delete this conversation?"
                    message="This will permanently delete all messages in this chat for both of you. This can't be undone."
                    confirmLabel="Delete Chat"
                    danger
                    isBusy={isDeleting}
                    onConfirm={handleDeleteChat}
                    onCancel={() => setShowDeleteConfirm(false)}
                />
            )}
        </section>
    )
}

export default Messages