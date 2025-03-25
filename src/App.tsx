import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./pages/header/Header";
import Home from "./pages/home/Home";
import Sheet from "./pages/sheet/Sheet";
import Sheet2 from "./pages/sheet/Sheet2";

function App() {
  return (
    <Router>
      <div className="relative min-w-[320px] max-w-[600px] w-full mx-auto h-[100dvh] bg-white pt-[52px] overflow-hidden">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sheet" element={<Sheet />} />
          <Route path="/sheet2" element={<Sheet2 />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
