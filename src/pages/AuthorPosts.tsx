import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchPostsByUser, fetchUser } from '../services/api';
import { PostCard } from '../components/PostCard';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import type { Post, User } from '../types/api';
import './AuthorPosts.css';

export function AuthorPosts() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [author, setAuthor] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadAuthorData(parseInt(userId));
    }
  }, [userId]);

  const loadAuthorData = async (authorId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const [postsData, authorData] = await Promise.all([
        fetchPostsByUser(authorId),
        fetchUser(authorId)
      ]);

      setPosts(postsData);
      setAuthor(authorData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load author data');
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (post: Post) => {
    navigate(`/post/${post.id}`);
  };

  if (loading) {
    return <Loading message="Loading author posts..." />;
  }

  if (error || !author) {
    return (
      <ErrorMessage 
        message={error || 'Author not found'} 
        onRetry={() => userId && loadAuthorData(parseInt(userId))}
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
