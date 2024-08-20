import { AppLogo } from '@/components/AppLogo';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import ConfirmRegister from './ConfirmRegister';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function ConfirmRegisterPage() {
  let session = await getServerSession(authOptions)

  return (
    <section className="login bg-white">

      <div className="login-area">
        <div className="logo mr-auto mb-2">
          <Link href="/">
            <AppLogo />
          </Link>
        </div>

        <ConfirmRegister user={session?.user.info} ></ConfirmRegister>

      </div>
    </section>
  )
}

