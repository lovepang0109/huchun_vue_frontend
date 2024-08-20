import StudentWeek from "./StudentWeek";
import TeacherWeek from "./TeacherWeek";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getSettings } from "@/lib/api";

export default async function WeekCalendarViewr(){
  const session: any = await getServerSession(authOptions);

  if (session?.user.userRole === 'teacher' || session?.user.userRole === 'director') {
    return <div className="bg-mat pt-5 pb-5">
      <TeacherWeek />
    </div>;
  }
  else {
    return <div className="bg-mat pt-5 pb-5">
      <StudentWeek />
    </div>;
  }
 
  
};