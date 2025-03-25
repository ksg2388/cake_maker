import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="relative mt-[60px] px-[20px]">
      <Link to="/sheet">
        <button
          className="w-full h-[160px] mt-2 px-4 py-2 text-white rounded-lg shadow-md flex items-center justify-center overflow-hidden bg-[#FFC358]"
          style={{
            backgroundImage: "url('/images/cat-heart.png')",
            backgroundSize: "50%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "-50px top",
            perspective: 1000,
          }}
        >
          <span className="font-semibold text-xl text-white ml-12">
            케이크 시트 만들러가기
          </span>
          <span className="ml-3">
            <FiArrowRight className="w-6 h-6 text-white" />
          </span>
        </button>
      </Link>
    </div>
  );
};

export default Home;
