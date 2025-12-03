import { isAuthenticated } from "@/lib/helpers/server";

export default async function Home() {
  const isAuth = await isAuthenticated();

  return (
    <div>
      <p>Hello World</p>
    </div>
  );
}
