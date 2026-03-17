import { Navigate, NavLink, Route, Routes } from 'react-router-dom'

import { useAuth } from './hooks/useAuth'
import AssetAssignmentPage from './pages/AssetAssignmentPage'
import AssetInventoryPage from './pages/AssetInventoryPage'
import DashboardPage from './pages/DashboardPage'
import EmployeeAssetPage from './pages/EmployeeAssetPage'
import IssueManagementPage from './pages/IssueManagementPage'
import IssueReportingPage from './pages/IssueReportingPage'
import LoginPage from './pages/LoginPage'
import UserManagementPage from './pages/UserManagementPage'
import './styles/admin.css'

function ProtectedRoute({ isAuthenticated, currentUser, allowedRoles, children }) {
  if (!isAuthenticated) return <Navigate to='/login' replace />
  if (allowedRoles && !allowedRoles.includes(currentUser?.role)) {
    return <Navigate to='/my-assets' replace />
  }
  return children
}

function AppShell({ currentUser, onLogout, children }) {
  const canManageAssets = currentUser?.role === 'Admin' || currentUser?.role === 'IT Manager'
  const isAdmin = currentUser?.role === 'Admin'

  return (
    <main className='container'>
      <h1>Asset Management</h1>

      <section className='card'>
        <div className='topbar'>
          <div>
            <strong>{currentUser?.name}</strong> ({currentUser?.role})
          </div>
          <button onClick={onLogout}>Logout</button>
        </div>

        <nav className='tabs'>
          {canManageAssets ? <NavLink to='/dashboard'>Dashboard</NavLink> : null}
          {canManageAssets ? <NavLink to='/assets'>Asset Inventory</NavLink> : null}
          {canManageAssets ? <NavLink to='/assignments'>Asset Assignment</NavLink> : null}
          <NavLink to='/my-assets'>Employee Assets</NavLink>
          <NavLink to='/report-issues'>Issue Reporting</NavLink>
          {canManageAssets ? <NavLink to='/issues'>Issue Management</NavLink> : null}
          {isAdmin ? <NavLink to='/users'>User Management</NavLink> : null}
        </nav>
      </section>

      {children}
    </main>
  )
}

function App() {
  const { token, currentUser, isAuthenticated, loading, login, signup, logout } = useAuth()
  const canManageAssets = currentUser?.role === 'Admin' || currentUser?.role === 'IT Manager'

  const defaultPath = canManageAssets ? '/dashboard' : '/my-assets'

  return (
    <Routes>
      <Route
        path='/login'
        element={
          isAuthenticated ? (
            <Navigate to={defaultPath} replace />
          ) : (
            <LoginPage loading={loading} onLogin={login} onSignup={signup} />
          )
        }
      />

      <Route
        path='*'
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} currentUser={currentUser}>
            <AppShell currentUser={currentUser} onLogout={logout}>
              <Routes>
                <Route path='/' element={<Navigate to={defaultPath} replace />} />

                <Route
                  path='/dashboard'
                  element={
                    <ProtectedRoute
                      isAuthenticated={isAuthenticated}
                      currentUser={currentUser}
                      allowedRoles={['Admin', 'IT Manager']}
                    >
                      <DashboardPage token={token} />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/assets'
                  element={
                    <ProtectedRoute
                      isAuthenticated={isAuthenticated}
                      currentUser={currentUser}
                      allowedRoles={['Admin', 'IT Manager']}
                    >
                      <AssetInventoryPage token={token} />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/assignments'
                  element={
                    <ProtectedRoute
                      isAuthenticated={isAuthenticated}
                      currentUser={currentUser}
                      allowedRoles={['Admin', 'IT Manager']}
                    >
                      <AssetAssignmentPage token={token} />
                    </ProtectedRoute>
                  }
                />

                <Route path='/my-assets' element={<EmployeeAssetPage token={token} />} />
                <Route path='/report-issues' element={<IssueReportingPage token={token} />} />

                <Route
                  path='/issues'
                  element={
                    <ProtectedRoute
                      isAuthenticated={isAuthenticated}
                      currentUser={currentUser}
                      allowedRoles={['Admin', 'IT Manager']}
                    >
                      <IssueManagementPage token={token} />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/users'
                  element={
                    <ProtectedRoute
                      isAuthenticated={isAuthenticated}
                      currentUser={currentUser}
                      allowedRoles={['Admin']}
                    >
                      <UserManagementPage token={token} currentUser={currentUser} />
                    </ProtectedRoute>
                  }
                />

                <Route path='*' element={<Navigate to={defaultPath} replace />} />
              </Routes>
            </AppShell>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
