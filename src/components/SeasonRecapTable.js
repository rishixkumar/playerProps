import { Sparkline } from './Sparkline';
import './SeasonRecapTable.css';

/** @param {{ seasons?: any[], seasonRecap?: { categoryName: string|null, columns: {key:string,label:string}[], rows: {year:number, values:string[], trend:number[]}[] }|null }} props */
export function SeasonRecapTable({ seasons, seasonRecap }) {
  if (seasonRecap?.columns?.length && seasonRecap?.rows?.length) {
    const { categoryName, columns, rows } = seasonRecap;
    const sorted = [...rows].sort((a, b) => a.year - b.year);
    return (
      <div>
        <h2 className="player-page__panel-title">
          Season totals (reg){categoryName ? ` · ${categoryName}` : ''}
        </h2>
        <p className="season-recap__note">
          Columns mirror ESPN&apos;s stat table for this position group. Sparkline is a relative
          trend derived from season yardage (visual aid, not a second data source).
        </p>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Season</th>
                {columns.map((c) => (
                  <th key={c.key} scope="col">
                    {c.label}
                  </th>
                ))}
                <th scope="col">Trend</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={row.year}>
                  <td>{row.year}</td>
                  {row.values.map((v, i) => (
                    <td key={columns[i].key} className="tabular-nums">
                      {v}
                    </td>
                  ))}
                  <td>
                    <Sparkline values={row.trend} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const sorted = [...(seasons || [])].sort((a, b) => a.year - b.year);

  return (
    <div>
      <h2 className="player-page__panel-title">Season totals (reg)</h2>
      <p className="season-recap__note">
        Same column layout each year for quick comparison. Sparkline = relative form trend
        (mock series).
      </p>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Season</th>
              <th scope="col">GP</th>
              <th scope="col">Cmp</th>
              <th scope="col">Att</th>
              <th scope="col">Yds</th>
              <th scope="col">TD</th>
              <th scope="col">INT</th>
              <th scope="col">Rate</th>
              <th scope="col">Trend</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => (
              <tr key={s.year}>
                <td>{s.year}</td>
                <td className="tabular-nums">{s.gp}</td>
                <td className="tabular-nums">{s.cmp}</td>
                <td className="tabular-nums">{s.att}</td>
                <td className="tabular-nums">{s.yds.toLocaleString()}</td>
                <td className="tabular-nums">{s.td}</td>
                <td className="tabular-nums">{s.int}</td>
                <td className="tabular-nums">{s.rating.toFixed(1)}</td>
                <td>
                  <Sparkline values={s.trend} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
