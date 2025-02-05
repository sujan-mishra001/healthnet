import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./footer";



 const Layout  =()=>{
    return(
       
      
        <div className="flex flex-col min-h-screen ">
        <Navbar />
        
        <main className="flex-grow mt-40">
          <Outlet />
        </main>
  
        <Footer />
      </div>
     
        
    );
 };
 export default Layout;