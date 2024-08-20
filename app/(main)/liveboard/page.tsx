import { DiscussionViewer } from "@/components/DiscussionViewer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import TeacherLiveBoard from "./TeacherLiveBoard";
import AdminLiveBoard from "./AdminLiveBoard";

export default async function LiveBoardServerComponent() {
  const session: any = await getServerSession(authOptions);
  if (session?.user.userRole === "teacher") {
    return <TeacherLiveBoard></TeacherLiveBoard>;
  } else {
    return <AdminLiveBoard></AdminLiveBoard>;
  }
}
