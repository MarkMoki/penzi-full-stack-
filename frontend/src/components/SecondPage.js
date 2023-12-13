import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/styles.css'; // Import your CSS file

const SecondPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const number = urlParams.get('phoneNumber');
    const responseMsg = urlParams.get('responseMessage');
    setPhoneNumber(number || ''); // Set the phone number from URL parameter
    setResponseMessage(responseMsg || ''); // Set the response message from URL parameter

    // Check if there is a response from the landing page
    if (responseMsg) {
      setResponseMessage(cleanResponse(responseMsg)); // Set the initial response message
    }

    // Load conversations from localStorage or initialize as an empty array
    const storedConversations = localStorage.getItem('conversations');
    if (storedConversations) {
      setConversations(JSON.parse(storedConversations));
    }
  }, []);

  useEffect(() => {
    // Update localStorage when conversations change
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  const cleanResponse = (response) => {
    if (response && typeof response === 'string') {
      try {
        const parsedResponse = JSON.parse(response);
        if (parsedResponse.status) {
          return parsedResponse.status;
        }
      } catch (error) {
        return response;
      }
    }
    return response;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    // Remove leading/trailing spaces from the message
    const trimmedMessage = message.trim();
  
    try {
      const response = await axios.post('http://127.0.0.1:8000/message/', {
        phone_number: phoneNumber,
        message: trimmedMessage, // Send the trimmed message to the server
      });
  
      const responseData = cleanResponse(JSON.stringify(response.data.status));
      const newConversation = {
        sentMessage: trimmedMessage, // Use trimmed message for conversation log
        responses: [responseData],
        sentTimestamp: new Date().toISOString(),
        responseTimestamps: [new Date().toISOString()],
      };
  
      // If there are existing conversations, add the new conversation
      if (conversations.length > 0) {
        setConversations((prevConversations) => [...prevConversations, newConversation]);
      } else {
        // If this is the first conversation, set it separately
        setConversations([newConversation]);
      }
  
      setError('');
    } catch (error) {
      setError('Error occurred while sending the message.');
      console.error('Error occurred:', error);
    } finally {
      setIsLoading(false);
      setMessage(''); // Clear the message input after sending
    }
  };

  return (
    <div className="wcontainer">
      <div className="profile-info">
        <p className="profile-name">Mpenzi: {phoneNumber}</p>
        <h1>Welcome to our dating service with 6000 potential dating partners!</h1>
      </div>
      <div className="message-history">
        {responseMessage && (
          <div className="message response">
            <p>{cleanResponse(responseMessage)}</p>
            <small>{`${new Date().toLocaleString()}`}</small>  
          </div>
        )}
        <hr></hr>
        <br></br>
        <br></br>
        <br></br>
        {/* Reverse conversations to display older ones at the top */}
        {conversations.slice(0).reverse().map((conversation, convIndex) => (
          <div key={convIndex} className="conversation">
            {/* Reverse messages within each conversation to display older ones at the top */}
            {conversation.responses.map((response, respIndex) => (
              <div key={respIndex} className="received-bubble">
                <p>{cleanResponse(response)}</p>
                <small>{`${new Date(conversation.responseTimestamps[respIndex]).toLocaleString()}`}</small>  
              </div>
            )).reverse()}
            <div className="sent-bubble">
              <p>{`${conversation.sentMessage}`}</p>
              <small>{`${new Date(conversation.sentTimestamp).toLocaleString()}`}</small>  
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="message-input">
        <textarea
          placeholder="Write your message here"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="text-area"
        ></textarea>
        <button type="submit" disabled={isLoading} className="submit-button">
          {isLoading ? 'Sending...' : 'Send'}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};



export default SecondPage;