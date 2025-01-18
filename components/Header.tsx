import { Bell, User } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-white shadow-md p-4 flex justify-around md:justify-between items-center">
      <h1 className="text-xl md:text-2xl font-semibold text-primary">
        Administração
      </h1>
      <div className="flex items-center space-x-4">
        <button className="text-gray-600 hover:text-primary">
          <Bell className="h-5 w-5 md:h-6 md:w-6" />
        </button>
        <button className="text-gray-600 hover:text-primary">
          <User className="h-5 w-5 md:h-6 md:w-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;
