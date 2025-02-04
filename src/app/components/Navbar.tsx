"use client";
import Link from "next/link";
import React from "react";
import { useSession } from "next-auth/react";
import LogoutButton from "./LogoutButton";
import MenuButton from "./MenuButton";

interface NavbarProps {
  toggleSidebar: () => void;
  isOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar, isOpen }) => {
  const { data: session } = useSession();

  return (
    <div className="bg-gray-800 fixed top-0 left-0 right-0 z-50 p-4">
      <ul className="flex justify-between items-center text-white">
        <div className="flex items-center gap-4">
          <MenuButton isOpen={isOpen} toggleSidebar={toggleSidebar} />
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold">
              Auth<span className="text-blue-400">Flow</span>
            </span>
          </Link>
        </div>

        <div className="flex gap-10">
          <Link href="/dashboard">
            <li>Dashboard</li>
          </Link>
          {!session ? (
            <>
              <Link href="/auth/login">
                <li>Login</li>
              </Link>
              <Link href="/auth/register">
                <li>Register</li>
              </Link>
            </>
          ) : (
            <>
              {session.user?.name}
              <LogoutButton />
            </>
          )}
        </div>
      </ul>
    </div>
  );
};

export default Navbar;
