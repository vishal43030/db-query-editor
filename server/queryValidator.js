const DANGEROUS_KEYWORDS = [
  'DELETE', 'UPDATE', 'INSERT', 'DROP', 'CREATE', 'ALTER', 'TRUNCATE',
  'REPLACE', 'MERGE', 'CALL', 'EXEC', 'EXECUTE', 'GRANT', 'REVOKE'
];

function addDefaultLimit(sql, dbType) {
  const upperSql = sql.toUpperCase();
  
  // Check if query already has LIMIT, TOP, or FETCH
  if (upperSql.includes(' LIMIT ') || 
      upperSql.includes(' TOP ') || 
      upperSql.includes(' FETCH ')) {
    return sql; // Already has a limit clause
  }

  // Add appropriate limit based on database type
  let modifiedSql = sql.trim();
  
  if (dbType === 'mssql' || dbType === 'sqlserver') {
    // For SQL Server, add TOP after SELECT
    modifiedSql = modifiedSql.replace(/^SELECT\s+/i, 'SELECT TOP 100 ');
  } else {
    // For MySQL, PostgreSQL, SQLite - add LIMIT at the end
    if (modifiedSql.endsWith(';')) {
      modifiedSql = modifiedSql.slice(0, -1) + ' LIMIT 100;';
    } else {
      modifiedSql += ' LIMIT 100';
    }
  }
  
  return modifiedSql;
}

export function validateQuery(sql, dbType = 'mysql') {
  if (!sql || typeof sql !== 'string') {
    return {
      isValid: false,
      error: 'SQL query is required and must be a string'
    };
  }

  const trimmedSql = sql.trim().toUpperCase();
  
  if (!trimmedSql.startsWith('SELECT') && !trimmedSql.startsWith('WITH')) {
    return {
      isValid: false,
      error: 'Only SELECT queries and CTEs (WITH clauses) are allowed'
    };
  }

  for (const keyword of DANGEROUS_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(sql)) {
      return {
        isValid: false,
        error: `${keyword} operations are not allowed. Only SELECT queries are permitted.`
      };
    }
  }

  if (sql.includes(';') && sql.trim().split(';').filter(s => s.trim()).length > 1) {
    return {
      isValid: false,
      error: 'Multiple statements are not allowed. Only single SELECT queries are permitted.'
    };
  }

  // Add default limit if none exists
  const modifiedSql = addDefaultLimit(sql, dbType);

  return {
    isValid: true,
    error: null,
    modifiedSql: modifiedSql
  };
}