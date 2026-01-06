import axios from "axios";
import type { EmbedFile } from "../../type";

const BASE_URL = import.meta.env.VITE_API_URL;

/** 파일 업로드 */
export async function postEmbedFile(
  file: File,
  embedKey: string
): Promise<EmbedFile> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("embedKey", embedKey);

  const res = await axios.post<EmbedFile>(`${BASE_URL}/embed-files`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}

/** 파일 목록 조회 */
export async function getEmbedFiles(): Promise<EmbedFile[]> {
  const res = await axios.get<EmbedFile[]>(`${BASE_URL}/embed-files`);
  return res.data;
}

/** 파일 삭제 */
export async function deleteEmbedFile(id: number) {
  await axios.delete(`${BASE_URL}/embed-files/${id}`);
}

//등록된 파일 다운
export async function downloadEmbedFile(file: EmbedFile) {
  const url = `${BASE_URL}/embed-files/${file.id}/download`;

  const res = await axios.get(url, { responseType: "blob" });
  const blob = new Blob([res.data]);
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = file.originalName;
  link.click();
  window.URL.revokeObjectURL(link.href);
}
