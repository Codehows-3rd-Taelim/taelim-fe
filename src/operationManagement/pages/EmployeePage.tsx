import React, { useState, useMemo, useEffect } from "react";
import type { User, Store } from "../../type";
import { deleteEmployee, getUsers, updateEmployee } from "../api/EmployeeApi";
import Pagination from "../../components/Pagination";
import EmployeeRegistrationModal from "./EmployeeRegistrationModal";

/* =====================
   타입 정의
===================== */
interface RegistrationForm {
  id: string;
  pw: string;
  pwCheck: string;
  name: string;
  phone: string;
  email: string;
  storeId: number;
  role: string;
}

interface RegistrationProps {
  form: RegistrationForm;
  setFormValue: (key: keyof RegistrationForm, value: string | number) => void;
  isIdChecked: boolean;
  setIsIdChecked: (v: boolean) => void;
  handleIdCheck: () => void;
  isPasswordMismatched: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showPasswordCheck: boolean;
  setShowPasswordCheck: (show: boolean) => void;
  isRegisterButtonEnabled: boolean;
  handleRegister: () => void;
  handlePasswordKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isMobileLayout: boolean;
}

interface EmployeePageProps extends RegistrationProps {
  list: User[];
  setList: React.Dispatch<React.SetStateAction<User[]>>;
  allStores: Store[];
  roleLevel: number;
  getStoreName: (storeId: number) => string;
  storeId?: number;
}

const ITEMS_PER_PAGE = 15;

/* =====================
   유틸
===================== */
const getRoleLevel = (role: string): number => {
  switch (role) {
    case "ADMIN":
      return 3;
    case "MANAGER":
    case "manager":
      return 2;
    case "USER":
    case "user":
      return 1;
    default:
      return 0;
  }
};

const getRoleName = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "관리자";
    case "MANAGER":
      return "매장 담당자";
    case "USER":
      return "직원";
    default:
      return role;
  }
};

