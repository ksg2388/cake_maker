import { create } from "zustand";

interface CakeSheetState {
  currentTheme: number;
  themeImages: string[];
  activeTab: "preset" | "theme" | "write";
  setCurrentTheme: (theme: number) => void;
  setActiveTab: (tab: "preset" | "theme" | "write") => void;
}

const useCakeSheetStore = create<CakeSheetState>((set) => ({
  currentTheme: -1,
  themeImages: ["/images/star.png", "/images/flower.png"],
  activeTab: "preset",
  setCurrentTheme: (theme) => set({ currentTheme: theme }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));

export default useCakeSheetStore;
