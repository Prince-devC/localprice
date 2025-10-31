// Simple CSV export utility
// Usage: exportToCSV('filename.csv', [
//   { header: 'Nom', accessor: 'name' },
//   { header: 'Valeur', accessor: (row) => format(row.value) }
// ], rowsArray);
export function exportToCSV(filename, columns, rows) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const headers = (Array.isArray(columns) ? columns : []).map((c) => String(c.header || '')).join(',');
  const escape = (val) => {
    if (val === null || typeof val === 'undefined') return '';
    let s = String(val);
    s = s.replace(/"/g, '""');
    if (/[",\n]/.test(s)) s = `"${s}"`;
    return s;
  };
  const lines = safeRows.map((row) => {
    return columns.map((col) => {
      const value = typeof col.accessor === 'function' ? col.accessor(row) : row?.[col.accessor];
      return escape(value);
    }).join(',');
  });
  const csvContent = '\ufeff' + [headers, ...lines].join('\n');
  try {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'export.csv';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    // Fallback: log CSV to console
    // eslint-disable-next-line no-console
    console.log(csvContent);
  }
}