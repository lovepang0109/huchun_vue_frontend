import React, { useEffect, useState } from "react";
import { alert } from "alertifyjs";
import { CurrencyCodes } from "validator/lib/isISO4217";
import { getCurrencyRate } from "@/services/settingService";
import { currencySymbol } from "@/lib/pipe";

const SelectCountryComponent = ({
  settings,
  selectedCountries,
  setSelectedCountries,
  onCloseFunction,
}: any) => {
  const [countries, setCountries] = useState<any>([]);
  useEffect(() => {
    setCountries(settings.countries);
    if (selectedCountries && selectedCountries?.length) {
      let countriesData = settings.countries;
      countriesData.forEach(
        (c: any) => (c.selected = selectedCountries.indexOf(c.code) > -1)
      );
      setCountries(countriesData);
    }
  }, []);

  const close = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault(); // Prevent default form submission behavior
    const selectedCountriesData = countries.filter((c: any) => c.selected);
    if (!selectedCountriesData.length) {
      alert("Message", "Please select at least one currency");
      return;
    }
    onCloseFunction(selectedCountriesData);
  };

  return (
    <>
      <div className="modal-header">
        <h6 className="modal-title pull-left">Select Currency</h6>
      </div>
      <div className="modal-body">
        {countries.length > 0 && (
          <ul>
            {countries.map((country: any, index: number) => (
              <li key={index} className="clearfix">
                <div className="pull-left">
                  <div className="switch-item" style={{ float: "left" }}>
                    <label className="switch">
                      <input
                        type="checkbox"
                        name={`c_${country.code}`}
                        id={`c_${country.code}`}
                        defaultChecked={country.selected}
                        onChange={(e: any) =>
                          setCountries((prev: any) => {
                            const newArray = [...prev];
                            newArray[index] = {
                              ...newArray[index],
                              selected: e.target.checked,
                            };
                            return newArray;
                          })
                        }
                      />
                      <span className="slider round"></span>
                    </label>
                    <strong className="ml-3 text-dark">{`${
                      country.name
                    } - ${currencySymbol(country.currency)}`}</strong>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-primary"
          onClick={(e) => close(e)}
        >
          Close
        </button>
      </div>
    </>
  );
};
export default SelectCountryComponent;
