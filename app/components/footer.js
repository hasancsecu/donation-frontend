import Link from "next/link";
import { FaDonate } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-800 text-white py-4 mt-8">
      <div className="container mx-auto flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-center">
          <span>Support our cause and make a difference</span>
        </p>
        <Link href="/donate">
          <button className="flex items-center bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600">
            <FaDonate className="text-white mr-2" />
            Donate Now
          </button>
        </Link>
      </div>
    </footer>
  );
}
