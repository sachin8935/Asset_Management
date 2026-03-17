import { useEffect, useState } from 'react'

import { fetchDashboardStats } from '../services/dashboardService'

function StatCard({ label, value }) {
  return (
    <div className='stat-card'>
      <p className='stat-label'>{label}</p>
      <p className='stat-value'>{value}</p>
    </div>
  )
}

export default function DashboardStatsSection({ token }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadStats = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await fetchDashboardStats(token)
        if (isMounted) setStats(data.stats)
      } catch (err) {
        if (isMounted) setError(err.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadStats()
    return () => {
      isMounted = false
    }
  }, [token])

  if (loading) return <p>Loading dashboard...</p>
  if (error) return <p className='error'>{error}</p>
  if (!stats) return null

  return (
    <div>
      <h2>Dashboard</h2>
      <div className='stats-grid'>
        <StatCard label='Total Assets' value={stats.total_assets} />
        <StatCard label='Assigned' value={stats.assigned_assets} />
        <StatCard label='Available' value={stats.available_assets} />
        <StatCard label='Maintenance' value={stats.assets_under_maintenance} />
        <StatCard label='Open Issues' value={stats.open_issues} />
      </div>
    </div>
  )
}
