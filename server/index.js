import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/bun';
import { readFileSync } from 'fs';
import { executeQuery, getDatabases } from './db.js';
import { validateQuery } from './queryValidator.js';
import { exportResults } from './exporter.js';

const app = new Hono();

app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:8080'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST'],
}));

app.get('/api/databases', async (c) => {
  try {
    const databases = getDatabases();
    return c.json({ databases });
  } catch (error) {
    console.error('Error getting databases:', error);
    return c.json({ error: 'Failed to get databases' }, 500);
  }
});

app.post('/api/query', async (c) => {
  try {
    const { dbName, sql } = await c.req.json();
    
    if (!dbName || !sql) {
      return c.json({ error: 'Database name and SQL query are required' }, 400);
    }

    // Get database type for proper limit syntax
    const databases = getDatabases();
    const dbConfig = databases.find(db => db.name === dbName);
    const dbType = dbConfig?.type || 'mysql';

    const validation = validateQuery(sql, dbType);
    if (!validation.isValid) {
      return c.json({ error: validation.error }, 400);
    }

    // Use the modified SQL with automatic limit
    const finalSql = validation.modifiedSql || sql;
    const result = await executeQuery(dbName, finalSql);
    
    // Include info about whether limit was added
    if (validation.modifiedSql && validation.modifiedSql !== sql) {
      result.limitAdded = true;
      result.originalSql = sql;
      result.executedSql = finalSql;
    }
    
    return c.json(result);
  } catch (error) {
    console.error('Query execution error:', error);
    return c.json({ error: error.message || 'Query execution failed' }, 500);
  }
});

app.get('/api/export', async (c) => {
  try {
    const dbName = c.req.query('dbName');
    const sql = c.req.query('sql');
    const format = c.req.query('format') || 'csv';

    if (!dbName || !sql) {
      return c.json({ error: 'Database name and SQL query are required' }, 400);
    }

    // Get database type for proper limit syntax
    const databases = getDatabases();
    const dbConfig = databases.find(db => db.name === dbName);
    const dbType = dbConfig?.type || 'mysql';

    const validation = validateQuery(sql, dbType);
    if (!validation.isValid) {
      return c.json({ error: validation.error }, 400);
    }

    // Use the modified SQL with automatic limit
    const finalSql = validation.modifiedSql || sql;
    const queryResult = await executeQuery(dbName, finalSql);
    if (queryResult.error) {
      return c.json({ error: queryResult.error }, 500);
    }

    const exportResult = await exportResults(queryResult.data, format);
    
    const contentType = format === 'xlsx' 
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'text/csv';
    
    const filename = `query_results.${format}`;
    
    c.header('Content-Type', contentType);
    c.header('Content-Disposition', `attachment; filename="${filename}"`);
    
    return c.body(exportResult);
  } catch (error) {
    console.error('Export error:', error);
    return c.json({ error: error.message || 'Export failed' }, 500);
  }
});

app.use('/*', serveStatic({ root: './public' }));

app.get('/', (c) => {
  return c.html(readFileSync('./public/index.html', 'utf8'));
});

const port = process.env.PORT || 3001;
console.log(`🚀 Server running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};