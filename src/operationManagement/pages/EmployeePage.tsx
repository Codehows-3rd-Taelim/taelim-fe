import React, { useState } from "react";
import type { User, Store } from "../../type";
import { deleteEmployee, updateEmployee } from "../api/EmployeeApi";

interface EmployeePageProps {
  list: User[];
  setList: React.Dispatch<React.SetStateAction<User[]>>;
  allStores: Store[];
  roleLevel: number;
  getStoreName: (storeId: number) => string;
}

const itemsPerPage = 20;

export default function EmployeePage({ list, setList, allStores, roleLevel, getStoreName }: EmployeePageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableList, setEditableList] = useState<User[]>([]);

  // list가 변경될 때 editableList도 업데이트 (불필요한 경우 제거 가능, 현재 로직에서는 불필요함)
  // useEffect(() => {
  //   if (!isEditMode) {
  //     setEditableList([...list]);
  //   }
  // }, [list, isEditMode]);

  const handleDelete = async (index: number) => {
    if (roleLevel === 1 || deletingUserId !== null) return;

    const userToDelete = list[index];
    if (!userToDelete || !userToDelete.userId) return;

    const isConfirmed = window.confirm(`[${userToDelete.name}] 직원을 정말로 삭제하시겠습니까?`);
    
    if (isConfirmed) {
      setDeletingUserId(userToDelete.userId);
      try {
        await deleteEmployee(userToDelete.userId);
        alert(`직원 [${userToDelete.name}]이(가) 성공적으로 삭제되었습니다.`);
        setList(list.filter((item) => item.userId !== userToDelete.userId));
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
    setEditableList([...list]); // 원본 복사
  };

  /**
   * 수정된 항목이 있는지 확인하는 헬퍼 함수
   * @param originalList 원본 직원 목록
   * @param editedList 수정 중인 직원 목록
   * @returns 변경된 항목의 배열
   */
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
        // ID 변경 감지 (수정 모드에서 id가 편집 가능하도록 추가되었기 때문에 확인)
        original.id !== editUser.id || 
        // 비밀번호는 변경 시에만 전송되므로 비교에서 제외하거나, 
        // 실제 변경이 이루어졌는지 여부를 판단하는 데 사용하지 않는 것이 좋습니다.
        // 여기서는 명시적으로 변경된 필드만 확인합니다.
        // original.pw !== editUser.pw // 비밀번호는 보통 변경 시에만 입력하므로 목록 비교에서는 제외
        false
      );
    });
  };

  const handleCancel = () => {
    if (isEditMode) {
      const changedUsers = getChangedUsers(list, editableList);

      if (changedUsers.length > 0) {
        // 변경사항이 있을 경우 사용자에게 확인 요청
        const isConfirmed = window.confirm(
          "저장하지 않은 변경 사항이 있습니다. 정말로 취소하시겠습니까? 변경 사항은 모두 사라집니다."
        );
        if (!isConfirmed) {
          return; // 사용자가 취소를 원하지 않음
        }
      }
    }

    // 변경사항이 없거나, 사용자가 취소를 확인한 경우
    setIsEditMode(false);
    setEditableList([]);
  };

  const handleConfirm = async () => {
    try {
      const changedUsers = getChangedUsers(list, editableList);

      if (changedUsers.length === 0) {
        alert("변경된 내용이 없습니다.");
        setIsEditMode(false);
        return;
      }

      // 변경된 항목 중 비밀번호가 변경된 경우도 포함하여 전송합니다.
      const usersToUpdate = editableList.filter(editUser => {
        const original = list.find(u => u.userId === editUser.userId);
        if (!original) return false;
        
        // 필드 변경 확인
        const isFieldChanged = original.name !== editUser.name ||
          original.phone !== editUser.phone ||
          original.email !== editUser.email ||
          original.storeId !== editUser.storeId ||
          original.role !== editUser.role ||
          original.id !== editUser.id;

        // 비밀번호가 입력되었는지 확인 (새 비밀번호로 간주)
        const isPwChanged = editUser.pw !== undefined && editUser.pw !== null && editUser.pw.length > 0;
        
        return isFieldChanged || isPwChanged;
      });

      // 모든 변경사항 저장
      await Promise.all(
        usersToUpdate.map((user) =>
          updateEmployee(user.userId, {
            id: user.id, // 아이디 추가
            name: user.name,
            phone: user.phone,
            email: user.email,
            storeId: user.storeId,
            role: user.role,
            ...(user.pw && user.pw.length > 0 && { pw: user.pw }), // 비밀번호 입력된 경우만 전송
          })
        )
      );

      alert("직원 정보가 성공적으로 수정되었습니다.");
      // 변경된 목록에서 비밀번호 필드는 제거하고 setList에 적용 (보안상)
      const updatedList = editableList.map(user => {
        const { pw, ...rest } = user;
        return rest as User;
      });
      setList(updatedList); // 변경사항 적용
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
  const displayList = isEditMode ? editableList : list;
  const displayedList = displayList.slice(startIdx, startIdx + itemsPerPage);
  const totalPages = Math.ceil(list.length / itemsPerPage);

  // 수정 권한: 매장담당자(2) 또는 관리자(3)
  const canEdit = roleLevel >= 2;

  // 비밀번호 필드가 `<input type="password">`에 바인딩되기 위해 `User` 타입에 `pw`를 추가했다고 가정하고 진행합니다.

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold">직원 목록</h3>
        
        {canEdit && !isEditMode && (
          <button
            onClick={handleEditMode}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            수정
          </button>
        )}

        {canEdit && isEditMode && (
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              확인
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              취소
            </button>
          </div>
        )}
      </div>

      {list.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          조회된 직원 목록이 없습니다.
        </div>
      ) : (
        <>
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="bg-gray-50 h-11 text-center">
                {isEditMode && <th>아이디</th>}
                <th>이름</th>
                {!isEditMode && <th>아이디</th>}
                {isEditMode && <th>비밀번호</th>}
                <th>전화번호</th>
                <th>이메일</th>
                <th>매장명</th>
                <th>권한</th>
                {!isEditMode && <th></th>}
              </tr>
            </thead>

            <tbody>
              {displayedList.map((item, index) => (
                <tr key={item.userId} className="border-b border-gray-200 h-11">
                  {/* 아이디 (수정 모드일 때 맨 앞) */}
                  {isEditMode && (
                    <td className="text-center px-2">
                      <input
                        type="text"
                        value={item.id}
                        onChange={(e) => handleFieldChange(item.userId, "id", e.target.value)}
                        className="border rounded-md p-1 w-full text-center"
                      />
                    </td>
                  )}

                  {/* 이름 */}
                  <td className="text-center px-2">
                    {isEditMode ? (
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleFieldChange(item.userId, "name", e.target.value)}
                        className="border rounded-md p-1 w-full text-center"
                      />
                    ) : (
                      item.name
                    )}
                  </td>

                  {/* 아이디 (일반 모드일 때) */}
                  {!isEditMode && (
                    <td className="text-center px-2">{item.id}</td>
                  )}

                  {/* 비밀번호 (수정 모드일 때만) */}
                  {isEditMode && (
                    <td className="text-center px-2">
                      <input
                        type="password"
                        // `pw` 필드가 `User` 타입에 없지만 편집 상태를 위해 추가되었다고 가정하고 string으로 처리합니다.
                        value={(item as User & { pw?: string }).pw || ""} 
                        onChange={(e) => handleFieldChange(item.userId, "pw" as keyof User, e.target.value)}
                        placeholder="변경 시 입력"
                        className="border rounded-md p-1 w-full text-center"
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
                        className="border rounded-md p-1 w-full text-center"
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
                        className="border rounded-md p-1 w-full text-center"
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
                        className="border rounded-md p-1 w-full text-center"
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
                        className="border rounded-md p-1 w-full text-center"
                      >
                        <option value="USER">직원</option>
                        <option value="MANAGER">매장 담당자</option>
                        {roleLevel === 3 && <option value="ADMIN">관리자</option>}
                      </select>
                    ) : (
                      item.role === "USER" ? "직원" : item.role === "MANAGER" ? "매장 담당자" : "관리자"
                    )}
                  </td>

                  {/* 삭제 버튼 (수정 모드가 아닐 때만) */}
                  {!isEditMode && (
                    <td className="text-center px-2">
                      <button
                        onClick={() => handleDelete(startIdx + index)}
                        disabled={roleLevel === 1 || deletingUserId === item.userId}
                        className={`
                          ${roleLevel === 1 ? 'bg-gray-400' : 'bg-red-500'} 
                          text-white 
                          border-0 
                          px-3.5 
                          py-1.5 
                          rounded 
                          ${roleLevel === 1 || deletingUserId === item.userId ? 'cursor-not-allowed' : 'hover:bg-red-600 cursor-pointer'}
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

          {/* 페이징 */}
          <div className="text-center pt-5">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`
                  mx-1 
                  px-3 
                  py-1.5 
                  ${currentPage === i + 1 ? 'bg-orange-500 text-white' : 'bg-gray-300 text-gray-800'} 
                  rounded 
                  border-0 
                  cursor-pointer
                `}
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