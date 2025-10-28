# Historias de Usuario
## Sistema Web para Gestión de Revisiones Sistemáticas con IA

---

# ÉPICA 1: Gestión de Usuarios y Seguridad

## HU-001: Registro de Usuario

**Como** investigador nuevo  
**Quiero** registrarme en el sistema con mi correo institucional  
**Para** poder crear y gestionar mis proyectos de revisión sistemática

**Descripción**: El sistema debe permitir a nuevos usuarios registrarse proporcionando nombre completo, correo electrónico, contraseña y seleccionando su rol (Investigador/Revisor). El sistema validará el formato del correo y la fortaleza de la contraseña.

**Fecha Inicio**: Sprint 1 - Día 1  
**Fecha Fin**: Sprint 1 - Día 3  
**Responsable**: Desarrollador Full-Stack  
**Prioridad**: Alta  
**Estimación**: 5 puntos

**Criterios de Aceptación**:
1. El formulario de registro solicita: nombre completo, correo, contraseña, confirmación de contraseña y rol
2. El sistema valida que el correo tenga formato válido
3. El sistema valida que la contraseña tenga mínimo 8 caracteres
4. El sistema verifica que las contraseñas coincidan
5. El sistema muestra mensajes de error claros si la validación falla
6. Al registrarse exitosamente, el usuario es redirigido al dashboard
7. El sistema envía un correo de confirmación (opcional para MVP)

---

## HU-002: Inicio de Sesión

**Como** usuario registrado  
**Quiero** iniciar sesión con mi correo y contraseña  
**Para** acceder a mis proyectos y continuar mi trabajo

**Descripción**: El sistema debe autenticar usuarios mediante correo y contraseña, generar un token de sesión seguro y redirigir al dashboard según el rol del usuario.

**Fecha Inicio**: Sprint 1 - Día 3  
**Fecha Fin**: Sprint 1 - Día 5  
**Responsable**: Desarrollador Full-Stack  
**Prioridad**: Alta  
**Estimación**: 5 puntos

**Criterios de Aceptación**:
1. El formulario de login solicita correo y contraseña
2. El sistema valida las credenciales contra la base de datos
3. Si las credenciales son correctas, se genera un token JWT
4. El usuario es redirigido al dashboard apropiado según su rol
5. Si las credenciales son incorrectas, se muestra mensaje de error
6. El sistema implementa protección contra fuerza bruta (rate limiting)
7. La sesión persiste al recargar la página

---

## HU-003: Gestión de Perfil

**Como** usuario autenticado  
**Quiero** ver y editar mi información de perfil  
**Para** mantener mis datos actualizados

**Descripción**: El sistema debe permitir a los usuarios ver su perfil actual y editar información como nombre, correo y contraseña.

**Fecha Inicio**: Sprint 1 - Día 6  
**Fecha Fin**: Sprint 1 - Día 8  
**Responsable**: Desarrollador Full-Stack  
**Prioridad**: Media  
**Estimación**: 3 puntos

**Criterios de Aceptación**:
1. El usuario puede acceder a su perfil desde el menú de navegación
2. Se muestra la información actual del usuario (nombre, correo, rol, fecha de registro)
3. El usuario puede editar su nombre y correo
4. El usuario puede cambiar su contraseña proporcionando la actual y la nueva
5. Los cambios se guardan correctamente en la base de datos
6. Se muestra confirmación visual al guardar cambios
7. Se validan los datos antes de guardar

---

## HU-004: Control de Acceso por Roles

**Como** administrador del sistema  
**Quiero** que cada rol tenga permisos específicos  
**Para** proteger la información y controlar las acciones permitidas

**Descripción**: El sistema debe implementar control de acceso basado en roles (RBAC) donde Administradores tienen acceso completo, Investigadores pueden gestionar sus proyectos, y Revisores solo pueden revisar referencias asignadas.

**Fecha Inicio**: Sprint 1 - Día 8  
**Fecha Fin**: Sprint 1 - Día 10  
**Responsable**: Desarrollador Backend  
**Prioridad**: Alta  
**Estimación**: 8 puntos

**Criterios de Aceptación**:
1. Los Administradores pueden ver y gestionar todos los proyectos
2. Los Investigadores solo ven proyectos donde son propietarios o miembros
3. Los Revisores solo pueden acceder a funciones de revisión de referencias
4. El sistema bloquea acciones no permitidas según el rol
5. Se implementa Row Level Security (RLS) en Supabase
6. Las rutas protegidas verifican permisos antes de renderizar
7. Se muestran mensajes apropiados si el usuario no tiene permisos

