import React from "react";
import "./NotificationItem.css";

const NotificationItem = ({ notification, onRead, onDelete }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case "booking":
        return "📅";
      case "reminder":
        return "🔔";
      case "cancellation":
        return "❌";
      default:
        return "ℹ️";
    }
  };

  return (
    <div
      className={`notification-item ${notification.isRead ? "read" : "unread"}`}
    >
      <div className="notification-icon">{getTypeIcon(notification.type)}</div>
      <div className="notification-content">
        <h4>{notification.title}</h4>
        <p>{notification.message}</p>
        <span className="notification-time">
          {new Date(notification.createdAt).toLocaleString()}
        </span>
      </div>
      <div className="notification-actions">
        {!notification.isRead && (
          <button
            className="btn-icon"
            onClick={() => onRead(notification._id)}
            title="Mark as read"
          >
            ✓
          </button>
        )}
        <button
          className="btn-icon btn-delete"
          onClick={() => onDelete(notification._id)}
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;
