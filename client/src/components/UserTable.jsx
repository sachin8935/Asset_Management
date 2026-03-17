function UserTable({
  users,
  currentUserId,
  roleOptions,
  roleDraft,
  onRoleDraftChange,
  onUpdateRole,
}) {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Department</th>
          <th>Role</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => {
          const draftRole = roleDraft[user.id] || user.role
          const isSelf = user.id === currentUserId
          const unchanged = draftRole === user.role

          return (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.department || '-'}</td>
              <td>
                <select
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
              <td>
                <button
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
  )
}

export default UserTable