import { useEffect, useState, useCallback } from "react";
import { getStores, getIndustry, updateStore } from "../api/StoreApi";
import type { Store, Industry } from "../../type";
import Pagination from "../../components/Pagination";

type StoreForEdit = Omit<Store, "industryId"> & {
  industryId: number;
};

type EditableField = "shopId" | "shopName" | "industryId";

const itemsPerPage = 15;

export default function StorePage() {
  const [stores, setStores] = useState<StoreForEdit[]>([]);
  const [editableStores, setEditableStores] = useState<StoreForEdit[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const normalizeStores = (apiStores: Store[]): StoreForEdit[] =>
    apiStores.map((store) => ({
      ...store,
      industryId: store.industryId ?? 0,
    }));

  const fetchStoresPage = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const response = await getStores(page, itemsPerPage);
      const normalized = normalizeStores(response.content);

      setStores(normalized);
      setEditableStores(normalized);
      setTotalItems(response.totalElements);
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStoresPage(1);
    getIndustry().then(setIndustries);
  }, [fetchStoresPage]);

  const handleFieldChange = (
    storeId: number,
    field: EditableField,
    value: string | number
  ) => {
    setEditableStores((prev) =>
      prev.map((s) =>
        s.storeId === storeId ? { ...s, [field]: value } : s
      )
    );
    setUpdateStatus(null);
  };

  const isStoreModified = (store: StoreForEdit) => {
    const original = stores.find((s) => s.storeId === store.storeId);
    if (!original) return false;

    return (
      original.shopName !== store.shopName ||
      original.shopId !== store.shopId ||
      original.industryId !== store.industryId
    );
  };

  const isAnyStoreModified = editableStores.some(isStoreModified);

  const handleSaveAll = async () => {
    const modifiedStores = editableStores.filter(isStoreModified);

    if (modifiedStores.length === 0) {
      setUpdateStatus("수정된 내용이 없습니다.");
      setTimeout(() => setUpdateStatus(null), 2000);
      return;
    }

    try {
      await Promise.all(
        modifiedStores.map((store) =>
          updateStore(store.storeId, {
            shopId: store.shopId,
            shopName: store.shopName,
            industryId: store.industryId || 0,
          })
        )
      );

      await fetchStoresPage(currentPage);
      setUpdateStatus(
        `총 ${modifiedStores.length}개의 매장 정보가 업데이트되었습니다.`
      );
      setTimeout(() => setUpdateStatus(null), 3000);
    } catch (err) {
      setUpdateStatus("❌ 업데이트 실패");
      setTimeout(() => setUpdateStatus(null), 4000);
    }
  };

  const handleCancel = () => {
    if (
      isAnyStoreModified &&
      window.confirm("변경 사항을 취소하시겠습니까?")
    ) {
      setEditableStores(stores);
      setUpdateStatus("변경 사항이 취소되었습니다.");
      setTimeout(() => setUpdateStatus(null), 3000);
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="w-full h-full flex flex-col px-6 py-4 bg-gray-100">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-5 ml-1">
        <h3 className="text-xl font-bold">매장 관리 목록</h3>
        <div className="space-x-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            취소
          </button>
          <button
            onClick={handleSaveAll}
            disabled={!isAnyStoreModified}
            className={`px-4 py-2 rounded text-white ${
              isAnyStoreModified
                ? "bg-[#324153] hover:bg-[#4A607A]"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            저장
          </button>
        </div>
      </div>

      {/* 상태 메시지 */}
      {updateStatus && (
        <div className="fixed bottom-5 left-5 z-50">
          <p className="p-4 rounded-lg shadow-lg bg-blue-500 text-white">
            {updateStatus}
          </p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          매장 목록을 불러오는 중입니다...
        </div>
      ) : (
        <>
          {/* 모바일 카드 UI */}
          <div className="block sm:hidden space-y-3">
            {editableStores.map((store) => {
              const modified = isStoreModified(store);

              return (
                <div
                  key={store.storeId}
                  className={`rounded-xl bg-white p-4 shadow border ${
                    modified ? "border-green-400" : "border-gray-200"
                  }`}
                >
                  <div className="font-bold text-gray-800 text-base truncate">
                    {store.shopName}
                    <span className="ml-1 text-sm font-normal text-gray-500">
                      ({store.shopId})
                    </span>
                  </div>

                  <div className="mt-3">
                    <select
                      value={store.industryId ?? 0}
                      onChange={(e) =>
                        handleFieldChange(
                          store.storeId,
                          "industryId",
                          Number(e.target.value)
                        )
                      }
                      className={`w-full rounded-md border px-3 py-2 text-sm ${
                        modified
                          ? "border-red-500 ring-2 ring-red-200"
                          : ""
                      }`}
                    >
                      <option value={0}>-- 업종 선택 --</option>
                      {industries.map((ind) => (
                        <option
                          key={ind.industryId}
                          value={ind.industryId}
                        >
                          {ind.industryName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 데스크탑 테이블 */}
          <div className="hidden sm:block bg-white rounded-xl shadow max-h-[calc(100vh-220px)] overflow-y-auto">
            <table className="w-full text-center table-fixed">
              <thead className="sticky top-0 bg-slate-500">
                <tr className="text-gray-100">
                  <th className="w-[40%] py-2">매장명</th>
                  <th className="w-[20%] py-2">Shop ID</th>
                  <th className="w-[40%] py-2">업종</th>
                </tr>
              </thead>
              <tbody>
                {editableStores.map((store) => {
                  const modified = isStoreModified(store);

                  return (
                    <tr
                      key={store.storeId}
                      className={`border-b ${
                        modified ? "bg-green-50" : "hover:bg-blue-50"
                      }`}
                    >
                      <td className="py-2 font-semibold">
                        {store.shopName}
                      </td>
                      <td className="py-2">{store.shopId}</td>
                      <td className="py-2">
                        <select
                          value={store.industryId ?? 0}
                          onChange={(e) =>
                            handleFieldChange(
                              store.storeId,
                              "industryId",
                              Number(e.target.value)
                            )
                          }
                          className="border rounded-md px-2 py-1 w-60 text-center"
                        >
                          <option value={0}>-- 미지정 --</option>
                          {industries.map((ind) => (
                            <option
                              key={ind.industryId}
                              value={ind.industryId}
                            >
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

          {totalPages > 1 && (
            <div className="mt-5 flex justify-center">
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onPageChange={fetchStoresPage}
                maxButtons={5}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
