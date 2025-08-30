# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `bun install` - Install all dependencies
- `bun run dev` - Start development server with hot reload on port 3001
- `bun start` - Start production server
- `bun run build:client` - Build React frontend for production
- `bun run build` - Build entire project

## Architecture Overview

This is a full-stack SQL query editor built with Bun runtime, featuring a read-only query interface with multi-database support.

### Backend Architecture (server/)
- **Hono Framework**: Fast, modern web framework for API endpoints
- **Database Module (db.js)**: Handles connections to MySQL, PostgreSQL, SQLite, and SQL Server
- **Query Validator (queryValidator.js)**: Security-first validation preventing write operations
- **Exporter (exporter.js)**: CSV and Excel export functionality
- **Configuration Loading**: Supports both `connections.json` and `connections.local.json` (local overrides main config)

### Frontend Architecture  
- **Single HTML File**: Complete React app embedded in `/public/index.html` 
- **No Build Process**: Uses CDN React and Babel for browser compilation
- **Component Structure**: Inline React components for database selection, query editing, and results display

### Security Model
- **Read-Only Enforcement**: Blocks DELETE, UPDATE, INSERT, DROP, CREATE, ALTER, TRUNCATE operations
- **Query Limits**: Automatically adds LIMIT 100 to prevent large result sets
- **Single Query**: Prevents multiple statement execution
- **Database-Specific Syntax**: Handles different LIMIT syntax (TOP for SQL Server, LIMIT for others)

### Database Configuration
Two-tier configuration system:
1. `connections.local.json` (takes priority if exists) - for local development
2. `connections.json` (fallback) - main configuration file

Configuration format supports connection strings with embedded ports (e.g., "host,port").

### Key Features
- **Multi-Database Support**: MySQL, PostgreSQL, SQLite, SQL Server
- **Export Options**: Copy to clipboard, CSV download, Excel download  
- **Keyboard Shortcuts**: F5 to execute queries
- **Responsive UI**: Modern design with mobile support
- **Error Handling**: Secure error messages without exposing sensitive data

## Development Notes

- **Runtime**: Uses Bun instead of Node.js for better performance
- **No Frontend Build**: React runs directly in browser via Babel
- **Port**: Development server runs on port 3001 (not 3000)
- **Database Drivers**: Uses native drivers (mysql2, pg, sqlite3, mssql)
- **Connection Management**: Each query creates new connection (no pooling)