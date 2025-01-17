import { Bell, User } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-2xl font-semibold text-primary">Administração</h1>
      <div className="flex items-center space-x-4">
        <button className="text-gray-600 hover:text-primary">
          <Bell className="h-6 w-6" />
        </button>
        <button className="text-gray-600 hover:text-primary">
          <User className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;
