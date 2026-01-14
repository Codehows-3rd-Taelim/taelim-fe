import { useEffect, useRef, useState } from "react";
import getFileIcon from "../components/getFileIcon";
import type { EmbedFile } from "../../type";
import {
  getEmbedFiles,
  postEmbedFile,
  deleteEmbedFile,
  downloadEmbedFile,
} from "../api/FileUploadApi";
import axios from "axios";
import { FaDownload } from "react-icons/fa";
import Pagination from "../../components/Pagination";

export default function FileUploadPage() {
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<EmbedFile[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  /** pagination */
  const [page, setPage] = useState(1); // 화면용 (1부터)
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 10;

  /** 임베딩 중 여부 */
  const hasEmbedding = uploadedFiles.some(
    (file) => file.status === "EMBEDDING"
  );

  /** 임베딩 중일 때 상태 폴링 */
  useEffect(() => {
    if (!hasEmbedding) return;

    const interval = setInterval(() => {
      getEmbedFiles(page - 1, PAGE_SIZE)
        .then((res) => {
          setUploadedFiles(res.content);
          setTotalPages(res.totalPages);
        })
        .catch(() => console.error("파일 상태 갱신 실패"));
    }, 2000);

    return () => clearInterval(interval);
  }, [hasEmbedding, page]);

  /** 페이지 변경 시 목록 조회 */
  useEffect(() => {
    getEmbedFiles(page - 1, PAGE_SIZE)
      .then((res) => {
        setUploadedFiles(res.content);
        setTotalPages(res.totalPages);
      })
      .catch(() => alert("파일 목록 불러오기 실패"));
  }, [page]);

  /** FAILED 파일 알림 + 자동 삭제 */
  const failedAlertedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const failedFiles = uploadedFiles.filter(
      (file) => file.status === "FAILED"
    );

    failedFiles.forEach(async (file) => {
      if (failedAlertedRef.current.has(file.id)) return;

      failedAlertedRef.current.add(file.id);
      alert(`임베딩 실패: ${file.originalName}`);

      try {
        await deleteEmbedFile(file.id);
        setUploadedFiles((prev) => prev.filter((f) => f.id !== file.id));
      } catch {
        console.error("FAILED 파일 삭제 실패", file.id);
      }
    });
  }, [uploadedFiles]);

  /** 파일 중복 체크 */
  const isDuplicate = (filename: string) =>
    pendingFiles.some((f) => f.name === filename);

  const isAllowedFile = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    return ext === "pdf" || ext === "csv";
  };

  /** 파일 선택 */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    const duplicates: string[] = [];
    const allowed = files.filter((file) => {
      if (!isAllowedFile(file.name)) return false;
      if (isDuplicate(file.name)) {
        duplicates.push(file.name);
        return false;
      }
      return true;
    });

    if (allowed.length > 0) {
      setPendingFiles((prev) => [...prev, ...allowed]);
    }

    // 같은 파일 다시 선택 가능하게
    e.target.value = "";
  };

  /** 드래그 앤 드롭 */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const files = Array.from(e.dataTransfer.files);

    const duplicates: string[] = [];
    const allowed = files.filter((file) => {
      if (!isAllowedFile(file.name)) return false;
      if (isDuplicate(file.name)) {
        duplicates.push(file.name);
        return false;
      }
      return true;
    });

    if (allowed.length > 0) {
      setPendingFiles((prev) => [...prev, ...allowed]);
    }
  };

  /** 해시 키 생성 */
  const generateEmbedKey = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);

    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  /** 등록 */
  const handleRegister = async () => {
    if (pendingFiles.length === 0) return;

    try {
      const newFiles: EmbedFile[] = [];

      for (const file of pendingFiles) {
        const embedKey = await generateEmbedKey(file);
        const saved = await postEmbedFile(file, embedKey);
        newFiles.push(saved);
      }

      setUploadedFiles((prev) => [...newFiles, ...prev]);
      setPendingFiles([]);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        console.log("🔥 error.response.data", e.response?.data);
        if (e.response?.status === 409) {
          const msg =
            typeof e.response.data === "string"
              ? e.response.data
              : e.response.data?.message ?? "이미 등록된 파일입니다.";
          alert(msg);
        } else {
          alert("업로드 중 오류가 발생했습니다.");
        }
      }
    }
  };

  /** 삭제 */
  const handleDelete = async (file: EmbedFile) => {
    if (file.status === "EMBEDDING") {
      alert("임베딩 중인 파일은 삭제할 수 없습니다.");
      return;
    }

    if (!confirm(`${file.originalName} 파일을 삭제할까요?`)) return;

    await deleteEmbedFile(file.id);

    // 삭제 후 최신 데이터 다시 조회
    const res = await getEmbedFiles(page - 1, PAGE_SIZE);

    // 만약 현재 페이지가 사라졌다면 이전 페이지로
    if (res.totalPages > 0 && page > res.totalPages) {
      setPage(res.totalPages);
    } else {
      setUploadedFiles(res.content);
      setTotalPages(res.totalPages);
    }
  };

  /** 상태 렌더링 */
  const renderStatus = (status: string) => {
    if (status === "EMBEDDING")
      return (
        <span className="text-blue-500 animate-pulse ml-2">임베딩 중...</span>
      );
    if (status === "DONE")
      return <span className="text-green-600 ml-2">완료</span>;
    if (status === "FAILED")
      return <span className="text-red-500 ml-2">실패</span>;
    return null;
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <h2 className="font-bold text-lg ml-10 mt-5 mb-5">파일 업로드</h2>

      {/* 업로드 박스 */}
      <div
        className="bg-gray-100 rounded-xl p-6 border-2 border-dashed border-gray-300 mx-10"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.csv"
          className="hidden"
          onChange={handleFileChange}
        />

        <div
          className="bg-[#4A607A] hover:bg-[#324153] rounded-xl h-32 flex flex-col items-center justify-center text-white text-4xl cursor-pointer"
          onClick={() => inputRef.current?.click()}
        >
          +<span className="text-sm mt-2">클릭하거나 파일을 드래그하세요</span>
          <span className="text-sm mt-2">
            (pdf, csv 파일만 등록 가능합니다.)
          </span>
        </div>

        {pendingFiles.length > 0 && (
          <div className="bg-white rounded-xl p-3 mt-4 space-y-2">
            {pendingFiles.map((file) => (
              <div key={file.name} className="flex justify-between">
                <div className="flex items-center gap-2">
                  {getFileIcon(file.name)}
                  <span>{file.name}</span>
                </div>
                <button
                  onClick={() =>
                    setPendingFiles((prev) =>
                      prev.filter((f) => f.name !== file.name)
                    )
                  }
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleRegister}
          disabled={pendingFiles.length === 0}
          className="w-full bg-[#324153] text-white py-2 rounded mt-4"
        >
          등록
        </button>
      </div>

      {/* 파일 목록 */}
      <h2 className="font-bold mt-8 mb-2 ml-10">학습된 파일</h2>

      <div className="space-y-3 mx-10">
        {uploadedFiles.map((file) => (
          <div
            key={file.id}
            className="bg-white rounded-lg px-4 py-3 flex justify-between"
          >
            <div className="flex items-center gap-2">
              {getFileIcon(file.originalName)}
              <span>{file.originalName}</span>
              {renderStatus(file.status)}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadEmbedFile(file)}
                disabled={file.status === "EMBEDDING"}
              >
                <FaDownload />
              </button>
              <button
                onClick={() => handleDelete(file)}
                disabled={file.status === "EMBEDDING"}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
}
