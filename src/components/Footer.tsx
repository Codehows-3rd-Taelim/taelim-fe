import { FaInstagram, FaStore, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full bg-[#333D51] py-6 px-3">
      <div className="max-w-full mx-auto flex flex-col items-center gap-2 text-center">
        <div className="w-full max-w-[1200px] flex flex-col md:flex-row justify-center items-center md:items-start gap-4 text-center md:text-left">
          {/* 왼쪽: 고객센터 */}
          <div className=" text-center md:text-left text-white">
            <div className="font-semibold mb-1 text-l">고객센터</div>
            <div>TEL : 010-2089-8170</div>
            <div>E-mail : inustree@naver.com</div>
          </div>

          {/* 오른쪽: SNS 아이콘 */}
          <div className=" mt-5 flex gap-8 text-3xl items-center ">
            <a
              href="https://www.instagram.com/inustree/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram className="text-white hover:text-red-600" />
            </a>

            <a
              href="https://www.youtube.com/@inustree5216"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaYoutube className="text-white hover:text-red-600" />
            </a>

            <a
              href="https://inustree-robotics.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaStore className="text-white hover:text-red-600" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
