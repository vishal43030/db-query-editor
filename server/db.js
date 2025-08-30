import { readFileSync, existsSync } from 'fs';
import mysql from 'mysql2/promise';
import pg from 'pg';
import sqlite3 from 'sqlite3';
import mssql from 'mssql';

let connectionsConfig = null;

function loadConnections() {
  if (!connectionsConfig) {
    try {
      let configPath = './connections.local.json';
      if (!existsSync(configPath)) {
        configPath = './connections.json';
      }
      const configData = readFileSync(configPath, 'utf8');
      connectionsConfig = JSON.parse(configData);
    } catch (error) {
      throw new Error('Failed to load connections configuration: ' + error.message);
    }
  }
  return connectionsConfig;
}

export function getDatabases() {
  const config = loadConnections();
  return config.databases.map(db => ({
    name: db.name,
    type: db.type
  }));
}

function findDatabase(dbName) {
  const config = loadConnections();
  return config.databases.find(db => db.name === dbName);
}

async function connectMySQL(dbConfig) {
  let host = dbConfig.host;
  let port = dbConfig.port;
  
  // Handle host format like "IP,PORT"
  if (host && host.includes(',')) {
    const [hostPart, portPart] = host.split(',');
    host = hostPart.trim();
    port = parseInt(portPart.trim()) || port;
  }
  
  const connection = await mysql.createConnection({
    host: host,
    port: port,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
  });
  return connection;
}

async function connectPostgreSQL(dbConfig) {
  let host = dbConfig.host;
  let port = dbConfig.port;
  
  // Handle host format like "IP,PORT"
  if (host && host.includes(',')) {
    const [hostPart, portPart] = host.split(',');
    host = hostPart.trim();
    port = parseInt(portPart.trim()) || port;
  }
  
  const client = new pg.Client({
    host: host,
    port: port,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
  });
  await client.connect();
  return client;
}

function connectSQLite(dbConfig) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbConfig.database, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
}

async function connectMSSQL(dbConfig) {
  let host = dbConfig.host;
  let port = dbConfig.port || 1433;
  
  // Handle host format like "IP,PORT"
  if (host && host.includes(',')) {
    const [hostPart, portPart] = host.split(',');
    host = hostPart.trim();
    port = parseInt(portPart.trim()) || port;
  }
  
  const config = {
    server: host,
    port: port,
    database: dbConfig.database,
    user: dbConfig.username,
    password: dbConfig.password,
    options: {
      encrypt: dbConfig.encrypt || false,
      trustServerCertificate: dbConfig.trustServerCertificate || true,
      enableArithAbort: true,
    },
    connectionTimeout: 30000,
    requestTimeout: 30000,
  };
  
  const pool = await mssql.connect(config);
  return pool;
}

async function executeMySQL(connection, sql) {
  const [rows] = await connection.execute(sql);
  await connection.end();
  return Array.isArray(rows) ? rows : [];
}

async function executePostgreSQL(client, sql) {
  const result = await client.query(sql);
  await client.end();
  return result.rows || [];
}

async function executeSQLite(db, sql) {
  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => {
      db.close();
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
}

async function executeMSSQL(pool, sql) {
  const request = pool.request();
  const result = await request.query(sql);
  await pool.close();
  return result.recordset || [];
}

export async function executeQuery(dbName, sql) {
  try {
    const dbConfig = findDatabase(dbName);
    if (!dbConfig) {
      throw new Error(`Database '${dbName}' not found in configuration`);
    }

    let connection;
    let results;

    switch (dbConfig.type) {
      case 'mysql':
        connection = await connectMySQL(dbConfig);
        results = await executeMySQL(connection, sql);
        break;
      
      case 'postgres':
        connection = await connectPostgreSQL(dbConfig);
        results = await executePostgreSQL(connection, sql);
        break;
      
      case 'sqlite':
        connection = await connectSQLite(dbConfig);
        results = await executeSQLite(connection, sql);
        break;
      
      case 'mssql':
      case 'sqlserver':
        connection = await connectMSSQL(dbConfig);
        results = await executeMSSQL(connection, sql);
        break;
      
      default:
        throw new Error(`Unsupported database type: ${dbConfig.type}`);
    }

    return {
      success: true,
      data: results,
      rowCount: results.length
    };
  } catch (error) {
    console.error('Database query error:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}