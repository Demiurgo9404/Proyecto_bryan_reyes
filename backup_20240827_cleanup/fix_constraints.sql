-- Ver restricciones actuales en users
SELECT conname, conrelid::regclass, pg_get_constraintdef(oid)
FROM pg_constraint 
WHERE conrelid = 'users'::regclass
ORDER BY conname;

-- Ver restricciones actuales en roles
SELECT conname, conrelid::regclass, pg_get_constraintdef(oid)
FROM pg_constraint 
WHERE conrelid = 'roles'::regclass
ORDER BY conname;

-- Eliminar restricciones duplicadas en users
DO $$
DECLARE
    r RECORD;
    constraint_names TEXT[] := ARRAY[]::TEXT[];
    constraint_name TEXT;
BEGIN
    -- Obtener nombres de restricciones únicas para email
    FOR r IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'users'::regclass 
        AND contype = 'u' 
        AND conname LIKE 'users_email%'
        ORDER BY conname
        OFFSET 1
    LOOP
        constraint_names := array_append(constraint_names, r.conname);
    END LOOP;
    
    -- Obtener nombres de restricciones únicas para username
    FOR r IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'users'::regclass 
        AND contype = 'u' 
        AND conname LIKE 'users_username%'
        ORDER BY conname
        OFFSET 1
    LOOP
        constraint_names := array_append(constraint_names, r.conname);
    END LOOP;
    
    -- Eliminar las restricciones duplicadas
    FOREACH constraint_name IN ARRAY constraint_names
    LOOP
        EXECUTE 'ALTER TABLE users DROP CONSTRAINT IF EXISTS ' || constraint_name || ';';
        RAISE NOTICE 'Eliminada restricción: %', constraint_name;
    END LOOP;
END $$;

-- Eliminar restricciones duplicadas en roles
DO $$
DECLARE
    r RECORD;
    constraint_names TEXT[] := ARRAY[]::TEXT[];
    constraint_name TEXT;
BEGIN
    -- Obtener nombres de restricciones únicas para name
    FOR r IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'roles'::regclass 
        AND contype = 'u' 
        AND conname LIKE 'roles_name%'
        ORDER BY conname
        OFFSET 1
    LOOP
        constraint_names := array_append(constraint_names, r.conname);
    END LOOP;
    
    -- Eliminar las restricciones duplicadas
    FOREACH constraint_name IN ARRAY constraint_names
    LOOP
        EXECUTE 'ALTER TABLE roles DROP CONSTRAINT IF EXISTS ' || constraint_name || ';';
        RAISE NOTICE 'Eliminada restricción: %', constraint_name;
    END LOOP;
END $$;

-- Verificar las restricciones después de la limpieza
\d+ users
\d+ roles
