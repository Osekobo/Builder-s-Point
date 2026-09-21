import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import useCartStore from "../../store/cartStore";
import {
  FaCartShopping,
  FaUser,
  FaArrowRightFromBracket,
  FaChevronDown,
  FaTableCellsLarge,
  FaCirclePlus,
  FaList,
  FaBagShopping,
  
  FaHouse,
  FaCube,
  FaBars,
  FaXmark,
  FaMagnifyingGlass,
} from "react-icons/fa6";
import { useState, useEffect, useRef } from "react";

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const navigate = useNavigate();
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        isMobileMenuOpen
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const term = searchInput.trim();
    setSearchInput("");
    setIsMobileMenuOpen(false);
    if (term) {
      navigate(`/products?search=${encodeURIComponent(term)}`);
    } else {
      navigate("/products");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-white border-b-4 border-black sticky top-0 z-50">
        <div className="mx-auto w-full max-w-[1600px] px-4">
          <div className="flex justify-between items-center h-16">
            
            <Link
              to="/"
              className="font-h text-2xl font-bold text-terra flex items-center space-x-2 shrink-0"
            >
              <FaCube className="w-6 h-6" />
              <span className="hidden sm:inline">Kione Hardware</span>
              <span className="sm:hidden">KH</span>
            </Link>

            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex flex-1 max-w-xl mx-6"
            >
              <div className="relative w-full">
                <FaMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ash w-5 h-5" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra text-sm"
                />
              </div>
            </form>

            
            <div className="hidden md:flex items-center space-x-6">
              
              <Link
                to="/"
                className="text-black hover:text-terra font-semibold flex items-center space-x-1 transition-colors"
              >
                <FaHouse className="w-4 h-4" />
                <span>Home</span>
              </Link>

              
              <Link
                to="/products"
                className="text-black hover:text-terra font-semibold transition-colors"
              >
                Products
              </Link>

              
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-1 text-black hover:text-terra font-semibold focus:outline-none transition-colors"
                  >
                    <FaUser className="w-5 h-5" />
                    <span>Account</span>
                    <FaChevronDown
                      className={`w-4 h-4 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isUserMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsUserMenuOpen(false)}
                      ></div>
                      <div className="absolute top-full right-0 mt-2 w-64 bg-white border-4 border-black shadow-hard-sm py-2 z-50">
                        <Link
                          to="/account"
                          className="block px-4 py-2 text-black hover:bg-terra/10 hover:text-terra transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="flex items-center space-x-2">
                            <FaUser className="w-4 h-4" />
                            <span>My Account</span>
                          </div>
                        </Link>
                        <Link
                          to="/orders"
                          className="block px-4 py-2 text-black hover:bg-terra/10 hover:text-terra transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="flex items-center space-x-2">
                            <FaBagShopping className="w-4 h-4" />
                            <span>My Orders</span>
                          </div>
                        </Link>
                        <hr className="my-1 border-black" />
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            handleLogout();
                          }}
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center space-x-2 transition-colors"
                        >
                          <FaArrowRightFromBracket className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              
              {user?.is_admin && (
                <div className="relative">
                  <button
                    onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                    className="flex items-center space-x-1 text-black hover:text-terra font-semibold focus:outline-none transition-colors"
                  >
                    <FaTableCellsLarge className="w-5 h-5" />
                    <span>Admin</span>
                    <FaChevronDown
                      className={`w-4 h-4 transition-transform ${isAdminMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isAdminMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsAdminMenuOpen(false)}
                      ></div>
                      <div className="absolute top-full right-0 mt-2 w-64 bg-white border-4 border-black shadow-hard-sm py-2 z-50">
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-black hover:bg-terra/10 hover:text-terra transition-colors"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center space-x-2">
                            <FaTableCellsLarge className="w-4 h-4" />
                            <span>Dashboard</span>
                          </div>
                        </Link>
                        <hr className="my-1 border-black" />
                        <Link
                          to="/admin/add-product"
                          className="block px-4 py-2 text-black hover:bg-terra/10 hover:text-terra transition-colors"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center space-x-2">
                            <FaCirclePlus className="w-4 h-4" />
                            <span>Add New Product</span>
                          </div>
                        </Link>
                        <Link
                          to="/admin/products"
                          className="block px-4 py-2 text-black hover:bg-terra/10 hover:text-terra transition-colors"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center space-x-2">
                            <FaList className="w-4 h-4" />
                            <span>Manage Products</span>
                          </div>
                        </Link>
                        <hr className="my-1 border-black" />
                        <Link
                          to="/orders"
                          className="block px-4 py-2 text-black hover:bg-terra/10 hover:text-terra transition-colors"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <div className="flex items-center space-x-2">
                            <FaBagShopping className="w-4 h-4" />
                            <span>All Orders</span>
                          </div>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}

              
              <>
                <Link to="/cart" className="relative">
                  <FaCartShopping className="w-6 h-6 text-black hover:text-terra transition-colors" />
                  {items.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-terra text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border border-black">
                      {items.length}
                    </span>
                  )}
                </Link>
              </>

              
              {!user && (
                <div className="space-x-4">
                  <Link
                    to="/login"
                    className="text-black hover:text-terra font-semibold transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-terra text-white px-4 py-2 border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            
            <div className="flex items-center space-x-4 md:hidden">
              
              <>
                <Link to="/cart" className="relative">
                  <FaCartShopping className="w-6 h-6 text-black hover:text-terra transition-colors" />
                  {items.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-terra text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border border-black">
                      {items.length}
                    </span>
                  )}
                </Link>
              </>

              
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 border-2 border-black hover:bg-terra/10 transition-colors"
                aria-label="Open menu"
              >
                <FaBars className="w-6 h-6" />
              </button>
            </div>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="md:hidden pb-3"
          >
            <div className="relative">
              <FaMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ash w-5 h-5" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra text-sm"
              />
            </div>
          </form>
        </div>
      </nav>

      
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          isMobileMenuOpen ? "visible" : "invisible"
        }`}
      >
        
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isMobileMenuOpen ? "opacity-50" : "opacity-0"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>

        
        <div
          ref={mobileMenuRef}
          className={`absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white border-l-4 border-black shadow-hard-sm transition-transform duration-300 transform ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          
          <div className="flex justify-between items-center p-4 border-b-4 border-black">
            <span className="font-h text-xl font-bold text-terra">Menu</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 border-2 border-black hover:bg-terra/10 transition-colors"
              aria-label="Close menu"
            >
