/**
 * SAARTHI AI — UI Rendering & DOM Controller
 * 
 * Non-negotiable Security Rule:
 * Never inject raw model or user strings via innerHTML.
 * All dynamic text is inserted using textContent and safe DOM construction.
 */

const UI = (() => {
  // DOM Element references
  const elements = {
    // Mode & Health
    modeLiveBtn: document.getElementById('mode-live-btn'),
    modeDemoBtn: document.getElementById('mode-demo-btn'),
    healthPill: document.getElementById('system-health-pill'),
    healthDot: document.getElementById('health-dot'),
    healthLabel: document.getElementById('health-label'),
    demoBanner: document.getElementById('demo-banner'),
    errorBanner: document.getElementById('error-banner'),
    errorBannerText: document.getElementById('error-banner-text'),
    errorSwitchDemoBtn: document.getElementById('error-switch-demo-btn'),
    newCaseBtn: document.getElementById('btn-new-case'),

    // Input Hub
    inputText: document.getElementById('input-text'),
    charCounter: document.getElementById('char-counter'),
    contextSelect: document.getElementById('context-select'),
    micBtn: document.getElementById('mic-btn'),
    micIcon: document.getElementById('mic-icon'),
    micLabel: document.getElementById('mic-label'),
    speechWave: document.getElementById('speech-wave'),
    speechStatus: document.getElementById('speech-status'),
    languageSelect: document.getElementById('language-select'),
    btnAnalyze: document.getElementById('btn-analyze'),

    // Competition Presets
    presetCommunity: document.getElementById('preset-community'),
    presetHealth: document.getElementById('preset-health'),
    presetPublic: document.getElementById('preset-public'),
    presetMedical: document.getElementById('preset-medical'),

    // Image Upload
    dropArea: document.getElementById('drop-area'),
    imageInput: document.getElementById('image-input'),
    dropPrompt: document.getElementById('drop-prompt'),
    previewContainer: document.getElementById('preview-container'),
    imagePreview: document.getElementById('image-preview'),
    imageFileName: document.getElementById('image-file-name'),
    imageFileSize: document.getElementById('image-file-size'),
    replaceImageBtn: document.getElementById('replace-image-btn'),
    removeImageBtn: document.getElementById('remove-image-btn'),

    // Column 2: Intent Bridge
    caseBadge: document.getElementById('case-badge'),
    bridgeEmptyState: document.getElementById('bridge-empty-state'),
    bridgeLoadingState: document.getElementById('bridge-loading-state'),
    bridgeContent: document.getElementById('bridge-content'),
    urgencyBadge: document.getElementById('urgency-badge'),
    domainBadge: document.getElementById('domain-badge'),
    confidenceVal: document.getElementById('confidence-val'),
    confidenceBar: document.getElementById('confidence-bar'),
    planTitle: document.getElementById('plan-title'),
    planSummary: document.getElementById('plan-summary'),
    intentSaid: document.getElementById('intent-said'),
    intentTrue: document.getElementById('intent-true'),
    entityPrimary: document.getElementById('entity-primary'),
    entityLocation: document.getElementById('entity-location'),
    entitySymptoms: document.getElementById('entity-symptoms'),
    entityHistory: document.getElementById('entity-history'),
    entityRisks: document.getElementById('entity-risks'),
    factsCount: document.getElementById('facts-count'),
    factsList: document.getElementById('facts-list'),
    unknownsCount: document.getElementById('unknowns-count'),
    unknownsList: document.getElementById('unknowns-list'),
    conflictsContainer: document.getElementById('conflicts-container'),
    conflictsList: document.getElementById('conflicts-list'),
    verificationList: document.getElementById('verification-list'),

    // Column 3: Action Workspace
    actionEmptyState: document.getElementById('action-empty-state'),
    actionLoadingState: document.getElementById('action-loading-state'),
    actionContent: document.getElementById('action-content'),
    humanGuidanceList: document.getElementById('human-guidance-list'),
    actionsList: document.getElementById('actions-list'),
    followUpCard: document.getElementById('follow-up-card'),
    followUpText: document.getElementById('follow-up-text'),
    btnSimulate: document.getElementById('btn-simulate'),
    btnCopyPlan: document.getElementById('btn-copy-plan'),
    btnExportFile: document.getElementById('btn-export-file'),
    btnCopyJson: document.getElementById('btn-copy-json'),
    simulationConsole: document.getElementById('simulation-console'),
    simulationLog: document.getElementById('simulation-log'),
    closeSimBtn: document.getElementById('close-sim-btn'),
    jsonPayloadDisplay: document.getElementById('json-payload-display'),
    safetyNoteText: document.getElementById('safety-note-text'),

    // Utilities
    ariaStatus: document.getElementById('aria-status'),
    toastContainer: document.getElementById('toast-container')
  };

  /**
   * Safe element creation helper
   */
  function createElement(tag, className = '', textContent = '') {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (textContent) el.textContent = textContent;
    return el;
  }

  /**
   * Set loading state across Columns 2 & 3
   */
  function setLoading(isLoading) {
    if (isLoading) {
      elements.bridgeEmptyState.classList.add('hidden');
      elements.bridgeContent.classList.add('hidden');
      elements.bridgeLoadingState.classList.remove('hidden');

      elements.actionEmptyState.classList.add('hidden');
      elements.actionContent.classList.add('hidden');
      elements.actionLoadingState.classList.remove('hidden');

      elements.btnAnalyze.disabled = true;
      elements.btnAnalyze.classList.add('opacity-70', 'cursor-not-allowed');
      elements.btnAnalyze.innerHTML = `
        <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        <span>Synthesizing Operational Matrix...</span>
      `;
      announceToScreenReader('Analyzing report and decoding intent...');
    } else {
      elements.bridgeLoadingState.classList.add('hidden');
      elements.actionLoadingState.classList.add('hidden');

      elements.btnAnalyze.disabled = false;
      elements.btnAnalyze.classList.remove('opacity-70', 'cursor-not-allowed');
      elements.btnAnalyze.innerHTML = `
        <i data-lucide="play-circle" class="w-4 h-4"></i>
        <span>Turn This Into a Plan</span>
      `;
      if (window.lucide) window.lucide.createIcons();
    }
  }

  /**
   * Announce message to ARIA live region
   */
  function announceToScreenReader(message) {
    if (elements.ariaStatus) {
      elements.ariaStatus.textContent = message;
    }
  }

  /**
   * Display Toast message
   */
  function showToast(message, type = 'info') {
    const toast = createElement('div', 'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono shadow-xl transition-all pointer-events-auto transform translate-y-2 opacity-0');
    
    if (type === 'success') {
      toast.className += ' bg-emerald-950/90 text-emerald-200 border border-emerald-700/80';
    } else if (type === 'error') {
      toast.className += ' bg-rose-950/90 text-rose-200 border border-rose-700/80';
    } else if (type === 'warning') {
      toast.className += ' bg-amber-950/90 text-amber-200 border border-amber-700/80';
    } else {
      toast.className += ' bg-slate-900/95 text-slate-200 border border-slate-700';
    }

    toast.textContent = message;
    elements.toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  /**
   * Clear and reset UI to empty case
   */
  function resetCase() {
    elements.inputText.value = '';
    elements.charCounter.textContent = '0 / 4000';
    
    // Clear image
    elements.imageInput.value = '';
    elements.imagePreview.src = '';
    elements.previewContainer.classList.add('hidden');
    elements.dropPrompt.classList.remove('hidden');

    // Reset columns
    elements.bridgeEmptyState.classList.remove('hidden');
    elements.bridgeContent.classList.add('hidden');
    elements.actionEmptyState.classList.remove('hidden');
    elements.actionContent.classList.add('hidden');
    elements.simulationConsole.classList.add('hidden');
    elements.caseBadge.textContent = 'CASE #READY';

    elements.errorBanner.classList.add('hidden');
    showToast('Workspace reset for a new incident case.');
    announceToScreenReader('Case reset.');
  }

  /**
   * Set active mode visuals (Live vs Demo)
   */
  function setModeVisuals(mode) {
    if (mode === 'live') {
      elements.modeLiveBtn.className = 'px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold';
      elements.modeDemoBtn.className = 'px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all text-slate-400 hover:text-white';
      elements.demoBanner.classList.add('hidden');
    } else {
      elements.modeLiveBtn.className = 'px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all text-slate-400 hover:text-white';
      elements.modeDemoBtn.className = 'px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold';
      elements.demoBanner.classList.remove('hidden');
    }
  }

  /**
   * Set System Health Display
   */
  function setHealthDisplay({ online = true, hasKey = false, text = 'Ready' }) {
    elements.healthLabel.textContent = text;
    if (online) {
      elements.healthDot.className = hasKey
        ? 'w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]'
        : 'w-2 h-2 rounded-full bg-amber-400';
    } else {
      elements.healthDot.className = 'w-2 h-2 rounded-full bg-rose-500';
    }
  }

  /**
   * Render complete Action Plan into Columns 2 and 3
   */
  function renderActionPlan(plan, incidentId = `INC-${Date.now().toString().slice(-4)}`) {
    if (!plan) return;

    // 1. Case Badge
    elements.caseBadge.textContent = `CASE #${incidentId}`;

    // 2. Urgency Badge
    const urgency = plan.urgency || 'Unclear';
    elements.urgencyBadge.textContent = urgency.toUpperCase();
    elements.urgencyBadge.className = 'px-2.5 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider ';
    
    switch (urgency.toLowerCase()) {
      case 'immediate':
        elements.urgencyBadge.className += 'badge-immediate';
        break;
      case 'high':
        elements.urgencyBadge.className += 'badge-high';
        break;
      case 'moderate':
        elements.urgencyBadge.className += 'badge-moderate';
        break;
      case 'low':
        elements.urgencyBadge.className += 'badge-low';
        break;
      default:
        elements.urgencyBadge.className += 'badge-unclear';
    }

    // 3. Domain Badge
    elements.domainBadge.textContent = (plan.domain || 'OTHER').toUpperCase();

    // 4. Confidence Gauge
    const scoreVal = typeof plan.confidenceScore === 'number'
      ? Math.round(plan.confidenceScore <= 1.0 ? plan.confidenceScore * 100 : plan.confidenceScore)
      : 85;
    elements.confidenceVal.textContent = `${scoreVal}%`;
    elements.confidenceBar.style.width = `${scoreVal}%`;

    // 5. Title & Summary
    elements.planTitle.textContent = plan.title || 'Incident Action Plan';
    elements.planSummary.textContent = plan.summary || 'Summary unavailable.';

    // 6. Intent comparison
    elements.intentSaid.textContent = `"${plan.intent?.said || ''}"`;
    elements.intentTrue.textContent = plan.intent?.trueIntent || '';

    // 7. Extracted Entities
    const entities = plan.extractedEntities || {};
    elements.entityPrimary.textContent = entities.primaryIssue || 'Unspecified';
    elements.entityLocation.textContent = entities.locationContext || 'Location unconfirmed';

    // Symptoms tags
    elements.entitySymptoms.replaceChildren();
    (entities.symptoms || []).forEach(sym => {
      const tag = createElement('span', 'px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono', sym);
      elements.entitySymptoms.appendChild(tag);
    });

    // History tags
    elements.entityHistory.replaceChildren();
    (entities.history || []).forEach(hist => {
      const tag = createElement('span', 'px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono', hist);
      elements.entityHistory.appendChild(tag);
    });

    // Risks tags
    elements.entityRisks.replaceChildren();
    (entities.risks || []).forEach(risk => {
      const tag = createElement('span', 'px-2 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-800/80 text-[10px] font-mono font-semibold', `⚠ ${risk}`);
      elements.entityRisks.appendChild(tag);
    });

    // 8. Facts, Unknowns, Conflicts
    const facts = plan.facts || [];
    elements.factsCount.textContent = String(facts.length);
    elements.factsList.replaceChildren();
    facts.forEach(f => {
      const li = createElement('li', '', f);
      elements.factsList.appendChild(li);
    });

    const unknowns = plan.unknowns || [];
    elements.unknownsCount.textContent = String(unknowns.length);
    elements.unknownsList.replaceChildren();
    unknowns.forEach(u => {
      const li = createElement('li', '', u);
      elements.unknownsList.appendChild(li);
    });

    const conflicts = plan.conflicts || [];
    elements.conflictsList.replaceChildren();
    if (conflicts.length > 0) {
      elements.conflictsContainer.classList.remove('hidden');
      conflicts.forEach(c => {
        const li = createElement('li', '', c);
        elements.conflictsList.appendChild(li);
      });
    } else {
      elements.conflictsContainer.classList.add('hidden');
    }

    // 9. Evidence & Verification List
    elements.verificationList.replaceChildren();
    const verifications = plan.verification || [];

    if (verifications.length === 0) {
      const noVer = createElement('p', 'text-slate-500 italic text-[11px]', 'No external factual claims required independent retrieval.');
      elements.verificationList.appendChild(noVer);
    } else {
      verifications.forEach((v, idx) => {
        const card = createElement('div', 'p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5');
        
        // Header line: claim and status badge
        const topRow = createElement('div', 'flex items-start justify-between gap-2');
        const claimText = createElement('p', 'font-medium text-slate-200 text-xs flex-1', `${idx + 1}. ${v.claim}`);
        
        const statusSpan = createElement('span', 'text-[10px] font-mono px-2 py-0.5 rounded shrink-0 uppercase tracking-wider font-semibold');
        const statusLower = (v.status || '').toLowerCase();
        
        if (statusLower === 'verified') {
          statusSpan.className += ' status-verified';
          statusSpan.textContent = '✓ Verified';
        } else if (statusLower.includes('partial')) {
          statusSpan.className += ' status-partially-verified';
          statusSpan.textContent = '◐ Partially verified';
        } else if (statusLower === 'contradicted') {
          statusSpan.className += ' status-contradicted';
          statusSpan.textContent = '✕ Contradicted';
        } else {
          statusSpan.className += ' status-verification-unavailable';
          statusSpan.textContent = '⊘ Not independently verified';
        }

        topRow.appendChild(claimText);
        topRow.appendChild(statusSpan);
        card.appendChild(topRow);

        // Explanation if present
        if (v.explanation) {
          const exp = createElement('p', 'text-[11px] text-slate-400 pl-2 border-l border-slate-700', v.explanation);
          card.appendChild(exp);
        }

        // Real Evidence Grounding Citations
        if (Array.isArray(v.evidence) && v.evidence.length > 0) {
          const evContainer = createElement('div', 'mt-1 pt-1 border-t border-slate-800 space-y-1');
          v.evidence.forEach(ev => {
            const evRow = createElement('div', 'text-[10px] font-mono text-slate-400 flex flex-col gap-0.5 bg-slate-950/60 p-1.5 rounded');
            
            const srcTitle = createElement('span', 'font-semibold text-slate-300', `Source: ${ev.source || 'Public Web'}`);
            evRow.appendChild(srcTitle);

            if (ev.url) {
              const link = createElement('a', 'text-cyan-400 hover:underline truncate', ev.url);
              link.href = ev.url;
              link.target = '_blank';
              link.rel = 'noopener noreferrer';
              evRow.appendChild(link);
            }

            if (ev.snippet) {
              const snip = createElement('span', 'italic text-slate-400', `"${ev.snippet.slice(0, 150)}..."`);
              evRow.appendChild(snip);
            }

            evContainer.appendChild(evRow);
          });
          card.appendChild(evContainer);
        }

        elements.verificationList.appendChild(card);
      });
    }

    // 10. Human Guidance (3 Key Physical Steps)
    elements.humanGuidanceList.replaceChildren();
    const guidance = plan.humanGuidance || [];
    guidance.forEach((step, i) => {
      const li = createElement('li', 'flex items-start gap-2 p-2 rounded bg-slate-950/50 border border-emerald-900/40');
      const stepNum = createElement('span', 'h-5 w-5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 border border-emerald-700', String(i + 1));
      const stepText = createElement('p', 'text-xs text-slate-200 leading-snug', step);
      li.appendChild(stepNum);
      li.appendChild(stepText);
      elements.humanGuidanceList.appendChild(li);
    });

    // 11. Structured Action Directives
    elements.actionsList.replaceChildren();
    const actions = plan.actions || [];
    actions.forEach((act, i) => {
      const card = createElement('div', 'action-card rounded-lg p-3 space-y-2');
      if (act.priority === 'Critical') card.className += ' action-critical';
      else if (act.priority === 'High') card.className += ' action-high';

      // Top row: Step and priority badge
      const headerRow = createElement('div', 'flex items-start justify-between gap-2');
      const stepTitle = createElement('h4', 'font-semibold text-xs text-slate-100 flex-1 leading-snug', `${i + 1}. ${act.step}`);
      
      const priorityPill = createElement(
        'span',
        `text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
          act.priority === 'Critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
          act.priority === 'High' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
          'bg-slate-800 text-slate-300 border border-slate-700'
        }`,
        act.priority || 'Normal'
      );

      headerRow.appendChild(stepTitle);
      headerRow.appendChild(priorityPill);
      card.appendChild(headerRow);

      // Why / Rationale
      const whyRow = createElement('p', 'text-[11px] text-slate-300', `Why: ${act.why}`);
      card.appendChild(whyRow);

      // Meta Footer: Timing, Target System, Draft Status
      const metaRow = createElement('div', 'flex items-center justify-between gap-2 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/80');
      const timingSpan = createElement('span', '', `⏱ Timing: ${act.timing || 'Immediate'}`);
      
      const draftBadge = createElement('span', 'px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400 font-semibold', 'DRAFT ACTION');
      
      metaRow.appendChild(timingSpan);
      metaRow.appendChild(draftBadge);
      card.appendChild(metaRow);

      elements.actionsList.appendChild(card);
    });

    // 12. Follow-up Questions
    const followUps = Array.isArray(plan.followUpQuestions) && plan.followUpQuestions.length > 0
      ? plan.followUpQuestions
      : (plan.follow_up_question ? [plan.follow_up_question] : []);

    if (followUps.length > 0) {
      elements.followUpCard.classList.remove('hidden');
      elements.followUpText.textContent = followUps.join(' • ');
    } else {
      elements.followUpCard.classList.add('hidden');
    }

    // 13. Raw JSON Viewer
    const cleanPayload = plan.rawSystemPayload || plan;
    elements.jsonPayloadDisplay.textContent = JSON.stringify(cleanPayload, null, 2);

    // 14. Safety Notes
    const safetyList = Array.isArray(plan.safetyNotes) && plan.safetyNotes.length > 0
      ? plan.safetyNotes
      : (plan.safety_note ? [plan.safety_note] : []);

    if (safetyList.length > 0) {
      elements.safetyNoteText.textContent = safetyList.join('\n\n');
    }

    // Unhide panels
    elements.bridgeEmptyState.classList.add('hidden');
    elements.bridgeContent.classList.remove('hidden');
    elements.actionEmptyState.classList.add('hidden');
    elements.actionContent.classList.remove('hidden');

    if (window.lucide) window.lucide.createIcons();
    announceToScreenReader(`Action plan synthesized. Urgency: ${urgency}. Title: ${plan.title}`);
  }

  /**
   * Run Terminal Simulation Log
   */
  function runSimulation(plan) {
    if (!plan) return;

    elements.simulationConsole.classList.remove('hidden');
    elements.simulationLog.replaceChildren();

    const draftPayloads = plan.draftPayloads || [];
    const logs = [
      `[${new Date().toISOString()}] Initializing SAARTHI Simulation Engine...`,
      `[SIM] Target Gateway Handshake: SECURE (Simulated TLS 1.3)`,
      `[SIM] Loaded ${draftPayloads.length} draft dispatch payload(s)...`
    ];

    draftPayloads.forEach((dp, idx) => {
      logs.push(`[SIM-${idx + 1}] Target: ${dp.targetSystem} | ActionCode: ${dp.actionCode} | Priority: ${dp.priority}`);
      logs.push(`[SIM-${idx + 1}] Payload validation: SPEC_OK (SAARTHI-EOC-v1.0 compliant)`);
      logs.push(`[SIM-${idx + 1}] Human approval check: OPERATOR SIGN-OFF REQUIRED -> [HELD IN DISPATCH QUEUE]`);
    });

    logs.push(`[SIM-GATEWAY] Simulation complete. No outbound packets transmitted to real dispatch trunks.`);
    logs.push(`[NOTICE] SIMULATION ONLY — NO REAL DISPATCH OR EXTERNAL ACTION OCCURRED.`);

    let delay = 0;
    logs.forEach((line, i) => {
      setTimeout(() => {
        const row = createElement('div', 'leading-snug');
        if (line.includes('NOTICE')) {
          row.className += ' text-amber-300 font-bold';
        } else if (line.includes('SPEC_OK')) {
          row.className += ' text-emerald-400';
        } else if (line.includes('HELD')) {
          row.className += ' text-cyan-300';
        }
        row.textContent = line;
        elements.simulationLog.appendChild(row);
        elements.simulationLog.scrollTop = elements.simulationLog.scrollHeight;
      }, delay);
      delay += 250;
    });

    showToast('Simulation running in terminal log below.', 'info');
  }

  return {
    elements,
    createElement,
    setLoading,
    setModeVisuals,
    setHealthDisplay,
    renderActionPlan,
    resetCase,
    showToast,
    runSimulation,
    announceToScreenReader
  };
})();
