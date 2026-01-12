import { useState } from "react";
import FileUploadPage from "./FileUploadPage";
import SyncData from "../../sync/SyncData";
import AdminQnaPage from "../../qna/AdminQnaPage";

export default function EmbeddingPage() {
  const [tab, setTab] = useState<"file" | "qa" | "data">("file");

  return (
    <div className="w-full  h-full flex justify-center bg-gray-100 pb-6">
      <div className="w-full max-w-[1400px] flex flex-col px-4 pt-2 pb-0">
        {/* 탭 영역 */}
        <div className="flex  px-4 pt-6  bg-gray-100 border-b-2 border-gray-400 sm:px-6">
          <button
            onClick={() => setTab("file")}
            className={`px-4 py-2 font-semibold transition border border-b-0 mr-0.5
              ${
                tab === "file"
                  ? "bg-[#4A607A] text-white border-[#4A607A]"
                  : "bg-gray-300 text-gray-600 border-gray-300 hover:bg-gray-200"
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
                  ? "bg-[#4A607A] text-white border-[#4A607A]"
                  : "bg-gray-300 text-gray-600 border-gray-300 hover:bg-gray-200"
              }`}
            style={{ borderRadius: "0.5rem 0.5rem 0 0" }}
          >
            Q&A
          </button>
          <button
            onClick={() => setTab("data")}
            className={`px-4 py-2 font-semibold transition border border-b-0
              ${
                tab === "data"
                  ? "bg-[#4A607A] text-white border-[#4A607A]"
                  : "bg-gray-300 text-gray-600 border-gray-300 hover:bg-gray-200"
              }`}
            style={{ borderRadius: "0.5rem 0.5rem 0 0" }}
          >
            보고서 데이터 동기화
          </button>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="flex-1 border border-gray-300 border-t-0 p-4 bg-white overflow-auto min-h-[400px]">
          {tab === "file" && <FileUploadPage />}
          {tab === "qa" && <AdminQnaPage />}
          {tab === "data" && <SyncData />}
        </div>
      </div>
    </div>
  );
}
