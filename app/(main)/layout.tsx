import { IdleTimer } from '@/components/IdleTimer';
import { Header } from './(navbar)/Header';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Layout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);

  return (
    <div>
      <Header user={session?.user} />
      <div>{children}</div>
      <IdleTimer />
    </div>
  );
}
