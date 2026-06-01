import { Sparkline } from './Sparkline';
import './SeasonRecapTable.css';

export function SeasonRecapTable({ seasons }) {
  const sorted = [...seasons].sort((a, b) => a.year - b.year);

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
