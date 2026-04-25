'use client';

import { useLanguage } from '@/context/LanguageContext';

export interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

function groupByDate(conversations: Conversation[], t: (key: any) => string) {
  const now = new Date();
  const todayStr = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const groups: { label: string; items: Conversation[] }[] = [];
  const todayItems: Conversation[] = [];
  const yesterdayItems: Conversation[] = [];
  const olderItems: Conversation[] = [];

  for (const c of conversations) {
    const d = new Date(c.updated_at).toDateString();
    if (d === todayStr) todayItems.push(c);
    else if (d === yesterdayStr) yesterdayItems.push(c);
    else olderItems.push(c);
  }

  if (todayItems.length) groups.push({ label: t('today'), items: todayItems });
  if (yesterdayItems.length) groups.push({ label: t('yesterday'), items: yesterdayItems });
  if (olderItems.length) groups.push({ label: t('older'), items: olderItems });

  return groups;
}

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  isOpen,
  onClose,
}: SidebarProps) {
  const { t } = useLanguage();
  const groups = groupByDate(conversations, t);

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">{t('appName')}</div>
          <button onClick={onNew} className="btn btn-primary btn-block btn-small">
            {t('newChat')}
          </button>
        </div>

        <div className="sidebar-list">
          {conversations.length === 0 ? (
            <div className="sidebar-empty">{t('noChats')}</div>
          ) : (
            groups.map((group) => (
              <div key={group.label}>
                <div className="sidebar-group-label">{group.label}</div>
                {group.items.map((c) => (
                  <div
                    key={c.id}
                    className={`sidebar-item ${activeId === c.id ? 'active' : ''}`}
                    onClick={() => {
                      onSelect(c.id);
                      onClose();
                    }}
                  >
                    <span className="sidebar-item-title">
                      {c.title || t('untitled')}
                    </span>
                    <button
                      className="sidebar-item-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(c.id);
                      }}
                      aria-label={t('deleteChat')}
                      title={t('deleteChat')}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <div className="text-soft text-center">{t('chatHistory')}</div>
        </div>
      </aside>
    </>
  );
}
