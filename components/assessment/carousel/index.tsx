"use client";

import AliceCarousel from "react-alice-carousel";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import "./MyCarousel.css";
import "./MyCarousel.module.css";
interface CustomCarouselProps {
  items: any[];
  subject?: boolean;
  isClassroom?: boolean;
}

const CustomCarousel: React.FC<CustomCarouselProps> = ({
  items,
  subject,
  isClassroom,
}) => {
  const [currentIndex, setCurrentIndex] = useState({
    item: 0,
    isNextSlideDisabled: false,
    isPrevSlideDisabled: true,
  });

  const [isPrevSlide, setIsPrevSlide] = useState(false);
  const [isNextSlide, setIsNextSlide] = useState(
    (subject && items && items.length < 14) ||
      (!subject && !isClassroom && items && items.length < 6) ||
      (isClassroom && items && items.length < 3)
      ? false
      : true
  );

  const [hasItems, setHasItems] = useState(false);

  const responsive = {
    0: { items: 1 },
    568: { items: 2 },
    1024: { items: 3 },
  };

  useEffect(() => {
    if (items && items.length) {
      setHasItems(items.length > 0);
    } else {
      setHasItems(false);
    }
  }, [items, subject, isClassroom]);

  const handleSlideChanged = (e: any) => {
    setCurrentIndex(e);
    setIsPrevSlide(e.item > 1);
    let isNext = false;
    if (subject) {
      isNext = e.item + 14 <= items.length;
    } else {
      if (isClassroom) {
        isNext = e.item + 3 <= items.length;
      } else {
        e.item + 6 <= items.length;
      }
    }
    setIsNextSlide(isNext);
  };

  return (
    <AliceCarousel
      mouseTracking
      autoWidth
      controlsStrategy="alternate"
      responsive={responsive}
      disableDotsControls
      disableButtonsControls={items?.length < 0}
      onSlideChanged={handleSlideChanged}
      renderPrevButton={() =>
        currentIndex.item > 0 ? (
          <a>
            <FontAwesomeIcon icon={faAngleLeft} size="2xl" />
          </a>
        ) : null
      }
      renderNextButton={() =>
        isNextSlide ? (
          <a>
            <FontAwesomeIcon icon={faAngleRight} size="2xl" />
          </a>
        ) : null
      }
      items={items}
    />
  );
};

export default CustomCarousel;
