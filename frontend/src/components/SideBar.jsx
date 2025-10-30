import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUser, FaPlusCircle, FaBook, FaEnvelope, FaUsers, FaPaperPlane } from "react-icons/fa";
import supabase from "../supabaseClient";

const SideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const response = await fetch(`http://localhost:5000/api/auth/profile/${user.id}`);
        const result = await response.json();
        if (result.success) {
          setUserRole(result.profile.role);
        }
      }
    };
    fetchUserRole();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    localStorage.removeItem("profile");
    window.location.href = "/";
  };

  // Role-based menu items
  const getMenuItems = () => {
    if (!userRole) return [];

    if (userRole === 'student') {
      return [
        { label: "Profile", mobileLabel: "Profile", path: "/dashboard", icon: <FaUser /> },
        { label: "Add Post", mobileLabel: "Add", path: "/post-tuition", icon: <FaPlusCircle /> },
        { label: "My post", mobileLabel: "Posts", path: "/my-post", icon: <FaBook /> },
        { label: "Tutor Requests", mobileLabel: "Requests", path: "/my-applications", icon: <FaEnvelope /> },
        { label: "Tutor Responses", mobileLabel: "Responses", path: "/my-sent-requests", icon: <FaPaperPlane /> },
      ];
    }
    if (userRole === 'tutor') {
      return [
        { label: "Profile", mobileLabel: "Profile", path: "/dashboard", icon: <FaUser /> },
        { label: "Student Responses", mobileLabel: "Responses", path: "/my-applied-posts", icon: <FaEnvelope /> },
        { label: "Student Requests", mobileLabel: "Requests", path: "/tutor-requests", icon: <FaUsers /> },
      ];
    }
  };

  const tabs = getMenuItems();

  return (
    <div>
      {/* Desktop Sidebar */}
      {/* fixed class add korlam sidebar fixed position e rakhte */}
      {/* top-0 left-0 add korlam screen er top-left corner theke sidebar start hobe */}
      {/* h-screen use korlam full height cover korte, h-full er bodole */}
      {/* overflow-y-auto add korlam jate sidebar er bhitore content beshi hole scroll hoy */}
      <div className="hidden md:flex md:fixed md:top-0 md:left-0 md:h-screen md:overflow-y-auto flex-col w-60 bg-[#F9FFF5] border-r border-gray-300 p-4">
        <ul className="space-y-2 pt-20">
          {tabs.map((tab) => (
            <li key={tab.path}>
              <button
                onClick={() => navigate(tab.path)}
                className={`w-full text-left px-3 py-1 rounded-md transition cursor-pointer ${location.pathname === tab.path
                  ? "bg-[#FBFDF6] text-black font-semibold border border-[#81C15E]"
                  : "text-black"
                  }`}
              >
                {tab.label}
              </button>
            </li>
          ))}
          {/* logout button for dekstop */}
          <li>
            <button
              onClick={handleLogout}
              className="w-full text-left text-red-500 px-3 py-1 hover:bg-red-100 rounded-md cursor-pointer"
            >
              Log out
            </button>
          </li>
        </ul>
        <div className="mt-auto">
          <p className="text-sm text-gray-500">
            Designed and Developed by <br /> Team Trinity.
          </p>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {/* pb-safe class add korlam jeno mobile bar er niche safe area thake */}
      {/* py-3 korsi aro space er jonno */}
      {/* Mobile e logout button remove korlam - eta ekhon navbar e thakbe */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-md flex justify-around items-center py-3 pb-safe md:hidden z-50">
        {tabs.map((tab) => (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center text-xs ${location.pathname === tab.path
              ? "text-[#70B44A] font-semibold"
              : "text-gray-600"
              }`}
          >
            <span className="text-lg mb-1">{tab.icon}</span>
            <span className="text-xs">{tab.mobileLabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SideBar;