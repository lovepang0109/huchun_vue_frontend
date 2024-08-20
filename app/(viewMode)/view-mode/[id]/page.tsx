import { getServerSession } from "next-auth";
import ViewModeComponent from "./ViewMode.component";
import { getSettings } from "@/lib/api";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function CourseHome() {
  const settings = await getSettings();
  const session: any = await getServerSession(authOptions);
  return <ViewModeComponent user={session?.user?.info} settings={settings} />;
}
