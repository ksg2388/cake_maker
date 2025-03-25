import { useCallback, useEffect } from "react";
import useCanvas from "../../../hooks/useCanvas";
import useCakeSheetStore from "../../../stores/useSheet";

const BackgorundCanvas = () => {
  const { currentTheme, themeImages } = useCakeSheetStore();

  const { canvasRef, Canvas } = useCanvas();

  // 테마 캔버스 그리기 함수 수정
  const drawThemeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    console.log("그리기");

    // 캔버스 크기를 컨테이너 크기에 맞게 설정
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    } else {
      // 컨테이너가 없는 경우 기본값 설정
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    const context = canvas.getContext("2d");
    if (!context) return;

    // 캔버스 초기화
    context.clearRect(0, 0, canvas.width, canvas.height);

    // 테마가 선택되지 않았으면 그리지 않음
    if (currentTheme === -1) return;

    const themeImg = themeImages[currentTheme];

    // 케이크 원의 중심과 반지름 계산
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2.5;

    // 테두리에 이미지 배치 (살짝 안쪽으로 조정)
    const itemCount = 12; // 테두리에 배치할 아이템 수
    const itemSize = radius * 0.25; // 아이템 크기
    const insetFactor = 0.83; // 안쪽으로 조정할 비율 (1보다 작을수록 더 안쪽)

    const img = new Image();
    img.src = themeImg;

    for (let i = 0; i < itemCount; i++) {
      const angle = (i / itemCount) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius * insetFactor;
      const y = centerY + Math.sin(angle) * radius * insetFactor;

      // 이미지 그리기
      context.save();
      context.translate(x, y);
      context.rotate(angle + Math.PI / 2); // 이미지가 원의 중심을 향하도록 회전
      context.drawImage(img, -itemSize / 2, -itemSize / 2, itemSize, itemSize);
      context.restore();
    }
  }, [canvasRef, currentTheme, themeImages]);

  useEffect(() => {
    drawThemeCanvas();
  }, [drawThemeCanvas]);

  return <Canvas className="w-full h-full absolute top-0 left-0 z-[1]" />;
};

export default BackgorundCanvas;
