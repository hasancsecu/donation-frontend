import Link from "next/link";
import { FaExclamationTriangle } from "react-icons/fa";

export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <FaExclamationTriangle className="text-orange-500 text-8xl mb-6" />
      <h1 className="text-5xl font-extrabold text-orange-500">
        403 | Forbidden
      </h1>
      <p className="text-lg text-gray-700 mt-4">
        You don't have access to view this page
      </p>
      <Link href="/">
        <button className="mt-6 bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition duration-200 flex items-center gap-2">
          Return Home
        </button>
      </Link>
    </div>
  );
}
