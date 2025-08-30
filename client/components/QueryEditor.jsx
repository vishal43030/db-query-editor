import React from 'react';

function QueryEditor({ query, onQueryChange, onExecute, loading }) {
  const handleKeyPress = (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      onExecute();
    }
  };

  return (
    <div className="query-editor">
      <label htmlFor="sql-textarea" className="label">
        SQL Query (SELECT statements only):
      </label>
      <textarea
        id="sql-textarea"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Enter your SELECT query here..."
        className="textarea"
        rows={8}
        disabled={loading}
      />
      <div className="query-controls">
        <button
          onClick={onExecute}
          disabled={loading || !query.trim()}
          className="btn btn-primary"
        >
          {loading ? '⏳ Executing...' : '▶️ Execute Query'}
        </button>
        <span className="help-text">
          Press Ctrl+Enter to execute
        </span>
      </div>
    </div>
  );
}

export default QueryEditor;