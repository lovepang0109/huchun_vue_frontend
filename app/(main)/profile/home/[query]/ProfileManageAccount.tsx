"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import clientApi, { uploadFile } from "@/lib/clientApi";
import alertify, { alert } from "alertifyjs";
import { toQueryString } from "@/lib/validator";
import _ from "lodash";
import { success } from "alertifyjs";
import { signOut } from "next-auth/react";

const ProfileManageAccount = () => {
  const user: any = useSession()?.data?.user?.info || {};
  const { update } = useSession();
  const [processing, setProcessing] = useState(false);
  const [coupon, setCoupon]: any = useState();

  const getAmbassadorCode = async () => {
    const { data } = await clientApi.get(`/api/coupons/ambassadorCode`);
    setCoupon(data);
  };

  const closeAccount = () => {
    alertify
      .confirm(
        "Are you sure you want to close your account?",
        async (msg: string) => {
          try {
            await clientApi.put(`/api/users/closeAccount`, {});
            signOut({ callbackUrl: "/" });
          } catch (error: any) {
            alertify.alert("Message", error.response.data);
          }
          // this.userSvc.closeAccount().subscribe(res => {
          //   alertify.success("Your account is closed now.")
          //   this.authService.logout()
          // }, res => {
          //   alertify.alert("Message",res.error)
          // })
        }
      )
      .setHeader("Message");
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
                  <h3 className="section_top_heading">Manage Account</h3>
                  <p className="section_sub_heading">
                    Manage your account setting.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="container6 rounded-boxes bg-white m-0">
            <div className="mt-2 text-dark">
              <div className="login-area">
                <p className="mb-2">
                  <strong>Warning: </strong>If you close your account, you will
                  be unsubscribed from all your courses, and will lose access
                  forever.
                </p>

                <button
                  className="btn btn-danger"
                  onClick={() => closeAccount()}
                >
                  Close Account
                </button>
              </div>
            </div>
          </div>

          <div className="container6 rounded-boxes bg-white m-0">
            <div className="mt-2 text-dark">
              <div className="login-area">
                <p className="mb-2">
                  <strong>Warning: </strong>If you unsubscribe from email, you
                  may miss important updates. The system may still send you few
                  important emails related to account & password.
                </p>

                <a href="/unsubscribe" className="btn btn-outline">
                  Unsubscribe
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfileManageAccount;
