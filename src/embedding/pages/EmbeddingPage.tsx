import { useState } from "react";
import FileUploadPage from "./FileUploadSection";
import QAPage from "./TrainedFileList";

export default function EmbeddingPage() {
  const [tab, setTab] = useState<"file" | "qa">("file");

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 상단 탭 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("file")}
          className={`rounded font-semibold transition ${
            tab === "file"
              ? "bg-orange-500 text-white"
              : "bg-gray-300 text-gray-600"
          }`}
        >
          파일
        </button>
        <button
          onClick={() => setTab("qa")}
          className={`rounded font-semibold transition ${
            tab === "qa"
              ? "bg-orange-500 text-white"
              : "bg-gray-300 text-gray-600"
          }`}
        >
          Q&A
        </button>
      </div>

      {tab === "file" && <FileUploadPage />}
      {tab === "qa" && <QAPage />}
    </div>
  );
}
