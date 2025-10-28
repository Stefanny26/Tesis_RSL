/**
 * Configuración de la navegación principal
 */

import { 
  LayoutDashboard, 
  FolderKanban, 
  FileText, 
  Filter, 
  CheckSquare, 
  FileEdit, 
  Download,
  Settings,
  LucideIcon 
} from 'lucide-react';
import { ROUTES } from '../constants/routes';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  badge?: string | number;
  children?: NavItem[];
  disabled?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const mainNavigation: NavSection[] = [
  {
    title: 'Principal',
    items: [
      {
        title: 'Dashboard',
        href: ROUTES.DASHBOARD,
        icon: LayoutDashboard,
        description: 'Vista general del sistema',
      },
      {
        title: 'Proyectos',
        href: ROUTES.PROJECTS,
        icon: FolderKanban,
        description: 'Gestión de proyectos RSL',
      },
    ],
  },
];

export const projectNavigation = (projectId: string): NavSection[] => [
  {
    title: 'Proyecto',
    items: [
      {
        title: 'Resumen',
        href: ROUTES.PROJECT_DETAIL(projectId),
        icon: LayoutDashboard,
        description: 'Vista general del proyecto',
      },
      {
        title: 'Protocolo',
        href: ROUTES.PROTOCOL(projectId),
        icon: FileText,
        description: 'Definir criterios y preguntas',
      },
    ],
  },
  {
    title: 'Referencias',
    items: [
      {
        title: 'Gestión',
        href: ROUTES.REFERENCES(projectId),
        icon: FileEdit,
        description: 'Ver y gestionar referencias',
      },
      {
        title: 'Importar',
        href: ROUTES.REFERENCES_IMPORT(projectId),
        icon: Download,
        description: 'Importar referencias',
      },
    ],
  },
  {
    title: 'Screening',
    items: [
      {
        title: 'Vista General',
        href: ROUTES.SCREENING(projectId),
        icon: Filter,
        description: 'Progreso del screening',
      },
      {
        title: 'Por Título',
        href: ROUTES.SCREENING_TITLE(projectId),
        icon: CheckSquare,
        description: 'Screening de títulos',
      },
      {
        title: 'Por Abstract',
        href: ROUTES.SCREENING_ABSTRACT(projectId),
        icon: CheckSquare,
        description: 'Screening de resúmenes',
      },
      {
        title: 'Texto Completo',
        href: ROUTES.SCREENING_FULLTEXT(projectId),
        icon: CheckSquare,
        description: 'Screening de texto completo',
      },
    ],
  },
  {
    title: 'Resultados',
    items: [
      {
        title: 'PRISMA',
        href: ROUTES.PRISMA(projectId),
        icon: CheckSquare,
        description: 'Diagrama de flujo PRISMA',
      },
      {
        title: 'Artículo',
        href: ROUTES.ARTICLES(projectId),
        icon: FileEdit,
        description: 'Generar artículo',
      },
      {
        title: 'Exportar',
        href: ROUTES.EXPORT(projectId),
        icon: Download,
        description: 'Exportar datos',
      },
    ],
  },
];

export const settingsNavigation: NavSection[] = [
  {
    title: 'Configuración',
    items: [
      {
        title: 'Perfil',
        href: ROUTES.SETTINGS_PROFILE,
        icon: Settings,
        description: 'Configuración de perfil',
      },
      {
        title: 'Seguridad',
        href: ROUTES.SETTINGS_SECURITY,
        icon: Settings,
        description: 'Seguridad y contraseña',
      },
    ],
  },
];
