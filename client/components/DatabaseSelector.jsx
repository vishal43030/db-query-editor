import React from 'react';

function DatabaseSelector({ databases, selectedDatabase, onDatabaseChange }) {
  return (
    <div className="database-selector">
      <label htmlFor="database-select" className="label">
        Select Database:
      </label>
      <select
        id="database-select"
        value={selectedDatabase}
        onChange={(e) => onDatabaseChange(e.target.value)}
        className="select"
      >
        <option value="">-- Choose a database --</option>
        {databases.map((db) => (
          <option key={db.name} value={db.name}>
            {db.name} ({db.type})
          </option>
        ))}
      </select>
    </div>
  );
}

export default DatabaseSelector;