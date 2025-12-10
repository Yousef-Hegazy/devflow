import Image from "next/image";
import { Button } from "../ui/button";
import Link from "next/link";

const SocialAuthForm = async () => {
  return (
    <div className="mt-10 flex flex-wrap gap-2.5">
      <Button
        render={<Link href="/api/auth/login/github" className="flex-1" />}
        type="submit"
        className="background-dark400_light900 body-medium text-dark200_light800 rounded-2 min-h-12 w-full border-none px-4 py-3.5"
      >
        <Image
          src="/icons/github.svg"
          alt="GitHub Logo"
          width={20}
          height={20}
          className="invert-colors mr-2.5 object-contain"
        />
        <span>Sign In With GitHub</span>
      </Button>

      <Button
        render={<Link href="/api/auth/login/google" className="flex-1" />}
        type="submit"
        className="background-dark400_light900 body-medium text-dark200_light800 rounded-2 min-h-12 w-full flex-1 border-none px-4 py-3.5"
      >
        <Image
          src="/icons/google.svg"
          alt="Google Logo"
          width={20}
          height={20}
          className="mr-2.5 object-contain"
        />
        <span>Sign In With Google</span>
      </Button>
    </div>
  );
};

export default SocialAuthForm;
