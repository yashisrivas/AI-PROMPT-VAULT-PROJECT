import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { publicAxios } from '../api/axiosInstance'
import { getPublicCollection } from '../api/collectionService'
import Navbar from '../components/Navbar'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorAlert from '../components/ErrorAlert'
import PromptCard from '../components/PromptCard'

export default function CollectionViewer() {
    const { id } = useParams()
    const [collection, setCollection] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchCollection()
    }, [id])

    const fetchCollection = async () => {
        setLoading(true)
        setError('')
        try {
            const data = await getPublicCollection(publicAxios, id)
            setCollection(data)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load public collection. It may be private or deleted.')
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="min-h-screen pt-20"><Navbar /><LoadingSpinner message="Loading Collection..." /></div>
    if (error) return <div className="min-h-screen pt-20"><Navbar /><div className="max-w-3xl mx-auto px-4"><ErrorAlert message={error} onDismiss={() => setError('')}/></div></div>
    if (!collection) return null

    return (
        <div className="min-h-screen bg-gray-950 pb-20">
            <Navbar />
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-10 bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
                            Public Collection
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-3">{collection.name}</h1>
                    <p className="text-gray-400 text-lg mb-6 max-w-2xl">{collection.description || 'No description provided.'}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                        <div className="flex items-center gap-1.5">
                            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Curated by <Link to={`/profile/${collection.creatorUsername}`} className="text-violet-400 hover:underline">@{collection.creatorUsername}</Link>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>
                        <div>{collection.prompts?.length || 0} Prompts</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {collection.prompts && collection.prompts.length > 0 ? (
                        collection.prompts.map(p => (
                            <div key={p.id || p._id} className="h-full flex">
                                <PromptCard prompt={p} />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 border border-gray-800 rounded-3xl bg-gray-900/50">
                            <p className="text-gray-400">This collection is empty.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
