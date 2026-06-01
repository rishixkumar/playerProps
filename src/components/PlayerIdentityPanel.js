import { useState } from 'react';
import './PlayerIdentityPanel.css';

function initials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function PlayerIdentityPanel({ profile, highlights, newsHeadline }) {
  const {
    displayName,
    age,
    teamAbbr,
    teamName,
    position,
    jersey,
    status,
    statusDetail,
    headshotHref,
    birthPlace,
  } = profile;

  const [imgFailed, setImgFailed] = useState(false);
  const showPhoto = headshotHref && !imgFailed;

  return (
    <aside className="identity-panel identity-panel--strip" aria-labelledby="player-name">
      <div className="identity-panel__avatar-wrap">
        {showPhoto ? (
          <img
            src={headshotHref}
            alt=""
            className="identity-panel__avatar identity-panel__avatar--img"
            width={200}
            height={200}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="identity-panel__avatar" aria-hidden>
            {initials(displayName)}
          </div>
        )}
      </div>
      <div className="identity-panel__body">
        <h1 id="player-name" className="identity-panel__name">
          {displayName}
        </h1>
        <div className="identity-panel__meta">
          <span>Age {age}</span>
          <span className="identity-panel__meta-sep">·</span>
          <span>
            #{jersey} {position}
          </span>
          <span className="identity-panel__meta-sep">·</span>
          <span title={teamName}>{teamAbbr}</span>
          {birthPlace && (
            <>
              <span className="identity-panel__meta-sep">·</span>
              <span title={birthPlace}>{birthPlace}</span>
            </>
          )}
          <span
            className={`identity-panel__chip${status === 'Active' ? '' : ' identity-panel__chip--muted'}`}
            title={statusDetail}
          >
            {status}
          </span>
        </div>
        {newsHeadline && (
          <p className="identity-panel__news" title="Latest from ESPN overview">
            {newsHeadline}
          </p>
        )}

        <div className="identity-panel__kpis">
          {highlights.map((h) => (
            <div key={h.label} className="identity-panel__kpi">
              <span className="identity-panel__kpi-label">{h.label}</span>
              <span className="identity-panel__kpi-value tabular-nums">{h.value}</span>
              {h.sub && <span className="identity-panel__kpi-sub">{h.sub}</span>}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
