import StudentCourseDetails from "./StudentCourseDetails";
import TeacherCourseDetails from "./TeacherCourseDetails";
import { getSettings } from "@/lib/api";
import { getServerSession } from "next-auth";
//import PublisherCourseHome from "./PublisherCourse";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function CourseHome() {
  const settings = await getSettings();

  const session: any = await getServerSession(authOptions);

  if (session?.user.userRole === "student") {
    return <StudentCourseDetails user={session?.user?.info} />;
  } else {
    return (
      <TeacherCourseDetails settings={settings} user={session?.user?.info} />
    );
  }
}
