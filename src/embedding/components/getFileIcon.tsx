import { FaFilePdf, FaFileCsv, FaFileAlt } from "react-icons/fa";

export default function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();

  if (ext === "pdf") {
    return <FaFilePdf className="text-red-600 text-xl" />;
  }

  if (ext === "csv") {
    return <FaFileCsv className="text-green-600 text-xl" />;
  }

  return <FaFileAlt className="text-gray-500 text-xl" />;
}
