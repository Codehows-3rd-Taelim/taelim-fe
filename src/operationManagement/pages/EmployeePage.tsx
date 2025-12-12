import React, { useState, useEffect, useMemo } from "react";
import type { User, Store } from "../../type";
import { deleteEmployee, updateEmployee } from "../api/EmployeeApi";
import Pagination from "../../components/Pagination";

interface EmployeePageProps {
  list: User[];
  setList: React.Dispatch<React.SetStateAction<User[]>>;
  allStores: Store[];
  roleLevel: number;
  getStoreName: (storeId: number) => string;
}

const itemsPerPage = 20;

// role 문자열을 숫자 레벨로 변환하는 헬퍼 함수 (정렬에 사용)
const getRoleLevel = (role: string): number => {
  switch (role) {
    case "ADMIN":
      return 3;
    case "MANAGER":
    case "manager": // 혹시 모를 소문자 처리
      return 2;
    case "USER":
    case "user": // 혹시 모를 소문자 처리
      return 1;
    default:
      return 0;
  }
};

export default function EmployeePage({ list, setList, allStores, roleLevel, getStoreName }: EmployeePageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableList, setEditableList] = useState<User[]>([]);

  // 정렬 로직 적용
  const sortedList = useMemo(() => {
    // 원본 리스트를 복사하여 정렬
    const listCopy = [...list];

    listCopy.sort((a, b) => {
      // 1. 매장별 그룹핑 (storeId 오름차순)
      if (a.storeId !== b.storeId) {
        return a.storeId - b.storeId; // storeId 오름차순
      }

      // 2. 같은 매장에서는 권한별 내림차순 (ADMIN > MANAGER > USER)
      const aRoleLevel = getRoleLevel(a.role);
      const bRoleLevel = getRoleLevel(b.role);
      if (aRoleLevel !== bRoleLevel) {
        return bRoleLevel - aRoleLevel; // 권한 레벨 내림차순
      }

      // 3. 같은 권한끼리는 userId 오름차순
      return a.userId - b.userId; // userId 오름차순
    });

    return listCopy;
  }, [list]); // list가 변경될 때만 다시 계산

  // list 대신 sortedList를 사용하도록 업데이트
  useEffect(() => {
    if (!isEditMode) {
      // 편집 모드가 아닐 때만 sortedList를 기반으로 editableList 초기화
      // setEditableList([...sortedList]); // 이 로직은 handleEditMode에서만 처리하는 것을 권장합니다.
    }
  }, [isEditMode, sortedList]); // list 의존성 제거

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleDelete = async (index: number) => {
    // list 대신 sortedList에서 항목을 찾습니다.
    if (roleLevel === 1 || deletingUserId !== null) return;

    const userToDelete = sortedList[index]; // 정렬된 리스트에서 인덱스 사용
    if (!userToDelete || !userToDelete.userId) return;

    const isConfirmed = window.confirm(`[${userToDelete.name}] 직원을 정말로 삭제하시겠습니까?`);
    
    if (isConfirmed) {
      setDeletingUserId(userToDelete.userId);
      try {
        await deleteEmployee(userToDelete.userId);
        alert(`직원 [${userToDelete.name}]이(가) 성공적으로 삭제되었습니다.`);
        // 삭제 후에는 원본 list를 필터링하여 setList를 업데이트
        setList(prevList => prevList.filter((item) => item.userId !== userToDelete.userId));
      } catch (error) {
        console.error("직원 삭제 실패:", error);
        alert(error instanceof Error ? error.message : "직원 삭제 중 오류가 발생했습니다.");
      } finally {
        setDeletingUserId(null);
      }
    }
  };

  const handleEditMode = () => {
    setIsEditMode(true);
    // 수정 모드 진입 시, 정렬된 목록을 기반으로 editableList 초기화
    setEditableList([...sortedList]); 
  };

  /**
   * 수정된 항목이 있는지 확인하는 헬퍼 함수
   * @param originalList 원본 직원 목록
   * @param editedList 수정 중인 직원 목록
   * @returns 변경된 항목의 배열
   */
  // 이 함수는 원본 list(정렬되지 않은)와 editableList(정렬된 list의 복사본, 수정 중인 상태)를 비교해야 합니다.
  const getChangedUsers = (originalList: User[], editedList: User[]) => {
    return editedList.filter((editUser) => {
      const original = originalList.find((u) => u.userId === editUser.userId);
      if (!original) return false;
      return (
        original.name !== editUser.name ||
        original.phone !== editUser.phone ||
        original.email !== editUser.email ||
        original.storeId !== editUser.storeId ||
        original.role !== editUser.role ||
        original.id !== editUser.id
      );
    });
  };

  const handleCancel = () => {
    if (isEditMode) {
      // 변경 여부는 원본 props list와 editableList를 비교하여 확인
      const changedUsers = getChangedUsers(list, editableList); // 💡 props list 사용

      if (changedUsers.length > 0) {
        const isConfirmed = window.confirm(
          "저장하지 않은 변경 사항이 있습니다. 정말로 취소하시겠습니까? 변경 사항은 모두 사라집니다."
        );
        if (!isConfirmed) {
          return;
        }
      }
    }

    setIsEditMode(false);
    setEditableList([]);
  };

  const handleConfirm = async () => {
    try {
      // 변경된 항목을 list (props, 원본 데이터)와 editableList를 비교하여 확인
      const changedUsers = getChangedUsers(list, editableList); // 💡 props list 사용

      if (changedUsers.length === 0 && !editableList.some(user => user.pw && user.pw.length > 0)) {
        alert("변경된 내용이 없습니다.");
        setIsEditMode(false);
        return;
      }

      const usersToUpdate = editableList.filter(editUser => {
        const original = list.find(u => u.userId === editUser.userId); // props list 사용
        if (!original) return false;
        
        const isFieldChanged = original.name !== editUser.name ||
          original.phone !== editUser.phone ||
          original.email !== editUser.email ||
          original.storeId !== editUser.storeId ||
          original.role !== editUser.role ||
          original.id !== editUser.id;

        const isPwChanged = editUser.pw !== undefined && editUser.pw !== null && editUser.pw.length > 0;
        
        return isFieldChanged || isPwChanged;
      });

      await Promise.all(
        usersToUpdate.map((user) =>
          updateEmployee(user.userId, {
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            storeId: user.storeId,
            role: user.role,
            ...(user.pw && user.pw.length > 0 && { pw: user.pw }),
          })
        )
      );

      alert("직원 정보가 성공적으로 수정되었습니다.");
      
      const updatedList = editableList.map(user => {
        // 수정 완료 후 비밀번호 필드 제거 및 User 타입으로 캐스팅
        const { _pw, ...rest } = user as User & { pw?: string }; 
        return rest as User;
      });

      setList(updatedList); // 변경사항 적용 (정렬된 상태로 setList 업데이트)
      setIsEditMode(false);
    } catch (error) {
      console.error("직원 수정 실패:", error);
      alert(error instanceof Error ? error.message : "직원 수정 중 오류가 발생했습니다.");
    }
  };

  const handleFieldChange = (userId: number, field: keyof User, value: string | number) => {
    setEditableList((prev) =>
      prev.map((user) => (user.userId === userId ? { ...user, [field]: value } : user))
    );
  };

  const startIdx = (currentPage - 1) * itemsPerPage;
  // 정렬된 리스트를 기본값으로 사용
  const displayList = isEditMode ? editableList : sortedList; 
  const displayedList = displayList.slice(startIdx, startIdx + itemsPerPage);
  const totalPages = Math.ceil(sortedList.length / itemsPerPage); // 정렬된 리스트의 길이로 페이징 계산

  // 수정 권한: 매장담당자(2) 또는 관리자(3)
  const canEdit = roleLevel >= 2;

  // roleLevel에 따른 권한명 변환
  const getRoleName = (role: string) => {
    switch (role) {
      case "ADMIN": return "관리자";
      case "MANAGER": return "매장 담당자";
      case "USER": return "직원";
      default: return role;
    }
  }

  return (
    <div className="w-full min-h-screen px-6 py-4 bg-gray-100">
      {/* 제목 및 버튼 영역 */}
      <div className="flex justify-between items-center mb-5 ml-4">
        <h3 className="text-xl font-bold">직원 목록</h3>
        
        {canEdit && !isEditMode && (
          <button
            onClick={handleEditMode}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 font-medium"
          >
            수정
          </button>
        )}

        {canEdit && isEditMode && (
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 font-medium"
            >
              확인
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 font-medium"
            >
              취소
            </button>
          </div>
        )}
      </div>

      {/* 목록 테이블 */}
      {sortedList.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          조회된 직원 목록이 없습니다.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full border-separate border-spacing-y-2">
              <thead className="sticky top-0 bg-gray-100 shadow-sm z-10">
                <tr className="h-11 text-center text-gray-600 font-medium">
                  <th className="py-2">이름</th>
                  <th className="py-2">아이디</th>
                  {isEditMode && <th className="py-2">비밀번호</th>}
                  <th className="py-2">전화번호</th>
                  <th className="py-2">이메일</th>
                  <th className="py-2">매장명</th>
                  <th className="py-2">권한</th>
                  {!isEditMode && <th className="py-2"></th>}
                </tr>
              </thead>

              <tbody>
                {displayedList.map((item, index) => (
                  <tr key={item.userId} className="border-b border-gray-200 h-11 hover:bg-blue-50/50 transition-colors">
                    
                    {/* 이름 */}
                    <td className="text-center px-2">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleFieldChange(item.userId, "name", e.target.value)}
                          className="border rounded-md p-1 w-full text-center focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        item.name
                      )}
                    </td>

                    {/* 아이디 */}
                    <td className="text-center px-2">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={item.id}
                          onChange={(e) => handleFieldChange(item.userId, "id", e.target.value)}
                          className="border rounded-md p-1 w-full text-center focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        item.id
                      )}
                    </td>

                    {/* 비밀번호 (수정 모드일 때만) */}
                    {isEditMode && (
                      <td className="text-center px-2">
                        <input
                          type="password"
                          value={item.pw || ""} 
                          onChange={(e) => handleFieldChange(item.userId, "pw", e.target.value)}
                          placeholder="변경 시 입력"
                          className="border rounded-md p-1 w-full text-center placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                          autoComplete="new-password"
                        />
                      </td>
                    )}

                    {/* 전화번호 */}
                    <td className="text-center px-2">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={item.phone}
                          onChange={(e) => handleFieldChange(item.userId, "phone", e.target.value)}
                          className="border rounded-md p-1 w-full text-center focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        item.phone
                      )}
                    </td>

                    {/* 이메일 */}
                    <td className="text-center px-2">
                      {isEditMode ? (
                        <input
                          type="email"
                          value={item.email}
                          onChange={(e) => handleFieldChange(item.userId, "email", e.target.value)}
                          className="border rounded-md p-1 w-full text-center focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        item.email
                      )}
                    </td>

                    {/* 매장명 */}
                    <td className="text-center px-2">
                      {isEditMode ? (
                        <select
                          value={item.storeId}
                          onChange={(e) => handleFieldChange(item.userId, "storeId", Number(e.target.value))}
                          className="border rounded-md p-1 w-full text-center focus:ring-blue-500 focus:border-blue-500"
                        >
                          {allStores.map((store) => (
                            <option key={store.storeId} value={store.storeId}>
                              {store.shopName}
                            </option>
                          ))}
                        </select>
                      ) : (
                        getStoreName(item.storeId)
                      )}
                    </td>

                    {/* 권한 */}
                    <td className="text-center px-2">
                      {isEditMode ? (
                        <select
                          value={item.role}
                          onChange={(e) => handleFieldChange(item.userId, "role", e.target.value)}
                          className="border rounded-md p-1 w-full text-center focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="USER">직원</option>
                          <option value="MANAGER">매장 담당자</option>
                          {roleLevel === 3 && <option value="ADMIN">관리자</option>}
                        </select>
                      ) : (
                        getRoleName(item.role)
                      )}
                    </td>

                    {/* 삭제 버튼 (수정 모드가 아닐 때만) */}
                    {!isEditMode && roleLevel !== 1 && (
                      <td className="text-center px-2">
                        <button
                          onClick={() => handleDelete(startIdx + index)} 
                          disabled={deletingUserId === item.userId}
                          className={`
                            bg-red-500
                            text-white 
                            border-0 
                            px-3.5 
                            py-1.5 
                            rounded 
                            font-medium 
                            text-sm
                            ${deletingUserId === item.userId ? 'cursor-not-allowed bg-red-400' : 'hover:bg-red-600 cursor-pointer'}
                          `}
                        >
                          {deletingUserId === item.userId ? "삭제 중..." : "삭제"}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이징 */}
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