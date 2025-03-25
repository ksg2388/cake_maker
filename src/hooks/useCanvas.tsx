import React, { useRef } from "react";

const useCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 캔버스 컴포넌트 생성
  const Canvas = ({
    id,
    className,
    zIndex = 0,
    isInteractive = false,
    ...props
  }: React.CanvasHTMLAttributes<HTMLCanvasElement> & {
    id?: string;
    className?: string;
    zIndex?: number;
    isInteractive?: boolean;
  }) => {
    // 인터랙티브 캔버스에 대한 추가 클래스
    const interactiveClass = isInteractive ? "select-none touch-none" : "";
    const fullClassName = `${className} ${interactiveClass}`.trim();

    return (
      <canvas
        ref={canvasRef}
        id={id}
        className={fullClassName}
        style={{ zIndex }}
        {...props}
      />
    );
  };

  return {
    canvasRef,
    Canvas,
  };
};

export default useCanvas;
