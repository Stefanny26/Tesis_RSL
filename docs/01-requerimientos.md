# Análisis de Requerimientos
## Sistema Web para Gestión de Revisiones Sistemáticas con IA

### Universidad de las Fuerzas Armadas ESPE

---

## 1. REQUERIMIENTOS FUNCIONALES

### RF-01: Gestión de Usuarios y Autenticación
- **RF-01.1**: El sistema debe permitir el registro de nuevos usuarios con validación de correo electrónico
- **RF-01.2**: El sistema debe autenticar usuarios mediante correo y contraseña
- **RF-01.3**: El sistema debe soportar tres roles: Administrador, Investigador y Revisor
- **RF-01.4**: El sistema debe permitir la gestión de perfiles de usuario
- **RF-01.5**: El sistema debe mantener sesiones seguras con tokens de autenticación

### RF-02: Gestión de Proyectos RSL
- **RF-02.1**: El sistema debe permitir crear proyectos de revisión sistemática
- **RF-02.2**: El sistema debe permitir asignar miembros a proyectos con roles específicos
- **RF-02.3**: El sistema debe mostrar el estado del proyecto (borrador, en progreso, completado)
- **RF-02.4**: El sistema debe calcular y mostrar el progreso del proyecto
- **RF-02.5**: El sistema debe permitir editar y eliminar proyectos

### RF-03: Definición de Protocolo de Investigación
- **RF-03.1**: El sistema debe implementar un asistente paso a paso para definir el protocolo
- **RF-03.2**: El sistema debe permitir crear la Matriz Es/No Es para delimitar el alcance
- **RF-03.3**: El sistema debe implementar el framework PICO (Población, Intervención, Comparación, Outcome)
- **RF-03.4**: El sistema debe permitir definir preguntas de investigación
- **RF-03.5**: El sistema debe permitir establecer criterios de inclusión y exclusión
- **RF-03.6**: El sistema debe permitir definir la estrategia de búsqueda con bases de datos y cadenas de búsqueda
- **RF-03.7**: El sistema debe validar la completitud del protocolo antes de continuar

### RF-04: Cribado de Referencias con IA
- **RF-04.1**: El sistema debe permitir importar referencias bibliográficas
- **RF-04.2**: El sistema debe generar embeddings vectoriales de referencias usando MiniLM
- **RF-04.3**: El sistema debe clasificar automáticamente referencias como incluidas/excluidas
- **RF-04.4**: El sistema debe calcular scores de relevancia basados en el protocolo PICO
- **RF-04.5**: El sistema debe permitir ajustar el umbral de clasificación automática
- **RF-04.6**: El sistema debe permitir revisión manual de referencias
- **RF-04.7**: El sistema debe soportar acciones masivas (incluir/excluir múltiples referencias)
- **RF-04.8**: El sistema debe filtrar referencias por estado y búsqueda de texto
- **RF-04.9**: El sistema debe mostrar estadísticas de cribado en tiempo real

### RF-05: Validación PRISMA
- **RF-05.1**: El sistema debe implementar el checklist PRISMA 2020 con 27 ítems
- **RF-05.2**: El sistema debe organizar ítems por secciones (Título, Resumen, Introducción, etc.)
- **RF-05.3**: El sistema debe permitir marcar ítems como completados
- **RF-05.4**: El sistema debe generar sugerencias de IA para cada ítem PRISMA
- **RF-05.5**: El sistema debe validar automáticamente el contenido contra los ítems PRISMA
- **RF-05.6**: El sistema debe calcular el porcentaje de cumplimiento PRISMA
- **RF-05.7**: El sistema debe permitir agregar contenido específico para cada ítem

### RF-06: Generación de Artículos con IA
- **RF-06.1**: El sistema debe proporcionar un editor estructurado por secciones
- **RF-06.2**: El sistema debe generar borradores de secciones usando IA (Gemini)
- **RF-06.3**: El sistema debe generar artículos completos basados en el protocolo y resultados
- **RF-06.4**: El sistema debe implementar control de versiones para artículos
- **RF-06.5**: El sistema debe permitir restaurar versiones anteriores
- **RF-06.6**: El sistema debe mostrar diferencias entre versiones
- **RF-06.7**: El sistema debe calcular estadísticas del artículo (palabras, completitud)
- **RF-06.8**: El sistema debe permitir edición manual del contenido generado

### RF-07: Exportación y Reportes
- **RF-07.1**: El sistema debe exportar artículos en formato PDF
- **RF-07.2**: El sistema debe exportar artículos en formato DOCX
- **RF-07.3**: El sistema debe exportar artículos en formato LaTeX
- **RF-07.4**: El sistema debe generar diagramas de flujo PRISMA
- **RF-07.5**: El sistema debe exportar referencias en formato BibTeX
- **RF-07.6**: El sistema debe exportar referencias en formato RIS
- **RF-07.7**: El sistema debe exportar referencias en formato EndNote
- **RF-07.8**: El sistema debe generar reportes ejecutivos del proyecto
- **RF-07.9**: El sistema debe permitir seleccionar qué secciones exportar

### RF-08: Registro de Actividad
- **RF-08.1**: El sistema debe registrar todas las acciones importantes de los usuarios
- **RF-08.2**: El sistema debe mostrar historial de cambios por proyecto
- **RF-08.3**: El sistema debe identificar quién realizó cada cambio y cuándo

---

## 2. REQUERIMIENTOS NO FUNCIONALES

