"use client";

export function AppLogo({ user }) {
  return (
    <figure>
      <img
        src={
          (user?.info.primaryInstitute?.logo != '')
            ? user?.info.primaryInstitute?.logo
            : "https://d15aq2mos7k6ox.cloudfront.net/images/codemode_logo.png"
        }
        alt="this is Logo"
        width="166"
        height="28"
      ></img>
    </figure>
  );
}
