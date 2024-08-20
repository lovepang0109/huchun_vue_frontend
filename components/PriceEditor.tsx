import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import SelectCountryComponent from "@/components/SelectCountry";
import { round } from "@/lib/common";
import { getCurrencyRate } from "@/services/settingService";

const PriceEditorComponent = ({
  settings,
  countries,
  setCountries,
  countriesChange,
}: any) => {
  const [allCountries, setAllCountries] = useState<any>();
  const [selectedCountries, setSelectedCountries] = useState<any>();
  const [countryModalShow, setCountryModalShow] = useState<boolean>(false);

  useEffect(() => {
    setAllCountries(settings.countries);
  }, []);

  const editCountries = () => {
    setSelectedCountries(countries.map((c: any) => c.code));
    setCountryModalShow(true);
  };

  const cancel = () => {
    setCountryModalShow(false);
  };

  const onCloseFunction = async (selectedCountriesData: any) => {
    setCountryModalShow(false);
    const newCountries: any[] = [];
    selectedCountriesData.map(async (c: any, index: number) => {
      const currentC = countries.find((pc: any) => pc?.code == c?.code);
      if (currentC) {
        newCountries.push(currentC);
      } else {
        const newCountry = {
          code: c?.code,
          name: c?.name,
          currency: c?.currency,
          price: 0,
          enablePrice: true,
          marketPlacePrice: 0,
          enableMarketPlacePrice: true,
          discountValue: 0,
        };
        if (countries[0] && countries[0].price) {
          try {
            const currencyRate: any = await getCurrencyRate(
              countries[0].currency,
              c.currency
            );
            newCountry.price = round(
              countries[0].price * currencyRate,
              c.currency == "INR" ? 0 : 2
            );
            newCountry.marketPlacePrice = round(
              countries[0].marketPlacePrice * currencyRate,
              c.currency == "INR" ? 0 : 2
            );
          } catch (ex) {
            console.log(ex);
          }
        }
        newCountries.push(newCountry);
      }
      setCountries(newCountries);
      countriesChange(newCountries);
    });
  };

  const updatePrice = (countryIndex: any, value: any) => {
    const updatedCountries = [...countries]; // Create a copy of the countries array
    const countryToUpdate = updatedCountries[countryIndex]; // Find the country to update

    // Update the price of the country
    countryToUpdate.price = Number(value);

    // If the currency is INR, round the price
    if (countryToUpdate.currency === "INR") {
      countryToUpdate.price = Math.round(countryToUpdate.price);
    }

    // Update the state with the modified countries array
    setCountries(updatedCountries);

    // Update the state with the modified countries array
    setCountries(updatedCountries);
  };

  const updateMarketPlacePrice = (countryIndex, value) => {
    const updatedCountries = [...countries]; // Create a copy of the countries array
    const countryToUpdate = updatedCountries[countryIndex]; // Find the country to update
    countryToUpdate.marketPlacePrice = Number(value);
    if (countryToUpdate.currency === "INR") {
      countryToUpdate.marketPlacePrice = Math.round(
        countryToUpdate.marketPlacePrice
      );
    }
    setCountries(updatedCountries); // Update the state with the modified countries array
  };

  const enablePriceFunc = (id: number, isChecked: boolean) => {
    setCountries((prevCountries) => {
      const updatedCountries = prevCountries.map((country, index) => {
        if (index === id) {
          return {
            ...country,
            enablePrice: isChecked,
          };
        }
        return country;
      });

      return updatedCountries;
    });
  };

  const enableMarketPlaceFunc = (id: number, value: boolean) => {
    let countriesData = countries;
    countriesData[id].enableMarketPlacePrice = value;
    setCountries(countriesData);
  };
  const discountValueFunc = (id: number, value: string) => {
    let countriesData = countries;
    countriesData[id].discountValue = value;
    setCountries(countriesData);
  };

  return (
    <>
      {allCountries?.length > 1 && (
        <div>
          <h4 className="form-box_title my-2">
            Set Currency:
            <a className="ml-2" onClick={editCountries}>
              <i className="far fa-edit"></i>
            </a>
          </h4>
        </div>
      )}
      {countries.map((country: any, index: any) => (
        <div key={index}>
          {allCountries?.length > 1 && (
            <div className="mt-2 bold">{country.name}</div>
          )}
          <div className="col-md-12">
            <div className="form-row align-items-center">
              <div className="col-6 d-flex align-items-center">
                <label className="container2 d-inline">
                  <input
                    type="checkbox"
                    name={`indiPrice_${country.code}`}
                    defaultChecked={country.enablePrice}
                    onChange={(e) =>
                      setCountries((prev: any) => {
                        const newArray = [...prev];
                        newArray[index] = {
                          ...newArray[index],
                          enablePrice: e.target.checked,
                        };
                        return newArray;
                      })
                    }
                    className="form-control"
                  />
                  <span className="checkmark1 translate-middle-y top-3"></span>
                </label>
                <h4 className="form-box_subtitle main-sub-title">
                  Individual Price
                </h4>
              </div>
              <form className="col">
                <input
                  type="number"
                  name={`country_price_${country.code}`}
                  defaultValue={country.price}
                  onBlur={(e) => updatePrice(country, e.target.value)}
                  className="form-control border-bottom rounded-0"
                  onKeyPress={(e) => {
                    if (e.key === "-") {
                      e.preventDefault();
                    }
                  }}
                />
              </form>
            </div>
            <div className="form-row align-items-center">
              <div className="col-6 d-flex align-items-center">
                <label className="container2 d-inline">
                  <input
                    type="checkbox"
                    name={`marketPrice_${country.code}`}
                    defaultChecked={country.enableMarketPlacePrice}
                    onChange={(e) =>
                      setCountries((prev: any) => {
                        const newArray = [...prev];
                        newArray[index] = {
                          ...newArray[index],
                          enableMarketPlacePrice: e.target.checked,
                        };
                        return newArray;
                      })
                    }
                    className="form-control"
                  />
                  <span className="checkmark1 translate-middle-y top-3"></span>
                </label>
                <h4 className="form-box_subtitle main-sub-title">
                  Institutional Price
                </h4>
              </div>
              <form className="col">
                <input
                  type="number"
                  name={`country_marketplaceprice_${country.code}`}
                  defaultValue={country.marketPlacePrice}
                  onBlur={(e) =>
                    updateMarketPlacePrice(country, e.target.value)
                  }
                  className="form-control border-bottom rounded-0"
                  onKeyPress={(e) => {
                    if (e.key === "-") {
                      e.preventDefault();
                    }
                  }}
                />
              </form>
            </div>
            <div className="form-row align-items-center">
              <div className="col-6">
                <h4 className="form-box_subtitle main-sub-title">
                  Discount (%)
                </h4>
              </div>
              <form className="col">
                <input
                  type="number"
                  name={`discount_${country.code}`}
                  placeholder="Enter discount percentage"
                  defaultValue={country.discountValue}
                  onKeyPress={(e) => {
                    if (e.key === "-") {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) =>
                    setCountries((prev: any) => {
                      const newArray = [...prev];
                      newArray[index] = {
                        ...newArray[index],
                        discountValue: e.target.value,
                      };
                      return newArray;
                    })
                  }
                  className="form-control border-bottom rounded-0"
                />
              </form>
            </div>
          </div>
        </div>
      ))}
      <Modal
        show={countryModalShow}
        onHide={cancel}
        backdrop="static"
        keyboard={false}
        className="currency-modal"
      >
        <SelectCountryComponent
          settings={settings}
          countries={countries}
          selectedCountries={selectedCountries}
          setCountries={setCountries}
          setSelectedCountries={setSelectedCountries}
          onCloseFunction={onCloseFunction}
        />
      </Modal>
    </>
  );
};

export default PriceEditorComponent;
