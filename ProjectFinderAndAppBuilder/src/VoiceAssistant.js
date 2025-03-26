import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaStop, FaVolumeUp } from 'react-icons/fa';
import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';
import './VoiceAssistant.css';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [messages, setMessages] = useState([]);
  
  // References
  const speechConfig = useRef(null);
  const audioConfig = useRef(null);
  const recognizer = useRef(null);
  const synthesizer = useRef(null);
  
  useEffect(() => {
    // Initialize Microsoft Speech services
    // Replace with your own subscription key and region
    const subscriptionKey = 'YOUR_SUBSCRIPTION_KEY';
    const serviceRegion = 'YOUR_SERVICE_REGION';
    
    speechConfig.current = speechsdk.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
    speechConfig.current.speechRecognitionLanguage = 'en-US';
    
    // Set the voice - choose from Microsoft's neural voices
    speechConfig.current.speechSynthesisVoiceName = 'en-US-JennyNeural';
    
    audioConfig.current = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
    
    return () => {
      if (recognizer.current) {
        recognizer.current.close();
      }
      if (synthesizer.current) {
        synthesizer.current.close();
      }
    };
  }, []);
  
  const startListening = () => {
    setIsListening(true);
    setTranscript('');
    
    recognizer.current = new speechsdk.SpeechRecognizer(
      speechConfig.current, 
      audioConfig.current
    );
    
    recognizer.current.recognizeOnceAsync(
      (result) => {
        if (result.reason === speechsdk.ResultReason.RecognizedSpeech) {
          const recognizedText = result.text;
          setTranscript(recognizedText);
          
          // Process the recognized text (you would typically call an API here)
          processUserInput(recognizedText);
        }
        setIsListening(false);
      },
      (err) => {
        console.error('Speech recognition error:', err);
        setIsListening(false);
      }
    );
  };
  
  const stopListening = () => {
    if (recognizer.current) {
      recognizer.current.stopContinuousRecognitionAsync();
      setIsListening(false);
    }
  };
  
  const processUserInput = (input) => {
    // Simple mock response - in a real app, you'd call your AI backend
    const botResponse = `I heard you say: "${input}". How can I help with that?`;
    setResponse(botResponse);
    
    // Add to conversation history
    setMessages(prev => [
      ...prev, 
      { type: 'user', text: input },
      { type: 'assistant', text: botResponse }
    ]);
    
    // Speak the response
    speakText(botResponse);
  };
  
  const speakText = (text) => {
    setIsSpeaking(true);
    
    synthesizer.current = new speechsdk.SpeechSynthesizer(
      speechConfig.current
    );
    
    synthesizer.current.speakTextAsync(
      text,
      (result) => {
        if (result.reason === speechsdk.ResultReason.SynthesizingAudioCompleted) {
          setIsSpeaking(false);
        }
      },
      (err) => {
        console.error('Speech synthesis error:', err);
        setIsSpeaking(false);
      }
    );
  };
  
  const handleStopSpeaking = () => {
    if (synthesizer.current) {
      synthesizer.current.close();
      setIsSpeaking(false);
    }
  };
  
  return (
    <div className="voice-assistant-container">
      <div className="voice-assistant-header">
        <h2>Microsoft Voice Assistant</h2>
      </div>
      
      <div className="voice-assistant-messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <FaVolumeUp className="empty-icon" />
            <p>Your conversation will appear here</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              <div className="message-bubble">{msg.text}</div>
            </div>
          ))
        )}
      </div>
      
      <div className="voice-assistant-controls">
        {isListening ? (
          <button 
            className="control-button stop" 
            onClick={stopListening}
            disabled={isSpeaking}
          >
            <FaStop /> Stop Listening
          </button>
        ) : (
          <button 
            className="control-button start" 
            onClick={startListening}
            disabled={isSpeaking}
          >
            <FaMicrophone /> Start Listening
          </button>
        )}
        
        {isSpeaking && (
          <button 
            className="control-button stop-speaking" 
            onClick={handleStopSpeaking}
          >
            <FaStop /> Stop Speaking
          </button>
        )}
      </div>
      
      <div className="voice-assistant-status">
        {isListening && <p>Listening...</p>}
        {isSpeaking && <p>Speaking...</p>}
      </div>
    </div>
  );
};

export default VoiceAssistant;