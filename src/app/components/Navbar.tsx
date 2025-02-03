"use client";
import Link from "next/link";
import React from "react";
import { useSession } from "next-auth/react";
import LogoutButton from "./LogoutButton";

// Add the type for props here
const Navbar = () => {
  const { data: session } = useSession();

  return (
    <div className="bg-gray-800 z-40 p-4">
      <ul className="flex justify-between m-8 items-center text-white">
        <div>
         
          <Link href="/">
            <li className="list-none">Authentication</li>
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
