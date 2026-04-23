import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorAlert from '../components/ErrorAlert'
import { getPrompts } from '../api/promptService'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line
} from 'recharts'

export default function Analytics() {
    const { auth } = useAuth()
    const [prompts, setPrompts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (auth) fetchData()
    }, [auth])

    const fetchData = async () => {
        setLoading(true)
        try {
            const data = await getPrompts(auth.authAxios)
            setPrompts(Array.isArray(data) ? data : [])
        } catch (err) {
            setError(err.message || 'Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    if (!auth) return <div className="min-h-screen text-center pt-20"><Navbar /><h2>Sign in to view analytics</h2></div>

    const totalViews = prompts.reduce((acc, p) => acc + (p.viewCount || 0), 0)
    const totalLikes = prompts.reduce((acc, p) => acc + (p.likeCount || 0), 0)
    const totalPrompts = prompts.length

    const chartData = prompts.map(p => ({
        name: p.title || 'Untitled',
        views: p.viewCount || 0,
        likes: p.likeCount || 0
    })).sort((a, b) => b.views - a.views).slice(0, 15) // top 15

    return (
        <div className="min-h-screen bg-gray-950 pb-20">
            <Navbar />
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-white mb-2">Creator Analytics</h1>
                    <p className="text-gray-400">Track the performance and reach of your prompts.</p>
                </div>

                {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

                {loading ? <LoadingSpinner message="Crunching numbers..." /> : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
                                <p className="text-sm font-medium text-gray-400 mb-1">Total Impressions</p>
                                <p className="text-4xl font-bold text-violet-400">{totalViews}</p>
                            </div>
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
                                <p className="text-sm font-medium text-gray-400 mb-1">Total Likes</p>
                                <p className="text-4xl font-bold text-pink-400">{totalLikes}</p>
                            </div>
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
                                <p className="text-sm font-medium text-gray-400 mb-1">Total Prompts</p>
                                <p className="text-4xl font-bold text-blue-400">{totalPrompts}</p>
                            </div>
                        </div>

                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
                            <h3 className="text-lg font-bold text-white mb-6">Top Performing Prompts</h3>
                            {prompts.length === 0 ? (
                                <p className="text-gray-500 text-center py-10">You haven't created any prompts to track yet.</p>
                            ) : (
                                <div className="h-96 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={chartData}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                            <XAxis dataKey="name" stroke="#9CA3AF" tick={{fill: '#9CA3AF', fontSize: 12}} />
                                            <YAxis stroke="#9CA3AF" tick={{fill: '#9CA3AF'}} />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }} 
                                                itemStyle={{ color: '#fff' }} 
                                            />
                                            <Legend />
                                            <Bar dataKey="views" fill="#8B5CF6" name="Views" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="likes" fill="#EC4899" name="Likes" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}
