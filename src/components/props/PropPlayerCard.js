import { PropLineRow } from './PropLineRow';

export function PropPlayerCard({ player, spotlight, onSlipChange }) {
  return (
    <div className={`pp-card${spotlight ? ' pp-card-spotlight' : ''}`}>
      <div className="pp-card-header" style={{ background: player.teamColor }}>
        <div className="pp-card-header-overlay" />
        {player.headshotUrl ? (
          <img
            className="pp-headshot"
            src={player.headshotUrl}
            alt={player.displayName}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="pp-headshot pp-headshot-placeholder">{player.displayName.charAt(0)}</div>
        )}
      </div>
      <div className="pp-card-body">
        <div className="pp-player-meta">
          <span className="pp-player-name">{player.displayName}</span>
          <div className="pp-player-badges">
            <span className="pp-badge pp-badge-pos">{player.position}</span>
            <span className="pp-badge pp-badge-team">{player.teamAbbr}</span>
          </div>
        </div>
        <div className="pp-props-list">
          {player.props.map((pr, i) => (
            <PropLineRow
              key={i}
              propLine={pr}
              playerId={player.espnId}
              onSlipChange={onSlipChange}
            />
          ))}
        </div>
        <div className="pp-powered-by">
          <span className="pp-powered-label">Lines from</span>
          {['PrizePicks', 'Underdog', 'Sleeper', 'Chalkboard']
            .filter((src) => player.props.some((pr) => pr.sources.some((s) => s.name === src)))
            .map((src) => (
              <span key={src} className="pp-source-badge">
                {src}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
}
