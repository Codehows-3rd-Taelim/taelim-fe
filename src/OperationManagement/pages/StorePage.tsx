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

const itemsPerPage = 10;

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

  const handleUpdate = async (store: NormalizedStore) => {
    setUpdateStatus(null);
    const payload: Partial<Store> = {
      shopId: store.shopId,
      shopName: store.shopName,
      industryId: store.industryId || 0,
    };

    try {
      await updateStore(store.storeId, payload);
      fetchData();
      const msg = `'${store.shopName}' 매장 정보가 성공적으로 업데이트되었습니다.`;
      setUpdateStatus(msg);
      setTimeout(() => setUpdateStatus(null), 2000);
    } catch (err) {
      const msg = `업데이트 실패: ${
        err instanceof Error ? err.message : "알 수 없는 오류"
      }`;
      setUpdateStatus(msg);
      setTimeout(() => setUpdateStatus(null), 2000);
    }
  };

  const isStoreModified = (store: NormalizedStore) => {
    const original = stores.find((s) => s.storeId === store.storeId);
    if (!original) return false;
    return (
      original.shopName !== store.shopName ||
      original.shopId !== store.shopId ||
      original.industryId !== store.industryId
    );
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
      <h3 className="text-xl font-bold mb-5 ml-4">매장 관리</h3>

      {/* 상태 및 오류 메시지 */}
      {error && (
        <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 ml-4">{error}</p>
      )}

      {updateStatus && (
        <p
          className={`p-3 rounded-lg mb-4 ml-4 font-medium ${
            updateStatus.includes("성공")
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {updateStatus}
        </p>
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
                  const modified = isStoreModified(store);
                  return (
                    <tr key={store.storeId} className="h-11 border-b border-gray-200 hover:bg-blue-50/50 transition-colors">
                      {/* 매장명 */}
                      <td className="px-2">
                        <div className="py-1 px-2 w-full text-center font-semibold text-gray-700">
                          {store.shopName}
                        </div>
                      </td>
                      
                      {/* Shop ID */}
                      <td className="px-2">
                        <div className="py-1 px-2 w-full text-center text-gray-700">
                          {store.shopId}
                        </div>
                      </td>

                      {/* 업종 */}
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
                          className="border rounded-md p-1 w-60 text-center focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value={0}>-- 미지정 --</option>
                          {industries.map((ind) => (
                            <option key={ind.industryId} value={ind.industryId}>
                              {ind.industryName}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* 저장 버튼 */}
                      <td className="px-2">
                        <button
                          onClick={() => handleUpdate(store)}
                          disabled={!modified}
                          className={`px-3 py-1.5 rounded text-white font-medium
                            ${modified 
                              ? "bg-orange-500 hover:bg-orange-600 cursor-pointer" 
                              : "bg-gray-300 cursor-not-allowed opacity-80"
                            }
                          `}
                        >
                          저장
                        </button>
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