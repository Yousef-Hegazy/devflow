"use client";

import authClient from "@/auth-client";
import Image from "next/image";
import LoadingButton from "../ui/LoadingButton";

const SocialAuthForm = () => {
  // const [, githubLogin, isPendingGithub] = useActionState(
  //   loginWithGithub,
  //   null,
  // );
  // const [, googleLogin, isPendingGoogle] = useActionState(
  //   loginWithGoogle,
  //   null,
  // );

  return (
    <div className="mt-10 flex flex-wrap gap-2.5">
      {/* <form action={githubLogin} className="flex-1"> */}
      <LoadingButton
        // isLoading={isPendingGithub}
        // disabled={isPendingGoogle}
        type="submit"
        className="background-dark400_light900 body-medium text-dark200_light800 rounded-2 min-h-12 w-full flex-1 border-none px-4 py-3.5"
        onClick={() => authClient.signIn.social({ provider: "github" })}
      >
        <Image
          src="/icons/github.svg"
          alt="GitHub Logo"
          width={20}
          height={20}
          className="invert-colors mr-2.5 object-contain"
        />
        <span>Sign In With GitHub</span>
      </LoadingButton>
      {/* </form> */}

      <LoadingButton
        // isLoading={isPendingGoogle}
        // disabled={isPendingGithub}
        type="submit"
        className="background-dark400_light900 body-medium text-dark200_light800 rounded-2 min-h-12 w-full flex-1 border-none px-4 py-3.5"
        onClick={() => authClient.signIn.social({ provider: "google" })}
      >
        <Image
          src="/icons/google.svg"
          alt="Google Logo"
          width={20}
          height={20}
          className="mr-2.5 object-contain"
        />
        <span>Sign In With Google</span>
      </LoadingButton>
    </div>
  );
};

export default SocialAuthForm;
