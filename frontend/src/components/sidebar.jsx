import { IconMenu, IconEdit } from "./icons.jsx";

export default function Sidebar({
  isOpen,
  onToggle,
  onNewChat,
  historyList = [],
  activeHistoryId,
  onSelectHistory,
}) {
  const displayHistory = historyList || [];

  return (
    <aside
      className={`pantry-sidebar ${isOpen ? "open" : "collapsed"}`}
      aria-label="Sidebar navigation"
    >
      {/* Top Nav Section */}
      <div className="sidebar-top-section">
        {/* Row 1: Hamburger Icon + Red Logo Text */}
        <div className="sidebar-nav-row">
          <button
            className="sidebar-icon-btn"
            onClick={onToggle}
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            <IconMenu size={18} />
          </button>
          <span className="sidebar-brand-title" onClick={onToggle}>
            Pantry2Plate
          </span>
        </div>

        {/* Row 2: Full-width New Chat Button */}
        <button
          className="sidebar-new-chat-btn"
          onClick={onNewChat}
          aria-label="New Chat"
          title="New Chat"
        >
          <span className="new-chat-icon">
            <IconEdit size={16} />
          </span>
          <span className="new-chat-text">New Chat</span>
        </button>
      </div>

      {/* History Section (only shown when recent search items exist) */}
      {displayHistory.length > 0 && (
        <div className="sidebar-history-section">
          <h2 className="history-title">Recent</h2>
          <div className="history-list">
            {displayHistory.map((item) => (
              <button
                key={item.id || item.title}
                className={`history-item ${activeHistoryId === item.id ? "active" : ""}`}
                onClick={() => onSelectHistory && onSelectHistory(item)}
              >
                <span className="history-item-text">{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
