import psycopg2
from psycopg2 import sql

def check_database():
    try:
        # Conectar a la base de datos
        conn = psycopg2.connect(
            dbname="Love_rose_db",
            user="postgres",
            password="1234",
            host="localhost",
            port="5432"
        )
        
        # Crear un cursor
        cur = conn.cursor()
        
        # Verificar si la tabla users existe
        cur.execute("""
            SELECT EXISTS (
                SELECT 1 
                FROM information_schema.tables 
                WHERE table_name = 'users'
            );
        """)
        
        table_exists = cur.fetchone()[0]
        
        if not table_exists:
            print("❌ La tabla 'users' no existe en la base de datos.")
            return
            
        print("✅ La tabla 'users' existe en la base de datos.")
        
        # Obtener la estructura de la tabla users
        cur.execute("""
            SELECT column_name, data_type, is_nullable, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        """)
        
        print("\n📋 Estructura de la tabla 'users':")
        print("-" * 60)
        print(f"{'Columna':<20} {'Tipo':<20} {'Nulo?':<10} {'Valor por defecto'}")
        print("-" * 60)
        
        for col in cur.fetchall():
            print(f"{col[0]:<20} {col[1]:<20} {col[2]:<10} {col[3] or 'N/A'}")
        
        # Verificar si el usuario de prueba existe
        cur.execute("""
            SELECT * FROM users WHERE email = 'user@loverose.com';
        """)
        
        user = cur.fetchone()
        
        if user:
            print("\n👤 Usuario de prueba encontrado:")
            print("-" * 60)
            # Obtener los nombres de las columnas
            col_names = [desc[0] for desc in cur.description]
            
            # Mostrar los datos del usuario
            for i, col_name in enumerate(col_names):
                print(f"{col_name}: {user[i]}")
            
            # Verificar si el usuario está verificado y activo
            is_verified = user[col_names.index('is_verified')] if 'is_verified' in col_names else None
            is_active = user[col_names.index('is_active')] if 'is_active' in col_names else None
            
            print("\n🔍 Estado del usuario:")
            print(f"- Verificado: {'✅' if is_verified else '❌'}")
            print(f"- Activo: {'✅' if is_active else '❌'}")
            
            # Si el usuario no está verificado o activo, ofrecer corregirlo
            if not is_verified or not is_active:
                print("\n🔄 ¿Deseas actualizar el estado del usuario? (s/n): ", end="")
                if input().lower() == 's':
                    cur.execute("""
                        UPDATE users 
                        SET is_verified = true, 
                            is_active = true,
                            updated_at = NOW()
                        WHERE email = 'user@loverose.com';
                    """)
                    conn.commit()
                    print("✅ Usuario actualizado correctamente.")
        else:
            print("\n❌ Usuario de prueba no encontrado.")
            print("🔄 ¿Deseas crear un usuario de prueba? (s/n): ", end="")
            if input().lower() == 's':
                # Contraseña: User123! (hasheada con bcrypt)
                hashed_password = '$2a$10$XFDq3L7v4LdJ3H5p5n8G1OQJ1hJ3Zv5W8nUzXKjKvxY7dJ2mN3p4C'
                
                cur.execute("""
                    INSERT INTO users (
                        id, email, password, username, role, 
                        is_verified, is_active, created_at, updated_at
                    ) VALUES (
                        '550e8400-e29b-41d4-a716-446655440000',
                        'user@loverose.com',
                        %s,
                        'usuario_prueba',
                        'user',
                        true,
                        true,
                        NOW(),
                        NOW()
                    ) RETURNING *;
                """, (hashed_password,))
                
                conn.commit()
                print("✅ Usuario de prueba creado exitosamente.")
                
                # Mostrar los datos del nuevo usuario
                new_user = cur.fetchone()
                col_names = [desc[0] for desc in cur.description]
                
                print("\n📋 Datos del nuevo usuario:")
                print("-" * 60)
                for i, col_name in enumerate(col_names):
                    print(f"{col_name}: {new_user[i]}")
        
    except Exception as e:
        print(f"❌ Error al conectar a la base de datos: {e}")
    finally:
        # Cerrar la conexión
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    check_database()
