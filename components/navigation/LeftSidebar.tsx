import Link from "next/link";
import { Button } from "../ui/button";
import NavLinks from "./navbar/NavLinks";
import Image from "next/image";

const LeftSidebar = () => {
  return (
    <section className="custom-scrollbar background-light900_dark200 light-border shadow-light-300 sticky top-0 left-0 flex h-screen flex-col justify-between overflow-y-auto border-r p-6 pt-36 max-sm:hidden lg:w-[266px] dark:shadow-none">
      <div className="flex flex-1 flex-col gap-6">
        <NavLinks />
      </div>

      <div className="flex flex-col gap-3">
        <Link href="/sign-in">
          <Button
            render={<span />}
            className="small-medium! bg-secondary! min-h-[41px]! w-full! rounded-lg border-0! py-3 shadow-none! ring-0! lg:px-4"
          >
            <Image
              src="/icons/account.svg"
              alt="Account Icon"
              width={20}
              height={20}
              className="invert-colors lg:hidden"
            />
            <span className="primary-text-gradient max-lg:hidden">Sign In</span>
          </Button>
        </Link>

        <Link href="/sign-up">
          <Button
            render={<span />}
            className="small-medium! light-border-2! btn-tertiary! text-dark400_light900! min-h-[41px]! w-full! rounded-lg border py-3 shadow-none lg:px-4"
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
      </div>
    </section>
  );
};

export default LeftSidebar;
