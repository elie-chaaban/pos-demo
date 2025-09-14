# MySQL Database Setup Guide

## Prerequisites

1. Install MySQL Server on your system
2. Create a database for your POS system

## Environment Configuration

Create a `.env.local` file in the `next` directory with the following content:

```env
# Local development database configuration
DATABASE_URL="mysql://username:password@localhost:3306/salon_pos_dev"
```

### Database URL Format

```
mysql://[username]:[password]@[host]:[port]/[database_name]
```

### Examples:

**Local Development:**

```env
DATABASE_URL="mysql://root:yourpassword@localhost:3306/salon_pos_dev"
```

**Production with SSL:**

```env
DATABASE_URL="mysql://username:password@your-mysql-host:3306/salon_pos_prod?sslmode=require"
```

**With Connection Pooling:**

```env
DATABASE_URL="mysql://username:password@localhost:3306/salon_pos?connection_limit=5&pool_timeout=20"
```

## Setup Steps

1. **Install MySQL Server** (if not already installed)
2. **Create Database:**
   ```sql
   CREATE DATABASE salon_pos_dev;
   ```
3. **Create User** (optional, for security):
   ```sql
   CREATE USER 'salon_user'@'localhost' IDENTIFIED BY 'your_secure_password';
   GRANT ALL PRIVILEGES ON salon_pos_dev.* TO 'salon_user'@'localhost';
   FLUSH PRIVILEGES;
   ```
4. **Update your `.env.local`** with the correct credentials
5. **Install dependencies:**
   ```bash
   npm install
   ```
6. **Generate Prisma client and run migrations:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```
7. **Seed the database:**
   ```bash
   npm run db:seed
   ```

## Migration from SQLite

The system has been updated to use MySQL. The main changes include:

- Updated Prisma schema to use MySQL provider
- Replaced `sqlite3` dependency with `mysql2`
- Updated database connection configuration

## Troubleshooting

### Connection Issues

- Ensure MySQL server is running
- Verify credentials in `.env.local`
- Check if the database exists
- Ensure the user has proper permissions

### Performance Optimization

- Use connection pooling for production
- Enable SSL for secure connections
- Consider using a managed MySQL service (AWS RDS, Google Cloud SQL, etc.)
