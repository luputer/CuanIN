"use client";

import dynamic from "next/dynamic";

const HeaderLogin = dynamic(() => import("~/components/layout/header-login"), { ssr: false });

export default function HeaderLoginWrapper() {
  return <HeaderLogin />;
}
