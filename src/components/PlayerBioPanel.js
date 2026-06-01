import './PlayerBioPanel.css';

export function PlayerBioPanel({ sportsdb }) {
  if (!sportsdb?.description) return null;
  const text = sportsdb.description.replace(/\r\n/g, '\n').trim();
  const preview = text.length > 720 ? `${text.slice(0, 720)}…` : text;

  return (
    <section className="player-bio player-page__panel" aria-labelledby="bio-heading">
      <h2 id="bio-heading" className="player-page__panel-title">
        Bio
      </h2>
      <p className="player-bio__source">TheSportsDB · encyclopedia-style summary (matched by ESPN id when possible)</p>
      <div className="player-bio__body">{preview}</div>
    </section>
  );
}
