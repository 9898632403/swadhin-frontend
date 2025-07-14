import React, { useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../styles/UserInfo.css";
import { fetchAddressSuggestions } from "../utils/nominatimAPI";
import { FaUser, FaEnvelope, FaPhone, FaHome, FaMapMarkerAlt, FaMapMarkedAlt, FaCheck, FaLocationArrow } from "react-icons/fa";

// Fix marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

const UserInfo = () => {
  const { userInfo, setUserInfo } = useContext(UserContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState(
    userInfo || {
      name: "",
      email: "",
      phone: "",
      address: "",
      house: "",
      landmark: "",
      fullAddress: "",
    }
  );

  const [location, setLocation] = useState({ lat: 23.0225, lon: 72.5714 });
  const [suggestions, setSuggestions] = useState([]);

  const handleAddressInput = async (input) => {
    if (input.length < 3) return;
    const results = await fetchAddressSuggestions(input);
    setSuggestions(results);
  };

  const handleAddressSelect = (selected) => {
    if (!selected) return;
    setFormData({ ...formData, fullAddress: selected.value });
    setLocation({ lat: parseFloat(selected.lat), lon: parseFloat(selected.lon) });
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await res.json();
        setLocation({ lat: latitude, lon: longitude });
        setFormData((prev) => ({
          ...prev,
          fullAddress: data.display_name || "",
        }));
      },
      (err) => {
        alert("Unable to retrieve your location. Please enable location services.");
        console.error(err);
      }
    );
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setLocation({ lat, lon: lng });

        fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        )
          .then((res) => res.json())
          .then((data) => {
            setFormData((prev) => ({
              ...prev,
              fullAddress: data.display_name || "",
            }));
          });
      },
    });
    return <Marker position={[location.lat, location.lon]} />;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullAddress = `${formData.house}, ${formData.landmark}, ${formData.fullAddress}`;

    setUserInfo({
      ...formData,
      address: fullAddress,
    });

    navigate("/checkout");
  };

  return (
    <main className="userFormContainer">
      <form onSubmit={handleSubmit} className="userFormBox">
        <h1 className="form-title">📝 Delivery Information</h1>
        <p className="form-subtitle">Please provide your details for delivery</p>

        <div className="input-group">
          <label>
            <FaUser className="input-icon" /> Full Name:
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="userFormInput"
            placeholder="Enter your full name"
          />
        </div>

        <div className="input-group">
          <label>
            <FaEnvelope className="input-icon" /> Email:
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="userFormInput"
            placeholder="your.email@example.com"
          />
        </div>

        <div className="input-group">
          <label>
            <FaPhone className="input-icon" /> Phone Number:
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            className="userFormInput"
            placeholder="+91 9876543210"
          />
        </div>

        <div className="input-group">
          <label>
            <FaMapMarkerAlt className="input-icon" /> Search Address:
          </label>
          <AsyncSelect
            placeholder="Type to search location..."
            loadOptions={fetchAddressSuggestions}
            onChange={handleAddressSelect}
            isClearable
            className="async-select"
          />
        </div>

        <div className="map-container">
          <div className="map-actions">
            <button 
              type="button" 
              onClick={handleUseLocation} 
              className="userFormButton location-button"
            >
              <FaLocationArrow /> Use My Current Location
            </button>
            <p className="map-hint">Or click on the map to set location</p>
          </div>
          
          <MapContainer
            center={[location.lat, location.lon]}
            zoom={13}
            className="leaflet-container"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker />
          </MapContainer>
        </div>

        <div className="input-group">
          <label>
            <FaMapMarkedAlt className="input-icon" /> Detected Address:
          </label>
          <textarea
            name="fullAddress"
            value={formData.fullAddress}
            rows={3}
            readOnly
            className="userFormTextarea"
            placeholder="Address will appear here based on your selection"
          />
        </div>

        <div className="input-group">
          <label>
            <FaHome className="input-icon" /> House/Flat/Office Details:
          </label>
          <input
            type="text"
            name="house"
            value={formData.house}
            onChange={(e) => setFormData({ ...formData, house: e.target.value })}
            className="userFormInput"
            required
            placeholder="e.g. Flat 301, Sunshine Apartments"
          />
        </div>

        <div className="input-group">
          <label>
            <FaMapMarkerAlt className="input-icon" /> Nearby Landmark:
          </label>
          <input
            type="text"
            name="landmark"
            value={formData.landmark}
            onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
            className="userFormInput"
            required
            placeholder="e.g. Near City Mall, Opposite Metro Station"
          />
        </div>

        <button type="submit" className="submit-button">
          <FaCheck /> Confirm & Proceed to Checkout
        </button>
      </form>
    </main>
  );
};

export default UserInfo;