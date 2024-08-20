import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import MailTemplate from "./MailTemplate";

export default async function HomeRoute() {
  const session: any = await getServerSession(authOptions);

  if (session?.user.userRole === "admin") {
    return <MailTemplate />;
  }
}
