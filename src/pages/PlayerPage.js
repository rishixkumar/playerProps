import { useParams } from 'react-router-dom';
import { getMockPlayer } from '../mock/player';
import { PlayerIdentityPanel } from '../components/PlayerIdentityPanel';
import { StatQueryBar } from '../components/StatQueryBar';
import { ComparisonSection } from '../components/ComparisonSection';
import { SubViewTabs } from '../components/SubViewTabs';
import './PlayerPage.css';

export function PlayerPage() {
  const { id } = useParams();
  const data = getMockPlayer(id);

  return (
    <div className="player-page">
      <div className="player-page__grid">
        <PlayerIdentityPanel profile={data.profile} highlights={data.highlights} />
        <div className="player-page__main">
          <StatQueryBar />
          <ComparisonSection items={data.comparison} />
          <SubViewTabs
            seasons={data.seasons}
            games={data.games}
            matchups={data.matchups}
          />
        </div>
      </div>
    </div>
  );
}
