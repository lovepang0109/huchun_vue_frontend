"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import ProfilePublic from "./ProfilePublic";

const ClassroomDetail = () => {
  const { user }: any = useSession()?.data || {};
  const [course, setCourse]: any = useState();
  const { query } = useParams();
  const { push } = useRouter();
  const userInfo = user?.info;
  useEffect(() => {

  }, []);
  return (
    <div>
      <ProfilePublic />
    </div>
  );
};
export default ClassroomDetail;
