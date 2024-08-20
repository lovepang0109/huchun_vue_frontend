"use client";

import Link from "next/link";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { InstituteSwitcher } from "./InstituteSwitcher";
import { useSession } from "next-auth/react";
import { useState, useLayoutEffect, useEffect } from "react";
import * as userService from "@/services/userService";
import "./navbar.css";
const clientApi = axios.create();

export default function Navbar() {
  const router = usePathname();
  const { push } = useRouter();
  const user: any = useSession()?.data?.user?.info || {};
  const { update } = useSession();

  const [module, setModule]: any = useState({});
  const [enrolledRouter, setEnrolledRouter]: string = useState("");
  // let navLinks: any[] = [];
  const [navLinks, setNavLinks] = useState<any>([]);

  useEffect(() => {
    userService.get().then((us) => {
      if (us?.role === "student") {
        setNavLinks([
          { key: "dashboard", path: "/home", label: "Dashboard" },
          !us.primaryInstitute ||
          (us.primaryInstitute.preferences?.course?.isShow && {
            key: "course",
            path: "/course/home",
            label: "Course",
          }),
          !us.primaryInstitute ||
          (us.primaryInstitute.preferences?.assessment?.isShow && {
            key: "assessment",
            path: "/assessment/home",
            label: "Assessment",
          }),
          !us.primaryInstitute ||
          (us.primaryInstitute.preferences?.testSeries?.isShow && {
            key: "testseries",
            path: "/testSeries/home",
            label: "Test Series",
          }),
          !us.primaryInstitute ||
          (us.primaryInstitute.preferences?.classroom?.isShow && {
            key: "classroom",
            path: "/classroom",
            label: "Classroom",
          }),
          !us.primaryInstitute ||
          (us.primaryInstitute.preferences?.codeEditor && {
            key: "codeEditor",
            path: "/code-editor",
            label: "Code Editor",
          }),
          { key: "services", path: "/membership", label: "Membership" },
        ]);
      } else if (us?.role === "teacher") {
        setNavLinks([
          { key: "dashboard", path: "/home", label: "Dashboard" },
          !us.primaryInstitute ||
          (us.primaryInstitute.preferences?.assessment?.isShow && {
            key: "assessment",
            path: "/assessment/home",
            label: "Assessment",
          }),
          !us.primaryInstitute ||
          (us.primaryInstitute.preferences?.course?.isShow && {
            key: "course",
            path: "/course/home",
            label: "Course",
          }),
          !us.primaryInstitute ||
          (us.primaryInstitute.preferences?.testSeries?.isShow && {
            key: "testseries",
            path: "/testSeries/home",
            label: "Test Series",
          }),
          !us.primaryInstitute ||
          (us.primaryInstitute.preferences?.classroom?.isShow && {
            key: "classroom",
            path: "/classroom",
            label: "Classroom",
          }),
          !us.primaryInstitute ||
          (us.primaryInstitute.preferences?.questionBank?.isShow && {
            key: "questionBank",
            path: "/question/bank",
            label: "Question Bank",
          }),

          { key: "content", path: "/content", label: "Content Library" },
        ]);
      } else if (us?.role === "director") {
        setNavLinks([
          { key: "dashboard", path: "/home", label: "Dashboard" },

          !us.primaryInstitute ||
          (us.primaryInstitute.preferences?.assessment?.isShow && {
            key: "assessment",
            path: "/assessment/home",
            label: "Assessment",
          }),
          !us.primaryInstitute ||
          (us.primaryInstitute.preferences?.testSeries?.isShow && {
            key: "testseries",
            path: "/testSeries/home",
            label: "Test Series",
          }),
          !us.primaryInstitute ||
          (us.primaryInstitute.preferences?.course?.isShow && {
            key: "course",
            path: "/course/home",
            label: "Course",
          }),
          !us.primaryInstitute ||
          (us.primaryInstitute.preferences?.classroom?.isShow && {
            key: "classroom",
            path: "/classroom",
            label: "Classroom",
          }),
          !us.primaryInstitute ||
          (us.primaryInstitute.preferences?.questionBank.isShow && {
            key: "questionBank",
            path: "/question/bank",
            label: "Question Bank",
          }),
          !us.primaryInstitute ||
          (us.primaryInstitute.preferences?.codeEditor && {
            key: "codeEditor",
            path: "/code-editor",
            label: "Code Editor",
          }),
          { key: "users", path: "/administration/user", label: "Users" },
        ]);
      } else if (us?.role === "publisher") {
        setNavLinks([
          { key: "dashboard", path: "/home", label: "Dashboard" },
          !us.primaryInstitute ||
          !us.primaryInstitute.owned ||
          (us.primaryInstitute.preferences?.assessment?.isShow && {
            key: "assessment",
            path: "/assessment/home",
            label: "Assessment",
          }),
          !us.primaryInstitute ||
          !us.primaryInstitute.owned ||
          (us.primaryInstitute.preferences?.course?.isShow && {
            key: "course",
            path: "/course/home",
            label: "Course",
          }),
          !us.primaryInstitute ||
          !us.primaryInstitute.owned ||
          (us.primaryInstitute.preferences?.testSeries?.isShow && {
            key: "testseries",
            path: "/testSeries/home",
            label: "Test Series",
          }),

          !us.primaryInstitute ||
          !us.primaryInstitute.owned ||
          (us.primaryInstitute.preferences?.questionBank.isShow && {
            key: "questionBank",
            path: "/question/bank",
            label: "Question Bank",
          }),
          { key: "revenue", path: "/revenue", label: "Revenue" },
        ]);
      } else if (us?.role === "admin") {
        setNavLinks([
          { key: "dashboard", path: "/home", label: "Dashboard" },
          !us.primaryInstitute ||
          (us.primaryInstitute.preferences?.course?.isShow && {
            key: "course",
            path: "/course/home",
            label: "Course",
          }),
          !us.primaryInstitute ||
          (us.primaryInstitute.preferences?.assessment?.isShow && {
            key: "assessment",
            path: "/assessment/home",
            label: "Assessment",
          }),
          !us.primaryInstitute ||
          (us.primaryInstitute.preferences?.classroom?.isShow && {
            key: "classroom",
            path: "/classroom",
            label: "Classroom",
          }),
          !us.primaryInstitute ||
          (us.primaryInstitute.preferences?.testSeries?.isShow && {
            key: "testseries",
            path: "/testSeries/home",
            label: "Test Series",
          }),
          { key: "content", path: "/content", label: "Content Library" },
          { key: "services", path: "/membership", label: "Membership" },
          { key: "users", path: "/administration/user", label: "Users" },
        ]);
      }
    });
  }, [user]);

  useEffect(() => {
    setEnrolledRouter(router);
  }, [router]);

  useLayoutEffect(() => {
    clientApi
      .get(`/api/settings`)
      .then((res) => {
        setModule(res.data.features);

        navLinks.map((link) => {
          if (link.key !== "users") {
            if (!res.data.features[link.key] && router !== link.path) {
              const redirect_path = navLinks.find(
                (link) => res.data.features[link.key] === true
              )?.path;
              push(redirect_path);
            }
          }
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  return (
    <div
      className="collapse navbar-collapse"
      id="navbarContent"
      style={{
        width: "100%",
        justifyContent: "center",
      }}
    >
      {router !== "/onboarding" &&
        router.indexOf("/public") === -1 &&
        enrolledRouter !== "/course/stage" ? (
        <ul className="navbar-nav mr-auto">
          {navLinks.map((link) => {
            if (!link || !link.path) {
              return <></>
            }
            const moduleExists = module[link.key];
            const arr = link.path.split("/");
            const router_arr = router.split("/");
            if (moduleExists && moduleExists === true) {
              return (
                <li className="nav-item d-inline" key={link.key}>
                  <Link className={`nav-link p-0 ${router_arr[1] === arr[1] ? "highlight" : ""}`} href={link.path}>
                    {link.label}
                  </Link>
                </li>
              );
            }
            if (link.key === "users") {
              return (
                <li className="nav-item d-inline" key={link.key}>
                  <Link className={`nav-link p-0 ${router_arr[1] === arr[1] ? "highlight" : ""}`} href={link.path}>
                    {link.label}
                  </Link>
                </li>
              );
            }

            if (link.key === "revenue") {
              return (
                <li className="nav-item d-inline" key={link.key}>
                  <Link className={`nav-link p-0 ${router_arr[1] === arr[1] ? "highlight" : ""}`} href={link.path}>
                    {link.label}
                  </Link>
                </li>
              );
            }
            return <></>;
          })}
          <li className="d-inline">
            <InstituteSwitcher />
          </li>
        </ul>
      ) : (
        <p
          style={{
            fontSize: 20,
            fontWeight: 300,
            color: "black",
          }}
          className="text-dark"
        >
          {router.indexOf("/public") > -1 ? "" : "Setup your Profile"}
        </p>
      )}
    </div>
  );
}
