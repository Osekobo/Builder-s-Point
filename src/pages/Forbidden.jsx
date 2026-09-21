import { Link } from "react-router-dom";
import { FaLock, FaHouse, FaBagShopping } from "react-icons/fa6";

const Forbidden = () => {
  return (
    <div className="min-h-[70vh] bg-warm flex items-center justify-center py-6 px-4">
      <div className="text-center max-w-md mx-auto bg-white border-4 border-black shadow-hard-lg p-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-terra/10 border-4 border-terra mb-6">
          <FaLock className="w-10 h-10 text-terra" />
        </div>
        <h1 className="font-h text-3xl md:text-4xl font-bold text-black uppercase mb-4">
          Access Forbidden
        </h1>
        <p className="text-ash mb-6">
          You don&apos;t have permission to view this page. If you believe this
          is a mistake, please contact support.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-terra text-white px-6 py-3 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
          >
            <FaHouse className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 bg-white text-black px-6 py-3 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
          >
            <FaBagShopping className="w-4 h-4" />
            Shop
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;