import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import Evaluation from "./Evaluation";

export default async function HomePage() {
  const { user } = (await getServerSession(authOptions)) || {};

  return <Evaluation />;
}
