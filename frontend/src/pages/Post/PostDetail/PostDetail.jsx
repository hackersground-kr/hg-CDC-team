import React, { useCallback, useEffect, useState } from "react";
import styles from "./PostDetail.module.css";
import dummy from "../../../assets/images/logo.png";
import data from "../../../assets/images/data.png";
import { useNavigate, useParams } from "react-router-dom";
import usePost from "../../../hooks/usePost";
import useComment from "../../../hooks/useComment";
import useLike from "../../../hooks/useLike";
import Modal from "../../../components/Modal/Modal";
import Comment from "../../../components/Comment/Comment";
import useAuth from "../../../hooks/useAuth";

function PostDetail({ post, onClose, isAuthor, id }) {
  const { fetchPost, deletePost, loading, error } = usePost();
  const { likeCount, isLiked, toggleLike } = useLike(id);
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [newComment, setNewComment] = useState("");
  const {
    comments,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
  } = useComment(id);

  const loadPost = useCallback(async () => {
    await fetchPost(id);
    await fetchComments();
  }, [id, fetchPost, fetchComments]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  // if (!post) return null;

  const handleEdit = () => {
    navigate(`/post/edit/${id}`);
  };

  const handleDelete = async () => {
    await deletePost(id);
    navigate("/posts");
  };

  const handleLike = () => {
    toggleLike();
  };

  const confirmDelete = () => {
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    await handleDelete();
    setShowModal(false);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      await createComment({ content: newComment });
      setNewComment("");
      await fetchComments(); // 댓글 목록을 다시 불러옵니다.
    }
  };

  const handleCommentReply = async (parentId, content) => {
    await createComment({ content, parentCommentId: parentId });
    await fetchComments(); // 댓글 목록을 다시 불러옵니다.
  };

  const handleCommentEdit = async (commentId, content) => {
    await updateComment(commentId, { content });
    await fetchComments(); // 댓글 목록을 다시 불러옵니다.
  };

  const handleCommentDelete = async (commentId) => {
    await deleteComment(commentId);
    await fetchComments(); // 댓글 목록을 다시 불러옵니다.
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCommentSubmit(e);
    }
  };

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p className={styles.error}>{error.message}</p>;
  if (!post) return <p>게시글을 찾을 수 없습니다.</p>;

  return (
    <div className={styles.container}>
      <button className={styles.closeButton} onClick={onClose}>
        &times;
      </button>
      <div className={styles.addressBar}>
        <span>{post.address}</span>
      </div>
      <img src={post.imageUrl} alt="Image" className={styles.image} />
      <div className={styles.content}>
        <h2 className={styles.title}>{post.title}</h2>
        <p className={styles.description}>{post.content}</p>
        <div className={styles.likeSection}>
          <button onClick={handleLike} className={styles.likeButton}>
            {isLiked ? "💙" : "🤍"} {likeCount}
          </button>
        </div>
      </div>
      {/* <img src={data} alt="Data" className={styles.image} /> */}
      {isAuthor && (
        <div className={styles.menu}>
          <button
            className={styles.menuButton}
            onClick={() => setShowMenu(!showMenu)}
          >
            ⋮
          </button>
          {showMenu && (
            <div className={styles.dropdown}>
              <button className={styles.dropdownButton} onClick={handleEdit}>
                수정
              </button>
              <button className={styles.dropdownButton} onClick={confirmDelete}>
                삭제
              </button>
            </div>
          )}
        </div>
      )}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmDelete}
        message="게시글을 정말로 삭제하시겠습니까?"
      />
      <div className={styles.commentSection}>
        <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="댓글을 입력하세요..."
            className={styles.commentInput}
            required
          />
          <button type="submit" className={styles.commentButton}>
            등록
          </button>
        </form>
        <div className={styles.comments}>
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              onReply={handleCommentReply}
              onEdit={handleCommentEdit}
              onDelete={handleCommentDelete}
              currentUserId={user?.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default PostDetail;
