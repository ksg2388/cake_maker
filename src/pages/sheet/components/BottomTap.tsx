import React, { useEffect } from "react";

interface BottomTapProps {
  activeTab: "preset" | "theme" | "write";
  setActiveTab: (tab: "preset" | "theme" | "write") => void;
  image: HTMLImageElement | null;
  imageSize: number;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSizeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  presetImages: string[];
  handlePresetImageSelect: (imageSrc: string) => void;
  handleCopyToClipboard: () => void;
  handleSaveAsImage: () => void;
  selectedLayer?: {
    id: string;
    img: HTMLImageElement;
    x: number;
    y: number;
    size: number;
    isDragging: boolean;
    isSelected: boolean;
  } | null;
  handleSelectedLayerSizeChange: (size: number) => void;
  handleDeleteSelectedLayer: () => void;
  handleThemeSelect: (themeIndex: number | null) => void;
  currentTheme: number | null;
  writingText: string;
  setWritingText: (text: string) => void;
  handleTextColorChange: (color: string) => void;
  handleFontSizeChange: (size: number) => void;
  handleAddTextToCanvas: () => void;
  textColor: string;
  fontSize: number;
  isPenMode: boolean;
  setIsPenMode: (isPenMode: boolean) => void;
  penSize: number;
  setPenSize: (size: number) => void;
  clearWriting: () => void;
}