---

# ÉPICA 2: Gestión de Proyectos de Revisión Sistemática

## HU-005: Crear Proyecto RSL

**Como** investigador  
**Quiero** crear un nuevo proyecto de revisión sistemática  
**Para** organizar mi investigación y comenzar el proceso de revisión

**Descripción**: El sistema debe permitir crear proyectos RSL con título, descripción, área de investigación y fechas estimadas.

**Fecha Inicio**: Sprint 1 - Día 11  
**Fecha Fin**: Sprint 1 - Día 13  
**Responsable**: Desarrollador Full-Stack  
**Prioridad**: Alta  
**Estimación**: 5 puntos

**Criterios de Aceptación**:
1. El usuario puede acceder a un formulario de creación de proyecto
2. El formulario solicita: título, descripción, área de investigación, fecha inicio, fecha fin estimada
3. El sistema valida que todos los campos requeridos estén completos
4. Al crear el proyecto, el usuario es asignado como propietario automáticamente
5. El proyecto se crea con estado "Borrador"
6. El usuario es redirigido al detalle del proyecto creado
7. El proyecto aparece en el dashboard del usuario

---

## HU-006: Visualizar Dashboard de Proyectos

**Como** investigador  
**Quiero** ver un dashboard con todos mis proyectos y estadísticas  
**Para** tener una vista general de mi trabajo de investigación

**Descripción**: El sistema debe mostrar un dashboard con tarjetas de proyectos, estadísticas generales y accesos rápidos a funciones principales.

**Fecha Inicio**: Sprint 1 - Día 13  
**Fecha Fin**: Sprint 2 - Día 2  
**Responsable**: Desarrollador Frontend  
**Prioridad**: Alta  
**Estimación**: 5 puntos

**Criterios de Aceptación**:
1. El dashboard muestra tarjetas de estadísticas: total proyectos, activos, completados, referencias totales
2. Se muestran todos los proyectos del usuario en tarjetas
3. Cada tarjeta muestra: título, estado, progreso de cribado, cumplimiento PRISMA
4. El usuario puede filtrar proyectos por estado (todos, borradores, activos, completados)
5. El usuario puede buscar proyectos por título
6. Hay un botón prominente para crear nuevo proyecto
7. Las estadísticas se actualizan en tiempo real

---

## HU-007: Editar Proyecto

**Como** investigador propietario de un proyecto  
**Quiero** editar la información básica de mi proyecto  
**Para** mantener la información actualizada

**Descripción**: El sistema debe permitir editar título, descripción, área y fechas de un proyecto existente.

**Fecha Inicio**: Sprint 2 - Día 2  
**Fecha Fin**: Sprint 2 - Día 3  
**Responsable**: Desarrollador Full-Stack  
**Prioridad**: Media  
**Estimación**: 3 puntos

**Criterios de Aceptación**:
1. El propietario puede acceder a un formulario de edición desde el detalle del proyecto
2. El formulario muestra los valores actuales del proyecto
3. El usuario puede modificar título, descripción, área y fechas
4. Los cambios se guardan correctamente en la base de datos
5. Se muestra confirmación visual al guardar
6. Solo el propietario y administradores pueden editar
7. Se registra la edición en el log de actividad

---

# ÉPICA 3: Definición de Protocolo de Investigación

## HU-008: Definir Matriz Es/No Es

**Como** investigador  
**Quiero** crear una matriz Es/No Es para mi proyecto  
**Para** delimitar claramente el alcance de mi revisión sistemática

**Descripción**: El sistema debe proporcionar una interfaz para definir qué está incluido y excluido del alcance de la revisión.

**Fecha Inicio**: Sprint 2 - Día 4  
**Fecha Fin**: Sprint 2 - Día 6  
**Responsable**: Desarrollador Frontend  
**Prioridad**: Alta  
**Estimación**: 5 puntos

**Criterios de Aceptación**:
1. El asistente muestra el paso 1: Matriz Es/No Es
2. Hay dos columnas: "Es (Incluido)" y "No Es (Excluido)"
3. El usuario puede agregar múltiples ítems a cada columna
4. El usuario puede editar y eliminar ítems
5. Se valida que haya al menos 2 ítems en cada columna
6. Los datos se guardan automáticamente
7. El usuario puede avanzar al siguiente paso

