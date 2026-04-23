import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../api/userService';
import { publicAxios } from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import PromptCard from '../components/PromptCard';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Profile() {
    const { username } = useParams();
    const { auth } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('posts');
    const [followActionLoading, setFollowActionLoading] = useState(false);

    const isOwnProfile = auth?.username === username;

    useEffect(() => {
        loadProfile();
    }, [username]);

    const loadProfile = async () => {
        setLoading(true);
        setError('');
        try {
            const ax = auth?.authAxios || publicAxios;
            const data = await userService.getProfile(ax, username);
            setProfile(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleFollowToggle = async () => {
        if (!auth) {
            window.location.href = '/login';
            return;
        }
        setFollowActionLoading(true);
        try {
            if (profile.isFollowing) {
                await userService.unfollowUser(auth.authAxios, username);
                setProfile(prev => ({
                    ...prev,
                    followers: prev.followers - 1,
                    isFollowing: false
                }));
            } else {
                await userService.followUser(auth.authAxios, username);
                setProfile(prev => ({
                    ...prev,
                    followers: prev.followers + 1,
                    isFollowing: true
                }));
            }
        } catch (err) {
            setError('Failed to update follow status.');
        } finally {
            setFollowActionLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen pt-20"><LoadingSpinner /></div>;
    if (error) return <div className="min-h-screen pt-20 max-w-lg mx-auto"><ErrorAlert message={error} /></div>;
    if (!profile) return <div className="min-h-screen pt-20 text-center text-gray-400">Profile not found.</div>;

    return (
        <div className="min-h-screen bg-gray-950 pb-20">
            <Navbar />
            <div className="max-w-4xl mx-auto pt-28 px-4 sm:px-6">
                
                {/* Profile Header */}
                <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500"></div>
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg border-4 border-gray-900">
                            {profile.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-white mb-2">{profile.username}</h1>
                            <div className="flex gap-6 justify-center md:justify-start text-sm text-gray-400">
                                <div><span className="text-white font-semibold">{profile.prompts?.length || 0}</span> Posts</div>
                                <div><span className="text-white font-semibold">{profile.followers}</span> Followers</div>
                                <div><span className="text-white font-semibold">{profile.following}</span> Following</div>
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0">
                            {!isOwnProfile && (
                                <button
                                    onClick={handleFollowToggle}
                                    disabled={followActionLoading}
                                    className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                                        profile.isFollowing 
                                        ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
                                        : 'bg-violet-600 text-white hover:bg-violet-500 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)]'
                                    }`}
                                >
                                    {followActionLoading ? '...' : (profile.isFollowing ? 'Unfollow' : 'Follow')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-white/10 mb-6">
                    <button
                        className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'posts' ? 'text-violet-400 border-b-2 border-violet-500' : 'text-gray-400 hover:text-gray-200'}`}
                        onClick={() => setActiveTab('posts')}
                    >
                        Posts
                    </button>
                    <button
                        className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'comments' ? 'text-violet-400 border-b-2 border-violet-500' : 'text-gray-400 hover:text-gray-200'}`}
                        onClick={() => setActiveTab('comments')}
                    >
                        Comments
                    </button>
                </div>

                {/* Content */}
                <div>
                    {activeTab === 'posts' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {profile.prompts && profile.prompts.length > 0 ? (
                                profile.prompts.map(prompt => (
                                    <PromptCard key={prompt.id} prompt={prompt} />
                                ))
                            ) : (
                                <div className="col-span-2 text-center py-12 text-gray-500">No posts yet.</div>
                            )}
                        </div>
                    )}

                    {activeTab === 'comments' && (
                        <div className="space-y-4">
                            {profile.comments && profile.comments.length > 0 ? (
                                profile.comments.map(comment => (
                                    <div key={comment.id} className="bg-gray-900/40 border border-white/5 rounded-xl p-5">
                                        <p className="text-gray-200">{comment.content}</p>
                                        <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
                                            <span>On Prompt ID: {comment.promptId}</span>
                                            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-500">No comments yet.</div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
