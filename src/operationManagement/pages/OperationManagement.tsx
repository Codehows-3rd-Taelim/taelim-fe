import useOperationManagement from "../hook/useOperationManagement";
import OperationDesktopLayout from "./OperationDesktopLayout";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OperationManagement() {
  const props = useOperationManagement();
  // 👈 loadingStores, loadingUsers를 다시 가져옵니다.
  const { user, loadingStores, loadingUsers } = props;
  const navigate = useNavigate();

  // 인증 확인 및 리디렉션 로직
  useEffect(() => {
    // 1. 로딩이 완료된 후에만 (토큰이 없어서 데이터 로딩이 스킵되었을 수도 있음)
    // 2. user 객체가 null인 경우 (즉, JWT 토큰이 없는 경우)
    // 로그인 화면으로 리디렉션합니다.
    if (!loadingStores && !loadingUsers && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate, loadingStores, loadingUsers]); // 로딩 상태를 의존성 배열에 추가합니다.

  // 로딩이 완료되었는데 user가 null인 경우 (useEffect에서 리디렉션 처리)
  if (!user) {
    // useEffect에서 리디렉션을 처리하므로, 여기서는 잠깐의 대기 메시지를 보여줍니다.
    // 또는 null을 반환하여 아무것도 렌더링하지 않아도 됩니다.
    return (
      <div className="p-3 text-center text-red-500">
        인증되지 않았습니다. 로그인 화면으로 이동합니다.
      </div>
    );
  }

  // 인증 완료 후 정상 렌더링
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <OperationDesktopLayout {...props} />
    </div>
  );
}
