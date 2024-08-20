import { getSettings } from "@/lib/api";
import { getServerSession } from "next-auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faInstagram,
  faLinkedinIn,
  faTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import Image from "next/image";

export async function Footer() {
  const settings = await getSettings();
  const session = await getServerSession();

  return (
    <footer className="bg-primary text-white d-block py-1">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-5">
            <div className="d-md-flex align-items-center">
              <div className="footer_socials">
                {settings.urls?.facebookUrl && (
                  <a
                    href={settings.urls.facebookUrl}
                    className="footer_socials_links"
                    aria-label="going to facebook"
                  >
                    <FontAwesomeIcon icon={faFacebook} />
                  </a>
                )}
                {settings.urls?.twitterUrl && (
                  <a
                    href={settings.urls.twitterUrl}
                    className="footer_socials_links"
                    aria-label="going to twitter"
                  >
                    <FontAwesomeIcon icon={faTwitter} />
                  </a>
                )}
                {settings.urls?.linkedinUrl && (
                  <a
                    href={settings.urls.linkedinUrl}
                    className="footer_socials_links"
                    aria-label="going to linkedin"
                  >
                    <FontAwesomeIcon icon={faLinkedinIn} />
                  </a>
                )}
                {settings.urls?.instagramUrl && (
                  <a
                    href={settings.urls.instagramUrl}
                    className="footer_socials_links"
                    aria-label="going to instagram"
                  >
                    <FontAwesomeIcon icon={faInstagram} />
                  </a>
                )}
                {settings.urls?.youtubeUrl && (
                  <a
                    href={settings.urls.youtubeUrl}
                    className="footer_socials_links"
                    aria-label="going to youtube"
                  >
                    <FontAwesomeIcon icon={faYoutube} />
                  </a>
                )}
              </div>

              <div className="d-flex justify-content-center">
                {settings.mobileUrl?.android &&
                  settings.mobileUrl.android != "#" && (
                    <a href={settings.mobileUrl.android}>
                      <figure className="mr-2">
                        <Image
                          src="/assets/images/google-play.png"
                          alt=""
                          width={90}
                          height={30}
                          className="d-block mx-auto"
                        ></Image>
                      </figure>
                    </a>
                  )}
                {settings.mobileUrl?.ios && settings.mobileUrl.ios != "#" && (
                  <a href={settings.mobileUrl.ios}>
                    <figure>
                      <Image
                        src="/assets/images/apple-play.png"
                        alt=""
                        width={90}
                        height={30}
                        className="d-block mx-auto"
                      ></Image>
                    </figure>
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="d-flex align-items-center justify-content-md-start justify-content-center">
              <figure>
                <img
                  src={settings.browserIcon}
                  alt=""
                  style={{ height: "34px", marginRight: "5px" }}
                ></img>
              </figure>
              <div
                dangerouslySetInnerHTML={{ __html: settings.copyRight }}
              ></div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-md-right">
              {session && session.accessToken && (
                <a href="/unsubscribe" className="foot_links mr-5">
                  Unsubscribe
                </a>
              )}
              <a href="/privacy" className="foot_links">
                Privacy
              </a>
              <span className="mx-2">/</span>
              <a href="/terms" className="foot_links">
                Terms of use
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