const BottomTap: React.FC<BottomTapProps> = ({
  activeTab,
  setActiveTab,
  handleImageUpload,
  presetImages,
  handlePresetImageSelect,
  handleCopyToClipboard,
  handleSaveAsImage,
  selectedLayer,
  handleSelectedLayerSizeChange,
  handleDeleteSelectedLayer,
  handleThemeSelect,
  currentTheme,
  writingText,
  setWritingText,
  handleFontSizeChange,
  handleAddTextToCanvas,
  fontSize,
  isPenMode,
  setIsPenMode,
  penSize,
  setPenSize,
  clearWriting,
}) => {
  const [sizeInputValue, setSizeInputValue] = React.useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedLayer) {
      setSizeInputValue(selectedLayer.size.toString());
    }
  }, [selectedLayer]);

  const handleSizeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSizeInputValue(e.target.value);
  };

  const handleSizeInputBlur = () => {
    const size = parseInt(sizeInputValue);
    if (!isNaN(size) && size >= 10 && size <= 300) {
      handleSelectedLayerSizeChange(size);
    } else {
      if (selectedLayer) {
        setSizeInputValue(selectedLayer.size.toString());
      }
    }
  };

  const handleSizeInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col h-[300px] bg-amber-50">
      <div className="p-4 border-t border-amber-200">
        {activeTab === "preset" && (
          <div className="flex flex-col space-y-4">
            {selectedLayer ? (
              <div className="flex flex-col items-center space-y-3 p-2 bg-amber-100 rounded-lg">
                <div className="flex items-center justify-between w-full max-w-xs">
                  <span className="text-amber-800 text-sm font-medium">
                    선택된 레이어
                  </span>
                  <button
                    onClick={handleDeleteSelectedLayer}
                    className="px-2 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600 transition-colors"
                  >
                    삭제
                  </button>
                </div>

                <div className="w-full max-w-xs">
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="layerSize"
                      className="text-amber-800 text-sm"
                    >
                      레이어 크기:
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="10"
                        max="300"
                        value={sizeInputValue}
                        onChange={handleSizeInputChange}
                        onBlur={handleSizeInputBlur}
                        onKeyDown={handleSizeInputKeyDown}
                        className="w-16 px-2 py-1 text-sm border border-amber-300 rounded-md text-center"
                      />
                      <span className="ml-1 text-sm text-amber-800">px</span>
                    </div>
                  </div>
                  <input
                    id="layerSize"
                    type="range"
                    min="10"
                    max="300"
                    value={selectedLayer.size}
                    onChange={(e) => {
                      const newSize = Number(e.target.value);
                      handleSelectedLayerSizeChange(newSize);
                      setSizeInputValue(newSize.toString());
                    }}
                    className="w-full accent-amber-500"
                  />
                </div>

                <p className="text-xs text-amber-700 text-center">
                  드래그하여 위치를 이동할 수 있습니다
                </p>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <div className="grid grid-cols-4 gap-3 p-2">
                  {presetImages.map((src, index) => (
                    <div
                      key={index}
                      className="cursor-pointer rounded-lg overflow-hidden border border-amber-200 hover:border-amber-400 transition-colors"
                      onClick={() => handlePresetImageSelect(src)}
                    >
                      <img
                        src={src}
                        alt={`프리셋 ${index + 1}`}
                        className="w-full h-16 p-2 object-contain bg-white"
                      />
                    </div>
                  ))}
                  <div
                    className="cursor-pointer rounded-lg overflow-hidden border border-amber-200 hover:border-amber-400 transition-colors flex items-center justify-center bg-white"
                    onClick={triggerFileInput}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-amber-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-amber-700 text-center">
                  이미지를 선택하거나 + 버튼을 눌러 새 이미지를 추가하세요
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        )}

        {activeTab === "theme" && (
          <div className="flex flex-col space-y-4">
            <h3 className="text-amber-800 text-sm font-medium">
              케이크 테두리 테마
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div
                className={`cursor-pointer rounded-lg overflow-hidden border ${
                  currentTheme === 0
                    ? "border-amber-500 ring-2 ring-amber-500"
                    : "border-amber-200"
                } hover:border-amber-400 transition-colors`}
                onClick={() => handleThemeSelect(0)}
              >
                <div className="bg-white p-2 flex items-center justify-center h-20">
                  <img
                    src={presetImages[0]}
                    alt="테마 1"
                    className="h-full object-contain"
                  />
                </div>
                <div className="bg-amber-100 p-2 text-center text-xs text-amber-800">
                  별 테두리
                </div>
              </div>

              <div
                className={`cursor-pointer rounded-lg overflow-hidden border ${
                  currentTheme === 1
                    ? "border-amber-500 ring-2 ring-amber-500"
                    : "border-amber-200"
                } hover:border-amber-400 transition-colors`}
                onClick={() => handleThemeSelect(1)}
              >
                <div className="bg-white p-2 flex items-center justify-center h-20">
                  <img
                    src={presetImages[1]}
                    alt="테마 2"
                    className="h-full object-contain"
                  />
                </div>
                <div className="bg-amber-100 p-2 text-center text-xs text-amber-800">
                  꽃 테두리
                </div>
              </div>

              <div
                className={`cursor-pointer rounded-lg overflow-hidden border ${
                  currentTheme === null
                    ? "border-amber-500 ring-2 ring-amber-500"
                    : "border-amber-200"
                } hover:border-amber-400 transition-colors`}
                onClick={() => handleThemeSelect(null)}
              >
                <div className="bg-white p-2 flex items-center justify-center h-20 text-amber-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <div className="bg-amber-100 p-2 text-center text-xs text-amber-800">
                  테두리 없음
                </div>
              </div>
            </div>

            <p className="text-xs text-amber-700 text-center mt-2">
              케이크 테두리 테마를 선택하세요
            </p>
          </div>
        )}

        {activeTab === "write" && (
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-amber-800 text-sm font-medium">글쓰기</h3>
              <div className="flex space-x-2">
                <button
                  className={`px-3 py-1 text-xs rounded-full ${
                    isPenMode
                      ? "bg-amber-500 text-white"
                      : "bg-white text-amber-600 border border-amber-300"
                  }`}
                  onClick={() => setIsPenMode(true)}
                >
                  펜
                </button>
                <button
                  className={`px-3 py-1 text-xs rounded-full ${
                    !isPenMode
                      ? "bg-amber-500 text-white"
                      : "bg-white text-amber-600 border border-amber-300"
                  }`}
                  onClick={() => setIsPenMode(false)}
                >
                  텍스트
                </button>
              </div>
            </div>

            {isPenMode ? (
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-amber-800 text-xs">펜 크기:</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={penSize}
                    onChange={(e) => setPenSize(Number(e.target.value))}
                    className="w-32"
                  />
                  <span className="text-amber-800 text-xs">{penSize}px</span>
                </div>

                <button
                  className="px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm hover:bg-amber-200 transition-colors"
                  onClick={clearWriting}
                >
                  지우기
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <textarea
                  className="border border-amber-300 p-2 rounded-md h-20 text-sm"
                  placeholder="텍스트를 입력하세요"
                  value={writingText}
                  onChange={(e) => setWritingText(e.target.value)}
                />

                <div className="flex items-center justify-between">
                  <span className="text-amber-800 text-xs">글자 크기:</span>
                  <input
                    type="range"
                    min="12"
                    max="48"
                    value={fontSize}
                    onChange={(e) =>
                      handleFontSizeChange(Number(e.target.value))
                    }
                    className="w-32"
                  />
                  <span className="text-amber-800 text-xs">{fontSize}px</span>
                </div>

                <div className="flex justify-between">
                  <button
                    className="px-4 py-2 bg-amber-500 text-white rounded-full text-sm hover:bg-amber-600 transition-colors"
                    onClick={handleAddTextToCanvas}
                  >
                    텍스트 추가
                  </button>
                  <button
                    className="px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm hover:bg-amber-200 transition-colors"
                    onClick={clearWriting}
                  >
                    선택 삭제
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between p-3 bg-amber-100 border-t border-amber-200 mt-auto">
        <div className="flex space-x-2">
          <button
            onClick={handleCopyToClipboard}
            className="px-4 py-2 bg-amber-500 text-white rounded-full text-sm shadow-sm hover:bg-amber-600 transition-colors"
          >
            복사
          </button>
          <button
            onClick={handleSaveAsImage}
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

export default BottomTap;
