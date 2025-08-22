import React from 'react';
import PropTypes from 'prop-types';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import AdminSidebar from '../admin/layout/Sidebar';

const AppLayout = ({ admin = false, onLogout }) => {
  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 ${admin ? 'md:flex-row' : ''}`}>
      {/* Sidebar for Admin */}
      {admin && <AdminSidebar onLogout={onLogout} />}
      
      {/* Main content area */}
      <div className={`flex-1 flex flex-col ${admin ? 'md:pl-64' : ''}`}>
        <main className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
        
        {/* Navbar at the bottom (only for non-admin) */}
        {!admin && <Navbar onLogout={onLogout} />}
      </div>
    </div>
  );
};

AppLayout.propTypes = {
  admin: PropTypes.bool,
  onLogout: PropTypes.func.isRequired
};

export default AppLayout;
