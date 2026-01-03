import React from "react";
import "./SlotCard.css";

const SlotCard = ({ slot, onBook, onDelete, isBooked, isProvider }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div
      className={`slot-card ${
        !slot.isAvailable || isBooked ? "unavailable" : ""
      }`}
    >
      <div className="slot-date">{formatDate(slot.date)}</div>
      <div className="slot-time">
        {slot.startTime} - {slot.endTime}
      </div>
      <div className="slot-availability">
        {slot.currentBookings}/{slot.maxBookings} booked
      </div>

      {!isProvider && slot.isAvailable && !isBooked && (
        <button className="btn btn-primary" onClick={() => onBook(slot._id)}>
          Book Slot
        </button>
      )}
      {!isProvider && isBooked && (
        <span className="booked-badge">Already Booked</span>
      )}
      {!isProvider && !slot.isAvailable && !isBooked && (
        <span className="unavailable-badge">Full</span>
      )}

      {isProvider && (
        <div className="provider-actions">
          <div className="provider-status">
            {slot.isAvailable ? (
              <span className="status-badge available">Available</span>
            ) : (
              <span className="status-badge full">Full</span>
            )}
          </div>
          {onDelete && (
            <button
              className="btn btn-danger btn-small"
              onClick={() => onDelete(slot._id)}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SlotCard;
