import { AppLogo } from "@/components/AppLogo"
import Link from "next/link"

export default async function TermsPage() {
  return <>
    <header>
      <div className="container">
        <div className="d-flex justify-content-between">
          <nav className="navbar navbar-expand-lg navbar-light p-0">
            <Link className="navbar-brand p-0" href="/">
              <AppLogo></AppLogo>
            </Link>
          </nav>

          <ul className="nav">
            <li className="nav-item">
              <Link className="btn" href="/signup">Sign Up</Link>
            </li>
            <li className="nav-item">
              <Link className="btn btn-primary" href="/">Login</Link>
            </li>
          </ul>
        </div>
      </div>
    </header>

    <section className="details mt-0">
      <div className="container">
        <div className="banner-blue">
          <h3 className="text-white text-center">Terms of Services</h3>
        </div>
      </div>
    </section>

    <main className="privacy-home bg-white">
      <div className="container">
        <figure className="privacy-img">
          <img src="/assets/images/privacy-1.png" alt=""></img>
        </figure>
        <div className="privacy-box">
          <h4 className="text-head-4-kar ml-0 mt-2">Introduction</h4>
          <p className="text-head-5-kar mt-2 mb-4">This policy provides general information about the privacy policy of this website and its related apps (mobile or otherwise). If you are under the age of 18, it is mandatory that your parent or guardian has read and accepted the terms and conditions mentioned herein on your behalf and by your use of the site it is deemed that you have obtained parental consent for the same. If your parent or guardian has not read and agreed to the terms and conditions, you will not have permission to use our site. Your use of this service constitutes acceptance by you of this privacy statement.

            Quality Matters and its subsidiaries and affiliates (&quot;Quality Matters&quot;) are providing you this site and its related applications and services (collectively, &quot;Service&quot;). The Service may be delivered to you through the Internet via your browser or app (mobile or otherwise).</p>
        </div>
        <div className="privacy-box">
          <h4 className="text-head-4-kar ml-0 mt-2">Privacy Policy</h4>
          <p className="text-head-5-kar mt-2 mb-4">(&quot;Privacy Policy&quot;) discloses how we collect, protect, use and share information gathered on this Service. Your use of this Service is further subject to the terms of use (&quot;Terms of Use&quot;) posted on this website or app (this Privacy Statement is part of the Terms of Use).

            If you have any questions or concerns about the Privacy Policy, please Contact Us</p>
        </div>
        <div className="privacy-box">
          <h4 className="text-head-4-kar ml-0 mt-2">Information covered Under This Privacy Policy</h4>
          <p className="text-head-5-kar mt-2 mb-4">This Privacy Policy covers information we collect from you through our Site. Some of our Site&apos;s functionality can be used without revealing any personal information, though for features or services related to the Online Courses, personal information is required. If you do not use these specific features or services on the Site, then the only information we collect will be &quot;Non-Personal Information&quot; (i.e., information that cannot be used to identify you). Non-Personal Information includes information such as the web pages that you have viewed. In order to access certain features and benefits on our Site, you may need to submit &quot;Personally Identifiable Information&quot; (i.e., information that can be used to identify you). Personally Identifiable Information can include information such as your name and email address, among other things. You are responsible for ensuring the accuracy of the Personally Identifiable Information you submit to Quality Matters. Inaccurate information may affect your ability to use the Site, the information you receive when using the Site, and our ability to contact you. For example, your email address and mobile number should be kept current because that is one of the primary manners in which we communicate with you.</p>
        </div>
        <div className="privacy-box">
          <h4 className="text-head-4-kar ml-0 mt-2">Cookies And Other Tracking trechnologies</h4>
          <p className="text-head-5-kar mt-2 mb-4">We use cookies and other tracking technologies online. Please ask for our Cookie Policy which is part of this Privacy Policy, and is incorporated herein by reference.</p>
        </div>
        <div className="privacy-box">
          <h4 className="text-head-4-kar ml-0 mt-2">Third Party Websites</h4>
          <p className="text-head-5-kar mt-2 mb-4">Under certain circumstances, Quality Matters may need to share information, including Personally Identifiable Information, with a third party to respond to your request, for instance where necessary to provide you with the requested services at your location, or consistent with the purpose for which the information was obtained.

            Quality Matters will also share or release information, including Personally Identifiable Information, if we have an individual&apos;s permission to make the disclosure, or when we believe release is appropriate to comply with the law, enforce or apply our Terms of Use and other policies or agreements, or protect the rights, property, or safety of Quality Matters, our users, or others (including for fraud protection).</p>
        </div>
        <div className="privacy-box">
          <h4 className="text-head-4-kar ml-0 mt-2">Third Party Services </h4>
          <p className="text-head-5-kar mt-2 mb-4">Our website includes hyperlinks to, and details of, third party websites. We have no control over, and are not responsible for, the privacy policies and practices of third parties.</p>
        </div>
        <div className="privacy-box">
          <h4 className="text-head-4-kar ml-0 mt-2">Your Consent </h4>
          <p className="text-head-5-kar mt-2 mb-4">By submitting any Personally Identifiable Information to us, you consent and agree that we may collect, use and disclose such Personally Identifiable Information in accordance with this Privacy Policy and our Terms of Use and as permitted or required by law. If you do not agree with these terms, then please do not provide any Personally Identifiable Information to us. If you refuse or withdraw your consent, or if you choose not to provide us with any required Personally Identifiable Information, we may not be able to provide you with the services that can be offered on our Site.</p>
        </div>
        <div className="privacy-box">
          <h4 className="text-head-4-kar ml-0 mt-2">Updating Your Information</h4>
          <p className="text-head-5-kar mt-2 mb-4">We provide mechanisms for updating and correcting your Personally Identifiable Information for many of our services.</p>
        </div>
        <div className="privacy-box">
          <h4 className="text-head-4-kar ml-0 mt-2">Confidentiality And Security</h4>
          <p className="text-head-5-kar mt-2 mb-4">We limit access to Personally Identifiable Information about you to employees who we believe reasonably need to come into contact with that information to provide services to you or in order to do their jobs.

            We have physical, electronic, and procedural safeguards that comply with the laws prevalent in India to protect personal information about you.</p>
        </div>
        <div className="privacy-box">
          <h4 className="text-head-4-kar ml-0 mt-2">Change Your Personal Information</h4>
          <p className="text-head-5-kar mt-2 mb-4">To update, correct or review your Personally Identifiable Information that was previously provided by you to use, you have the following options:

            If you have signed up with us and have an account, you may make the changes on your account profile page by signing in and saving the said changes/ modfications. Any change/ modification made by you, will be reflected on the website.

            In the alternative, you may write to us at the following address:

            Perfectice Eduventure Pvt. Ltd.
            Vasantdada Patil Education Complex, Eastern Express Highway, Sion - Chunabhatti, Near Everard Nagar, Mumbai, Maharashtra 400022

            Please mention the changes to be made clearly and we will try and update the requite changes/ modifications as requested by you in your letter.</p>
        </div>
        <div className="privacy-box">
          <h4 className="text-head-4-kar ml-0 mt-2">Sensitive Information</h4>
          <p className="text-head-5-kar mt-2 mb-4">Kindly do not send us or disclose any sensitive personal information for example information relating to your racial or ethnic origin, political opinions, religion or other beliefs, health etc. on or through the site or otherwise to us.</p>
        </div>
        <div className="privacy-box">
          <h4 className="text-head-4-kar ml-0 mt-2">Intellectual Propert Rights</h4>
          <p className="text-head-5-kar mt-2 mb-4">You should assume that all contents of the Website are copyrighted unless otherwise noted and may not be used except as provided herein and without the express written permission of Quality Matters. Images of people or places displayed on the Website are either the property of, or used with permission by, Quality Matters. The trademarks, logos and service marks (collectively, the &quot;Trademarks&quot;) displayed on the Website are registered and unregistered trademarks of Quality Matters and others. Nothing contained in this Website should be construed as granting, by implication, estoppel or otherwise, any license or right in and to the Trademarks without the express written permission of Quality Matters or such third party. Your misuse of the Trademarks on the Website and in its contents, except as provided in these Terms and Conditions, is strictly prohibited. You are advised that Quality Matters will aggressively enforce its intellectual property rights in the Website and its contents to the fullest extent of the law, including by seeking criminal sanctions. </p>
        </div>
        <div className="privacy-box">
          <h4 className="text-head-4-kar ml-0 mt-2">Applicable Law And Jurisidiction</h4>
          <p className="text-head-5-kar mt-2 mb-4">These terms and conditions are governed by and to be interpreted in accordance with laws of India, without regard to the choice or conflicts of law provisions of any jurisdiction. You agree, in the event of any dispute arising in relation to these terms and conditions or any dispute arising in relation to the website whether in contract or tort or otherwise, to submit to the jurisdiction of the courts located at Mumbai, India for the resolution of all such disputes.</p>
        </div>
        <div className="privacy-box">
          <h4 className="text-head-4-kar ml-0 mt-2">Limitation Of Liability</h4>
          <p className="text-head-5-kar mt-2 mb-4">Your use of our site is at your own risk. In no event and under no circumstances and under no legal theory, tort, contract, or otherwise shall &apos;Quality Matters&apos;. be liable, for any damages whatsoever, including direct, indirect, incidental, consequential or punitive damages, arising out of any access to or any use of or any inability to access or use this website including any material, information, links, and content accessed through this website or through any linked external website.</p>
        </div>

        <div className="privacy-box">
          <h4 className="text-head-4-kar ml-0 mt-2">Disclaimer</h4>
        </div>

        <div className="privacy-box-1">
          <h4 className="text-head-4-kar ml-0 mt-2">Disclaimer Of Liability</h4>
          <p className="text-head-5-kar mt-2 mb-4">While Quality Matters makes every effort to ensure that its databases are error-free, errors do occur. We ask that you notify us immediately of any errors that you discover in our data. We will make every effort to correct them.

            With respect to documents available from this server, Quality Matters nor any of its employees, makes any warranty, express or implied, including the warranties of merchantability and fitness for a particular purpose; nor assumes any legal liability or responsibility for the accuracy, completeness, or usefulness of any information, product, service or process disclosed; nor represents that its use would not infringe privately owned rights.</p>
        </div>
        <div className="privacy-box-1">
          <h4 className="text-head-4-kar ml-0 mt-2">Disclaimer Of External Links </h4>
          <p className="text-head-5-kar mt-2 mb-4">The appearance of external links on Quality Matters websites does not constitute endorsement of external websites or the information, products, or services contained therein by Quality Matters. Quality Matters does not exercise any editorial control over the information you may find at external website locations. External links are provided for your convenience.</p>
        </div>
        <div className="privacy-box-1">
          <h4 className="text-head-4-kar ml-0 mt-2">Disclaimer Of Questions And Suggestions</h4>
          <p className="text-head-5-kar mt-2 mb-4">It is important to us at Quality Matters to hear what visitors and users of the Website have to say about our services or our policies. If you have any questions, concerns or complaints about this Policy or want to let us know what you think about our services, please contact us using the following information:

            Effective Date: This policy is effective and was last updated on 14th Apr, 2017</p>
        </div>
      </div>
    </main>

    <div className="bottom-pagination bg-white">
      <a href="/about-us">About Us </a>
      <a href="/contact-us">Contact Us</a>
      {/* <a *ngIf="(appInit.clientData | async)?.urls?.blog" [href]="(appInit.clientData | async).urls.blog">Blog </a>
    <a *ngIf="(appInit.clientData | async)?.urls?.forum" [href]="(appInit.clientData | async).urls.forum">Forums</a> */}
      <a href="/faqs">FAQ&apos;s</a>
      <a href="/privacy">Privacy </a>
    </div>
  </>
}
