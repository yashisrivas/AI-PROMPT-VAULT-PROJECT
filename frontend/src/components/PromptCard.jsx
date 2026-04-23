import { useState, useEffect } from 'react'
import ErrorAlert from './ErrorAlert'
import { incrementPromptView } from '../api/promptService'
import { useAuth } from '../context/AuthContext'
import { publicAxios } from '../api/axiosInstance'
import { Link } from 'react-router-dom'
import { userService } from '../api/userService'
import { getMyCollections, addPromptToCollection } from '../api/collectionService'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function PromptCard({ prompt, onEdit, onDelete, onFork }) {
    const [deleting, setDeleting] = useState(false)
    const [forking, setForking] = useState(false)
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState('')
    const [commentText, setCommentText] = useState('')
    const [showCommentBox, setShowCommentBox] = useState(false)
    const [commenting, setCommenting] = useState(false)

    const [liked, setLiked] = useState(prompt.isLiked || false)
    const [likeCount, setLikeCount] = useState(prompt.likeCount || 0)

    const [showTemplateEditor, setShowTemplateEditor] = useState(false)
    const [templateValues, setTemplateValues] = useState({})

    const [comments, setComments] = useState([])
    const [fetchingComments, setFetchingComments] = useState(false)

    const [showCollectionMenu, setShowCollectionMenu] = useState(false)
    const [userCollections, setUserCollections] = useState([])
    const [loadingCollections, setLoadingCollections] = useState(false)
    const [collectionSuccess, setCollectionSuccess] = useState('')

    const { auth } = useAuth()
    const promptId = prompt.id || prompt._id

    useEffect(() => {
        if(collectionSuccess) {
            const t = setTimeout(() => setCollectionSuccess(''), 2000);
            return () => clearTimeout(t);
        }
    }, [collectionSuccess]);

    useEffect(() => {
        if (showCommentBox) {
            setFetchingComments(true);
            publicAxios.get(`/public/prompt/${promptId}/comments`)
                .then(res => setComments(Array.isArray(res.data) ? res.data : []))
                .catch(err => console.error(err))
                .finally(() => setFetchingComments(false));
        }
    }, [showCommentBox, promptId]);

    const handleDelete = async () => {
        if (!confirm('Delete this prompt?')) return
        setDeleting(true)
        setError('')
        try {
            await onDelete(promptId)
        } catch (err) {
            setError(err.response?.data?.message || 'Delete failed.')
            setDeleting(false)
        }
    }

    const handleFork = async () => {
        if(!auth) { window.location.href='/login'; return; }
        if(!onFork) return;
        setForking(true)
        try {
            await onFork(promptId)
        } catch (err) {
            setError('Fork failed.')
        } finally {
            setForking(false)
        }
    }

    const handleCopy = () => {
        const ax = auth?.authAxios || publicAxios;
        incrementPromptView(ax, promptId);
        navigator.clipboard.writeText(prompt.content || prompt.prompt || prompt.text || '')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleExportMD = () => {
        const content = `# ${prompt.title || 'Untitled Prompt'}\n\n${prompt.content || ''}\n\n--- \n*Generated via AI Prompt Vault*`;
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${prompt.title || 'prompt'}.md`;
        a.click();
        URL.revokeObjectURL(url);
    }

    const handleCommentSubmit = async (e) => {
        e.preventDefault()
        if (!auth) { window.location.href='/login'; return; }
        if (!commentText.trim()) return;
        setCommenting(true)
        try {
            await userService.commentOnPrompt(auth.authAxios, promptId, commentText);
            setCommentText('');
            publicAxios.get(`/public/prompt/${promptId}/comments`)
                .then(res => setComments(Array.isArray(res.data) ? res.data : []));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add comment.')
        } finally {
            setCommenting(false)
        }
    }

    const handleLikeToggle = async () => {
        if (!auth) { window.location.href='/login'; return; }
        try {
            await auth.authAxios.post(`/user/prompt/${promptId}/like`);
            setLiked(!liked);
            setLikeCount(liked ? Math.max(0, likeCount - 1) : likeCount + 1);
        } catch (err) {
            setError('Failed to toggle like');
        }
    }

    const handleSaveToCollectionClick = async () => {
        if (!auth) { window.location.href='/login'; return; }
        setShowCollectionMenu(!showCollectionMenu)
        if (!showCollectionMenu && userCollections.length === 0) {
            setLoadingCollections(true)
            try {
                const data = await getMyCollections(auth.authAxios)
                setUserCollections(Array.isArray(data) ? data : [])
            } catch (err) {
                setError('Failed to load collections')
            } finally {
                setLoadingCollections(false)
            }
        }
    }

    const handleAddToCollection = async (collectionId) => {
        try {
            await addPromptToCollection(auth.authAxios, collectionId, promptId)
            setShowCollectionMenu(false)
            setCollectionSuccess('Saved to collection!')
            setTimeout(() => setCollectionSuccess(''), 3000)
        } catch (err) {
            setError('Failed to save to collection')
        }
    }

    const baseContent = prompt.content || prompt.prompt || prompt.text || '';
    const templateVars = [...new Set([...baseContent.matchAll(/\{\{([^}]+)\}\}/g)].map(m => m[1]))];
    
    const getFilledContent = () => {
        let text = baseContent;
        templateVars.forEach(v => {
            text = text.replaceAll(`{{${v}}}`, templateValues[v] || `{{${v}}}`);
        });
        return text;
    }

    const handleExportJSON = () => {
        const data = {
            title: prompt.title || 'Untitled',
            content: baseContent,
            category: prompt.category || '',
            author: prompt.username
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(prompt.title || 'prompt').replace(/\s+/g,'_')}.json`;
        a.click();
    };

    const handleTemplateCopy = () => {
        const ax = auth?.authAxios || publicAxios;
        incrementPromptView(ax, promptId);
        navigator.clipboard.writeText(getFilledContent());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    // Attempt to find the prompt id field

    return (
        <div className="group relative bg-gray-900 rounded-xl border border-gray-800 p-5 shadow-lg hover:border-violet-500/50 hover:shadow-violet-900/20 hover:shadow-xl transition-all duration-300">
            {/* Tag / category pill if available */}
            {prompt.category && (
                <span className="inline-block mb-3 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-500/10 border border-violet-500/20 text-violet-400">
                    {prompt.category}
                </span>
            )}

            {/* Title and Author */}
            <div className="mb-2">
                <h3 className="text-base font-semibold text-white line-clamp-1">
                    {prompt.title || 'Untitled Prompt'}
                </h3>
                {prompt.username && (
                    <Link to={`/profile/${prompt.username}`} className="text-xs text-violet-400 hover:text-violet-300 transition-colors mt-1 block">
                        @{prompt.username}
                    </Link>
                )}
            </div>

            {/* Content */}
            <div className="mb-4 rounded-xl overflow-hidden text-sm line-clamp-4">
                <SyntaxHighlighter 
                    language={baseContent.includes('{') && baseContent.includes('}') ? 'json' : 'markdown'} 
                    style={vscDarkPlus} 
                    customStyle={{ margin: 0, padding: '1rem', background: '#030712' }}
                    wrapLines={true}
                    wrapLongLines={true}
                >
                    {baseContent}
                </SyntaxHighlighter>
            </div>

            {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}
            {collectionSuccess && (
                <div className="mb-3 px-3 py-2 bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    {collectionSuccess}
                    <button onClick={() => setCollectionSuccess('')} className="text-green-400/50 hover:text-green-400">✕</button>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-white/5 flex-wrap">
                <button
                    onClick={handleLikeToggle}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border border-transparent ${
                        liked 
                        ? 'text-pink-500 bg-pink-500/10 border-pink-500/20' 
                        : 'text-gray-400 hover:text-pink-400 hover:bg-pink-500/10 hover:border-pink-500/20'
                    }`}
                >
                    <svg className={`w-4 h-4 ${liked ? 'fill-current' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {likeCount}
                </button>

                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-violet-400 hover:text-white hover:bg-violet-500/10 border border-transparent hover:border-violet-500/20 transition-all duration-200"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {copied ? 'Copied!' : 'Copy'}
                </button>
                
                {onFork && (
                    <button
                        onClick={handleFork}
                        disabled={forking}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 hover:text-white hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 disabled:opacity-50 transition-all duration-200"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7l-2 2m2-2l2 2m8-2v8a2 2 0 01-2 2h-6m6-10l-2 2m2-2l2 2" />
                        </svg>
                        {forking ? 'Forking…' : 'Fork'}
                    </button>
                )}

                {promptId && (
                    <div className="flex items-center bg-white/5 rounded-lg overflow-hidden group/down">
                        <a
                            href={`http://localhost:8080/public/download-prompt/${promptId}`}
                            download
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition"
                        >
                            TXT
                        </a>
                        <div className="w-[1px] h-3 bg-gray-800"></div>
                        <button
                            onClick={handleExportMD}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition"
                        >
                            MD
                        </button>
                        <div className="w-[1px] h-3 bg-gray-800"></div>
                        <button
                            onClick={handleExportJSON}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition"
                        >
                            JSON
                        </button>
                    </div>
                )}

                <div className="relative">
                    <button
                        onClick={handleSaveToCollectionClick}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 border border-transparent hover:border-gray-700 transition"
                        title="Save to Collection"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        Save
                    </button>
                    
                    {/* Collection Dropdown */}
                    {showCollectionMenu && (
                        <div className="absolute left-0 bottom-full mb-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-10 overflow-hidden text-sm">
                            <div className="px-3 py-2 border-b border-gray-800 text-xs font-semibold text-gray-400">Add to collection</div>
                            {loadingCollections ? (
                                <div className="p-3 text-gray-500 text-xs flex justify-center">Loading...</div>
                            ) : userCollections.length === 0 ? (
                                <div className="p-3 text-gray-500 text-xs">No collections found. <Link to="/collections" className="text-violet-400 hover:underline">Create one</Link>.</div>
                            ) : (
                                <div className="max-h-40 overflow-y-auto">
                                    {userCollections.map(col => (
                                        <button 
                                            key={col.id} 
                                            onClick={() => handleAddToCollection(col.id)}
                                            className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition"
                                        >
                                            {col.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {onEdit && (
                    <button
                        onClick={() => onEdit(prompt)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 border border-transparent hover:border-gray-700 transition"
                    >
                        Edit
                    </button>
                )}

                {onDelete && (
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition"
                    >
                        {deleting ? '...' : 'Delete'}
                    </button>
                )}

                {templateVars.length > 0 && (
                    <button
                        onClick={() => setShowTemplateEditor(!showTemplateEditor)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-fuchsia-400 hover:text-white hover:bg-fuchsia-500/10 border border-transparent hover:border-fuchsia-500/20 transition-all duration-200"
                    >
                        Use Template
                    </button>
                )}

                <button
                    onClick={() => setShowCommentBox(!showCommentBox)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-400 hover:text-white hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-all duration-200 ml-auto"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Comment
                </button>
            </div>

            {/* Template Editor */}
            {showTemplateEditor && (
                <div className="mt-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
                    <h4 className="text-xs font-bold text-gray-300 mb-3 uppercase tracking-wider">Fill Template Variables</h4>
                    <div className="space-y-3 mb-4">
                        {templateVars.map(v => (
                            <div key={v}>
                                <label className="block text-xs font-medium text-gray-400 mb-1 capitalize">{v}</label>
                                <input
                                    type="text"
                                    value={templateValues[v] || ''}
                                    onChange={(e) => setTemplateValues(prev => ({...prev, [v]: e.target.value}))}
                                    className="w-full bg-gray-950/50 border border-white/10 rounded-lg p-2 text-sm text-gray-200 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="bg-gray-950/50 p-3 rounded-lg border border-white/10 mb-3">
                        <p className="text-sm text-gray-300 font-mono text-xs whitespace-pre-wrap">{getFilledContent()}</p>
                    </div>
                    <div className="flex justify-end">
                        <button 
                            onClick={handleTemplateCopy}
                            className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold py-1.5 px-4 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                            {copied ? 'Copied Final Prompt!' : 'Copy Final Prompt'}
                        </button>
                    </div>
                </div>
            )}

            {/* Comment Box */}
            {showCommentBox && (
                <div className="mt-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
                    <form onSubmit={handleCommentSubmit} className="mb-4">
                        <textarea 
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            placeholder="Write a comment..."
                            className="w-full bg-gray-950/50 border border-white/10 rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 resize-none"
                            rows={2}
                        />
                        <div className="flex justify-end mt-2">
                            <button 
                                type="submit" 
                                disabled={commenting || !commentText.trim()}
                                className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold py-1.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {commenting ? 'Posting...' : 'Post Comment'}
                            </button>
                        </div>
                    </form>

                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                        {fetchingComments ? (
                            <div className="text-center py-4 text-xs text-gray-500">Loading comments...</div>
                        ) : comments.length === 0 ? (
                            <div className="text-center py-4 text-xs text-gray-500">No comments yet. Be the first to comment!</div>
                        ) : (
                            comments.map(c => (
                                <div key={c.id} className="bg-gray-900/50 rounded-lg p-3 text-sm border border-white/5">
                                    <div className="flex items-center gap-2 mb-1 cursor-pointer" onClick={() => window.location.href=`/profile/${c.username}`}>
                                        <div className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-[10px] font-bold">
                                            {c.username?.[0]?.toUpperCase()}
                                        </div>
                                        <span className="font-semibold text-gray-300 text-xs hover:text-violet-400">{c.username}</span>
                                        <span className="text-gray-600 text-[10px] ml-auto">
                                            {new Date(c.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-xs pl-7">{c.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
