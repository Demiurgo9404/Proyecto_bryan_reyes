import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import DashboardLayout from './DashboardLayout';
import Sidebar from './Sidebar';
import SidePanel from './SidePanel';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface StandardDashboardProps {
  children: ReactNode;
  title: string;
  showLiveButton?: boolean;
  onLiveClick?: () => void;
  onSectionChange?: (section: string) => void;
  userRole?: string;
}

const StandardDashboard: React.FC<StandardDashboardProps> = ({
  children,
  title,
  showLiveButton = false,
  onLiveClick
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state, updateState } = useDashboard();

  const handleSectionChange = (section: string) => {
    if (section === 'transmitir') {
      if (onLiveClick) {
        onLiveClick();
      } else {
        navigate('/live-streaming');
      }
      return;
    }
    
    // Handle panel toggles
    const panelMap: Record<string, keyof typeof state> = {
      'notificaciones': 'showNotificationsPanel',
      'mensajes': 'showMessagesPanel',
      'favoritos': 'showFavoritesPanel',
      'configuracion': 'showConfigPanel'
    };

    if (panelMap[section]) {
      updateState({
        [panelMap[section]]: !state[panelMap[section] as keyof typeof state]
      });
      return;
    }

    // Regular section change
    updateState({ activeSection: section });
  };

  const handleLiveClick = () => {
    navigate('/live-streaming');
  };

  const handlePanelClose = (panelType: string) => {
    const panelMap: Record<string, keyof typeof state> = {
      'notifications': 'showNotificationsPanel',
      'messages': 'showMessagesPanel',
      'favorites': 'showFavoritesPanel',
      'config': 'showConfigPanel'
    };

    if (panelMap[panelType]) {
      updateState({
        [panelMap[panelType]]: false
      });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <DashboardLayout
        title={title}
        showLiveButton={showLiveButton}
        onSectionChange={handleSectionChange}
        onLiveClick={onLiveClick}
        userRole={user?.role}
      >
        <Box sx={{ display: 'flex', flex: 1 }}>
          <Sidebar
            activeSection={state.activeSection}
            onSectionChange={handleSectionChange}
            userRole={user?.role}
          />
          
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              ml: '280px', // Sidebar width
              p: 3,
              backgroundColor: '#f5f5f5',
              minHeight: 'calc(100vh - 64px)', // AppBar height
            }}
          >
            {children}
          </Box>

          {/* Side Panels */}
          <SidePanel
            open={state.showNotificationsPanel}
            onClose={() => handlePanelClose('notifications')}
            type="notifications"
            title="Notificaciones"
          />

          <SidePanel
            open={state.showMessagesPanel}
            onClose={() => handlePanelClose('messages')}
            type="messages"
            title="Mensajes"
          />

          <SidePanel
            open={state.showFavoritesPanel}
            onClose={() => handlePanelClose('favorites')}
            type="favorites"
            title="Favoritos"
          />

          <SidePanel
            open={state.showConfigPanel}
            onClose={() => handlePanelClose('config')}
            type="config"
            title="Configuración"
          />
        </Box>
      </DashboardLayout>
    </Box>
  );
};

export default StandardDashboard;
