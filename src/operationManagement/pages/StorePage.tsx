import { useEffect, useState, useCallback } from "react";
import { getStores, getIndustry, updateStore } from "../api/StoreApi";
import type { Store, Industry } from "../../type";
import Pagination from "../../components/Pagination";

type ApiStore = Omit<Store, "industryId"> & {
  industry?: { industryId: number; industryName: string };
};
type NormalizedStore = Store & { industryId: number };

const itemsPerPage = 15;

export default function StorePage() {
  const [stores, setStores] = useState<NormalizedStore[]>([]);
  const [editableStores, setEditableStores] = useState<NormalizedStore[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // const normalizeStores = (apiStores: ApiStore[]): NormalizedStore[] =>
  //   apiStores.map((store) => ({
  //     ...store,
  //     industryId: store.industry ?? 0,
  //   }));
  const normalizeStores = (apiStores: Store[]): NormalizedStore[] =>
    apiStores.map((store) => ({
      storeId: store.storeId,
      shopId: store.shopId,
      shopName: store.shopName,
      industryId: store.industryId ?? 0,
    }));

  const fetchStoresPage = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const size = itemsPerPage;
      const response = await getStores(page, size);

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
    field: keyof NormalizedStore,
    value: string | number
  ) => {
    setEditableStores((prev) =>
      prev.map((s) => (s.storeId === storeId ? { ...s, [field]: value } : s))
    );
    setUpdateStatus(null);
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
        `총 ${modifiedStores.length}개의 매장 정보가 성공적으로 업데이트되었습니다.`
      );
      setTimeout(() => setUpdateStatus(null), 3000);
    } catch (err) {
      setUpdateStatus(
        `❌ 업데이트 실패: ${
          err instanceof Error ? err.message : "알 수 없는 오류"
        }`
      );
      setTimeout(() => setUpdateStatus(null), 4000);
    }
  };

  const handleCancel = () => {
    if (
      isAnyStoreModified &&
      window.confirm(
        "변경 내용이 있습니다. 변경 사항을 취소하고 원래 상태로 되돌리겠습니까?"
      )
    ) {
      setEditableStores(stores);
      setUpdateStatus("ℹ️ 변경 사항이 취소되고 원본 상태로 복원되었습니다.");
      setTimeout(() => setUpdateStatus(null), 3000);
    } else if (!isAnyStoreModified) {
      setUpdateStatus("ℹ️ 변경 사항이 없습니다.");
      setTimeout(() => setUpdateStatus(null), 2000);
    }
  };

  return (
    <div className="w-full h-full flex flex-col px-6 py-4 bg-gray-100">
      {/* <div className="w-full min-h-screen px-6 py-4 bg-gray-100"> */}
      <div className="flex justify-between items-center mb-5 ml-4">
        <h3 className="text-xl font-bold">매장 관리 목록</h3>
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
                ? " bg-[#324153] hover:bg-[#4A607A] cursor-pointer"
                : "bg-gray-400 cursor-not-allowed opacity-80"
            }`}
          >
            저장
          </button>
        </div>
      </div>

      {updateStatus && (
        <div className="fixed bottom-5 left-5 z-50 transition-opacity duration-300">
          <p
            className={`p-4 rounded-lg shadow-lg font-medium text-white min-w-[250px] ${
              updateStatus.includes("✅")
                ? "bg-green-600"
                : updateStatus.includes("❌")
                ? "bg-red-600"
                : "bg-blue-500"
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
                </tr>
              </thead>
              <tbody>
                {editableStores.map((store) => {
                  const modified = isStoreModified(store);
                  return (
                    <tr
                      key={store.storeId}
                      className={`h-11 border-b border-gray-200 transition-colors ${
                        modified
                          ? "bg-red-50/70 hover:bg-red-100/70"
                          : "hover:bg-blue-50/50"
                      }`}
                    >
                      <td className="px-2 py-1 font-semibold text-gray-700">
                        {store.shopName}
                      </td>
                      <td className="px-2 py-1 text-gray-700">
                        {store.shopId}
                      </td>
                      <td className="px-2 py-1">
                        <select
                          value={store.industryId ?? 0}
                          onChange={(e) =>
                            handleFieldChange(
                              store.storeId,
                              "industryId",
                              parseInt(e.target.value)
                            )
                          }
                          className={`border rounded-md p-1 w-60 text-center focus:ring-blue-500 focus:border-blue-500 ${
                            modified ? "border-red-500 ring-2 ring-red-200" : ""
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

          <div className="mt-5 flex justify-center">
            <Pagination
              page={currentPage}
              totalPages={Math.ceil(totalItems / itemsPerPage)}
              onPageChange={fetchStoresPage}
              maxButtons={5}
            />
          </div>
        </>
      )}
    </div>
  );
}
