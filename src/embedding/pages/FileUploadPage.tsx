import { useEffect, useRef, useState } from "react";
import getFileIcon from "../components/getFileIcon";
import type { EmbedFile } from "../../type";
import {
  getEmbedFiles,
  postEmbedFile,
  deleteEmbedFile,
} from "../api/FileUploadApi";
import axios from "axios";

export default function FileUploadPage() {
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const [uploadedFiles, setUploadedFiles] = useState<EmbedFile[]>([]);

  const [duplicateError] = useState<string | null>(null);

  const [duplicateNames, setDuplicateNames] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getEmbedFiles()
      .then((files) => setUploadedFiles(Array.isArray(files) ? files : []))
      .catch(() => alert("파일 목록 불러오기 실패"));
  }, []);

  const alertedRef = useRef(false);

  useEffect(() => {
    if (duplicateNames.length > 0 && !alertedRef.current) {
      alert("이미 등록된 파일이 있습니다.");
      alertedRef.current = true;
    }

    if (duplicateNames.length === 0) {
      alertedRef.current = false;
    }
  }, [duplicateNames]);
  //파일 중복 방지
  const isDuplicate = (filename: string) => {
    return (
      pendingFiles.some((f) => f.name === filename) ||
      uploadedFiles.some((f) => f.originalName === filename)
    );
  };

  const removePendingFile = (name: string) => {
    setPendingFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const isAllowedFile = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    return ext === "pdf" || ext === "csv";
  };

  /* 파일 선택 */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    const allowed: File[] = [];
    const duplicates: string[] = [];

    files.forEach((file) => {
      if (!isAllowedFile(file.name)) return;

      if (isDuplicate(file.name)) {
        duplicates.push(file.name);
      } else {
        allowed.push(file);
      }
    });

    if (duplicates.length > 0) {
      setDuplicateNames(duplicates);
    } else {
      setDuplicateNames([]);
    }

    setPendingFiles((prev) => [...prev, ...allowed]);
  };

  /* 드래그 앤 드롭 */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (f) => isAllowedFile(f.name) && !isDuplicate(f.name)
    );

    if (droppedFiles.length === 0) {
      alert("이미 추가된 파일이거나 허용되지 않은 파일입니다.");
      return;
    }

    setPendingFiles((prev) => [...prev, ...droppedFiles]);
  };

  const generateEmbedKey = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);

    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  // 등록 버튼
  const handleRegister = async () => {
    if (pendingFiles.length === 0) return;

    try {
      const newFiles: EmbedFile[] = [];

      for (const file of pendingFiles) {
        const embedKey = await generateEmbedKey(file);
        const saved = await postEmbedFile(file, embedKey);
        newFiles.push(saved);
      }

      setUploadedFiles((prev) => [...prev, ...newFiles]);
      setPendingFiles([]);
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        alert(e.response?.data || e.message);
      } else if (e instanceof Error) {
        alert(e.message);
      } else {
        alert("업로드 중 알 수 없는 오류 발생");
      }
    }
  };

  const handleDelete = async (file: EmbedFile) => {
    if (!confirm(`${file.originalName} 파일을 삭제할까요?`)) return;

    try {
      await deleteEmbedFile(file.id);

      // 화면에서도 제거
      setUploadedFiles((prev) => prev.filter((f) => f.id !== file.id));
    } catch {
      alert("파일 삭제 실패");
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 ">
      <h2 className="font-bold text-lg ml-10 mt-5 mb-5">파일 업로드</h2>

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
          className="bg-[#4A607A] hover:bg-[#324153] rounded-xl h-35 pb-7 pt-2 flex flex-col items-center justify-center text-white text-4xl mb-4  cursor-pointer"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          +<span className="text-sm mt-2">클릭하거나 파일을 드래그하세요</span>
          <span className="text-sm mt-2">
            (pdf, csv 파일만 등록 가능합니다.)
          </span>
        </div>
        {duplicateError && (
          <p className="text-sm text-red-500 mt-2">{duplicateError}</p>
        )}
        {/* 선택된 파일 미리보기 */}
        {pendingFiles.length > 0 && (
          <div className="bg-white rounded-xl p-1 mb-4 space-y-2">
            {pendingFiles.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-3">
                  {getFileIcon(file.name)}
                  <span>{file.name}</span>
                </div>

                <button
                  type="button"
                  onClick={() => removePendingFile(file.name)}
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
          className="w-full bg-[#324153] hover:bg-[#4A607A] text-white py-2 rounded font-semibold"
        >
          등록
        </button>
        {duplicateNames.length > 0 && (
          <p className="text-l text-red-500 mt-6 ">
            이미 등록된 파일 : {duplicateNames.join(", ")}
          </p>
        )}
      </div>

      {/* 학습된 파일 */}
      <h2 className="font-bold mt-8 mb-2 ml-10">학습된 파일</h2>
      <div className="bg-gray-100 rounded-xl p-4 space-y-3 mr-5 ml-5">
        {Array.isArray(uploadedFiles) &&
          uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="bg-white rounded-lg px-4 py-3 flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                {getFileIcon(file.originalName)}
                <span>{file.originalName}</span>
              </div>

              <button
                onClick={() => handleDelete(file)}
                className="bg-[#d14e4e] hover:bg-[#d11a1a] text-white px-3 py-1 rounded text-sm"
              >
                삭제
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
