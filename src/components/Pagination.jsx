// ─── Reusable pagination + page-size control ──────────────────────────────────
// Used by Founder dashboard tables (orders, vendors, customers, user DB).
//
// Props:
//   page          (1-indexed current page)
//   pageSize      (rows per page)
//   total         (total number of rows after filtering)
//   onPageChange  (newPage) => void
//   onPageSizeChange (newSize) => void
//   pageSizeOptions  optional array, defaults to [10, 20, 50, 100]
//   compact       boolean — render in a tighter row (for mobile)

export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  compact = false,
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1
  const end = Math.min(total, safePage * pageSize)

  const go = (p) => onPageChange(Math.min(Math.max(1, p), totalPages))

  // Build a compact page list: 1 … (cur-1) cur (cur+1) … last
  const pageList = []
  const window = compact ? 1 : 2
  pageList.push(1)
  for (let p = safePage - window; p <= safePage + window; p += 1) {
    if (p > 1 && p < totalPages) pageList.push(p)
  }
  if (totalPages > 1) pageList.push(totalPages)
  // Dedup + sort
  const pages = [...new Set(pageList)].sort((a, b) => a - b)

  // Insert ellipsis markers
  const display = []
  for (let i = 0; i < pages.length; i += 1) {
    if (i > 0 && pages[i] - pages[i - 1] > 1) display.push('…')
    display.push(pages[i])
  }

  const btnBase = {
    minWidth: 32, height: 32,
    border: '1px solid #e5e7eb', borderRadius: 8,
    background: '#fff', color: '#374151',
    fontSize: 12, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
    padding: '0 10px',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  }
  const activeBtn = {
    ...btnBase,
    background: '#E24B4A', color: '#fff', borderColor: '#E24B4A',
    boxShadow: '0 2px 8px rgba(226,75,74,0.3)',
  }
  const disabled = {
    ...btnBase,
    opacity: 0.4, cursor: 'not-allowed',
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, flexWrap: 'wrap',
      padding: '12px 14px', borderTop: '1px solid #f3f4f6',
      background: '#fafafa', borderRadius: '0 0 12px 12px',
      fontFamily: 'Poppins, sans-serif',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: '#6b7280' }}>
          {total === 0
            ? 'No results'
            : <>Showing <b style={{ color: '#1f2937' }}>{start}-{end}</b> of <b style={{ color: '#1f2937' }}>{total}</b></>}
        </span>
        {onPageSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>Rows per page</span>
            <select
              value={pageSize}
              onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1) }}
              style={{
                fontSize: 12, padding: '5px 8px',
                borderRadius: 7, border: '1px solid #e5e7eb',
                background: '#fff', cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              {pageSizeOptions.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button
          onClick={() => go(1)}
          disabled={safePage === 1}
          style={safePage === 1 ? disabled : btnBase}
          title="First page"
        >«</button>
        <button
          onClick={() => go(safePage - 1)}
          disabled={safePage === 1}
          style={safePage === 1 ? disabled : btnBase}
          title="Previous"
        >‹</button>

        {display.map((p, i) => (
          p === '…'
            ? <span key={`e${i}`} style={{ padding: '0 6px', color: '#9ca3af', fontSize: 12 }}>…</span>
            : (
              <button
                key={p}
                onClick={() => go(p)}
                style={p === safePage ? activeBtn : btnBase}
              >{p}</button>
            )
        ))}

        <button
          onClick={() => go(safePage + 1)}
          disabled={safePage === totalPages}
          style={safePage === totalPages ? disabled : btnBase}
          title="Next"
        >›</button>
        <button
          onClick={() => go(totalPages)}
          disabled={safePage === totalPages}
          style={safePage === totalPages ? disabled : btnBase}
          title="Last page"
        >»</button>
      </div>
    </div>
  )
}
