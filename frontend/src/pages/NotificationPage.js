import React from 'react';

const TYPE_ICONS = {
  APPLY_RECEIVED: '🙋',
  APPLY_APPROVED: '🎉',
  INQUIRY_RECEIVED: '📨',
  INQUIRY_ANSWERED: '💬',
};

export default function NotificationPage({
  notifications,
  markAllNotificationsRead,
  markNotificationRead,
  onBack,
}) {
  return (
    <div className="flex-1 pb-20">
      <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <button onClick={onBack} className="text-lg">←</button>
          <h1 className="text-md font-bold">알림</h1>
        </div>
        {notifications.length > 0 && (
          <button onClick={markAllNotificationsRead} className="text-xs text-blue-500 font-semibold">
            모두 읽음
          </button>
        )}
      </div>
      <div className="p-4 space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400">알림이 없습니다.</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && markNotificationRead(n.id)}
              className={`p-4 rounded-xl border flex space-x-3 cursor-pointer ${
                n.read ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-200'
              }`}
            >
              <span className="text-lg">{TYPE_ICONS[n.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800">{n.message}</p>
                <p className="text-[11px] text-gray-400 mt-1">
                  {n.createdAt ? new Date(n.createdAt).toLocaleString('ko-KR') : ''}
                </p>
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