### RNF-01: Rendimiento
- **RNF-01.1**: El sistema debe cargar la interfaz principal en menos de 3 segundos
- **RNF-01.2**: La clasificación automática de referencias debe procesar al menos 100 referencias por minuto
- **RNF-01.3**: La generación de embeddings debe completarse en menos de 2 segundos por referencia
- **RNF-01.4**: Las consultas a la base de datos deben responder en menos de 500ms

### RNF-02: Seguridad
- **RNF-02.1**: El sistema debe implementar autenticación segura con tokens JWT
- **RNF-02.2**: El sistema debe implementar Row Level Security (RLS) en la base de datos
- **RNF-02.3**: Las contraseñas deben almacenarse con hash bcrypt
- **RNF-02.4**: El sistema debe proteger contra inyección SQL
- **RNF-02.5**: El sistema debe implementar HTTPS para todas las comunicaciones
- **RNF-02.6**: El sistema debe validar y sanitizar todas las entradas de usuario

### RNF-03: Usabilidad
- **RNF-03.1**: La interfaz debe ser intuitiva y no requerir capacitación extensa
- **RNF-03.2**: El sistema debe proporcionar retroalimentación visual para todas las acciones
- **RNF-03.3**: El sistema debe ser responsive y funcionar en dispositivos móviles
- **RNF-03.4**: El sistema debe seguir estándares de accesibilidad WCAG 2.1 nivel AA
- **RNF-03.5**: Los mensajes de error deben ser claros y orientar al usuario

### RNF-04: Escalabilidad
- **RNF-04.1**: El sistema debe soportar al menos 100 usuarios simultáneos
- **RNF-04.2**: El sistema debe manejar proyectos con hasta 10,000 referencias
- **RNF-04.3**: La base de datos debe escalar horizontalmente según demanda
- **RNF-04.4**: El sistema debe implementar caché para mejorar rendimiento

### RNF-05: Disponibilidad
- **RNF-05.1**: El sistema debe tener una disponibilidad del 99.5%
- **RNF-05.2**: El sistema debe implementar respaldos automáticos diarios
- **RNF-05.3**: El sistema debe recuperarse de fallos en menos de 5 minutos

### RNF-06: Mantenibilidad
- **RNF-06.1**: El código debe seguir estándares de TypeScript y React
- **RNF-06.2**: El código debe estar documentado con comentarios claros
- **RNF-06.3**: El sistema debe usar arquitectura modular y componentes reutilizables
- **RNF-06.4**: El sistema debe implementar logging para facilitar debugging

### RNF-07: Compatibilidad
- **RNF-07.1**: El sistema debe funcionar en Chrome, Firefox, Safari y Edge (últimas 2 versiones)
- **RNF-07.2**: El sistema debe ser compatible con lectores de pantalla
- **RNF-07.3**: El sistema debe soportar importación de referencias desde gestores bibliográficos comunes

### RNF-08: Integridad de Datos
- **RNF-08.1**: El sistema debe mantener consistencia de datos mediante transacciones
- **RNF-08.2**: El sistema debe validar integridad referencial en la base de datos
- **RNF-08.3**: El sistema debe prevenir pérdida de datos con autoguardado
- **RNF-08.4**: El sistema debe mantener historial de versiones para recuperación

### RNF-09: Cumplimiento Normativo
- **RNF-09.1**: El sistema debe cumplir con las directrices PRISMA 2020
- **RNF-09.2**: El sistema debe seguir estándares académicos para revisiones sistemáticas
- **RNF-09.3**: El sistema debe cumplir con regulaciones de protección de datos (GDPR)

### RNF-10: Tecnología
- **RNF-10.1**: El sistema debe usar Next.js 14+ con App Router
- **RNF-10.2**: El sistema debe usar Supabase como base de datos PostgreSQL
- **RNF-10.3**: El sistema debe usar Gemini API para funcionalidades de IA
- **RNF-10.4**: El sistema debe usar embeddings MiniLM para clasificación semántica
- **RNF-10.5**: El sistema debe implementar TypeScript para type safety

---

## 3. RESTRICCIONES DEL PROYECTO

### Restricciones Técnicas
- Debe desarrollarse como aplicación web (no nativa)
- Debe usar tecnologías open-source cuando sea posible
- Debe integrarse con APIs de IA existentes (Gemini)

### Restricciones de Tiempo
- Desarrollo completo en un semestre académico
- Presentación de tesis según calendario ESPE

### Restricciones de Recursos
- Equipo de desarrollo: 1 estudiante tesista
- Presupuesto limitado para APIs de IA
- Infraestructura en la nube (Vercel/Supabase free tier inicialmente)

### Restricciones Académicas
- Debe cumplir con estándares de revisiones sistemáticas
- Debe seguir metodología PRISMA 2020
- Debe validarse con usuarios reales (investigadores ESPE)

---

## 4. SUPUESTOS

1. Los usuarios tienen conocimientos básicos de revisiones sistemáticas
2. Los usuarios tienen acceso a internet estable
3. Las referencias bibliográficas están en formato estándar (BibTeX, RIS, etc.)
4. La API de Gemini estará disponible y estable
5. Los usuarios utilizarán navegadores modernos actualizados

---

## 5. DEPENDENCIAS

1. **Supabase**: Para base de datos, autenticación y almacenamiento
2. **Gemini API**: Para generación de texto y validación con IA
3. **Embeddings MiniLM**: Para clasificación semántica de referencias
4. **Vercel**: Para hosting y deployment
5. **Bibliotecas de exportación**: Para generar PDF, DOCX, etc.

---

**Fecha de elaboración**: Enero 2025  
**Elaborado por**: Estudiante Tesista - ESPE  
**Versión**: 1.0
