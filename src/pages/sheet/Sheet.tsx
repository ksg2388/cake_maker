import { useEffect, useRef, useState, useCallback } from "react";
import BottomTap from "./components/BottomTap";

const Sheet = () => {
  const backgroundCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const themeCanvasRef = useRef<HTMLCanvasElement | null>(null); // 테마 캔버스 추가
  const textCanvasRef = useRef<HTMLCanvasElement | null>(null); // 텍스트 캔버스 추가
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 업로드된 이미지를 레이어로 관리하도록 변경
  const [uploadedImageLayer, setUploadedImageLayer] = useState<{
    id: string;
    img: HTMLImageElement;
    x: number;
    y: number;
    size: number;
    isDragging: boolean;
    isSelected: boolean;
  } | null>(null);
  const [imageSize, setImageSize] = useState<number>(100);
  const [activeTab, setActiveTab] = useState<"preset" | "theme" | "write">(
    "preset"
  );
  const [presetImages] = useState<string[]>([
    "/images/star.png",
    "/images/flower.png",
  ]);

  // 테마 상태 추가
  const [currentTheme, setCurrentTheme] = useState<number | null>(null);
  const [themeImages, setThemeImages] = useState<HTMLImageElement[]>([]);

  // 프리셋 이미지 레이어 관리를 위한 상태 추가
  const [presetLayers, setPresetLayers] = useState<
    {
      id: string;
      img: HTMLImageElement;
      x: number;
      y: number;
      size: number;
      isDragging: boolean;
      isSelected: boolean;
    }[]
  >([]);

  // 드래그 관련 상태
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const dragTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null); // 드래그 타임아웃 참조 추가

  // 글쓰기 관련 상태 추가
  const [writingText, setWritingText] = useState<string>("");
  const [textColor, setTextColor] = useState<string>("#000000");
  const [fontSize, setFontSize] = useState<number>(24);
  const [isPenMode, setIsPenMode] = useState<boolean>(false);
  const [penSize, setPenSize] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [lastPosition, setLastPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // 텍스트 레이어 관리
  const [textLayers, setTextLayers] = useState<
    {
      id: string;
      text: string;
      x: number;
      y: number;
      color: string;
      fontSize: number;
      isSelected: boolean;
    }[]
  >([]);

  // 펜 그리기 내용을 저장할 상태 추가
  const [penDrawings, setPenDrawings] = useState<ImageData | null>(null);

  // 텍스트 드래그 관련 상태 추가
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [textDragStartPos, setTextDragStartPos] = useState({ x: 0, y: 0 });

  // 테마 이미지 로드
  useEffect(() => {
    // 프리셋 이미지를 테마 이미지로 사용
    const loadThemeImages = async () => {
      const images: HTMLImageElement[] = [];

      for (const src of presetImages) {
        const img = new Image();
        img.src = src;
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        images.push(img);
      }

      setThemeImages(images);
      console.log("테마 이미지 로드 완료:", images.length);
    };

    loadThemeImages();
  }, [presetImages]);

  // 테마 캔버스 그리기 함수 수정
  const drawThemeCanvas = useCallback(() => {
    const canvas = themeCanvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // 캔버스 초기화
    context.clearRect(0, 0, canvas.width, canvas.height);

    // 테마가 선택되지 않았으면 그리지 않음
    if (currentTheme === null || !themeImages[currentTheme]) return;

    const themeImg = themeImages[currentTheme];

    // 케이크 원의 중심과 반지름 계산
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 3;

    // 테두리에 이미지 배치 (살짝 안쪽으로 조정)
    const itemCount = 12; // 테두리에 배치할 아이템 수
    const itemSize = radius * 0.25; // 아이템 크기
    const insetFactor = 0.85; // 안쪽으로 조정할 비율 (1보다 작을수록 더 안쪽)

    for (let i = 0; i < itemCount; i++) {
      const angle = (i / itemCount) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius * insetFactor;
      const y = centerY + Math.sin(angle) * radius * insetFactor;

      // 이미지 그리기
      context.save();
      context.translate(x, y);
      context.rotate(angle + Math.PI / 2); // 이미지가 원의 중심을 향하도록 회전
      context.drawImage(
        themeImg,
        -itemSize / 2,
        -itemSize / 2,
        itemSize,
        itemSize
      );
      context.restore();
    }
  }, [currentTheme, themeImages]);

  // 테마 선택 핸들러 수정
  const handleThemeSelect = useCallback(
    (themeIndex: number | null) => {
      setCurrentTheme(themeIndex);

      // 비동기로 처리하여 상태 업데이트 후 캔버스 그리기
      setTimeout(() => {
        const canvas = themeCanvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        // 캔버스 초기화
        context.clearRect(0, 0, canvas.width, canvas.height);

        // 테마가 선택되지 않았으면 그리지 않음
        if (themeIndex === null || !themeImages[themeIndex]) return;

        const themeImg = themeImages[themeIndex];

        // 케이크 원의 중심과 반지름 계산
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = canvas.width / 3;

        // 테두리에 이미지 배치 (살짝 안쪽으로 조정)
        const itemCount = 12; // 테두리에 배치할 아이템 수
        const itemSize = radius * 0.25; // 아이템 크기
        const insetFactor = 0.85; // 안쪽으로 조정할 비율 (1보다 작을수록 더 안쪽)

        for (let i = 0; i < itemCount; i++) {
          const angle = (i / itemCount) * Math.PI * 2;
          const x = centerX + Math.cos(angle) * radius * insetFactor;
          const y = centerY + Math.sin(angle) * radius * insetFactor;

          // 이미지 그리기
          context.save();
          context.translate(x, y);
          context.rotate(angle + Math.PI / 2); // 이미지가 원의 중심을 향하도록 회전
          context.drawImage(
            themeImg,
            -itemSize / 2,
            -itemSize / 2,
            itemSize,
            itemSize
          );
          context.restore();
        }
      }, 0);
    },
    [themeImages]
  );

  // 마우스 및 터치 이벤트 핸들러 수정
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // 현재 탭이 preset이 아니면 이미지 조작 불가
      if (activeTab !== "preset") return;

      if (!imageCanvasRef.current) return;

      const canvas = imageCanvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 업로드된 이미지 레이어 확인
      if (uploadedImageLayer) {
        const layer = uploadedImageLayer;
        const layerWidth = layer.size;
        const layerHeight = layer.size * (layer.img.height / layer.img.width);

        if (
          x >= layer.x - layerWidth / 2 &&
          x <= layer.x + layerWidth / 2 &&
          y >= layer.y - layerHeight / 2 &&
          y <= layer.y + layerHeight / 2
        ) {
          // 업로드된 이미지 레이어 선택 및 드래그 시작
          setIsDragging(true);
          setDragStartPos({ x, y });
          setSelectedLayerId(layer.id);

          // 프리셋 레이어 선택 해제
          setPresetLayers((prevLayers) =>
            prevLayers.map((l) => ({
              ...l,
              isSelected: false,
              isDragging: false,
            }))
          );

          // 업로드된 이미지 레이어 선택
          setUploadedImageLayer({
            ...layer,
            isSelected: true,
            isDragging: true,
          });

          return;
        }
      }

      // 클릭한 위치에 있는 프리셋 레이어 찾기 (역순으로 검사하여 상위 레이어 우선)
      for (let i = presetLayers.length - 1; i >= 0; i--) {
        const layer = presetLayers[i];
        const layerWidth = layer.size;
        const layerHeight = layer.size * (layer.img.height / layer.img.width);

        if (
          x >= layer.x - layerWidth / 2 &&
          x <= layer.x + layerWidth / 2 &&
          y >= layer.y - layerHeight / 2 &&
          y <= layer.y + layerHeight / 2
        ) {
          // 레이어 선택 및 드래그 시작
          setIsDragging(true);
          setDragStartPos({ x, y });
          setSelectedLayerId(layer.id);

          // 선택된 레이어 업데이트
          setPresetLayers((prevLayers) =>
            prevLayers.map((l) => ({
              ...l,
              isSelected: l.id === layer.id,
              isDragging: l.id === layer.id,
            }))
          );

          // 업로드된 이미지 레이어 선택 해제
          if (uploadedImageLayer) {
            setUploadedImageLayer({
              ...uploadedImageLayer,
              isSelected: false,
              isDragging: false,
            });
          }

          return;
        }
      }

      // 빈 공간 클릭 시 선택 해제
      setSelectedLayerId(null);
      setPresetLayers((prevLayers) =>
        prevLayers.map((l) => ({
          ...l,
          isSelected: false,
          isDragging: false,
        }))
      );

      // 업로드된 이미지 레이어 선택 해제
      if (uploadedImageLayer) {
        setUploadedImageLayer({
          ...uploadedImageLayer,
          isSelected: false,
          isDragging: false,
        });
      }
    },
    [presetLayers, uploadedImageLayer, activeTab]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      // 현재 탭이 preset이 아니면 이미지 조작 불가
      if (activeTab !== "preset") return;

      // 브라우저 기본 동작 방지
      e.preventDefault();

      if (!imageCanvasRef.current) return;

      const canvas = imageCanvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;

      // 업로드된 이미지 레이어 확인
      if (uploadedImageLayer) {
        const layer = uploadedImageLayer;
        const layerWidth = layer.size;
        const layerHeight = layer.size * (layer.img.height / layer.img.width);

        if (
          x >= layer.x - layerWidth / 2 &&
          x <= layer.x + layerWidth / 2 &&
          y >= layer.y - layerHeight / 2 &&
          y <= layer.y + layerHeight / 2
        ) {
          // 드래그 타임아웃 설정
          dragTimeoutRef.current = setTimeout(() => {
            setIsDragging(true);
            setDragStartPos({ x, y });
            setSelectedLayerId(layer.id);

            // 프리셋 레이어 선택 해제
            setPresetLayers((prevLayers) =>
              prevLayers.map((l) => ({
                ...l,
                isSelected: false,
                isDragging: false,
              }))
            );

            // 업로드된 이미지 레이어 선택
            setUploadedImageLayer({
              ...layer,
              isSelected: true,
              isDragging: true,
            });
          }, 300); // 300ms 후 드래그 시작

          return;
        }
      }

      // 클릭한 위치에 있는 프리셋 레이어 찾기 (역순으로 검사하여 상위 레이어 우선)
      for (let i = presetLayers.length - 1; i >= 0; i--) {
        const layer = presetLayers[i];
        const layerWidth = layer.size;
        const layerHeight = layer.size * (layer.img.height / layer.img.width);

        if (
          x >= layer.x - layerWidth / 2 &&
          x <= layer.x + layerWidth / 2 &&
          y >= layer.y - layerHeight / 2 &&
          y <= layer.y + layerHeight / 2
        ) {
          // 드래그 타임아웃 설정
          dragTimeoutRef.current = setTimeout(() => {
            setIsDragging(true);
            setDragStartPos({ x, y });
            setSelectedLayerId(layer.id);

            // 선택된 레이어 업데이트
            setPresetLayers((prevLayers) =>
              prevLayers.map((l) => ({
                ...l,
                isSelected: l.id === layer.id,
                isDragging: l.id === layer.id,
              }))
            );

            // 업로드된 이미지 레이어 선택 해제
            if (uploadedImageLayer) {
              setUploadedImageLayer({
                ...uploadedImageLayer,
                isSelected: false,
                isDragging: false,
              });
            }
          }, 300); // 300ms 후 드래그 시작

          return;
        }
      }

      // 빈 공간 클릭 시 선택 해제
      setSelectedLayerId(null);
      setPresetLayers((prevLayers) =>
        prevLayers.map((l) => ({
          ...l,
          isSelected: false,
          isDragging: false,
        }))
      );

      // 업로드된 이미지 레이어 선택 해제
      if (uploadedImageLayer) {
        setUploadedImageLayer({
          ...uploadedImageLayer,
          isSelected: false,
          isDragging: false,
        });
      }
    },
    [presetLayers, uploadedImageLayer, activeTab]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      // 현재 탭이 preset이 아니면 이미지 조작 불가
      if (activeTab !== "preset") return;

      // 브라우저 기본 동작 방지
      e.preventDefault();

      if (!isDragging || !selectedLayerId || !imageCanvasRef.current) return;

      const canvas = imageCanvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;

      // 케이크 원의 중심과 반지름 계산
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = canvas.width / 3;

      // 업로드된 이미지 레이어 이동
      if (uploadedImageLayer && uploadedImageLayer.id === selectedLayerId) {
        const layer = uploadedImageLayer;

        // 새 위치 계산
        const newX = layer.x + (x - dragStartPos.x);
        const newY = layer.y + (y - dragStartPos.y);

        // 이미지 크기를 고려한 최대 허용 거리 계산
        const imgWidth = layer.size;
        const imgHeight = layer.size * (layer.img.height / layer.img.width);
        const maxDistance = radius - Math.max(imgWidth, imgHeight) / 2;

        // 새 위치가 원 안에 있는지 확인
        const distanceFromCenter = Math.sqrt(
          Math.pow(newX - centerX, 2) + Math.pow(newY - centerY, 2)
        );

        if (distanceFromCenter <= maxDistance) {
          // 원 안에 있을 경우 위치 업데이트
          setUploadedImageLayer({
            ...layer,
            x: newX,
            y: newY,
          });
        } else {
          // 원 밖으로 나가려고 할 경우, 원 경계에 위치 제한
          const angle = Math.atan2(newY - centerY, newX - centerX);
          const constrainedX = centerX + maxDistance * Math.cos(angle);
          const constrainedY = centerY + maxDistance * Math.sin(angle);

          setUploadedImageLayer({
            ...layer,
            x: constrainedX,
            y: constrainedY,
          });
        }

        setDragStartPos({ x, y });
        return;
      }

      // 프리셋 레이어 이동 (기존 코드)
      setPresetLayers((prevLayers) =>
        prevLayers.map((layer) => {
          if (layer.id === selectedLayerId) {
            // 새 위치 계산
            const newX = layer.x + (x - dragStartPos.x);
            const newY = layer.y + (y - dragStartPos.y);

            // 이미지 크기를 고려한 최대 허용 거리 계산
            const imgWidth = layer.size;
            const imgHeight = layer.size * (layer.img.height / layer.img.width);
            const maxDistance = radius - Math.max(imgWidth, imgHeight) / 2;

            // 새 위치가 원 안에 있는지 확인
            const distanceFromCenter = Math.sqrt(
              Math.pow(newX - centerX, 2) + Math.pow(newY - centerY, 2)
            );

            // 원 안에 있을 경우에만 위치 업데이트
            if (distanceFromCenter <= maxDistance) {
              return {
                ...layer,
                x: newX,
                y: newY,
              };
            }

            // 원 밖으로 나가려고 할 경우, 원 경계에 위치 제한
            if (distanceFromCenter > maxDistance) {
              // 중심에서 새 위치까지의 각도 계산
              const angle = Math.atan2(newY - centerY, newX - centerX);

              // 원 경계에 맞춘 새 위치 계산
              const constrainedX = centerX + maxDistance * Math.cos(angle);
              const constrainedY = centerY + maxDistance * Math.sin(angle);

              return {
                ...layer,
                x: constrainedX,
                y: constrainedY,
              };
            }
          }
          return layer;
        })
      );

      setDragStartPos({ x, y });
    },
    [isDragging, selectedLayerId, dragStartPos, uploadedImageLayer, activeTab]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current); // 드래그 타임아웃 해제
      dragTimeoutRef.current = null;
    }

    // 프리셋 레이어 드래그 상태 해제
    setPresetLayers((prevLayers) =>
      prevLayers.map((layer) => ({
        ...layer,
        isDragging: false,
      }))
    );

    // 업로드된 이미지 레이어 드래그 상태 해제
    if (uploadedImageLayer) {
      setUploadedImageLayer({
        ...uploadedImageLayer,
        isDragging: false,
      });
    }
  }, [uploadedImageLayer]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current); // 드래그 타임아웃 해제
      dragTimeoutRef.current = null;
    }

    // 프리셋 레이어 드래그 상태 해제
    setPresetLayers((prevLayers) =>
      prevLayers.map((layer) => ({
        ...layer,
        isDragging: false,
      }))
    );

    // 업로드된 이미지 레이어 드래그 상태 해제
    if (uploadedImageLayer) {
      setUploadedImageLayer({
        ...uploadedImageLayer,
        isDragging: false,
      });
    }
  }, [uploadedImageLayer]);

  // 선택된 레이어 크기 조절 함수 수정
  const handleSelectedLayerSizeChange = useCallback(
    (size: number) => {
      if (!selectedLayerId) return;

      // 업로드된 이미지 레이어 크기 조절
      if (uploadedImageLayer && uploadedImageLayer.id === selectedLayerId) {
        setUploadedImageLayer({
          ...uploadedImageLayer,
          size,
        });
        return;
      }

      // 프리셋 레이어 크기 조절
      setPresetLayers((prevLayers) =>
        prevLayers.map((layer) => {
          if (layer.id === selectedLayerId) {
            return {
              ...layer,
              size,
            };
          }
          return layer;
        })
      );
    },
    [selectedLayerId, uploadedImageLayer]
  );

  // 선택된 레이어 삭제 함수 수정
  const handleDeleteSelectedLayer = useCallback(() => {
    if (!selectedLayerId) return;

    // 업로드된 이미지 레이어 삭제
    if (uploadedImageLayer && uploadedImageLayer.id === selectedLayerId) {
      setUploadedImageLayer(null);
      setSelectedLayerId(null);
      return;
    }

    // 프리셋 레이어 삭제
    setPresetLayers((prevLayers) =>
      prevLayers.filter((layer) => layer.id !== selectedLayerId)
    );
    setSelectedLayerId(null);
  }, [selectedLayerId, uploadedImageLayer]);

  // 이미지 업로드 처리 함수 수정
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // 캔버스 중앙에 업로드된 이미지 레이어 추가
          const canvas = imageCanvasRef.current;
          if (!canvas) return;

          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;

          // 새 레이어 생성
          const newLayer = {
            id: `layer-${Date.now()}`,
            img,
            x: centerX,
            y: centerY,
            size: imageSize,
            isDragging: false,
            isSelected: true,
          };

          // 기존 레이어 선택 해제하고 새 레이어 추가 (프리셋 레이어로 추가)
          setPresetLayers((prevLayers) => [
            ...prevLayers.map((layer) => ({ ...layer, isSelected: false })),
            newLayer,
          ]);

          // 업로드된 이미지 레이어 선택 해제
          if (uploadedImageLayer) {
            setUploadedImageLayer({
              ...uploadedImageLayer,
              isSelected: false,
            });
          }

          setSelectedLayerId(newLayer.id);

          // 파일 입력 초기화 (같은 파일 다시 선택 가능하도록)
          if (e.target) {
            e.target.value = "";
          }

          drawImageCanvas(); // 이미지가 로드되면 이미지 캔버스 다시 그리기
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // 이미지 크기 조절 함수 수정
  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = Number(e.target.value);
    setImageSize(newSize);

    // 선택된 레이어가 업로드된 이미지인 경우 크기 업데이트
    if (
      selectedLayerId &&
      uploadedImageLayer &&
      uploadedImageLayer.id === selectedLayerId
    ) {
      setUploadedImageLayer({
        ...uploadedImageLayer,
        size: newSize,
      });
    }
  };

  // 이미지 캔버스 그리기 함수 수정
  const drawImageCanvas = useCallback(() => {
    const canvas = imageCanvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // 캔버스 초기화
    context.clearRect(0, 0, canvas.width, canvas.height);

    // 업로드된 이미지 레이어 그리기
    if (uploadedImageLayer) {
      const { img, x, y, size, isSelected } = uploadedImageLayer;
      const imgWidth = size;
      const imgHeight = size * (img.height / img.width);

      // 이미지 그리기
      context.drawImage(
        img,
        x - imgWidth / 2,
        y - imgHeight / 2,
        imgWidth,
        imgHeight
      );

      // 선택된 레이어에 테두리 표시
      if (isSelected) {
        context.strokeStyle = "#3B82F6"; // 파란색 테두리
        context.lineWidth = 2;
        context.strokeRect(
          x - imgWidth / 2 - 2,
          y - imgHeight / 2 - 2,
          imgWidth + 4,
          imgHeight + 4
        );

        // 크기 조절 핸들 표시
        context.fillStyle = "#3B82F6";
        const handleSize = 8;
        context.fillRect(
          x + imgWidth / 2 - handleSize / 2,
          y + imgHeight / 2 - handleSize / 2,
          handleSize,
          handleSize
        );
      }
    }

    // 프리셋 레이어 그리기
    presetLayers.forEach((layer) => {
      const { img, x, y, size, isSelected } = layer;
      const imgWidth = size;
      const imgHeight = size * (img.height / img.width);

      // 이미지 그리기
      context.drawImage(
        img,
        x - imgWidth / 2,
        y - imgHeight / 2,
        imgWidth,
        imgHeight
      );

      // 선택된 레이어에 테두리 표시
      if (isSelected) {
        context.strokeStyle = "#3B82F6"; // 파란색 테두리
        context.lineWidth = 2;
        context.strokeRect(
          x - imgWidth / 2 - 2,
          y - imgHeight / 2 - 2,
          imgWidth + 4,
          imgHeight + 4
        );

        // 크기 조절 핸들 표시
        context.fillStyle = "#3B82F6";
        const handleSize = 8;
        context.fillRect(
          x + imgWidth / 2 - handleSize / 2,
          y + imgHeight / 2 - handleSize / 2,
          handleSize,
          handleSize
        );
      }
    });
  }, [uploadedImageLayer, presetLayers]);

  // 이미지나 이미지 크기가 변경될 때 이미지 캔버스 다시 그리기
  useEffect(() => {
    drawImageCanvas();
  }, [drawImageCanvas, imageSize, presetLayers]);

  // 프리셋 이미지 선택 함수 수정
  const handlePresetImageSelect = (imageSrc: string) => {
    const img = new Image();
    img.onload = () => {
      // 캔버스 중앙에 새 레이어 추가
      const canvas = imageCanvasRef.current;
      if (!canvas) return;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const defaultSize = 100;

      const newLayer = {
        id: `layer-${Date.now()}`,
        img,
        x: centerX,
        y: centerY,
        size: defaultSize,
        isDragging: false,
        isSelected: true,
      };

      // 기존 레이어 선택 해제하고 새 레이어 추가
      setPresetLayers((prevLayers) => [
        ...prevLayers.map((layer) => ({ ...layer, isSelected: false })),
        newLayer,
      ]);
      setSelectedLayerId(newLayer.id);
    };
    img.src = imageSrc;
  };

  // 이미지 드래그 앤 드롭 처리 함수 추가
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();

    // 파일 드롭 처리
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.match("image.*")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            // 드롭된 위치에 새 레이어 추가
            const canvas = imageCanvasRef.current;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // 케이크 원의 중심과 반지름 계산
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = canvas.width / 3;
            const defaultSize = 100;

            // 드롭 위치가 원 안에 있는지 확인
            const distanceFromCenter = Math.sqrt(
              Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
            );

            // 이미지 크기를 고려한 최대 허용 거리 계산
            const imgWidth = defaultSize;
            const imgHeight = defaultSize * (img.height / img.width);
            const maxDistance = radius - Math.max(imgWidth, imgHeight) / 2;

            // 드롭 위치 계산 (원 안으로 제한)
            let dropX = x;
            let dropY = y;

            if (distanceFromCenter > maxDistance) {
              // 중심에서 드롭 위치까지의 각도 계산
              const angle = Math.atan2(y - centerY, x - centerX);

              // 원 경계에 맞춘 위치 계산
              dropX = centerX + maxDistance * Math.cos(angle);
              dropY = centerY + maxDistance * Math.sin(angle);
            }

            const newLayer = {
              id: `layer-${Date.now()}`,
              img,
              x: dropX,
              y: dropY,
              size: defaultSize,
              isDragging: false,
              isSelected: true,
            };

            // 기존 레이어 선택 해제하고 새 레이어 추가
            setPresetLayers((prevLayers) => [
              ...prevLayers.map((layer) => ({ ...layer, isSelected: false })),
              newLayer,
            ]);
            setSelectedLayerId(newLayer.id);
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); // 드롭을 허용하기 위해 필요
  }, []);

  // 배경 캔버스 그리기 함수
  const drawBackgroundCanvas = useCallback(() => {
    const canvas = backgroundCanvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // 캔버스 초기화
    context.clearRect(0, 0, canvas.width, canvas.height);

    // 케이크 테두리 그리기
    context.beginPath();
    context.arc(
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 3,
      0,
      Math.PI * 2,
      false
    );
    context.fillStyle = "white";
    context.fill();
    context.strokeStyle = "black";
    context.lineWidth = 2;
    context.stroke();
  }, []);

  // 캔버스를 이미지로 저장하는 함수 수정
  const handleSaveAsImage = () => {
    const bgCanvas = backgroundCanvasRef.current;
    const imgCanvas = imageCanvasRef.current;
    const themeCanvas = themeCanvasRef.current;
    const textCanvas = textCanvasRef.current;
    if (!bgCanvas || !imgCanvas || !themeCanvas || !textCanvas) return;

    // 최종 결과를 위한 임시 캔버스 생성
    const tempCanvas = document.createElement("canvas");

    // 케이크 크기 계산 (배경 캔버스에서 그려진 원의 크기)
    const cakeRadius = bgCanvas.width / 2;
    const cakeSize = cakeRadius * 2;

    // 정사각형 캔버스 생성 (케이크 크기보다 약간 더 크게)
    const canvasSize = Math.ceil(cakeSize * 1);
    tempCanvas.width = canvasSize;
    tempCanvas.height = canvasSize;

    const tempCtx = tempCanvas.getContext("2d");

    if (tempCtx) {
      // 배경을 흰색으로 채우기
      tempCtx.fillStyle = "white";
      tempCtx.fillRect(0, 0, canvasSize, canvasSize);

      // 원본 캔버스에서의 케이크 중심 위치
      const srcCenterX = bgCanvas.width / 2;
      const srcCenterY = bgCanvas.height / 2;

      // 새 캔버스에서의 중심 위치
      const destCenterX = canvasSize / 2;
      const destCenterY = canvasSize / 2;

      // 배경 캔버스 내용 복사 (케이크 부분만)
      tempCtx.drawImage(
        bgCanvas,
        srcCenterX - cakeRadius,
        srcCenterY - cakeRadius,
        cakeSize,
        cakeSize,
        destCenterX - cakeRadius,
        destCenterY - cakeRadius,
        cakeSize,
        cakeSize
      );

      // 테마 캔버스 내용 복사 (케이크 부분만)
      tempCtx.drawImage(
        themeCanvas,
        srcCenterX - cakeRadius,
        srcCenterY - cakeRadius,
        cakeSize,
        cakeSize,
        destCenterX - cakeRadius,
        destCenterY - cakeRadius,
        cakeSize,
        cakeSize
      );

      // 이미지 캔버스 내용 복사 (케이크 부분만)
      tempCtx.drawImage(
        imgCanvas,
        srcCenterX - cakeRadius,
        srcCenterY - cakeRadius,
        cakeSize,
        cakeSize,
        destCenterX - cakeRadius,
        destCenterY - cakeRadius,
        cakeSize,
        cakeSize
      );

      // 텍스트 캔버스 내용도 복사
      tempCtx.drawImage(
        textCanvas,
        srcCenterX - cakeRadius,
        srcCenterY - cakeRadius,
        cakeSize,
        cakeSize,
        destCenterX - cakeRadius,
        destCenterY - cakeRadius,
        cakeSize,
        cakeSize
      );

      // 통합된 캔버스를 이미지로 변환
      const dataUrl = tempCanvas.toDataURL("image/png");

      // 다운로드 링크 생성
      const link = document.createElement("a");
      link.download = "케이크_디자인.png";
      link.href = dataUrl;
      link.click();
    }
  };

  // 캔버스 내용을 클립보드에 복사하는 함수 수정
  const handleCopyToClipboard = async () => {
    const bgCanvas = backgroundCanvasRef.current;
    const imgCanvas = imageCanvasRef.current;
    const themeCanvas = themeCanvasRef.current;
    const textCanvas = textCanvasRef.current;
    if (!bgCanvas || !imgCanvas || !themeCanvas || !textCanvas) return;

    try {
      // 최종 결과를 위한 임시 캔버스 생성
      const tempCanvas = document.createElement("canvas");

      // 케이크 크기 계산 (배경 캔버스에서 그려진 원의 크기)
      const cakeRadius = bgCanvas.width / 2;
      const cakeSize = cakeRadius * 2;

      // 정사각형 캔버스 생성 (케이크 크기보다 약간 더 크게)
      const canvasSize = Math.ceil(cakeSize * 1);
      tempCanvas.width = canvasSize;
      tempCanvas.height = canvasSize;

      const tempCtx = tempCanvas.getContext("2d");

      if (tempCtx) {
        // 배경을 흰색으로 채우기
        tempCtx.fillStyle = "white";
        tempCtx.fillRect(0, 0, canvasSize, canvasSize);

        // 원본 캔버스에서의 케이크 중심 위치
        const srcCenterX = bgCanvas.width / 2;
        const srcCenterY = bgCanvas.height / 2;

        // 새 캔버스에서의 중심 위치
        const destCenterX = canvasSize / 2;
        const destCenterY = canvasSize / 2;

        // 배경 캔버스 내용 복사 (케이크 부분만)
        tempCtx.drawImage(
          bgCanvas,
          srcCenterX - cakeRadius,
          srcCenterY - cakeRadius,
          cakeSize,
          cakeSize,
          destCenterX - cakeRadius,
          destCenterY - cakeRadius,
          cakeSize,
          cakeSize
        );

        // 테마 캔버스 내용 복사 (케이크 부분만)
        tempCtx.drawImage(
          themeCanvas,
          srcCenterX - cakeRadius,
          srcCenterY - cakeRadius,
          cakeSize,
          cakeSize,
          destCenterX - cakeRadius,
          destCenterY - cakeRadius,
          cakeSize,
          cakeSize
        );

        // 이미지 캔버스 내용 복사 (케이크 부분만)
        tempCtx.drawImage(
          imgCanvas,
          srcCenterX - cakeRadius,
          srcCenterY - cakeRadius,
          cakeSize,
          cakeSize,
          destCenterX - cakeRadius,
          destCenterY - cakeRadius,
          cakeSize,
          cakeSize
        );

        // 텍스트 캔버스 내용도 복사
        tempCtx.drawImage(
          textCanvas,
          srcCenterX - cakeRadius,
          srcCenterY - cakeRadius,
          cakeSize,
          cakeSize,
          destCenterX - cakeRadius,
          destCenterY - cakeRadius,
          cakeSize,
          cakeSize
        );

        tempCanvas.toBlob(async (blob) => {
          if (blob) {
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob }),
            ]);
            alert("이미지가 클립보드에 복사되었습니다.");
          }
        });
      }
    } catch (err) {
      console.error("클립보드 복사 실패:", err);
      alert("클립보드 복사에 실패했습니다.");
    }
  };

  // 윈도우 크기가 변경될 때 캔버스 크기도 조정
  useEffect(() => {
    const handleResize = () => {
      const bgCanvas = backgroundCanvasRef.current;
      const imgCanvas = imageCanvasRef.current;
      const themeCanvas = themeCanvasRef.current;
      const textCanvas = textCanvasRef.current;
      const container = containerRef.current;

      if (bgCanvas && imgCanvas && themeCanvas && textCanvas && container) {
        const width = container.clientWidth;
        const height = container.clientHeight;

        // 세 캔버스 모두 크기 조정
        bgCanvas.width = width;
        bgCanvas.height = height;
        imgCanvas.width = width;
        imgCanvas.height = height;
        themeCanvas.width = width;
        themeCanvas.height = height;
        textCanvas.width = width;
        textCanvas.height = height;

        // 크기 조정 후 다시 그리기
        drawBackgroundCanvas();
        drawImageCanvas();
        drawThemeCanvas();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawBackgroundCanvas, drawImageCanvas, drawThemeCanvas]);

  // 초기 캔버스 설정
  useEffect(() => {
    const bgCanvas = backgroundCanvasRef.current;
    const imgCanvas = imageCanvasRef.current;
    const themeCanvas = themeCanvasRef.current;
    const textCanvas = textCanvasRef.current;
    const container = containerRef.current;

    if (bgCanvas && imgCanvas && themeCanvas && textCanvas && container) {
      const width = container.clientWidth;
      const height = container.clientHeight;

      // 세 캔버스 모두 크기 설정
      bgCanvas.width = width;
      bgCanvas.height = height;
      imgCanvas.width = width;
      imgCanvas.height = height;
      themeCanvas.width = width;
      themeCanvas.height = height;
      textCanvas.width = width;
      textCanvas.height = height;

      // 초기 배경 캔버스 그리기
      drawBackgroundCanvas();
    }
  }, [drawBackgroundCanvas]);

  // handleMouseMove 함수 추가
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // 현재 탭이 preset이 아니면 이미지 조작 불가
      if (activeTab !== "preset") return;

      if (!isDragging || !selectedLayerId || !imageCanvasRef.current) return;

      const canvas = imageCanvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 케이크 원의 중심과 반지름 계산
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = canvas.width / 3;

      // 업로드된 이미지 레이어 이동
      if (uploadedImageLayer && uploadedImageLayer.id === selectedLayerId) {
        const layer = uploadedImageLayer;

        // 새 위치 계산
        const newX = layer.x + (x - dragStartPos.x);
        const newY = layer.y + (y - dragStartPos.y);

        // 이미지 크기를 고려한 최대 허용 거리 계산
        const imgWidth = layer.size;
        const imgHeight = layer.size * (layer.img.height / layer.img.width);
        const maxDistance = radius - Math.max(imgWidth, imgHeight) / 2;

        // 새 위치가 원 안에 있는지 확인
        const distanceFromCenter = Math.sqrt(
          Math.pow(newX - centerX, 2) + Math.pow(newY - centerY, 2)
        );

        if (distanceFromCenter <= maxDistance) {
          // 원 안에 있을 경우 위치 업데이트
          setUploadedImageLayer({
            ...layer,
            x: newX,
            y: newY,
          });
        } else {
          // 원 밖으로 나가려고 할 경우, 원 경계에 위치 제한
          const angle = Math.atan2(newY - centerY, newX - centerX);
          const constrainedX = centerX + maxDistance * Math.cos(angle);
          const constrainedY = centerY + maxDistance * Math.sin(angle);

          setUploadedImageLayer({
            ...layer,
            x: constrainedX,
            y: constrainedY,
          });
        }

        setDragStartPos({ x, y });
        return;
      }

      // 프리셋 레이어 이동
      setPresetLayers((prevLayers) =>
        prevLayers.map((layer) => {
          if (layer.id === selectedLayerId) {
            // 새 위치 계산
            const newX = layer.x + (x - dragStartPos.x);
            const newY = layer.y + (y - dragStartPos.y);

            // 이미지 크기를 고려한 최대 허용 거리 계산
            const imgWidth = layer.size;
            const imgHeight = layer.size * (layer.img.height / layer.img.width);
            const maxDistance = radius - Math.max(imgWidth, imgHeight) / 2;

            // 새 위치가 원 안에 있는지 확인
            const distanceFromCenter = Math.sqrt(
              Math.pow(newX - centerX, 2) + Math.pow(newY - centerY, 2)
            );

            // 원 안에 있을 경우에만 위치 업데이트
            if (distanceFromCenter <= maxDistance) {
              return {
                ...layer,
                x: newX,
                y: newY,
              };
            }

            // 원 밖으로 나가려고 할 경우, 원 경계에 위치 제한
            if (distanceFromCenter > maxDistance) {
              // 중심에서 새 위치까지의 각도 계산
              const angle = Math.atan2(newY - centerY, newX - centerX);

              // 원 경계에 맞춘 새 위치 계산
              const constrainedX = centerX + maxDistance * Math.cos(angle);
              const constrainedY = centerY + maxDistance * Math.sin(angle);

              return {
                ...layer,
                x: constrainedX,
                y: constrainedY,
              };
            }
          }
          return layer;
        })
      );

      setDragStartPos({ x, y });
    },
    [isDragging, selectedLayerId, dragStartPos, uploadedImageLayer, activeTab]
  );

  // 테마 변경 시 캔버스 다시 그리기
  useEffect(() => {
    drawThemeCanvas();
    console.log("테마 변경:", currentTheme);
  }, [currentTheme, drawThemeCanvas]);

  // 글쓰기 캔버스 초기화
  useEffect(() => {
    const canvas = textCanvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  // 텍스트 색상 변경 핸들러
  const handleTextColorChange = (color: string) => {
    setTextColor(color);
  };

  // 글자 크기 변경 핸들러
  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
  };

  // 텍스트 캔버스 그리기 함수 수정
  const drawTextCanvas = useCallback(() => {
    const canvas = textCanvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // 캔버스 초기화 전에 현재 펜 그리기 내용 저장
    if (isPenMode && !penDrawings) {
      setPenDrawings(context.getImageData(0, 0, canvas.width, canvas.height));
    }

    // 캔버스 초기화
    context.clearRect(0, 0, canvas.width, canvas.height);

    // 저장된 펜 그리기 내용 복원
    if (penDrawings) {
      context.putImageData(penDrawings, 0, 0);
    }

    // 모든 텍스트 레이어 그리기
    textLayers.forEach((layer) => {
      context.font = `${layer.fontSize}px Arial`;
      context.fillStyle = layer.color;
      context.textAlign = "center";
      context.textBaseline = "middle";

      // 텍스트 그리기
      context.fillText(layer.text, layer.x, layer.y);

      // 펜 모드가 아닐 때만 선택된 레이어에 테두리 표시
      if (!isPenMode && layer.isSelected) {
        const textMetrics = context.measureText(layer.text);
        const textWidth = textMetrics.width;
        const textHeight = layer.fontSize;

        context.strokeStyle = "#3B82F6";
        context.lineWidth = 2;
        context.strokeRect(
          layer.x - textWidth / 2 - 5,
          layer.y - textHeight / 2 - 5,
          textWidth + 10,
          textHeight + 10
        );
      }
    });
  }, [textLayers, penDrawings, isPenMode]);

  // 텍스트 추가 핸들러 수정
  const handleAddTextToCanvas = useCallback(() => {
    if (!writingText.trim() || !textCanvasRef.current) return;

    const canvas = textCanvasRef.current;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 새 텍스트 레이어 추가
    const newTextLayer = {
      id: `text-${Date.now()}`,
      text: writingText,
      x: centerX,
      y: centerY,
      color: textColor,
      fontSize: fontSize,
      isDragging: false,
      isSelected: false,
    };

    // 기존 텍스트 레이어는 유지하고 새 레이어 추가
    setTextLayers((prevLayers) => [...prevLayers, newTextLayer]);

    // 입력 필드 초기화
    setWritingText("");

    // 텍스트 캔버스 다시 그리기 (펜 그리기 내용 유지)
    drawTextCanvas();
  }, [writingText, textColor, fontSize, drawTextCanvas]);

  // 텍스트 레이어 변경 시 캔버스 다시 그리기
  useEffect(() => {
    drawTextCanvas();
  }, [drawTextCanvas, textLayers]);

  // 펜 그리기 시작 핸들러 수정
  const handlePenStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      // 현재 탭이 write가 아니거나 펜 모드가 아니면 그리기 불가
      if (activeTab !== "write" || !isPenMode || !textCanvasRef.current) return;

      setIsDrawing(true);

      const canvas = textCanvasRef.current;
      const rect = canvas.getBoundingClientRect();

      let clientX, clientY;

      if ("touches" in e) {
        e.preventDefault(); // 터치 이벤트의 기본 동작 방지
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // 캔버스 크기에 맞게 좌표 조정
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const canvasX = x * scaleX;
      const canvasY = y * scaleY;

      setLastPosition({ x: canvasX, y: canvasY });

      const context = canvas.getContext("2d");
      if (context) {
        // 펜 색상을 검은색으로 고정
        context.fillStyle = "#000000";
        context.strokeStyle = "#000000";

        context.beginPath();
        context.arc(canvasX, canvasY, penSize / 2, 0, Math.PI * 2);
        context.fill();
      }
    },
    [activeTab, isPenMode, penSize]
  );

  // 펜 그리기 진행 핸들러 수정
  const handlePenMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      // 현재 탭이 write가 아니거나 펜 모드가 아니면 그리기 불가
      if (
        activeTab !== "write" ||
        !isPenMode ||
        !isDrawing ||
        !lastPosition ||
        !textCanvasRef.current
      )
        return;

      const canvas = textCanvasRef.current;
      const rect = canvas.getBoundingClientRect();

      let clientX, clientY;

      if ("touches" in e) {
        e.preventDefault(); // 터치 이벤트의 기본 동작 방지
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // 캔버스 크기에 맞게 좌표 조정
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const canvasX = x * scaleX;
      const canvasY = y * scaleY;

      const context = canvas.getContext("2d");
      if (context) {
        // 펜 색상을 검은색으로 고정
        context.fillStyle = "#000000";
        context.strokeStyle = "#000000";

        context.beginPath();
        context.moveTo(lastPosition.x, lastPosition.y);
        context.lineTo(canvasX, canvasY);
        context.lineWidth = penSize;
        context.lineCap = "round";
        context.lineJoin = "round"; // 선 연결 부분을 부드럽게
        context.stroke();

        // 선 끝에 원 그리기 (부드러운 선을 위해)
        context.beginPath();
        context.arc(canvasX, canvasY, penSize / 2, 0, Math.PI * 2);
        context.fill();
      }

      setLastPosition({ x: canvasX, y: canvasY });
    },
    [activeTab, isPenMode, isDrawing, lastPosition, penSize]
  );

  // 펜 그리기 종료 핸들러 수정
  const handlePenEnd = useCallback(() => {
    if (!isDrawing) return;

    setIsDrawing(false);
    setLastPosition(null);

    // 펜 그리기가 끝나면 현재 캔버스 상태 저장
    const canvas = textCanvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        setPenDrawings(context.getImageData(0, 0, canvas.width, canvas.height));
      }
    }
  }, [isDrawing]);

  // 모드 전환 시 처리 추가
  // useEffect(() => {
  //   // 모드 전환 시 캔버스 상태 유지
  //   const canvas = textCanvasRef.current;
  //   if (!canvas) return;

  //   const context = canvas.getContext("2d");
  //   if (!context) return;

  //   if (isPenMode) {
  //     // 텍스트 모드 -> 펜 모드로 전환 시
  //     // 텍스트 선택 해제
  //     setTextLayers((prevLayers) =>
  //       prevLayers.map((layer) => ({
  //         ...layer,
  //         isSelected: false,
  //         isDragging: false,
  //       }))
  //     );
  //     setSelectedTextId(null);

  //     // 펜 색상을 검은색으로 고정
  //     context.fillStyle = "#000000";
  //     context.strokeStyle = "#000000";

  //     // 캔버스 초기화 후 텍스트와 펜 그리기 내용 복원
  //     context.clearRect(0, 0, canvas.width, canvas.height);

  //     // 텍스트 레이어 그리기
  //     textLayers.forEach((layer) => {
  //       context.font = `${layer.fontSize}px Arial`;
  //       context.fillStyle = layer.color;
  //       context.textAlign = "center";
  //       context.textBaseline = "middle";
  //       context.fillText(layer.text, layer.x, layer.y);
  //     });

  //     // 펜 그리기 내용이 있으면 복원
  //     if (penDrawings) {
  //       context.putImageData(penDrawings, 0, 0);
  //     }
  //   } else {
  //     // 펜 모드 -> 텍스트 모드로 전환 시
  //     // 캔버스 초기화
  //     context.clearRect(0, 0, canvas.width, canvas.height);

  //     // 펜 그리기 내용 복원
  //     if (penDrawings) {
  //       context.putImageData(penDrawings, 0, 0);
  //     }

  //     // 텍스트 레이어 다시 그리기
  //     textLayers.forEach((layer) => {
  //       context.font = `${layer.fontSize}px Arial`;
  //       context.fillStyle = layer.color;
  //       context.textAlign = "center";
  //       context.textBaseline = "middle";
  //       context.fillText(layer.text, layer.x, layer.y);

  //       // 선택된 레이어에 테두리 표시
  //       if (layer.isSelected) {
  //         const textMetrics = context.measureText(layer.text);
  //         const textWidth = textMetrics.width;
  //         const textHeight = layer.fontSize;

  //         context.strokeStyle = "#3B82F6";
  //         context.lineWidth = 2;
  //         context.strokeRect(
  //           layer.x - textWidth / 2 - 5,
  //           layer.y - textHeight / 2 - 5,
  //           textWidth + 10,
  //           textHeight + 10
  //         );
  //       }
  //     });
  //   }
  // }, [isPenMode, penDrawings, textLayers]);

  // 텍스트 레이어 변경 시 캔버스 다시 그리기
  useEffect(() => {
    drawTextCanvas();
  }, [drawTextCanvas, textLayers]);

  // 탭 전환 시에도 캔버스 상태 유지
  useEffect(() => {
    if (activeTab === "write") {
      drawTextCanvas();
    }
  }, [activeTab, drawTextCanvas]);

  // 전체 초기화 함수 추가
  const clearAllWriting = useCallback(() => {
    setPenDrawings(null);
    setTextLayers([]);

    const canvas = textCanvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  // 텍스트 선택 및 드래그 시작 핸들러
  const handleTextMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      // 현재 탭이 write가 아니거나 펜 모드면 텍스트 조작 불가
      if (activeTab !== "write" || isPenMode || !textCanvasRef.current) return;

      const canvas = textCanvasRef.current;
      const rect = canvas.getBoundingClientRect();

      let clientX, clientY;

      if ("touches" in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // 클릭한 위치에 있는 텍스트 레이어 찾기 (역순으로 검사하여 상위 레이어 우선)
      for (let i = textLayers.length - 1; i >= 0; i--) {
        const layer = textLayers[i];
        const context = canvas.getContext("2d");
        if (!context) continue;

        context.font = `${layer.fontSize}px Arial`;
        const textMetrics = context.measureText(layer.text);
        const textWidth = textMetrics.width;
        const textHeight = layer.fontSize;

        // 텍스트 영역 계산
        const textLeft = layer.x - textWidth / 2 - 5;
        const textRight = layer.x + textWidth / 2 + 5;
        const textTop = layer.y - textHeight / 2 - 5;
        const textBottom = layer.y + textHeight / 2 + 5;

        if (
          x >= textLeft &&
          x <= textRight &&
          y >= textTop &&
          y <= textBottom
        ) {
          // 텍스트 레이어 선택 및 드래그 시작
          setSelectedTextId(layer.id);
          setTextDragStartPos({ x, y });

          // 선택된 레이어 업데이트
          setTextLayers((prevLayers) =>
            prevLayers.map((l) => ({
              ...l,
              isSelected: l.id === layer.id,
              isDragging: l.id === layer.id,
            }))
          );

          return;
        }
      }

      // 빈 공간 클릭 시 선택 해제
      setSelectedTextId(null);
      setTextLayers((prevLayers) =>
        prevLayers.map((l) => ({
          ...l,
          isSelected: false,
          isDragging: false,
        }))
      );
    },
    [textLayers, activeTab, isPenMode]
  );

  // 텍스트 드래그 핸들러
  const handleTextMouseMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      // 현재 탭이 write가 아니거나 펜 모드면 텍스트 조작 불가
      if (activeTab !== "write" || isPenMode) return;

      if (!selectedTextId || !textCanvasRef.current) return;

      const canvas = textCanvasRef.current;
      const rect = canvas.getBoundingClientRect();

      let clientX, clientY;

      if ("touches" in e) {
        e.preventDefault(); // 터치 이벤트의 기본 동작 방지
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // 케이크 원의 중심과 반지름 계산
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = canvas.width / 3;

      setTextLayers((prevLayers) =>
        prevLayers.map((layer) => {
          if (layer.id === selectedTextId) {
            // 새 위치 계산
            const newX = layer.x + (x - textDragStartPos.x);
            const newY = layer.y + (y - textDragStartPos.y);

            // 텍스트 크기를 고려한 최대 허용 거리 계산
            const context = canvas.getContext("2d");
            if (!context) return layer;

            context.font = `${layer.fontSize}px Arial`;
            const textMetrics = context.measureText(layer.text);
            const textWidth = textMetrics.width;
            const textHeight = layer.fontSize;

            const maxDistance = radius - Math.max(textWidth, textHeight) / 2;

            // 새 위치가 원 안에 있는지 확인
            const distanceFromCenter = Math.sqrt(
              Math.pow(newX - centerX, 2) + Math.pow(newY - centerY, 2)
            );

            if (distanceFromCenter <= maxDistance) {
              // 원 안에 있을 경우 위치 업데이트
              return {
                ...layer,
                x: newX,
                y: newY,
              };
            } else {
              // 원 밖으로 나가려고 할 경우, 원 경계에 위치 제한
              const angle = Math.atan2(newY - centerY, newX - centerX);
              const constrainedX = centerX + maxDistance * Math.cos(angle);
              const constrainedY = centerY + maxDistance * Math.sin(angle);

              return {
                ...layer,
                x: constrainedX,
                y: constrainedY,
              };
            }
          }
          return layer;
        })
      );

      setTextDragStartPos({ x, y });
    },
    [selectedTextId, textDragStartPos, activeTab, isPenMode]
  );

  // 텍스트 드래그 종료 핸들러
  const handleTextMouseUp = useCallback(() => {
    // 드래그 중인 텍스트 레이어 업데이트
    setTextLayers((prevLayers) =>
      prevLayers.map((layer) => ({
        ...layer,
        isDragging: false,
      }))
    );

    // 선택 상태는 유지 (삭제 등을 위해)
  }, []);

  return (
    <div className="flex flex-col w-full h-full">
      <div
        ref={containerRef}
        className="w-full flex-grow relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        // 터치 이벤트에 대한 기본 동작 방지
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        <canvas
          ref={backgroundCanvasRef}
          className="w-full h-full absolute top-0 left-0"
        />
        <canvas
          ref={themeCanvasRef}
          className="w-full h-full absolute top-0 left-0"
        />
        <canvas
          ref={imageCanvasRef}
          className={`w-full h-full absolute top-0 left-0 select-none touch-none ${
            activeTab === "preset" ? "z-10" : "z-0"
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        <canvas
          ref={textCanvasRef}
          className={`w-full h-full absolute top-0 left-0 select-none touch-none ${
            activeTab === "write" ? "z-10" : "z-0"
          }`}
          onMouseDown={isPenMode ? handlePenStart : handleTextMouseDown}
          onMouseMove={isPenMode ? handlePenMove : handleTextMouseMove}
          onMouseUp={isPenMode ? handlePenEnd : handleTextMouseUp}
          onMouseLeave={isPenMode ? handlePenEnd : handleTextMouseUp}
          onTouchStart={isPenMode ? handlePenStart : handleTextMouseDown}
          onTouchMove={isPenMode ? handlePenMove : handleTextMouseMove}
          onTouchEnd={isPenMode ? handlePenEnd : handleTextMouseUp}
        />
      </div>

      <BottomTap
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        image={uploadedImageLayer?.img || null}
        imageSize={imageSize}
        handleImageUpload={handleImageUpload}
        handleSizeChange={handleSizeChange}
        presetImages={presetImages}
        handlePresetImageSelect={handlePresetImageSelect}
        handleCopyToClipboard={handleCopyToClipboard}
        handleSaveAsImage={handleSaveAsImage}
        selectedLayer={
          selectedLayerId
            ? uploadedImageLayer?.id === selectedLayerId
              ? uploadedImageLayer
              : presetLayers.find((layer) => layer.isSelected)
            : null
        }
        handleSelectedLayerSizeChange={handleSelectedLayerSizeChange}
        handleDeleteSelectedLayer={handleDeleteSelectedLayer}
        handleThemeSelect={handleThemeSelect}
        currentTheme={currentTheme}
        writingText={writingText}
        setWritingText={setWritingText}
        handleTextColorChange={handleTextColorChange}
        handleFontSizeChange={handleFontSizeChange}
        handleAddTextToCanvas={handleAddTextToCanvas}
        textColor={textColor}
        fontSize={fontSize}
        isPenMode={isPenMode}
        setIsPenMode={setIsPenMode}
        penSize={penSize}
        setPenSize={setPenSize}
        clearWriting={clearAllWriting}
      />
    </div>
  );
};

export default Sheet;
