import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const user = await getUser();
  if (user) {
    redirect(user.role === "admin" ? "/admin" : "/user");
  }
  return <LoginForm />;
}
