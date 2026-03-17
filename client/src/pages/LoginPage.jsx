import { useState } from 'react'

import LoginForm from '../components/LoginForm'
import StatusMessage from '../components/StatusMessage'

function LoginPage({ loading, onLogin, onSignup }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [department, setDepartment] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      if (mode === 'login') {
        await onLogin({ email, password })
        setMessage('Login successful')
      } else {
        await onSignup({ name, email, password, department })
        setMessage('Account created. Please login.')
        setMode('login')
        setName('')
        setDepartment('')
      }
      setEmail('')
      setPassword('')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className='container auth-shell'>
      <section className='auth-panel'>
        <h1>Asset Management</h1>
        <p>Secure access for Admin, IT Manager, and Employee workflows.</p>
        <ul>
          <li>Admin: Login only</li>
          <li>IT Manager: Login only (created by Admin)</li>
          <li>Employee: Login or Signup</li>
        </ul>
      </section>

      <section>
        <div className='auth-toggle'>
          <button
            type='button'
            className={mode === 'login' ? 'tab-active' : ''}
            onClick={() => {
              setMode('login')
              setError('')
              setMessage('')
            }}
          >
            Login
          </button>
          <button
            type='button'
            className={mode === 'signup' ? 'tab-active' : ''}
            onClick={() => {
              setMode('signup')
              setError('')
              setMessage('')
            }}
          >
            Employee Signup
          </button>
        </div>

      <LoginForm
        mode={mode}
        name={name}
        email={email}
        password={password}
        department={department}
        loading={loading}
        onNameChange={setName}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onDepartmentChange={setDepartment}
        onSubmit={handleSubmit}
      />
      </section>

      <StatusMessage type='error' text={error} />
      <StatusMessage type='success' text={message} />
    </main>
  )
}

export default LoginPage
