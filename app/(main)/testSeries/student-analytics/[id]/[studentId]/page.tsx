import StudentAnalyticsComponent from "./StudentAnalytics";
import { getSettings } from "@/lib/api";
import { getServerSession } from "next-auth";
//import PublisherCourseHome from "./PublisherCourse";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function CourseHome() {
  const session: any = await getServerSession(authOptions);
  return <StudentAnalyticsComponent user={session?.user?.info} />;
}
