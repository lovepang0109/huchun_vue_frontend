"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CoinsTab from "./CoinsTab";
import MembersTab from "./MembersTab";
import RedeemTab from "./RedeemTab";
import RequestTab from "./RequestTab";

const EdcoinHome = () => {
  const [sideMenus, setSideMenus] = useState<any>([
    {
      name: "Educoins",
      _id: "educoins",
    },
    {
      name: "Redeem",
      _id: "redeem",
    },
    {
      name: "Members",
      _id: "members",
    },
    {
      name: "Requests",
      _id: "requests",
    },
  ]);

  const [selectedSideMenu, setSelectedSideMenu] = useState<any>(null);
  const [loadedMenus, setLoadedMenus] = useState<any>({});
  const queryParams = useSearchParams();

  useEffect(() => {
    if (sideMenus.length > 0) {
      let toOpen = sideMenus[0];
      if (queryParams.get("tab")) {
        toOpen =
          sideMenus.find((m) => m._id == queryParams.get("tab")) ||
          sideMenus[0];
      }

      onMenuChange(toOpen);
    }
  }, []);

  const onMenuChange = (menu: any): void => {
    setLoadedMenus({
      ...loadedMenus,
      [menu._id]: true,
    });
    setSelectedSideMenu(menu._id);
  };

  return (
    <main className="pt-3">
      <div className="container">
        <div className="dashboard-area classroom mx-auto mw-100">
          <div className="row">
            <div className="col-lg-2">
              <nav className="navbar navbar-expand-lg navbar-light sidebar p-0 mb-2">
                <button
                  aria-controls="navbarContentMobile"
                  className="navbar-toggler ml-auto"
                  data-target="#navbarContentMobile"
                  data-toggle="collapse"
                  type="button"
                  aria-label="navbar-toggler"
                >
                  <span className="navbar-toggler-icon"></span>
                </button>
                <div
                  className="collapse navbar-collapse"
                  id="navbarContentMobile"
                >
                  <ul className="navbar-nav ml-auto">
                    {sideMenus.map((item) => (
                      <li key={item._id} onClick={() => onMenuChange(item)}>
                        <a
                          className={
                            item._id === selectedSideMenu ? "active" : ""
                          }
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </nav>
            </div>
            <div className="col-lg-10 Admin-Cur_ricuLam ProGrammE">
              {loadedMenus.educoins && selectedSideMenu === "educoins" && (
                <CoinsTab />
              )}
              {loadedMenus.redeem && selectedSideMenu === "redeem" && (
                <RedeemTab />
              )}
              {loadedMenus.members && selectedSideMenu === "members" && (
                <MembersTab />
              )}
              {loadedMenus.requests && selectedSideMenu === "requests" && (
                <RequestTab />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EdcoinHome;
