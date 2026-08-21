import { createContext, useContext, useEffect, useState, useCallback } from "react";
import AuthContext from "./AuthContext";
import api from "../Configure/axiosConfigure";

const WishlistContext = createContext();

function WishlistProvider({ children }) {
    const { User } = useContext(AuthContext);
    const [wishlistIds, setWishlistIds] = useState(new Set());
    const [isLoaded, setIsLoaded] = useState(false);

    const loadWishlist = useCallback(async () => {
        if (!User?._id) return;
        try {
            const res = await api.get('/users/me/wishlist');
            setWishlistIds(new Set((res.data.wishlist || []).map(p => p._id)));
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoaded(true);
        }
    }, [User?._id]);

    useEffect(() => { loadWishlist() }, [loadWishlist]);

   const toggleWishlist = useCallback(async (projectId) => {
        try {
            const res = await api.post(`/projects/${projectId}/wishlist`);
        
            setWishlistIds(prev => {
                const next = new Set(prev);
            
                if (res.data.wishlisted) {
                    next.add(projectId);
                } else {
                    next.delete(projectId);
                }
            
                return next;
            });
        
            return res.data;
        } catch (err) {
            console.error('Wishlist update failed:', err);
        }
    }, []);

    const isWishlisted = useCallback((projectId) => wishlistIds.has(projectId), [wishlistIds]);

    return (
        <WishlistContext.Provider
            value={{
                wishlistIds,
                wishlistCount: wishlistIds.size,
                isLoaded,
                isWishlisted,
                toggleWishlist,
                refetchWishlist: loadWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

export { WishlistProvider };
export default WishlistContext;
