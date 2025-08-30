# SQL Query Editor

A secure SQL query editor built with **Bun** and **Hono** that allows you to execute read-only queries against multiple databases with export capabilities.

## Features

- 🔍 **Multiple Database Support**: MySQL, PostgreSQL, and SQLite
- 🛡️ **Security First**: Only SELECT queries allowed - all write operations blocked
- 📊 **Export Options**: Copy to clipboard, CSV, and Excel export
- 🎯 **Modern UI**: Clean, responsive React interface
- ⚡ **Fast Performance**: Built with Bun runtime and Hono framework
- 🔧 **Easy Configuration**: JSON-based database connections

## Quick Start

1. **Install dependencies** (requires Bun):
   ```bash
   bun install
   ```

2. **Configure your databases** in `connections.json`:
   ```json
   {
     "databases": [
       {
         "name": "my_database",
         "type": "mysql",
         "host": "localhost",
         "port": 3306,
         "database": "mydb",
         "username": "user",
         "password": "password"
       }
     ]
   }
   ```

3. **Start the development server**:
   ```bash
   bun run dev
   ```

4. **Open your browser** to `http://localhost:3001`

## Database Configuration

### MySQL
```json
{
  "name": "mysql_db",
  "type": "mysql",
  "host": "localhost",
  "port": 3306,
  "database": "database_name",
  "username": "username",
  "password": "password"
}
```

### PostgreSQL
```json
{
  "name": "postgres_db",
  "type": "postgres",
  "host": "localhost",
  "port": 5432,
  "database": "database_name",
  "username": "username",
  "password": "password"
}
```

### SQLite
```json
{
  "name": "sqlite_db",
  "type": "sqlite",
  "database": "./path/to/database.db"
}
```

## Available Scripts

- `bun run dev` - Start development server with hot reload
- `bun start` - Start production server
- `bun run build` - Build frontend for production

## API Endpoints

- `GET /api/databases` - Get list of configured databases
- `POST /api/query` - Execute a SELECT query
- `GET /api/export` - Export query results as CSV or Excel

## Security Features

- **Query Validation**: Blocks DELETE, UPDATE, INSERT, DROP, CREATE, ALTER, TRUNCATE
- **Single Query**: Prevents multiple statements
- **Read-Only**: Only SELECT and WITH (CTE) statements allowed
- **Error Handling**: Secure error messages without exposing sensitive data

## Project Structure

```
├── server/
│   ├── index.js          # Main server file
│   ├── db.js             # Database connections
│   ├── queryValidator.js # Query security validation
│   └── exporter.js       # CSV/Excel export logic
├── client/
│   ├── App.jsx           # Main React component
│   ├── components/       # React components
│   └── styles.css        # Application styles
├── public/
│   └── index.html        # Single HTML file with inline React
├── connections.json      # Database configurations
└── package.json         # Dependencies and scripts
```

## Technology Stack

- **Runtime**: Bun
- **Backend**: Hono (web framework)
- **Frontend**: React 18 (vanilla, no bundler needed)
- **Databases**: MySQL2, pg (PostgreSQL), sqlite3
- **Export**: XLSX library for Excel exports

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details