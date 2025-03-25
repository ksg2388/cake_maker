const Header = () => {
  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[600px] min-w-[320px] w-full h-[52px] bg-white flex justify-between items-center">
      <img
        className="mx-auto aspect-[97/19] h-[36px] mt-[16px]"
        src={"/images/logo.png"}
        alt="logo"
      />
    </header>
  );
};

export default Header;
