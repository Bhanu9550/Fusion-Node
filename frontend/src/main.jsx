import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './Context/AuthContext.jsx'
import { SocketProvider } from './Context/SocketContext.jsx'
import { UIProvider } from './Context/UIContext.jsx'
import { WishlistProvider } from './Context/WishlistContext.jsx'


createRoot(document.getElementById('root')).render(
    <AuthProvider>
        <SocketProvider>
            <WishlistProvider>
                <UIProvider>
                    <BrowserRouter>
                        <App />
                    </BrowserRouter>
                </UIProvider>
            </WishlistProvider>
        </SocketProvider>
    </AuthProvider>
)
