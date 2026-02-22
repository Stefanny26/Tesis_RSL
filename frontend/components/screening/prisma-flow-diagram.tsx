"use client"

import { Card, CardContent } from "@/components/ui/card"

interface PrismaFlowDiagramProps {
  stats: {
    identified: number
    duplicates: number
    afterDedup: number
    screenedTitleAbstract: number
    excludedTitleAbstract: number
    fullTextAssessed: number
    excludedFullText: number
    includedFinal: number
    pendingReview?: number
    databases?: Array<{ name: string; hits: number }>
    exclusionReasons?: Record<string, number>
    /** Desglose de motivos de exclusión en cribado título/abstract (Fase 1) */
    screeningExclusionReasons?: Record<string, number>
    /** Criterios de exclusión del protocolo (para mostrar categorías aun cuando n=0) */
    protocolExclusionCriteria?: string[]
  }
}

/* ─── PRISMA 2020 – Diseño basado en Page et al. (2021) ─── */

const FONT: React.CSSProperties = {
  fontFamily: "'Times New Roman', 'Noto Serif', Georgia, serif",
}

/* Anchuras fijas para columnas consistentes */
const W = {
  phase: 70,      // barra lateral de fase
  gap: 12,        // separación entre barra y contenido
  arrow: 40,      // ancho de flecha horizontal
  side: 220,      // columna lateral derecha
}

/* Mapeo de roles a clases Tailwind (light + dark) */
const BOX_STYLES = {
  idBox: "bg-[#DEEBF6] dark:bg-sky-900/50 text-slate-900 dark:text-slate-100",
  idSide: "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100",
  cribBox: "bg-[#FBE4D5] dark:bg-orange-900/40 text-slate-900 dark:text-slate-100",
  cribSide: "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100",
  inclBox: "bg-[#DEEBF6] dark:bg-sky-900/50 text-slate-900 dark:text-slate-100",
  header: "bg-[#F4B942] dark:bg-amber-600 text-slate-900 dark:text-white",
}

