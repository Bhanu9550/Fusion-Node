import { createContext, useState, useCallback } from "react";

const UIContext = createContext();

function UIProvider({ children }) {
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

    const toggleMobileNav = useCallback(() => setIsMobileNavOpen(o => !o), []);
    const closeMobileNav = useCallback(() => setIsMobileNavOpen(false), []);

    const toggleFilterDrawer = useCallback(() => setIsFilterDrawerOpen(o => !o), []);
    const closeFilterDrawer = useCallback(() => setIsFilterDrawerOpen(false), []);

    return (
        <UIContext.Provider
            value={{
                isMobileNavOpen,
                toggleMobileNav,
                closeMobileNav,
                isFilterDrawerOpen,
                toggleFilterDrawer,
                closeFilterDrawer,
            }}
        >
            {children}
        </UIContext.Provider>
    );
}

export { UIProvider };
export default UIContext;
