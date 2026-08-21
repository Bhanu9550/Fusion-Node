import { createContext, useEffect, useState} from "react";
import api from "../Configure/axiosConfigure";

const AuthContext = createContext()

function AuthProvider({children}){
    const [User, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(()=>{
        async function verifyUser(){
            try{
               const response = await api.get("/me")
               setUser(response.data)
            } catch {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }
        verifyUser()
    },[])
    // console.log(User);
    return(
        <AuthContext.Provider value={{User, loading, setUser}}>
            {children}
        </AuthContext.Provider>
    )
}
export {AuthProvider}
export default AuthContext;