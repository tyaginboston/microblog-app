import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PostCard } from '../components/PostCard';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { useStore, useObservable } from '../hooks';
import { postsStore, usersStore } from '../store';
import type { Post } from '../types/api';
import './AuthorPosts.css';

export function AuthorPosts() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  // Using RxJS stores for posts and user data
  const { posts, loading: postsLoading, error: postsError } = useStore(postsStore);
  const { loading: userLoading, error: userError } = useStore(usersStore);
  
  // Get specific user data using RxJS observable
  const author = useObservable(
    usersStore.getUser$(parseInt(userId || '0')),
    null
  );

  useEffect(() => {
    if (userId) {
      const authorId = parseInt(userId);
      // Load posts by user and user details using RxJS actions
      postsStore.loadPostsByUser(authorId);
      usersStore.loadUser(authorId);
    }
  }, [userId]);

  const handlePostClick = (post: Post) => {
    navigate(`/post/${post.id}`);
  };

  const handleRetry = () => {
    if (userId) {
      const authorId = parseInt(userId);
      postsStore.loadPostsByUser(authorId);
      usersStore.loadUser(authorId);
    }
  };

  const loading = postsLoading || userLoading;
  const error = postsError || userError;

  if (loading) {
    return <Loading message="Loading author posts..." />;
  }

  if (error || !author) {
    return (
      <ErrorMessage 
        message={error || 'Author not found'} 
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="author-posts-container">
      <nav className="breadcrumb">
        <Link to="/" className="breadcrumb-link">← Back to All Posts</Link>
      </nav>

      <header className="author-header">
        <div className="author-profile">
          <h1>{author.name}</h1>
          <p className="author-username">@{author.username}</p>
          <div className="author-details">
            <p><strong>Email:</strong> {author.email}</p>
            <p><strong>Phone:</strong> {author.phone}</p>
            <p><strong>Website:</strong> {author.website}</p>
            <p><strong>Company:</strong> {author.company.name}</p>
            <p><strong>Location:</strong> {author.address.city}</p>
          </div>
        </div>
      </header>

      <section className="posts-section">
        <h2>Posts by {author.name} ({posts.length})</h2>
        {posts.length > 0 ? (
          <div className="posts-grid">
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onClick={handlePostClick}
              />
            ))}
          </div>
        ) : (
          <p className="no-posts">This author hasn't written any posts yet.</p>
        )}
      </section>
    </div>
  );
}
