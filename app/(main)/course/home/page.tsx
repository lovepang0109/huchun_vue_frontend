import StudentCourseHome from "./StudentCourse";
import TeacherCourse from "./TeacherCourse";
import PublisherCourseHome from "./PublisherCourse";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function CourseHome() {
  const session: any = await getServerSession(authOptions);
  if (session?.user.userRole === "student") {
    return <StudentCourseHome user={session?.user?.info} />;
  } else if (session?.user.userRole === "publisher") {
    return <PublisherCourseHome />;
  } else {
    return <TeacherCourse />;
  }
}