---

## HU-009: Definir Framework PICO

**Como** investigador  
**Quiero** estructurar mi pregunta de investigación usando el framework PICO  
**Para** tener una base sólida para mi búsqueda bibliográfica

**Descripción**: El sistema debe proporcionar campos estructurados para definir Población, Intervención, Comparación y Outcome (Resultado).

**Fecha Inicio**: Sprint 2 - Día 6  
**Fecha Fin**: Sprint 2 - Día 8  
**Responsable**: Desarrollador Frontend  
**Prioridad**: Alta  
**Estimación**: 5 puntos

**Criterios de Aceptación**:
1. El asistente muestra el paso 2: Framework PICO
2. Hay campos separados para: Población, Intervención, Comparación, Outcome
3. Cada campo tiene descripción de ayuda y ejemplos
4. Se valida que todos los campos estén completos
5. Los datos se guardan automáticamente
6. El sistema genera una pregunta de investigación preliminar basada en PICO
7. El usuario puede avanzar al siguiente paso

---

## HU-010: Definir Preguntas de Investigación

**Como** investigador  
**Quiero** formular mis preguntas de investigación principales y secundarias  
**Para** guiar mi proceso de revisión sistemática

**Descripción**: El sistema debe permitir agregar múltiples preguntas de investigación clasificadas como principales o secundarias.

**Fecha Inicio**: Sprint 2 - Día 8  
**Fecha Fin**: Sprint 2 - Día 9  
**Responsable**: Desarrollador Frontend  
**Prioridad**: Alta  
**Estimación**: 3 puntos

**Criterios de Aceptación**:
1. El asistente muestra el paso 3: Preguntas de Investigación
2. El usuario puede agregar múltiples preguntas
3. Cada pregunta se clasifica como "Principal" o "Secundaria"
4. El usuario puede editar y eliminar preguntas
5. Se valida que haya al menos 1 pregunta principal
6. Las preguntas se guardan automáticamente
7. El usuario puede avanzar al siguiente paso

---

## HU-011: Definir Criterios de Inclusión/Exclusión

**Como** investigador  
**Quiero** establecer criterios claros de inclusión y exclusión  
**Para** filtrar sistemáticamente las referencias bibliográficas

**Descripción**: El sistema debe permitir definir múltiples criterios de inclusión y exclusión organizados por categorías.

**Fecha Inicio**: Sprint 2 - Día 9  
**Fecha Fin**: Sprint 2 - Día 11  
**Responsable**: Desarrollador Frontend  
**Prioridad**: Alta  
**Estimación**: 5 puntos

**Criterios de Aceptación**:
1. El asistente muestra el paso 4: Criterios de Inclusión/Exclusión
2. Hay tabs separados para criterios de inclusión y exclusión
3. El usuario puede agregar múltiples criterios en cada categoría
4. Cada criterio puede tener una descripción detallada
5. El usuario puede editar y eliminar criterios
6. Se valida que haya al menos 2 criterios de cada tipo
7. Los criterios se guardan automáticamente

---

## HU-012: Definir Estrategia de Búsqueda

**Como** investigador  
**Quiero** documentar mi estrategia de búsqueda bibliográfica  
**Para** asegurar reproducibilidad y transparencia en mi revisión

**Descripción**: El sistema debe permitir seleccionar bases de datos y definir cadenas de búsqueda con operadores booleanos.

**Fecha Inicio**: Sprint 2 - Día 11  
**Fecha Fin**: Sprint 2 - Día 13  
**Responsable**: Desarrollador Frontend  
**Prioridad**: Alta  
**Estimación**: 3 puntos

**Criterios de Aceptación**:
1. El asistente muestra el paso 5: Estrategia de Búsqueda
2. El usuario puede seleccionar bases de datos de una lista predefinida
3. El usuario puede agregar bases de datos personalizadas
4. Hay un editor para la cadena de búsqueda con resaltado de sintaxis
5. Se proporcionan ejemplos de operadores booleanos (AND, OR, NOT)
6. La estrategia se guarda automáticamente
7. El usuario puede avanzar al paso de revisión

---

## HU-013: Revisar y Finalizar Protocolo

