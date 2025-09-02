import Sidebar from "../components/Sidebar";
import RightSidebar from "../components/RightSidebar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-black text-white">
            <main className="max-w-7xl mx-auto flex h-screen">
                <aside className="w-64 h-full overflow-y-auto custom-scrollbar">
                    <Sidebar />
                </aside>
                <div className="flex-1 h-full overflow-y-auto border-l border-r border-gray-800 custom-scrollbar">
                    <Outlet />
                </div>
                <aside className="w-92 h-full overflow-y-auto custom-scrollbar">
                    <RightSidebar />
                </aside>
            </main>
        </div>
    );
};

export default MainLayout;