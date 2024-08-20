"use client";

import { useEffect, useState, useRef } from "react";
import StudentHome from "./StudentHome";
import TeacherHome from "./TeacherHome";
import DirectorHome from "./DirectorHome";
import AdminHome from "./AdminHome";
import PublisherHome from "./publisher/PublisherHome";
import * as userSevice from "@/services/userService";
import clientApi from "@/lib/clientApi";
import { useSession } from "next-auth/react";

export default function Home() {
  const user: any = useSession()?.data?.user?.info || {};

  const [settings, setSettings] = useState<any>(null);

  const getClientDataFunc = async () => {
    const { data } = await clientApi.get(`/api/settings`);
    setSettings(data);
  };
  useEffect(() => {
    getClientDataFunc();
  }, []);

  if (user && settings) {
    if (user?.role === "teacher") {
      return <TeacherHome settings={settings}></TeacherHome>;
    } else if (user?.role === "director") {
      return <DirectorHome settings={settings}></DirectorHome>;
    } else if (user?.role === "admin") {
      return <AdminHome settings={settings}></AdminHome>;
    } else if (user?.role === "publisher") {
      return <PublisherHome settings={settings}></PublisherHome>;
    } else {
      return <StudentHome settings={settings}></StudentHome>;
    }
  }
}
