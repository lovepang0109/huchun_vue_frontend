import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";

export const findOne = async (code: any) => {
  const { data } = await clientApi.get(
    `/api/coupons/findOne${toQueryString({ code })}`
  );
  return data;
};

export const getAmbassadorCode = async () => {
  const { data } = await clientApi.get(`/api/coupons/ambassadorCode`);
  return data;
};

export const getReferralTransactions = async (code: any) => {
  const {data} = await clientApi.get(`/api/coupons/referralTransactions${toQueryString({ code })}`);
  return data;
}

export const getUtmStats = async (code: any) => {
  const {data} = await clientApi.get(`/api/coupons/referralUtmStats${toQueryString({code})}`);
  return data;
}
export const findByItem = async (packageId: any) => {
  const { data } = await clientApi.get(`/api/coupons/findByItem/${packageId}`);
  return data;
};

export const findAvailable = async (params: any) => {
  const { data } = await clientApi.get(
    `/api/coupons/findAvailable${toQueryString(params)}`
  );
  return data;
};

export const create = async (coupon: any) => {
  const { data } = await clientApi.post(`/api/coupons/`, coupon);
  return data;
};

export const update = async (couponId: any, coupon: any) => {
  const { data } = await clientApi.put(`/api/coupons/${couponId}`, coupon);
  return data;
};
