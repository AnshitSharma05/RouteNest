import express from 'express';
import { requireAuth, getAuth } from '@clerk/express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();
function getPseudonym(userId) {
  if (!userId) return 'Anonymous';
  const adjectives = ['Wandering', 'Nomadic', 'Adventurous', 'Curious', 'Lost', 'Sunny', 'Wild', 'Jolly', 'Daring', 'Spirited', 'Roamer', 'Wayfarer'];
  const nouns = ['Panda', 'Explorer', 'Traveler', 'Backpacker', 'Koala', 'Nomad', 'Fox', 'Eagle', 'Otter', 'Penguin', 'Wolf', 'Deer'];

  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const adjIndex = Math.abs(hash) % adjectives.length;
  const nounIndex = Math.abs(hash >> 2) % nouns.length;
  const num = Math.abs(hash >> 4) % 1000;

  return `${adjectives[adjIndex]} ${nouns[nounIndex]} #${num}`;
}
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({ error: 'Failed to fetch communities' });
  }
});
router.post('/', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    let { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Community name is required' });
    }

    name = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    if (!name) {
      return res.status(400).json({ error: 'Invalid community name' });
    }

    const { data, error } = await supabase
      .from('communities')
      .insert([{ name, description, created_by: userId }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'A community with this name already exists' });
      }
      throw error;
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating community:', error);
    res.status(500).json({ error: 'Failed to create community' });
  }
});
router.get('/posts', async (req, res) => {
  try {
    let userId = null;
    try {
      const auth = getAuth(req);
      userId = auth?.userId;
    } catch (_) {
    }

    const { data: posts, error } = await supabase
      .from('community_posts')
      .select(`
        *,
        communities(name),
        community_comments(id),
        community_post_votes(user_id, vote)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const postsWithDetails = posts.map(post => {
      const commentsCount = post.community_comments ? post.community_comments.length : 0;

      let upvotes = 0;
      let downvotes = 0;
      let userVote = 0;

      if (post.community_post_votes) {
        post.community_post_votes.forEach(v => {
          if (v.vote === 1) upvotes++;
          if (v.vote === -1) downvotes++;
          if (userId && v.user_id === userId) {
            userVote = v.vote;
          }
        });
      }

      const score = upvotes - downvotes;
      const authorPseudonym = getPseudonym(post.user_id);
      const isOwner = userId && post.user_id === userId;

      const { community_comments, community_post_votes, ...cleanPost } = post;
      return {
        ...cleanPost,
        communityName: post.communities?.name || 'unknown',
        commentsCount,
        score,
        userVote,
        authorPseudonym,
        isOwner
      };
    });

    res.json(postsWithDetails);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});
router.get('/:communityId/posts', async (req, res) => {
  try {
    const { communityId } = req.params;
    let userId = null;
    try {
      const auth = getAuth(req);
      userId = auth?.userId;
    } catch (_) {
    }

    const { data: posts, error } = await supabase
      .from('community_posts')
      .select(`
        *,
        community_comments(id),
        community_post_votes(user_id, vote)
      `)
      .eq('community_id', communityId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const postsWithDetails = posts.map(post => {
      const commentsCount = post.community_comments ? post.community_comments.length : 0;

      let upvotes = 0;
      let downvotes = 0;
      let userVote = 0;

      if (post.community_post_votes) {
        post.community_post_votes.forEach(v => {
          if (v.vote === 1) upvotes++;
          if (v.vote === -1) downvotes++;
          if (userId && v.user_id === userId) {
            userVote = v.vote;
          }
        });
      }

      const score = upvotes - downvotes;
      const authorPseudonym = getPseudonym(post.user_id);
      const isOwner = userId && post.user_id === userId;

      const { community_comments, community_post_votes, ...cleanPost } = post;
      return {
        ...cleanPost,
        commentsCount,
        score,
        userVote,
        authorPseudonym,
        isOwner
      };
    });

    res.json(postsWithDetails);
  } catch (error) {
    console.error('Error fetching community posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});
router.post('/:communityId/posts', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { communityId } = req.params;
    const { title, content, post_type, location, pictures, original_memory_id, original_itinerary_id } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const { data, error } = await supabase
      .from('community_posts')
      .insert([
        {
          community_id: communityId,
          user_id: userId,
          title,
          content,
          post_type: post_type || 'general',
          location: location || null,
          pictures: pictures || [],
          original_memory_id: original_memory_id || null,
          original_itinerary_id: original_itinerary_id || null
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      ...data,
      commentsCount: 0,
      score: 0,
      userVote: 0,
      authorPseudonym: getPseudonym(userId),
      isOwner: true
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});
router.delete('/posts/:postId', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { postId } = req.params;

    const { data, error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId)
      .select();

    if (error) throw error;

    if (data.length === 0) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});
router.post('/posts/:postId/vote', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { postId } = req.params;
    const { vote } = req.body;

    if (![1, -1, 0].includes(vote)) {
      return res.status(400).json({ error: 'Invalid vote value' });
    }

    if (vote === 0) {
      const { error } = await supabase
        .from('community_post_votes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (error) throw error;
    } else {

      const { error } = await supabase
        .from('community_post_votes')
        .upsert(
          { post_id: postId, user_id: userId, vote },
          { onConflict: 'post_id,user_id' }
        );

      if (error) throw error;
    }
    const { data: votes, error: fetchErr } = await supabase
      .from('community_post_votes')
      .select('vote')
      .eq('post_id', postId);

    if (fetchErr) throw fetchErr;

    let score = 0;
    votes.forEach(v => {
      score += v.vote;
    });

    res.json({ score, userVote: vote });
  } catch (error) {
    console.error('Error voting on post:', error);
    res.status(500).json({ error: 'Failed to submit vote' });
  }
});
router.get('/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const { data, error } = await supabase
      .from('community_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const commentsWithUsernames = data.map(c => ({
      ...c,
      authorPseudonym: getPseudonym(c.user_id)
    }));

    res.json(commentsWithUsernames);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});
router.post('/posts/:postId/comments', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const { data, error } = await supabase
      .from('community_comments')
      .insert([
        {
          post_id: postId,
          user_id: userId,
          content: content.trim()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      ...data,
      authorPseudonym: getPseudonym(userId)
    });
  } catch (error) {
    console.error('Error posting comment:', error);
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

export default router;
