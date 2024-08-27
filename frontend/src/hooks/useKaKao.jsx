import { useEffect, useState, useRef, useCallback } from "react";
import MyMarker from "../assets/images/my-marker.png";
import Marker from "../assets/images/marker.png";

const useKaKao = (handleMarkerClick) => {
  const [map, setMap] = useState(null);
  const currentMarkerRef = useRef(null);
  const myLocationMarkerRef = useRef(null);
  const placeService = useRef(null);

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

  const addMarkers = useCallback(
    (locations) => {
      if (map) {
        locations.forEach((location) => {
          const marker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(
              location.latitude,
              location.longitude
            ),
            map: map,
            image: new window.kakao.maps.MarkerImage(
              Marker,
              new window.kakao.maps.Size(31, 35),
              { offset: new window.kakao.maps.Point(16, 34) }
            ),
          });

          window.kakao.maps.event.addListener(marker, "click", () => {
            handleMarkerClick(location.id);
          });
        });
      }
    },
    [map, handleMarkerClick]
  );

  return {
    map,
    addMarkers,
    placeService,
    currentMarkerRef,
    myLocationMarkerRef,
  };
};

export default useKaKao;
