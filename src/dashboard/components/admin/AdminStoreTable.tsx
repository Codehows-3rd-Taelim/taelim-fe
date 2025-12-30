import type { StoreSummary } from "../../../type";

export default function AdminStoreTable({
  stores,
}: {
  stores: StoreSummary[];
}) {
  return (
    <div className="grid grid-cols-1  gap-6">
      <div className="overflow-x-auto">
        <table className="min-w-full border ">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">매장명</th>
              <th className="border p-2">로봇 수</th>
              <th className="border p-2">가동 중</th>
              <th className="border p-2">총 청소 시간(h)</th>
              <th className="border p-2">총 청소 면적(m²)</th>
            </tr>
          </thead>

          <tbody>
            {stores.map((s) => (
              <tr key={s.storeId}>
                <td className="border p-2">{s.shopName}</td>
                <td className="border p-2 text-center">{s.robotCount}</td>
                <td className="border p-2 text-center">{s.workingRobots}</td>
                <td className="border p-2 text-center">
                  {(s.cleanTimeTotal / 3600).toFixed(1)}
                </td>
                <td className="border p-2 text-center">
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
