import { useRef } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  message,
}) {
  return (
    isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-md shadow-md w-[400px] relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-red-500 text-xl"
          >
            <FaTimes />
          </button>
          <p className="text-lg font-medium mb-4">{message}</p>
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              <FaTimes className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              <FaCheck className="w-4 h-4" />
              Confirm
            </button>
          </div>
        </div>
      </div>
    )
  );
}
