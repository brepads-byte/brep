
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Users, UserCircle, LogOut,Contact,Activity } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const navItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'System Usage', path: '/admin/usage', icon: Activity , role : 'super_admin' },
  { name: 'Projects', path: '/admin/projects', icon: Briefcase },
  { name: 'Team', path: '/admin/team', icon: Contact },
  { name: 'Admins', path: '/admin/admins', icon: Users, role: 'super_admin' },
  { name: 'Profile', path: '/admin/profile', icon: UserCircle },
];

const Sidebar: React.FC<{ isOpen: boolean; setIsOpen: (isOpen: boolean) => void; }> = ({ isOpen }) => {
  const { admin, logout } = useAuth();

  const baseLinkClass = 'flex items-center p-3 my-1 rounded-lg transition-colors duration-200 hover:bg-gray-200';
  const activeLinkClass = 'bg-admin-accent text-white';
  
  const iconClasses = `h-5 w-5 ${isOpen ? 'mr-3' : 'mx-auto'}`;
  
  const labelVariant = {
    hidden: { opacity: 0, width: 0, x: -10 },
    visible: { opacity: 1, width: 'auto', x: 0, transition: { duration: 0.2, delay: 0.1 } },
  };

  const sidebarVariants = {
    open: { width: 256 },
    closed: { width: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          variants={sidebarVariants}
          initial="closed"
          animate="open"
          exit="closed"
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="bg-brand-white border-r border-gray-200 flex flex-col h-full overflow-hidden"
        >
          <div className="flex flex-col flex-grow p-4">
            <div className="flex items-center mb-8 px-3">
               <motion.h1 
                variants={labelVariant}
                initial="hidden"
                animate="visible"
                className="text-xl font-bold tracking-wider whitespace-nowrap"
               >
                 BREP ADMIN
               </motion.h1>
            </div>
            <nav className="flex-grow">
              {navItems.map(item =>
                (!item.role || (admin && admin.role === item.role)) && (
                  <NavLink
                    to={item.path}
                    key={item.name}
                    end={item.path === '/admin'}
                    className={({ isActive }) => clsx(baseLinkClass, isActive && activeLinkClass)}
                  >
                    <item.icon className={iconClasses} />
                    <motion.span variants={labelVariant} initial="hidden" animate="visible" className="whitespace-nowrap">
                      {item.name}
                    </motion.span>
                  </NavLink>
                )
              )}
            </nav>
            <div>
              <button onClick={logout} className="flex items-center p-3 my-1 w-full rounded-lg text-red-500 hover:bg-red-50 transition-colors duration-200">
                <LogOut className={iconClasses} />
                 <motion.span variants={labelVariant} initial="hidden" animate="visible" className="whitespace-nowrap">
                  Logout
                </motion.span>
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
