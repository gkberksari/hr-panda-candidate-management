import React from 'react';
import { Users, Briefcase, Calendar, FileText, BarChart2, Settings, X } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../utils/cn';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onOpenChange }) => {
  const menuItems = [
    { icon: <Users className="h-5 w-5" />, label: 'Candidates', active: true },
    { icon: <Briefcase className="h-5 w-5" />, label: 'Jobs', active: false },
    { icon: <Calendar className="h-5 w-5" />, label: 'Calendar', active: false },
    { icon: <FileText className="h-5 w-5" />, label: 'Documents', active: false },
    { icon: <BarChart2 className="h-5 w-5" />, label: 'Reports', active: false },
    { icon: <Settings className="h-5 w-5" />, label: 'Settings', active: false },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-50 md:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-gray-200 md:relative md:z-0 transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold">
              HR
            </div>
            <span className="text-xl font-semibold">HRPanda</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-gray-700 font-normal h-10",
                    item.active && "bg-gray-100 font-medium"
                  )}
                >
                  {React.cloneElement(item.icon, {
                    className: cn(
                      item.icon.props.className,
                      item.active ? "text-blue-600" : "text-gray-500"
                    )
                  })}
                  <span className="ml-3">{item.label}</span>
                </Button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder-avatar.jpg" alt="Admin" />
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">Admin User</div>
              <div className="text-sm text-gray-500">admin@example.com</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;