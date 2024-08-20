import clientApi from "@/lib/clientApi";
import { success } from "alertifyjs";
import * as UserSvc from "@/services/userService";
let items: any = [];
let cartName = "MyStore";

export const getCurrencyRate = async (fromC: any, toC: any) => {
  const { data } = await clientApi.post("/api/settings/convertCurrency", {
    from: fromC,
    to: toC,
  });
  return { rate: data.rate, data: new Date() };
};

export const getItemPrice = async (item: any, user: any, clientData: any) => {
  const defaultCountry = clientData?.countries?.find((c: any) => c.default);
  if (!item || !item.countries || !item.countries.length) {
    return {
      price: 0,
      marketPlacePrice: 0,
      discountValue: 0,
      currency:
        defaultCountry?.currency ||
        (clientData.countries ? clientData.countries[0]!.currency : "USD"),
    };
  }

  if (!!user) {
    const country = item.countries.find(
      (c: any) => c.code == user.info?.country.code
    );
    if (country) {
      return {
        price: country.price,
        marketPlacePrice: country.marketPlacePrice,
        discountValue: country.discountValue,
        currency: country.currency,
      };
    } else {
      // convert to user country currency
      const fromCurrency = item.countries[0].currency;
      const toCurrency = user.info?.country.currency;
      const { rate } = await getCurrencyRate(fromCurrency, toCurrency);
      return {
        price: item.countries[0].price * rate,
        marketPlacePrice: item.countries[0].marketPlacePrice * rate,
        discountValue: item.countries[0].discountValue,
        currency: toCurrency,
      };
    }
  } else {
    // get current country data
    let countryCodeByIp: any;
    try {
      const { data } = await clientApi.get("/api/settings/countryByIp");
      countryCodeByIp = data.code;
    } catch (error) {
      countryCodeByIp = defaultCountry.code;
    }
    let country = item.countries.find(
      (c: any) => c.code == countryCodeByIp || c.code == defaultCountry?.code
    );
    if (!country) {
      country = item.countries[0];
    }

    return {
      price: country.price,
      marketPlacePrice: country.marketPlacePrice,
      discountValue: country.discountValue,
      currency: country.currency,
    };
  }
};

export const toNumber = (value: any) => {
  value = value * 1;
  return isNaN(value) ? 0 : value;
};

export const cartItem = async (product: any, quantity: any, type: any) => {
  const user = await UserSvc.get();
  console.log(user, "user");
  product.quantity = quantity * 1;
  product.typeItem = type || "practice";
  if ("discountData" in product) {
    delete product.discountData;
  }

  // extract data specific to product country
  if (product.price == undefined) {
    const { data } = await clientApi.get(`/api/settings`);
    const da: any = await getItemPrice(product, user, data);
    product.price = da.price;
    product.marketPlacePrice = da.marketPlacePrice;
    product.discountValue = da.discountValue;
    product.currency = da.currency;
  }

  // reset price to marketPlacePrice for other roles
  if (user.role !== "student") {
    product.price = product.marketPlacePrice;
  }

  return product;
};

export const getItems = () => {
  let cartName = "MyStore";
  const savedCart = localStorage.getItem(cartName + "_cart_items");
  if (savedCart) {
    const items = JSON.parse(savedCart);
    return items;
  }
  return [];
};

// get the total price for all items currently in the cart
export const getTotalPrice = (user: any, countryCodeByIp: any) => {
  let total = 0;
  let items = getItems();
  if (items) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      total += item.price - item.price * (item.discountValue / 100);
    }

    if (
      (!user && countryCodeByIp == "IN") ||
      user?.country?.currency == "INR"
    ) {
      return Math.round(total);
    }
  }
  return total;
};

export const saveItems = (items: any) => {
  let cartName = "MyStore";
  localStorage.setItem(cartName + "_cart_items", JSON.stringify(items));
};

export const addItem = async (
  product: any,
  quantity: any,
  type: any,
  hideMessage?: any
) => {
  quantity = toNumber(quantity);
  const nameItem = product.title;
  if (quantity !== 0) {
    // update quantity for existing item
    let found = false;
    let items = getItems();
    if (!items) {
      items = [];
    } else {
      for (let i = 0; i < items.length && !found; i++) {
        const item = items[i];
        if (item._id === product._id) {
          found = true;
        }
      }
    }
    // new item, add now
    if (!found) {
      const item = await cartItem(product, quantity, type);
      items.push(item);
    }
    if (!hideMessage) {
      success(
        '<i class="fa fa-check"></i> "' +
          nameItem +
          '" successfully added to your cart.'
      );
    }
    saveItems(items);
  }
};

export const reloadItems = () => {
  let cartName = "MyStore";
  const temp: any = localStorage.getItem(cartName + "_cart_items");
  let items = JSON.parse(temp);
  if (items.length > 0) {
    let tmpItems = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].discountData) {
        let tmp = items[i];
        delete tmp.discountData;
        tmpItems.push(tmp);
      }
    }
    localStorage.setItem(cartName + "_cart_items", JSON.stringify(tmpItems));
  }
};

export const clearItems = () => {
  saveItems([]);
};

export const isItemAdded = (item: any) => {
  const savedCart = localStorage.getItem(cartName + "_cart_items");
  if (savedCart) {
    const loadData = JSON.parse(savedCart);
    if (loadData && loadData.length > 0) {
      items = loadData;
      // this.data$.next({ data: this.items });
    }
  }
  return items.find((i) => i._id == item._id);
};
