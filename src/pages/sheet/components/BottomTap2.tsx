import useCakeSheetStore from "../../../stores/useSheet";

const BottomTap2 = () => {
  const { activeTab, setActiveTab } = useCakeSheetStore();

  return (
    <div className="flex flex-col h-[300px] bg-amber-50">
      <div className="p-4 border-t border-t-amber-200"></div>

      <div className="flex justify-between p-3 bg-amber-100 border-t border-amber-200 mt-auto">
        <div className="flex space-x-2">
          <button
            // onClick={handleCopyToClipboard}
            className="px-4 py-2 bg-amber-500 text-white rounded-full text-sm shadow-sm hover:bg-amber-600 transition-colors"
          >
            복사
          </button>
          <button
            // onClick={handleSaveAsImage}
            className="px-4 py-2 bg-amber-600 text-white rounded-full text-sm shadow-sm hover:bg-amber-700 transition-colors"
          >
            저장
          </button>
        </div>
        <div className="flex rounded-full overflow-hidden border border-amber-300">
          <button
            className={`px-4 py-1 text-sm ${
              activeTab === "preset"
                ? "bg-amber-400 text-white"
                : "bg-white text-amber-600"
            }`}
            onClick={() => setActiveTab("preset")}
          >
            이미지
          </button>
          <button
            className={`px-4 py-1 text-sm ${
              activeTab === "theme"
                ? "bg-amber-400 text-white"
                : "bg-white text-amber-600"
            }`}
            onClick={() => setActiveTab("theme")}
          >
            테마
          </button>
          <button
            className={`px-4 py-1 text-sm ${
              activeTab === "write"
                ? "bg-amber-400 text-white"
                : "bg-white text-amber-600"
            }`}
            onClick={() => setActiveTab("write")}
          >
            글쓰기
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomTap2;
