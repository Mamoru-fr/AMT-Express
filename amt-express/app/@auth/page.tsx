import {redirect} from "next/dist/client/components/navigation";

export default function AuthPage() {
  redirect("/connections?view=signin");
  return null;
}
