import IssueManagementSection from '../components/IssueManagementSection'

function IssueManagementPage({ token }) {
  return (
    <section className='card'>
      <IssueManagementSection token={token} />
    </section>
  )
}

export default IssueManagementPage
