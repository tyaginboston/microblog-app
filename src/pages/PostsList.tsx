import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PostCard } from '../components/PostCard';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { useStore } from '../hooks';
import { postsStore } from '../store';
import type { Post } from '../types/api';
import './PostsList.css';

export function PostsList() {
  // Using RxJS store instead of React useState (replaces Redux useSelector)
  const { posts, loading, error } = useStore(postsStore);
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger loading posts using RxJS action (replaces Redux dispatch)
    postsStore.loadPosts();
  }, []);

  const handlePostClick = (post: Post) => {
    navigate(`/post/${post.id}`);
  };

  const handleRetry = () => {
    // Retry loading posts using RxJS action
    postsStore.loadPosts();
  };

  if (loading) {
    return <Loading message="Loading posts..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={handleRetry} />;
  }

  return (
    <div className="posts-list-container">
      <header className="posts-header">
        <h1>Kubecost Microblog</h1>
        <p className="subtitle">Now powered by RxJS state management!</p>
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
