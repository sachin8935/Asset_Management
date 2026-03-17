function LoginForm({
  mode = 'login',
  email,
  password,
  name = '',
  department = '',
  loading,
  onEmailChange,
  onPasswordChange,
  onNameChange,
  onDepartmentChange,
  onSubmit,
}) {
  const isSignup = mode === 'signup'

  return (
    <form className='card auth-card' onSubmit={onSubmit}>
      <h2>{isSignup ? 'Employee Sign Up' : 'Login'}</h2>
      <p className='auth-subtitle'>
        {isSignup
          ? 'Create an Employee account. Admin and IT Manager accounts are login-only.'
          : 'Sign in with your account credentials.'}
      </p>

      {isSignup ? (
        <label>
          Full Name
          <input
            type='text'
            value={name}
            onChange={(event) => onNameChange?.(event.target.value)}
            required
          />
        </label>
      ) : null}

      <label>
        Email
        <input
          type='email'
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          required
        />
      </label>

      <label>
        Password
        <input
          type='password'
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          required
        />
      </label>

      {isSignup ? (
        <>
          <label>
            Department (Optional)
            <input
              type='text'
              value={department}
              onChange={(event) => onDepartmentChange?.(event.target.value)}
            />
          </label>

          <label>
            Role
            <input type='text' value='Employee' disabled />
          </label>
        </>
      ) : null}

      <button type='submit' disabled={loading}>
        {loading ? (isSignup ? 'Creating account...' : 'Logging in...') : isSignup ? 'Create Account' : 'Login'}
      </button>
    </form>
  )
}

export default LoginForm