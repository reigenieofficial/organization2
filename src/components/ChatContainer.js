import React from "react";
import "./ChatContainer.css";

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "2-digit",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
}

function ChatContainer({ selectedLead }) {
  console.log("here is selected lead " + selectedLead);
  return (
    <div className="ChatContainer">
      {selectedLead ? (
        <>
          <h2>Chat with {selectedLead.phone}</h2>
          <div>
            {selectedLead.conversationHistory &&
            selectedLead.conversationHistory.length > 0 ? (
              selectedLead.conversationHistory.map((message, index) => (
                <div key={index} className={`chat-message ${message.role}`}>
                  {message.role === "assistant" ? (
                    <div className="bot-balloon">
                      <p>Bot</p>
                      <div className="message">{message.content}</div>
                      <div className="timestamp">
                        {formatTimestamp(
                          selectedLead.conversationHistoryTimestamps[index]
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="lead-balloon">
                      <p>Lead</p>
                      <div className="message">{message.content}</div>
                      <div className="timestamp">
                        {formatTimestamp(
                          selectedLead.conversationHistoryTimestamps[index]
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No chat history available.</p>
            )}
          </div>
        </>
      ) : (
        <p>Please select a lead to view the conversation.</p>
      )}
    </div>
  );
}

export default ChatContainer;
