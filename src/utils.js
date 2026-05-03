const PRIORITY_MAP = {
  critical: 'Highest',
  high:     'High',
  medium:   'Medium',
  low:      'Low',
}

function csvCell(value) {
  const str = String(value ?? '')
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function buildJiraCSV(tasks) {
  const headers = ['Summary', 'Description', 'Priority', 'Issue Type', 'Labels']
  const rows = tasks.map(t => {
    const description = t.notes
      ? `${t.description}\n\nNotes: ${t.notes}`
      : t.description
    return [
      csvCell(t.title),
      csvCell(description),
      csvCell(PRIORITY_MAP[t.priority] ?? 'Medium'),
      csvCell('Story'),
      csvCell(t.feature_area),
    ].join(',')
  })
  return [headers.join(','), ...rows].join('\n')
}

export function downloadCSV(filename, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function toSlug(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function randomSuffix() {
  return Math.random().toString(36).slice(2, 6)
}

export function toTaskId(title) {
  return `${toSlug(title)}-${randomSuffix()}`
}

export function now() {
  return new Date().toISOString()
}