**Como** investigador  
**Quiero** revisar todo mi protocolo antes de finalizarlo  
**Para** asegurarme de que está completo y correcto

**Descripción**: El sistema debe mostrar un resumen completo del protocolo y permitir finalizarlo o volver a editar secciones.

**Fecha Inicio**: Sprint 2 - Día 13  
**Fecha Fin**: Sprint 3 - Día 1  
**Responsable**: Desarrollador Frontend  
**Prioridad**: Media  
**Estimación**: 3 puntos (continúa...)

**Criterios de Aceptación**:
1. El asistente muestra el paso 6: Revisión
2. Se muestra un resumen de todos los pasos anteriores
3. El usuario puede hacer clic en cualquier sección para editarla
4. Hay un botón para finalizar el protocolo
5. Al finalizar, el proyecto cambia a estado "En Progreso"
6. Se muestra confirmación de que el protocolo está completo
7. El usuario es redirigido al detalle del proyecto

---

# ÉPICA 4: Cribado Inteligente de Referencias con IA

## HU-014: Importar Referencias Bibliográficas

**Como** investigador  
**Quiero** importar referencias desde archivos BibTeX o RIS  
**Para** comenzar el proceso de cribado

**Descripción**: El sistema debe permitir cargar archivos con referencias bibliográficas y parsearlas automáticamente.

**Fecha Inicio**: Sprint 3 - Día 2  
**Fecha Fin**: Sprint 3 - Día 5  
**Responsable**: Desarrollador Backend  
**Prioridad**: Alta  
**Estimación**: 8 puntos

**Criterios de Aceptación**:
1. El usuario puede cargar archivos .bib, .ris o .txt
2. El sistema parsea automáticamente el archivo
3. Se extraen: título, autores, año, resumen, DOI, fuente
4. Se muestran las referencias importadas en una tabla
5. El usuario puede revisar y confirmar la importación
6. Las referencias se guardan en la base de datos
7. Se manejan errores de formato con mensajes claros

---

## HU-015: Generar Embeddings de Referencias

**Como** sistema  
**Quiero** generar embeddings vectoriales de cada referencia  
**Para** poder clasificarlas automáticamente por relevancia

**Descripción**: El sistema debe generar embeddings de 384 dimensiones usando MiniLM para cada referencia importada.

**Fecha Inicio**: Sprint 3 - Día 5  
**Fecha Fin**: Sprint 3 - Día 8  
**Responsable**: Desarrollador Backend/IA  
**Prioridad**: Alta  
**Estimación**: 13 puntos

**Criterios de Aceptación**:
1. El sistema genera embeddings al importar referencias
2. Se usa el modelo MiniLM (sentence-transformers)
3. Los embeddings se calculan del título + resumen
4. Los vectores se almacenan en la columna embedding de la tabla references
5. El proceso muestra barra de progreso
6. Se manejan referencias sin resumen
7. El proceso es asíncrono y no bloquea la UI

---

## HU-016: Clasificación Automática con IA

**Como** investigador  
**Quiero** que el sistema clasifique automáticamente las referencias  
**Para** reducir el tiempo de cribado manual

**Descripción**: El sistema debe calcular similitud entre referencias y el protocolo PICO, clasificándolas como incluidas/excluidas según un umbral.

**Fecha Inicio**: Sprint 3 - Día 8  
**Fecha Fin**: Sprint 4 - Día 3  
**Responsable**: Desarrollador Backend/IA  
**Prioridad**: Alta  
**Estimación**: 13 puntos

**Criterios de Aceptación**:
1. El sistema calcula similitud coseno entre embeddings de referencias y PICO
2. Se asigna un score de relevancia (0-100) a cada referencia
3. Referencias con score > umbral se marcan como "Incluida"
4. Referencias con score < umbral se marcan como "Excluida"
5. El umbral es ajustable por el usuario (default: 70)
6. Se muestra el score en cada referencia
7. El proceso se puede ejecutar en lote

---

## HU-017: Revisión Manual de Referencias

**Como** investigador  
**Quiero** revisar manualmente cada referencia clasificada  
**Para** validar y corregir la clasificación automática

**Descripción**: El sistema debe proporcionar una interfaz para revisar referencias individualmente con toda su información.

**Fecha Inicio**: Sprint 4 - Día 3  
**Fecha Fin**: Sprint 4 - Día 6  
**Responsable**: Desarrollador Frontend  
**Prioridad**: Alta  
**Estimación**: 8 puntos

