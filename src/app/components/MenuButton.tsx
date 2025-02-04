"use client";
import { IoClose } from "react-icons/io5";
import { RiMenu2Fill } from "react-icons/ri";

interface MenuButtonProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({ isOpen, toggleSidebar }) => {
  return (
    <button
      className="text-white p-2 hover:bg-gray-700 rounded-lg md:hidden"
      onClick={toggleSidebar}
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      {isOpen ? <IoClose size={24} /> : <RiMenu2Fill size={24} />}
    </button>
  );
};

export default MenuButton; 