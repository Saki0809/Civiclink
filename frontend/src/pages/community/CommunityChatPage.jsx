import { useLocation } from 'react-router-dom';
import { MyCommunityPage } from './MyCommunityPage';
import './CommunityChat.css';

/**
 * CommunityChatPage serves as the main entry point for the Community Hub.
 * It detects the current domain from the URL and passes it to MyCommunityPage
 * so each domain gets its own distinct community hub experience.
 */
export function CommunityChatPage() {
  const location = useLocation();

  const getDomain = () => {
    const path = location.pathname;
    if (path.startsWith('/healthcare')) return 'healthcare';
    if (path.startsWith('/municipal')) return 'municipal';
    if (path.startsWith('/education')) return 'education';
    return 'civilian';
  };

  return (
    <div className="community-chat-page unified-hub">
      <div className="community-tab-wrapper">
        <MyCommunityPage activeDomain={getDomain()} />
      </div>
    </div>
  );
}

export default CommunityChatPage;