**Criterios de Aceptación**:
1. El usuario puede hacer clic en una referencia para ver detalles completos
2. Se muestra: título, autores, año, resumen, DOI, fuente, score de relevancia
3. El usuario puede cambiar el estado a: Incluida, Excluida, Pendiente
4. El usuario puede agregar notas/comentarios
5. Hay botones para navegar a la siguiente/anterior referencia
6. Los cambios se guardan automáticamente
7. Se actualiza el contador de progreso

---

## HU-018: Acciones Masivas en Referencias

**Como** investigador  
**Quiero** realizar acciones en múltiples referencias simultáneamente  
**Para** agilizar el proceso de cribado

**Descripción**: El sistema debe permitir seleccionar múltiples referencias y aplicar acciones en lote.

**Fecha Inicio**: Sprint 4 - Día 6  
**Fecha Fin**: Sprint 4 - Día 8  
**Responsable**: Desarrollador Frontend  
**Prioridad**: Media  
**Estimación**: 5 puntos

**Criterios de Aceptación**:
1. El usuario puede seleccionar múltiples referencias con checkboxes
2. Aparece una barra de acciones al seleccionar referencias
3. Las acciones disponibles son: Incluir, Excluir, Marcar como Pendiente
4. Se muestra el número de referencias seleccionadas
5. Las acciones se aplican a todas las referencias seleccionadas
6. Se muestra confirmación antes de aplicar acciones masivas
7. Se actualiza la tabla después de aplicar acciones

---

## HU-019: Filtrar y Buscar Referencias

**Como** investigador  
**Quiero** filtrar y buscar referencias por diferentes criterios  
**Para** encontrar rápidamente referencias específicas

**Descripción**: El sistema debe proporcionar filtros y búsqueda de texto completo en referencias.

**Fecha Inicio**: Sprint 4 - Día 8  
**Fecha Fin**: Sprint 4 - Día 10  
**Responsable**: Desarrollador Frontend  
**Prioridad**: Media  
**Estimación**: 5 puntos

**Criterios de Aceptación**:
1. Hay filtros por estado: Todas, Incluidas, Excluidas, Pendientes
2. Hay un campo de búsqueda de texto completo
3. La búsqueda funciona en título, autores y resumen
4. Los filtros se pueden combinar
5. La tabla se actualiza en tiempo real al filtrar
6. Se muestra el número de resultados
7. Los filtros persisten al navegar

---

# ÉPICA 5: Validación y Cumplimiento PRISMA

## HU-020: Visualizar Checklist PRISMA

**Como** investigador  
**Quiero** ver el checklist completo PRISMA 2020  
**Para** conocer todos los requisitos de mi revisión sistemática

**Descripción**: El sistema debe mostrar los 27 ítems PRISMA organizados por secciones con descripciones claras.

**Fecha Inicio**: Sprint 5 - Día 1  
**Fecha Fin**: Sprint 5 - Día 3  
**Responsable**: Desarrollador Frontend  
**Prioridad**: Alta  
**Estimación**: 5 puntos

**Criterios de Aceptación**:
1. Se muestran los 27 ítems PRISMA 2020
2. Los ítems están organizados por secciones: Título, Resumen, Introducción, Métodos, Resultados, Discusión, Otros
3. Cada ítem muestra: número, título, descripción, ubicación recomendada
4. Los ítems son expandibles para ver más detalles
5. Se muestra el progreso general (ítems completados/total)
6. Hay filtros por sección
7. La interfaz es clara y fácil de navegar

---

## HU-021: Marcar Ítems PRISMA como Completados

**Como** investigador  
**Quiero** marcar ítems PRISMA como completados  
**Para** hacer seguimiento de mi progreso

**Descripción**: El sistema debe permitir marcar ítems como completados y agregar contenido específico para cada uno.

**Fecha Inicio**: Sprint 5 - Día 3  
**Fecha Fin**: Sprint 5 - Día 5  
**Responsable**: Desarrollador Full-Stack  
**Prioridad**: Alta  
**Estimación**: 5 puntos

