# 🚀 SQLite to MySQL Migration Guide

Your POS system has been successfully configured to use MySQL instead of SQLite. This migration provides better performance, scalability, and production readiness.

## ✅ What's Been Updated

### 1. Prisma Schema

- Changed database provider from `sqlite` to `mysql`
- All existing models remain compatible

### 2. Dependencies

- ❌ Removed: `sqlite3`, `@types/sqlite3`
- ✅ Added: `mysql2`, `@types/mysql2`, `dotenv`

### 3. Database Configuration

- Enhanced Prisma client with MySQL-specific logging
- Added connection configuration with proper error handling

### 4. Scripts

- Added MySQL-specific database commands
- Created migration helper script

## 🛠️ Setup Instructions

### Step 1: Install MySQL

Make sure MySQL Server is installed and running on your system.

### Step 2: Create Database

```sql
CREATE DATABASE salon_pos_dev;
-- Optional: Create a dedicated user
CREATE USER 'salon_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON salon_pos_dev.* TO 'salon_user'@'localhost';
FLUSH PRIVILEGES;
```

### Step 3: Environment Configuration

Create a `.env.local` file in the `next` directory:

```env
DATABASE_URL="mysql://username:password@localhost:3306/salon_pos_dev"
```

**Examples:**

- Local with root: `mysql://root:yourpassword@localhost:3306/salon_pos_dev`
- With dedicated user: `mysql://salon_user:password@localhost:3306/salon_pos_dev`
- Production with SSL: `mysql://user:pass@host:3306/db?sslmode=require`

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Generate and Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to MySQL database
npm run db:push

# Seed with initial data
npm run db:seed
```

### Step 6: Start Development

```bash
npm run dev
```

## 🔧 Available Commands

| Command                 | Description                      |
| ----------------------- | -------------------------------- |
| `npm run db:generate`   | Generate Prisma client for MySQL |
| `npm run db:push`       | Push schema changes to database  |
| `npm run db:migrate`    | Create and run migrations        |
| `npm run db:seed`       | Seed database with initial data  |
| `npm run db:reset`      | Reset database and reseed        |
| `npm run db:studio`     | Open Prisma Studio               |
| `npm run migrate:mysql` | Run migration helper script      |

## 🎯 Migration Helper

Run the migration helper for step-by-step guidance:

```bash
npm run migrate:mysql
```

## 🔍 Troubleshooting

### Connection Issues

- ✅ Verify MySQL server is running
- ✅ Check credentials in `.env.local`
- ✅ Ensure database exists
- ✅ Verify user permissions

### Performance Optimization

- Use connection pooling: `?connection_limit=5&pool_timeout=20`
- Enable SSL for production: `?sslmode=require`
- Consider managed MySQL services (AWS RDS, Google Cloud SQL)

### Common Errors

- **Access denied**: Check username/password and permissions
- **Database doesn't exist**: Create the database first
- **Connection timeout**: Check if MySQL server is running

## 📊 Benefits of MySQL

- **Performance**: Better handling of concurrent connections
- **Scalability**: Supports larger datasets and more users
- **Production Ready**: Industry-standard for production applications
- **Features**: Advanced indexing, replication, and backup options
- **Ecosystem**: Better tooling and monitoring options

## 🔄 Data Migration

If you have existing SQLite data, you'll need to export and import it:

1. **Export from SQLite** (if you have existing data):

   ```bash
   # This would require a custom script to export data
   # Contact support if you need help with data migration
   ```

2. **Import to MySQL**: The seed script will create fresh data

## 🚀 Next Steps

1. Test all functionality with the new MySQL setup
2. Set up proper backup procedures
3. Configure SSL for production
4. Consider using a managed MySQL service for production

## 📞 Support

If you encounter any issues during migration:

1. Check the troubleshooting section above
2. Run `npm run migrate:mysql` for guided help
3. Review the MySQL setup guide in `MYSQL_SETUP.md`

---

**🎉 Congratulations!** Your POS system is now ready for MySQL with improved performance and scalability!
