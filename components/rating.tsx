import Rating from "react-rating";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as fasFaStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as farFaStar } from "@fortawesome/free-regular-svg-icons";

interface props {
  value?: any;
  setvalue?: boolean;
  changeValue?: any;
}

const RatingComponent = ({ value, setvalue, changeValue }: props) => {
  return (
    <Rating
      className="start-yellow ck"
      emptySymbol={
        <FontAwesomeIcon icon={farFaStar} style={{ color: "orange" }} />
      }
      placeholderSymbol={
        <FontAwesomeIcon icon={fasFaStar} style={{ color: "orange" }} />
      }
      fullSymbol={
        <FontAwesomeIcon icon={fasFaStar} style={{ color: "orange" }} />
      }
      placeholderRating={value}
      onChange={changeValue}
      readonly={setvalue ? false : true}
    />
  );
};

export default RatingComponent;
