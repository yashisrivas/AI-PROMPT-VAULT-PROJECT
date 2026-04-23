import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getPrompts, createPrompt, editPrompt, deletePrompt, getAllPublicPrompts, getTrendingPrompts, forkPrompt, getSavedPrompts, getRecommendedPrompts } from '../api/promptService'
import Navbar from '../components/Navbar'
import PromptCard from '../components/PromptCard'
import CreatePromptModal from '../components/CreatePromptModal'
import EditPromptModal from '../components/EditPromptModal'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorAlert from '../components/ErrorAlert'
import { publicAxios } from '../api/axiosInstance'

export default function Dashboard({ guestMode = false }) {
    const { auth } = useAuth()
    const [prompts, setPrompts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showCreate, setShowCreate] = useState(false)
    const [editTarget, setEditTarget] = useState(null)
    const [search, setSearch] = useState('')
    const [feedType, setFeedType] = useState(guestMode ? 'public' : 'mine')
    const [trending, setTrending] = useState([])
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)

    const fetchPrompts = async (currentPage = 0, isNew = true) => {
        setLoading(true)
        setError('')
        try {
            const activeAxios = auth?.authAxios || publicAxios;
            let data;
            if(feedType === 'mine') {
                if(!auth) { setPrompts([]); return; }
                data = await getPrompts(auth.authAxios)
                setPrompts(Array.isArray(data) ? data : [])
                setHasMore(false)
            } else if (feedType === 'saved') {
                if(!auth) { setPrompts([]); return; }
                data = await getSavedPrompts(auth.authAxios)
                setPrompts(Array.isArray(data) ? data : [])
                setHasMore(false)
            } else if (feedType === 'foryou') {
                if(!auth) { setPrompts([]); return; }
                data = await getRecommendedPrompts(auth.authAxios)
                setPrompts(Array.isArray(data) ? data : [])
                setHasMore(false)
            } else {
                data = await getAllPublicPrompts(activeAxios, currentPage, 6)
                const newPrompts = data.content || []
                if(isNew) setPrompts(newPrompts)
                else setPrompts((prev) => [...prev, ...newPrompts])
                setHasMore(!data.last)
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load prompts.')
        } finally {
            setLoading(false)
        }
    }

    const fetchTrending = async () => {
        try {
            const activeAxios = auth?.authAxios || publicAxios;
            const tr = await getTrendingPrompts(activeAxios)
            setTrending(Array.isArray(tr) ? tr : [])
        } catch(e) { }
    }

    useEffect(() => { 
        fetchPrompts(0, true)
        setPage(0)
        if(feedType === 'public') fetchTrending()
    }, [feedType])

    const handleLoadMore = () => {
        if(!hasMore || loading) return;
        const next = page + 1;
        setPage(next);
        fetchPrompts(next, false);
    }

    const handleCreate = async (data) => {
        await createPrompt(auth.authAxios, data)
        await fetchPrompts()
    }

    const handleEdit = async (id, data) => {
        await editPrompt(auth.authAxios, id, data)
        await fetchPrompts()
    }

    const handleDelete = async (id) => {
        await deletePrompt(auth.authAxios, id)
        setPrompts((prev) => prev.filter((p) => (p.id || p._id) !== id))
    }

    const handleActionFork = async (id) => {
        try {
            await forkPrompt(auth.authAxios, id)
            if(feedType === 'mine') fetchPrompts(0, true)
            else alert("Forked! Check 'My Prompts'")
        } catch(err) {
            setError('Fork processing failed.')
        }
    }

    const filtered = prompts.filter((p) => {
        const q = search.toLowerCase()
        return (
            (p.title || '').toLowerCase().includes(q) ||
            (p.content || p.prompt || p.text || '').toLowerCase().includes(q)
        )
    })

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">{feedType === 'mine' ? 'My Prompts' : feedType === 'saved' ? 'Saved Prompts' : feedType === 'foryou' ? 'For You' : 'Public Explorer'}</h1>
                        <p className="text-gray-400 font-medium text-sm mt-0.5">
                            {feedType === 'mine' ? `${prompts.length} prompt(s) in your vault` : feedType === 'saved' ? 'Your favorite discoveries' : feedType === 'foryou' ? 'Recommended based on your activity' : 'Discover community trends'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {!guestMode && (
                            <select 
                                value={feedType} 
                                onChange={(e) => setFeedType(e.target.value)}
                                className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 outline-none"
                            >
                                <option value="mine">My Prompts</option>
                                <option value="public">Public Feed</option>
                                <option value="saved">Saved / Liked</option>
                                <option value="foryou">For You (Smart Algorithm)</option>
                            </select>
                        )}
                        {auth ? (
                            <button
                                onClick={() => setShowCreate(true)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-all duration-200 shadow-lg shadow-violet-900/40"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                New Prompt
                            </button>
                        ) : (
                            <button
                                onClick={() => window.location.href='/login'}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-violet-600 hover:bg-violet-500 transition"
                            >
                                Sign In to Create
                            </button>
                        )}
                    </div>
                </div>

                {/* Search bar */}
                {prompts.length > 0 && (
                    <div className="relative mb-6">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search prompts…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                        />
                    </div>
                )}

                {/* Error */}
                {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

                {/* Content */}
                {loading ? (
                    <LoadingSpinner message="Fetching your prompts…" />
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 mb-4">
                            <svg className="w-7 h-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-300 mb-1">
                            {search ? 'No matching prompts' : 'No prompts yet'}
                        </h3>
                        <p className="text-gray-500 text-sm mb-6">
                            {search ? 'Try a different search term.' : 'Create your first AI prompt to get started.'}
                        </p>
                        {!search && (
                            <button
                                onClick={() => setShowCreate(true)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-violet-600 hover:bg-violet-500 transition"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                Create First Prompt
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {feedType === 'public' && trending.length > 0 && (
                            <div className="mb-8 p-5 bg-gradient-to-r from-violet-900/40 to-fuchsia-900/20 rounded-2xl border border-violet-500/30">
                                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="text-xl">🔥</span> Trending Now
                                </h2>
                                <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
                                    {trending.map(t => (
                                        <div key={t.id} className="min-w-[280px] max-w-[280px] snap-center shrink-0">
                                            <PromptCard prompt={t} onFork={handleActionFork} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filtered.map((prompt) => (
                                <PromptCard
                                    key={prompt.id || prompt._id}
                                    prompt={prompt}
                                    onEdit={feedType === 'mine' ? setEditTarget : null}
                                    onDelete={feedType === 'mine' ? handleDelete : null}
                                    onFork={handleActionFork}
                                />
                            ))}
                        </div>
                        {hasMore && feedType === 'public' && (
                            <div className="flex justify-center mt-8">
                                <button onClick={handleLoadMore} disabled={loading} className="px-6 py-2 rounded-xl bg-gray-800 text-white hover:bg-gray-700 border border-gray-600">
                                    {loading ? 'Loading...' : 'Load More Prompts'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Modals */}
            {showCreate && (
                <CreatePromptModal
                    onClose={() => setShowCreate(false)}
                    onCreate={handleCreate}
                />
            )}
            {editTarget && (
                <EditPromptModal
                    prompt={editTarget}
                    onClose={() => setEditTarget(null)}
                    onSave={handleEdit}
                />
            )}
        </div>
    )
}
