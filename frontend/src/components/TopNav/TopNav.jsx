import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./TopNav.module.css";
import logo from "../../assets/images/logo.png";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";

function TopNav({ isLoggedIn, setIsLoggedIn }) {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsLoggedIn(false);
    setShowModal(false);
    navigate("/");
  };

  return (
    <nav className={styles.topNav}>
      <div className={styles.container}>
        <Link to="/">
          <img src={logo} alt="LOGO" className={styles.logo} />
        </Link>
        {isLoggedIn ? (
          <>
            <Link to="/posts" className={styles.Link}>
              게시글
            </Link>
            <Link to="/profile" className={styles.Link}>
              프로필
            </Link>
            <Button onClick={handleLogout} style={{ width: "auto" }}>
              로그아웃
            </Button>
          </>
        ) : (
          <>
            <h1 className={styles.navText}>씨다씨</h1>
            <Link to="/signin">
              <Button style={{ width: "100%" }}>로그인</Button>
            </Link>
          </>
        )}
      </div>
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmLogout}
        message="로그아웃 하시겠습니까?"
      />
    </nav>
  );
}

export default TopNav;
