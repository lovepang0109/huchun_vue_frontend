import React, { useState, useEffect } from "react";

const ShowItemsWithcountComponent = ({ arr, totalBoxLength }: any) => {
  const [offset, setOffset] = useState(2);
  const [limitNumber, setLimitNumber] = useState(0);
  const [showAll, setShowAll] = useState(false);
  useEffect(() => {
    calculateItem();
  }, []);

  const calculateItem = () => {
    if (arr.length < 3) {
      return;
    }
    const totalLength = Number(totalBoxLength) || 180;
    let number = 0;
    for (let i = 0; i < arr.length; i++) {
      number = number + arr[i].length;
      if (number * 10 >= totalLength) {
        setLimitNumber(i);
        break;
      }
    }
  };
  const getTitle = () => {
    return arr.slice(limitNumber).join(",");
  };
  return (
    <>
      <div className="form-row">
        <div className="col">
          {arr
            .slice(0, showAll ? arr.length : limitNumber)
            .map((item: any, index: any) => (
              <span key={index} className="content-tag">
                {item}
              </span>
            ))}
          {arr.length > limitNumber && (
            <span
              data-toggle="tooltip"
              data-placement="right"
              title={getTitle()}
              className="content-tag-total"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "-" : `+${arr.length - limitNumber}`}
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export default ShowItemsWithcountComponent;
