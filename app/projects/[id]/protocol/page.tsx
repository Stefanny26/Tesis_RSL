import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { ProtocolWizard } from "@/components/protocol/protocol-wizard"

export default function ProtocolPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="container mx-auto px-4 py-8">
        <ProtocolWizard projectId={params.id} />
      </main>
    </div>
  )
}
