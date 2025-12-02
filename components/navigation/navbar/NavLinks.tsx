"use client";

import { sidebarLinks } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NavLink = ({
  isMobile,
  imgURL,
  label,
  route,
}: (typeof sidebarLinks)[0] & { isMobile?: boolean }) => {
  const pathname = usePathname();
  const isActive =
    (pathname.includes(route) && route.length > 1) || route === pathname;

  return (
    <Link
      href={route.includes("profile") ? "/profile/me" : route}
      className={cn(
        "flex items-center justify-start gap-4 bg-transparent p-4",
        {
          "primary-gradient text-light-900 rounded-lg": isActive,
          "text-dark300_light900": !isActive,
        },
      )}
    >
      <Image
        className={cn({
          "invert-colors": !isActive,
        })}
        src={imgURL}
        alt={label}
        width={20}
        height={20}
      />
      <p
        className={cn({
          "base-bold": isActive,
          "base-medium": !isActive,
          "max-lg:hidden": !isMobile,
        })}
      >
        {label}
      </p>
    </Link>
  );
};

const NavLinks = ({ isMobile = false }: { isMobile?: boolean }) => {
  return (
    <>
      {sidebarLinks.map((link) => (
        <NavLink isMobile={isMobile} key={link.label} {...link} />
      ))}
    </>
  );
};

export default NavLinks;
