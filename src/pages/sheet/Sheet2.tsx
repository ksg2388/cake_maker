import BackgorundCanvas from "./components/BackgorundCanvas";
import BottomTap2 from "./components/BottomTap2";
import ThemeCanvas from "./components/ThemeCanvas";

const Sheet2 = () => {
  return (
    <div className="flex flex-col w-full h-full">
      <div className="w-full flex-grow relative">
        <BackgorundCanvas />
        <ThemeCanvas />
      </div>
      <BottomTap2 />
    </div>
  );
};

export default Sheet2;
