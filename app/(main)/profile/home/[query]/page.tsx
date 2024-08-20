import ProfileHome from "./ProfileHome";
import TeacherProfileHome from "./TeacherProfileHome";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {getSettings} from "@/lib/api";

const ProfileServerPage = async () => {
  const session: any = await getServerSession(authOptions);
  const settings: any = await getSettings();

  return (
    <>
      {session?.user?.info.role === "student" ? (
        <ProfileHome user={session?.user?.info} settings={settings}/>
      ) : (
        <TeacherProfileHome user={session?.user?.info} settings={settings}/>
      )}
    </>
  );
};

export default ProfileServerPage;
