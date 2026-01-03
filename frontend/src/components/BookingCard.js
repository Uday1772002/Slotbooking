import React from "react";
import "./BookingCard.css";

const BookingCard = ({ booking, onCancel }) => {
  // Handle deleted slots
  if (!booking.slotId) {
    return (
      <div className="booking-card">
        <div className="booking-header">
          <h3>Slot Deleted</h3>
          <span className="status-badge status-cancelled">UNAVAILABLE</span>
        </div>
        <div className="booking-details">
          <p>This time slot has been removed by the provider.</p>
        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "status-confirmed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-pending";
    }
  };

  return (
    <div className="booking-card">
      <div className="booking-header">
        <h3>{formatDate(booking.slotId.date)}</h3>
        <span className={`status-badge ${getStatusColor(booking.status)}`}>
          {booking.status.toUpperCase()}
        </span>
      </div>
      <div className="booking-details">
        <p>
          <strong>Time:</strong> {booking.slotId.startTime} -{" "}
          {booking.slotId.endTime}
        </p>
        {booking.notes && (
          <p>
            <strong>Notes:</strong> {booking.notes}
          </p>
        )}
        <p className="booking-date">
          <strong>Booked on:</strong>{" "}
          {new Date(booking.createdAt).toLocaleString()}
        </p>
      </div>
      {booking.status !== "cancelled" && (
        <button
          className="btn btn-danger"
          onClick={() => onCancel(booking._id)}
        >
          Cancel Booking
        </button>
      )}
    </div>
  );
};

export default BookingCard;
