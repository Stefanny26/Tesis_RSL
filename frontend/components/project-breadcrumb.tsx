"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function ProjectBreadcrumb({ projectId, projectTitle }: { projectId?: string; projectTitle?: string }) {
  const pathname = usePathname()
  
  const generateBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean)
    const items = []
    
    // Always start with Dashboard
    items.push({ label: "Panel Principal", href: "/dashboard", isHome: true })
    
    // Map segments to readable labels
    const labelMap: Record<string, string> = {
      projects: "Proyectos",
      protocol: "Protocolo PICO",
      screening: "Cribado de Referencias",
      prisma: "Validación PRISMA",
      article: "Redacción del Artículo",
      "new-project": "Nuevo Proyecto",
    }
    
    segments.forEach((segment, index) => {
      // Skip dashboard segment
      if (segment === "dashboard") return
      
      // Skip if it's a UUID
      if (segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        if (projectTitle) {
          items.push({
            label: projectTitle,
            href: `/projects/${segment}`,
          })
        }
        return
      }
      
      // Add mapped segment
      if (labelMap[segment]) {
        const isLast = index === segments.length - 1
        items.push({
          label: labelMap[segment],
          href: isLast ? undefined : `/${segments.slice(0, index + 1).join("/")}`,
        })
      }
    })
    
    return items
  }
  
  const breadcrumbs = generateBreadcrumbs()
  
  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link href={item.href} className="flex items-center gap-1.5">
                    {item.isHome && <Home className="h-3.5 w-3.5" />}
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
