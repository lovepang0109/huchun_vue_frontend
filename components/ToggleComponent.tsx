import { useState } from "react";

const ToggleComponent = ({
  label = "",
  disabled = false,
  value,
  setValue,
  onValueChange,
}: any) => {
  const [checked, setChecked] = useState<boolean>(value);

  const onToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setChecked(newValue);
    // setValue(newValue);
    // onValueChange(newValue);
  };

  // readmore
  return (
    <>
      <div className="switch-item float-none">
        <div className="d-flex align-items-center">
          {label && <span className="mr-3 switch-item-label">{label}</span>}
          <label className="switch my-0">
            <input
              type="checkbox"
              checked={checked}
              onChange={onToggleChange}
              disabled={disabled}
            />
            <span
              className="slider round translate-middle-y"
              style={{ top: 0 }}
            ></span>
          </label>
        </div>
      </div>
    </>
  );
};

export default ToggleComponent;
