-- =====================================================
-- Script para poblar datos de uso de API de prueba
-- =====================================================

-- Obtener el ID del usuario actual (ajustar según tu base de datos)
DO $$
DECLARE
    v_user_id INT;
BEGIN
    -- Obtener el primer usuario (o puedes cambiar el email)
    SELECT id INTO v_user_id FROM users LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró ningún usuario en la base de datos';
    END IF;

    -- Insertar registros de uso de ChatGPT
    INSERT INTO api_usage (
        user_id, provider, endpoint, model,
        tokens_prompt, tokens_completion, tokens_total,
        request_count, success, created_at
    ) VALUES
    -- Solicitudes exitosas de ChatGPT (últimos 7 días)
    (v_user_id, 'chatgpt', '/api/ai/generate-titles', 'gpt-4o-mini', 1200, 800, 2000, 1, true, NOW() - INTERVAL '1 hour'),
    (v_user_id, 'chatgpt', '/api/ai/protocol-analysis', 'gpt-4o-mini', 1500, 1000, 2500, 1, true, NOW() - INTERVAL '3 hours'),
    (v_user_id, 'chatgpt', '/api/ai/generate-protocol-terms', 'gpt-4o-mini', 1100, 900, 2000, 1, true, NOW() - INTERVAL '5 hours'),
    (v_user_id, 'chatgpt', '/api/ai/generate-inclusion-exclusion-criteria', 'gpt-4o-mini', 1300, 1100, 2400, 1, true, NOW() - INTERVAL '6 hours'),
    (v_user_id, 'chatgpt', '/api/ai/generate-search-queries', 'gpt-4o-mini', 1400, 1200, 2600, 1, true, NOW() - INTERVAL '8 hours'),
    (v_user_id, 'chatgpt', '/api/ai/screen-reference', 'gpt-4o-mini', 800, 600, 1400, 1, true, NOW() - INTERVAL '10 hours'),
    (v_user_id, 'chatgpt', '/api/ai/generate-titles', 'gpt-4o-mini', 1250, 850, 2100, 1, true, NOW() - INTERVAL '1 day'),
    (v_user_id, 'chatgpt', '/api/ai/protocol-analysis', 'gpt-4o-mini', 1550, 1050, 2600, 1, true, NOW() - INTERVAL '2 days'),
    (v_user_id, 'chatgpt', '/api/ai/generate-protocol-terms', 'gpt-4o-mini', 1150, 950, 2100, 1, true, NOW() - INTERVAL '3 days'),
    (v_user_id, 'chatgpt', '/api/ai/generate-search-queries', 'gpt-4o-mini', 1450, 1250, 2700, 1, true, NOW() - INTERVAL '4 days'),
    (v_user_id, 'chatgpt', '/api/ai/screen-reference', 'gpt-4o-mini', 850, 650, 1500, 1, true, NOW() - INTERVAL '5 days'),
    (v_user_id, 'chatgpt', '/api/ai/generate-titles', 'gpt-4o-mini', 1280, 880, 2160, 1, true, NOW() - INTERVAL '6 days'),

    -- Solicitudes exitosas de Gemini (últimos 7 días)
    (v_user_id, 'gemini', '/api/ai/generate-titles', 'gemini-2.0-flash-exp', 1300, 900, 2200, 1, true, NOW() - INTERVAL '2 hours'),
    (v_user_id, 'gemini', '/api/ai/protocol-analysis', 'gemini-2.0-flash-exp', 1600, 1100, 2700, 1, true, NOW() - INTERVAL '4 hours'),
    (v_user_id, 'gemini', '/api/ai/generate-protocol-terms', 'gemini-2.0-flash-exp', 1200, 1000, 2200, 1, true, NOW() - INTERVAL '7 hours'),
    (v_user_id, 'gemini', '/api/ai/generate-inclusion-exclusion-criteria', 'gemini-2.0-flash-exp', 1400, 1200, 2600, 1, true, NOW() - INTERVAL '9 hours'),
    (v_user_id, 'gemini', '/api/ai/generate-search-queries', 'gemini-2.0-flash-exp', 1500, 1300, 2800, 1, true, NOW() - INTERVAL '11 hours'),
    (v_user_id, 'gemini', '/api/ai/screen-reference', 'gemini-2.0-flash-exp', 900, 700, 1600, 1, true, NOW() - INTERVAL '1 day'),
    (v_user_id, 'gemini', '/api/ai/generate-titles', 'gemini-2.0-flash-exp', 1350, 950, 2300, 1, true, NOW() - INTERVAL '2 days'),
    (v_user_id, 'gemini', '/api/ai/protocol-analysis', 'gemini-2.0-flash-exp', 1650, 1150, 2800, 1, true, NOW() - INTERVAL '3 days'),
    (v_user_id, 'gemini', '/api/ai/generate-protocol-terms', 'gemini-2.0-flash-exp', 1250, 1050, 2300, 1, true, NOW() - INTERVAL '4 days'),
    (v_user_id, 'gemini', '/api/ai/generate-search-queries', 'gemini-2.0-flash-exp', 1550, 1350, 2900, 1, true, NOW() - INTERVAL '5 days'),
    (v_user_id, 'gemini', '/api/ai/screen-reference', 'gemini-2.0-flash-exp', 950, 750, 1700, 1, true, NOW() - INTERVAL '6 days'),
    (v_user_id, 'gemini', '/api/ai/generate-titles', 'gemini-2.0-flash-exp', 1380, 980, 2360, 1, true, NOW() - INTERVAL '7 days'),

    -- Algunas solicitudes fallidas para simular rate limits
    (v_user_id, 'gemini', '/api/ai/generate-titles', 'gemini-2.0-flash-exp', 0, 0, 0, 1, false, NOW() - INTERVAL '30 minutes'),
    (v_user_id, 'chatgpt', '/api/ai/protocol-analysis', 'gpt-4o-mini', 0, 0, 0, 1, false, NOW() - INTERVAL '45 minutes');

    RAISE NOTICE 'Se insertaron registros de uso de API para el usuario ID: %', v_user_id;
END $$;

-- Verificar los datos insertados
SELECT 
    provider,
    COUNT(*) as total_requests,
    SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_requests,
    SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed_requests,
    SUM(tokens_total) as total_tokens
FROM api_usage
GROUP BY provider
ORDER BY provider;