export function PrismaFlowDiagram({ stats }: PrismaFlowDiagramProps) {
  const retrieved = stats.fullTextAssessed
  const notRetrieved = 0
  // Total de bases de datos = suma de todas las fuentes conocidas
  // Si hay databases con desglose, usar la suma; sino usar identified
  const totalDatabases = stats.databases
    ? stats.databases.reduce((s, d) => s + d.hits, 0)
    : stats.identified
  // Registros/Archivos (otras fuentes no-DB) = identified - totalDatabases
  // Solo es > 0 si hay fuentes que no aparecen en el desglose (e.g. "Unknown")
  const otherSources = stats.databases 
    ? Math.max(0, stats.identified - totalDatabases)
    : 0

  return (
    <Card className="border-0 shadow-none bg-transparent overflow-hidden">
      <CardContent className="p-0 overflow-x-auto">
        <div className="mx-auto" style={{ ...FONT, maxWidth: 880, minWidth: 680 }}>

          {/* ══════════════════════════════════════════
              ENCABEZADO DORADO
              ══════════════════════════════════════════ */}
          <Box variant="header" className="text-center font-bold text-base mb-4 rounded">
            New studies via databases and registers
          </Box>

          {/* ══════════════════════════════════════════
              FASE: IDENTIFICACIÓN
              ══════════════════════════════════════════ */}
          <div className="flex" style={{ gap: W.gap }}>
            <PhaseLabel label="Identification" />

            {/* Contenido principal + flecha + lateral */}
            <div className="flex-1 flex items-stretch" style={{ gap: W.gap }}>
              {/* Caja principal */}
              <div className="flex-1">
                <Box variant="idBox" className="h-full flex flex-col justify-center">
                  <p className="text-sm font-semibold mb-1">Records identified from*:</p>
                  {stats.databases && stats.databases.length > 0 ? (
                    <>
                      <p className="text-sm ml-3">
                        Databases (n&nbsp;=&nbsp;{totalDatabases})
                      </p>
                      <ul className="text-xs ml-6 space-y-0.5 mt-0.5 list-disc">
                        {stats.databases.map((db) => (
                          <li key={db.name}>
                            {db.name} (n&nbsp;=&nbsp;{db.hits})
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="text-sm ml-3">
                      Databases (n&nbsp;=&nbsp;{stats.identified})
                    </p>
                  )}
                  <p className="text-sm ml-3 mt-1">
                    Registers (n&nbsp;=&nbsp;{otherSources})
                  </p>
                </Box>
              </div>

              <ArrowH />

              {/* Lateral: eliminados antes del cribado */}
              <div style={{ width: W.side, minWidth: W.side }}>
                <Box variant="idSide" className="h-full flex flex-col justify-center">
                  <p className="text-sm font-semibold mb-1">
                    Records removed before screening:
                  </p>
                  <p className="text-sm ml-3">Duplicates (n&nbsp;=&nbsp;{stats.duplicates})</p>
                  <p className="text-sm ml-3">
                    Records marked as ineligible by automation tools
                    (k&nbsp;=&nbsp;0)
                  </p>
                  <p className="text-sm ml-3">
                    Records removed for other reasons (n&nbsp;=&nbsp;0)
                  </p>
                </Box>
              </div>
            </div>
          </div>

          {/* Flecha ↓  entre Identificación y Cribado */}
          <ArrowVBetween />

          {/* ══════════════════════════════════════════
              FASE: CRIBADO  (3 filas, 1 barra lateral)
              ══════════════════════════════════════════ */}
          <div className="flex" style={{ gap: W.gap }}>
            <PhaseLabel label="Screening" />

            <div className="flex-1 flex flex-col" style={{ gap: 0 }}>
              {/* ── Fila 1: Registros cribados ── */}
              <Row
                main={
                  <>
                    <p className="text-sm font-semibold">Records screened</p>
                    <p className="text-base font-bold mt-1">
                      (n&nbsp;=&nbsp;{stats.screenedTitleAbstract})
                    </p>
                  </>
                }
                mainVariant="cribBox"
                side={
                  <div className="text-left">
                    <p className="text-sm font-semibold mb-1">Records excluded**</p>
                    <p className="text-sm font-bold mb-1 ml-3">
                      (n&nbsp;=&nbsp;{stats.excludedTitleAbstract})
                    </p>
                    {stats.screeningExclusionReasons &&
                    Object.keys(stats.screeningExclusionReasons).length > 0 ? (
                      Object.entries(stats.screeningExclusionReasons).map(([reason, count]) => (
                        <p className="text-xs ml-3" key={reason}>
                          {reason} (n&nbsp;=&nbsp;{count})
                        </p>
                      ))
                    ) : (
                      stats.excludedTitleAbstract > 0 && (
                        <p className="text-xs ml-3 text-muted-foreground">
                          Excluded by automated title and abstract screening
                        </p>
                      )
                    )}
                  </div>
                }
                sideVariant="cribSide"
              />

              <ArrowVInner />

              {/* ── Fila 2: Publicaciones recuperadas ── */}
              <Row
                main={
                  <>
                    <p className="text-sm font-semibold">
                      Reports retrieved for assessment
                    </p>
                    <p className="text-base font-bold mt-1">
                      (n&nbsp;=&nbsp;{retrieved})
                    </p>
                  </>
                }
                mainVariant="cribBox"
                side={
                  <>
                    <p className="text-sm font-semibold">Reports not retrieved</p>
                    <p className="text-base font-bold mt-1">
                      (n&nbsp;=&nbsp;{notRetrieved})
                    </p>
                  </>
                }
                sideVariant="cribSide"
              />

              <ArrowVInner />

              {/* ── Fila 3: Evaluación de elegibilidad ── */}
              <Row
                main={
                  <>
                    <p className="text-sm font-semibold">
                      Reports assessed for eligibility
                    </p>
                    <p className="text-base font-bold mt-1">
                      (n&nbsp;=&nbsp;{stats.fullTextAssessed})
                    </p>
                  </>
                }
                mainVariant="cribBox"
                side={
                  <div className="text-left">
                    <p className="text-sm font-semibold mb-1">Reports excluded:</p>
                    <p className="text-sm font-bold ml-3 mb-1">
                      Total (n&nbsp;=&nbsp;{stats.excludedFullText})
                    </p>
                    {(() => {
                      if (stats.exclusionReasons && Object.keys(stats.exclusionReasons).length > 0) {
                        return Object.entries(stats.exclusionReasons).map(([reason, count]) => (
                          <p className="text-xs ml-3" key={reason}>
                            {reason} (n&nbsp;=&nbsp;{count})
                          </p>
                        ))
                      }
                      if (stats.protocolExclusionCriteria && stats.protocolExclusionCriteria.length > 0) {
                        return stats.protocolExclusionCriteria.map((criteria) => (
                          <p className="text-xs ml-3 text-muted-foreground" key={criteria}>
                            {criteria} (n&nbsp;=&nbsp;0)
                          </p>
                        ))
                      }
                      if (stats.excludedFullText === 0) {
                        return (
                          <p className="text-xs ml-3 text-muted-foreground">
                            No reports were excluded at this stage
                          </p>
                        )
                      }
                      return null
                    })()}
                  </div>
                }
                sideVariant="cribSide"
              />
            </div>
          </div>

          {/* Flecha ↓  entre Cribado e Incluidos */}
          <ArrowVBetween />

          {/* ══════════════════════════════════════════
              FASE: INCLUIDOS
              ══════════════════════════════════════════ */}
          <div className="flex" style={{ gap: W.gap }}>
            <PhaseLabel label="Included" />

            <div className="flex-1">
              <Box variant="inclBox" className="text-center py-4">
                <p className="text-sm font-semibold">
                  New studies included in review
                  (n&nbsp;=&nbsp;{stats.includedFinal})
                </p>
                <p className="text-sm mt-0.5">
                  Records of new included studies
                  (n&nbsp;=&nbsp;{stats.includedFinal})
                </p>
              </Box>
            </div>
          </div>

          {/* ── Notas al pie ── */}
          <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 space-y-1 leading-relaxed">
            <p>
              * Consider, if feasible, reporting the number of records identified from each
              database or register searched (rather than the total number across all
              databases/registers).
            </p>
            <p>
              ** If automation tools were used, indicate how many records were excluded by a
              human and how many were excluded by automation tools.
            </p>
            <p className="italic mt-2">
              Diagram based on PRISMA 2020 guidelines (Page et al., 2021).
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ═══════════════════════════════════════════════════════
   Sub-componentes
   ═══════════════════════════════════════════════════════ */

/** Barra lateral de fase */
function PhaseLabel({ label }: { label: string }) {
  return (
    <div
      className="flex items-center justify-center rounded-sm shrink-0 bg-[#4472C4] dark:bg-blue-700 border-2 border-slate-600 dark:border-slate-500"
      style={{
        width: W.phase,
        minWidth: W.phase,
      }}
    >
      <span className="[writing-mode:vertical-lr] rotate-180 text-sm font-bold text-white whitespace-nowrap tracking-wide">
        {label}
      </span>
    </div>
  )
}

/** Caja genérica con borde — usa className para colores (soporta dark mode) */
function Box({
  variant,
  className = "",
  children,
}: {
  variant?: keyof typeof BOX_STYLES
  className?: string
  children: React.ReactNode
}) {
  const variantClass = variant ? BOX_STYLES[variant] : ""
  return (
    <div
      className={`border-2 px-4 py-3 rounded-sm border-slate-600 dark:border-slate-500 ${variantClass} ${className}`}
    >
      {children}
    </div>
  )
}

/** Fila de Cribado: main (izq) + flecha → + side (der) — centrados verticalmente */
function Row({
  main,
  mainVariant,
  side,
  sideVariant,
}: {
  main: React.ReactNode
  mainVariant: keyof typeof BOX_STYLES
  side: React.ReactNode
  sideVariant: keyof typeof BOX_STYLES
}) {
  return (
    <div className="flex items-stretch" style={{ gap: W.gap }}>
      <div className="flex-1">
        <Box variant={mainVariant} className="h-full flex flex-col items-center justify-center text-center">
          {main}
        </Box>
      </div>
      <ArrowH />
      <div style={{ width: W.side, minWidth: W.side }}>
        <Box variant={sideVariant} className="h-full flex flex-col items-center justify-center text-center">
          {side}
        </Box>
      </div>
    </div>
  )
}

/** Flecha horizontal → */
function ArrowH() {
  return (
    <div
      className="flex items-center shrink-0 text-slate-700 dark:text-slate-300"
      style={{ width: W.arrow }}
    >
      <svg width="100%" height="16" viewBox="0 0 40 16" preserveAspectRatio="none">
        <line x1="0" y1="8" x2="32" y2="8" stroke="currentColor" strokeWidth="2" />
        <polygon points="32,4 32,12 40,8" fill="currentColor" />
      </svg>
    </div>
  )
}

/**
 * Flecha vertical ↓ ENTRE fases.
 * Se alinea debajo de la columna principal (sin contar la lateral).
 */
function ArrowVBetween() {
  return (
    <div className="flex my-2 text-slate-700 dark:text-slate-300" style={{ gap: W.gap }}>
      {/* Espacio de la barra lateral */}
      <div style={{ width: W.phase, minWidth: W.phase }} />
      {/* Centro sobre la columna principal */}
      <div className="flex-1">
        <div className="flex justify-center">
          <svg width="3" height="28" className="overflow-visible">
            <line x1="1.5" y1="0" x2="1.5" y2="28" stroke="currentColor" strokeWidth="2" />
            <polygon points="-2,20 5,20 1.5,28" fill="currentColor" />
          </svg>
        </div>
      </div>
      {/* Espacio equivalente a flecha + lateral para mantener centrado */}
      <div className="shrink-0" style={{ width: W.arrow + W.gap + W.side }} />
    </div>
  )
}

/**
 * Flecha vertical ↓ DENTRO de una fase (entre filas de Cribado).
 * Se centra sobre la columna principal solamente.
 */
function ArrowVInner() {
  return (
    <div className="flex my-1 text-slate-700 dark:text-slate-300" style={{ gap: W.gap }}>
      <div className="flex-1">
        <div className="flex justify-center">
          <svg width="3" height="22" className="overflow-visible">
            <line x1="1.5" y1="0" x2="1.5" y2="22" stroke="currentColor" strokeWidth="2" />
            <polygon points="-2,14 5,14 1.5,22" fill="currentColor" />
          </svg>
        </div>
      </div>
      {/* Compensar el espacio de la lateral para centrar correctamente */}
      <div className="shrink-0" style={{ width: W.arrow + W.gap + W.side }} />
    </div>
  )
}
