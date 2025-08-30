import XLSX from 'xlsx';

export async function exportResults(data, format = 'csv') {
  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error('No data to export');
  }

  if (format === 'csv') {
    return exportToCSV(data);
  } else if (format === 'xlsx') {
    return exportToExcel(data);
  } else {
    throw new Error('Unsupported export format. Use "csv" or "xlsx"');
  }
}

function exportToCSV(data) {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [];

  csvRows.push(headers.map(header => `"${String(header).replace(/"/g, '""')}"`).join(','));

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) {
        return '';
      }
      const stringValue = String(value).replace(/"/g, '""');
      return `"${stringValue}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

function exportToExcel(data) {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Query Results');

  const excelBuffer = XLSX.write(workbook, { 
    type: 'buffer', 
    bookType: 'xlsx',
    compression: true 
  });

  return excelBuffer;
}