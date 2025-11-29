# Implementation Plan

- [-] 1. Create voice modulation service

  - Implement VoiceModulatorService class with severity-based modulation profiles
  - Add calculateModulation method that adjusts voice parameters based on CDS results
  - Add getSeverityLevel method to determine highest severity from issue array
  - Add getModulationProfile method to retrieve modulation settings
  - Include elderly mode adjustment logic (additional 20% speed reduction)
  - Clamp all values to valid ranges (rate: 0.1-2.0, pitch: -1.0-1.0, volume: 0-1.0)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.5_




- [ ] 1.1 Write property test for modulation value ranges
  - **Property 8: High severity modulation values**
  - **Validates: Requirements 2.4**

- [ ] 1.2 Write property test for severity aggregation
  - **Property 9: Highest severity determines modulation**
  - **Validates: Requirements 2.5**

- [ ] 2. Create message builder service
  - Implement MessageBuilderService class for formatting speech messages
  - Add buildPrescriptionMessage method to format medication details
  - Add buildCDSWarningMessage method to format CDS alerts
  - Add buildIssueDetailsMessage method to format individual issues
  - Add buildConfirmationMessage method for submission feedback
  - Add buildErrorMessage method for error handling
  - Add formatForSpeech method with abbreviation expansion and text chunking
  - _Requirements: 1.3, 1.4, 4.1, 4.2, 4.3, 4.4, 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 2.1 Write property test for message completeness
  - **Property 4: Prescription message completeness**
  - **Validates: Requirements 1.4**

- [ ] 2.2 Write property test for text chunking
  - **Property 15: Long text is chunked**
  - **Validates: Requirements 4.4**

- [ ] 2.3 Write property test for abbreviation expansion
  - **Property 41: Abbreviations are expanded**
  - **Validates: Requirements 12.5**

- [ ] 3. Create settings persistence service
  - Implement SettingsPersisterService class for localStorage management
  - Add saveVoiceConfig method to persist voice settings
  - Add loadVoiceConfig method to retrieve saved settings
  - Add clearVoiceConfig method for cleanup
  - Handle elderly mode defaults (rate: 0.8 when elderly mode is true)
  - Add error handling for localStorage failures
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 3.1 Write property test for settings persistence round-trip
  - **Property 33: Settings persisted to storage**
  - **Property 34: Saved settings are loaded**
  - **Validates: Requirements 11.1, 11.2**

- [ ] 4. Enhance useVoiceReminder hook
  - Add speakWithModulation method that accepts ModulatedVoiceConfig
  - Add speakCDSResult method that integrates CDS validation with voice output
  - Integrate voiceModulator service for automatic parameter adjustment
  - Integrate messageBuilder service for formatted speech
  - Add getCurrentUtterance method for state tracking
  - Ensure all new methods handle errors gracefully
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 4.1 Write property test for CDS-aware speech
  - **Property 1: Check and Speak triggers both CDS and voice**
  - **Property 2: No issues uses base voice configuration**
  - **Validates: Requirements 1.1, 1.2, 2.1**

- [ ] 5. Create ModulationIndicator component
  - Create new component to display active voice modulation
  - Show modulation description and speed percentage
  - Apply elderly mode styling adjustments
  - Add neon-themed styling with glassmorphism
  - Include Volume2 icon for visual clarity
  - Handle null modulation state (hide when not active)
  - _Requirements: 8.1, 8.4, 8.5_

- [ ] 6. Enhance PrescriptionVoice page - state and configuration
  - Add isCheckingCDS state for loading indication
  - Add showIssueDetails state for UI control
  - Add modulationApplied state to track active modulation
  - Load voice configuration from settingsPersister on mount
  - Save voice configuration changes to settingsPersister
  - Apply elderly mode defaults when loading settings
  - _Requirements: 11.1, 11.2, 11.3, 7.4_

- [ ] 7. Enhance PrescriptionVoice page - checkAndSpeak integration
  - Update checkAndSpeak method to use voiceModulator service
  - Call speakCDSResult from enhanced useVoiceReminder hook
  - Set modulationApplied state with calculated modulation profile
  - Show issue details when CDS returns warnings
  - Handle CDS validation errors with error speech
  - Add loading state management during CDS check
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 9.1_

