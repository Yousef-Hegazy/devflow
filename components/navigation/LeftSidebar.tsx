import { getCurrentUser } from "@/lib/helpers/server";
import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import NavLinks from "./navbar/NavLinks";

const LeftSidebar = async () => {
  const user = await getCurrentUser();

  return (
    <section className="custom-scrollbar background-light900_dark200 light-border shadow-light-300 sticky top-0 left-0 flex h-screen flex-col justify-between overflow-y-auto border-r p-6 pt-36 max-sm:hidden lg:w-[266px] dark:shadow-none">
      <div className="flex flex-1 flex-col gap-6">
        <NavLinks />
      </div>

      <div className="flex flex-col gap-3">
        {user?.$id ? (
          <Button
            className="base-medium text-foreground w-fit rounded border-0 bg-transparent px-4 py-3 shadow-transparent inset-shadow-transparent hover:bg-transparent"
            render={<Link href="/api/auth/logout" />}
          >
            <LogOut className="text-foreground size-5" />
            <span className="text-dark300_light900 max-lg:hidden">Logout</span>
          </Button>
        ) : (
          <>
            <Link href="/sign-in">
              <Button
                render={<span />}
                className="small-medium! lg:body-medium! bg-secondary! min-h-[41px]! w-full! rounded-lg border-0 py-3 shadow-transparent inset-shadow-transparent lg:px-4"
              >
                <Image
                  src="/icons/account.svg"
                  alt="Account Icon"
                  width={20}
                  height={20}
                  className="invert-colors lg:hidden"
                />
                <span className="primary-text-gradient max-lg:hidden">
                  Sign In
                </span>
              </Button>
            </Link>

            <Link href="/sign-up">
              <Button
                render={<span />}
                className="small-medium! lg:body-medium! light-border-2! btn-tertiary! text-dark400_light900! min-h-[41px]! w-full! rounded-lg border py-3 shadow-transparent inset-shadow-transparent lg:px-4"
              >
                <Image
                  src="/icons/sign-up.svg"
                  alt="Account Icon"
                  width={20}
                  height={20}
                  className="invert-colors lg:hidden"
                />
                <span className="max-lg:hidden">Sign Up</span>
              </Button>
            </Link>
          </>
        )}
      </div>
    </section>
  );
};

export default LeftSidebar;
