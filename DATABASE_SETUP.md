# Configuración de MySQL para Student Marketplace

Esta guía te ayudará a configurar la base de datos MySQL para el sistema de autenticación.

## Requisitos Previos

- MySQL Server instalado (versión 5.7 o superior)
- Node.js y npm instalados

## Paso 1: Instalar MySQL

### Windows
1. Descarga MySQL desde [mysql.com/downloads](https://dev.mysql.com/downloads/installer/)
2. Ejecuta el instalador y sigue las instrucciones
3. Anota la contraseña de root que configures

### macOS
\`\`\`bash
brew install mysql
brew services start mysql
mysql_secure_installation
\`\`\`

### Linux (Ubuntu/Debian)
\`\`\`bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
\`\`\`

## Paso 2: Crear la Base de Datos

1. Accede a MySQL:
\`\`\`bash
mysql -u root -p
\`\`\`

2. Ejecuta el script de creación de base de datos:
\`\`\`bash
mysql -u root -p < scripts/create-database.sql
\`\`\`

O copia y pega el contenido del archivo `scripts/create-database.sql` en la consola de MySQL.

## Paso 3: Configurar Variables de Entorno

1. Copia el archivo de ejemplo:
\`\`\`bash
cp .env.example .env.local
\`\`\`

2. Edita `.env.local` con tus credenciales de MySQL:
\`\`\`env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=tu_contraseña_aquí
DATABASE_NAME=student_marketplace
\`\`\`

## Paso 4: Instalar Dependencias

El proyecto ya incluye las dependencias necesarias en el código. Next.js las instalará automáticamente:

- `mysql2` - Cliente MySQL para Node.js
- `bcryptjs` - Para hashear contraseñas

## Paso 5: Probar la Conexión

1. Inicia el servidor de desarrollo:
\`\`\`bash
npm run dev
\`\`\`

2. Abre tu navegador en `http://localhost:3000/login`

3. Usa las credenciales de prueba:
   - Email: `admin@marketplace.com`
   - Contraseña: `admin123`

## Estructura de la Base de Datos

### Tabla: users
- `id` - VARCHAR(36) PRIMARY KEY
- `email` - VARCHAR(255) UNIQUE NOT NULL
- `password` - VARCHAR(255) NOT NULL (hasheada con bcrypt)
- `name` - VARCHAR(255) NOT NULL
- `role` - ENUM('admin', 'seller', 'buyer')
- `avatar` - VARCHAR(500)
- `bio` - TEXT
- `university` - VARCHAR(255)
- `major` - VARCHAR(255)
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

### Tabla: sessions (opcional)
- `id` - VARCHAR(36) PRIMARY KEY
- `user_id` - VARCHAR(36) FOREIGN KEY
- `token` - VARCHAR(500)
- `expires_at` - TIMESTAMP
- `created_at` - TIMESTAMP

## Solución de Problemas

### Error: "Access denied for user"
- Verifica que el usuario y contraseña en `.env.local` sean correctos
- Asegúrate de que el usuario tenga permisos en la base de datos

### Error: "Database does not exist"
- Ejecuta el script `create-database.sql` nuevamente
- Verifica que el nombre de la base de datos en `.env.local` sea correcto

### Error: "Cannot connect to MySQL server"
- Verifica que MySQL esté corriendo: `sudo service mysql status` (Linux) o `brew services list` (macOS)
- Verifica el puerto (por defecto 3306)
- Verifica que el firewall no esté bloqueando la conexión

## Próximos Pasos

Una vez configurada la base de datos, puedes:

1. Registrar nuevos usuarios desde `/register`
2. Iniciar sesión desde `/login`
3. Los usuarios se guardarán en la base de datos MySQL real
4. Las contraseñas se almacenan hasheadas con bcrypt

## Migración a Producción

Para producción, considera:

1. Usar un servicio de base de datos en la nube:
   - AWS RDS
   - Google Cloud SQL
   - DigitalOcean Managed Databases
   - PlanetScale (MySQL serverless)

2. Configurar las variables de entorno en tu plataforma de hosting (Vercel, etc.)

3. Habilitar SSL para conexiones seguras

4. Implementar backups automáticos
