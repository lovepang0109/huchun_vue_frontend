import React, { useState, useEffect, useRef } from "react";
import { alert, success, error, confirm } from "alertifyjs";
import * as favorSvc from "@/services/favaorite-service";
import * as courseSvc from "@/services/courseService";
import * as seriesSvc from "@/services/testseriesService";
import { useRouter } from "next/navigation";

const FavoriteButton = ({ item, type, changed }: any) => {
  const [addedToCart, setAddedToCart] = useState<boolean>(false);
  const router = useRouter();

  const addFavorite = async () => {
    if (type == "test") {
      await favorSvc.create({
        practiceSetId: item._id,
      });
    } else if (type == "course") {
      await courseSvc.addFavorite(item._id);
    } else if (type == "testseries") {
      await seriesSvc.addFavorite(item._id);
    } else {
      return;
    }

    item.isFavorite = true;
    changed({ _id: item._id, favorite: true });
    success("Added to favorites successfully.");
  };
  const removeFavorite = async () => {
    if (type == "test") {
      await favorSvc.deleteFav(item._id);
    } else if (type == "course") {
      await courseSvc.removeFavorite(item._id);
    } else if (type == "testseries") {
      await seriesSvc.removeFavorite(item._id);
    } else {
      return;
    }

    item.isFavorite = false;
    changed({ _id: item._id, favorite: false });
    success("This item has been removed from your favorites successfully.");
  };
  return (
    <>
      <div className="favorite-icon" onClick={(e) => e.stopPropagation()}>
        {!item.isFavorite ? (
          <a onClick={addFavorite}>
            <figure>
              <img
                className="addfavrouite"
                src="/assets/images/like-white-bg.png"
                alt="add favorite"
              />
            </figure>
          </a>
        ) : (
          <a onClick={removeFavorite}>
            <figure>
              <img
                className="removeFavorite"
                src="/assets/images/like-red-bg.png"
                alt="remove from favorite"
              />
            </figure>
          </a>
        )}
      </div>
    </>
  );
};

export default FavoriteButton;
