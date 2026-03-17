function StatusMessage({ type, text }) {
  if (!text) return null

  return <p className={type === 'error' ? 'error' : 'message'}>{text}</p>
}

export default StatusMessage