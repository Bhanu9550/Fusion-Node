import { useContext } from "react";
import AuthContext from "../Context/AuthContext";
import FullPageShimmer from "../Components/FullPageShimmer/FullPageShimmer";
import { Navigate, Outlet} from "react-router-dom";

function PublicRoute(){
    const {User, loading} = useContext(AuthContext)

    if (loading){
        return (<>
            <FullPageShimmer />
        </>)
    }
    if(!User){
        return <Outlet />
    }
    return <Navigate to="/dashboard" replace />
}

export default PublicRoute