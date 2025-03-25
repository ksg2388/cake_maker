import { useCallback, useEffect } from "react";
import useCanvas from "../../../hooks/useCanvas";

const BackgorundCanvas = () => {
  const { canvasRef: backgroundRef, Canvas: BackgroundCanvas } = useCanvas();

  // 배경 캔버스 그리기 함수
  const drawBackgroundCanvas = useCallback(() => {
    const canvas = backgroundRef.current;
    if (!canvas) return;

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

    // 케이크 테두리 그리기
    context.beginPath();
    context.arc(
      canvas.width / 2,
      canvas.height / 2,
      Math.min(canvas.width, canvas.height) / 2.5, // 원이 찌그러지지 않도록 최소값 사용
      0,
      Math.PI * 2,
      false
    );
    context.fillStyle = "white";
    context.fill();
    context.strokeStyle = "black";
    context.lineWidth = 2;
    context.stroke();
  }, [backgroundRef]);

  // 캔버스 초기화 및 리사이즈 이벤트 처리
  useEffect(() => {
    drawBackgroundCanvas();

    // 화면 크기 변경 시 캔버스 다시 그리기
    const handleResize = () => {
      drawBackgroundCanvas();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [drawBackgroundCanvas]);

  return (
    <BackgroundCanvas className="w-full h-full absolute top-0 left-0 z-[0]" />
  );
};

export default BackgorundCanvas;
