"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import clientApi, { uploadFile } from "@/lib/clientApi";
import alertify, { alert } from "alertifyjs";
import Link from "next/link";
import Posts from "@/app/(main)/home/Posts";
import { toQueryString } from "@/lib/validator";
import _ from "lodash";
import { success } from "alertifyjs";
import { saveBlobFromResponse } from "@/lib/common";
import SVG from "@/components/svg";

const ProfileAmbassador = () => {
  const user: any = useSession()?.data?.user?.info || {};
  const { update } = useSession();
  const [processing, setProcessing] = useState(false);
  const [coupon, setCoupon]: any = useState();

  alertify.set("notifier", "position", "top-right");

  const getAmbassadorCode = async () => {
    const { data } = await clientApi.get(`/api/coupons/ambassadorCode`);
    setCoupon(data);
  };

  const onChange = async (event: any) => {
    if (processing) {
      return;
    }
    setProcessing(true);
    if (event.target.checked) {
      try {
        await clientApi.put(`/api/users/ambassador`, { isEnroll: true });
        user.ambassador = true;
        await update();
        alertify.success("Congratulations. You are enrolled successfully.");
        if (!coupon) {
          await getAmbassadorCode();
        }
      } catch (error) {
        alertify.alert("Message", "Failed to enroll.");
      } finally {
        setProcessing(false);
      }
    } else {
      try {
        await clientApi.put(`/api/users/ambassador`, { isEnroll: false });
        user.ambassador = false;
        update();
        alertify.success("You are unregistered from ambassador program.");
      } catch (error) {
        alertify.alert("Message", "Failed to unregister.");
      } finally {
        setProcessing(false);
      }
    }
  };

  const changeCouponShowMe = async (event: any) => {
    if (processing) {
      return;
    }
    setProcessing(true);

    await clientApi.put(`/api/coupons/${coupon._id}`, {
      showMe: event.target.checked,
    });
    alertify.success("Coupon data is updated.");
    setProcessing(false);
  };

  useEffect(() => {
    getAmbassadorCode();
  }, []);

  return (
    <div className="mentor-homepage-profile Stu_profile">
      <div className="institute-onboarding">
        <div>
          <div className="container6 rounded-boxes bg-white m-0">
            <div className="row">
              <div className="col">
                <div className="section_heading_wrapper mb-md-0">
                  <h3 className="section_top_heading">Be Our Ambassador</h3>
                  <p className="section_sub_heading">
                    Register to become our brand ambassador and grow with us.
                    Once you enroll into this program, our team will get in
                    touch with you to verify your identity and confirm. While
                    you learn, earn & represent us like our partner. You grow
                    our brand in your college, friends and social media and earn
                    accordingly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="container6 rounded-boxes bg-white m-0">
            <div className="row mt-2 text-dark">
              <div className="col-lg-6">
                <div className="login-area">
                  <strong>* Yes, Enroll me in the ambassador program</strong>
                  <div className="custom-control custom-checkbox">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      name="chkEnroll"
                      id="chkEnroll"
                      onChange={(e) => onChange(e)}
                      disabled={processing}
                      defaultValue="user.ambassador"
                    />
                    <label
                      className="custom-control-label"
                      htmlFor="chkEnroll"
                    ></label>
                  </div>
                  <p className="my-2">
                    The terms and conditions of the program may change. You will
                    be notified prior to the change. You can always exit this
                    program without any liability.
                  </p>
                  <p className="text-danger">
                    You can copy the Url of the course along with your
                    registered email/phone (as coupon code) and share with
                    others to start earning.
                  </p>
                  {user.ambassador && coupon && (
                    <div className="mt-4">
                      <div className="custom-control custom-checkbox">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          name="chkShowMe"
                          id="chkShowMe"
                          onChange={(e) => changeCouponShowMe(e)}
                          disabled={processing}
                          defaultValue={coupon.showMe}
                        />
                        <label
                          className="custom-control-label pt-1"
                          htmlFor="chkShowMe"
                        >
                          <strong>Show my coupon code in cart</strong>
                        </label>
                      </div>
                      <p className="my-2">
                        Your registered email/phone (as coupon code) will be
                        shown to other users when they are buying items.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-lg-6">
                <figure className="pro-basic-img">
                  <img
                    src="/assets/images/ambassador.png"
                    alt=""
                    className="d-block mx-auto"
                  />
                </figure>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfileAmbassador;
