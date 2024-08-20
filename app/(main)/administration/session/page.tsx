import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import SessionManagement from "./SessionManagement";

export default async function HomeRoute() {
  const session: any = await getServerSession(authOptions);

  return <SessionManagement />;
}
