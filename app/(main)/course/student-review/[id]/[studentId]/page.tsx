import { getSettings } from "@/lib/api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import StudentReviewComponent from "./StudentReviewDetails";

export default async function StudentProgressHome() {
  const settings = await getSettings();
  const session: any = await getServerSession(authOptions);
  return <StudentReviewComponent settings={settings} />;
}
