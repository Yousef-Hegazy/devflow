"use client";

import authClient from "@/auth-client";
import BurgerMenuBtn from "@/components/ui/burger-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { User } from "@/db/schema-types";
import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import NavLinks from "./NavLinks";

const MobileNavigation = ({ user }: { user: User | null }) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="sm:hidden">
        <BurgerMenuBtn open={open} setOpen={setOpen} />
      </SheetTrigger>

      <SheetPopup side="left">
        <SheetHeader>
          <SheetTitle className="hidden">Navigation</SheetTitle>
          <Link
            href={{
              href: "/",
            }}
            className="flex items-center gap-1"
          >
            <Image
              src="/images/site-logo.svg"
              width={23}
              height={23}
              alt="DevFlow Logo"
            />
            <p className="h2-bold font-space-grotesk text-dark-100 dark:text-light-900">
              Dev<span className="text-primary-500">Flow</span>
            </p>
          </Link>
        </SheetHeader>
        <SheetPanel>
          <div className="no-scrollbar flex h-[calc(100vh-100px)] flex-col justify-between overflow-y-auto">
            <SheetClose>
              <section className="flex h-full flex-col gap-6 pt-16">
                <NavLinks isMobile />
              </section>
            </SheetClose>

            <div className="flex flex-col gap-3">
              {user?.id ? (
                <SheetClose>
                  <Button
                    type="submit"
                    className="base-medium text-foreground w-fit rounded border-0 bg-transparent px-4 py-3 shadow-transparent inset-shadow-transparent hover:bg-transparent"
                    onClick={() => authClient.signOut()}
                  >
                    <LogOut className="text-foreground size-5" />
                    <span className="text-dark300_light900">Sign Out</span>
                  </Button>
                </SheetClose>
              ) : (
                <>
                  <SheetClose>
                    <Link href="/sign-in">
                      <Button
                        render={<span />}
                        className="small-medium! bg-secondary! min-h-10.25! w-full! rounded-lg border-0! px-4 py-3 shadow-none! ring-0!"
                      >
                        <span className="primary-text-gradient">Sign In</span>
                      </Button>
                    </Link>
                  </SheetClose>

                  <SheetClose>
                    <Link href="/sign-up">
                      <Button
                        render={<span />}
                        className="small-medium! light-border-2! btn-tertiary! text-dark400_light900! min-h-10.25! w-full! rounded-lg border px-4 py-3 shadow-none"
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </SheetClose>
                </>
              )}
            </div>
          </div>
        </SheetPanel>
      </SheetPopup>
    </Sheet>
  );
};

export default MobileNavigation;
