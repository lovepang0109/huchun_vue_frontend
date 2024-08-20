import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { StudentOnboarding } from "./StudentOnboarding";
import { TeacherOnboarding } from "./TeacherOnboarding";
import { getServerSession } from "next-auth";
import "./onboarding.css";
import "@/public/css/base.style.css";

export default async function HomeRoute() {
  const session: any = await getServerSession(authOptions);
  if (session?.user.userRole == "teacher") {
    return <TeacherOnboarding />;
  } else {
    return <StudentOnboarding />;
  }
}
