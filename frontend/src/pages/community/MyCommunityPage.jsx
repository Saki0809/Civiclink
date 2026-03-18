import { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { usePreferences } from '../../core/preferences/PreferencesContext';
import {
  Users, Plus, Search, Send, Image, X, Settings, Shield, Crown,
  MessageCircle, Bell, Hash, ChevronLeft, MoreHorizontal,
  Home as HomeIcon, UserPlus, LogOut, Lock, Globe, MapPin,
  ThumbsUp, Pin, AlertCircle, CheckCircle, Megaphone, Calendar,
  Heart, Building2, GraduationCap, Phone, Mail, ExternalLink, Share2
} from 'lucide-react';
import './MyCommunity.css';

// Dummy community groups
const initialGroups = [
  {
    id: 1,
    name: 'Skyline Towers Residents',
    type: 'gated',
    description: 'Official group for Skyline Towers gated community residents. Discuss maintenance, events, and neighborhood news.',
    members: 156,
    icon: '🏢',
    color: '#6366f1',
    isJoined: true,
    isAdmin: true,
    location: 'Hitech City, Hyderabad',
    channels: [
      { id: 'general', name: 'General', icon: Hash, unread: 3 },
      { id: 'announcements', name: 'Announcements', icon: Megaphone, unread: 1 },
      { id: 'maintenance', name: 'Maintenance', icon: Settings, unread: 0 },
      { id: 'events', name: 'Events', icon: Calendar, unread: 2 },
    ]
  },
  {
    id: 2,
    name: 'Green Valley Colony',
    type: 'gated',
    description: 'Green Valley Colony residents — share updates, coordinate events, and stay connected with your neighbors.',
    members: 89,
    icon: '🌳',
    color: '#22c55e',
    isJoined: true,
    isAdmin: false,
    location: 'Gachibowli, Hyderabad',
    channels: [
      { id: 'general', name: 'General', icon: Hash, unread: 5 },
      { id: 'announcements', name: 'Announcements', icon: Megaphone, unread: 0 },
      { id: 'security', name: 'Security', icon: Shield, unread: 1 },
    ]
  },
  {
    id: 3,
    name: 'Sunrise Apartments',
    type: 'apartment',
    description: 'For all Sunrise Apartment owners and tenants. Building maintenance, parking, and water supply discussions.',
    members: 64,
    icon: '🌅',
    color: '#f59e0b',
    isJoined: false,
    isAdmin: false,
    location: 'Kondapur, Hyderabad',
    channels: [
      { id: 'general', name: 'General', icon: Hash, unread: 0 },
    ]
  },
  {
    id: 4,
    name: 'Lake View Villas',
    type: 'villa',
    description: 'Lake View Villas community. Discuss gardening, pool schedules, security, and community events.',
    members: 42,
    icon: '🏡',
    color: '#0ea5e9',
    isJoined: false,
    isAdmin: false,
    location: 'Jubilee Hills, Hyderabad',
    channels: [
      { id: 'general', name: 'General', icon: Hash, unread: 0 },
    ]
  }
];

// Dummy messages for the active channel
const generateMessages = (channelId, groupName) => {
  const messagesByChannel = {
    general: [
      { id: 1, user: { name: 'Rajesh Kumar', avatar: 'RK', role: 'admin' }, content: `Welcome to ${groupName}! Please keep conversations respectful and relevant. 🙏`, time: '9:00 AM', date: 'Today', pinned: true, likes: 12 },
      { id: 2, user: { name: 'Priya Sharma', avatar: 'PS', role: 'member' }, content: 'Good morning everyone! Has anyone noticed the water pressure issue this morning?', time: '9:15 AM', date: 'Today', likes: 3 },
      { id: 3, user: { name: 'Amit Patel', avatar: 'AP', role: 'member' }, content: 'Yes! Our block (B-wing) had low pressure since 7 AM. I think they\'re doing maintenance.', time: '9:18 AM', date: 'Today', likes: 5 },
      { id: 4, user: { name: 'Neha Gupta', avatar: 'NG', role: 'moderator' }, content: 'I called the maintenance office — they confirmed pipeline work on B-wing. Should be resolved by 11 AM. Will update everyone once it\'s fixed. ✅', time: '9:25 AM', date: 'Today', likes: 18 },
      { id: 5, user: { name: 'Suresh Yadav', avatar: 'SY', role: 'member' }, content: 'Thanks Neha! Really appreciate the quick update. 👏', time: '9:30 AM', date: 'Today', likes: 7 },
      { id: 6, user: { name: 'Kavita Reddy', avatar: 'KR', role: 'member' }, content: 'Reminder: Community yoga session at the clubhouse tomorrow morning 6:30 AM! Bring your own mat. 🧘‍♀️', time: '10:05 AM', date: 'Today', likes: 9 },
      { id: 7, user: { name: 'Vikram Singh', avatar: 'VS', role: 'member' }, content: 'Anyone interested in forming a weekend cricket team? We could use the community ground on Saturdays. 🏏', time: '10:45 AM', date: 'Today', likes: 14 },
    ],
    announcements: [
      { id: 1, user: { name: 'Rajesh Kumar', avatar: 'RK', role: 'admin' }, content: '📢 IMPORTANT: Annual General Meeting scheduled for March 15th, 2026 at 5 PM in the Community Hall. All residents are requested to attend. Agenda will be shared by end of this week.', time: '8:00 AM', date: 'Today', pinned: true, likes: 32 },
      { id: 2, user: { name: 'Neha Gupta', avatar: 'NG', role: 'moderator' }, content: '🔒 Security Update: New visitor management system will go live from March 5th. All visitors must be pre-registered through the community app. Guest passes will no longer be accepted at the gate.', time: '2:00 PM', date: 'Yesterday', likes: 24 },
    ],
    maintenance: [
      { id: 1, user: { name: 'Maintenance Team', avatar: 'MT', role: 'admin' }, content: '🔧 Scheduled elevator maintenance for Tower A on March 3rd, 10 AM - 2 PM. Please use the service elevator during this time.', time: '11:00 AM', date: 'Yesterday', likes: 8 },
      { id: 2, user: { name: 'Deepak Joshi', avatar: 'DJ', role: 'member' }, content: 'The gym treadmill #3 is making a strange noise. Can someone from maintenance check it?', time: '3:00 PM', date: 'Yesterday', likes: 2 },
    ],
    events: [
      { id: 1, user: { name: 'Kavita Reddy', avatar: 'KR', role: 'member' }, content: '🎉 Holi Celebration this Saturday! We\'re organizing a community Holi party at the pool area. Colors, music, and snacks will be arranged. Contribution: ₹200 per family. Sign up at the security desk.', time: '9:00 AM', date: 'Today', pinned: true, likes: 45 },
      { id: 2, user: { name: 'Amit Patel', avatar: 'AP', role: 'member' }, content: '🎂 Kids birthday party zone available for booking on weekends. Contact the management office to reserve. They\'ve added new decorations!', time: '11:30 AM', date: 'Yesterday', likes: 6 },
    ],
    security: [
      { id: 1, user: { name: 'Security Head', avatar: 'SH', role: 'admin' }, content: '⚠️ Reminder: Please ensure your vehicles are parked in designated spots only. Towing will be enforced for violations starting this week.', time: '7:00 AM', date: 'Today', pinned: true, likes: 15 },
    ],
  };
  return messagesByChannel[channelId] || messagesByChannel.general;
};

const membersList = [
  { name: 'Rajesh Kumar', avatar: 'RK', role: 'admin', status: 'online', flat: 'A-101' },
  { name: 'Neha Gupta', avatar: 'NG', role: 'moderator', status: 'online', flat: 'B-205' },
  { name: 'Priya Sharma', avatar: 'PS', role: 'member', status: 'online', flat: 'A-302' },
  { name: 'Amit Patel', avatar: 'AP', role: 'member', status: 'away', flat: 'C-102' },
  { name: 'Suresh Yadav', avatar: 'SY', role: 'member', status: 'offline', flat: 'B-401' },
  { name: 'Kavita Reddy', avatar: 'KR', role: 'member', status: 'online', flat: 'A-504' },
  { name: 'Vikram Singh', avatar: 'VS', role: 'member', status: 'offline', flat: 'D-303' },
  { name: 'Deepak Joshi', avatar: 'DJ', role: 'member', status: 'away', flat: 'C-201' },
];

// Global Feed Categories & Config
const domainConfig = {
  all: { label: 'All Updates', icon: Megaphone, color: '#6366f1' },
  healthcare: { label: 'Healthcare', icon: Heart, color: '#e11d48' },
  municipal: { label: 'Municipal', icon: Building2, color: '#0891b2' },
  education: { label: 'Education', icon: GraduationCap, color: '#9333ea' },
  civilian: { label: 'Neighborhood', icon: Users, color: '#22c55e' },
};

const categoryConfig = {
  general: { label: 'General', color: '#64748b' },
  announcement: { label: 'Announcement', color: '#f59e0b' },
  event: { label: 'Event', color: '#10b981' },
  job: { label: 'Job Posting', color: '#3b82f6' },
  scholarship: { label: 'Scholarship', color: '#8b5cf6' },
};

// Global Feed Posts
const initialGlobalPosts = [
  {
    id: 'g1',
    author: { name: 'City Hospital', role: 'hospital_admin', avatar: 'CH', verified: true },
    domain: 'healthcare',
    category: 'event',
    content: '🏥 Free Health Checkup Camp this Sunday!\n\nLocation: Community Hall, Sector 15\n🗓️ Date: Feb 10, 2026\n⏰ Time: 9 AM - 4 PM',
    images: ['https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600'],
    likes: 45,
    shares: 28,
    createdAt: '2026-02-04T10:30:00',
    liked: false,
    contact: { phone: '1800-XXX-XXXX', email: 'camps@cityhospital.org' }
  },
  {
    id: 'g2',
    author: { name: 'Municipal Corp', role: 'municipal_officer', avatar: 'MC', verified: true },
    domain: 'municipal',
    category: 'announcement',
    content: '📢 Water Supply Maintenance: Sector 10-15 will be affected on Feb 8, 8 AM - 2 PM.',
    images: [],
    likes: 23,
    shares: 67,
    createdAt: '2026-02-03T16:45:00',
    liked: false,
    contact: { phone: '1916' }
  }
];

export function MyCommunityPage({ activeDomain = 'civilian' }) {
  const { user } = useAuth();
  const { t } = usePreferences();
  const [groups] = useState(initialGroups);
  const [activeGroup, setActiveGroup] = useState(initialGroups[0]);
  const [activeChannel, setActiveChannel] = useState('general');
  const [viewMode, setViewMode] = useState(activeDomain !== 'civilian' ? 'feed' : 'home'); // 'home' | 'chat' | 'feed'
  const [activeFilter, setActiveFilter] = useState(activeDomain !== 'civilian' ? activeDomain : 'all');
  const [messages, setMessages] = useState([]);
  const [globalPosts, setGlobalPosts] = useState(initialGlobalPosts);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showToolkit, setShowToolkit] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupData, setNewGroupData] = useState({ name: '', description: '', type: 'gated', location: '' });
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const joinedGroups = filteredGroups.filter(g => g.isJoined);
  const discoverGroups = filteredGroups.filter(g => !g.isJoined);

  // Aggregated feed data for "Home" (Joined Groups Activity)
  const communityFeed = useMemo(() => {
    const feed = [];
    // Recalculate joinedGroups inside to avoid it being a direct dependency that changes every render
    const currentJoined = groups.filter(g =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) && g.isJoined
    );
    
    currentJoined.forEach(group => {
      const gAnnouncements = generateMessages('announcements', group.name).map(m => ({ 
        ...m, 
        group, 
        type: 'announcement', 
        source: 'group',
        timestamp: m.date === 'Today' ? new Date() : new Date(Date.now() - 86400000)
      }));
      const gEvents = generateMessages('events', group.name).map(m => ({ 
        ...m, 
        group, 
        type: 'event', 
        source: 'group',
        timestamp: m.date === 'Today' ? new Date() : new Date(Date.now() - 86400000)
      }));
      feed.push(...gAnnouncements, ...gEvents);
    });
    return feed.sort((a, b) => b.id - a.id);
  }, [groups, searchTerm]);

  // Combined Global + Local feed for a "Smart Home"
  const smartHomeFeed = useMemo(() => {
    const combined = [
      ...communityFeed.map(item => ({ ...item, isGlobal: false })),
      ...globalPosts.map(post => ({
        ...post,
        isGlobal: true,
        group: { 
          name: domainConfig[post.domain]?.label || post.domain, 
          color: domainConfig[post.domain]?.color || '#64748b', 
          icon: '🌐' 
        },
        type: post.category,
        timestamp: new Date(post.createdAt)
      }))
    ];
    return combined.sort((a, b) => b.timestamp - a.timestamp);
  }, [communityFeed, globalPosts]);

  useEffect(() => {
    setMessages(generateMessages(activeChannel, activeGroup.name));
  }, [activeChannel, activeGroup]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const msg = {
      id: Date.now(),
      user: { name: user?.full_name || 'You', avatar: (user?.full_name?.charAt(0) || 'U'), role: activeGroup.isAdmin ? 'admin' : 'member' },
      content: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
      likes: 0,
      isMe: true,
    };
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
    inputRef.current?.focus();
  };

  const handleLikeMessage = (msgId) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, likes: m.likes + 1 } : m));
  };

  const handleCreateGroup = () => {
    if (!newGroupData.name.trim()) return;
    setShowCreateGroup(false);
    setNewGroupData({ name: '', description: '', type: 'gated', location: '' });
  };

  const handleGroupSelect = (group) => {
    setActiveGroup(group);
    setActiveChannel(group.channels[0]?.id || 'general');
  };

  const roleIcons = {
    admin: Crown,
    moderator: Shield,
    member: Users,
  };

  const roleColors = {
    admin: '#f59e0b',
    moderator: '#6366f1',
    member: '#64748b',
  };

  const statusColors = {
    online: '#22c55e',
    away: '#f59e0b',
    offline: '#94a3b8',
  };

  return (
    <div className="my-community-page">
      {/* Sidebar: Groups & Channels */}
      <aside className="community-sidebar">
        <div className="cs-header">
          <h2>🏘️ {t('myCommunity')}</h2>
          <button className="cs-btn" onClick={() => setShowCreateGroup(true)} title={t('createGroup')}>
            <Plus size={18} />
          </button>
        </div>

        <div className="cs-view-toggle">
          <button 
            className={`cv-btn ${viewMode === 'home' ? 'active' : ''}`}
            onClick={() => setViewMode('home')}
          >
            <HomeIcon size={16} /> Hub
          </button>
          <button 
            className={`cv-btn ${viewMode === 'feed' ? 'active' : ''}`}
            onClick={() => setViewMode('feed')}
          >
            <Globe size={16} /> Global
          </button>
        </div>

        <div className="cs-search">
          <Search size={16} />
          <input
            type="text"
            placeholder={t('searchCommunities')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Global Topics (From Feed) */}
        <div className="cs-section">
          <h4 className="cs-section-title">Neighborhood Feed</h4>
          {Object.entries(domainConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <div 
                key={key} 
                className={`cs-group ${viewMode === 'feed' && activeFilter === key ? 'active' : ''}`}
                onClick={() => {
                  setActiveFilter(key);
                  setViewMode('feed');
                }}
              >
                <span className="cs-group-icon" style={{ background: `${config.color}15`, color: config.color }}>
                  <Icon size={18} />
                </span>
                <div className="cs-group-info">
                  <span className="cs-group-name">{config.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Joined Groups */}
        <div className="cs-section">
          <h4 className="cs-section-title">{t('yourCommunities')}</h4>
          {joinedGroups.length > 0 ? (
            joinedGroups.map(group => (
              <div key={group.id} className="cs-group-block">
                <div
                  className={`cs-group ${activeGroup?.id === group.id && viewMode === 'chat' ? 'active' : ''}`}
                  onClick={() => {
                    handleGroupSelect(group);
                    setViewMode('chat');
                  }}
                >
                  <span className="cs-group-icon" style={{ background: `${group.color}20`, color: group.color }}>{group.icon}</span>
                  <div className="cs-group-info">
                    <span className="cs-group-name">{group.name}</span>
                    <span className="cs-group-meta">{group.members} {t('members')}</span>
                  </div>
                  {group.isAdmin && <Crown size={14} className="admin-crown" />}
                </div>

                {/* Channels under active group */}
                {activeGroup?.id === group.id && viewMode === 'chat' && (
                  <div className="cs-channels">
                    {group.channels.map(ch => {
                      const ChIcon = ch.icon;
                      return (
                        <button
                          key={ch.id}
                          className={`cs-channel ${activeChannel === ch.id ? 'active' : ''}`}
                          onClick={() => setActiveChannel(ch.id)}
                        >
                          <ChIcon size={14} />
                          <span>{ch.name}</span>
                          {ch.unread > 0 && <span className="cs-unread">{ch.unread}</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="cs-empty">{t('noResults') || 'No communities joined yet'}</p>
          )}
        </div>

        {/* Discover Groups */}
        <div className="cs-section">
          <h4 className="cs-section-title">{t('discover')}</h4>
          {discoverGroups.map(group => (
            <div
              key={group.id}
              className="cs-group discover"
              onClick={() => handleGroupSelect(group)}
            >
              <span className="cs-group-icon" style={{ background: `${group.color}20`, color: group.color }}>{group.icon}</span>
              <div className="cs-group-info">
                <span className="cs-group-name">{group.name}</span>
                <span className="cs-group-meta">{group.members} {t('members')}</span>
              </div>
              <button className="cs-join-btn" onClick={(e) => { e.stopPropagation(); }}>{t('join')}</button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="community-main">
        {/* Channel Header */}
        {/* Header content depends on viewMode */}
        <div className="cm-header">
          {viewMode === 'home' ? (
            <div className="cm-header-left">
              <div className="cm-home-icon"><HomeIcon size={20} /></div>
              <div>
                <h3>{activeDomain !== 'civilian' 
                    ? `${domainConfig[activeDomain]?.label || 'Community'} Hub` 
                    : 'Neighborhood Hub'}</h3>
                <span className="cm-channel-name">Your smart community overview</span>
              </div>
            </div>
          ) : viewMode === 'feed' && domainConfig[activeFilter] ? (
            <div className="cm-header-left">
              <div className="cm-home-icon" style={{ background: `${domainConfig[activeFilter].color}15`, color: domainConfig[activeFilter].color }}>
                {(() => { 
                  const Icon = domainConfig[activeFilter].icon || Megaphone; 
                  return <Icon size={20} />; 
                })()}
              </div>
              <div>
                <h3>{domainConfig[activeFilter].label}</h3>
                <span className="cm-channel-name">Global updates and announcements</span>
              </div>
            </div>
          ) : (
            <div className="cm-header-left">
              <span className="cm-group-icon" style={{ background: activeGroup.color }}>{activeGroup.icon}</span>
              <div>
                <h3>{activeGroup.name}</h3>
                <span className="cm-channel-name">
                  # {activeGroup.channels.find(c => c.id === activeChannel)?.name || 'General'}
                  <span className="cm-member-count">{activeGroup.members} {t('members')}</span>
                </span>
              </div>
            </div>
          )}
          <div className="cm-header-actions">
            <button className={`cm-action-btn ${showToolkit ? 'active' : ''}`} onClick={() => setShowToolkit(!showToolkit)} title="Toolkit">
              <Shield size={18} />
            </button>
            <button className="cm-action-btn" title={t('notifications')}>
              <Bell size={18} />
            </button>
            <button className="cm-action-btn" title={t('settings')}>
              <Settings size={18} />
            </button>
          </div>
        </div>

        <div className="cm-body">
          {viewMode === 'home' && (
            <div className="cm-home-feed">
              <div className="feed-header">
                <h3>Smart Hub Activity</h3>
                <div className="feed-filters">
                  <span className="active">Personalized for you</span>
                </div>
              </div>
              <div className="feed-list">
                {smartHomeFeed.map(item => (
                  <div key={`${item.isGlobal ? 'g' : 'l'}-${item.id}`} className={`feed-card ${item.type} ${item.isGlobal ? 'global-highlight' : ''}`}>
                    <div className="feed-card-header">
                      <span className="feed-group-tag" style={{ borderLeft: `3px solid ${item.group.color}` }}>
                        {item.isGlobal ? '🌐' : item.group.icon} {item.group.name}
                      </span>
                      <span className="feed-time">{item.time || new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="feed-card-content">
                      <div className="feed-type-icon" style={item.isGlobal ? { background: `${item.group.color}15`, color: item.group.color } : {}}>
                        {item.type === 'event' ? <Calendar size={18} /> : <Megaphone size={18} />}
                      </div>
                      <div className="feed-text-area">
                        {item.isGlobal && (
                          <div className="feed-global-author">
                            <strong>{item.author.name}</strong> 
                            {item.author.verified && <CheckCircle size={12} className="verified-icon" />}
                          </div>
                        )}
                        <p>{item.content}</p>
                        {item.isGlobal && item.images && item.images.length > 0 && (
                          <div className="feed-images">
                            <img src={item.images[0]} alt="Post content" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="feed-card-footer">
                      <button className="feed-action"><ThumbsUp size={14} /> {item.likes}</button>
                      <button className="feed-action"><MessageCircle size={14} /> Discuss</button>
                      {item.isGlobal && <button className="feed-action"><Share2 size={14} /> Share</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'feed' && (
            <div className="cm-home-feed">
              <div className="feed-header">
                <h3>{domainConfig[activeFilter].label} Updates</h3>
                <div className="feed-filters">
                  <span className="active">Recent Global Posts</span>
                </div>
              </div>
              <div className="feed-list">
                {globalPosts
                  .filter(post => activeFilter === 'all' || post.domain === activeFilter)
                  .map(post => (
                    <div key={post.id} className="feed-card global">
                      <div className="feed-card-header">
                        <span className="feed-group-tag" style={{ color: domainConfig[post.domain].color }}>
                           {domainConfig[post.domain].label}
                        </span>
                        <span className="feed-time">{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="feed-card-content">
                        <div className="feed-author-avatar" style={{ background: domainConfig[post.domain].color }}>
                          {post.author.avatar}
                        </div>
                        <div className="feed-text-area">
                          <div className="feed-global-author">
                            <strong>{post.author.name}</strong> 
                            {post.author.verified && <CheckCircle size={12} className="verified-icon" />}
                          </div>
                          <p>{post.content}</p>
                          {post.images && post.images.length > 0 && (
                            <div className="feed-images">
                              <img src={post.images[0]} alt="Post media" />
                            </div>
                          )}
                          {post.contact && (
                            <div className="feed-contact-box">
                               {post.contact.phone && <span><Phone size={12} /> {post.contact.phone}</span>}
                               {post.contact.email && <span><Mail size={12} /> {post.contact.email}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="feed-card-footer">
                        <button className="feed-action"><ThumbsUp size={14} /> {post.likes}</button>
                        <button className="feed-action"><MessageCircle size={14} /> {post.shares} Comments</button>
                        <button className="feed-action"><ExternalLink size={14} /> View Details</button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {viewMode === 'chat' && (
            <div className="cm-messages">
              {/* Pinned messages */}
              {messages.filter(m => m.pinned).map(msg => (
                <div key={`pin-${msg.id}`} className="cm-pinned-notice">
                  <Pin size={12} />
                  <span>{t('pinnedBy')} {msg.user.name}: {msg.content.substring(0, 80)}...</span>
                </div>
              ))}

              <div className="cm-messages-list">
                {messages.map(msg => {
                  const RoleIcon = roleIcons[msg.user.role] || Users;
                  return (
                    <div key={msg.id} className={`cm-message ${msg.isMe ? 'me' : ''} ${msg.pinned ? 'pinned' : ''}`}>
                      <div className="cm-msg-avatar" style={{ background: roleColors[msg.user.role] || '#64748b' }}>
                        {msg.user.avatar}
                      </div>
                      <div className="cm-msg-content">
                        <div className="cm-msg-header">
                          <span className="cm-msg-author">
                            {msg.user.name}
                            <RoleIcon size={12} className="cm-role-icon" style={{ color: roleColors[msg.user.role] }} />
                          </span>
                          <span className="cm-msg-time">{msg.time}</span>
                        </div>
                        <p className="cm-msg-text">{msg.content}</p>
                        <div className="cm-msg-actions">
                          <button className="cm-msg-action-btn" onClick={() => handleLikeMessage(msg.id)}>
                            <ThumbsUp size={12} /> {msg.likes > 0 && msg.likes}
                          </button>
                          <button className="cm-msg-action-btn">
                            <MessageCircle size={12} /> {t('reply') || 'Reply'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Message Input */}
              <div className="cm-input-bar">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={`${t('message') || 'Message'} #${activeGroup.channels.find(c => c.id === activeChannel)?.name || 'general'}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  className="cm-send-btn"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          )}


          {/* Toolkit Panel (Replacing Members Panel) */}
          {showToolkit && (
            <aside className="cm-toolkit-panel">
              <div className="cm-toolkit-header">
                <h4>Community Toolkit</h4>
                <button className="cm-action-btn" onClick={() => setShowToolkit(false)}>
                  <X size={16} />
                </button>
              </div>

              <div className="toolkit-section">
                <h5>Quick Actions</h5>
                <div className="toolkit-grid">
                  <button className="toolkit-btn emergency">
                    <AlertCircle size={20} />
                    <span>Emergency Assist</span>
                  </button>
                  <button className="toolkit-btn maintenance">
                    <Settings size={20} />
                    <span>Raise Request</span>
                  </button>
                  <button className="toolkit-btn booking">
                    <Calendar size={20} />
                    <span>Book Facility</span>
                  </button>
                  <button className="toolkit-btn guest">
                    <UserPlus size={20} />
                    <span>Invites</span>
                  </button>
                </div>
              </div>

              <div className="toolkit-section">
                <h5>Announcements</h5>
                <div className="mini-feed">
                  {communityFeed.filter(f => f.type === 'announcement').slice(0, 2).map(f => (
                    <div key={f.id} className="mini-feed-item">
                      <div className="mini-item-dot" />
                      <p>{f.content.substring(0, 60)}...</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="toolkit-section">
                <h5>Members ({membersList.length})</h5>
                <div className="mini-members">
                  {membersList.slice(0, 5).map((m, i) => (
                    <div key={i} className="mini-member-avatar" style={{ background: roleColors[m.role], transform: `translateX(-${i * 8}px)` }} title={m.name}>
                      {m.avatar}
                    </div>
                  ))}
                  {membersList.length > 5 && <span className="mini-more">+{membersList.length - 5}</span>}
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="cg-modal-overlay" onClick={() => setShowCreateGroup(false)}>
          <div className="cg-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cg-modal-header">
              <h2>{t('createGroup')}</h2>
              <button onClick={() => setShowCreateGroup(false)}><X size={20} /></button>
            </div>
            <div className="cg-modal-body">
              <div className="cg-field">
                <label>Community Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Skyline Towers Residents"
                  value={newGroupData.name}
                  onChange={(e) => setNewGroupData(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="cg-field">
                <label>Description</label>
                <textarea
                  placeholder="What is this community about?"
                  value={newGroupData.description}
                  onChange={(e) => setNewGroupData(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="cg-field">
                <label>Location</label>
                <input
                  type="text"
                  placeholder="e.g., Hitech City, Hyderabad"
                  value={newGroupData.location}
                  onChange={(e) => setNewGroupData(p => ({ ...p, location: e.target.value }))}
                />
              </div>
              <div className="cg-field">
                <label>Community Type</label>
                <div className="cg-type-grid">
                  {[
                    { value: 'gated', label: 'Gated Community', icon: '🏘️' },
                    { value: 'apartment', label: 'Apartment', icon: '🏢' },
                    { value: 'villa', label: 'Villa Community', icon: '🏡' },
                    { value: 'neighborhood', label: 'Neighborhood', icon: '🏙️' },
                  ].map(type => (
                    <button
                      key={type.value}
                      className={`cg-type-card ${newGroupData.type === type.value ? 'active' : ''}`}
                      onClick={() => setNewGroupData(p => ({ ...p, type: type.value }))}
                    >
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="cg-modal-footer">
              <button className="cg-cancel" onClick={() => setShowCreateGroup(false)}>{t('cancel')}</button>
              <button className="cg-create" onClick={handleCreateGroup} disabled={!newGroupData.name.trim()}>
                <Plus size={16} /> {t('createGroup')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// export default MyCommunityPage;
