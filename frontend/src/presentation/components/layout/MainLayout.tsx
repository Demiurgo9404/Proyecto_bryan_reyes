import React from 'react';
import { Outlet } from 'react-router-dom';
import styled from '@emotion/styled';
import Navbar from './Navbar';
import { useAuth } from '../../contexts/AuthContext';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8fafc;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 1rem;
  padding-bottom: 5rem; /* Space for the fixed navbar */
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  
  @media (min-width: 768px) {
    padding: 1.5rem;
    padding-bottom: 5.5rem;
  }
`;

/**
 * Main layout component that includes the Navbar and content area
 */
const MainLayout: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      // The AuthProvider will handle the redirect to login
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <LayoutContainer>
      <MainContent>
        <Outlet />
      </MainContent>
      <Navbar onLogout={handleLogout} />
    </LayoutContainer>
  );
};

export default MainLayout;