**Criterios de Aceptación**:
1. Cada ítem tiene un checkbox para marcar como completado
2. El usuario puede agregar contenido/notas para cada ítem
3. El contenido se guarda automáticamente
4. El progreso se actualiza en tiempo real
5. Los ítems completados se destacan visualmente
6. Se calcula el porcentaje de cumplimiento PRISMA
7. El estado persiste al recargar la página

---

## HU-022: Obtener Sugerencias de IA para PRISMA

**Como** investigador  
**Quiero** recibir sugerencias de IA para cada ítem PRISMA  
**Para** mejorar la calidad de mi revisión sistemática

**Descripción**: El sistema debe generar sugerencias contextuales usando IA para ayudar a completar cada ítem PRISMA.

**Fecha Inicio**: Sprint 5 - Día 5  
**Fecha Fin**: Sprint 5 - Día 8  
**Responsable**: Desarrollador Backend/IA  
**Prioridad**: Alta  
**Estimación**: 8 puntos

**Criterios de Aceptación**:
1. Cada ítem tiene un botón "Obtener Sugerencia de IA"
2. La IA genera sugerencias basadas en el protocolo del proyecto
3. Las sugerencias son específicas y relevantes al ítem
4. Se muestra un indicador de carga mientras se genera
5. El usuario puede regenerar sugerencias
6. Las sugerencias se pueden copiar al contenido del ítem
7. Se usa la API de Gemini para generación

---

## HU-023: Validación Automática con IA

**Como** investigador  
**Quiero** que la IA valide automáticamente mi cumplimiento PRISMA  
**Para** identificar áreas de mejora

**Descripción**: El sistema debe analizar el contenido del proyecto y validar automáticamente el cumplimiento de cada ítem PRISMA.

**Fecha Inicio**: Sprint 5 - Día 8  
**Fecha Fin**: Sprint 5 - Día 10  
**Responsable**: Desarrollador Backend/IA  
**Prioridad**: Media  
**Estimación**: 8 puntos

**Criterios de Aceptación**:
1. Hay un botón "Validar con IA" en el módulo PRISMA
2. La IA analiza el protocolo, referencias y artículo del proyecto
3. Se genera un reporte de cumplimiento para cada ítem
4. Se identifican ítems que necesitan atención
5. Se proporcionan recomendaciones específicas de mejora
6. El reporte se puede exportar
7. La validación se puede ejecutar múltiples veces

---

# ÉPICA 6: Generación Automatizada de Artículos con IA

## HU-024: Crear Estructura de Artículo

**Como** investigador  
**Quiero** tener una estructura predefinida para mi artículo  
**Para** organizar mi escritura siguiendo estándares académicos

**Descripción**: El sistema debe proporcionar un editor estructurado con secciones estándar de artículos científicos.

**Fecha Inicio**: Sprint 6 - Día 1  
**Fecha Fin**: Sprint 6 - Día 3  
**Responsable**: Desarrollador Frontend  
**Prioridad**: Alta  
**Estimación**: 5 puntos

**Criterios de Aceptación**:
1. El editor tiene tabs para: Resumen, Introducción, Métodos, Resultados, Discusión, Conclusiones, Referencias
2. Cada sección tiene un editor de texto enriquecido
3. El contenido se guarda automáticamente
4. Se muestra el conteo de palabras por sección
5. El usuario puede navegar entre secciones fácilmente
6. Se calcula el porcentaje de completitud del artículo
7. La interfaz es limpia y enfocada en la escritura

---

## HU-025: Generar Borrador con IA

**Como** investigador  
**Quiero** que la IA genere un borrador de mi artículo  
**Para** acelerar el proceso de escritura

**Descripción**: El sistema debe usar IA para generar borradores completos o de secciones específicas basándose en el protocolo y resultados.

**Fecha Inicio**: Sprint 6 - Día 3  
**Fecha Fin**: Sprint 6 - Día 7  
**Responsable**: Desarrollador Backend/IA  
**Prioridad**: Alta  
**Estimación**: 13 puntos

**Criterios de Aceptación**:
1. Hay un panel de IA con opciones de generación
2. El usuario puede generar secciones individuales o el artículo completo
3. La IA usa el protocolo PICO, criterios y resultados del cribado
4. Se puede seleccionar el tono: Formal, Técnico, Divulgativo
5. Se muestra progreso durante la generación
6. El contenido generado se inserta en el editor
7. El usuario puede regenerar si no está satisfecho

---

## HU-026: Control de Versiones de Artículo

