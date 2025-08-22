-- Eliminar claves foráneas duplicadas en users
DO $$
DECLARE
    r RECORD;
    constraint_names TEXT[] := ARRAY[]::TEXT[];
    constraint_name TEXT;
BEGIN
    -- Obtener nombres de claves foráneas duplicadas
    FOR r IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'users'::regclass 
        AND contype = 'f' 
        AND conname LIKE 'users_role_id_fkey%'
        ORDER BY conname
        OFFSET 1
    LOOP
        constraint_names := array_append(constraint_names, r.conname);
    END LOOP;
    
    -- Eliminar las claves foráneas duplicadas
    FOREACH constraint_name IN ARRAY constraint_names
    LOOP
        EXECUTE 'ALTER TABLE users DROP CONSTRAINT IF EXISTS ' || constraint_name || ';';
        RAISE NOTICE 'Eliminada restriccion: %', constraint_name;
    END LOOP;
END $$;

-- Verificar la estructura final de la tabla users
\d+ users
