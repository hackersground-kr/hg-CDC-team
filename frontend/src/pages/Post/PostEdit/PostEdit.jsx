import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import usePost from "../../../hooks/usePost";
import Button from "../../../components/Button/Button";
import styles from "./PostEdit.module.css";
import upload from "../../../assets/images/upload.png";

const PostEdit = () => {
  const { id } = useParams();
  const { fetchPost, post, updatePost, loading, error } = usePost();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [address, setAddress] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadPost = async () => {
      await fetchPost(id);
    };
    loadPost();
  }, [id, fetchPost]);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setAddress(post.address);
      if (post.imageUrl) {
        setImage(post.imageUrl);
      } else {
        setImage(null);
      }
    }
  }, [post]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("address", address);
    if (image instanceof File) {
      formData.append("image", image);
    }
    await updatePost(id, formData);
    setSuccessMessage("게시글이 성공적으로 수정되었습니다!");
    setTimeout(() => navigate(`/posts/${id}`), 1000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.addressBar}>
        <span>{address}</span>
      </div>
      <input
        type="text"
        placeholder="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={styles.input}
        required
      />
      <textarea
        placeholder="내용"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className={styles.textarea}
        required
      />
      <div
        className={`${styles.fileInputWrapper} ${
          isDragging ? styles.dragging : ""
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleFileButtonClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className={styles.fileInput}
          accept="image/*"
        />
        <div className={styles.fileButton}>
          <img
            src={
              image instanceof File
                ? URL.createObjectURL(image)
                : image || upload
            }
            alt="Upload"
            className={styles.uploadIcon}
          />
          <span>{image ? "파일 첨부됨" : "여기에 파일을 끌어다 놓습니다"}</span>
        </div>
      </div>
      <Button type="submit" disabled={loading}>
        게시글 수정
      </Button>
      {error && <p className={styles.error}>{error.message}</p>}
      {successMessage && <p className={styles.success}>{successMessage}</p>}
    </form>
  );
};

export default PostEdit;
