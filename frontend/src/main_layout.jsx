import { useState } from "react";
import Sidebar from "./components/sidebar.jsx";

export default function MainLayout({
  children,
  onNewChat,
  historyList,
  activeHistoryId,
  onSelectHistory,
  hideSidebar = false,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  function toggleSidebar() {
    setIsSidebarOpen((prev) => !prev);
  }

  function handleNewChat() {
    if (onNewChat) onNewChat();
  }

  function handleSelectHistory(item) {
    if (onSelectHistory) onSelectHistory(item);
  }

  return (
    <div
      className={`main-layout-wrapper ${
        hideSidebar
          ? "no-sidebar"
          : isSidebarOpen
          ? "sidebar-open"
          : "sidebar-collapsed"
      }`}
    >
      {!hideSidebar && (
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
          onNewChat={handleNewChat}
          historyList={historyList}
          activeHistoryId={activeHistoryId}
          onSelectHistory={handleSelectHistory}
        />
      )}

      <div className="layout-content-container">{children}</div>
    </div>
  );
}
