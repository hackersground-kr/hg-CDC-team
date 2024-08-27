import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./KaKaoMap.module.css";
import MyMarker from "../../assets/images/my-marker.png";
import Marker from "../../assets/images/marker.png";
import SearchIcon from "../../assets/images/search-icon.png";
import CurrentLocationIcon from "../../assets/images/current-location-icon.png";
import WritePostIcon from "../../assets/images/write-post-icon.png";
import usePost from "../../hooks/usePost";
import PostDetail from "../../pages/Post/PostDetail/PostDetail";

function KaKaoMap() {
  const [map, setMap] = useState(null);
  const currentMarkerRef = useRef(null);
  const myLocationMarkerRef = useRef(null);
  const [currentAddress, setCurrentAddress] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const placeService = useRef(null);
  const location = useLocation();
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);

  const { posts, fetchPosts } = usePost();

  const handleMarkerClick = useCallback(
    (markerId) => {
      const post = posts.find((post) => post.id === markerId);
      setSelectedPost(post);
    },
    [posts]
  );

  useEffect(() => {
    if (location.state && location.state.selectedPost) {
      const post = posts.find((p) => p.id === location.state.selectedPost.id);
      if (post && map) {
        const position = new window.kakao.maps.LatLng(
          post.latitude,
          post.longitude
        );
        map.setCenter(position);
        setTimeout(() => {
          setSelectedPost(post);
        }, 1000);
      }
    }
  }, [location, posts, map]);

  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      const container = document.getElementById("map");
      const options = {
        center: new window.kakao.maps.LatLng(33.450701, 126.570667),
        level: 3,
      };
      const kakaoMap = new window.kakao.maps.Map(container, options);
      setMap(kakaoMap);

      placeService.current = new window.kakao.maps.services.Places();

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          const currentPosition = new window.kakao.maps.LatLng(
            latitude,
            longitude
          );
          kakaoMap.setCenter(currentPosition);

          const myLocationMarker = new window.kakao.maps.Marker({
            position: currentPosition,
            map: kakaoMap,
            image: new window.kakao.maps.MarkerImage(
              MyMarker,
              new window.kakao.maps.Size(45, 40),
              { offset: new window.kakao.maps.Point(16, 34) }
            ),
          });
          myLocationMarkerRef.current = myLocationMarker;

          const geocoder = new window.kakao.maps.services.Geocoder();
          geocoder.coord2Address(longitude, latitude, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              const address = result[0].address.address_name;
              setCurrentAddress(address);
            }
          });
        });
      }

      const clickListener = (mouseEvent) => {
        const latlng = mouseEvent.latLng;
        if (currentMarkerRef.current) {
          currentMarkerRef.current.setMap(null);
        }

        const marker = new window.kakao.maps.Marker({
          position: latlng,
          map: kakaoMap,
          image: new window.kakao.maps.MarkerImage(
            Marker,
            new window.kakao.maps.Size(31, 35),
            { offset: new window.kakao.maps.Point(16, 34) }
          ),
        });

        window.kakao.maps.event.addListener(marker, "click", () =>
          handleMarkerClick(marker.getPosition().toString())
        );
        currentMarkerRef.current = marker;
      };

      window.kakao.maps.event.addListener(kakaoMap, "click", clickListener);

      return () => {
        window.kakao.maps.event.removeListener(
          kakaoMap,
          "click",
          clickListener
        );
      };
    }
  }, [handleMarkerClick]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (map && posts.length > 0) {
      posts.forEach((post) => {
        const marker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(post.latitude, post.longitude),
          map: map,
          image: new window.kakao.maps.MarkerImage(
            Marker,
            new window.kakao.maps.Size(31, 35),
            { offset: new window.kakao.maps.Point(16, 34) }
          ),
        });

        window.kakao.maps.event.addListener(marker, "click", () => {
          handleMarkerClick(post.id);
        });
      });
    }
  }, [map, posts, handleMarkerClick]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/location");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.code === 200) {
          data.result.forEach((location) => {
            const marker = new window.kakao.maps.Marker({
              map: map,
              position: new window.kakao.maps.LatLng(
                location.latitude,
                location.longitude
              ),
              title: location.SC_NAME,
            });

            window.kakao.maps.event.addListener(marker, "click", () => {
              setSelectedPost(location); // AI가 가져온 데이터를 선택된 포스트로 설정
            });
          });
        } else {
          console.error("Error fetching locations:", data.msg);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    if (map) {
      fetchLocations();
    }
  }, [map]);

  const handleCurrentLocationButton = () => {
    if (navigator.geolocation && map) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const currentPosition = new window.kakao.maps.LatLng(
          latitude,
          longitude
        );
        map.setCenter(currentPosition);

        if (myLocationMarkerRef.current) {
          myLocationMarkerRef.current.setMap(null);
        }

        const myLocationMarker = new window.kakao.maps.Marker({
          position: currentPosition,
          map: map,
          image: new window.kakao.maps.MarkerImage(
            MyMarker,
            new window.kakao.maps.Size(45, 40),
            { offset: new window.kakao.maps.Point(16, 34) }
          ),
        });
        myLocationMarkerRef.current = myLocationMarker;
      });
    }
  };

  const handleWritePostButton = () => {
    if (currentMarkerRef.current) {
      const position = currentMarkerRef.current.getPosition();
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.coord2Address(
        position.getLng(),
        position.getLat(),
        (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const address = result[0].address.address_name;
            navigate("/post/create", {
              state: {
                address: address,
                position: { lat: position.getLat(), lng: position.getLng() },
              },
            });
          } else {
            alert("주소를 가져오는데 실패했습니다. 다시 시도해주세요.");
          }
        }
      );
    } else {
      alert("위치를 선택해주세요.");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchKeyword.trim()) {
      alert("키워드를 입력해주세요!");
      return;
    }

    placeService.current.keywordSearch(searchKeyword, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const searchResultItems = data.map((item) => ({
          id: item.id,
          position: new window.kakao.maps.LatLng(
            Number(item.y),
            Number(item.x)
          ),
          title: item.place_name,
          address: item.address_name,
        }));
        setSearchResults(searchResultItems);
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        alert("검색 결과가 존재하지 않습니다.");
      } else if (status === window.kakao.maps.services.Status.ERROR) {
        alert("검색 중 오류가 발생했습니다.");
      }
    });
  };

  const handleSearchItemClick = (item) => {
    map.setCenter(item.position);
    map.setLevel(3);

    if (currentMarkerRef.current) {
      currentMarkerRef.current.setMap(null);
    }

    const marker = new window.kakao.maps.Marker({
      position: item.position,
      map: map,
      image: new window.kakao.maps.MarkerImage(
        Marker,
        new window.kakao.maps.Size(31, 35),
        { offset: new window.kakao.maps.Point(16, 34) }
      ),
    });

    currentMarkerRef.current = marker;
  };

  const toggleSearchBar = () => {
    setIsSearchBarVisible(!isSearchBarVisible);
  };

  return (
    <div className={styles.container}>
      <div className={styles.navbar}>
        <button onClick={toggleSearchBar} className={styles.navButton}>
          <img src={SearchIcon} alt="Search" className={styles.searchIcon} />
        </button>
        {isSearchBarVisible && (
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="장소 검색"
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton}>
              <img
                src={SearchIcon}
                alt="Search"
                className={styles.searchIcon}
              />
            </button>
          </form>
        )}
      </div>
      {isSearchBarVisible && searchResults.length > 0 && (
        <div className={styles.searchResultsContainer}>
          <ul className={styles.searchResultList}>
            {searchResults.map((item, index) => (
              <li
                key={item.id}
                onClick={() => handleSearchItemClick(item)}
                className={styles.searchResultItem}
              >
                <div className={styles.searchResultTitle}>{`${index + 1}. ${
                  item.title
                }`}</div>
                <div className={styles.searchResultAddress}>{item.address}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className={styles.mapContainer}>
        <div id="map" className={styles.map}></div>
        <div className={styles.buttonContainer}>
          <button
            onClick={handleCurrentLocationButton}
            className={styles.mapButton}
          >
            <img src={CurrentLocationIcon} alt="현재 위치" />
          </button>
          <button onClick={handleWritePostButton} className={styles.mapButton}>
            <img src={WritePostIcon} alt="게시글 작성" />
          </button>
        </div>
        {selectedPost && (
          <div className={styles.postDetailOverlay}>
            <PostDetail
              post={selectedPost}
              onClose={() => setSelectedPost(null)}
              isAuthor={true}
              id={selectedPost.id}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default KaKaoMap;
