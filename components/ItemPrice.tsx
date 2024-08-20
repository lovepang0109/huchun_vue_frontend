import { getItemPrice } from "@/services/shopping-cart-service";
import { useTakeTestStore } from "@/stores/take-test-store";
import { useState, useEffect } from "react";

const ItemPrice = ({ content, field }: any) => {
  const { clientData, user } = useTakeTestStore();
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [currencyCode, setCurrencyCode] = useState<any>();

  // const [field, setField] = useState<any>("");
  const [digitsInfo, setDigitsInfo] = useState<any>("1.0-2");
  const [showDiscount, setShowDiscount] = useState<any>();
  const [showOldPrice, setShowOldPrice] = useState<any>(true);
  const [oldPriceClass, setOldPriceClass] = useState<any>("mx-2 line-through");
  const [priceClass, setPriceClass] = useState<any>("");
  const [newPriceClass, setNewPriceClass] = useState<any>("");

  useEffect(() => {
    if (!field) {
      field = "price";
    }
    const getItemData = async () => {
      if (!!content.showDiscount) {
        setShowDiscount(content.showDiscount);
      }
      if (!!content.newPriceClass) {
        setPriceClass(content.newPriceClass);
      }
      if (!!content.showOldPrice) {
        setShowOldPrice(content.showOldPrice);
      }
      if (!!content.oldPriceClass) {
        setOldPriceClass(content.oldPriceClass);
      }
      if (!!content.newPriceClass) {
        setNewPriceClass(content.newPriceClass);
      }
      if (!!content.digitsInfo) {
        setDigitsInfo(content.digitsInfo);
      }
      if (content.showDiscount) {
        setShowDiscount(content.showDiscount);
      }
      if (content.showDiscount) {
        setShowDiscount(content.showDiscount);
      }
      if (content.showDiscount) {
        setShowDiscount(content.showDiscount);
      }
      if (!content?.field) {
        const data: any = await getItemPrice(content, user, clientData);
        setPrice(data[field]);
        setDiscountValue(data.discountValue);
        setCurrencyCode(content.currency);
      } else {
        setPrice(content?.field);
        setDiscountValue(content.content.discountValue);
        setCurrencyCode(content.content.currency);
      }
    };
    if (content) {
      getItemData();
    }
  }, [content]);

  useEffect(() => {
    if (currencyCode === "INR") setDigitsInfo("1.0-0");
  }, [currencyCode]);

  return (
    <>
      {discountValue > 0 && (
        <span className={newPriceClass}>
          <strong className={priceClass}>
            {currencyCode == "INR" ? "₹" : "$"}
            {price ? (price - (discountValue / 100) * price).toFixed(1) : 0}
          </strong>
        </span>
      )}
      {discountValue > 0 && showDiscount && (
        <span className="px-2"> {discountValue}% OFF</span>
      )}
      {discountValue > 0 && showOldPrice && (
        <span className={oldPriceClass}>
          {currencyCode == "INR" ? "₹" : "$"}
          {price ? price : 0}
        </span>
      )}
      {!discountValue && (
        <span className={newPriceClass}>
          <strong className={priceClass}>
            {currencyCode == "INR" ? " ₹" : " $"}
            {price ? price : 0}
          </strong>
        </span>
      )}
    </>
  );
};

export default ItemPrice;
