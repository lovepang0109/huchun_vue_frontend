"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import clientApi, { getClientDataFunc } from "@/lib/clientApi";
import Link from "next/link";
import { success } from "alertifyjs";
import { toQueryString } from "@/lib/validator";
import MathJax from "@/components/assessment/mathjax";
import ItemPrice from "@/components/ItemPrice";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import SVG from "@/components/svg";
import { addItem } from "@/services/shopping-cart-service";
import * as authSvc from "@/services/auth";
import * as serviceSvc from "@/services/suportService";
import * as userSvc from "@/services/userService";
import * as paymentService from "@/services/paymentService";
import * as shoppingCartService from "@/services/shopping-cart-service";
import alertify from "alertifyjs";
import { slugify } from "@/lib/validator";
import ServiceSummary from "./ServiceSummary";
import ServiceMembers from "./ServiceMembers";
import ServiceSettings from "./ServiceSettings";
import CouponGenerator from "./CouponGenerator";

const MembershipDetail = () => {
  const user: any = useSession()?.data?.user?.info || {};
  const { id } = useParams();
  const [selectedMenu, setSelectedMenu] = useState<string>("summary");
  const [service, setService] = useState<any>(null);

  useEffect(() => {
    serviceSvc.getService(id).then((res: any) => {
      res.slug = slugify(res.title);
      setService(res);

      const savedMenu = sessionStorage.getItem(
        "teacher_service_current_page_" + res._id
      );
      if (savedMenu) {
        sessionStorage.removeItem("teacher_service_current_page_" + res._id);
        setSelectedMenu(savedMenu);
      }
    });
  }, []);

  const handleBeforeUnload = (event: any) => {
    sessionStorage.setItem(
      "teacher_service_current_page_" + service._id,
      selectedMenu
    );
  };

  const selectMenu = (menu: string) => {
    if (!service) {
      return;
    }

    setSelectedMenu(menu);
  };

  return (
    <>
      <div className="d-block d-lg-none">
        <div className="container">
          <div className="dashboard-area">
            <nav className="navbar navbar-expand-lg navbar-light sidebar p-0 mt-2">
              <button
                className="navbar-toggler px-0 ml-auto"
                type="button"
                data-toggle="collapse"
                data-target="#navbarContentMobile"
                aria-controls="navbarContentMobile"
                aria-label="navbar-toggler"
              >
                <span className="navbar-toggler-icon"></span>
              </button>

              <div
                className="collapse navbar-collapse"
                id="navbarContentMobile"
              >
                <ul className="navbar-nav mr-auto">
                  <li>
                    <a
                      className={selectedMenu === "summary" ? "active" : ""}
                      onClick={() => selectMenu("summary")}
                    >
                      Summary
                    </a>
                  </li>
                  <li>
                    <a
                      className={selectedMenu === "settings" ? "active" : ""}
                      onClick={() => selectMenu("settings")}
                    >
                      Settings
                    </a>
                  </li>
                  <li>
                    <a
                      className={selectedMenu === "coupon" ? "active" : ""}
                      onClick={() => selectMenu("coupon")}
                    >
                      Coupons
                    </a>
                  </li>
                  <li>
                    <a
                      className={selectedMenu === "members" ? "active" : ""}
                      onClick={() => selectMenu("members")}
                    >
                      Members
                    </a>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
        </div>
      </div>

      <main className="py-3 pb-0">
        <div className="container">
          <div className="course-summery dashboard-area mx-auto new-course-summery">
            <div className="row">
              <div className="d-none d-lg-block col-lg-2">
                <div className="sidebar mt-0">
                  <ul>
                    <li>
                      <a
                        className={selectedMenu === "summary" ? "active" : ""}
                        onClick={() => selectMenu("summary")}
                      >
                        Summary
                      </a>
                    </li>
                    <li>
                      <a
                        className={selectedMenu === "settings" ? "active" : ""}
                        onClick={() => selectMenu("settings")}
                      >
                        Settings
                      </a>
                    </li>
                    <li>
                      <a
                        className={selectedMenu === "coupon" ? "active" : ""}
                        onClick={() => selectMenu("coupon")}
                      >
                        Coupons
                      </a>
                    </li>
                    <li>
                      <a
                        className={selectedMenu === "members" ? "active" : ""}
                        onClick={() => selectMenu("members")}
                      >
                        Members
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="col-lg-10">
                {service ? (
                  <>
                    {selectedMenu === "summary" && (
                      <div>
                        <ServiceSummary service={service} user={user} />
                      </div>
                    )}
                    {selectedMenu === "settings" && (
                      <div>
                        <ServiceSettings
                          service={service}
                          setService={setService}
                          user={user}
                          id={id}
                        />
                      </div>
                    )}
                    {selectedMenu === "coupon" && (
                      <div>
                        <CouponGenerator
                          item={service}
                          readOnly={user.role !== "admin"}
                        />
                      </div>
                    )}
                    {selectedMenu === "members" && (
                      <div>
                        <ServiceMembers service={service} user={user} />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
                    <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
                    <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
                    <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
export default MembershipDetail;
