import "bootstrap/dist/css/bootstrap.css";
import "alertifyjs/build/css/alertify.css";
import "alertifyjs/build/css/themes/default.min.css";

import "@/public/assets/fonts/font.css";
import "@/public/css/font-icon.css";
import "@/public/css/base.style.css";
import "@/public/css/global.css";
import "@/public/css/code-theme.css";
import "@/public/css/student.style.css";
import "@/public/css/teacher.style.css";
import "@/public/css/responsive.css";
import "@/public/css/student.responsive.css";
import "@/public/css/teacher.responsive.css";

import { Karla } from "next/font/google";
import Providers from "./Providers";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "rsuite/dist/rsuite.css";
import { SocketProvider } from "../contexts/SocketContext";
import { Footer } from "./Footer";

config.autoAddCss = false;

const karla = Karla({ subsets: ["latin"] });

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Perfectice</title>
        {process.env.NODE_ENV != "development" && (
          <>
            <link rel="stylesheet" href="/css/base.style.css" />
            <link rel="stylesheet" href="/css/global.css" />
            <link rel="stylesheet" href="/css/code-theme.css" />
            <link rel="stylesheet" href="/css/student.style.css" />
            <link rel="stylesheet" href="/css/teacher.style.css" />
            <link rel="stylesheet" href="/css/responsive.css" />
            <link rel="stylesheet" href="/css/student.responsive.css" />
            <link rel="stylesheet" href="/css/teacher.responsive.css" />
          </>
        )}
      </head>
      <body className={karla.className}>
        <div id="wrapper">
          <div className=" mw-100" id="page-wrapper">
            <Providers>
              <SocketProvider>{children}</SocketProvider>
            </Providers>
          </div>

          {/* @ts-expect-error Async Server Component */}
          <Footer></Footer>
          {modal}
        </div>
      </body>
    </html>
  );
}
