import React, { useState, useEffect } from 'react';
import DatabaseSelector from './components/DatabaseSelector.jsx';
import QueryEditor from './components/QueryEditor.jsx';
import ResultsTable from './components/ResultsTable.jsx';
import './styles.css';

function App() {
  const [databases, setDatabases] = useState([]);
  const [selectedDatabase, setSelectedDatabase] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDatabases();
  }, []);

  const fetchDatabases = async () => {
    try {
      const response = await fetch('/api/databases');
      const data = await response.json();
      setDatabases(data.databases || []);
    } catch (err) {
      setError('Failed to fetch databases');
      console.error(err);
    }
  };

  const executeQuery = async () => {
    if (!selectedDatabase || !query.trim()) {
      setError('Please select a database and enter a query');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dbName: selectedDatabase,
          sql: query.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Query failed');
      }

      if (data.success) {
        setResults(data.data || []);
        setError(null);
      } else {
        setError(data.error || 'Query failed');
        setResults([]);
      }
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const exportResults = async (format) => {
    if (!selectedDatabase || !query.trim() || results.length === 0) {
      setError('No results to export');
      return;
    }

    try {
      const params = new URLSearchParams({
        dbName: selectedDatabase,
        sql: query.trim(),
        format: format
      });

      const response = await fetch(`/api/export?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `query_results.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Export failed: ' + err.message);
    }
  };

  const copyResults = async () => {
    if (results.length === 0) {
      setError('No results to copy');
      return;
    }

    try {
      const headers = Object.keys(results[0]);
      const csvContent = [
        headers.join('\t'),
        ...results.map(row => headers.map(header => row[header] || '').join('\t'))
      ].join('\n');

      await navigator.clipboard.writeText(csvContent);
      alert('Results copied to clipboard!');
    } catch (err) {
      setError('Failed to copy results');
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>SQL Query Editor</h1>
        <p>Execute read-only SQL queries against your databases</p>
      </header>

      <main className="main">
        <div className="query-section">
          <DatabaseSelector
            databases={databases}
            selectedDatabase={selectedDatabase}
            onDatabaseChange={setSelectedDatabase}
          />

          <QueryEditor
            query={query}
            onQueryChange={setQuery}
            onExecute={executeQuery}
            loading={loading}
          />
        </div>

        {error && (
          <div className="error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {results.length > 0 && (
          <div className="results-section">
            <div className="results-header">
              <h3>Results ({results.length} rows)</h3>
              <div className="export-buttons">
                <button onClick={copyResults} className="btn btn-secondary">
                  📋 Copy
                </button>
                <button onClick={() => exportResults('csv')} className="btn btn-secondary">
                  📄 CSV
                </button>
                <button onClick={() => exportResults('xlsx')} className="btn btn-secondary">
                  📊 Excel
                </button>
              </div>
            </div>
            <ResultsTable results={results} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;