- [ ] 7.1 Write property test for warning count in message
  - **Property 3: Issues include warning count in message**
  - **Validates: Requirements 1.3**

- [ ] 8. Enhance PrescriptionVoice page - submission integration
  - Update submitPrescription to check for CDS issues
  - Add confirmation dialog when submitting with CDS warnings
  - Speak confirmation message on successful submission
  - Speak error message on failed submission with emphasis
  - Reset form and state after successful submission
  - Clear modulationApplied state on form reset
  - _Requirements: 3.1, 3.2, 3.3, 3.5, 9.3_

- [ ] 8.1 Write property test for submission confirmation speech
  - **Property 10: Successful submission triggers confirmation speech**
  - **Validates: Requirements 3.2**

- [ ] 8.2 Write property test for submission error emphasis
  - **Property 11: Failed submission uses emphasized voice**
  - **Validates: Requirements 3.3**

- [ ] 9. Add ModulationIndicator to PrescriptionVoice UI
  - Import and render ModulationIndicator component
  - Pass modulationApplied state as prop
  - Position indicator near CDS result card
  - Apply conditional rendering (only show when modulation is active)
  - Ensure responsive layout on mobile devices
  - _Requirements: 8.1, 8.4, 8.5_

- [ ] 10. Add visual feedback for speaking state
  - Add visual indicator when isSpeaking is true
  - Highlight CDS result section when speaking issues
  - Show paused state indicator when speech is paused
  - Remove indicators when speech completes
  - Ensure indicators are accessible with ARIA labels
  - _Requirements: 8.1, 8.3, 8.4, 8.5_

- [ ] 10.1 Write property test for visual indicators
  - **Property 26: Speaking shows visual indicator**
  - **Property 29: Speech completion removes indicators**
  - **Validates: Requirements 8.1, 8.5**

- [ ] 11. Enhance voice controls with preset persistence
  - Update VoiceControls to trigger settings save on config change
  - Ensure preset selection saves to localStorage
  - Add visual feedback when presets are applied
  - Verify elderly preset sets correct values (rate: 0.7, pitch: -0.2, volume: 1.0)
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 11.4_

- [ ] 12. Add error handling for voice synthesis
  - Add error handler for speechSynthesis.onerror event
  - Display toast notification on synthesis errors
  - Log errors to console for debugging
  - Provide fallback message when voice is unavailable
  - Handle browser compatibility gracefully
  - _Requirements: 9.2, 9.4, 9.5_

- [ ] 12.1 Write property test for error speech
  - **Property 30: Network error triggers error speech**
  - **Property 31: Submission error triggers error speech**
  - **Property 32: Speech errors are logged and notified**
  - **Validates: Requirements 9.1, 9.3, 9.5**

- [ ] 13. Add keyboard accessibility
  - Add keyboard shortcuts for playback controls (Space for pause/resume, Escape for stop)
  - Ensure all buttons are keyboard accessible
  - Add ARIA labels for screen readers
  - Add focus indicators for all interactive elements
  - Test tab navigation flow
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 14. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Test integration with elderly mode
  - Verify elderly mode applies 20% speed reduction to all speech
  - Test that elderly mode defaults are loaded correctly
  - Verify elderly mode toggle updates voice settings
  - Test UI scaling in elderly mode
  - Verify modulation works correctly with elderly mode enabled
  - _Requirements: 4.5, 7.4, 11.5_

- [ ] 15.1 Write property test for elderly mode speed reduction
  - **Property 16: Elderly mode adds speed reduction**
  - **Property 24: Elderly mode default speed**
  - **Validates: Requirements 4.5, 7.4**

- [ ] 16. Add analytics tracking
  - Track "Check and Speak" usage
  - Track CDS issue frequency and severity distribution
  - Track modulation application by severity level
  - Track voice preset selection distribution
  - Track error rates by type
  - Track settings persistence success rate
  - _Requirements: All (monitoring)_

- [ ] 17. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
