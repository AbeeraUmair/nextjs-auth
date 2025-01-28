// app/register/page.tsx
"use client";
import { useRouter } from "next/navigation";
import bcrypt from "bcryptjs";

export default function RegisterPage() {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Send the data to the server
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password: hashedPassword }),
    });

    if (response.ok) {
      router.push("/login");
    } else {
      alert("Registration failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mt-32 bg-gray-400 p-20 w-96 rounded-lg mx-auto">
      <h1 className="text-4xl mb-5">Register</h1>
      <form className="flex flex-col justify-center items-center mb-5 "  onSubmit={handleSubmit}>
        <input className="mb-5 p-2 rounded-lg"  type="email" name="email" placeholder="Email" required />
        <input className="mb-5 p-2 rounded-lg"  type="password" name="password" placeholder="Password" required />
        <button className="bg-gray-800 text-white  rounded-lg px-4 py-1" type="submit">Register</button>
      </form>
    </div>
  );
}