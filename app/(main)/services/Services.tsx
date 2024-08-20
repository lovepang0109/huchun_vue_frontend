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
import EditModal from "./EditModal";

const Services = () => {
  const user: any = useSession()?.data?.user?.info || {};
  const { update } = useSession();
  const { push } = useRouter();

  const [services, setServices]: any = useState([]);
  const [isSeaching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [canLoadMore, setCanLoadMore] = useState(false);
  const [params, setParams]: any = useState({
    skip: 0,
    limit: 10,
    searchText: "",
  });
  const [isEditServiceModal, setIsEditServiceModal] = useState<boolean>(false);
  const [settings, setSettings] = useState<any>(null);
  const [total, setTotal] = useState(0);
  const queryParams = useSearchParams();

  const getClientData = async () => {
    const { data } = await clientApi.get("/api/settings");

    setSettings(data);
  };

  useEffect(() => {
    getClientData();
    fetchServices(true);
    if (queryParams.get("savedUtm")) {
      userSvc.updateUtmStatus(queryParams.get("savedUtm")).then((res: any) => {
        console.log("utm data updated");
      });
    }

    userSvc.get().then((us) => {
      if (us.role == "student") {
        if (queryParams.get("joinService")) {
          enrollFreeService(queryParams.get("joinService"));
        } else {
          // this.serviceSvc.getTaggingServicesForStudents([this.user._id]).subscribe((serviceMap: any[]) => {
          //   if (serviceMap[this.user._id]) {
          //     serviceMap[this.user._id].services.forEach(s => this.enrolledServices[s._id] = true)
          //   }
          // })
        }
      }
    });
  }, []);

  const enrollFreeService = (itemId: any) => {
    // this.enrolling = true;
    const params: any = {
      service: itemId,
      type: "service",
    };
    if (queryParams.get("loc")) {
      params.enrollingLocation = queryParams.get("loc");
    }
    paymentService.enrollItems(params).then((data) => {
      alertify.success("You have successfully bought the service.");
      // this.serviceSvc.getTaggingServicesForStudents([this.user._id], true).subscribe((serviceMap: any[]) => {
      //   console.log('reload services')
      //   if (serviceMap[this.user._id]) {
      //     serviceMap[this.user._id].services.forEach(s => this.enrolledServices[s._id] = true)
      //   }
      // })
    });
  };
  const search = (txt: string) => {
    setIsSearching(true);
    setParams({
      ...params,
      skip: 0,
      searchText: txt,
    });
    const para = {
      ...params,
      skip: 0,
      searchText: txt,
    };
    fetchServices(true, para);
  };
  const reset = () => {
    setParams({
      ...params,
      skip: 0,
      searchText: "",
    });
    const para = {
      ...params,
      skip: 0,
      searchText: "",
    };
    setIsSearching(false);

    fetchServices(true, para);
  };

  const loadMore = () => {
    setParams({
      ...params,
      skip: services.length,
    });
    const para = {
      ...params,
      skip: services.length,
    };
    fetchServices(false, para);
  };

  const fetchServices = (isNew: boolean, para?: any) => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    if (!para) {
      para = params;
    }
    const tmp_params: any = { ...para };
    if (isNew) {
      setServices([]);
      tmp_params.count = true;
    }
    console.log("here", isNew);
    serviceSvc
      .findServices(tmp_params)
      .then((r: any) => {
        let tmp_services;

        clientApi.get("/api/settings").then((res) => {
          userSvc.get().then((us) => {
            for (const s of r.services) {
              if (s.status == "published") {
                let link = `${res.data.baseUrl}public/membership/${
                  s._id
                }/${slugify(s.title)}?loc=${us.activeLocation}`;
                if (us.referralCode) {
                  link += "&referral=" + us.referralCode;
                }
                s.publicLink = link;
              }
            }
            let tmp_total = total;
            if (isNew) {
              setServices(r.services);
              setTotal(r.count);
              tmp_services = r.services;
              tmp_total = r.count;
            } else {
              setServices(services.concat(r.services));
              tmp_services = services.concat(r.services);
            }
            setCanLoadMore(tmp_services.length < tmp_total);
            setIsLoading(false);
          });
        });
      })
      .catch((err) => {
        console.log(err, "err");
        setIsLoading(false);
      });
  };

  const processServices = (ser: any) => {
    for (const s of ser) {
      if (s.status == "published") {
        s.publicLink = getServicePublicLink(s);
        console.log("hey there");
      }
    }
    return ser;
  };

  const buy = (item: any) => {
    if (user.role == "student") {
      if (item.price == 0 || item.discountValue == 100) {
        enrollFreeService(item._id);
      } else {
        shoppingCartService.addItem(item, 1, "service");
        push("/cart");
      }
    }
  };

  const create = () => {
    setIsEditServiceModal(true);

    // this.editServiceModalRef.content.onClose.pipe(take(1)).subscribe(async res => {
    //   if (res) {
    //     alertify.success('Membership is created!')
    //     this.router.navigate(['/' + this.user.role + '/membership/detail/' + res._id])
    //   }
    // })
  };

  const onClose = (res: any) => {
    if (res) {
      alertify.success("Membership is created!");
      push("/services/detail/" + res._id);
    }
  };

  const deactivate = (service: any, index: any) => {
    alertify.confirm(
      "Are you sure you want to deactivate this published Memberships?",
      (msg) => {
        serviceSvc.revokeService(service).then((res) => {
          alertify.success("Membership is deactivated!");
          service.status = "revoked";
          const updatedServices = services.map((s, i) =>
            i === index ? { ...s, status: "revoked" } : s
          );

          setServices(updatedServices);
        });
      }
    );
  };

  const activate = (service: any, index: any) => {
    serviceSvc.publishService(service).then((res) => {
      alertify.success("Membership is activated!");
      service.status = "published";
      service.publicLink = getServicePublicLink(service);
      const updatedServices = services.map((s, i) =>
        i === index
          ? { ...s, status: "revoked", publicLink: getServicePublicLink(s) }
          : s
      );

      setServices(updatedServices);
    });
  };

  const getServicePublicLink = (service: any) => {
    clientApi.get("/api/settings").then((res) => {
      userSvc.get().then((us) => {
        let link = `${res.data.baseUrl}public/membership/${
          service._id
        }/${slugify(service.title)}?loc=${us.activeLocation}`;
        if (us.referralCode) {
          link += "&referral=" + us.referralCode;
        }
        console.log(link, "lnk");
        return link;
      });
    });
  };

  const deleteFunc = (service: any) => {
    alertify.confirm(
      "Are you sure you want to delete this Memberships?",
      (msg) => {
        serviceSvc.deleteService(service).then((res) => {
          alertify.success("Membership is deleted!");
          const idx = services.findIndex((s) => s._id === service._id);
          if (idx > -1) {
            const updatedServices = [...services];
            updatedServices.splice(idx, 1);
            setServices(updatedServices);
          }
        });
      }
    );
  };

  const track = (idx: any, item: any) => {
    return item._id;
  };

  const notifyCopied = () => {
    alertify.success("Public link is copied to clipboard!");
  };

  const toggleDescription = (index: any) => {
    setServices((prevServices) =>
      prevServices.map((service, i) =>
        i === index
          ? { ...service, showDescription: !service.showDescription }
          : service
      )
    );
  };

  return (
    <>
      <section className="new-service-body">
        <div className="hadding-name">
          <div className="container">
            <div className="banner-area-ag banner-content mx-auto text-center text-white">
              <div className="banner-info mx-auto">
                <h1>Everyone needs some help. We are there for you.</h1>
                <form
                  className="position-relative"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <div className="form-group mb-0">
                    <input
                      type="text"
                      className="form-control border-0"
                      placeholder="Search for services"
                      defaultValue={params.searchText}
                      name="txtSearch"
                      onChange={(e: any) => search(e.target.value)}
                      maxLength={50}
                    />
                    <span>
                      <figure className="img-search">
                        <img src="/assets/images/search-icon-2.png" alt="" />
                      </figure>
                    </span>

                    {isSeaching && (
                      <button type="button" className="btn p-0" onClick={reset}>
                        <figure>
                          <img src="/assets/images/close3.png" alt="" />
                        </figure>
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="new-service-mainbody">
            {user.role === "admin" && (
              <div className="text-right my-2">
                <button className="btn btn-primary mt-2" onClick={create}>
                  Add Membership
                </button>
              </div>
            )}

            {services.map((service, index) => (
              <div
                className="service-cart-b bg-white rounded-sm mb-3"
                key={index}
              >
                <div className="left-box">
                  <div className="image">
                    <img
                      src={service.imageUrl || "/assets/images/st-img5.png"}
                      alt="this is membership image"
                    />
                  </div>
                  <div className="content-box">
                    <h1 className="mb-2">
                      <span className="name h5 d-flex align-items-center">
                        {service.title}&nbsp;&nbsp;
                        <span>
                          ({service.duration}{" "}
                          {service.durationUnit[0].toUpperCase() +
                            service.durationUnit.slice(1)}
                          {service.duration > 1 ? "s" : ""})
                        </span>
                        &nbsp;&nbsp;
                        <span
                          className={`${service.type}_${service.duration}_${service.durationUnit}`}
                        ></span>
                        {user.role !== "admin" &&
                          service.status === "published" &&
                          service.publicLink &&
                          user.primaryInstitute.preferences.general
                            .socialSharing && (
                            <div className="ml-2 d-inline-block">
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
                                    navigator.clipboard.writeText(
                                      service.publicLink
                                    );
                                    notifyCopied();
                                  }}
                                  role="button"
                                >
                                  <i
                                    className="far fa-copy"
                                    style={{ fontSize: "25px" }}
                                  ></i>
                                </a>
                              </div>
                            </div>
                          )}
                      </span>
                    </h1>
                    <div className="mobile-view">
                      <a
                        onClick={() => toggleDescription(index)}
                        className="pt-3 down-link togel-btn"
                      >
                        <img
                          src="/assets/images/down.svg"
                          alt=""
                          className={
                            service.showDescription ? "rotate-180" : ""
                          }
                        />
                      </a>
                    </div>
                    <p
                      className="text-dark mb-4"
                      style={{ lineHeight: "20px" }}
                    >
                      {service.shortDescription}
                    </p>
                    <ul className="box-ul mt-3">
                      {service.highlights.map((hl, idx) => (
                        <li key={idx} className="mb-2">
                          {hl}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {service.showDescription && (
                    <div className="description-box">
                      <h6>Description</h6>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: service.description,
                        }}
                      ></div>
                      {service.tags.map((tag, idx) => (
                        <h5 key={idx} className="mt-3 text-primary">
                          {tag}
                        </h5>
                      ))}
                    </div>
                  )}

                  <div className="mobile-view">
                    <h3 className="price mt-4 ml-3 position-relative">
                      <div>
                        <ItemPrice
                          content={service}
                          newPriceClass="text-left text-dark"
                          digitsInfo="1.0-2"
                        />
                      </div>
                      {user.role === "student" && (
                        <button
                          className="btn btn-buy bold"
                          onClick={() => buy(service)}
                        >
                          Buy
                        </button>
                      )}
                      {user.role === "admin" && service.status === "draft" && (
                        <button
                          className="btn btn-outline mr-2 mt-2"
                          onClick={() => deleteFunc(service)}
                        >
                          Delete
                        </button>
                      )}
                      {user.role === "admin" &&
                        service.status === "published" && (
                          <button
                            className="btn btn-outline mr-2 mt-2"
                            onClick={() => deactivate(service, index)}
                          >
                            Deactivate
                          </button>
                        )}
                      {user.role === "admin" &&
                        service.status === "revoked" && (
                          <button
                            className="btn btn-outline mr-2 mt-2"
                            onClick={() => activate(service, index)}
                          >
                            Activate
                          </button>
                        )}
                      {user.role !== "student" && user.role !== "teacher" && (
                        <Link
                          className="btn btn-primary mt-2"
                          href={`./services/detail/${service._id}`}
                        >
                          Edit
                        </Link>
                      )}
                    </h3>
                  </div>
                </div>

                <div className="right-box dextop-view">
                  <h2>
                    <a
                      onClick={() => toggleDescription(index)}
                      className="down-link"
                    >
                      <img
                        src="/assets/images/down.svg"
                        alt="this show description for service"
                        className={service.showDescription ? "rotate-180" : ""}
                      />
                    </a>
                  </h2>
                  <h3 className="price text-right">
                    <div>
                      <ItemPrice
                        content={service}
                        newPriceClass="text-right text-dark"
                        digitsInfo="1.0-2"
                      />
                    </div>
                    {user.role === "student" && (
                      <button
                        className="btn btn-buy bold"
                        onClick={() => buy(service)}
                      >
                        Buy
                      </button>
                    )}
                    {user.role === "admin" && service.status === "draft" && (
                      <button
                        className="btn btn-outline bold mt-2 mr-2"
                        onClick={() => deleteFunc(service)}
                      >
                        Delete
                      </button>
                    )}
                    {user.role === "admin" &&
                      service.status === "published" && (
                        <button
                          className="btn btn-outline mr-2 mt-2"
                          onClick={() => deactivate(service, index)}
                        >
                          Deactivate
                        </button>
                      )}
                    {user.role === "admin" && service.status === "revoked" && (
                      <button
                        className="btn btn-outline mr-2 mt-2"
                        onClick={() => activate(service, index)}
                      >
                        Activate
                      </button>
                    )}
                    {user.role !== "student" && user.role !== "teacher" && (
                      <Link
                        className="btn btn-primary mt-2"
                        href={`/services/detail/${service._id}`}
                      >
                        Edit
                      </Link>
                    )}
                  </h3>
                </div>
              </div>
            ))}

            {isLoading && (
              <>
                <div className="my-3">
                  <SkeletonLoaderComponent Cwidth={100} Cheight={170} />
                </div>
                <div className="my-3">
                  <SkeletonLoaderComponent Cwidth={100} Cheight={170} />
                </div>
                <div className="my-3">
                  <SkeletonLoaderComponent Cwidth={100} Cheight={170} />
                </div>
              </>
            )}

            {!isLoading && canLoadMore && (
              <div className="text-center mt-3">
                <button className="btn btn-light" onClick={loadMore}>
                  Load More
                </button>
              </div>
            )}

            {!isLoading && services.length === 0 && (
              <div className="text-center my-5">
                <svg
                  width="537"
                  height="538"
                  viewBox="0 0 537 538"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M268.493 536C416.778 536 536.987 466.594 536.987 380.978C536.987 295.362 416.778 225.956 268.493 225.956C120.209 225.956 0 295.362 0 380.978C0 466.594 120.209 536 268.493 536Z"
                    fill="#F5F5F5"
                  />
                  <path
                    d="M374.16 330.048L464.595 382.251C465.734 382.913 467.029 383.262 468.346 383.262C469.664 383.262 470.958 382.913 472.097 382.251L522.413 353.18C522.752 352.984 523.034 352.702 523.23 352.362C523.426 352.022 523.529 351.637 523.529 351.244C523.529 350.852 523.426 350.467 523.23 350.127C523.034 349.787 522.752 349.505 522.413 349.309L432.001 297.238C430.864 296.583 429.575 296.238 428.262 296.238C426.95 296.238 425.66 296.583 424.523 297.238L374.172 326.165C373.832 326.362 373.549 326.645 373.353 326.985C373.156 327.325 373.052 327.71 373.051 328.103C373.05 328.496 373.151 328.882 373.346 329.224C373.54 329.565 373.821 329.849 374.16 330.048Z"
                    fill="#E0E0E0"
                  />
                  <path
                    d="M302.999 310.632L85.4702 436.522C83.6987 437.55 81.6891 438.097 79.6411 438.107C77.5931 438.118 75.5779 437.592 73.796 436.583L17.2888 404.602C16.7019 404.265 16.2142 403.779 15.8751 403.193C15.536 402.607 15.3574 401.942 15.3574 401.266C15.3574 400.589 15.536 399.924 15.8751 399.338C16.2142 398.752 16.7019 398.266 17.2888 397.929L234.409 272.531C236.175 271.516 238.175 270.976 240.212 270.963C242.25 270.951 244.256 271.466 246.035 272.459L302.951 304.356C303.508 304.666 303.973 305.119 304.299 305.667C304.624 306.216 304.798 306.842 304.803 307.48C304.808 308.118 304.644 308.746 304.327 309.299C304.01 309.853 303.552 310.313 302.999 310.632Z"
                    fill="#E0E0E0"
                  />
                  <path
                    d="M337.816 436.979C370.784 436.979 397.509 421.547 397.509 402.51C397.509 383.473 370.784 368.04 337.816 368.04C304.849 368.04 278.123 383.473 278.123 402.51C278.123 421.547 304.849 436.979 337.816 436.979Z"
                    fill="#E0E0E0"
                  />
                  <path
                    d="M466.931 422.335C478.424 422.335 487.742 416.953 487.742 410.313C487.742 403.673 478.424 398.29 466.931 398.29C455.437 398.29 446.119 403.673 446.119 410.313C446.119 416.953 455.437 422.335 466.931 422.335Z"
                    fill="#E0E0E0"
                  />
                  <path
                    d="M467.605 220.882L467.63 379.547L519.015 349.851V191.342L467.605 220.882Z"
                    fill="#E6E6E6"
                  />
                  <path
                    d="M380.328 329.148L467.626 379.547V221.027L380.352 170.783L380.328 329.148Z"
                    fill="#EBEBEB"
                  />
                  <path
                    d="M380.328 170.627L467.626 221.026L519.011 191.342L431.75 141.087L380.328 170.627Z"
                    fill="#F5F5F5"
                  />
                  <path
                    d="M390.56 228.649L456.89 266.954C457.18 267.12 457.508 267.207 457.842 267.207C458.176 267.206 458.504 267.118 458.794 266.952C459.083 266.785 459.324 266.546 459.492 266.257C459.66 265.968 459.749 265.641 459.751 265.307V231.655C459.747 230.824 459.522 230.008 459.099 229.292C458.677 228.576 458.072 227.985 457.347 227.579L391.125 189.419C390.835 189.252 390.505 189.165 390.17 189.166C389.835 189.167 389.506 189.256 389.217 189.424C388.927 189.592 388.686 189.833 388.519 190.124C388.352 190.414 388.264 190.743 388.264 191.078V224.573C388.256 225.394 388.464 226.203 388.867 226.918C389.27 227.633 389.854 228.23 390.56 228.649Z"
                    fill="#FAFAFA"
                  />
                  <path
                    d="M429.828 220.221C429.6 220.219 429.376 220.157 429.179 220.041L417.469 213.308C417.199 213.118 417.011 212.835 416.939 212.513C416.868 212.191 416.92 211.855 417.084 211.569C417.248 211.283 417.512 211.069 417.826 210.968C418.139 210.867 418.479 210.887 418.779 211.024L430.489 217.768C430.721 217.92 430.898 218.142 430.996 218.401C431.094 218.661 431.107 218.944 431.034 219.211C430.96 219.478 430.804 219.715 430.587 219.888C430.371 220.061 430.105 220.161 429.828 220.173V220.221Z"
                    fill="#E0E0E0"
                  />
                  <path
                    d="M390.56 275.634L456.89 313.927C457.18 314.093 457.508 314.18 457.842 314.179C458.176 314.179 458.504 314.091 458.793 313.925C459.083 313.758 459.324 313.518 459.492 313.23C459.66 312.941 459.749 312.614 459.751 312.28V278.616C459.745 277.785 459.52 276.97 459.098 276.254C458.675 275.539 458.071 274.947 457.347 274.54L391.125 236.464C390.835 236.298 390.507 236.211 390.173 236.211C389.839 236.212 389.511 236.299 389.222 236.466C388.932 236.633 388.691 236.872 388.523 237.161C388.355 237.449 388.266 237.777 388.264 238.111V271.607C388.266 272.419 388.478 273.217 388.881 273.923C389.283 274.629 389.862 275.219 390.56 275.634Z"
                    fill="#FAFAFA"
                  />
                  <path
                    d="M429.828 267.194C429.601 267.191 429.379 267.134 429.179 267.026L417.469 260.281C417.199 260.091 417.011 259.808 416.939 259.486C416.868 259.165 416.92 258.828 417.084 258.542C417.248 258.256 417.512 258.042 417.826 257.941C418.139 257.84 418.479 257.86 418.779 257.997L430.489 264.742C430.721 264.894 430.898 265.115 430.996 265.374C431.094 265.634 431.107 265.917 431.034 266.184C430.96 266.452 430.804 266.689 430.587 266.861C430.371 267.034 430.105 267.134 429.828 267.146V267.194Z"
                    fill="#E0E0E0"
                  />
                  <path
                    d="M390.56 322.607L456.89 360.9C457.18 361.066 457.508 361.153 457.842 361.153C458.176 361.152 458.504 361.064 458.794 360.898C459.083 360.731 459.324 360.492 459.492 360.203C459.66 359.914 459.75 359.587 459.752 359.253V325.589C459.746 324.758 459.52 323.943 459.098 323.227C458.676 322.512 458.072 321.92 457.347 321.513L391.125 283.353C390.836 283.187 390.507 283.1 390.173 283.1C389.839 283.1 389.511 283.188 389.222 283.355C388.933 283.522 388.692 283.761 388.524 284.05C388.356 284.338 388.266 284.666 388.264 285V318.507C388.254 319.332 388.46 320.145 388.863 320.865C389.266 321.584 389.852 322.185 390.56 322.607Z"
                    fill="#FAFAFA"
                  />
                  <path
                    d="M429.827 314.167C429.599 314.17 429.375 314.112 429.177 313.999L417.467 307.254C417.318 307.168 417.187 307.054 417.082 306.917C416.977 306.78 416.9 306.625 416.855 306.458C416.811 306.292 416.799 306.118 416.822 305.947C416.844 305.777 416.9 305.612 416.986 305.463C417.072 305.313 417.187 305.182 417.324 305.078C417.461 304.973 417.617 304.896 417.784 304.853C417.95 304.809 418.124 304.799 418.295 304.823C418.466 304.848 418.63 304.906 418.778 304.994L430.488 311.727C430.637 311.813 430.768 311.927 430.873 312.064C430.978 312.2 431.055 312.356 431.1 312.523C431.145 312.689 431.156 312.863 431.133 313.033C431.111 313.204 431.055 313.369 430.969 313.518C430.854 313.719 430.688 313.885 430.487 313.999C430.286 314.114 430.058 314.172 429.827 314.167Z"
                    fill="#E0E0E0"
                  />
                  <path
                    d="M434.902 61.1105V103.515L471.632 124.711V82.3067L434.902 61.1105Z"
                    fill="#FAFAFA"
                  />
                  <path
                    d="M438.881 63.3948L471.679 82.3067V120.118L438.929 101.219V63.3948H438.881ZM436.933 59.9563L434.949 61.1586V103.563L471.679 124.711L473.663 123.509V81.1645L436.885 59.9563H436.933Z"
                    fill="#E0E0E0"
                  />
                  <path
                    d="M436.886 64.5369L469.636 83.4488V121.26L436.886 102.349V64.5369ZM434.902 61.0984V103.503L471.68 124.711V82.3066L434.902 61.1104V61.0984Z"
                    fill="#EBEBEB"
                  />
                  <path
                    d="M440.287 93.8126L468.072 109.851L459.86 88.4985L454.185 95.2433L448.366 86.9716L440.287 93.8126Z"
                    fill="#E0E0E0"
                  />
                  <path
                    d="M449.932 80.4911C449.979 81.3707 450.233 82.2267 450.674 82.9893C451.115 83.7519 451.73 84.3995 452.468 84.8794C453.863 85.685 455.005 85.0237 455.005 83.4127C454.956 82.5335 454.701 81.6782 454.26 80.9159C453.82 80.1536 453.206 79.5057 452.468 79.0243C451.062 78.2188 449.932 78.868 449.932 80.4911Z"
                    fill="#E0E0E0"
                  />
                  <path
                    d="M482.633 112.436V146.22L511.884 163.112V129.328L482.633 112.436Z"
                    fill="#FAFAFA"
                  />
                  <path
                    d="M485.795 114.275L511.884 129.328V159.517L485.795 144.453V114.395V114.275ZM484.208 111.642L482.633 112.556V146.34L511.884 163.124L513.471 162.21V128.426L484.208 111.594V111.642Z"
                    fill="#E0E0E0"
                  />
                  <path
                    d="M484.208 115.189L510.297 130.242V160.371L484.208 145.306V115.189ZM482.633 112.436V146.22L511.884 163.124V129.34L482.633 112.508V112.436Z"
                    fill="#EBEBEB"
                  />
                  <path
                    d="M486.924 138.489L509.046 151.269L502.517 134.257L497.985 139.643L493.356 133.043L486.924 138.489Z"
                    fill="#E0E0E0"
                  />
                  <path
                    d="M494.596 127.885C494.634 128.586 494.837 129.268 495.188 129.876C495.539 130.483 496.028 131 496.616 131.384C497.734 132.021 498.635 131.504 498.635 130.182C498.599 129.48 498.397 128.798 498.046 128.19C497.694 127.582 497.204 127.065 496.616 126.683C495.497 126.07 494.596 126.599 494.596 127.885Z"
                    fill="#E0E0E0"
                  />
                  <path
                    d="M468.156 379.679C468.156 379.679 455.364 367.187 462.65 346.267C466.725 334.545 480.239 325.937 487.898 325.119C485.349 328.148 483.318 331.576 481.886 335.266L472.196 341.711L481.105 338.921L479.205 346.544C479.205 346.544 470.921 351.557 469.695 352.651L478.628 350.319C478.628 350.319 477.979 371.912 468.156 379.679Z"
                    fill="#4C74E7"
                  />
                  <path
                    opacity="0.4"
                    d="M468.156 379.679C468.156 379.679 455.364 367.187 462.65 346.267C466.725 334.545 480.239 325.937 487.898 325.119C485.349 328.148 483.318 331.576 481.886 335.266L472.196 341.711L481.105 338.921L479.205 346.544C479.205 346.544 470.921 351.557 469.695 352.651L478.628 350.319C478.628 350.319 477.979 371.912 468.156 379.679Z"
                    fill="black"
                  />
                  <path
                    d="M468.156 379.678C468.156 379.678 461.532 353.541 471.33 338.296C471.33 338.296 459.848 351.75 468.156 379.678Z"
                    fill="white"
                  />
                  <path
                    d="M482.789 383.213L467.16 383.021H467.003L451.374 383.213C451.374 383.213 451.193 402.45 457.133 410.337C458.78 412.429 462.615 413.943 467.099 413.943C471.584 413.943 475.443 412.465 477.078 410.337C482.97 402.474 482.789 383.213 482.789 383.213Z"
                    fill="#37474F"
                  />
                  <path
                    d="M482.788 383.213C482.788 387.878 475.754 391.629 467.062 391.629C458.369 391.629 451.336 387.842 451.336 383.213C451.336 378.584 458.381 374.797 467.062 374.797C475.742 374.797 482.788 378.548 482.788 383.213Z"
                    fill="#455A64"
                  />
                  <path
                    d="M467.06 380.977C472.47 380.977 477.05 382.708 478.674 385.113C479.069 384.557 479.287 383.895 479.299 383.213C479.299 379.883 473.816 377.202 467.06 377.202C460.303 377.202 454.82 379.907 454.82 383.213C454.831 383.897 455.054 384.561 455.458 385.113C457.069 382.708 461.649 380.977 467.06 380.977Z"
                    fill="#263238"
                  />
                  <path
                    d="M467.061 380.977C461.651 380.977 457.07 382.708 455.459 385.113C457.07 387.517 461.651 389.261 467.061 389.261C472.471 389.261 477.052 387.517 478.675 385.113C477.052 382.708 472.471 380.977 467.061 380.977Z"
                    fill="#E0E0E0"
                  />
                  <path
                    d="M467.254 386.159C467.254 386.159 461.242 385.93 456 377.875C453.848 374.557 452.814 372.813 452.814 372.813L461.23 372.176L451.768 369.772L447.296 362.931L455.147 362.342C451.91 361.213 448.539 360.514 445.12 360.262C445.12 360.262 437.906 347.469 435.754 345.642C441.251 345.977 446.626 347.412 451.557 349.864C456.489 352.315 460.878 355.733 464.464 359.913C476.331 373.992 469.021 386.519 467.254 386.159Z"
                    fill="#4C74E7"
                  />
                  <path
                    d="M467.251 386.159C467.251 386.159 471.05 363.315 446.812 349.585C446.849 349.585 471.964 361.656 467.251 386.159Z"
                    fill="white"
                  />
                  <path
                    d="M467.253 386.159C467.253 386.159 472.747 386.52 478.193 379.751C480.442 376.949 481.536 375.471 481.536 375.471L473.973 374.112L482.738 372.91L487.415 367.151L480.381 365.888C483.409 365.173 486.518 364.862 489.627 364.963C489.627 364.963 497.37 354.142 499.45 352.651C494.481 352.43 489.518 353.205 484.854 354.931C480.189 356.657 475.917 359.3 472.29 362.702C460.219 374.328 465.666 386.315 467.253 386.159Z"
                    fill="#4C74E7"
                  />
                  <path
                    opacity="0.2"
                    d="M467.253 386.159C467.253 386.159 472.747 386.52 478.193 379.751C480.442 376.949 481.536 375.471 481.536 375.471L473.973 374.112L482.738 372.91L487.415 367.151L480.381 365.888C483.409 365.173 486.518 364.862 489.627 364.963C489.627 364.963 497.37 354.142 499.45 352.651C494.481 352.43 489.518 353.205 484.854 354.931C480.189 356.657 475.917 359.3 472.29 362.702C460.219 374.328 465.666 386.315 467.253 386.159Z"
                    fill="black"
                  />
                  <path
                    d="M467.255 386.159C467.255 386.159 465.98 365.203 489.112 355.08C489.112 355.08 465.319 363.604 467.255 386.159Z"
                    fill="white"
                  />
                  <path
                    d="M228.561 94.4143L223.091 92.1901L222.538 91.9616H222.478C221.497 91.6075 220.45 91.4724 219.412 91.5659C218.373 91.6593 217.368 91.9791 216.466 92.5026L28.7421 200.852C24.7971 203.126 21.5208 206.399 19.2434 210.341C16.9659 214.284 15.7677 218.757 15.7695 223.311V386.749C15.7705 388.486 16.2287 390.192 17.0981 391.696C17.9675 393.2 19.2174 394.448 20.7223 395.316C22.2271 396.183 23.9338 396.639 25.6709 396.638C27.4079 396.637 29.114 396.179 30.6177 395.309L218.522 286.827C221.203 285.278 223.429 283.05 224.976 280.368C226.523 277.685 227.337 274.643 227.335 271.546V98.8026C227.338 97.5655 227.024 96.3483 226.421 95.2679L228.561 94.4143Z"
                    fill="#4C74E7"
                  />
                  <path
                    opacity="0.3"
                    d="M228.561 94.4143L223.091 92.1901L222.538 91.9616H222.478C221.497 91.6075 220.45 91.4724 219.412 91.5659C218.373 91.6593 217.368 91.9791 216.466 92.5026L28.7421 200.852C24.7971 203.126 21.5208 206.399 19.2434 210.341C16.9659 214.284 15.7677 218.757 15.7695 223.311V386.749C15.7705 388.486 16.2287 390.192 17.0981 391.696C17.9675 393.2 19.2174 394.448 20.7223 395.316C22.2271 396.183 23.9338 396.639 25.6709 396.638C27.4079 396.637 29.114 396.179 30.6177 395.309L218.522 286.827C221.203 285.278 223.429 283.05 224.976 280.368C226.523 277.685 227.337 274.643 227.335 271.546V98.8026C227.338 97.5655 227.024 96.3483 226.421 95.2679L228.561 94.4143Z"
                    fill="black"
                  />
                  <path
                    d="M232.312 100.774V273.578C232.314 276.674 231.499 279.716 229.95 282.397C228.4 285.078 226.171 287.303 223.487 288.847L35.5825 397.341C34.0774 398.207 32.3709 398.662 30.6343 398.661C28.8977 398.66 27.1919 398.202 25.6879 397.334C24.1839 396.465 22.9346 395.217 22.0652 393.714C21.1958 392.21 20.7369 390.505 20.7344 388.768V225.258C20.7354 220.777 21.8995 216.374 24.1128 212.478C25.7892 209.588 28.2096 207.201 31.1221 205.565L225.206 93.5002C227.089 93.5589 228.876 94.3418 230.195 95.6857C231.514 97.0296 232.264 98.8309 232.288 100.714L232.312 100.774Z"
                    fill="#4C74E7"
                  />
                  <path
                    opacity="0.1"
                    d="M232.312 100.774V273.578C232.314 276.674 231.499 279.716 229.95 282.397C228.4 285.078 226.171 287.303 223.487 288.847L35.5825 397.341C34.0774 398.207 32.3709 398.662 30.6343 398.661C28.8977 398.66 27.1919 398.202 25.6879 397.334C24.1839 396.465 22.9346 395.217 22.0652 393.714C21.1958 392.21 20.7369 390.505 20.7344 388.768V225.258C20.7354 220.777 21.8995 216.374 24.1128 212.478C25.7892 209.588 28.2096 207.201 31.1221 205.565L225.206 93.5002C227.089 93.5589 228.876 94.3418 230.195 95.6857C231.514 97.0296 232.264 98.8309 232.288 100.714L232.312 100.774Z"
                    fill="black"
                  />
                  <path
                    d="M223.486 288.847L35.5811 397.341C34.1267 398.191 32.4774 398.653 30.7925 398.68C29.1077 398.708 27.4442 398.3 25.9629 397.497L138.16 228.637L232.31 273.566C232.311 276.663 231.495 279.707 229.946 282.389C228.397 285.072 226.169 287.299 223.486 288.847Z"
                    fill="#4C74E7"
                  />
                  <path
                    opacity="0.2"
                    d="M223.486 288.847L35.5811 397.341C34.1267 398.191 32.4774 398.653 30.7925 398.68C29.1077 398.708 27.4442 398.3 25.9629 397.497L138.16 228.637L232.31 273.566C232.311 276.663 231.495 279.707 229.946 282.389C228.397 285.072 226.169 287.299 223.486 288.847Z"
                    fill="black"
                  />
                  <path
                    d="M229.15 94.7867L152.529 255.063C151.02 258.212 148.877 261.015 146.234 263.298C143.591 265.58 140.506 267.292 137.171 268.327C133.836 269.362 130.323 269.698 126.852 269.312C123.382 268.927 120.028 267.829 117.001 266.088L24.1133 212.514C25.6988 209.699 28.0117 207.361 30.81 205.745L225.207 93.5002C226.619 93.5337 227.99 93.981 229.15 94.7867Z"
                    fill="#4C74E7"
                  />
                  <path
                    d="M43.4004 161.056L98.4408 129.268V89.8693L58.4409 111.919C53.8851 114.427 50.086 118.112 47.4403 122.589C44.7946 127.066 43.3994 132.171 43.4004 137.371V161.056Z"
                    fill="#4C74E7"
                  />
                  <path
                    opacity="0.5"
                    d="M43.4004 161.056L98.4408 129.268V89.8693L58.4409 111.919C53.8851 114.427 50.086 118.112 47.4403 122.589C44.7946 127.066 43.3994 132.171 43.4004 137.371V161.056Z"
                    fill="white"
                  />
                  <path
                    d="M270.896 8.47498L265.858 5.62557C259.46 1.92614 252.198 -0.0146972 244.807 8.37989e-05C237.417 0.0148648 230.162 1.98473 223.779 5.70973L66.3639 97.4197C59.3765 101.489 53.5787 107.32 49.5492 114.33C45.5198 121.341 43.3996 129.285 43.4004 137.371C43.3998 133.218 44.4962 129.137 46.5787 125.543C48.6611 121.949 51.6558 118.968 55.2597 116.903C58.8637 114.837 62.9492 113.76 67.1031 113.78C71.257 113.8 75.3319 114.917 78.9158 117.017L85.5043 120.876C92.364 124.891 98.0538 130.631 102.008 137.526C105.963 144.421 108.045 152.23 108.047 160.179V394.07L97.3107 421.326L117.473 409.051L279.552 315.008C285.309 311.671 290.087 306.878 293.406 301.111C296.726 295.343 298.47 288.804 298.464 282.15V56.3137C298.463 46.6235 295.915 37.1038 291.077 28.7079C286.239 20.3121 279.279 13.3348 270.896 8.47498Z"
                    fill="#4C74E7"
                  />
                  <path
                    opacity="0.7"
                    d="M270.896 8.47498L265.858 5.62557C259.46 1.92614 252.198 -0.0146972 244.807 8.37989e-05C237.417 0.0148648 230.162 1.98473 223.779 5.70973L66.3639 97.4197C59.3765 101.489 53.5787 107.32 49.5492 114.33C45.5198 121.341 43.3996 129.285 43.4004 137.371C43.3998 133.218 44.4962 129.137 46.5787 125.543C48.6611 121.949 51.6558 118.968 55.2597 116.903C58.8637 114.837 62.9492 113.76 67.1031 113.78C71.257 113.8 75.3319 114.917 78.9158 117.017L85.5043 120.876C92.364 124.891 98.0538 130.631 102.008 137.526C105.963 144.421 108.045 152.23 108.047 160.179V394.07L97.3107 421.326L117.473 409.051L279.552 315.008C285.309 311.671 290.087 306.878 293.406 301.111C296.726 295.343 298.47 288.804 298.464 282.15V56.3137C298.463 46.6235 295.915 37.1038 291.077 28.7079C286.239 20.3121 279.279 13.3348 270.896 8.47498Z"
                    fill="white"
                  />
                  <path
                    d="M49.9277 400.07C49.9277 400.07 61.2172 416.577 79.3596 422.047C98.8726 427.927 108.046 414.99 108.046 397.833V366.803L49.9277 400.07Z"
                    fill="#4C74E7"
                  />
                  <path
                    opacity="0.5"
                    d="M49.9277 400.07C49.9277 400.07 61.2172 416.577 79.3596 422.047C98.8726 427.927 108.046 414.99 108.046 397.833V366.803L49.9277 400.07Z"
                    fill="white"
                  />
                  <path
                    d="M143.118 234.059C142.728 234.053 142.351 233.92 142.043 233.68C141.736 233.44 141.515 233.107 141.414 232.73C141.314 232.353 141.339 231.954 141.486 231.593C141.632 231.231 141.893 230.928 142.228 230.728L262.456 161.285C262.866 161.049 263.353 160.985 263.809 161.108C264.266 161.231 264.655 161.53 264.891 161.94C265.127 162.35 265.19 162.836 265.068 163.293C264.945 163.75 264.645 164.139 264.236 164.375L144.008 233.818C143.737 233.973 143.43 234.056 143.118 234.059Z"
                    fill="white"
                  />
                  <path
                    d="M143.12 260.689C142.729 260.688 142.349 260.559 142.039 260.321C141.729 260.082 141.506 259.748 141.404 259.371C141.303 258.993 141.329 258.592 141.478 258.231C141.628 257.87 141.892 257.567 142.23 257.371L262.458 187.915C262.868 187.679 263.354 187.616 263.811 187.739C264.268 187.862 264.657 188.161 264.893 188.57C265.129 188.98 265.192 189.467 265.069 189.923C264.946 190.38 264.647 190.769 264.237 191.005L144.009 260.509C143.733 260.643 143.427 260.705 143.12 260.689Z"
                    fill="white"
                  />
                  <path
                    d="M143.12 287.308C142.729 287.307 142.349 287.177 142.039 286.939C141.729 286.701 141.506 286.367 141.404 285.989C141.303 285.611 141.329 285.211 141.478 284.85C141.628 284.488 141.892 284.186 142.23 283.989L262.458 214.546C262.864 214.334 263.337 214.288 263.777 214.416C264.216 214.545 264.59 214.837 264.819 215.234C265.048 215.631 265.116 216.1 265.007 216.545C264.899 216.991 264.623 217.377 264.237 217.624L144.009 287.067C143.738 287.222 143.432 287.305 143.12 287.308Z"
                    fill="white"
                  />
                  <path
                    d="M143.12 313.926C142.729 313.926 142.349 313.796 142.039 313.558C141.729 313.319 141.506 312.985 141.404 312.608C141.303 312.23 141.329 311.829 141.478 311.468C141.628 311.107 141.892 310.804 142.23 310.608L262.458 241.164C262.864 240.953 263.337 240.907 263.777 241.035C264.216 241.163 264.59 241.456 264.819 241.853C265.048 242.249 265.116 242.719 265.007 243.164C264.899 243.609 264.623 243.995 264.237 244.242L144.009 313.686C143.74 313.846 143.433 313.929 143.12 313.926Z"
                    fill="white"
                  />
                  <path
                    d="M143.12 340.545C142.729 340.544 142.349 340.414 142.039 340.176C141.729 339.938 141.506 339.604 141.404 339.226C141.303 338.849 141.329 338.448 141.478 338.087C141.628 337.725 141.892 337.423 142.23 337.227L262.458 267.783C262.864 267.572 263.337 267.525 263.777 267.653C264.216 267.782 264.59 268.074 264.819 268.471C265.048 268.868 265.116 269.337 265.007 269.783C264.899 270.228 264.623 270.614 264.237 270.861L144.009 340.304C143.74 340.465 143.433 340.548 143.12 340.545Z"
                    fill="white"
                  />
                  <path
                    d="M222.071 321.573C221.759 321.575 221.451 321.494 221.181 321.337C220.91 321.181 220.687 320.955 220.532 320.683C220.305 320.277 220.245 319.798 220.366 319.348C220.488 318.899 220.78 318.515 221.182 318.279L262.48 294.401C262.886 294.19 263.359 294.144 263.799 294.272C264.238 294.4 264.612 294.693 264.841 295.09C265.07 295.486 265.138 295.956 265.03 296.401C264.921 296.846 264.645 297.232 264.259 297.479L222.961 321.345C222.689 321.496 222.383 321.574 222.071 321.573Z"
                    fill="white"
                  />
                  <path
                    d="M226.845 133.837L192.195 153.843V136.77C192.195 124.904 199.409 111.114 208.318 105.968L210.722 104.585C219.619 99.4396 226.845 104.898 226.845 116.764V133.837Z"
                    fill="#4C74E7"
                  />
                  <path
                    d="M234.909 139.5L184.125 168.823L192.192 150.14L226.842 130.134L234.909 139.5Z"
                    fill="#4C74E7"
                  />
                  <path
                    d="M209.58 110.909C208.078 111.775 206.863 111.077 206.863 109.346V102.698C206.916 101.756 207.189 100.84 207.661 100.023C208.133 99.2062 208.79 98.5121 209.58 97.9967C211.071 97.131 212.286 97.8284 212.286 99.5596V106.22C212.233 107.159 211.96 108.072 211.491 108.886C211.021 109.701 210.367 110.394 209.58 110.909Z"
                    fill="#4C74E7"
                  />
                  <path
                    d="M203.748 159.998C203.892 163.449 206.417 164.808 209.519 163.016C211.144 161.953 212.507 160.536 213.505 158.869C214.502 157.203 215.109 155.332 215.278 153.398L203.748 159.998Z"
                    fill="#4C74E7"
                  />
                  <path
                    d="M380.331 108.012C394.295 108.012 405.615 96.6915 405.615 82.7276C405.615 68.7636 394.295 57.4436 380.331 57.4436C366.367 57.4436 355.047 68.7636 355.047 82.7276C355.047 96.6915 366.367 108.012 380.331 108.012Z"
                    fill="#4C74E7"
                  />
                  <path
                    d="M375.821 102.385C375.821 102.385 378.081 110.416 368.932 117.871C368.932 117.871 383.022 116.452 383.792 103.058L375.821 102.385Z"
                    fill="#4C74E7"
                  />
                  <path
                    d="M382.818 85.0604H377.384L376.025 72.0156H384.177L382.818 85.0604ZM380.101 93.4763C379.601 93.5105 379.099 93.4434 378.625 93.279C378.151 93.1146 377.716 92.8563 377.344 92.5195C376.972 92.1828 376.673 91.7745 376.463 91.3191C376.253 90.8638 376.137 90.3707 376.122 89.8695C376.229 88.8895 376.695 87.9837 377.43 87.3258C378.164 86.6678 379.115 86.304 380.101 86.304C381.087 86.304 382.038 86.6678 382.773 87.3258C383.507 87.9837 383.973 88.8895 384.081 89.8695C384.063 90.3687 383.944 90.8591 383.733 91.3116C383.521 91.7642 383.221 92.1696 382.85 92.5038C382.479 92.838 382.044 93.0942 381.572 93.2572C381.1 93.4201 380.599 93.4865 380.101 93.4523V93.4763Z"
                    fill="white"
                  />
                  <path
                    d="M330.411 180.462C327.808 180.261 325.196 180.704 322.806 181.752C320.415 182.801 318.32 184.422 316.705 186.474C311.355 193.519 300.029 210.183 300.029 210.183C300.029 210.183 295.292 204.929 292.19 201.238C289.089 197.547 286.179 194.421 286.179 194.421C285.771 192.434 285.466 190.427 285.265 188.409C285.001 185.548 284.616 183.6 282.524 181.64C280.432 179.681 278.833 177.841 278.665 176.35C278.496 174.86 277.463 173.369 276.14 174.896C274.818 176.422 274.938 181.111 277.703 184.237C277.703 184.237 272.762 181.941 270.489 179.248C268.217 176.555 265.283 171.866 263.985 173.164C262.687 174.463 260.198 188.445 263.985 191.559C267.772 194.673 277.138 199.975 277.138 199.975C277.138 199.975 289.377 229.936 297.985 229.936C306.594 229.936 320.829 207.79 320.829 207.79L330.411 180.462Z"
                    fill="#FFA8A7"
                  />
                  <path
                    d="M315.131 336.879L317.788 377.528C317.788 377.528 320.192 381.832 324.821 381.832L329.029 377.239C328.972 371.802 329.427 366.372 330.388 361.021C331.951 352.809 334.98 340.798 335.858 333.861L315.131 336.879Z"
                    fill="#FFA8A7"
                  />
                  <path
                    d="M317.521 245.049C317.521 245.049 315.405 258.719 314.359 272.016C313.529 282.62 312.988 297.324 312.796 302.842C312.75 304.286 312.782 305.731 312.892 307.171L315.128 336.879C315.128 336.879 328.269 342.65 335.88 333.861C335.88 333.861 336.805 325.349 335.483 319.434C334.708 315.699 334.803 311.837 335.759 308.144L343.995 275.058V244.76L317.521 245.049Z"
                    fill="#37474F"
                  />
                  <path
                    d="M323.904 256.386C324.461 258.816 325.671 261.047 327.405 262.837C329.138 264.628 331.329 265.91 333.739 266.545L338.656 296.482L345.87 270.248V256.386H323.904Z"
                    fill="#263238"
                  />
                  <path
                    d="M349.467 342.938L357.775 388.757H366.756C366.756 388.757 370.158 350.152 369.978 339.62L349.467 342.938Z"
                    fill="#FFA8A7"
                  />
                  <path
                    d="M321.716 244.748C321.716 244.748 319.961 262.434 335.783 263.985L343.994 316.656L349.465 342.926C349.465 342.926 362.281 351.282 369.976 339.608C369.976 339.608 370.757 326.383 367.571 317.27C366.74 314.902 366.396 312.391 366.561 309.888C367.451 296.975 369.904 259.091 368.701 250.699L360.79 240.348L321.716 244.748Z"
                    fill="#37474F"
                  />
                  <path
                    d="M350.527 182.362H358.559L363.933 209.185L360.398 220.666C359.651 223.046 359.823 225.62 360.879 227.88C363.284 233.122 367.744 243.365 368.718 250.723C366.469 250.888 364.218 250.439 362.204 249.425C360.191 248.411 358.49 246.869 357.284 244.964C357.284 244.964 350.539 253.849 334.128 253.849C326.169 253.849 319.701 247.994 317.525 245.061L320.47 231.763C320.714 230.683 320.803 229.574 320.735 228.469C320.579 225.716 320.278 220.053 320.35 215.749C320.35 215.749 312.728 212.719 314.687 203.341C316.647 193.964 330.413 180.498 330.413 180.498L336.316 180.727L350.527 182.362Z"
                    fill="#4C74E7"
                  />
                  <path
                    d="M331.158 130.664C331.158 130.664 321.419 127.285 319.039 137.252C316.658 147.219 323.992 156.897 313.027 160.216C313.027 160.216 319.496 165.602 325.194 155.539L330.004 175.978C330.004 175.978 330.004 177.096 328.296 177.949C328.296 177.949 355.949 184.105 361.275 170.303C362.009 171.097 362.509 172.079 362.722 173.139C362.934 174.2 362.849 175.299 362.477 176.314C362.477 176.314 370.641 173.008 368.344 162.44C368.344 162.44 374.801 162.26 376.339 157.006C376.339 157.006 366.012 157.499 366.072 146.101C366.144 132.936 359.219 134.848 359.219 134.848C359.219 134.848 350.743 122.248 331.158 130.664Z"
                    fill="#455A64"
                  />
                  <path
                    d="M336.315 171.902V180.691C336.315 180.691 327.213 190.814 336.086 191.619C344.959 192.425 350.514 182.362 350.514 182.362V163.775L336.315 171.902Z"
                    fill="#FFA8A7"
                  />
                  <path
                    d="M350.368 160.841V161.346C347.206 173.849 338.97 176.567 336.313 177.204L336.217 157.859L349.971 157.787L350.368 160.841Z"
                    fill="#F28F8F"
                  />
                  <path
                    d="M337.216 133.068C331.962 133.501 321.045 137.336 320.889 151.174C320.733 165.013 322.837 175.569 330.014 176.002C337.192 176.434 353.218 169.99 353.964 151.956C354.709 133.922 342.326 132.587 337.216 133.068Z"
                    fill="#FFA8A7"
                  />
                  <path
                    d="M330.567 156.669L330.699 164.796L325.914 163.414L330.567 156.669Z"
                    fill="#F28F8F"
                  />
                  <path
                    d="M337.711 156.453C337.718 156.782 337.627 157.106 337.449 157.383C337.272 157.66 337.016 157.878 336.714 158.01C336.413 158.141 336.079 158.18 335.755 158.121C335.431 158.062 335.132 157.908 334.896 157.679C334.66 157.45 334.497 157.155 334.429 156.833C334.36 156.511 334.389 156.176 334.512 155.871C334.635 155.565 334.845 155.303 335.117 155.118C335.389 154.933 335.71 154.832 336.039 154.83C336.256 154.825 336.472 154.863 336.673 154.943C336.875 155.022 337.059 155.14 337.215 155.291C337.37 155.443 337.494 155.623 337.579 155.822C337.664 156.022 337.709 156.236 337.711 156.453Z"
                    fill="#263238"
                  />
                  <path
                    d="M326.804 155.455C326.809 155.672 326.771 155.888 326.692 156.091C326.613 156.293 326.494 156.478 326.343 156.634C326.193 156.791 326.012 156.916 325.813 157.002C325.613 157.089 325.399 157.135 325.181 157.138C324.853 157.145 324.53 157.054 324.253 156.877C323.976 156.701 323.757 156.445 323.626 156.144C323.494 155.843 323.454 155.51 323.512 155.186C323.57 154.863 323.723 154.564 323.951 154.327C324.179 154.091 324.472 153.927 324.794 153.858C325.115 153.788 325.449 153.815 325.755 153.936C326.061 154.057 326.324 154.266 326.51 154.536C326.697 154.806 326.8 155.126 326.804 155.455Z"
                    fill="#263238"
                  />
                  <path
                    d="M335.039 167.429C333.237 167.889 331.463 168.451 329.725 169.113C329.725 169.113 329.232 166.287 331.576 165.638C332.272 165.491 332.996 165.589 333.627 165.916C334.259 166.242 334.757 166.777 335.039 167.429Z"
                    fill="#F28F8F"
                  />
                  <path
                    d="M326.204 149.335L322.994 151.295C322.994 151.295 324.196 152.569 325.471 151.776C325.824 151.49 326.083 151.104 326.214 150.669C326.345 150.233 326.342 149.768 326.204 149.335Z"
                    fill="#263238"
                  />
                  <path
                    d="M345.658 156.405C345.658 156.405 345.538 161.526 348.892 161.526H355.468V150.429C355.468 137.974 346.019 124.965 325.916 135.256C325.916 135.256 324.738 152.581 345.658 156.405Z"
                    fill="#455A64"
                  />
                  <path
                    d="M323.499 161.25C320.373 161.25 317.824 159.086 317.824 156.441C317.824 153.796 320.373 151.631 323.499 151.631C326.625 151.631 329.174 153.796 329.174 156.441C329.174 159.086 326.625 161.25 323.499 161.25ZM323.499 152.557C320.914 152.557 318.81 154.288 318.81 156.404C318.81 158.52 320.914 160.264 323.499 160.264C326.084 160.264 328.188 158.532 328.188 156.404C328.188 154.276 326.084 152.557 323.499 152.557Z"
                    fill="#4C74E7"
                  />
                  <path
                    d="M337.456 161.286C333.957 161.286 331.096 159.098 331.096 156.405C331.096 153.711 333.957 151.595 337.456 151.595C340.954 151.595 343.816 153.784 343.816 156.405C343.816 159.026 340.966 161.286 337.456 161.286ZM337.456 152.581C334.534 152.581 332.142 154.301 332.142 156.405C332.142 158.509 334.546 160.24 337.456 160.24C340.365 160.24 342.77 158.521 342.77 156.405C342.77 154.289 340.389 152.581 337.456 152.581Z"
                    fill="#4C74E7"
                  />
                  <path
                    d="M331.623 155.888H328.678V156.934H331.623V155.888Z"
                    fill="#4C74E7"
                  />
                  <path
                    d="M350.895 155.888H343.297V156.934H350.895V155.888Z"
                    fill="#4C74E7"
                  />
                  <path
                    d="M348.866 160.853C348.825 159.584 349.071 158.322 349.587 157.162C349.838 156.44 350.296 155.806 350.902 155.341C351.509 154.875 352.239 154.597 353.002 154.541C356.921 154.481 357.402 158.256 357.342 159.591C357.161 163.113 354.276 166.888 348.926 166.973L348.866 160.853Z"
                    fill="#FFA8A7"
                  />
                  <path
                    d="M358.557 182.362C358.557 182.362 349.396 204.267 363.931 209.185L367.117 202.38C367.117 202.38 393.712 178.021 400.216 172.683C406.72 167.345 398.377 159.458 390.309 152.064C382.242 144.67 374.151 137.517 374.151 137.517L370.111 130.363C369.667 129.582 369.062 128.904 368.337 128.373C367.611 127.843 366.782 127.472 365.903 127.285C361.671 126.408 353.7 124.881 349.396 125.133C343.384 125.458 352.461 132.948 353.988 132.948C355.364 132.989 356.706 133.382 357.887 134.089C359.068 134.796 360.048 135.794 360.733 136.988C362.561 140.246 362.885 146.113 368.716 145.848L382.23 166.035L358.557 182.362Z"
                    fill="#FFA8A7"
                  />
                  <path
                    d="M382.228 166.035L386.917 172.034L379.607 167.85L382.228 166.035Z"
                    fill="#F28F8F"
                  />
                  <path
                    d="M300.029 210.195L304.201 215.016L301.785 207.634L300.029 210.195Z"
                    fill="#F28F8F"
                  />
                  <path
                    opacity="0.2"
                    d="M336.062 216.182C336.062 216.182 348.085 217.156 351.812 205.734C351.812 205.734 351.957 220.294 336.062 216.182Z"
                    fill="black"
                  />
                  <path
                    d="M316.644 379.283C316.644 379.283 314.972 374.041 317.557 373.765C320.142 373.488 324.711 374.859 325.168 376.229C325.447 377.135 325.561 378.084 325.504 379.031C326.765 378.604 327.959 378.001 329.051 377.239V375.304C329.051 375.304 331.744 375.568 331.949 377.588C332.153 379.608 332.189 382.072 332.273 384.369C332.43 389.01 333.115 392.112 327.837 393.482C324.073 394.427 320.675 396.47 318.074 399.349C316.27 401.254 314.023 402.684 311.534 403.512C309.045 404.341 306.389 404.542 303.803 404.098C295.856 402.992 296.313 396.283 299.114 394.131C301.807 392.149 304.686 390.434 307.711 389.01L316.644 379.283Z"
                    fill="#4C74E7"
                  />
                  <path
                    d="M313.806 394.107C313.687 394.11 313.569 394.079 313.466 394.017C313.364 393.956 313.282 393.866 313.229 393.759C311.953 391.706 309.925 390.234 307.578 389.659C307.493 389.64 307.412 389.605 307.34 389.555C307.268 389.505 307.207 389.441 307.16 389.367C307.113 389.294 307.081 389.211 307.066 389.125C307.051 389.039 307.054 388.951 307.073 388.865C307.092 388.781 307.127 388.702 307.176 388.632C307.225 388.561 307.288 388.501 307.361 388.455C307.434 388.41 307.515 388.379 307.599 388.364C307.684 388.35 307.771 388.353 307.855 388.372C309.208 388.699 310.483 389.293 311.604 390.119C312.725 390.944 313.67 391.986 314.383 393.181C314.438 393.281 314.465 393.393 314.463 393.506C314.461 393.62 314.429 393.731 314.371 393.828C314.312 393.925 314.23 394.006 314.13 394.061C314.031 394.116 313.919 394.145 313.806 394.143V394.107Z"
                    fill="#FAFAFA"
                  />
                  <path
                    d="M316.85 390.861C316.731 390.864 316.613 390.833 316.511 390.771C316.409 390.71 316.326 390.62 316.273 390.513C314.998 388.46 312.97 386.988 310.623 386.413C310.452 386.375 310.304 386.272 310.209 386.126C310.115 385.98 310.082 385.802 310.118 385.631C310.135 385.546 310.169 385.466 310.217 385.394C310.266 385.322 310.329 385.261 310.402 385.214C310.475 385.167 310.556 385.135 310.642 385.12C310.727 385.105 310.815 385.107 310.899 385.126C312.253 385.451 313.529 386.044 314.65 386.87C315.771 387.696 316.716 388.738 317.427 389.936C317.509 390.089 317.527 390.268 317.478 390.435C317.428 390.601 317.315 390.741 317.163 390.825C317.063 390.859 316.956 390.872 316.85 390.861Z"
                    fill="#FAFAFA"
                  />
                  <path
                    d="M319.892 387.615C319.773 387.615 319.656 387.583 319.554 387.522C319.452 387.46 319.37 387.372 319.315 387.266C318.032 385.22 316.007 383.75 313.664 383.167C313.496 383.127 313.35 383.022 313.258 382.876C313.166 382.73 313.135 382.554 313.171 382.385C313.187 382.301 313.219 382.22 313.267 382.149C313.314 382.077 313.376 382.016 313.448 381.969C313.52 381.921 313.6 381.889 313.685 381.874C313.77 381.859 313.857 381.861 313.94 381.88C315.296 382.206 316.572 382.799 317.696 383.625C318.819 384.451 319.766 385.493 320.481 386.689C320.561 386.844 320.578 387.025 320.526 387.191C320.474 387.358 320.358 387.497 320.204 387.579C320.104 387.615 319.997 387.627 319.892 387.615Z"
                    fill="#FAFAFA"
                  />
                  <path
                    d="M357.775 388.757C357.677 388.244 357.699 387.715 357.839 387.212C357.979 386.708 358.234 386.244 358.583 385.855C358.932 385.466 359.367 385.164 359.852 384.97C360.338 384.777 360.861 384.699 361.382 384.742C365.59 384.742 368.596 384.862 368.223 387.988V390.224C368.223 390.224 368.223 401.369 369.065 404.976C369.906 408.583 371.974 420.004 363.39 421.676C354.806 423.347 351.68 416.025 353.243 409.088C354.212 405.178 354.8 401.184 354.998 397.161C355.19 394.624 354.217 385.343 357.006 384.742L357.775 388.757Z"
                    fill="#4C74E7"
                  />
                  <path
                    d="M365.639 402.559C365.528 402.557 365.42 402.524 365.327 402.463C363.146 401.418 360.644 401.267 358.353 402.042C358.273 402.073 358.187 402.087 358.101 402.085C358.015 402.082 357.93 402.062 357.852 402.026C357.774 401.99 357.703 401.939 357.645 401.876C357.587 401.813 357.541 401.739 357.512 401.658C357.481 401.576 357.466 401.49 357.469 401.403C357.472 401.316 357.491 401.23 357.527 401.151C357.563 401.072 357.614 401 357.677 400.941C357.741 400.881 357.815 400.835 357.897 400.804C359.211 400.352 360.601 400.165 361.988 400.254C363.375 400.343 364.73 400.706 365.976 401.321C366.127 401.409 366.237 401.553 366.282 401.722C366.327 401.891 366.304 402.071 366.216 402.223C366.16 402.326 366.076 402.412 365.975 402.471C365.873 402.53 365.757 402.561 365.639 402.559Z"
                    fill="#FAFAFA"
                  />
                  <path
                    d="M366.096 397.57C365.984 397.565 365.873 397.536 365.772 397.486C363.598 396.433 361.098 396.278 358.811 397.053C358.729 397.097 358.639 397.124 358.547 397.131C358.454 397.138 358.361 397.125 358.274 397.093C358.187 397.06 358.108 397.01 358.042 396.945C357.976 396.879 357.925 396.801 357.892 396.714C357.859 396.627 357.845 396.534 357.851 396.442C357.857 396.349 357.883 396.259 357.926 396.177C357.97 396.095 358.031 396.024 358.105 395.968C358.178 395.911 358.263 395.871 358.354 395.851C359.665 395.393 361.054 395.202 362.44 395.291C363.826 395.38 365.179 395.746 366.421 396.368C366.497 396.409 366.563 396.465 366.617 396.532C366.67 396.6 366.71 396.677 366.733 396.76C366.757 396.842 366.764 396.929 366.753 397.014C366.743 397.1 366.716 397.182 366.674 397.257C366.613 397.355 366.528 397.435 366.427 397.49C366.325 397.545 366.212 397.572 366.096 397.57Z"
                    fill="#FAFAFA"
                  />
                  <path
                    d="M366.551 392.653C366.439 392.647 366.328 392.619 366.227 392.568C364.047 391.524 361.546 391.369 359.254 392.136C359.172 392.182 359.081 392.21 358.987 392.217C358.894 392.225 358.799 392.212 358.711 392.18C358.623 392.148 358.543 392.097 358.476 392.03C358.409 391.964 358.358 391.884 358.326 391.796C358.293 391.707 358.28 391.613 358.287 391.52C358.294 391.426 358.322 391.335 358.368 391.253C358.414 391.171 358.477 391.1 358.553 391.045C358.629 390.99 358.717 390.952 358.809 390.933C360.12 390.475 361.509 390.284 362.895 390.373C364.281 390.462 365.635 390.828 366.876 391.45C366.952 391.492 367.018 391.548 367.072 391.615C367.125 391.682 367.165 391.76 367.189 391.842C367.212 391.925 367.219 392.012 367.209 392.097C367.198 392.183 367.171 392.265 367.129 392.34C367.068 392.438 366.983 392.518 366.882 392.573C366.78 392.628 366.667 392.655 366.551 392.653Z"
                    fill="#FAFAFA"
                  />
                  <path
                    d="M304.705 390.549C302.756 391.613 300.887 392.818 299.114 394.155C296.313 396.308 295.856 403.016 303.803 404.122C307.149 404.673 310.583 404.164 313.626 402.668C313.253 400.069 312.243 397.603 310.687 395.488C309.13 393.374 307.075 391.677 304.705 390.549Z"
                    fill="white"
                  />
                  <path
                    d="M327.838 392.46C324.074 393.406 320.676 395.448 318.075 398.327C316.271 400.232 314.025 401.662 311.535 402.491C309.046 403.319 306.39 403.52 303.804 403.076C299.356 402.463 297.54 400.083 297.3 397.726C297.072 400.371 298.707 403.389 303.804 404.098C306.39 404.542 309.046 404.341 311.535 403.513C314.025 402.684 316.271 401.254 318.075 399.349C320.676 396.47 324.074 394.428 327.838 393.482C331.998 392.412 332.455 390.248 332.383 387.11C332.298 389.695 331.529 391.559 327.838 392.46Z"
                    fill="#37474F"
                  />
                  <path
                    d="M369.833 409.364C367.663 407.153 364.71 405.884 361.612 405.833C358.514 405.781 355.521 406.95 353.278 409.088C351.715 416.025 354.841 423.347 363.425 421.676C369.653 420.413 370.29 414.137 369.833 409.364Z"
                    fill="#F5F5F5"
                  />
                  <path
                    d="M363.471 420.317C356.57 421.664 353.203 417.191 352.951 411.781C352.662 417.792 355.993 423.13 363.471 421.676C369.013 420.594 370.119 415.472 369.987 410.999C369.807 415.099 368.4 419.343 363.471 420.317Z"
                    fill="#455A64"
                  />
                </svg>

                <p className="h5">No Membership available</p>
              </div>
            )}
          </div>
        </div>
      </section>
      {isEditServiceModal && (
        <EditModal
          onClose={onClose}
          isShow={isEditServiceModal}
          setIsShow={setIsEditServiceModal}
        />
      )}
    </>
  );
};
export default Services;
