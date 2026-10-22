/**
 * SAARTHI AI — Main Application Controller
 * Handles user interactions, Web Speech API, image uploads, demo presets,
 * API integration, and simulation execution.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    mode: 'demo', // 'live' or 'demo'
    hasApiKey: false,
    currentPlan: null,
    uploadedImage: null, // { mimeType, data, fileName, sizeBytes }
    isRecording: false,
    recognition: null
  };

  const { elements } = UI;

  // Initialize Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // =========================================================================
  // 1. Health Check & Initial Mode Setup
  // =========================================================================
  async function checkSystemHealth() {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        state.hasApiKey = Boolean(data.hasApiKey);
        
        // If server has API key configured, default to live mode; otherwise stay in demo mode
        if (state.hasApiKey) {
          state.mode = 'live';
          UI.setModeVisuals('live');
          UI.setHealthDisplay({ online: true, hasKey: true, text: 'Gemini 2.5 Live' });
        } else {
          state.mode = 'demo';
          UI.setModeVisuals('demo');
          UI.setHealthDisplay({ online: true, hasKey: false, text: 'Demo (No Key)' });
        }
      } else {
        UI.setHealthDisplay({ online: false, hasKey: false, text: 'Server Degraded' });
      }
    } catch (err) {
      console.warn('Health check failed:', err);
      state.mode = 'demo';
      UI.setModeVisuals('demo');
      UI.setHealthDisplay({ online: false, hasKey: false, text: 'Offline / Local' });
    }
  }

  // =========================================================================
  // 2. Mode Toggle Handlers
  // =========================================================================
  elements.modeLiveBtn.addEventListener('click', () => {
    state.mode = 'live';
    UI.setModeVisuals('live');
    elements.errorBanner.classList.add('hidden');
    UI.showToast('Switched to Live Gemini 2.5 Flash mode.', 'info');
  });

  elements.modeDemoBtn.addEventListener('click', () => {
    state.mode = 'demo';
    UI.setModeVisuals('demo');
    elements.errorBanner.classList.add('hidden');
    UI.showToast('Switched to Demo Mode (Deterministic hackathon presets).', 'info');
  });

  elements.errorSwitchDemoBtn.addEventListener('click', () => {
    state.mode = 'demo';
    UI.setModeVisuals('demo');
    elements.errorBanner.classList.add('hidden');
    UI.showToast('Switched to Demo Mode.', 'info');
    // If there's input, trigger analyze automatically
    if (elements.inputText.value.trim().length >= 3) {
      handleAnalyze();
    }
  });

  // =========================================================================
  // 3. Web Speech API (Microphone Voice Input)
  // =========================================================================
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    state.recognition = recognition;

    recognition.onstart = () => {
      state.isRecording = true;
      elements.micLabel.textContent = 'Recording...';
      elements.micBtn.classList.add('bg-rose-950', 'text-rose-200', 'border-rose-700');
      elements.speechWave.classList.remove('hidden');
      elements.speechWave.classList.add('flex');
      elements.speechStatus.textContent = `Listening in ${elements.languageSelect.value}... Speak your emergency or situation.`;
      elements.speechStatus.classList.remove('hidden');
      UI.announceToScreenReader('Microphone recording active.');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        const currentVal = elements.inputText.value;
        elements.inputText.value = currentVal ? `${currentVal.trim()} ${finalTranscript}` : finalTranscript;
        updateCharCounter();
      }

      if (interimTranscript) {
        elements.speechStatus.textContent = `Hearing: "${interimTranscript}"`;
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech Recognition error:', event.error);
      stopRecording();
      let msg = 'Speech recognition error.';
      if (event.error === 'not-allowed') {
        msg = 'Microphone access was denied. Please allow microphone permissions in your browser.';
      } else if (event.error === 'no-speech') {
        msg = 'No speech detected. Please speak closer to your microphone.';
      }
      elements.speechStatus.textContent = msg;
      elements.speechStatus.classList.remove('hidden');
      UI.showToast(msg, 'warning');
    };

    recognition.onend = () => {
      stopRecording();
    };

    function startRecording() {
      try {
        recognition.lang = elements.languageSelect.value || 'en-IN';
        recognition.start();
      } catch (err) {
        console.warn('Failed to start recognition:', err);
      }
    }

    function stopRecording() {
      state.isRecording = false;
      elements.micLabel.textContent = 'Voice Input';
      elements.micBtn.classList.remove('bg-rose-950', 'text-rose-200', 'border-rose-700');
      elements.speechWave.classList.add('hidden');
      elements.speechWave.classList.remove('flex');
      elements.speechStatus.classList.add('hidden');
      try {
        recognition.stop();
      } catch {
        // already stopped
      }
    }

    elements.micBtn.addEventListener('click', () => {
      if (state.isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    });

    elements.languageSelect.addEventListener('change', () => {
      if (state.isRecording) {
        stopRecording();
        startRecording();
      }
    });

  } else {
    // Unsupported browser
    elements.micBtn.title = 'Web Speech API is not supported in this browser.';
    elements.micBtn.addEventListener('click', () => {
      UI.showToast('Web Speech API is not supported by your browser. Please type into the text area.', 'warning');
    });
  }

  // =========================================================================
  // 4. Character Counter & Input Validation
  // =========================================================================
  function updateCharCounter() {
    const len = elements.inputText.value.length;
    elements.charCounter.textContent = `${len} / 4000`;
    if (len > 3800) {
      elements.charCounter.classList.add('text-rose-400');
    } else {
      elements.charCounter.classList.remove('text-rose-400');
    }
  }

  elements.inputText.addEventListener('input', updateCharCounter);

  // =========================================================================
  // 5. Image Drag & Drop / File Selection
  // =========================================================================
  const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4 MB

  function handleImageFile(file) {
    if (!file) return;

    if (!ALLOWED_MIME.includes(file.type.toLowerCase())) {
      UI.showToast('Invalid image type. Please upload a PNG, JPEG, or WEBP image.', 'error');
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      UI.showToast(`Image exceeds 4 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB).`, 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      state.uploadedImage = {
        mimeType: file.type,
        data: dataUrl,
        fileName: file.name,
        sizeBytes: file.size
      };

      // Update UI Preview
      elements.imagePreview.src = dataUrl;
      elements.imageFileName.textContent = file.name;
      elements.imageFileSize.textContent = `${(file.size / 1024).toFixed(1)} KB`;
      elements.dropPrompt.classList.add('hidden');
      elements.previewContainer.classList.remove('hidden');
      elements.previewContainer.classList.add('flex');
      UI.showToast(`Image "${file.name}" ready for multimodal analysis.`, 'success');
    };

    reader.onerror = () => {
      UI.showToast('Failed to read image file.', 'error');
    };

    reader.readAsDataURL(file);
  }

  // Click to browse
  elements.dropArea.addEventListener('click', (e) => {
    // Only open if clicking prompt or area directly, not replace/remove buttons
    if (e.target.closest('#replace-image-btn') || e.target.closest('#remove-image-btn')) return;
    elements.imageInput.click();
  });

  elements.imageInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) handleImageFile(file);
  });

  // Drag and drop events
  ['dragenter', 'dragover'].forEach(eventName => {
    elements.dropArea.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      elements.dropArea.classList.add('border-cyan-400', 'bg-slate-900');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    elements.dropArea.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      elements.dropArea.classList.remove('border-cyan-400', 'bg-slate-900');
    });
  });

  elements.dropArea.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  });

  // Replace & Remove
  elements.replaceImageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    elements.imageInput.click();
  });

  elements.removeImageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    state.uploadedImage = null;
    elements.imageInput.value = '';
    elements.imagePreview.src = '';
    elements.previewContainer.classList.add('hidden');
    elements.dropPrompt.classList.remove('hidden');
    UI.showToast('Image removed.', 'info');
  });

  // =========================================================================
  // 6. One-Click Demo Presets
  // =========================================================================
  function loadPreset(presetKey) {
    const preset = window.SAARTHI_DEMO_DATA && window.SAARTHI_DEMO_DATA[presetKey];
    if (!preset) {
      console.warn('Preset not found:', presetKey);
      return;
    }

    elements.inputText.value = preset.inputText;
    updateCharCounter();
    elements.languageSelect.value = preset.language || 'en-IN';

    // Highlight selected preset pill briefly
    UI.showToast(`Loaded Preset: ${preset.name}`, 'info');
    
    // Automatically trigger analysis for seamless hackathon judge exploration
    handleAnalyze();
  }

  elements.presetMedical.addEventListener('click', () => loadPreset('medical_crisis'));
  elements.presetDisaster.addEventListener('click', () => loadPreset('community_safety'));
  elements.presetPrescription.addEventListener('click', () => loadPreset('health_prescription_navigator'));

  // =========================================================================
  // 7. Primary Action: "Turn This Into a Plan"
  // =========================================================================
  async function handleAnalyze() {
    const text = elements.inputText.value.trim();
    const hasImage = Boolean(state.uploadedImage && state.uploadedImage.data);

    if (!text && !hasImage) {
      UI.showToast('Please provide a text description or upload a photo.', 'warning');
      elements.inputText.focus();
      return;
    }

    if (text && text.length < 3) {
      UI.showToast('Text input must be at least 3 characters long.', 'warning');
      return;
    }

    // Set UI loading state
    UI.setLoading(true);
    elements.errorBanner.classList.add('hidden');

    try {
      const payload = {
        text,
        language: elements.languageSelect.value || 'en-IN',
        mode: state.mode
      };

      if (hasImage) {
        payload.image = {
          mimeType: state.uploadedImage.mimeType,
          data: state.uploadedImage.data
        };
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        // If live API failed (quota, key, timeout), display error banner and offer demo switch
        elements.errorBannerText.textContent = data.error || 'Gemini API call failed.';
        elements.errorBanner.classList.remove('hidden');
        throw new Error(data.error || 'Server returned an error.');
      }

      state.currentPlan = data.plan;

      // Update mode banner if server indicated demo
      if (data.mode === 'demo') {
        state.mode = 'demo';
        UI.setModeVisuals('demo');
      } else {
        UI.setModeVisuals('live');
      }

      // Render the plan into Columns 2 & 3
      UI.renderActionPlan(data.plan);
      UI.showToast('Incident successfully analyzed and translated to action plan.', 'success');

    } catch (err) {
      console.error('Analysis error:', err);
      // Fallback: If network failed or server down, but in Demo mode or user wants offline demo, load local preset
      if (state.mode === 'demo' && window.SAARTHI_DEMO_DATA) {
        const fallbackPlan = window.SAARTHI_DEMO_DATA.medical_crisis.plan;
        state.currentPlan = fallbackPlan;
        UI.renderActionPlan(fallbackPlan);
        UI.showToast('Loaded local deterministic fixture.', 'info');
      } else {
        UI.showToast(`Analysis failed: ${err.message}`, 'error');
      }
    } finally {
      UI.setLoading(false);
    }
  }

  elements.btnAnalyze.addEventListener('click', handleAnalyze);

  // New Case Reset
  elements.newCaseBtn.addEventListener('click', () => {
    state.currentPlan = null;
    state.uploadedImage = null;
    UI.resetCase();
  });

  // =========================================================================
  // 8. Copy Buttons (JSON & Action Plan Briefing)
  // =========================================================================
  elements.btnCopyJson.addEventListener('click', async () => {
    if (!state.currentPlan) {
      UI.showToast('No active action plan to copy.', 'warning');
      return;
    }

    const payload = JSON.stringify(state.currentPlan.rawSystemPayload || state.currentPlan, null, 2);
    try {
      await navigator.clipboard.writeText(payload);
      UI.showToast('JSON payload copied to clipboard!', 'success');
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = payload;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      UI.showToast('JSON payload copied to clipboard!', 'success');
    }
  });

  elements.btnCopyPlan.addEventListener('click', async () => {
    if (!state.currentPlan) {
      UI.showToast('No active action plan to copy.', 'warning');
      return;
    }

    const p = state.currentPlan;
    const briefingText = [
      `======================================================`,
      `SAARTHI AI — EMERGENCY BRIEFING REPORT`,
      `======================================================`,
      `INCIDENT: ${p.title}`,
      `URGENCY:  ${p.urgency.toUpperCase()} | DOMAIN: ${p.domain}`,
      `SUMMARY:  ${p.summary}`,
      ``,
      `--- IMMEDIATE ON-SCENE GUIDANCE ---`,
      ...(p.humanGuidance || []).map((g, i) => `${i + 1}. ${g}`),
      ``,
      `--- SYSTEM ACTION DIRECTIVES ---`,
      ...(p.actions || []).map((a, i) => `[${a.priority}] ${a.step}\n    Why: ${a.why} (Timing: ${a.timing})`),
      ``,
      `SAFETY NOTICE: ${p.safety_note || ''}`,
      `DRAFT NOTICE: DRAFT PAYLOAD — NOT SENT TO ANY REAL SYSTEM`,
      `======================================================`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(briefingText);
      UI.showToast('Action Plan Briefing copied to clipboard!', 'success');
    } catch {
      UI.showToast('Failed to copy to clipboard.', 'error');
    }
  });

  // =========================================================================
  // 9. Simulation Execution Terminal
  // =========================================================================
  elements.btnSimulate.addEventListener('click', () => {
    if (!state.currentPlan) {
      UI.showToast('Generate an action plan first before running simulation.', 'warning');
      return;
    }
    UI.runSimulation(state.currentPlan);
  });

  elements.closeSimBtn.addEventListener('click', () => {
    elements.simulationConsole.classList.add('hidden');
  });

  // Run initial health check on startup
  checkSystemHealth();
});
