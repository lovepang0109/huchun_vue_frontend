import { DiscussionViewer } from "@/components/DiscussionViewer";
import TeacherMonth from "./TeacherMonth";
import StudentMonth from "./StudentMonth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getSettings } from "@/lib/api";




export default async function MonthCalendarViewr() {
  const settings = await getSettings();
  const session: any = await getServerSession(authOptions);

  if (session?.user.userRole === 'teacher' || session?.user.userRole === 'director') {
    return <div className="bg-mat pt-5">
      <TeacherMonth />
    </div>;
  }
  else {
    return <div className="bg-mat pt-5">
      <StudentMonth />
    </div>;
  }
}
