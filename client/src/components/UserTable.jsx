function UserTable({
  users,
  currentUserId,
  roleOptions,
  roleDraft,
  onRoleDraftChange,
  onUpdateRole,
}) {
  const styles = {
    wrapper: {
      width: '100%',
      overflowX: 'auto',
    },
    table: {
      width: '100%',
      minWidth: 920,
      borderCollapse: 'collapse',
      tableLayout: 'fixed',
    },
    headCell: {
      padding: '12px 16px',
      textAlign: 'left',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: '#9a928a',
      background: '#faf9f7',
      borderBottom: '1px solid #f0ece6',
      whiteSpace: 'nowrap',
    },
    bodyCell: {
      padding: '12px 16px',
      fontSize: 13,
      color: '#3d332b',
      borderBottom: '1px solid #f8f5f2',
      verticalAlign: 'middle',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    idChip: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 28,
      height: 28,
      padding: '0 8px',
      borderRadius: 8,
      background: '#f5f0eb',
      color: '#6b5f55',
      fontSize: 11,
      fontWeight: 600,
      fontFamily: 'monospace',
    },
    textClamp: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    emailCell: {
      overflowWrap: 'anywhere',
      wordBreak: 'break-word',
      lineHeight: 1.35,
      color: '#4b3f36',
    },
    select: {
      width: '100%',
      minWidth: 130,
      padding: '8px 10px',
      borderRadius: 10,
      border: '1.5px solid #ede9e2',
      background: '#faf9f7',
      fontSize: 13,
      outline: 'none',
    },
    button: {
      width: '100%',
      minWidth: 120,
      padding: '8px 10px',
      borderRadius: 10,
      border: 'none',
      background: 'linear-gradient(135deg, #ff6b35 0%, #e8430f 100%)',
      color: '#fff',
      fontSize: 12.5,
      fontWeight: 700,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    },
    buttonDisabled: {
      opacity: 0.55,
      cursor: 'not-allowed',
    },
  }

  return (
    <div style={styles.wrapper}>
      <table style={styles.table}>
        <colgroup>
          <col style={{ width: '8%' }} />
          <col style={{ width: '18%' }} />
          <col style={{ width: '30%' }} />
          <col style={{ width: '16%' }} />
          <col style={{ width: '14%' }} />
          <col style={{ width: '14%' }} />
        </colgroup>
        <thead>
          <tr>
            <th style={styles.headCell}>ID</th>
            <th style={styles.headCell}>Name</th>
            <th style={styles.headCell}>Email</th>
            <th style={styles.headCell}>Department</th>
            <th style={styles.headCell}>Role</th>
            <th style={styles.headCell}>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const draftRole = roleDraft[user.id] || user.role
            const isSelf = user.id === currentUserId
            const unchanged = draftRole === user.role

            return (
              <tr key={user.id}>
                <td style={styles.bodyCell}><span style={styles.idChip}>{user.id}</span></td>
                <td style={styles.bodyCell}><div style={styles.textClamp}>{user.name}</div></td>
                <td style={{ ...styles.bodyCell, ...styles.emailCell }}>{user.email}</td>
                <td style={styles.bodyCell}><div style={styles.textClamp}>{user.department || '-'}</div></td>
                <td style={styles.bodyCell}>
                  <select
                    style={styles.select}
                    value={draftRole}
                    onChange={(event) => onRoleDraftChange(user.id, event.target.value)}
                    disabled={isSelf}
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={styles.bodyCell}>
                  <button
                    style={{ ...styles.button, ...(isSelf || unchanged ? styles.buttonDisabled : {}) }}
                    onClick={() => onUpdateRole(user.id)}
                    disabled={isSelf || unchanged}
                  >
                    Update Role
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default UserTable