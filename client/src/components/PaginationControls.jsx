function PaginationControls({ pagination, onPageChange }) {
  if (!pagination || pagination.pages <= 1) return null

  const { page, pages, has_prev, has_next } = pagination

  return (
    <div className='pagination-controls'>
      <button type='button' onClick={() => onPageChange(page - 1)} disabled={!has_prev}>
        Previous
      </button>
      <span>
        Page {page} of {pages} ({pagination.total} total)
      </span>
      <button type='button' onClick={() => onPageChange(page + 1)} disabled={!has_next}>
        Next
      </button>
    </div>
  )
}

export default PaginationControls
