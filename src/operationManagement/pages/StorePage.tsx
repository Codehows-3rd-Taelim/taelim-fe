import { useEffect, useState, useCallback } from "react";
import { getStores, getIndustry, updateStore } from "../api/StoreApi";
import type { Store, Industry } from "../../type";

type ApiStore = Omit<Store, "industryId"> & {
  industry?: {
    industryId: number;
    industryName: string;
  };
};

type NormalizedStore = Store & { industryId: number };

export default function StorePage() {
  const [stores, setStores] = useState<NormalizedStore[]>([]);
  const [editableStores, setEditableStores] = useState<NormalizedStore[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
      const msg = `매장 '${store.shopName}' 정보가 성공적으로 업데이트되었습니다.`;
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

  return (
    <div>
      <h3 className="text-lg font-bold mb-5">매장 관리</h3>

      {error && (
        <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</p>
      )}

      {updateStatus && (
        <p
          className={`p-3 rounded-lg mb-4 font-medium ${
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
        <table className="w-full text-center border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-gray-50 h-11">
              <th className="px-2">매장명</th>
              <th className="px-2">Shop ID</th>
              <th className="px-2">업종</th>
              <th className="px-2"></th>
            </tr>
          </thead>
          <tbody>
            {editableStores.map((store) => {
              const modified = isStoreModified(store);
              return (
                <tr key={store.storeId} className="h-11 border-b border-gray-200">
                  <td className="px-2">
                    <input
                      type="text"
                      value={store.shopName}
                      onChange={(e) =>
                        handleFieldChange(store.storeId, "shopName", e.target.value)
                      }
                      className="rounded-md p-1 w-full text-center"
                    />
                  </td>
                  <td className="px-2">
                    <input
                      type="number"
                      value={store.shopId}
                      onChange={(e) =>
                        handleFieldChange(
                          store.storeId,
                          "shopId",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="rounded-md p-1 w-full text-center"
                    />
                  </td>
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
                      className="border rounded-md p-1 w-60 text-center"
                    >
                      <option value={0}>-- 미지정 --</option>
                      {industries.map((ind) => (
                        <option key={ind.industryId} value={ind.industryId}>
                          {ind.industryName}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2">
                    <button
                      onClick={() => handleUpdate(store)}
                      disabled={!modified}
                      className={`px-3 py-1.5 rounded 
                        ${modified 
                            ? "bg-orange-500 cursor-pointer" 
                            : "bg-gray-300 cursor-not-allowed opacity-60"
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
      )}
    </div>
  );
}