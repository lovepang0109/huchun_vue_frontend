import StudentTestSeriesHome from "./StudentTestSeriesHome";
import TeacherTestSeriesHome from "./TeacherTestSeriesHome";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function HomeRoute() {
  const session: any = await getServerSession(authOptions);
  if (session?.user.userRole === "student") {
    return <StudentTestSeriesHome />;
  } else {
    return <TeacherTestSeriesHome />;
  }
}
