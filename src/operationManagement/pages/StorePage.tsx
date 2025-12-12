import { useEffect, useState, useCallback } from "react";
import { getStores, getIndustry, updateStore } from "../api/StoreApi";
import type { Store, Industry } from "../../type";
import Pagination from "../../components/Pagination";

type ApiStore = Omit<Store, "industryId"> & {
  industry?: {
    industryId: number;
    industryName: string;
  };
};

type NormalizedStore = Store & { industryId: number };

const itemsPerPage = 20;

export default function StorePage() {
  const [stores, setStores] = useState<NormalizedStore[]>([]);
  const [editableStores, setEditableStores] = useState<NormalizedStore[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 페이지네이션 상태 추가
  const [currentPage, setCurrentPage] = useState(1);

  const normalizeStores = (apiStores: ApiStore[]): NormalizedStore[] =>
    apiStores.map((store) => ({
      ...store,
      industryId: store.industry?.industryId ?? 0,
    }));

  const fetchData = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
        const [storeList, industryList] = await Promise.all([
          getStores() as Promise<ApiStore[]>,
          getIndustry(),
        ]);

        const normalizedStoreList = normalizeStores(storeList);
        // 원본과 편집 가능 데이터를 모두 설정
        setStores(normalizedStoreList);
        setEditableStores(normalizedStoreList);
        setIndustries(industryList);
        setCurrentPage(1);
    } catch (err) {
        const errorMessage =
        err instanceof Error
            ? err.message
            : "데이터 조회 중 오류가 발생했습니다.";
        setError(errorMessage);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetch = async () => await fetchData();
    fetch();
  }, [fetchData]);

  const handleFieldChange = (
    storeId: number,
    field: keyof NormalizedStore,
    value: string | number
  ) => {
    setEditableStores((prev) =>
      prev.map((s) => (s.storeId === storeId ? { ...s, [field]: value } : s))
    );
    setUpdateStatus(null);
  };

  // 개별 매장의 수정 여부 확인 함수 (전체 수정 여부 확인을 위해 사용)
  const isStoreModified = (store: NormalizedStore) => {
    const original = stores.find((s) => s.storeId === store.storeId);
    if (!original) return false;
    return (
      original.shopName !== store.shopName ||
      original.shopId !== store.shopId ||
      original.industryId !== store.industryId
    );
  };

  // **전체 매장 목록의 수정 여부 확인**
  const isAnyStoreModified = editableStores.some(isStoreModified);

  // **전체 저장 핸들러**
  const handleSaveAll = async () => {
    setUpdateStatus(null);
    const modifiedStores = editableStores.filter(isStoreModified);

    if (modifiedStores.length === 0) {
      setUpdateStatus("수정된 내용이 없습니다.");
      setTimeout(() => setUpdateStatus(null), 2000);
      return;
    }

    try {
      // 수정된 매장들을 순회하며 업데이트 API 호출
      const updatePromises = modifiedStores.map((store) => {
        const payload: Partial<Store> = {
          shopId: store.shopId,
          shopName: store.shopName,
          industryId: store.industryId || 0,
        };
        return updateStore(store.storeId, payload);
      });

      await Promise.all(updatePromises);

      // 성공 시 데이터 재조회 및 상태 업데이트
      await fetchData(); 
      // 토스트 알림 메시지 업데이트
      const msg = `총 ${modifiedStores.length}개의 매장 정보가 성공적으로 업데이트되었습니다.`;
      setUpdateStatus(msg);
      setTimeout(() => setUpdateStatus(null), 3000); // 3초 후 사라짐
    } catch (err) {
      // 토스트 알림 메시지 업데이트
      const msg = `❌ 업데이트 실패: ${
        err instanceof Error ? err.message : "알 수 없는 오류"
      }`;
      setUpdateStatus(msg);
      setTimeout(() => setUpdateStatus(null), 4000); // 4초 후 사라짐
    }
  };

  // **취소 핸들러**
  const handleCancel = () => {
    if (isAnyStoreModified) {
      // 변경 요청에 따라 window.confirm 유지
      const confirmCancel = window.confirm(
        "변경 내용이 있습니다. 변경 사항을 취소하고 원래 상태로 되돌리겠습니까?"
      );

      if (confirmCancel) {
        // '확인'을 누르면 원본 데이터로 복원
        setEditableStores(stores);
        // 토스트 알림 메시지 업데이트
        setUpdateStatus("ℹ️ 변경 사항이 취소되고 원본 상태로 복원되었습니다.");
        setTimeout(() => setUpdateStatus(null), 3000); // 3초 후 사라짐
      }
      // '취소'를 누르면 editableStores를 그대로 유지하며 메시지를 띄우지 않습니다.
    } else {
      setUpdateStatus("ℹ️ 변경 사항이 없습니다.");
      setTimeout(() => setUpdateStatus(null), 2000);
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // 페이지네이션 로직
  const totalPages = Math.ceil(editableStores.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const displayedStores = editableStores.slice(startIdx, startIdx + itemsPerPage);

  return (
    <div className="w-full min-h-screen px-6 py-4 bg-gray-100">
      <div className="flex justify-between items-center mb-5 ml-4">
        <h3 className="text-xl font-bold">매장 관리 목록</h3>
        {/* 저장/취소 버튼 그룹 */}
        <div className="space-x-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded text-gray-700 font-medium bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSaveAll}
            disabled={!isAnyStoreModified}
            className={`px-4 py-2 rounded text-white font-medium transition-colors ${
              isAnyStoreModified
                ? "bg-orange-500 hover:bg-orange-600 cursor-pointer"
                : "bg-gray-400 cursor-not-allowed opacity-80"
            }`}
          >
            저장
          </button>
        </div>
      </div>

      {/* 상태 및 오류 메시지 */}
      {error && (
        <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 ml-4">
          {error}
        </p>
      )}

      {/* 토스트 알림 영역 */}
      {updateStatus && (
        <div 
          // [변경] 왼쪽 하단 고정: fixed bottom-5 left-5
          // [선택] 위쪽 가운데 고정하려면: fixed top-5 left-1/2 -translate-x-1/2
          className="fixed bottom-5 left-5 z-50 transition-opacity duration-300"
        >
          <p
            className={`p-4 rounded-lg shadow-lg font-medium text-white min-w-[250px] ${
              updateStatus.includes("✅") // 성공 (저장)
                ? "bg-green-600"
                : updateStatus.includes("❌") // 실패 (저장 실패)
                ? "bg-red-600"
                : "bg-blue-500" // 정보 (취소, 수정없음)
            }`}
          >
            {updateStatus}
          </p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          매장 목록을 불러오는 중입니다...
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          등록된 매장이 없습니다.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-center border-separate border-spacing-y-2">
              <thead className="sticky top-0 bg-gray-100 shadow-sm z-10">
                <tr className="h-11 text-center text-gray-600 font-medium">
                  <th className="px-2 py-2">매장명</th>
                  <th className="px-2 py-2">Shop ID</th>
                  <th className="px-2 py-2">업종</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {displayedStores.map((store) => {
                  const modified = isStoreModified(store); // 개별 행의 수정 여부
                  return (
                    <tr
                      key={store.storeId}
                      className={`h-11 border-b border-gray-200 transition-colors ${
                        modified ? "bg-orange-50/70 hover:bg-orange-100/70" : "hover:bg-blue-50/50"
                      }`}
                    >
                      {/* 매장명 (shopName을 편집 가능하게 하려면 input으로 변경) */}
                      <td className="px-2">
                        <div className="py-1 px-2 w-full text-center font-semibold text-gray-700">
                            {store.shopName}
                        </div>
                      </td>

                      {/* Shop ID (shopId를 편집 가능하게 하려면 input으로 변경) */}
                      <td className="px-2">
                        <div className="py-1 px-2 w-full text-center text-gray-700">
                            {store.shopId}
                        </div>
                      </td>

                      {/* 업종 (선택) */}
                      <td className="px-2">
                        <select
                          value={store.industryId}
                          onChange={(e) =>
                            handleFieldChange(
                              store.storeId,
                              "industryId",
                              parseInt(e.target.value)
                            )
                          }
                          className={`border rounded-md p-1 w-60 text-center focus:ring-blue-500 focus:border-blue-500 ${
                            modified ? "border-orange-500 ring-2 ring-orange-200" : ""
                          }`}
                        >
                          <option value={0}>-- 미지정 --</option>
                          {industries.map((ind) => (
                            <option key={ind.industryId} value={ind.industryId}>
                              {ind.industryName}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div className="mt-5 flex justify-center">
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              maxButtons={5}
            />
          </div>
        </>
      )}
    </div>
  );
}