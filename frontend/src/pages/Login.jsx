import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { verifyLogin } from '../api/authService'
import ErrorAlert from '../components/ErrorAlert'

export default function Login() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [form, setForm] = useState({ username: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await verifyLogin(form.username, form.password)
            login(form.username, form.password)
            navigate('/dashboard')
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Invalid username or password.')
            } else {
                setError(err.response?.data?.message || err.message || 'Login failed.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md relative">
                {/* Background decorative orbs */}
                <div className="absolute -top-20 -left-20 w-44 h-44 bg-violet-600/30 rounded-full blur-[80px]"></div>
                <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-fuchsia-600/20 rounded-full blur-[80px]"></div>

                {/* Logo / heading */}
                <div className="relative text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 mb-6 shadow-2xl shadow-violet-900/40 transform -rotate-6">
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">AI Prompt Vault</h1>
                    <p className="text-gray-400 font-medium">Your creative engine, secured.</p>
                </div>

                <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden">
                    {/* Subtle inner glow */}
                    <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    
                    {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Username</label>
                            <input
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                required
                                placeholder="Enter username"
                                autoComplete="username"
                                className="w-full px-5 py-3.5 rounded-2xl bg-black/40 border border-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
                            <input
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                                autoComplete="current-password"
                                className="w-full px-5 py-3.5 rounded-2xl bg-black/40 border border-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl shadow-violet-900/40 overflow-hidden"
                        >
                            <span className="relative z-10">{loading ? 'Verifying...' : 'Sign In'}</span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-400 mt-8">
                        New here?{' '}
                        <Link to="/signup" className="text-violet-400 hover:text-fuchsia-400 font-bold transition-colors">
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
