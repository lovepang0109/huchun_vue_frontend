import { String } from "aws-sdk/clients/apigateway";
import { useEffect, useState } from "react";

const SearchBox = ({ placeholder, value, setValue, search }: any) => {
  const [disabled, setDisabled] = useState<boolean>(false);

  useEffect(() => {
    if (!placeholder) {
      placeholder = "Search...";
    }
  }, []);

  // readmore
  const onValueChanged = (ev: any) => {
    setValue(ev);
    search(ev);
  };

  const clear = () => {
    onValueChanged("");
  };

  // const submit = () => {
  //   search(e);
  // };
  return (
    <form
      className="form-group search-box common_search-type-1"
      onSubmit={(e) => {
        e.preventDefault();
        // submit();
      }}
    >
      <span>
        <figure>
          <img
            className="search-icon"
            src="/assets/images/search-icon-2.png"
            alt="search icon"
          />
        </figure>
      </span>

      <input
        type="text"
        className="form-control border-0 flex-grow-1 flex-basic-0"
        placeholder={placeholder}
        name="txtSearch"
        maxLength="200"
        value={value}
        disabled={disabled}
        onChange={(e) => {
          onValueChanged(e.target.value);
        }}
      />

      {value && (
        <a onClick={clear}>
          <figure>
            <img
              src="/assets/images/close3.png"
              alt="clear icon"
              className="clear-icon"
            />
          </figure>
        </a>
      )}
    </form>
  );
};

export default SearchBox;
