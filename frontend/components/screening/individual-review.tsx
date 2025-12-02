"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { 
  Check, 
  X, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  FileText,
  Calendar,
  Users,
  BookOpen,
  Tag,
  Search,
  AlertCircle,
  ChevronDown,
  Database as DatabaseIcon
} from "lucide-react"
import type { Reference } from "@/lib/types"
import { cn } from "@/lib/utils"

interface KeyTerms {
  technology?: string[]
  domain?: string[]
  studyType?: string[]
  themes?: string[]
}

interface IndividualReviewProps {
  references: Reference[]
  keyTerms?: KeyTerms
  onStatusChange: (id: string, status: Reference["status"]) => void
}

export function IndividualReview({ references, keyTerms, onStatusChange }: IndividualReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "included" | "excluded">("all")
  const [selectedTechnology, setSelectedTechnology] = useState<string[]>([])
  const [selectedDomain, setSelectedDomain] = useState<string[]>([])
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const [customTerm, setCustomTerm] = useState("")
  const [customTerms, setCustomTerms] = useState<string[]>([])
  const [exclusionReason, setExclusionReason] = useState("")

  // Filtrar referencias
  const filteredRefs = references.filter(ref => {
    const matchesStatus = statusFilter === "all" || ref.status === statusFilter
    const matchesSearch = searchTerm === "" || 
      ref.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.authors.some(a => a.toLowerCase().includes(searchTerm.toLowerCase()))
    
    // Filtrar por términos de tecnología del protocolo
    const matchesTechnology = selectedTechnology.length === 0 || 
      selectedTechnology.some(tech => 
        ref.title.toLowerCase().includes(tech.toLowerCase()) ||
        ref.abstract?.toLowerCase().includes(tech.toLowerCase()) ||
        ref.keywords?.toLowerCase().includes(tech.toLowerCase())
      )
    
    // Filtrar por términos de dominio del protocolo
    const matchesDomain = selectedDomain.length === 0 || 
      selectedDomain.some(dom => 
        ref.title.toLowerCase().includes(dom.toLowerCase()) ||
        ref.abstract?.toLowerCase().includes(dom.toLowerCase()) ||
        ref.keywords?.toLowerCase().includes(dom.toLowerCase())
      )
    
    // Filtrar por temas del protocolo
    const matchesThemes = selectedThemes.length === 0 || 
      selectedThemes.some(theme => 
        ref.title.toLowerCase().includes(theme.toLowerCase()) ||
        ref.abstract?.toLowerCase().includes(theme.toLowerCase()) ||
        ref.keywords?.toLowerCase().includes(theme.toLowerCase())
      )
    
    // Filtrar por términos personalizados
    const matchesCustom = customTerms.length === 0 || 
      customTerms.some(term => 
        ref.title.toLowerCase().includes(term.toLowerCase()) ||
        ref.abstract?.toLowerCase().includes(term.toLowerCase()) ||
        ref.keywords?.toLowerCase().includes(term.toLowerCase())
      )
    
    return matchesStatus && matchesSearch && matchesTechnology && matchesDomain && 
           matchesThemes && matchesCustom
  })

  const currentRef = filteredRefs[currentIndex]



  const handleNext = () => {
    if (currentIndex < filteredRefs.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setExclusionReason("")
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setExclusionReason("")
    }
  }

  const handleInclude = () => {
    if (currentRef) {
      onStatusChange(currentRef.id, "included")
      if (currentIndex < filteredRefs.length - 1) {
        setTimeout(() => handleNext(), 200)
      }
    }
  }

  const handleExclude = () => {
    if (currentRef) {
      onStatusChange(currentRef.id, "excluded")
      if (currentIndex < filteredRefs.length - 1) {
        setTimeout(() => handleNext(), 200)
      }
    }
  }

  const handleExcludeWithReason = () => {
    if (currentRef && exclusionReason.trim()) {
      // TODO: Guardar la razón de exclusión en el backend
      onStatusChange(currentRef.id, "excluded")
      setExclusionReason("")
      if (currentIndex < filteredRefs.length - 1) {
        setTimeout(() => handleNext(), 200)
      }
    }
  }

  const handleMaybe = () => {
    if (currentRef) {
      onStatusChange(currentRef.id, "maybe")
      if (currentIndex < filteredRefs.length - 1) {
        setTimeout(() => handleNext(), 200)
      }
    }
  }

  const toggleTechnology = (tech: string) => {
    setSelectedTechnology(prev => 
      prev.includes(tech) 
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    )
  }

  const toggleDomain = (domain: string) => {
    setSelectedDomain(prev => 
      prev.includes(domain) 
        ? prev.filter(d => d !== domain)
        : [...prev, domain]
    )
  }

  const toggleTheme = (theme: string) => {
    setSelectedThemes(prev => 
      prev.includes(theme) 
        ? prev.filter(t => t !== theme)
        : [...prev, theme]
    )
  }

  const toggleCustomTerm = (term: string) => {
    setCustomTerms(prev => 
      prev.includes(term) 
        ? prev.filter(t => t !== term)
        : [...prev, term]
    )
  }

  const addCustomTerm = () => {
    if (customTerm.trim() && !customTerms.includes(customTerm.trim())) {
      setCustomTerms(prev => [...prev, customTerm.trim()])
      setCustomTerm("")
    }
  }

  const removeCustomTerm = (term: string) => {
    setCustomTerms(prev => prev.filter(t => t !== term))
  }

  if (!currentRef) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">¡No hay artículos pendientes!</h3>
          <p className="text-muted-foreground">
            Todos los artículos han sido revisados o no hay referencias en el proyecto.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-250px)]">
      {/* Sidebar - Filtros */}
      <div className="w-96 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="h-4 w-4" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ScrollArea className="h-[calc(100vh-340px)]">
              <div className="space-y-4 pr-4">
                {/* Búsqueda */}
                <div>
                  <Input
                    placeholder="Buscar por título, autor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9"
                  />
                </div>

                <Separator />

                {/* Términos Personalizados */}
                <Collapsible defaultOpen>
                  <CollapsibleTrigger className="flex items-center justify-between w-full">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Tag className="h-3 w-3 text-indigo-600" />
                      Términos Personalizados
                    </h4>
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Agregar término..."
                        value={customTerm}
                        onChange={(e) => setCustomTerm(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addCustomTerm()
                          }
                        }}
                        className="h-8 text-xs"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addCustomTerm}
                        disabled={!customTerm.trim()}
                        className="h-8 px-3"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                    {customTerms.length > 0 && (
                      <div className="space-y-1">
                        {customTerms.map((term) => {
                          const count = references.filter(r => 
                            r.title.toLowerCase().includes(term.toLowerCase()) ||
                            r.abstract?.toLowerCase().includes(term.toLowerCase()) ||
                            r.keywords?.toLowerCase().includes(term.toLowerCase())
                          ).length
                          return (
                            <div key={term} className="flex items-center justify-between space-x-2 group">
                              <div className="flex items-center space-x-2 flex-1">
                                <Checkbox
                                  id={`custom-${term}`}
                                  checked={true}
                                  onCheckedChange={() => toggleCustomTerm(term)}
                                />
                                <label
                                  htmlFor={`custom-${term}`}
                                  className="text-xs cursor-pointer flex-1"
                                >
                                  {term}
                                </label>
                              </div>
                              <div className="flex items-center gap-1">
                                <Badge variant="outline" className="text-xs">
                                  {count}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeCustomTerm(term)}
                                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>

                <Separator />

                {/* Términos Clave - Tecnología */}
                {keyTerms?.technology && keyTerms.technology.length > 0 && (
                  <>
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center justify-between w-full">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                          <Tag className="h-3 w-3 text-blue-600" />
                          Tecnología
                        </h4>
                        <ChevronDown className="h-4 w-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 space-y-1">
                        {keyTerms.technology.map((tech) => {
                          const count = references.filter(r => 
                            r.title.toLowerCase().includes(tech.toLowerCase()) ||
                            r.abstract?.toLowerCase().includes(tech.toLowerCase()) ||
                            r.keywords?.toLowerCase().includes(tech.toLowerCase())
                          ).length
                          return (
                            <div key={tech} className="flex items-center justify-between space-x-2">
                              <div className="flex items-center space-x-2 flex-1">
                                <Checkbox
                                  id={`tech-${tech}`}
                                  checked={selectedTechnology.includes(tech)}
                                  onCheckedChange={() => toggleTechnology(tech)}
                                />
                                <label
                                  htmlFor={`tech-${tech}`}
                                  className="text-xs cursor-pointer flex-1"
                                >
                                  {tech}
                                </label>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {count}
                              </Badge>
                            </div>
                          )
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                    <Separator />
                  </>
                )}

                {/* Términos Clave - Dominio */}
                {keyTerms?.domain && keyTerms.domain.length > 0 && (
                  <>
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center justify-between w-full">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                          <BookOpen className="h-3 w-3 text-purple-600" />
                          Dominio
                        </h4>
                        <ChevronDown className="h-4 w-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 space-y-1">
                        {keyTerms.domain.map((domain) => {
                          const count = references.filter(r => 
                            r.title.toLowerCase().includes(domain.toLowerCase()) ||
                            r.abstract?.toLowerCase().includes(domain.toLowerCase()) ||
                            r.keywords?.toLowerCase().includes(domain.toLowerCase())
                          ).length
                          return (
                            <div key={domain} className="flex items-center justify-between space-x-2">
                              <div className="flex items-center space-x-2 flex-1">
                                <Checkbox
                                  id={`domain-${domain}`}
                                  checked={selectedDomain.includes(domain)}
                                  onCheckedChange={() => toggleDomain(domain)}
                                />
                                <label
                                  htmlFor={`domain-${domain}`}
                                  className="text-xs cursor-pointer flex-1"
                                >
                                  {domain}
                                </label>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {count}
                              </Badge>
                            </div>
                          )
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                    <Separator />
                  </>
                )}

                {/* Términos Clave - Temas */}
                {keyTerms?.themes && keyTerms.themes.length > 0 && (
                  <>
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center justify-between w-full">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                          <FileText className="h-3 w-3 text-green-600" />
                          Temas
                        </h4>
                        <ChevronDown className="h-4 w-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 space-y-1">
                        {keyTerms.themes.map((theme) => {
                          const count = references.filter(r => 
                            r.title.toLowerCase().includes(theme.toLowerCase()) ||
                            r.abstract?.toLowerCase().includes(theme.toLowerCase()) ||
                            r.keywords?.toLowerCase().includes(theme.toLowerCase())
                          ).length
                          return (
                            <div key={theme} className="flex items-center justify-between space-x-2">
                              <div className="flex items-center space-x-2 flex-1">
                                <Checkbox
                                  id={`theme-${theme}`}
                                  checked={selectedThemes.includes(theme)}
                                  onCheckedChange={() => toggleTheme(theme)}
                                />
                                <label
                                  htmlFor={`theme-${theme}`}
                                  className="text-xs cursor-pointer flex-1"
                                >
                                  {theme}
                                </label>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {count}
                              </Badge>
                            </div>
                          )
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                    <Separator />
                  </>
                )}

                {/* Métodos de búsqueda */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <DatabaseIcon className="h-3 w-3" />
                      Métodos de búsqueda
                    </h4>
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="space-y-1">
                      {Array.from(new Set(references.map(r => r.source || r.database).filter(Boolean))).map((source) => (
                        <div key={source} className="flex items-center justify-between text-xs">
                          <span className="truncate">{source}</span>
                          <Badge variant="outline" className="ml-2">
                            {references.filter(r => r.source === source || r.database === source).length}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Separator />

                {/* Estado */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Estado</h4>
                  <div className="space-y-1">
                    {[
                      { value: "all", label: "Todos", count: references.length },
                      { value: "pending", label: "Pendientes", count: references.filter(r => r.status === "pending").length },
                      { value: "included", label: "Incluidos", count: references.filter(r => r.status === "included").length },
                      { value: "excluded", label: "Excluidos", count: references.filter(r => r.status === "excluded").length },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setStatusFilter(option.value as any)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors",
                          statusFilter === option.value
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        <span>{option.label}</span>
                        <Badge variant="secondary" className="ml-2">
                          {option.count}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Detalle del artículo */}
      <div className="flex-1 space-y-4">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {currentIndex + 1} de {filteredRefs.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex === filteredRefs.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {currentRef?.url && (
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <a href={currentRef.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver artículo
              </a>
            </Button>
          )}
        </div>

        {/* Article Details */}
        <Card>
          <CardContent className="p-6">
            <ScrollArea className="h-[calc(100vh-400px)]">
              <div className="space-y-6 pr-4">
                {/* Título */}
                <div>
                  <h2 className="text-2xl font-bold mb-2">{currentRef.title}</h2>
                  {currentRef.status && (() => {
                    const statusConfig = {
                      included: { variant: "default" as const, label: "Incluido" },
                      excluded: { variant: "destructive" as const, label: "Excluido" },
                      maybe: { variant: "secondary" as const, label: "Tal vez" },
                      pending: { variant: "outline" as const, label: "Pendiente" },
                      duplicate: { variant: "outline" as const, label: "Duplicado" }
                    }
                    const config = statusConfig[currentRef.status] || statusConfig.pending
                    return (
                      <Badge variant={config.variant} className="mb-4">
                        {config.label}
                      </Badge>
                    )
                  })()}
                </div>

                <Separator />

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Autores</p>
                      <p className="text-muted-foreground">
                        {Array.isArray(currentRef.authors) 
                          ? currentRef.authors.join(", ") 
                          : currentRef.authors}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Año</p>
                      <p className="text-muted-foreground">{currentRef.year || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <BookOpen className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Fuente</p>
                      <p className="text-muted-foreground">{currentRef.source || currentRef.database || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">DOI</p>
                      {currentRef.doi ? (
                        <a
                          href={`https://doi.org/${currentRef.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          {currentRef.doi}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <p className="text-muted-foreground">N/A</p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Abstract */}
                {currentRef.abstract && (
                  <div>
                    <h3 className="font-semibold mb-2">Abstract</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {currentRef.abstract}
                    </p>
                  </div>
                )}

                {/* Keywords */}
                {currentRef.keywords && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {currentRef.keywords.split(/[,;]/).map((keyword) => (
                        <Badge key={keyword.trim()} variant="outline">
                          {keyword.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* URL */}
                {currentRef.url && (
                  <div>
                    <h3 className="font-semibold mb-2">Enlace</h3>
                    <a
                      href={currentRef.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-2"
                    >
                      Ver artículo completo
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Action Buttons - Bottom */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Main Actions */}
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleInclude}
                  className="flex-1 text-green-700 hover:bg-green-50 hover:text-green-800 border-green-300 hover:border-green-400"
                >
                  <Check className="h-5 w-5 mr-2" />
                  Incluir
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleMaybe}
                  className="flex-1 text-orange-600 hover:bg-orange-50 hover:text-orange-700 border-orange-300 hover:border-orange-400"
                >
                  <HelpCircle className="h-5 w-5 mr-2" />
                  Quizás
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleExclude}
                  className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-300 hover:border-red-400"
                >
                  <X className="h-5 w-5 mr-2" />
                  Excluir
                </Button>
              </div>

              {/* Secondary Actions */}
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    placeholder="Razón de exclusión..."
                    value={exclusionReason}
                    onChange={(e) => setExclusionReason(e.target.value)}
                    className="h-9"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExcludeWithReason}
                    disabled={!exclusionReason.trim()}
                    className="whitespace-nowrap"
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Excluir con razón
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap"
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Etiqueta
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
