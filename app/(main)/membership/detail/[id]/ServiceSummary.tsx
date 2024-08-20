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
import moment from "moment";
const ServiceSummary = ({ service, user }: any) => {
  const [publicLink, setPublicLink] = useState<any>(null);

  useEffect(() => {
    clientApi.get(`/api/settings`).then((res) => {
      setPublicLink(
        `${res.data.baseUrl}public/membership/${service._id}/${service.slug}?loc=${user.activeLocation}`
      );
    });
  }, []);

  const notifyCopied = () => {
    alertify.success("Public link is copied to clipboard!");
  };

  return (
    <div className="text-dark bg-white py-3 px-4">
      <div className="d-flex justify-content-between">
        <h4 className="mb-2">
          <span className="name h5">{service.title}</span>
          <span className="month h5 ml-2">
            {service.duration ? (
              <>
                ({service.duration}{" "}
                {service.durationUnit.charAt(0).toUpperCase() +
                  service.durationUnit.slice(1)}
                {service.duration > 1 ? "s" : ""})
              </>
            ) : (
              <>( )</>
            )}
          </span>
          <span
            className={`mx-2 align-baseline ${service.type}_${service.duration}_${service.durationUnit} `}
          ></span>

          {user.role !== "admin" &&
            service.status === "published" &&
            publicLink &&
            user.primaryInstitute.preferences.general.socialSharing && (
              <div className="d-inline-block">
                <div className="d-flex gap-xs">
                  <a
                    className="text-black"
                    href={`https://www.facebook.com/sharer/sharer.php?u=${service.publicLink}`}
                    role="button"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i
                      className="fab fa-facebook-square"
                      style={{ fontSize: "25px" }}
                    ></i>
                  </a>
                  <a
                    className="text-black"
                    href={`https://www.linkedin.com/shareArticle?mini=true&url=${service.publicLink}`}
                    role="button"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i
                      className="fab fa-linkedin"
                      style={{ fontSize: "25px" }}
                    ></i>
                  </a>
                  <a
                    className="text-black"
                    href={`https://twitter.com/share?url=${service.publicLink}`}
                    role="button"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i
                      className="fab fa-twitter-square"
                      style={{ fontSize: "25px" }}
                    ></i>
                  </a>
                  <a
                    className="text-black"
                    onClick={() => {
                      navigator.clipboard.writeText(service.publicLink);
                      notifyCopied();
                    }}
                    role="button"
                  >
                    <i className="far fa-copy" style={{ fontSize: "25px" }}></i>
                  </a>
                </div>
              </div>
            )}
        </h4>
        {service.status === "published" && (
          <div>
            <span>Membership Start Date:</span>&nbsp;
            <b>{moment(service.statusChangedAt).format("MMM D, YYYY")}</b>
          </div>
        )}
      </div>
      <div className="row">
        <div className="col-3">
          <div className="image">
            <img
              src={service.imageUrl || "/assets/images/st-img5.png"}
              alt=""
            />
          </div>
        </div>
        <div className="col-9">
          <strong>Description</strong>
          <div
            className="my-2"
            dangerouslySetInnerHTML={{ __html: service.description }}
          ></div>
          {service.tags.map((tag, index) => (
            <h5 key={index} className="my-2 text-primary">
              {tag}
            </h5>
          ))}
          <strong className="mt-4">Features</strong>
          <div className="row mt-2">
            {service.highlights.map((hl, index) => (
              <div key={index} className="col-4 my-1">
                <img
                  src="/assets/images/check.svg"
                  className="d-inline mr-2 align-text-bottom"
                  alt=""
                />{" "}
                {hl}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ServiceSummary;
