import { useRef, useState } from "react";
import getFileIcon from "../components/getFileIcon";

export default function FileUploadPage() {
  const [pendingFiles, setPendingFiles] = useState<string[]>([]);

  const [uploadedFiles, setUploadedFiles] = useState<string[]>([
    "회사 배경 및 설명.csv",
    "CC1 사용법 가이드.pdf",
    "MT1 사용법 가이드.pdf",
    "회사 배경 및 설명.csv",
    "CC1 사용법 가이드.pdf",
    "MT1 사용법 가이드.pdf",
  ]);

  const inputRef = useRef<HTMLInputElement>(null);

  //파일 중복 방지
  const isDuplicate = (name: string) => {
    return pendingFiles.includes(name) || uploadedFiles.includes(name);
  };

  const removePendingFile = (name: string) => {
    setPendingFiles((prev) => prev.filter((f) => f !== name));
  };

  const isAllowedFile = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    return ext === "pdf" || ext === "csv";
  };

  /* 파일 선택 */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    const allowed = files.filter(
      (f) => isAllowedFile(f.name) && !isDuplicate(f.name)
    );

    const rejected = files.filter((f) => !isAllowedFile(f.name));

    if (rejected.length > 0) {
      alert("PDF 또는 CSV 파일만 업로드 가능합니다.");
    }

    if (allowed.length < files.length) {
      alert("이미 추가된 파일은 제외되었습니다.");
    }

    setPendingFiles((prev) => [...prev, ...allowed.map((f) => f.name)]);
  };

  /* 드래그 앤 드롭 */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const droppedFiles = Array.from(e.dataTransfer.files)
      .filter((f) => isAllowedFile(f.name) && !isDuplicate(f.name))
      .map((f) => f.name);

    if (droppedFiles.length === 0) {
      alert("이미 추가된 파일이거나 허용되지 않은 파일입니다.");
      return;
    }

    setPendingFiles((prev) => [...prev, ...droppedFiles]);
  };

  /* 등록 버튼 */
  const handleRegister = () => {
    if (pendingFiles.length === 0) return;

    setUploadedFiles((prev) => [...prev, ...pendingFiles]);
    setPendingFiles([]);
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <h2 className="font-bold text-lg mb-2 ml-10 mt-5 mb-5">파일 업로드</h2>

      {/* 업로드 박스 */}
      <div className="bg-gray-100 rounded-xl p-6 border-2 border-dashed border-gray-300 mr-10 ml-10">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.csv"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* + 업로드 영역 (항상 보임) */}
        <div
          className="bg-orange-400 rounded-xl h-35 flex flex-col items-center justify-center text-white text-4xl mb-4 cursor-pointer"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          +<span className="text-sm mt-2">클릭하거나 파일을 드래그하세요</span>
          <span className="text-sm mt-2">
            (pdf, csv 파일만 등록 가능합니다.)
          </span>
        </div>

        {/* 선택된 파일 미리보기 */}
        {pendingFiles.length > 0 && (
          <div className="bg-white rounded-xl p-1 mb-4 space-y-2">
            {pendingFiles.map((name) => (
              <div
                key={name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-3">
                  {getFileIcon(name)}
                  <span>{name}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePendingFile(name);
                  }}
                  className="text-orange-400 hover:text-red-500 font-bold leading-none"
                >
                  <span className="text-3xl">×</span>
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={handleRegister}
          disabled={pendingFiles.length === 0}
          className="w-full bg-orange-500 disabled:bg-gray-300 text-white py-2 rounded font-semibold"
        >
          등록
        </button>
      </div>

      {/* 학습된 파일 */}
      <h2 className="font-bold mt-8 mb-2 ml-10">학습된 파일</h2>
      <div className="bg-gray-100 rounded-xl p-4 space-y-3 mr-5 ml-5">
        {uploadedFiles.map((name) => (
          <div
            key={name}
            className="bg-white rounded-lg px-4 py-3 flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              {getFileIcon(name)}
              <span>{name}</span>
            </div>

            <button className="bg-red-500 text-white px-3 py-1 rounded text-sm">
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
