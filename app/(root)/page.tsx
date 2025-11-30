import { Button } from "@/components/ui/button";
import { isAuthenticated } from "@/lib/helpers/server";
import Link from "next/link";

export default async function Home() {
  const isAuth = await isAuthenticated();

  return (
    <div className="p-10">
      <p>
        Hello World
      </p>

      <Button render={<Link href="/api/auth/logout" />} type="submit" className="mt-[100px]">
        {isAuth ? "Logout" : "Not Logged In"}
      </Button>
    </div>
  );
}
