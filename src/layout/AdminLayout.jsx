import React from 'react';
import {Outlet} from 'react-router-dom';
import SideBar from '../components/Sidebar.jsx'

function AdminLayout(){
    return(
        <div className = "flex h-screen bg-gray-100" >
            <SideBar />
            <div className = "flex flex-1 flex-col overflow-hidden">
                <header className="flex h-16 items-center bg-white px-8 shadow-md">
                    <h1 className="text-xl font-bold text-gray-800">
                        SmartSales 365
                    </h1>
                </header> 
                <main className="flex-1 overflow-auto p-8">
                    <Outlet />
                </main>   
            </div>
        </div>
    );
}

export default AdminLayout;
