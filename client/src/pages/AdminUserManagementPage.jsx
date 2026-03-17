import { useState } from 'react'

import AssetInventorySection from '../components/AssetInventorySection'
import AssetAssignmentSection from '../components/AssetAssignmentSection'
import DashboardStatsSection from '../components/DashboardStatsSection'
import IssueManagementSection from '../components/IssueManagementSection'
import LoginForm from '../components/LoginForm'
import MaintenanceHistorySection from '../components/MaintenanceHistorySection'
import MyAssignedAssetsSection from '../components/MyAssignedAssetsSection'
import ReportIssueSection from '../components/ReportIssueSection'
import StatusMessage from '../components/StatusMessage'
import UserTable from '../components/UserTable'
import { ROLE_OPTIONS } from '../constants/roles'
import { useAuth } from '../hooks/useAuth'
import { useUserManagement } from '../hooks/useUserManagement'
import '../styles/admin.css'

function AdminUserManagementPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')

  const { token, currentUser, isAuthenticated, isAdmin, loading, login, logout } = useAuth()

  const canManageAssets = currentUser?.role === 'Admin' || currentUser?.role === 'IT Manager'
  const canManageAssignments = canManageAssets

  const {
    users,
    usersLoading,
    roleDraft,
    setRoleDraft,
    updateRole,
    setUsers,
  } = useUserManagement(token, isAdmin)

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      await login({ email, password })
      setMessage('Login successful')
      setEmail('')
      setPassword('')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleLogout = () => {
    logout()
    setUsers([])
    setRoleDraft({})
    setMessage('Logged out')
  }

  const handleRoleUpdate = async (userId) => {
    setError('')
    setMessage('')

    try {
      const data = await updateRole(userId, roleDraft[userId])
      setMessage(`Role updated for ${data.user.name}`)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRoleDraftChange = (userId, role) => {
    setRoleDraft((prev) => ({
      ...prev,
      [userId]: role,
    }))
  }

  return (
    <main className='container'>
      <h1>Admin User Management</h1>

      {!isAuthenticated ? (
        <LoginForm
          email={email}
          password={password}
          loading={loading}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={handleLogin}
        />
      ) : (
        <section className='card'>
          <div className='topbar'>
            <div>
              <strong>{currentUser?.name}</strong> ({currentUser?.role})
            </div>
            <button onClick={handleLogout}>Logout</button>
          </div>

          <>
            <div className='tabs'>
              {isAdmin ? (
                <button
                  className={activeTab === 'users' ? 'tab-active' : ''}
                  onClick={() => setActiveTab('users')}
                >
                  User Management
                </button>
              ) : null}

              {canManageAssets ? (
                <button
                  className={activeTab === 'dashboard' ? 'tab-active' : ''}
                  onClick={() => setActiveTab('dashboard')}
                >
                  Dashboard
                </button>
              ) : null}

              {canManageAssets ? (
                <button
                  className={activeTab === 'assets' ? 'tab-active' : ''}
                  onClick={() => setActiveTab('assets')}
                >
                  Asset Inventory
                </button>
              ) : null}

              {canManageAssets ? (
                <button
                  className={activeTab === 'maintenance' ? 'tab-active' : ''}
                  onClick={() => setActiveTab('maintenance')}
                >
                  Maintenance History
                </button>
              ) : null}

              {canManageAssignments ? (
                <button
                  className={activeTab === 'assignments' ? 'tab-active' : ''}
                  onClick={() => setActiveTab('assignments')}
                >
                  Asset Assignment
                </button>
              ) : null}

              <button
                className={activeTab === 'my-assets' ? 'tab-active' : ''}
                onClick={() => setActiveTab('my-assets')}
              >
                My Assigned Assets
              </button>

              <button
                className={activeTab === 'report-issue' ? 'tab-active' : ''}
                onClick={() => setActiveTab('report-issue')}
              >
                Report Issue
              </button>

              {canManageAssets ? (
                <button
                  className={activeTab === 'issue-management' ? 'tab-active' : ''}
                  onClick={() => setActiveTab('issue-management')}
                >
                  Issue Management
                </button>
              ) : null}
            </div>

            {activeTab === 'users' && isAdmin ? (
              <>
                <h2>All Users</h2>
                {usersLoading ? (
                  <p>Loading users...</p>
                ) : (
                  <UserTable
                    users={users}
                    currentUserId={currentUser?.id}
                    roleOptions={ROLE_OPTIONS}
                    roleDraft={roleDraft}
                    onRoleDraftChange={handleRoleDraftChange}
                    onUpdateRole={handleRoleUpdate}
                  />
                )}
              </>
            ) : null}

            {activeTab === 'dashboard' && canManageAssets ? (
              <DashboardStatsSection token={token} />
            ) : null}

            {activeTab === 'assets' && canManageAssets ? (
              <AssetInventorySection token={token} />
            ) : null}

            {activeTab === 'maintenance' && canManageAssets ? (
              <MaintenanceHistorySection token={token} />
            ) : null}

            {activeTab === 'assignments' && canManageAssignments ? (
              <AssetAssignmentSection token={token} />
            ) : null}

            {activeTab === 'my-assets' ? <MyAssignedAssetsSection token={token} /> : null}

            {activeTab === 'report-issue' ? <ReportIssueSection token={token} /> : null}

            {activeTab === 'issue-management' && canManageAssets ? (
              <IssueManagementSection token={token} />
            ) : null}

            {activeTab === 'users' && !isAdmin ? <p>You do not have access to user management.</p> : null}
            {activeTab === 'dashboard' && !canManageAssets ? <p>You do not have access to dashboard.</p> : null}
            {activeTab === 'assets' && !canManageAssets ? <p>You do not have access to asset management.</p> : null}
            {activeTab === 'maintenance' && !canManageAssets ? (
              <p>You do not have access to maintenance history.</p>
            ) : null}
            {activeTab === 'assignments' && !canManageAssignments ? (
              <p>You do not have access to assignment management.</p>
            ) : null}
            {activeTab === 'issue-management' && !canManageAssets ? (
              <p>You do not have access to issue management.</p>
            ) : null}
          </>
        </section>
      )}

      <StatusMessage type='error' text={error} />
      <StatusMessage type='success' text={message} />
    </main>
  )
}

export default AdminUserManagementPage