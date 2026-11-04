import { Reveal } from './Reveal.jsx'

const ksh = (n) => (n ? Number(n).toLocaleString('en-KE') : '–')

/**
 * Funding by category and financial year, from rows like { category: 'Secondary', year: '2022/23', amount: 22000000 }.
 * Shows categories down the side, years across the top, with totals.
 */
export default function FundingTable({ rows, caption = 'Allocations by financial year (KES)' }) {
  const list = (rows || []).filter((r) => r.category && r.year && Number(r.amount))
  if (!list.length) return null
  const years = [...new Set(list.map((r) => String(r.year).trim()))].sort()
  const cats = [...new Set(list.map((r) => String(r.category).trim()))]
  const cell = (c, y) => list.filter((r) => String(r.category).trim() === c && String(r.year).trim() === y).reduce((n, r) => n + Number(r.amount), 0)
  const rowTotal = (c) => years.reduce((n, y) => n + cell(c, y), 0)
  const colTotal = (y) => cats.reduce((n, c) => n + cell(c, y), 0)
  const grand = years.reduce((n, y) => n + colTotal(y), 0)

  return (
    <Reveal className="table-wrap funding">
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            {years.map((y) => <th scope="col" key={y} className="num">FY {y}</th>)}
            <th scope="col" className="num">Total</th>
          </tr>
        </thead>
        <tbody>
          {cats.map((c) => (
            <tr key={c}>
              <th scope="row">{c}</th>
              {years.map((y) => <td key={y} className="num">{ksh(cell(c, y))}</td>)}
              <td className="num"><b>{ksh(rowTotal(c))}</b></td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">Total</th>
            {years.map((y) => <td key={y} className="num">{ksh(colTotal(y))}</td>)}
            <td className="num"><b>{ksh(grand)}</b></td>
          </tr>
        </tfoot>
      </table>
    </Reveal>
  )
}
