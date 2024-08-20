import StudentTestSeriesDetails from "./StudentTestSeriesDetails";
import TeacherTestSeriesDetails from "./TeacherTestSeriesDetails";
import { getSettings } from "@/lib/api";
import { getServerSession } from "next-auth";
//import PublisherCourseHome from "./PublisherCourse";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function CourseHome() {
  const settings = await getSettings();

  const session: any = await getServerSession(authOptions);
  if (session?.user.userRole === "student") {
    return <StudentTestSeriesDetails />;
  } else {
    return (
      <TeacherTestSeriesDetails
        settings={settings}
        user={session?.user?.info}
      />
    );
  }
}
