import React, { useState, useEffect } from "react";
import LeadsPanel from "./components/LeadsPanel";
import ChatContainer from "./components/ChatContainer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp } from "@fortawesome/free-solid-svg-icons";

import "./App.css";
// ... Other imports and code ...

function App() {
  const [selectedLead, setSelectedLead] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [campaignName, setCampaignName] = useState(""); // For storing campaign name input
  const [leads, setLeads] = useState([]); // For storing leads fetched from Firebase
  const [isLoading, setIsLoading] = useState(false); // For tracking API loading state

  const togglePanel = () => {
    console.log("Toggling panel");
    setIsPanelOpen(!isPanelOpen);
  };

  // Scroll-to-top functionality
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "instant", // Smooth scrolling animation
    });
  };

  // Handler for selecting a lead
  const handleSelectLead = (lead) => {
    console.log("Lead selected:", lead); // Use template literals for proper logging
    setSelectedLead(lead);
  };

  // Handler for fetching leads from Firebase function
  const fetchLeads = async () => {
    setIsLoading(true); // Start loading
    const url =
      "https://us-central1-smschat-5f13b.cloudfunctions.net/dashBoardServiceV2";
    let startUserId = 1; // Starting from the first user
    let allLeads = []; // Array to accumulate all fetched leads
    let fetchMore = true; // Flag to control the loop

    while (fetchMore) {
      const requestData = {
        campaignName: campaignName,
        startUserId: startUserId, // Use the startUserId for pagination
      };

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        allLeads = allLeads.concat(data.data); // Accumulate leads

        if (data.nextStartUserId !== null) {
          startUserId = data.nextStartUserId; // Prepare for the next batch
        } else {
          fetchMore = false; // No more data to fetch
        }
      } catch (error) {
        console.error("Error fetching leads:", error);
        fetchMore = false; // Stop fetching if an error occurs
      }
    }

    setIsLoading(false); // Stop loading
    setLeads(allLeads); // Update state with all fetched leads
  };

  const handleViewRefreshClick = () => {
    if (campaignName !== "") {
      fetchLeads();
    }
  };

  return (
    <div className="App">
      {/* Scroll-to-top icon */}
      <div id="scrollToTop" className="scroll-to-top" onClick={scrollToTop}>
        <FontAwesomeIcon icon={faChevronUp} />
      </div>
      <div className="top-bar">
        <h3>Logs</h3>
        <label htmlFor="campaignName">Campaign Name: </label>
        <input
          type="text"
          id="campaignName"
          placeholder="Enter Campaign Name"
          value={campaignName}
          onChange={(e) => setCampaignName(e.target.value)}
        />
        <button
          className="view-refresh-button"
          onClick={handleViewRefreshClick} // Use this handler for the button click
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "View/Refresh"}
        </button>
      </div>

      <button onClick={togglePanel} className="menu-toggle">
        {isPanelOpen ? "<<" : "Leads"}
      </button>

      <div className="container">
        <LeadsPanel
          leads={leads}
          onSelectLead={handleSelectLead}
          isPanelOpen={isPanelOpen}
          togglePanel={togglePanel}
        />
        <ChatContainer selectedLead={selectedLead} />
      </div>
    </div>
  );
}

export default App;