/* =====================
   컴포넌트
===================== */
export default function EmployeePage(props: EmployeePageProps) {
  const {
    list,
    setList,
    allStores,
    roleLevel,
    getStoreName,
    storeId,
    form,
    setFormValue,
    isIdChecked,
    setIsIdChecked,
    handleIdCheck,
    isPasswordMismatched,
    showPassword,
    setShowPassword,
    showPasswordCheck,
    setShowPasswordCheck,
    isRegisterButtonEnabled,
    handleRegister,
    handlePasswordKeyPress,
    isMobileLayout,
  } = props;

  /* =====================
     상태
  ===================== */
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableList, setEditableList] = useState<User[]>([]);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  /* =====================
     정렬된 리스트
  ===================== */
  const baseList = useMemo(() => {
    const copy = [...list];
    copy.sort((a, b) => {
      if (a.storeId !== b.storeId) return a.storeId - b.storeId;
      const ra = getRoleLevel(a.role);
      const rb = getRoleLevel(b.role);
      if (ra !== rb) return rb - ra;
      return a.userId - b.userId;
    });
    return copy;
  }, [list]);

  const displayList = isEditMode ? editableList : baseList;

  const canEdit = roleLevel >= 2;

  const initialForm: RegistrationForm = {
    id: "",
    pw: "",
    pwCheck: "",
    name: "",
    phone: "",
    email: "",
    storeId: 0,
    role: "USER",
  };

  const fetchEmployeesPage = async (page: number) => {
    if (isEditMode) {
      alert("수정 중에는 페이지를 이동할 수 없습니다.");
      return;
    }

    try {
      const res = await getUsers({
        page,
        size: ITEMS_PER_PAGE,
        storeId,
      });
      setList(res.content);
      setTotalItems(res.totalElements);
      setCurrentPage(page);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEmployeesPage(1);
  }, []);

  const resetRegisterForm = () => {
    (Object.keys(initialForm) as (keyof RegistrationForm)[]).forEach((key) => {
      setFormValue(key, initialForm[key]);
    });

    setIsIdChecked(false);
    setShowPassword(false);
    setShowPasswordCheck(false);
  };

  /* =====================
     핸들러
  ===================== */
  const handleEditMode = () => {
    setIsEditMode(true);
    setEditableList([...baseList]);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setEditableList([]);
  };

  const handleRegisterWithClose = async () => {
    try {
      await handleRegister();
      resetRegisterForm();
      setIsRegisterOpen(false);
    } catch {
      // 실패 시 유지
    }
  };
  const handleFieldChange = (
    userId: number,
    field: keyof User | "pw",
    value: string | number
  ) => {
    setEditableList((prev) =>
      prev.map((u) => (u.userId === userId ? { ...u, [field]: value } : u))
    );
  };

  const handleConfirm = async () => {
    try {
      type EditableUser = User & { pw?: string };

      const changed = (editableList as EditableUser[]).filter((u) => {
        const o = list.find((x) => x.userId === u.userId);
        if (!o) return false;
        return (
          o.name !== u.name ||
          o.phone !== u.phone ||
          o.email !== u.email ||
          o.storeId !== u.storeId ||
          o.role !== u.role ||
          o.id !== u.id ||
          u.pw
        );
      });

      if (changed.length === 0) {
        alert("변경된 내용이 없습니다.");
        setIsEditMode(false);
        return;
      }

      await Promise.all(
        changed.map((u) => {
          return updateEmployee(u.userId, {
            id: u.id,
            name: u.name,
            phone: u.phone,
            email: u.email,
            storeId: u.storeId,
            role: u.role,
            ...(u.pw && { pw: u.pw }),
          });
        })
      );

      setList((prev) =>
        prev.map((o) => changed.find((c) => c.userId === o.userId) || o)
      );

      alert("직원 정보가 수정되었습니다.");
      setIsEditMode(false);
    } catch {
      alert("직원 수정 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async (userId: number) => {
    if (roleLevel === 1) return;

    const target = list.find((u) => u.userId === userId);
    if (!target) return;

    if (!window.confirm(`[${target.name}] 직원을 삭제하시겠습니까?`)) return;

    setDeletingUserId(target.userId);
    try {
      await deleteEmployee(target.userId);

      const remaining = totalItems - 1;
      const lastPage = Math.max(1, Math.ceil(remaining / ITEMS_PER_PAGE));

      fetchEmployeesPage(currentPage > lastPage ? lastPage : currentPage);
    } catch (e) {
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeletingUserId(null);
    }
  };

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const formatPhoneNumber = (value: string) => {
    const numbersOnly = value.replace(/\D/g, "");
    let phone = numbersOnly.startsWith("010")
      ? numbersOnly
      : "010" + numbersOnly;
    phone = phone.slice(0, 11);
    return phone.length === 11
      ? phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3")
      : phone;
  };

  const isValidPhone = (phone: string) =>
    phone.replace(/\D/g, "").length === 11;

  const isSaveButtonEnabled = editableList.every(
    (u) =>
      u.name &&
      u.id &&
      validateEmail(u.email) &&
      isValidPhone(u.phone) &&
      (!u.pw || u.pw.length >= 8)
  );
  /* =====================
     렌더
  ===================== */
  return (
    <div className="w-full h-full flex flex-col px-6 py-4 bg-gray-100 overflow-y-auto">
      {/* 등록 모달 */}
      {isRegisterOpen && (
        <EmployeeRegistrationModal
          form={form}
          setFormValue={setFormValue}
          isIdChecked={isIdChecked}
          handleIdCheck={handleIdCheck}
          isPasswordMismatched={isPasswordMismatched}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          showPasswordCheck={showPasswordCheck}
          setShowPasswordCheck={setShowPasswordCheck}
          isRegisterButtonEnabled={isRegisterButtonEnabled}
          handleRegister={handleRegisterWithClose}
          allStores={allStores}
          roleLevel={roleLevel}
          handlePasswordKeyPress={handlePasswordKeyPress}
          isMobileLayout={isMobileLayout}
          onClose={() => {
            setIsRegisterOpen(false);
          }}
          onCancelConfirm={() => {
            resetRegisterForm(); // 👈 입력 초기화
            setIsRegisterOpen(false);
          }}
        />
      )}

      {/* 헤더 */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">직원 목록</h3>
        {canEdit && !isEditMode && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="bg-[#324153] hover:bg-[#4A607A] text-white px-4 py-2 rounded"
            >
              + 직원 등록
            </button>
            <button
              onClick={handleEditMode}
              className="bg-[#4A607A] hover:bg-[#324153]  text-white px-4 py-2 rounded"
            >
              수정
            </button>
          </div>
        )}
        {canEdit && isEditMode && (
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              className="bg-[#324153] hover:bg-[#4A607A] text-white px-4 py-2 rounded disabled:bg-gray-400"
              disabled={!isSaveButtonEnabled}
            >
              확인
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              취소
            </button>
          </div>
        )}
      </div>

      {/* 테이블 */}
      {displayList.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          조회된 직원이 없습니다.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full ">
              <thead className="bg-gray-100">
                <tr className="h-12 text-center">
                  <th className="px-4 py-3">이름</th>
                  <th className="px-4 py-3">ID</th>
                  {isEditMode && <th className="px-4 py-3">비밀번호</th>}
                  <th className="px-4 py-3">전화</th>
                  <th className="px-4 py-3">이메일</th>
                  <th className="px-4 py-3">매장</th>
                  <th className="px-4 py-3">권한</th>
                  {!isEditMode && <th className="px-4 py-3" />}
                </tr>
              </thead>
              <tbody>
                {displayList.map((u, i) => (
                  <tr
                    key={u.userId}
                    className="text-center border-t hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      {isEditMode ? (
                        <input
                          value={u.name}
                          onChange={(e) =>
                            handleFieldChange(u.userId, "name", e.target.value)
                          }
                          className="w-full border rounded px-2 py-1"
                        />
                      ) : (
                        u.name
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditMode ? (
                        <input
                          value={u.id}
                          onChange={(e) =>
                            handleFieldChange(u.userId, "id", e.target.value)
                          }
                          className="w-full border rounded px-2 py-1"
                        />
                      ) : (
                        u.id
                      )}
                    </td>
                    {isEditMode && (
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <input
                            type="password"
                            value={u.pw || ""}
                            onChange={(e) =>
                              handleFieldChange(u.userId, "pw", e.target.value)
                            }
                            className={`w-full border rounded px-2 py-1 ${
                              u.pw && u.pw.length < 8 ? "border-red-500" : ""
                            }`}
                            placeholder="변경 시만 입력"
                          />
                          {u.pw && u.pw.length < 8 && (
                            <span className="text-red-500 text-xs mt-1">
                              비밀번호는 최소 8자리 이상이어야 합니다.
                            </span>
                          )}
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      {isEditMode ? (
                        <div className="flex flex-col">
                          <input
                            value={u.phone}
                            onChange={(e) =>
                              handleFieldChange(
                                u.userId,
                                "phone",
                                formatPhoneNumber(e.target.value)
                              )
                            }
                            className={`w-full border rounded px-2 py-1 ${
                              !isValidPhone(u.phone) ? "border-red-500" : ""
                            }`}
                            placeholder="010-1234-5678"
                          />
                          {!isValidPhone(u.phone) && (
                            <span className="text-red-500 text-xs mt-1">
                              11자리 전화번호를 입력해주세요.
                            </span>
                          )}
                        </div>
                      ) : (
                        u.phone
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditMode ? (
                        <div className="flex flex-col">
                          <input
                            value={u.email}
                            onChange={(e) =>
                              handleFieldChange(
                                u.userId,
                                "email",
                                e.target.value
                              )
                            }
                            className={`w-full border rounded px-2 py-1 ${
                              !validateEmail(u.email) ? "border-red-500" : ""
                            }`}
                            placeholder="example@domain.com"
                          />
                          {!validateEmail(u.email) && (
                            <span className="text-red-500 text-xs mt-1">
                              유효한 이메일을 입력해주세요.
                            </span>
                          )}
                        </div>
                      ) : (
                        u.email
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditMode ? (
                        <select
                          value={u.storeId}
                          onChange={(e) =>
                            handleFieldChange(
                              u.userId,
                              "storeId",
                              Number(e.target.value)
                            )
                          }
                          className="w-full border rounded px-2 py-1"
                        >
                          {allStores.map((s) => (
                            <option key={s.storeId} value={s.storeId}>
                              {s.shopName}
                            </option>
                          ))}
                        </select>
                      ) : (
                        getStoreName(u.storeId)
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditMode ? (
                        <select
                          value={u.role}
                          onChange={(e) =>
                            handleFieldChange(u.userId, "role", e.target.value)
                          }
                          className="w-full border rounded px-2 py-1"
                        >
                          <option value="USER">직원</option>
                          <option value="MANAGER">매장 담당자</option>
                          {roleLevel === 3 && (
                            <option value="ADMIN">관리자</option>
                          )}
                        </select>
                      ) : (
                        getRoleName(u.role)
                      )}
                    </td>
                    {!isEditMode && roleLevel !== 1 && (
                      <td className="px-4 py-3">
                        {u.role !== "ADMIN" ? (
                          <button
                            onClick={() => handleDelete(u.userId)}
                            disabled={deletingUserId === u.userId}
                            className=" text-white px-4 py-1.5 rounded bg-[#d14e4e] hover:bg-[#d11a1a] disabled:bg-gray-400"
                          >
                            삭제
                          </button>
                        ) : (
                          <div className="h-[40px]" />
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex justify-center">
            <Pagination
              page={currentPage}
              totalPages={Math.ceil(totalItems / ITEMS_PER_PAGE)}
              onPageChange={fetchEmployeesPage}
              maxButtons={5}
            />
          </div>
        </>
      )}
    </div>
  );
}
