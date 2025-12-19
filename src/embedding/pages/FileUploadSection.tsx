export default function FileUploadPage() {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="font-bold text-lg mb-4">파일 업로드</h2>

      {/* 업로드 박스 */}
      <div className="bg-gray-100 rounded-xl p-6">
        <div className="bg-orange-400 rounded-xl h-40 flex items-center justify-center text-white text-4xl mb-4">
          +
        </div>
        <button className="w-full bg-orange-500 text-white py-2 rounded font-semibold">
          등록
        </button>
      </div>

      {/* 학습된 파일 */}
      <h3 className="font-bold mt-8 mb-3">학습된 파일</h3>
      <div className="bg-gray-100 rounded-xl p-4 space-y-3">
        {[
          "회사 배경 및 설명.png",
          "CC1 사용법 가이드.csv",
          "MT1 사용법 가이드.csv",
          "CC1 부품 교체 일자 및 설명.png",
        ].map((name) => (
          <div
            key={name}
            className="bg-white rounded-lg px-4 py-3 flex justify-between items-center"
          >
            <span>{name}</span>
            <button className="bg-red-500 text-white px-3 py-1 rounded text-sm">
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
