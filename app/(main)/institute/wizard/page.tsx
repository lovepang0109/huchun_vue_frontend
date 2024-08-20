import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import InstituteWizard from "./InstituteWizard";
import "./institute.css";

export default async function LiveBoardServerComponent() {
  const session: any = await getServerSession(authOptions);
  return <InstituteWizard />;
}
