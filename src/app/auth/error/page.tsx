// // /auth/error/page.tsx
// import Link from 'next/link';

// export default function AuthError({ searchParams }: { searchParams: { error?: string } }) {
//   const errorMessage = searchParams.error || "An authentication error occurred";

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
//       <div className="bg-white p-8 rounded-lg shadow-md text-center">
//         <h1 className="text-3xl font-bold mb-4 text-red-600">Authentication Error</h1>
//         <p className="mb-4">{errorMessage}</p>
//         <Link href="/auth/login" className="text-blue-600 hover:underline">
//           Return to Login
//         </Link>
//       </div>
//     </div>
//   );
// }
"use client";
import ErrorComponent from "@/app/components/ErrorComponent";
import { Suspense } from "react";

export default function ErrorPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ErrorComponent />
    </Suspense>
  );
}