**Como** investigador  
**Quiero** mantener un historial de versiones de mi artículo  
**Para** poder recuperar versiones anteriores si es necesario

**Descripción**: El sistema debe guardar automáticamente versiones del artículo y permitir restaurarlas.

**Fecha Inicio**: Sprint 6 - Día 7  
**Fecha Fin**: Sprint 6 - Día 9  
**Responsable**: Desarrollador Full-Stack  
**Prioridad**: Media  
**Estimación**: 5 puntos

**Criterios de Aceptación**:
1. El sistema guarda una nueva versión al hacer cambios significativos
2. El usuario puede guardar versiones manualmente con descripción
3. Se muestra un historial de versiones con fecha y autor
4. El usuario puede ver el contenido de versiones anteriores
5. El usuario puede restaurar una versión anterior
6. Se muestra confirmación antes de restaurar
7. Se registra la restauración en el log de actividad

---

## HU-027: Editar y Refinar Contenido

**Como** investigador  
**Quiero** editar manualmente el contenido generado por IA  
**Para** ajustarlo a mis necesidades específicas

**Descripción**: El sistema debe proporcionar herramientas de edición completas para refinar el contenido.

**Fecha Inicio**: Sprint 6 - Día 9  
**Fecha Fin**: Sprint 6 - Día 10  
**Responsable**: Desarrollador Frontend  
**Prioridad**: Media  
**Estimación**: 3 puntos

**Criterios de Aceptación**:
1. El editor soporta formato de texto: negrita, cursiva, listas
2. Se pueden agregar citas y referencias
3. Hay deshacer/rehacer
4. Se puede copiar/pegar desde otros documentos
5. El formato se preserva al guardar
6. Hay atajos de teclado para acciones comunes
7. El editor es responsive

---

# ÉPICA 7: Exportación y Generación de Reportes

## HU-028: Exportar Artículo en PDF

**Como** investigador  
**Quiero** exportar mi artículo en formato PDF  
**Para** compartirlo o enviarlo a revistas

**Descripción**: El sistema debe generar un PDF profesional del artículo con formato académico.

**Fecha Inicio**: Sprint 7 - Día 1  
**Fecha Fin**: Sprint 7 - Día 3  
**Responsable**: Desarrollador Backend  
**Prioridad**: Alta  
**Estimación**: 8 puntos

**Criterios de Aceptación**:
1. El usuario puede exportar el artículo a PDF
2. El PDF incluye todas las secciones seleccionadas
3. El formato es profesional y legible
4. Se incluyen metadatos (título, autores, fecha)
5. Las referencias están formateadas correctamente
6. El PDF se descarga automáticamente
7. Se puede seleccionar qué secciones incluir

---

## HU-029: Exportar Referencias Bibliográficas

**Como** investigador  
**Quiero** exportar mis referencias en formatos estándar  
**Para** importarlas en gestores bibliográficos

**Descripción**: El sistema debe exportar referencias en BibTeX, RIS, EndNote y otros formatos.

**Fecha Inicio**: Sprint 7 - Día 3  
**Fecha Fin**: Sprint 7 - Día 5  
**Responsable**: Desarrollador Backend  
**Prioridad**: Alta  
**Estimación**: 5 puntos

**Criterios de Aceptación**:
1. El usuario puede exportar referencias en: BibTeX, RIS, EndNote, CSV, Excel
2. Se pueden exportar todas las referencias o solo las incluidas
3. El formato de exportación es válido y compatible
4. Se incluyen todos los campos disponibles
5. El archivo se descarga automáticamente
6. Se muestra confirmación de exportación exitosa
7. Se manejan caracteres especiales correctamente

---

## HU-030: Generar Diagrama de Flujo PRISMA

**Como** investigador  
**Quiero** generar automáticamente el diagrama de flujo PRISMA  
**Para** visualizar el proceso de selección de estudios

**Descripción**: El sistema debe crear un diagrama de flujo PRISMA basado en las estadísticas del cribado.

**Fecha Inicio**: Sprint 7 - Día 5  
**Fecha Fin**: Sprint 7 - Día 7  
**Responsable**: Desarrollador Frontend  
**Prioridad**: Alta  
**Estimación**: 8 puntos

