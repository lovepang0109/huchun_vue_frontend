import React, { useState, useEffect, useRef } from "react";
import { alert, success, error, confirm } from "alertifyjs";
import * as shoppingSvc from "@/services/shopping-cart-service";
import * as UserSvc from "@/services/userService";
import { useRouter } from "next/navigation";

const AddToCartButton = ({ item, type, size }: any) => {
  const [addedToCart, setAddedToCart] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    setAddedToCart(shoppingSvc.isItemAdded(item));
  }, []);

  const addToCart = async () => {
    const user = await UserSvc.get();
    if (user.role != "student") {
      item.price = item.marketPlacePrice;
    }
    shoppingSvc.addItem(item, 1, type);

    setAddedToCart(true);
  };

  const goToCart = () => {
    router.push("/cart");
  };

  return (
    <>
      {!addedToCart ? (
        <a
          className={`btn btn-sm btn-block btn-outline ${
            size === "lg" ? "py-2" : ""
          }`}
          onClick={addToCart}
        >
          Add To Cart
        </a>
      ) : (
        <a
          className={`btn btn-sm btn-block btn-outline ${
            size === "lg" ? "py-2" : ""
          }`}
          onClick={goToCart}
        >
          Go To Cart
        </a>
      )}
    </>
  );
};

export default AddToCartButton;
