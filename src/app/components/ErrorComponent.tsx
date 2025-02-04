import { useSearchParams } from "next/navigation";

export default function ErrorComponent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
  
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold text-red-600">Error</h2>
        <p>{error || "An unknown error occurred."}</p>
      </div>
    );
  }
  