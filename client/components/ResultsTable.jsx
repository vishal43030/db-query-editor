import React from 'react';

function ResultsTable({ results }) {
  if (!results || results.length === 0) {
    return (
      <div className="no-results">
        <p>No results to display</p>
      </div>
    );
  }

  const columns = Object.keys(results[0]);

  return (
    <div className="results-table-container">
      <table className="results-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column}>
                  {row[column] !== null && row[column] !== undefined 
                    ? String(row[column]) 
                    : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ResultsTable;