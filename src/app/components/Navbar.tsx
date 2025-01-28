"use client"
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import LogoutButton from "./LogoutButton";
const Navbar = () => {
  const { data: session } = useSession();
  return (
    <div className="bg-gray-800 p-4">
      <ul className="flex justify-between m-8 items-center text-white">
        <div>
          <Link href="/">
            <li className="list-none">Home</li>
          </Link>
        </div>
        <div className="flex gap-10">
          <Link href="/dashboard">
            <li>Dashboard</li>
          </Link>
          {!session ? (
            <>
              <Link href="/login">
                <li>Login</li>
              </Link>
              <Link href="/register">
                <li>Register</li>
              </Link>
            </>
          ) : (
            <>
              {session.user?.email}
              <li>
                <button
                  onClick={() => {
                    signOut();
                  }}
                  className="p-2 px-5 -mt-1 bg-blue-800 rounded-full"
                >
                 <LogoutButton/>
                </button>
              </li>
            </>
          )}
        </div>
      </ul>
    </div>
  );
};

export default Navbar;