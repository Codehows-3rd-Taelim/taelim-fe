import { useState } from "react";
import FileUploadPage from "./FileUploadPage";
import QAPage from "./QAPage";

export default function EmbeddingPage() {
  const [tab, setTab] = useState<"file" | "qa">("file");

  return (
    <div className="w-full h-screen px-4 pt-2 pb-0 flex flex-col">
      {/* 탭 영역 */}
      <div className="flex border-b border-gray-300">
        <button
          onClick={() => setTab("file")}
          className={`px-4 py-2 font-semibold transition border border-b-0 mr-0.5
            ${
              tab === "file"
                ? "bg-orange-500 text-white border-gray-300"
                : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
            }`}
          style={{ borderRadius: "0.5rem 0.5rem 0 0" }}
        >
          파일
        </button>

        <button
          onClick={() => setTab("qa")}
          className={`px-4 py-2 font-semibold transition border border-b-0
            ${
              tab === "qa"
                ? "bg-orange-500 text-white border-gray-300"
                : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
            }`}
          style={{ borderRadius: "0.5rem 0.5rem 0 0" }}
        >
          Q&A
        </button>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex-1 border border-gray-300 border-t-0 p-4 bg-white overflow-auto">
        {tab === "file" && <FileUploadPage />}
        {tab === "qa" && <QAPage />}
      </div>
    </div>
  );
}
