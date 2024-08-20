import clientApi from "@/lib/clientApi";

export const getCurrencyRate = async (fromC: any, toC: any) => {
  const pair = `${fromC}_${toC}`;
  let currencyRate: any = [];
  // if it is cached within 1 hour
  if (
    currencyRate[pair] &&
    Date.now() - currencyRate[pair].date < 1000 * 60 * 60
  ) {
    return currencyRate[pair].rate;
  }

  const { data } = await clientApi.post(`/api/settings/convertCurrency`, {
    from: fromC,
    to: toC,
  });
  return data.rate;
};

export const getCodeEngineAddress = async () => {
  const { data } = await clientApi.get("/api/settings/codeEngineAddress");
  return data;
};

export const findOne = async (slug: any) => {
  const { data } = await clientApi.get(`/api/settings/findOne/${slug}`);
  return data;
};

export const show = async () => {
  const { data } = await clientApi.get(`/api/settings/show`);
  return data;
};

export const update = async (body: any) => {
  const { data } = await clientApi.put(`/api/settings/update`, body);
  return data;
};

export const addAdvertismentImage = async (body: any) => {
  const { data } = await clientApi.put(
    `/api/settings/addAdvertismentImage`,
    body
  );
  return data;
};

export const deleteAdvertismentImage = async (name: any) => {
  const { data } = await clientApi.delete(
    `/api/settings/deleteAdvertismentImage/${name}`
  );
  return data;
};

export const getNotificationConfig = async () => {
  const { data } = await clientApi.get("/api/settings/notificationConfig");
  return data;
};
