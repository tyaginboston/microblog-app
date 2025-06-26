import type { Comment } from '../types/api';
import './CommentCard.css';

interface CommentCardProps {
  comment: Comment;
}

export function CommentCard({ comment }: CommentCardProps) {
  return (
    <div className="comment-card">
      <div className="comment-header">
        <h4 className="comment-name">{comment.name}</h4>
        <span className="comment-email">{comment.email}</span>
      </div>
      <p className="comment-body">{comment.body}</p>
    </div>
  );
}
