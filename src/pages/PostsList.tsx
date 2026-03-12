import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPosts } from '../services/api';
import { PostCard } from '../components/PostCard';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import type { Post } from '../types/api';
import './PostsList.css';

export function PostsList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const postsData = await fetchPosts();
      setPosts(postsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (post: Post) => {
    navigate(`/post/${post.id}`);
  };

  if (loading) {
    return <Loading message="Loading posts..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadPosts} />;
  }

  return (
    <div className="posts-list-container">
      <header className="posts-header">
        <h1>Microblog</h1>
      </header>
      <main className="posts-grid">
        {posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            onClick={handlePostClick}
          />
        ))}
      </main>
    </div>
  );
}
