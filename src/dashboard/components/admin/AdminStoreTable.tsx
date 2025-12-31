import type { StoreSummary } from "../../../type";

export default function AdminStoreTable({
  stores,
}: {
  stores: StoreSummary[];
}) {
  const filteredStores = stores.filter((s) => s.robotCount > 0);
  return (
    <div className="grid grid-cols-1  gap-6">
      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-gray-600">
              <th className="px-4 py-3 text-left font-semibold">매장명</th>
              <th className="px-4 py-3 text-center font-semibold">로봇 수</th>
              <th className="px-4 py-3 text-center font-semibold">가동 중</th>
              <th className="px-4 py-3 text-center font-semibold">
                청소 시간(h)
              </th>
              <th className="px-4 py-3 text-center font-semibold">
                청소 면적(m²)
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filteredStores.map((s) => (
              <tr key={s.storeId} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3">{s.shopName}</td>
                <td className="px-4 py-3 text-center">{s.robotCount}</td>
                <td className="px-4 py-3 text-center">{s.workingRobots}</td>
                <td className="px-4 py-3 text-center">
                  {(s.cleanTimeTotal / 3600).toFixed(1)}
                </td>
                <td className="px-4 py-3 text-center">
                  {s.areaCleanedTotal.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
