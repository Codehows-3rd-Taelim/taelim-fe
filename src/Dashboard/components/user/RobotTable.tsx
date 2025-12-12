import type { Robot } from "../../../type";

function getProductImage(code: string) {
  try {
    return new URL(`../../../assets/${code}.png`, import.meta.url).href;
  } catch {
    return "";
  }
}

// 상태별 색상 클래스
function getStatusStyle(robot: Robot) {
  if (!robot.online) return "text-gray-400"; // 오프라인

  if (robot.status === 1) return "text-blue-600 font-semibold"; // 작업중
  if (robot.status === 2) return "text-orange-500 font-semibold"; // 충전중

  return "text-green-600 font-semibold"; // 대기중
}

function getStatusLabel(robot: Robot) {
  if (!robot.online) return "오프라인";
  if (robot.status === 1) return "작업중";
  if (robot.status === 2) return "충전중";
  return "대기중";
}

export default function RobotTable({ robots }: { robots: Robot[] }) {
  return (
    <div className="min-w-[900px]">
      <table className="w-full text-ml">
        <thead className="text-gray-600">
          <tr>
            <th className="py-2 px-4 text-center">모델</th>
            <th className="px-4 text-center">SN</th>
            <th className="px-4 text-center">로봇별명</th>
            <th className="px-4 text-center">MAC</th>
            <th className="px-4 text-center">상태</th>
            <th className="px-4 text-center">배터리잔량</th>
            <th className="px-4 text-center">네트워크상태</th>
          </tr>
        </thead>

        <tbody>
          {robots.map((r) => (
            <tr key={r.robotId} className="border-t hover:bg-gray-50 text-center">
              
              {/* 모델 + 이미지 */}
              <td className="py-3 px-4">
                <div className="flex items-center justify-center gap-3">
                  <img
                    src={getProductImage(r.productCode)}
                    alt={r.productCode}
                    className="w-12 h-12 object-contain"
                  />
                  <span className="font-medium text-lg">{r.productCode}</span>
                </div>
              </td>

              <td className="text-base px-4">{r.sn}</td>
              <td className="text-base px-4">{r.nickname}</td>
              <td className="text-base px-4">{r.mac}</td>

              {/* 상태 */}
              <td className={`${getStatusStyle(r)} px-4`}>
                {getStatusLabel(r)}
              </td>

              <td className="text-base px-4">{r.battery}%</td>
              <td className={`${r.online ? "text-green-600 font-semibold" : "text-gray-400"} text-base px-4`}>
                {r.online ? "연결됨" : "오프라인"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}