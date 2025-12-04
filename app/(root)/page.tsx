import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>

        <Button
          render={<Link href="/ask-question" />}
          className="primary-gradient! text-light-900! min-h-[46px]! border-0! px-4! py-3!"
        >
          Ask a Question
        </Button>
      </section>
      <section className="mt-11">LocalSearch</section>
      HomeFilter
      <div className="mt-10 flex w-full flex-col gap-6">
        <p>Question Card 1</p>
        <p>Question Card 1</p>
        <p>Question Card 1</p>
        <p>Question Card 1</p>
      </div>
    </>
  );
}
