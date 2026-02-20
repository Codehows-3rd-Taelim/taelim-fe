import axios from "axios";
import type { EmbedFile, PaginationResponse } from "../../type";
import { endpoints } from "../../api/endpoints";

/** 파일 업로드 */
export async function postEmbedFile(
  file: File,
  embedKey: string
): Promise<EmbedFile> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("embedKey", embedKey);

  const res = await axios.post<EmbedFile>(endpoints.embeddings.files, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}

/** 파일 목록 조회 */
export async function getEmbedFiles(
  page: number,
  size: number
): Promise<PaginationResponse<EmbedFile>> {
  const res = await axios.get<PaginationResponse<EmbedFile>>(endpoints.embeddings.files, {
    params: { page, size },
  });
  return res.data;
}

/** 파일 삭제 */
export async function deleteEmbedFile(id: number) {
  await axios.delete(endpoints.embeddings.fileById(id));
}

//등록된 파일 다운
export async function downloadEmbedFile(file: EmbedFile) {
  const res = await axios.get(endpoints.embeddings.download(file.id), { responseType: "blob" });
  const blob = new Blob([res.data]);
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = file.originalName;
  link.click();
  window.URL.revokeObjectURL(link.href);
}
