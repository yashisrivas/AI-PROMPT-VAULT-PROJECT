import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMyCollections, createCollection, deleteCollection, toggleCollectionVisibility } from '../api/collectionService'
import Navbar from '../components/Navbar'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorAlert from '../components/ErrorAlert'

export default function Collections() {
    const { auth } = useAuth()
    const [collections, setCollections] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    
    // Modal states
    const [showModal, setShowModal] = useState(false)
    const [newTitle, setNewTitle] = useState('')
    const [newDesc, setNewDesc] = useState('')
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        if (auth) fetchCollections()
    }, [auth])

    const fetchCollections = async () => {
        setLoading(true)
        setError('')
        try {
            const data = await getMyCollections(auth.authAxios)
            setCollections(Array.isArray(data) ? data : [])
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load collections.')
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        if (!newTitle.trim()) return
        setCreating(true)
        try {
            await createCollection(auth.authAxios, newTitle, newDesc)
            setNewTitle('')
            setNewDesc('')
            setShowModal(false)
            fetchCollections()
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create collection.')
        } finally {
            setCreating(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this collection?')) return;
        try {
            await deleteCollection(auth.authAxios, id)
            setCollections(prev => prev.filter(c => c.id !== id))
        } catch (err) {
            setError('Failed to delete collection.')
        }
    }

    const handleToggleVisibility = async (id) => {
        try {
            const updated = await toggleCollectionVisibility(auth.authAxios, id)
            setCollections(prev => prev.map(c => c.id === id ? updated : c))
        } catch (err) {
            setError('Failed to update visibility.')
        }
    }

    const copyToClipboard = (id) => {
        const url = `${window.location.origin}/c/${id}`
        navigator.clipboard.writeText(url)
        alert('Public link copied to clipboard!')
    }

    if (!auth) return <div className="min-h-screen pt-20 text-center"><Navbar /><h2 className="mt-10">Sign in to view your collections</h2></div>

    return (
        <div className="min-h-screen bg-gray-950 pb-20">
            <Navbar />
            
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">My Collections</h1>
                        <p className="text-gray-400">Organize and manage your grouped prompts.</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-5 py-2.5 rounded-xl font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-900/40 transition-all"
                    >
                        + Folders
                    </button>
                </div>

                {error && <div className="mb-6"><ErrorAlert message={error} onDismiss={() => setError('')} /></div>}

                {loading ? (
                    <LoadingSpinner message="Fetching collections..." />
                ) : collections.length === 0 ? (
                    <div className="text-center py-20 border border-gray-800 rounded-3xl bg-gray-900/50">
                        <p className="text-gray-400">You don't have any collections yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {collections.map(col => (
                            <div key={col.id} className="group relative bg-gray-900 rounded-2xl border border-gray-800 p-6 shadow-lg hover:border-fuchsia-500/50 hover:shadow-fuchsia-900/20 transition-all duration-300">
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleDelete(col.id)} className="text-red-400 hover:text-red-300">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{col.name}</h3>
                                <p className="text-sm text-gray-400 h-10 line-clamp-2 mb-4">{col.description || 'No description'}</p>
                                <div className="flex items-center justify-between gap-2 pt-4 border-t border-gray-800">
                                    <div className="flex items-center gap-1 text-xs font-semibold text-fuchsia-400">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                        {col.promptIds?.length || 0} Prompts
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => handleToggleVisibility(col.id)}
                                            className={`text-xs px-2 py-1 rounded-md font-bold transition ${col.public ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-400'}`}
                                        >
                                            {col.public ? 'Public' : 'Private'}
                                        </button>
                                        {col.public && (
                                            <button onClick={() => copyToClipboard(col.id)} className="text-gray-400 hover:text-white transition" title="Copy Link">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Create Collection Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
                        <h2 className="text-2xl font-bold text-white mb-6">New Collection</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                                    placeholder="e.g. Marketing copy"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                                <textarea
                                    value={newDesc}
                                    onChange={(e) => setNewDesc(e.target.value)}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white h-24 resize-none focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                                    placeholder="Prompts about marketing..."
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-medium text-gray-400 hover:text-white transition">Cancel</button>
                                <button type="submit" disabled={creating} className="px-5 py-2.5 rounded-xl font-semibold text-white bg-violet-600 hover:bg-violet-500 transition disabled:opacity-50">
                                    {creating ? 'Creating...' : 'Create Folder'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
