import type { Post } from '../types/api';
import './PostCard.css';

interface PostCardProps {
  post: Post;
  onClick: (post: Post) => void;
}

export function PostCard({ post, onClick }: PostCardProps) {
  return (
    <article 
      className="post-card" 
      onClick={() => onClick(post)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(post);
        }
      }}
    >
      <h2 className="post-title">{post.title}</h2>
      <p className="post-body">{post.body}</p>
      <div className="post-meta">
        <span className="post-id">Post #{post.id}</span>
        <span className="post-user">User #{post.userId}</span>
      </div>
    </article>
  );  
}
