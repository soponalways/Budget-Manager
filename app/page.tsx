import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";

export default async function Home() {
  const session = await getServerSession(authOptions)
  console.log("The session data is on home page ", session);
  return (
    <div>
      <main>
        <h1>Hello World!</h1>
      </main>
    </div>
  );
}