<FaXmark className="w-6 h-6" />
            </button>
          </div>

          <div className="p-4 space-y-1 overflow-y-auto h-[calc(100%-65px)]">
            
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 text-black border-2 border-transparent hover:bg-terra/10 hover:text-terra hover:border-terra transition-all"
            >
              <FaHouse className="w-5 h-5" />
              <span className="font-semibold">Home</span>
            </Link>

            
            <Link
              to="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 text-black border-2 border-transparent hover:bg-terra/10 hover:text-terra hover:border-terra transition-all"
            >
              <FaCube className="w-5 h-5" />
              <span className="font-semibold">Products</span>
            </Link>

            {user && (
              <>
                
                <Link
                  to="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-black border-2 border-transparent hover:bg-terra/10 hover:text-terra hover:border-terra transition-all"
                >
                  <FaUser className="w-5 h-5" />
                  <span className="font-semibold">My Account</span>
                </Link>

                
                <Link
                  to="/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-black border-2 border-transparent hover:bg-terra/10 hover:text-terra hover:border-terra transition-all"
                >
                  <FaBagShopping className="w-5 h-5" />
                  <span className="font-semibold">My Orders</span>
                </Link>

                <hr className="my-2 border-black" />

                {user.is_admin && (
                  <>
                    
                    <div className="px-4 py-2 text-xs font-semibold text-ash uppercase tracking-wider">
                      Admin
                    </div>

                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-black border-2 border-transparent hover:bg-terra/10 hover:text-terra hover:border-terra transition-all"
                    >
                      <FaTableCellsLarge className="w-5 h-5" />
                      <span className="font-semibold">Dashboard</span>
                    </Link>

                    <Link
                      to="/admin/add-product"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-black border-2 border-transparent hover:bg-terra/10 hover:text-terra hover:border-terra transition-all"
                    >
                      <FaCirclePlus className="w-5 h-5" />
                      <span className="font-semibold">Add Product</span>
                    </Link>

                    <Link
                      to="/admin/products"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-black border-2 border-transparent hover:bg-terra/10 hover:text-terra hover:border-terra transition-all"
                    >
                      <FaList className="w-5 h-5" />
                      <span className="font-semibold">Manage Products</span>
                    </Link>
                  </>
                )}

                <hr className="my-2 border-black" />

                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 border-2 border-transparent hover:bg-red-50 hover:border-red-600 transition-all"
                >
                  <FaArrowRightFromBracket className="w-5 h-5" />
                  <span className="font-semibold">Logout</span>
                </button>
              </>
            )}

            {!user && (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-black border-2 border-transparent hover:bg-terra/10 hover:text-terra hover:border-terra transition-all"
                >
                  <FaUser className="w-5 h-5" />
                  <span className="font-semibold">Login</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center space-x-3 px-4 py-3 bg-terra text-white border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                >
                  <span className="font-semibold">Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
