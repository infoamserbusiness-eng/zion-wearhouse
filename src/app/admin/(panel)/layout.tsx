import { requireStaff } from "@/lib/auth";
import PanelShell from "./PanelShell";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  return (
    <PanelShell role={user.role} name={user.full_name} email={user.email}>
      {children}
    </PanelShell>
  );
}
