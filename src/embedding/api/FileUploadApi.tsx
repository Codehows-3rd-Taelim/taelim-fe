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
  formData.append("embedKey", embedKey); // ⭐ 추가

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
