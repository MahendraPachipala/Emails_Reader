import {Routes,BrowserRouter,Route,Navigate} from "react-router-dom";
import Login from "../pages/login";
import Home from "../pages/home";
export default function Router(){
    return (
        <BrowserRouter>
        <Routes>
            <Route path="/login" element = {<Login/>}/>
            <Route path="/" element={<Navigate to="/home"/>}/>
            <Route path="/home" element= {<Home/>}/>
        </Routes>
        </BrowserRouter>
    )
}