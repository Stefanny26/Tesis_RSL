-- Migración: Agregar campo manual_review_status a references
-- Fecha: 2026-02-17
-- Descripción: Campo para rastrear si el usuario revisó manualmente el artículo
--              Diferencia la decisión manual del investigador vs la clasificación de la IA

ALTER TABLE "references"
ADD COLUMN IF NOT EXISTS manual_review_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS manual_review_notes TEXT;
