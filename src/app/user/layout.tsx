import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export const metadata = {
  title: "User Dashboard — AIPI Bench",
};

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex">
      {/* Sidebar */}
      <aside className="w-64 bg-bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-bold">AIPI Bench</h2>
          <p className="text-xs text-muted mt-1">User Dashboard</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {/* Navigation items can be added here later */}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="text-sm text-muted mb-3 truncate">
            {user.username}
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
