import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import StudentAssessment from "./StudentAssessment";
import { getServerSession } from "next-auth";
import TeacherAssessment from "./TeacherAssessment";
import PublisherAssessment from "./PublisherAssessment";

export default async function AssessmentHome() {
  const { user } = (await getServerSession(authOptions)) || {};

  return user?.userRole == "student" ? (
    <StudentAssessment />
  ) : user?.userRole == "publisher" ? (
    <PublisherAssessment />
  ) : (
    <TeacherAssessment />
  );
}
