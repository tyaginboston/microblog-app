import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchPost, fetchComments, fetchUser } from '../services/api';
import { CommentCard } from '../components/CommentCard';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import type { Post, Comment, User } from '../types/api';
import './PostDetail.css';

export function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPostData(parseInt(id));
    }
  }, [id]);

  const loadPostData = async (postId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const [postData, commentsData] = await Promise.all([
        fetchPost(postId),
        fetchComments(postId)
      ]);

      setPost(postData);
      setComments(commentsData);

      const authorData = await fetchUser(postData.userId);
      setAuthor(authorData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorClick = () => {
    if (author) {
      navigate(`/author/${author.id}`);
    }
  };

  if (loading) {
    return <Loading message="Loading post details..." />;
  }

  if (error || !post) {
    return (
      <ErrorMessage 
        message={error || 'Post not found'} 
        onRetry={() => id && loadPostData(parseInt(id))}
      />
    );
  }

  return (
    <div className="post-detail-container">
      <nav className="breadcrumb">
        <Link to="/" className="breadcrumb-link">← Back to Posts</Link>
      </nav>

      <article className="post-detail">
        <header className="post-detail-header">
          <h1 className="post-detail-title">{post.title}</h1>
          <div className="post-placeholder-image"></div>
        </header>

        <div className="post-detail-content">
          <p className="post-detail-body">{post.body}</p>
          
          {author && (
            <div className="author-section">
              <h3>About the Author</h3>
              <div className="author-info">
                <div className="author-details">
                  <h4>{author.name}</h4>
                  <p>@{author.username}</p>
                  <p>{author.email}</p>
                  <p>{author.company.name}</p>
                </div>
                <button 
                  className="view-author-posts-btn"
                  onClick={handleAuthorClick}
                >
                  View all posts by {author.name}
                </button>
              </div>
            </div>
          )}
        </div>
      </article>

      <section className="comments-section">
        <h2>Comments ({comments.length})</h2>
        {comments.length > 0 ? (
          <div className="comments-list">
            {comments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </div>
        ) : (
          <p className="no-comments">No comments yet.</p>
        )}
      </section>
    </div>
  );
}
