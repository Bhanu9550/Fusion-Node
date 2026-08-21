import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import FullPageShimmer from "../Components/FullPageShimmer/FullPageShimmer.jsx";
import AuthContext from "../Context/AuthContext.jsx";

function ProtectedRoute() {

    const { User, loading } = useContext(AuthContext)
    if (loading) {
        return (<FullPageShimmer />)
    }
    if (!User) {
        return <Navigate to="/signIn" replace />
    }
    return <Outlet />

}

export default ProtectedRoute