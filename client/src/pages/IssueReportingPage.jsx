import ReportIssueSection from '../components/ReportIssueSection'

function IssueReportingPage({ token }) {
  return (
    <section className='card'>
      <ReportIssueSection token={token} />
    </section>
  )
}

export default IssueReportingPage
