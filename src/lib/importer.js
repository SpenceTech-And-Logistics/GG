/** Small CSV and JSON reader for the dashboard's "Import from file". */

export function parseCSV(text) {
  const rows = []
  let row = []
  let cell = ''
  let quoted = false
  const src = text.replace(/^\uFEFF/, '')
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') {
        cell += '"'
        i++
      } else if (c === '"') quoted = false
      else cell += c
    } else if (c === '"') quoted = true
    else if (c === ',') {
      row.push(cell)
      cell = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++
      row.push(cell)
      cell = ''
      if (row.some((v) => v.trim() !== '')) rows.push(row)
      row = []
    } else cell += c
  }
  row.push(cell)
  if (row.some((v) => v.trim() !== '')) rows.push(row)
  if (!rows.length) return []
  const head = rows[0].map((h) => h.trim().toLowerCase())
  return rows.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? '').trim()])))
}

export async function readRecords(file) {
  const text = await file.text()
  if (/\.json$/i.test(file.name)) {
    const data = JSON.parse(text)
    const arr = Array.isArray(data) ? data : data.items || []
    return arr.map((o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k.toLowerCase(), v])))
  }
  if (/\.xlsx?$/i.test(file.name)) throw new Error('Please save the spreadsheet as CSV first (File, Save as, CSV), then import that.')
  return parseCSV(text)
}

export function csvTemplate(columns, example) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  return [columns.join(','), example.map(esc).join(',')].join('\n')
}

export function saveText(filename, text, type = 'text/csv') {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
