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
    databases?: Array<{ name: string, hits: number }>
    exclusionReasons?: Record<string, number>
  }
}

/* ─── PRISMA 2020 Standard Design (Page et al., 2021) ─── */

const serifFont = { fontFamily: "'Times New Roman', 'Noto Serif', Georgia, serif" }

export function PrismaFlowDiagram({ stats }: PrismaFlowDiagramProps) {
  const retrieved = stats.fullTextAssessed
  const notRetrieved = 0

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="p-0">
        {/* Título */}
        <div className="text-center mb-6">
          <h2 className="text-base font-bold tracking-tight text-gray-900 dark:text-gray-100" style={serifFont}>
            PRISMA 2020 Flow Diagram
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 italic" style={serifFont}>
            Study selection process according to Page et al. (2021)
          </p>
        </div>

        <div className="max-w-[800px] mx-auto" style={serifFont}>
          {/* Yellow Header */}
          <div className="bg-amber-200 border-2 border-slate-700 px-4 py-2 text-center font-bold text-sm mb-2">
            Identification of new studies via databases and registers
          </div>

          {/* ═══ IDENTIFICATION PHASE ═══ */}
          <RowWithPhase
            phase="Identification"
            phaseColor="bg-sky-500"
            mainContent={
              <div className="bg-emerald-100 border-2 border-slate-700 px-4 py-3 min-h-[140px] flex flex-col justify-center">
                <p className="text-xs font-semibold mb-1">Records identified from:</p>
                {stats.databases && stats.databases.length > 0 ? (
                  <ul className="text-xs ml-3 space-y-0.5">
                    {stats.databases.map((db) => (
                      <li key={db.name}>
                        {db.name} (n = {db.hits})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs ml-3">Database searches</p>
                )}
                <p className="text-sm font-bold mt-2">Total records (n = {stats.identified})</p>
              </div>
            }
            sideContent={
              <div className="bg-red-50 border-2 border-slate-700 px-3 py-2 min-h-[100px] flex flex-col justify-center">
                <p className="text-xs font-semibold mb-1">Records removed before screening:</p>
                <p className="text-xs ml-2">Duplicate records (n = {stats.duplicates})</p>
                {/* <p className="text-xs ml-2">Records marked as ineligible (n = 0)</p>
                <p className="text-xs ml-2">Other reasons (n = 0)</p> */}
              </div>
            }
          />

          <VerticalArrow />

          {/* ═══ SCREENING PHASE ═══ */}
          <RowWithPhase
            phase="Screening"
            phaseColor="bg-sky-500"
            mainContent={
              <div className="bg-emerald-100 border-2 border-slate-700 px-4 py-3 text-center">
                <p className="text-xs font-semibold">Records screened</p>
                <p className="text-xs">(title and abstract)</p>
                <p className="text-sm font-bold mt-1">(n = {stats.screenedTitleAbstract})</p>
              </div>
            }
            sideContent={
              <div className="bg-red-50 border-2 border-slate-700 px-3 py-2 text-center">
                <p className="text-xs font-semibold">Records excluded</p>
                <p className="text-sm font-bold mt-1">(n = {stats.excludedTitleAbstract})</p>
              </div>
            }
          />

          <VerticalArrow />

          {/* ═══ REPORTS SOUGHT FOR RETRIEVAL ═══ */}
          <Row
            mainContent={
              <div className="bg-emerald-100 border-2 border-slate-700 px-4 py-3 text-center">
                <p className="text-xs font-semibold">Reports sought for retrieval</p>
                <p className="text-sm font-bold mt-1">(n = {retrieved})</p>
              </div>
            }
            sideContent={
              notRetrieved > 0 ? (
                <div className="bg-red-50 border-2 border-slate-700 px-3 py-2 text-center">
                  <p className="text-xs font-semibold">Reports not retrieved</p>
                  <p className="text-sm font-bold mt-1">(n = {notRetrieved})</p>
                </div>
              ) : null
            }
          />

          <VerticalArrow />

          {/* ═══ ELIGIBILITY (Reports assessed) ═══ */}
          <Row
            mainContent={
              <div className="bg-emerald-100 border-2 border-slate-700 px-4 py-3 text-center">
                <p className="text-xs font-semibold">Reports assessed for eligibility</p>
                <p className="text-sm font-bold mt-1">(n = {stats.fullTextAssessed})</p>
              </div>
            }
            sideContent={
              <div className="bg-red-50 border-2 border-slate-700 px-3 py-2 min-h-[80px] flex flex-col justify-start text-left">
                <p className="text-xs font-semibold mb-1">Reports excluded (n = {stats.excludedFullText})</p>
                {stats.exclusionReasons && Object.keys(stats.exclusionReasons).length > 0 ? (
                  <div className="text-xs ml-2 space-y-0.5 mt-1">
                    {Object.entries(stats.exclusionReasons).map(([reason, count]) => (
                      <div key={reason}>
                        {reason} (n = {count})
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            }
          />

          <VerticalArrow />

          {/* ═══ INCLUDED PHASE ═══ */}
          <div className="flex items-stretch">
            {/* Phase label */}
            <div className="flex items-center justify-center bg-sky-500 border-2 border-slate-700 w-[70px] min-w-[70px]">
              <span className="[writing-mode:vertical-lr] rotate-180 text-xs font-bold text-white whitespace-nowrap">
                Included
              </span>
            </div>

            {/* Two boxes side by side */}
            <div className="flex-1 ml-3 flex gap-3">
              <div className="flex-1 bg-emerald-100 border-2 border-slate-700 px-3 py-3 text-center">
                <p className="text-xs font-semibold">New studies included</p>
                <p className="text-xs">in review</p>
                <p className="text-sm font-bold mt-1">(n = {stats.includedFinal})</p>
              </div>
              <div className="flex-1 bg-emerald-100 border-2 border-slate-700 px-3 py-3 text-center">
                <p className="text-xs font-semibold">Reports of new</p>
                <p className="text-xs">included studies</p>
                <p className="text-sm font-bold mt-1">(n = {stats.includedFinal})</p>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-5 text-center italic">
            Diagram based on PRISMA 2020 guidelines (Page et al., 2021).
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Sub-components ─── */

function RowWithPhase({ phase, phaseColor, mainContent, sideContent }: {
  phase: string
  phaseColor: string
  mainContent: React.ReactNode
  sideContent?: React.ReactNode
}) {
  return (
    <div className="flex items-stretch">
      {/* Phase label */}
      <div className={`flex items-center justify-center ${phaseColor} border-2 border-slate-700 w-[70px] min-w-[70px]`}>
        <span className="[writing-mode:vertical-lr] rotate-180 text-xs font-bold text-white whitespace-nowrap">
          {phase}
        </span>
      </div>

      {/* Main box */}
      <div className="flex-1 ml-3">
        <div className="flex items-stretch gap-3">
          <div className="flex-1">
            {mainContent}
          </div>

          {/* Arrow → + Side box */}
          {sideContent && (
            <>
              <div className="flex items-center w-[40px] flex-shrink-0">
                <svg width="100%" height="16" viewBox="0 0 40 16" preserveAspectRatio="none">
                  <line x1="0" y1="8" x2="32" y2="8" stroke="#1e293b" strokeWidth="2" />
                  <polygon points="32,4 32,12 40,8" fill="#1e293b" />
                </svg>
              </div>
              <div className="w-[200px] min-w-[200px]">
                {sideContent}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ mainContent, sideContent }: {
  mainContent: React.ReactNode
  sideContent?: React.ReactNode
}) {
  return (
    <div className="flex items-stretch">
      {/* Empty space for phase label alignment */}
      <div className="w-[70px] min-w-[70px]" />

      {/* Main box */}
      <div className="flex-1 ml-3">
        <div className="flex items-stretch gap-3">
          <div className="flex-1">
            {mainContent}
          </div>

          {/* Arrow → + Side box */}
          {sideContent && (
            <>
              <div className="flex items-center w-[40px] flex-shrink-0">
                <svg width="100%" height="16" viewBox="0 0 40 16" preserveAspectRatio="none">
                  <line x1="0" y1="8" x2="32" y2="8" stroke="#1e293b" strokeWidth="2" />
                  <polygon points="32,4 32,12 40,8" fill="#1e293b" />
                </svg>
              </div>
              <div className="w-[200px] min-w-[200px]">
                {sideContent}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function VerticalArrow() {
  return (
    <div className="flex my-2">
      <div className="w-[70px] min-w-[70px]" />
      <div className="flex-1 ml-3">
        <div className="flex justify-start">
          <svg width="3" height="30" className="overflow-visible ml-[calc(50%-1.5px)]">
            <line x1="1.5" y1="0" x2="1.5" y2="30" stroke="#1e293b" strokeWidth="2" />
            <polygon points="-2,22 5,22 1.5,30" fill="#1e293b" />
          </svg>
        </div>
      </div>
    </div>
  )
}
