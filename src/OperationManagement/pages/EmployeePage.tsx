import React, { useState } from "react";
import type { User, Store } from "../../type";
import { deleteEmployee } from "../api/EmployeeApi";

// OperationManagement에서 전달받을 Props 타입 정의
interface EmployeePageProps {
  list: User[];
  setList: React.Dispatch<React.SetStateAction<User[]>>;
  allStores: Store[];
  roleLevel: number;
  getStoreName: (storeId: number) => string;
}

const itemsPerPage = 20;

export default function EmployeePage({ list, setList, roleLevel, getStoreName }: EmployeePageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (index: number) => {
    if (roleLevel === 1 || isDeleting) return; // 조회만 가능 또는 이미 삭제 중

    const userToDelete = list[index];
    if (!userToDelete || !userToDelete.userId) return;

    const isConfirmed = window.confirm(`[${userToDelete.name}] 직원을 정말로 삭제하시겠습니까?`);
    
    if (isConfirmed) {
      setIsDeleting(true);
      try {
        // 직원 삭제 API 호출
        await deleteEmployee(userToDelete.userId); // 가정한 API 함수
        alert(`직원 [${userToDelete.name}]이(가) 성공적으로 삭제되었습니다.`);

        // API 성공 후, 목록 상태 업데이트
        setList(list.filter((item) => item.userId !== userToDelete.userId));

      } catch (error) {
        console.error("직원 삭제 실패:", error);
        alert(error instanceof Error ? error.message : "직원 삭제 중 오류가 발생했습니다.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // 직원 목록 페이징 처리
  const startIdx = (currentPage - 1) * itemsPerPage;
  const displayedList = list.slice(startIdx, startIdx + itemsPerPage);
  const totalPages = Math.ceil(list.length / itemsPerPage);

  return (
    <div>
      <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "20px" }}>
        직원 목록
      </h3>

      {list.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px", color: "#888" }}>
          조회된 직원 목록이 없습니다.
        </div>
      ) : (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#fafafa", height: "45px", textAlign: "center" }}>
                <th>이름</th>
                <th>아이디</th>
                <th>전화번호</th>
                <th>이메일</th>
                <th>매장명</th>
                <th>권한</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {displayedList.map((item, index) => (
                <tr key={item.userId} style={{ borderBottom: "1px solid #eee", height: "45px" }}>
                    <td style={{ textAlign: "center" }}>{item.name}</td>
                    <td style={{ textAlign: "center" }}>{item.id}</td>
                    <td style={{ textAlign: "center" }}>{item.phone}</td>
                    <td style={{ textAlign: "center" }}>{item.email}</td>
                    <td style={{ textAlign: "center" }}>{getStoreName(item.storeId)}</td>
                    <td style={{ textAlign: "center" }}>{item.role === "USER" ? "직원" : item.role === "MANAGER" ? "매장 담당자" : "관리자"}</td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={() => handleDelete(startIdx + index)}
                        disabled={roleLevel === 1 || isDeleting}
                        style={{
                          backgroundColor: roleLevel === 1 ? "#ccc" : "#FF5B5B",
                          color: "#fff",
                          border: "none",
                          padding: "6px 14px",
                          borderRadius: "5px",
                          cursor: roleLevel === 1 || isDeleting ? "not-allowed" : "pointer",
                        }}
                      >
                        {isDeleting ? "삭제 중..." : "삭제"}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* 페이징 */}
          <div style={{ textAlign: "center", paddingTop: "20px" }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                style={{
                  margin: "0 4px",
                  padding: "6px 12px",
                  backgroundColor: currentPage === i + 1 ? "#FF8A00" : "#ddd",
                  color: currentPage === i + 1 ? "#fff" : "#333",
                  borderRadius: "4px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}