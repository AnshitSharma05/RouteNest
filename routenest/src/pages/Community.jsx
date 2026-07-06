import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { 
  ArrowBigUp, 
  ArrowBigDown, 
  MessageSquare, 
  Plus, 
  Search, 
  Trash2, 
  Calendar, 
  MapPin, 
  Compass, 
  Upload, 
  Image as ImageIcon, 
  Globe, 
  FileText,
  Loader2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { API_URL } from '../apiConfig';

const CARD_COLORS = ['#BAE1FF', '#FFDFD3', '#FFB3BA', '#90EE90', '#FFD166', '#E2B4D6'];

export default function Community() {
  const { getToken } = useAuth();
  
  // App-wide state
  const [communities, setCommunities] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activeCommunity, setActiveCommunity] = useState(null); // null means "All Feed"
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // UI state
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [expandedComments, setExpandedComments] = useState({}); // postId -> boolean
  const [commentsData, setCommentsData] = useState({}); // postId -> comments[]
  const [commentsLoading, setCommentsLoading] = useState({}); // postId -> boolean
  const [commentInputs, setCommentInputs] = useState({}); // postId -> string

  // User's personal content state (for importing)
  const [personalMemories, setPersonalMemories] = useState([]);
  const [personalItineraries, setPersonalItineraries] = useState([]);

  // Forms state
  const [newCommunityForm, setNewCommunityForm] = useState({ name: '', description: '' });
  const [communityError, setCommunityError] = useState('');
  const [communitySaving, setCommunitySaving] = useState(false);

  const [newPostForm, setNewPostForm] = useState({
    title: '',
    content: '',
    postType: 'general', // 'general', 'story', 'itinerary'
    location: '',
    communityId: '',
    selectedMemoryId: '',
    selectedItineraryId: ''
  });
  const [postPictures, setPostPictures] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [postSaving, setPostSaving] = useState(false);

  // Fetch initial communities
  useEffect(() => {
    fetchCommunities();
  }, []);

  // Fetch posts when active community changes
  useEffect(() => {
    fetchPosts();
  }, [activeCommunity]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/communities`);
      setCommunities(res.data);
    } catch (err) {
      console.error('Failed to fetch communities:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      setPostsLoading(true);
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };
      
      let url = `${API_URL}/api/communities/posts`;
      if (activeCommunity) {
        url = `${API_URL}/api/communities/${activeCommunity.id}/posts`;
      }
      
      const res = await axios.get(url, { headers });
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setPostsLoading(false);
    }
  };

  // Load user memories & itineraries for sharing options
  const fetchPersonalContent = async () => {
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };
      
      const [memoriesRes, itinerariesRes] = await Promise.all([
        axios.get(`${API_URL}/api/memories`, { headers }),
        axios.get(`${API_URL}/api/itineraries`, { headers })
      ]);
      
      setPersonalMemories(memoriesRes.data);
      setPersonalItineraries(itinerariesRes.data);
    } catch (err) {
      console.error('Failed to fetch personal content:', err);
    }
  };

  // Trigger loading personal content when opening post creation
  useEffect(() => {
    if (showCreatePost) {
      fetchPersonalContent();
      // Preselect current community if active
      setNewPostForm(prev => ({
        ...prev,
        communityId: activeCommunity ? activeCommunity.id : (communities[0]?.id || '')
      }));
    }
  }, [showCreatePost]);

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    setCommunitySaving(true);
    setCommunityError('');
    try {
      const token = await getToken();
      const res = await axios.post(
        `${API_URL}/api/communities`,
        newCommunityForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCommunities(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setActiveCommunity(res.data);
      setShowCreateCommunity(false);
      setNewCommunityForm({ name: '', description: '' });
    } catch (err) {
      setCommunityError(err.response?.data?.error || 'Failed to create community');
    } finally {
      setCommunitySaving(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostForm.communityId) {
      alert('Please select a community');
      return;
    }
    setPostSaving(true);
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Handle photos upload if we have files in general post
      let finalPictures = [...postPictures];
      if (imageFiles.length > 0) {
        const uploadData = new FormData();
        imageFiles.forEach(file => uploadData.append('images', file));
        const uploadRes = await axios.post(`${API_URL}/api/upload`, uploadData, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data' }
        });
        finalPictures = [...finalPictures, ...uploadRes.data.urls];
      }

      const postPayload = {
        title: newPostForm.title,
        content: newPostForm.content,
        post_type: newPostForm.postType,
        location: newPostForm.location,
        pictures: finalPictures,
        original_memory_id: newPostForm.selectedMemoryId || null,
        original_itinerary_id: newPostForm.selectedItineraryId || null
      };

      await axios.post(
        `${API_URL}/api/communities/${newPostForm.communityId}/posts`,
        postPayload,
        { headers }
      );

      fetchPosts();
      setShowCreatePost(false);
      // Reset form
      setNewPostForm({
        title: '',
        content: '',
        postType: 'general',
        location: '',
        communityId: '',
        selectedMemoryId: '',
        selectedItineraryId: ''
      });
      setPostPictures([]);
      setImageFiles([]);
    } catch (err) {
      console.error(err);
      alert('Failed to save post.');
    } finally {
      setPostSaving(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const token = await getToken();
      await axios.delete(`${API_URL}/api/communities/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  const handleVote = async (postId, currentVote, targetVote) => {
    // If user clicks the active vote arrow, it removes the vote (value = 0)
    const voteValue = currentVote === targetVote ? 0 : targetVote;
    try {
      const token = await getToken();
      const res = await axios.post(
        `${API_URL}/api/communities/posts/${postId}/vote`,
        { vote: voteValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local posts list score
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            score: res.data.score,
            userVote: res.data.userVote
          };
        }
        return p;
      }));
    } catch (err) {
      console.error('Voting failed:', err);
    }
  };

  const toggleComments = async (postId) => {
    const isExpanded = !expandedComments[postId];
    setExpandedComments(prev => ({ ...prev, [postId]: isExpanded }));
    
    if (isExpanded && !commentsData[postId]) {
      fetchComments(postId);
    }
  };

  const fetchComments = async (postId) => {
    setCommentsLoading(prev => ({ ...prev, [postId]: true }));
    try {
      const res = await axios.get(`${API_URL}/api/communities/posts/${postId}/comments`);
      setCommentsData(prev => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setCommentsLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handlePostComment = async (e, postId) => {
    e.preventDefault();
    const commentContent = commentInputs[postId];
    if (!commentContent || !commentContent.trim()) return;

    try {
      const token = await getToken();
      const res = await axios.post(
        `${API_URL}/api/communities/posts/${postId}/comments`,
        { content: commentContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local comments
      setCommentsData(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), res.data]
      }));
      // Increment comment count in posts list
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return { ...p, commentsCount: (p.commentsCount || 0) + 1 };
        }
        return p;
      }));
      // Reset input
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    } catch (err) {
      alert('Failed to post comment');
    }
  };

  // Helper when user selects a memory to import
  const handleSelectMemory = (memoryId) => {
    const memory = personalMemories.find(m => m.id === memoryId);
    if (memory) {
      setNewPostForm(prev => ({
        ...prev,
        selectedMemoryId: memoryId,
        title: memory.title || '',
        content: memory.story || '',
        location: memory.location || ''
      }));
      setPostPictures(memory.pictures || []);
    }
  };

  // Helper when user selects an itinerary to import
  const handleSelectItinerary = (itineraryId) => {
    const itinerary = personalItineraries.find(it => it.id === itineraryId);
    if (itinerary) {
      setNewPostForm(prev => ({
        ...prev,
        selectedItineraryId: itineraryId,
        title: `My Shared Itinerary: ${itinerary.days} days in ${itinerary.destination}`,
        content: itinerary.content || '',
        location: itinerary.destination || ''
      }));
      setPostPictures([]);
    }
  };

  // Filtered communities based on search query
  const filteredCommunities = communities.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="h-[calc(100vh-80px)] flex items-center justify-center bg-[#F4F1E1] font-black text-2xl">LOADING COMMUNITIES...</div>;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-80px)] bg-[#F4F1E1] text-[#111] overflow-hidden font-sans">
      
      {/* Sidebar - Communities List */}
      <div className="w-full md:w-80 bg-white border-b-4 md:border-b-0 md:border-r-4 border-black flex flex-col shrink-0 z-10 shadow-[4px_0_0_rgba(0,0,0,1)] overflow-y-auto">
        <div className="bg-[#FFB3BA] border-b-4 border-black p-5 flex flex-col gap-3">
          <div>
            <h2 className="font-black tracking-widest uppercase text-lg leading-none">COMMUNITIES</h2>
            <p className="text-sm font-bold text-gray-700 mt-1">Explore anonymous adventures</p>
          </div>
          
          {/* Search bar */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search groups..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full border-2 border-black pl-8 pr-3 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FFB3BA] bg-white placeholder-gray-500" 
            />
            <Search className="w-4 h-4 absolute left-2 top-1.5 text-gray-600" />
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <button 
            onClick={() => setShowCreateCommunity(true)}
            className="w-full bg-[#BAE1FF] border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] py-2.5 font-black uppercase text-sm mb-4 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all flex items-center justify-center gap-1.5">
            <Plus className="w-4 h-4" /> Create Group
          </button>

          {/* All Feed Trigger */}
          <div 
            onClick={() => setActiveCommunity(null)}
            className={`border-4 border-black p-3 cursor-pointer transition-all mb-4 ${!activeCommunity ? 'bg-[#FFD166] shadow-[4px_4px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]' : 'bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)]'}`}>
            <div className="flex gap-2 items-center">
              <Globe className="w-4 h-4 text-black shrink-0" />
              <h4 className="font-black text-xs uppercase tracking-wider">All Communities Feed</h4>
            </div>
          </div>

          <div className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2 mt-2">Active Channels</div>
          <div className="space-y-3 flex-1 overflow-y-auto">
            {filteredCommunities.map(c => {
              const isSelected = activeCommunity?.id === c.id;
              return (
                <div 
                  key={c.id} 
                  onClick={() => setActiveCommunity(c)}
                  className={`border-4 border-black p-3 cursor-pointer transition-all ${isSelected ? 'bg-[#FFDFD3] shadow-[4px_4px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]' : 'bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)]'}`}>
                  <div>
                    <h4 className="font-black text-xs uppercase truncate">{c.name}</h4>
                    <p className="font-bold text-[10px] text-gray-600 mt-1 truncate">{c.description || 'No description available'}</p>
                  </div>
                </div>
              );
            })}
            {filteredCommunities.length === 0 && (
              <p className="text-xs font-bold text-gray-500 text-center py-4">No groups found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Main content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
        
        {/* Active Header Box */}
        <div className="w-full max-w-4xl border-4 border-black bg-white shadow-[8px_8px_0_rgba(0,0,0,1)] p-6 md:p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-black uppercase leading-none mb-2">
              {activeCommunity ? activeCommunity.name : 'ALL COMMUNITIES FEED'}
            </h1>
            <p className="font-bold text-sm text-gray-600">
              {activeCommunity ? activeCommunity.description : 'Explore shared stories and itineraries anonymously from fellow travelers globally.'}
            </p>
          </div>
          <button 
            onClick={() => setShowCreatePost(true)}
            className="shrink-0 bg-[#90EE90] border-4 border-black font-black uppercase px-6 py-3 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-1.5 text-sm">
            <Plus className="w-4 h-4" /> Share Anonymous Post
          </button>
        </div>

        {/* Post Feed */}
        <div className="w-full max-w-4xl space-y-6 pb-12">
          {postsLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-black" />
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white border-4 border-black p-12 text-center shadow-[6px_6px_0_rgba(0,0,0,1)]">
              <Compass className="w-12 h-12 mx-auto mb-4 text-[#FFB3BA]" />
              <h3 className="font-black text-xl uppercase mb-1">No posts found</h3>
              <p className="font-bold text-gray-600 text-sm">Be the first to post something exciting in this space!</p>
            </div>
          ) : (
            posts.map((post, idx) => {
              const color = CARD_COLORS[idx % CARD_COLORS.length];
              const isExpanded = expandedComments[post.id];
              return (
                <div key={post.id} className="border-4 border-black bg-white shadow-[8px_8px_0_rgba(0,0,0,1)] flex overflow-hidden">
                  
                  {/* Voting Panel */}
                  <div className="w-14 bg-gray-50 border-r-4 border-black flex flex-col items-center pt-4 select-none shrink-0">
                    <button 
                      onClick={() => handleVote(post.id, post.userVote, 1)}
                      className={`p-1.5 transition-transform hover:scale-125 ${post.userVote === 1 ? 'text-[#FF4500]' : 'text-gray-400'}`}>
                      <ArrowBigUp className={`w-7 h-7 ${post.userVote === 1 ? 'fill-current' : ''}`} />
                    </button>
                    <span className={`font-black text-sm my-1 ${post.userVote === 1 ? 'text-[#FF4500]' : post.userVote === -1 ? 'text-[#0000FF]' : 'text-black'}`}>
                      {post.score}
                    </span>
                    <button 
                      onClick={() => handleVote(post.id, post.userVote, -1)}
                      className={`p-1.5 transition-transform hover:scale-125 ${post.userVote === -1 ? 'text-[#0000FF]' : 'text-gray-400'}`}>
                      <ArrowBigDown className={`w-7 h-7 ${post.userVote === -1 ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Main Card Content */}
                  <div className="flex-1 flex flex-col">
                    <div className="p-5 md:p-6 flex-1">
                      
                      {/* Meta header */}
                      <div className="flex flex-wrap items-center justify-between text-[10px] font-black text-gray-500 uppercase gap-2 mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-black text-[#FFD166] px-1.5 py-0.5 border border-black font-black text-[9px]">
                            {post.post_type}
                          </span>
                          {!activeCommunity && (
                            <span className="text-[#FF1493] font-black">
                              {post.communityName}
                            </span>
                          )}
                          <span>• By {post.authorPseudonym}</span>
                          <span>• {new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                        {post.isOwner && (
                          <button 
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-500 hover:text-red-700 hover:scale-105 transition-all flex items-center gap-1">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="text-xl md:text-2xl font-black mb-3 text-black leading-tight">
                        {post.title}
                      </h2>

                      {/* Location & Tags */}
                      {post.location && (
                        <div className="inline-flex items-center gap-1 bg-[#F4F1E1] border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase mb-4 shadow-[1.5px_1.5px_0_rgba(0,0,0,1)]">
                          <MapPin className="w-3 h-3 text-pink-500 fill-current" /> {post.location}
                        </div>
                      )}

                      {/* Photo Gallery (if photos) */}
                      {post.pictures?.length > 0 && (
                        <div className="flex overflow-x-auto gap-3 pb-3 mb-4">
                          {post.pictures.map((pic, i) => (
                            <div key={i} className="shrink-0 border-2 border-black p-1 bg-white shadow-[2px_2px_0_rgba(0,0,0,1)] w-48">
                              <img src={pic} className="w-full h-32 object-cover border-b border-black" alt="Community Shared" />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Story Content / Itinerary Markdown */}
                      <div className="w-full break-words text-gray-800 font-medium leading-relaxed mb-4 whitespace-pre-wrap min-w-0">
                        {post.post_type === 'itinerary' ? (
                          <div className="border-l-4 border-[#FFD166] pl-4 py-1 bg-yellow-50/50">
                            <ReactMarkdown>{post.content}</ReactMarkdown>
                          </div>
                        ) : (
                          post.content
                        )}
                      </div>
                    </div>

                    {/* Interaction Buttons Bar */}
                    <div className="border-t-2 border-black bg-gray-50 px-5 py-3 flex items-center justify-between">
                      <button 
                        onClick={() => toggleComments(post.id)}
                        className={`flex items-center gap-2 text-xs font-black uppercase border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all ${isExpanded ? 'bg-[#FFDFD3]' : 'bg-white'}`}>
                        <MessageSquare className="w-4 h-4" /> {post.commentsCount || 0} Comments
                      </button>
                    </div>

                    {/* Comments section */}
                    {isExpanded && (
                      <div className="border-t-2 border-black bg-[#F4F1E1]/40 p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
                        <h4 className="font-black text-xs uppercase text-gray-500 mb-2">Comments Feed</h4>
                        
                        <div className="space-y-3">
                          {commentsLoading[post.id] ? (
                            <p className="text-xs font-bold text-center text-gray-500">Loading comments...</p>
                          ) : !commentsData[post.id] || commentsData[post.id].length === 0 ? (
                            <p className="text-xs font-bold text-gray-500 py-2">No comments yet. Start the conversation!</p>
                          ) : (
                            commentsData[post.id].map(comment => (
                              <div key={comment.id} className="border-2 border-black bg-white p-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                <div className="flex justify-between items-center text-[9px] font-black uppercase text-gray-500 mb-1 border-b pb-1 border-gray-100">
                                  <span className="text-[#FF1493]">{comment.authorPseudonym}</span>
                                  <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="font-semibold text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Comment Input */}
                        <form onSubmit={(e) => handlePostComment(e, post.id)} className="flex gap-2 pt-2">
                          <input 
                            type="text" 
                            placeholder="Add an anonymous comment..." 
                            value={commentInputs[post.id] || ''}
                            onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                            className="flex-1 border-2 border-black p-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FFB3BA] bg-white placeholder-gray-400" 
                          />
                          <button 
                            type="submit"
                            className="bg-[#BAE1FF] border-2 border-black px-4 font-black uppercase text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all shrink-0">
                            Post
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal - Create Community Group */}
      {showCreateCommunity && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-8 border-black shadow-[16px_16px_0px_rgba(0,0,0,1)] w-full max-w-lg p-6 md:p-8 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
               Create Community Group
            </h2>
            <form onSubmit={handleCreateCommunity} className="space-y-5 font-bold text-sm">
              <div>
                <label className="block mb-2 uppercase tracking-wide">Community Name *</label>
                <input 
                  required 
                  value={newCommunityForm.name} 
                  onChange={e => setNewCommunityForm({...newCommunityForm, name: e.target.value})} 
                  placeholder="e.g. solo-backpackers (lowercase, no spaces)" 
                  className="w-full border-4 border-black p-3 focus:outline-none focus:ring-4 focus:ring-[#FFB3BA] transition-all bg-white placeholder-gray-400" 
                />
              </div>

              <div>
                <label className="block mb-2 uppercase tracking-wide">Description</label>
                <textarea 
                  rows={3} 
                  value={newCommunityForm.description} 
                  onChange={e => setNewCommunityForm({...newCommunityForm, description: e.target.value})} 
                  placeholder="What is this channel about?" 
                  className="w-full border-4 border-black p-3 focus:outline-none focus:ring-4 focus:ring-[#FFB3BA] transition-all bg-white placeholder-gray-400 resize-none" 
                />
              </div>

              {communityError && (
                <div className="bg-[#FFB3BA] border-2 border-black p-3 text-xs uppercase tracking-wide font-black">
                  Error: {communityError}
                </div>
              )}

              <div className="pt-4 flex gap-4">
                <button 
                  type="submit" 
                  disabled={communitySaving}
                  className="bg-[#90EE90] border-4 border-black px-6 py-2.5 font-black uppercase shadow-[3px_3px_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all disabled:opacity-75">
                  {communitySaving ? 'Creating...' : 'Create'}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setShowCreateCommunity(false); setNewCommunityForm({ name: '', description: '' }); setCommunityError(''); }}
                  className="bg-[#FFB3BA] border-4 border-black px-6 py-2.5 font-black uppercase shadow-[3px_3px_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Create Anonymous Post */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-8 border-black shadow-[16px_16px_0px_rgba(0,0,0,1)] w-full max-w-2xl p-6 md:p-8 my-8 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
               Publish Anonymous Post
            </h2>
            
            <form onSubmit={handleCreatePost} className="space-y-4 font-bold text-sm">
              
              {/* Select Community */}
              <div>
                <label className="block mb-1.5 uppercase tracking-wide">Target Community *</label>
                <select 
                  required
                  value={newPostForm.communityId}
                  onChange={e => setNewPostForm({...newPostForm, communityId: e.target.value})}
                  className="w-full border-4 border-black p-3 focus:outline-none focus:ring-4 focus:ring-[#FFB3BA] transition-all bg-white cursor-pointer select-none">
                  <option value="" disabled>Select a community group...</option>
                  {communities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Type Select Tabs */}
              <div className="grid grid-cols-3 border-4 border-black">
                <button 
                  type="button"
                  onClick={() => setNewPostForm(prev => ({ ...prev, postType: 'general', selectedMemoryId: '', selectedItineraryId: '', title: '', content: '', location: '' }))}
                  className={`py-2 text-xs font-black uppercase border-r-4 border-black transition-all ${newPostForm.postType === 'general' ? 'bg-[#FFD166]' : 'bg-white hover:bg-gray-50'}`}>
                  General Post
                </button>
                <button 
                  type="button"
                  onClick={() => setNewPostForm(prev => ({ ...prev, postType: 'story', selectedMemoryId: '', selectedItineraryId: '', title: '', content: '', location: '' }))}
                  className={`py-2 text-xs font-black uppercase border-r-4 border-black transition-all ${newPostForm.postType === 'story' ? 'bg-[#FFB3BA]' : 'bg-white hover:bg-gray-50'}`}>
                  Import Story
                </button>
                <button 
                  type="button"
                  onClick={() => setNewPostForm(prev => ({ ...prev, postType: 'itinerary', selectedMemoryId: '', selectedItineraryId: '', title: '', content: '', location: '' }))}
                  className={`py-2 text-xs font-black uppercase transition-all ${newPostForm.postType === 'itinerary' ? 'bg-[#BAE1FF]' : 'bg-white hover:bg-gray-50'}`}>
                  Import Itinerary
                </button>
              </div>

              {/* Import Personal Story UI */}
              {newPostForm.postType === 'story' && (
                <div className="border-4 border-black p-4 bg-[#FFDFD3]/40">
                  <label className="block mb-1.5 uppercase tracking-wide text-xs">Select your Saved Story to Share</label>
                  <select 
                    value={newPostForm.selectedMemoryId}
                    onChange={e => handleSelectMemory(e.target.value)}
                    className="w-full border-2 border-black p-2.5 focus:outline-none focus:ring-2 focus:ring-[#FFB3BA] bg-white cursor-pointer">
                    <option value="">-- Choose one of your stored memories --</option>
                    {personalMemories.map(m => (
                      <option key={m.id} value={m.id}>{m.title} ({m.location || 'Unknown location'})</option>
                    ))}
                  </select>
                  {personalMemories.length === 0 && (
                    <p className="text-[10px] text-gray-500 mt-1 uppercase">You don't have any personal stories saved in your vault yet.</p>
                  )}
                </div>
              )}

              {/* Import Saved Itinerary UI */}
              {newPostForm.postType === 'itinerary' && (
                <div className="border-4 border-black p-4 bg-[#BAE1FF]/20">
                  <label className="block mb-1.5 uppercase tracking-wide text-xs">Select your Saved Itinerary to Share</label>
                  <select 
                    value={newPostForm.selectedItineraryId}
                    onChange={e => handleSelectItinerary(e.target.value)}
                    className="w-full border-2 border-black p-2.5 focus:outline-none focus:ring-2 focus:ring-[#FFB3BA] bg-white cursor-pointer">
                    <option value="">-- Choose one of your saved itineraries --</option>
                    {personalItineraries.map(it => (
                      <option key={it.id} value={it.id}>{it.days} Days in {it.destination}</option>
                    ))}
                  </select>
                  {personalItineraries.length === 0 && (
                    <p className="text-[10px] text-gray-500 mt-1 uppercase">You don't have any saved itineraries in your vault yet.</p>
                  )}
                </div>
              )}

              {/* Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 uppercase tracking-wide text-xs">Post Title *</label>
                  <input 
                    required 
                    value={newPostForm.title} 
                    onChange={e => setNewPostForm({...newPostForm, title: e.target.value})} 
                    placeholder="e.g. Marrakech secrets unveiled..." 
                    className="w-full border-4 border-black p-3 focus:outline-none focus:ring-4 focus:ring-[#FFB3BA] transition-all bg-white placeholder-gray-400" 
                  />
                </div>
                <div>
                  <label className="block mb-1 uppercase tracking-wide text-xs">Destination / Location</label>
                  <input 
                    value={newPostForm.location} 
                    onChange={e => setNewPostForm({...newPostForm, location: e.target.value})} 
                    placeholder="e.g. Marrakech, Morocco (optional)" 
                    className="w-full border-4 border-black p-3 focus:outline-none focus:ring-4 focus:ring-[#FFB3BA] transition-all bg-white placeholder-gray-400" 
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 uppercase tracking-wide text-xs">Post Body Content * (Itineraries will render Markdown)</label>
                <textarea 
                  required 
                  rows={5} 
                  value={newPostForm.content} 
                  onChange={e => setNewPostForm({...newPostForm, content: e.target.value})} 
                  placeholder="Share details, transit recommendations, dining tips, and experiences..." 
                  className="w-full border-4 border-black p-3 focus:outline-none focus:ring-4 focus:ring-[#FFB3BA] transition-all bg-white placeholder-gray-400 resize-none font-medium" 
                />
              </div>

              {/* Image upload (only for general post, imported stories copy photos) */}
              {newPostForm.postType === 'general' && (
                <div>
                  <label className="block mb-1.5 uppercase tracking-wide text-xs">Photos (Max 5)</label>
                  <div className="flex flex-col items-start gap-2">
                    <label className="bg-[#BAE1FF] border-2 border-black px-4 py-2 font-black uppercase cursor-pointer shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_rgba(0,0,0,1)] transition-all flex items-center gap-1.5 text-xs">
                      <Upload className="w-3.5 h-3.5" /> Upload Photos
                      <input type="file" multiple accept="image/*" className="hidden" onChange={e => setImageFiles(prev => [...prev, ...Array.from(e.target.files)].slice(0, 5))} />
                    </label>
                    {imageFiles.length > 0 && <p className="font-black text-xs bg-black text-white px-2 py-0.5">{imageFiles.length} photo(s) selected</p>}
                  </div>
                </div>
              )}

              {/* Photos indicator for imported story */}
              {newPostForm.postType === 'story' && postPictures.length > 0 && (
                <div className="bg-black text-white px-3 py-1.5 flex items-center gap-2 text-xs">
                  <ImageIcon className="w-4 h-4 text-[#FFD166]" />
                  <span>Found {postPictures.length} pictures in your vault memory. They will be shared anonymously.</span>
                </div>
              )}

              <div className="pt-2 flex gap-4">
                <button 
                  type="submit" 
                  disabled={postSaving}
                  className="bg-[#90EE90] border-4 border-black px-6 py-2.5 font-black uppercase shadow-[3px_3px_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all disabled:opacity-75 flex items-center gap-1.5">
                  {postSaving ? 'Publishing...' : 'Publish'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowCreatePost(false);
                    setNewPostForm({ title: '', content: '', postType: 'general', location: '', communityId: '', selectedMemoryId: '', selectedItineraryId: '' });
                    setPostPictures([]);
                    setImageFiles([]);
                  }}
                  className="bg-[#FFB3BA] border-4 border-black px-6 py-2.5 font-black uppercase shadow-[3px_3px_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
