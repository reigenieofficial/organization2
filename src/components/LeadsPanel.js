import React, { useState, useEffect, useRef } from "react";
import "./LeadsPanel.css";

function LeadsPanel({ leads, onSelectLead, isPanelOpen, togglePanel }) {
  // Function to set the selected lead when a lead is clicked

  const [selectedLeadForSearch, setSelectedLeadForSearch] = useState(null);

  const handleSelectLeadForSearch = (lead) => {
    setSelectedLeadForSearch(lead);
  };

  const [selectedFilter, setSelectedFilter] = useState("all");
  const [favorites, setFavorites] = useState(() => {
    const storedFavorites = localStorage.getItem("favorites");
    return storedFavorites ? JSON.parse(storedFavorites) : [];
  });
  const [searchPhone, setSearchPhone] = useState("");
  const searchInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
  };

  const toggleFavorite = (id) => {
    setFavorites((currentFavorites) =>
      currentFavorites.includes(id)
        ? currentFavorites.filter((favId) => favId !== id)
        : [...currentFavorites, id]
    );
  };

  const formatPhoneNumber = (phoneNumber) => {
    const cleaned = phoneNumber.replace(/\D/g, "");
    if (cleaned.length > 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`;
    } else if (cleaned.length > 3) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else if (cleaned.length > 0) {
      return `(${cleaned}`;
    }
    return "";
  };

  const normalizePhoneNumber = (phoneNumber) => {
    if (typeof phoneNumber !== "string" || phoneNumber === "") {
      return ""; // Return an empty string if phoneNumber is not a string or is empty
    }

    const numericPhone = phoneNumber.replace(/\D+/g, "");
    if (numericPhone.startsWith("1") && numericPhone.length > 10) {
      return numericPhone.slice(1);
    }
    return numericPhone.slice(-10);
  };

  const handleInputChange = (e) => {
    const inputPhoneNumber = e.target.value;
    setSearchPhone(formatPhoneNumber(inputPhoneNumber));

    // Check if there is a lead with a matching phone number
    const normalizedInputPhone = normalizePhoneNumber(inputPhoneNumber);
    const leadWithPhone = leads.find(
      (lead) => normalizePhoneNumber(lead.phone) === normalizedInputPhone
    );

    // Set selectedLeadForSearch based on the matching lead
    setSelectedLeadForSearch(leadWithPhone);
  };

  const handleSearch = () => {
    if (selectedLeadForSearch) {
      const normalizedSearchPhone = normalizePhoneNumber(searchPhone);
      const leadWithPhone = leads.find(
        (lead) => normalizePhoneNumber(lead.phone) === normalizedSearchPhone
      );

      if (leadWithPhone) {
        console.log("TRUE");
        const detailsElement = document.getElementById(
          `details-${leadWithPhone.userId}`
        );
        if (detailsElement) {
          detailsElement.style.display = "block";
          detailsElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          onSelectLead(leadWithPhone);
        }
      } else {
        alert("No match found");
        setSearchPhone("");
        searchInputRef.current.focus();
      }
    } else {
      alert("Please select a lead before searching.");
    }
  };
  const handleToggle = (id) => {
    const detailsElement = document.getElementById(`details-${id}`);
    if (detailsElement) {
      detailsElement.style.display =
        detailsElement.style.display === "none" ? "block" : "none";
      const selectedLead = leads.find((lead) => lead.userId === id);
      console.log("this part " + selectedLead);
      onSelectLead(selectedLead); // Update the selected lead in the parent component (App.js)
    }
  };
  const filteredLeads = leads.filter((lead) => {
    if (selectedFilter === "all") {
      return !lead.userIdInitial; // Exclude leads with userIdInitial
    } else if (selectedFilter === "not interested") {
      return lead.label1 === "not_interested" && !lead.userIdInitial;
    } else if (selectedFilter === "interested") {
      return lead.label1 === "interested" && !lead.userIdInitial;
    } else if (selectedFilter === "maybe interested") {
      return lead.label1 === "maybe_interested" && !lead.userIdInitial;
    } else if (selectedFilter === "sold") {
      return lead.label1 === "sold" && !lead.userIdInitial;
    } else if (selectedFilter === "contact later") {
      return lead.label1 === "pause" && !lead.userIdInitial;
    } else if (selectedFilter === "favorites") {
      return favorites.includes(lead.userId) && !lead.userIdInitial;
    } else {
      // Add other filter conditions as needed
    }
  });

  const sortedLeads = [
    ...filteredLeads.filter((lead) => favorites.includes(lead.id)),
    ...filteredLeads.filter((lead) => !favorites.includes(lead.id)),
  ];

  // Sort the leads by the most recent interaction timestamp
  sortedLeads.sort((a, b) => {
    // Get the most recent timestamps from each lead
    const aTimestamps = a.conversationHistoryTimestamps || [];
    const bTimestamps = b.conversationHistoryTimestamps || [];

    // Get the last timestamps in each array
    const aTimestamp = aTimestamps.length > 0 ? aTimestamps.slice(-1)[0] : null;
    const bTimestamp = bTimestamps.length > 0 ? bTimestamps.slice(-1)[0] : null;

    // Handle cases where timestamps may be null or undefined
    if (aTimestamp && bTimestamp) {
      return new Date(bTimestamp) - new Date(aTimestamp);
    } else if (aTimestamp) {
      return -1; // a is considered more recent
    } else if (bTimestamp) {
      return 1; // b is considered more recent
    } else {
      return 0; // both have no timestamps
    }
  });

  return (
    <div className={`LeadsPanel ${isPanelOpen ? "open" : ""}`}>
      <div className="filter-bar">
        <label>Filter by Status:</label>
        <select
          onChange={(e) => handleFilterChange(e.target.value)}
          value={selectedFilter}
        >
          <option value="all">All</option>
          <option value="interested">Interested</option>
          <option value="maybe interested">Maybe Interested</option>
          <option value="not interested">Not Interested</option>
          <option value="sold">Sold</option>
          <option value="contact later">Contact Later</option>
          <option value="favorites">Favorites</option>
        </select>
      </div>
      <div className="search-bar">
        <label>Search by Phone:</label>
        <input
          type="text"
          value={searchPhone}
          onChange={handleInputChange}
          ref={searchInputRef}
        />
        <button onClick={() => handleSearch()}>Search</button>
      </div>
      {sortedLeads.map((lead) => {
        console.log(lead); // Log a single lead object to inspect its properties

        return (
          <div key={lead.userId} className="lead-item">
            <div
              className="lead-title"
              onClick={() => handleToggle(lead.userId)}
            >
              <p>
                {lead.phone}
                <span
                  className="favorite-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(lead.userId);
                  }}
                >
                  {favorites.includes(lead.userId) ? " ⭐" : " ☆"}
                </span>
              </p>
            </div>
            {/* Use lead.userId here */}
            <div
              id={`details-${lead.userId}`}
              className="lead-details"
              style={{ display: "none" }}
            >
              <p>
                <strong>Name:</strong> {lead.name}
              </p>
              <p>
                <strong>Address:</strong> {lead.propertyAddress}
              </p>
              <p>
                <strong>Price:</strong> {lead.propertyPrice}
              </p>
              <p>
                <strong>Condition:</strong> {lead.propertyCondition}
              </p>
              <p>
                <strong>Status:</strong> {lead.label1}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default LeadsPanel;
