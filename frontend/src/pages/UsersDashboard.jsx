import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../api/userService';
import { useAuth } from '../contexts/AuthContext';
import { FaUserEdit, FaTrashAlt, FaSync, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './UsersDashboard.css';

const UsersDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.getUsers();
      
      if (response.success) {
        setUsers(response.data || []);
      } else {
        setError(response.error || 'Failed to load users');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Network error - could not connect to server');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleViewUser = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  const handleEditUser = (userId) => {
    navigate(`/admin/users/${userId}/edit`);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(userId);
        toast.success('User deleted successfully');
        loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  if (loading) return <div className="loading">Loading users...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="users-dashboard">
      <h1>User Management</h1>
      <p>Total users: {users.length}</p>
      
      <div className="users-grid">
        {users.map(user => (
          <div key={user.id} className="user-card">
            {user.profilePicture && (
              <img 
                src={user.profilePicture} 
                alt={user.displayName}
                className="user-avatar"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            <div className="user-card-header">
              {user.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={user.displayName}
                  className="user-avatar"
                />
              ) : (
                <div className="avatar-placeholder">
                  {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              
              <div className="user-actions">
                <button 
                  className="action-btn view" 
                  onClick={() => handleViewUser(user.id)}
                  title="View User"
                >
                  <FaEye />
                </button>
                <button 
                  className="action-btn edit" 
                  onClick={() => handleEditUser(user.id)}
                  title="Edit User"
                >
                  <FaUserEdit />
                </button>
                <button 
                  className="action-btn delete" 
                  onClick={() => handleDeleteUser(user.id)}
                  title="Delete User"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
            
            <div className="user-info">
              <h3>{user.displayName}</h3>
              <p className="user-email">{user.email}</p>
              
              <div className="user-details">
                <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                  {user.status}
                </span>
                
                {user.role && (
                  <span className={`role-badge ${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                )}
                
                {user.credits !== undefined && (
                  <span className="credits">
                    {user.credits} {user.credits === 1 ? 'credit' : 'credits'}
                  </span>
                )}
              </div>

              {user.bio && (
                <p className="user-bio">{user.bio}</p>
              )}

              {user.location && (
                <p className="user-location">📍 {user.location}</p>
              )}

              <div className="user-stats">
                <small>Member since: {user.memberSince}</small>
                <small>Last login: {user.lastSeen}</small>
                {user.loginCount > 0 && (
                  <small>Logins: {user.loginCount}</small>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && !loading && (
        <div className="empty-state">
          <h3>No users found</h3>
          <p>There are no users in the system yet.</p>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            Previous
          </button>
          
          <span>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          
          <button 
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UsersDashboard;
