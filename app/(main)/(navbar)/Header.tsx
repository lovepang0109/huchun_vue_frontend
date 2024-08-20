"use client";

import { AppLogo } from "@/components/AppLogo";
import { DropDownMenu } from "./DropDownMenu";
import { MessageCenterDropdown } from "./MessageCenterDropdown";
import { ChatDropdown } from "./ChatCenterDropDown";
import Navbar from "./Navbar";
import { NotificationDropdown } from "./NotificationDropDown";
import { usePathname } from 'next/navigation';

export function Header({ user }) {

  const pathname = usePathname();
  if (pathname.includes("course/stage") || pathname.includes("take-test")) {
    return null;
  }

  return (
    <div className="w-100 bg-white">
      <div
        className="container d-flex position-relative align-items-center app-header"
        style={{ backgroundColor: "white" }}
      >
        <AppLogo user={user} />
        <div
          className="header-area d-flex"
          style={{ marginLeft: 5, width: "100%", padding: 20 }}
        >
          <nav
            className="navbar navbar-expand-lg navbar-light p-0"
            style={{ width: "100%" }}
          >
            <button
              className="navbar-toggler d-none"
              type="button"
              data-toggle="collapse"
              data-target="#navbarContent"
              aria-controls="navbarContent"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <Navbar />
          </nav>
          <div className="d-flex align-items-center">
            <div className="mr-3">
              <MessageCenterDropdown user={user} />
            </div>
            <div className="mr-3">
              <ChatDropdown />
            </div>
            <NotificationDropdown user={user} />
          </div>
        </div>
        <DropDownMenu />
      </div>
    </div>
  );
}


export default Header;