**Criterios de Aceptación**:
1. El sistema genera un diagrama de flujo PRISMA automáticamente
2. El diagrama muestra: identificación, cribado, elegibilidad, inclusión
3. Los números se calculan automáticamente de las referencias
4. El diagrama es interactivo y se puede hacer zoom
5. Se puede exportar como imagen PNG o SVG
6. El diagrama sigue el formato oficial PRISMA 2020
7. Se actualiza en tiempo real al cambiar referencias

---

## HU-031: Generar Reporte Ejecutivo

**Como** investigador  
**Quiero** generar un reporte ejecutivo de mi proyecto  
**Para** presentar un resumen completo a mi equipo o asesores

**Descripción**: El sistema debe crear un reporte con estadísticas, resumen del protocolo y progreso general.

**Fecha Inicio**: Sprint 7 - Día 7  
**Fecha Fin**: Sprint 7 - Día 9  
**Responsable**: Desarrollador Full-Stack  
**Prioridad**: Media  
**Estimación**: 5 puntos

**Criterios de Aceptación**:
1. El reporte incluye: información del proyecto, resumen del protocolo, estadísticas de cribado, cumplimiento PRISMA
2. Se muestran gráficos y visualizaciones
3. El reporte se puede exportar en PDF
4. El formato es profesional y presentable
5. Se incluye fecha de generación
6. Se pueden seleccionar qué secciones incluir
7. El reporte se genera rápidamente (< 5 segundos)

---

# ÉPICA 8: Infraestructura y Despliegue

## HU-032: Configurar Base de Datos Supabase

**Como** desarrollador  
**Quiero** configurar la base de datos en Supabase  
**Para** almacenar todos los datos del sistema de forma segura

**Descripción**: Crear todas las tablas, relaciones, índices y políticas RLS en Supabase.

**Fecha Inicio**: Sprint 1 - Día 1 (Paralelo)  
**Fecha Fin**: Sprint 1 - Día 5  
**Responsable**: Desarrollador Backend  
**Prioridad**: Alta  
**Estimación**: 8 puntos

**Criterios de Aceptación**:
1. Se crean todas las tablas: users, projects, protocols, references, prisma_items, article_versions, activity_log
2. Se configuran relaciones con foreign keys
3. Se crean índices para optimizar consultas
4. Se implementan políticas RLS para cada tabla
5. Se configuran triggers para actualizar timestamps
6. Se ejecutan scripts de seed con datos de prueba
7. Se documenta el esquema de base de datos

---

## HU-033: Integrar API de Gemini

**Como** desarrollador  
**Quiero** integrar la API de Gemini  
**Para** proporcionar funcionalidades de IA en el sistema

**Descripción**: Configurar y conectar la API de Gemini para generación de texto y validación.

**Fecha Inicio**: Sprint 3 - Día 1 (Paralelo)  
**Fecha Fin**: Sprint 3 - Día 3  
**Responsable**: Desarrollador Backend/IA  
**Prioridad**: Alta  
**Estimación**: 5 puntos

**Criterios de Aceptación**:
1. Se configura la API key de Gemini de forma segura
2. Se crea un servicio reutilizable para llamadas a Gemini
3. Se implementa manejo de errores y reintentos
4. Se optimiza el uso de tokens
5. Se implementa caché para respuestas comunes
6. Se documenta el uso de la API
7. Se prueban todas las funcionalidades de IA

---

## HU-034: Desplegar en Vercel

**Como** desarrollador  
**Quiero** desplegar el sistema en Vercel  
**Para** que esté disponible en producción

**Descripción**: Configurar deployment automático en Vercel con CI/CD.

**Fecha Inicio**: Sprint 7 - Día 9  
**Fecha Fin**: Sprint 7 - Día 10  
**Responsable**: Desarrollador DevOps  
**Prioridad**: Alta  
**Estimación**: 3 puntos

**Criterios de Aceptación**:
1. El proyecto se despliega exitosamente en Vercel
2. Se configuran variables de entorno
3. Se configura dominio personalizado (opcional)
4. Se implementa CI/CD con GitHub
5. Los deployments son automáticos al hacer push
6. Se configuran preview deployments para PRs
7. El sistema funciona correctamente en producción

---

**Total de Historias de Usuario**: 34  
**Estimación Total**: 234 puntos  
**Duración Estimada**: 7-8 sprints de 2 semanas

---

**Fecha de elaboración**: Enero 2025  
**Elaborado por**: Estudiante Tesista - ESPE  
**Versión**: 1.0
