import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import SlotCard from "../components/SlotCard";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [providerBookings, setProviderBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSlot, setNewSlot] = useState({
    date: "",
    startTime: "",
    endTime: "",
    maxBookings: 1,
  });

  const isProvider = user?.role === "provider";
  const isCustomer = user?.role === "customer";
  const userRole = user?.role;

  const fetchData = useCallback(async () => {
    if (!userRole) return;

    try {
      setLoading(true);

      if (userRole === "provider") {
        const [slotsRes, bookingsRes] = await Promise.all([
          api.get(
            `/slots?showAll=true${selectedDate ? `&date=${selectedDate}` : ""}`
          ),
          api.get("/bookings/provider/bookings"),
        ]);
        setSlots(slotsRes.data.slots);
        setProviderBookings(bookingsRes.data.bookings);
      } else {
        const [slotsRes, bookingsRes] = await Promise.all([
          api.get(`/slots${selectedDate ? `?date=${selectedDate}` : ""}`),
          api.get("/bookings"),
        ]);
        setSlots(slotsRes.data.slots);
        setUserBookings(bookingsRes.data.bookings);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [selectedDate, userRole]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm("Are you sure you want to delete this slot?")) {
      return;
    }

    try {
      await api.delete(`/slots/${slotId}`);
      toast.success("Slot deleted successfully");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete slot");
    }
  };

  const handleBookSlot = async (slotId) => {
    try {
      await api.post("/bookings", { slotId });
      toast.success("Booked!");
      fetchData();
    } catch (error) {
      console.error(error);
      // console.log('slot id:', slotId);
      toast.error(error.response?.data?.message || "Booking failed");
    }
  };

  const isSlotBooked = (slotId) => {
    return userBookings.some(
      (booking) =>
        booking.slotId?._id === slotId && booking.status !== "cancelled"
    );
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    try {
      await api.post("/slots", newSlot);
      toast.success("Slot created!");
      setShowCreateForm(false);
      setNewSlot({ date: "", startTime: "", endTime: "", maxBookings: 1 });
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Create failed");
    }
  };

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>{isProvider ? "My Time Slots" : "Available Time Slots"}</h1>
        <div className="header-actions">
          {isProvider && (
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? "Cancel" : "+ Create Slot"}
            </button>
          )}
          <div className="date-filter">
            <label>Filter by date:</label>
            <input
              type="date"
              value={selectedDate}
              min={getTodayDate()}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            {selectedDate && (
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedDate("")}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {isProvider && showCreateForm && (
        <div className="card create-slot-form">
          <h3>Create New Time Slot</h3>
          <form onSubmit={handleCreateSlot}>
            <div className="form-row">
              <div className="input-group">
                <label>Date</label>
                <input
                  type="date"
                  value={newSlot.date}
                  min={getTodayDate()}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="input-group">
                <label>Start Time</label>
                <input
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, startTime: e.target.value })
                  }
                  required
                />
              </div>
              <div className="input-group">
                <label>End Time</label>
                <input
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, endTime: e.target.value })
                  }
                  required
                />
              </div>
              <div className="input-group">
                <label>Max Bookings</label>
                <input
                  type="number"
                  min="1"
                  value={newSlot.maxBookings}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, maxBookings: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              Create Slot
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          {/* Provider View */}
          {isProvider && (
            <>
              {/* Provider's Slots */}
              <div className="section">
                <h2>My Time Slots</h2>
                {slots.length === 0 ? (
                  <div className="no-data">
                    <p>You haven't created any slots yet.</p>
                  </div>
                ) : (
                  <div className="slots-grid">
                    {slots.map((slot) => (
                      <SlotCard
                        key={slot._id}
                        slot={slot}
                        isProvider={true}
                        onDelete={handleDeleteSlot}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Bookings on Provider's Slots */}
              <div className="section">
                <h2>Customer Bookings</h2>
                {providerBookings.length === 0 ? (
                  <div className="no-data">
                    <p>No bookings yet on your slots.</p>
                  </div>
                ) : (
                  <div className="bookings-list">
                    {providerBookings.map((booking) => (
                      <div key={booking._id} className="booking-item">
                        <div className="booking-info">
                          <h4>
                            {new Date(booking.slotId.date).toLocaleDateString()}
                            {" at "}
                            {booking.slotId.startTime} -{" "}
                            {booking.slotId.endTime}
                          </h4>
                          <p>
                            <strong>Customer:</strong>{" "}
                            {booking.userId?.name || "N/A"}
                          </p>
                          <p>
                            <strong>Phone:</strong>{" "}
                            {booking.userId?.phoneNumber || "N/A"}
                          </p>
                          {booking.notes && (
                            <p>
                              <strong>Notes:</strong> {booking.notes}
                            </p>
                          )}
                          <p className="booking-status">
                            Status: {booking.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Customer View */}
          {isCustomer && (
            <div className="section">
              {slots.length === 0 ? (
                <div className="no-data">
                  <p>
                    No slots available{" "}
                    {selectedDate ? "for this date" : "at the moment"}
                  </p>
                </div>
              ) : (
                <div className="slots-grid">
                  {slots.map((slot) => (
                    <SlotCard
                      key={slot._id}
                      slot={slot}
                      onBook={handleBookSlot}
                      isBooked={isSlotBooked(slot._id)}
                      isProvider={false}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
