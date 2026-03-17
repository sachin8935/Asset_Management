import DashboardStatsSection from '../components/DashboardStatsSection'

function DashboardPage({ token }) {
  return (
    <section className='card'>
      <DashboardStatsSection token={token} />
    </section>
  )
}

export default DashboardPage
