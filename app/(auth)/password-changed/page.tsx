import { AppLogo } from '@/components/AppLogo';
import { getSettings } from '@/lib/api';
import Link from 'next/link';

export default async function PasswordChangedPage() {
  const settings = await getSettings()

  return (
    <section className="login bg-white">

      <div className="login-area">
        <div className="logo mr-auto mb-2">
          <Link href="/">
            <AppLogo />
          </Link>
        </div>

        <form className="bg-white">
          <div className="heading mx-auto">
            <h4 className="text-center">Reset Password</h4>
          </div>

          <div className="success-text pb-5">
            <p className="text-center">Your password has been reset <Link href="/">Click here</Link> to login</p>
          </div>

          <div className="register-info text-center">
            <p>Having trouble? Contact: <Link href={'mailto:' + settings.supportEmail + '?Subject=Hello'} target="_top">{settings.supportEmail}</Link></p>
          </div>
        </form>

      </div>
    </section>
  )
}

