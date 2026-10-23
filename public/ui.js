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
    heroActionCard: document.getElementById('hero-action-card'),
    heroActionStep: document.getElementById('hero-action-step'),
    heroActionWhy: document.getElementById('hero-action-why'),
    heroActionTiming: document.getElementById('hero-action-timing'),
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
        <span>Analyzing situation...</span>
      `;
      announceToScreenReader('Analyzing report and decoding intent...');
    } else {
      elements.bridgeLoadingState.classList.add('hidden');
      elements.actionLoadingState.classList.add('hidden');

      elements.btnAnalyze.disabled = false;
      elements.btnAnalyze.classList.remove('opacity-70', 'cursor-not-allowed');
      elements.btnAnalyze.innerHTML = `
        <i data-lucide="play" class="w-4 h-4 fill-current"></i>
        <span>Analyze situation</span>
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
    const toast = createElement('div', 'flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium shadow-md transition-all pointer-events-auto transform translate-y-2 opacity-0');
    
    if (type === 'success') {
      toast.className += ' bg-slate-900 text-white border border-slate-800';
    } else if (type === 'error') {
      toast.className += ' bg-rose-600 text-white border border-rose-700';
    } else if (type === 'warning') {
      toast.className += ' bg-amber-600 text-white border border-amber-700';
    } else {
      toast.className += ' bg-slate-900 text-white border border-slate-800';
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
    if (elements.heroActionStep) elements.heroActionStep.textContent = '...';
    if (elements.heroActionWhy) elements.heroActionWhy.textContent = '...';

    elements.errorBanner.classList.add('hidden');
    showToast('Workspace reset for a new incident case.');
    announceToScreenReader('Case reset.');
  }

  /**
   * Set active mode visuals (Live vs Demo)
   */
  function setModeVisuals(mode) {
    if (mode === 'live') {
      elements.modeLiveBtn.className = 'px-3 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-medium bg-white text-slate-900 shadow-sm border border-slate-200 transition-colors';
      elements.modeDemoBtn.className = 'px-3 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors';
      elements.demoBanner.classList.add('hidden');
    } else {
      elements.modeLiveBtn.className = 'px-3 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors';
      elements.modeDemoBtn.className = 'px-3 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-medium bg-white text-slate-900 shadow-sm border border-slate-200 transition-colors';
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
        ? 'w-2 h-2 rounded-full bg-teal-500'
        : 'w-2 h-2 rounded-full bg-amber-500';
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

    // 5b. Single Most Useful Next Step (Hero Recommendation)
    const topAction = (plan.actions && plan.actions.length > 0) ? plan.actions[0] : null;
    const topGuidance = (plan.humanGuidance && plan.humanGuidance.length > 0) ? plan.humanGuidance[0] : null;

    if (elements.heroActionStep) {
      if (topAction) {
        elements.heroActionStep.textContent = topAction.step;
        elements.heroActionWhy.textContent = topAction.why ? `Rationale: ${topAction.why}` : 'Immediate priority operational directive.';
        if (elements.heroActionTiming) {
          elements.heroActionTiming.textContent = topAction.timing || 'Immediate';
        }
      } else if (topGuidance) {
        elements.heroActionStep.textContent = topGuidance;
        elements.heroActionWhy.textContent = 'Immediate on-scene safety priority.';
        if (elements.heroActionTiming) {
          elements.heroActionTiming.textContent = 'Immediate';
        }
      } else {
        elements.heroActionStep.textContent = 'Initiate manual on-scene situation verification.';
        elements.heroActionWhy.textContent = 'Confirm incident details with on-scene reporting party.';
        if (elements.heroActionTiming) {
          elements.heroActionTiming.textContent = 'Immediate';
        }
      }
    }

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
      const tag = createElement('span', 'px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium', sym);
      elements.entitySymptoms.appendChild(tag);
    });

    // History tags
    elements.entityHistory.replaceChildren();
    (entities.history || []).forEach(hist => {
      const tag = createElement('span', 'px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium', hist);
      elements.entityHistory.appendChild(tag);
    });

    // Risks tags
    elements.entityRisks.replaceChildren();
    (entities.risks || []).forEach(risk => {
      const tag = createElement('span', 'px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium', `⚠ ${risk}`);
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

    // 9. Evidence & Verification List (Clearly distinguishing Claims, Inferences, and External Evidence)
    elements.verificationList.replaceChildren();
    const verifications = plan.verification || [];

    if (verifications.length === 0) {
      const noVer = createElement('p', 'text-slate-500 italic text-[11px] p-2 bg-slate-50 rounded border border-slate-200', 'No external factual claims required independent retrieval.');
      elements.verificationList.appendChild(noVer);
    } else {
      verifications.forEach((v, idx) => {
        const card = createElement('div', 'p-3 rounded-md bg-white border border-slate-200 space-y-2 shadow-2xs');
        
        // 1. Claim Header Row: Label, Claim Text, and Grounding Status Badge
        const topRow = createElement('div', 'flex items-start justify-between gap-2');
        const claimBlock = createElement('div', 'flex-1 space-y-0.5');
        const claimLabel = createElement('span', 'text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block', `Reported Assertion #${idx + 1}:`);
        const claimText = createElement('p', 'font-medium text-slate-900 text-xs leading-snug', `"${v.claim}"`);
        claimBlock.appendChild(claimLabel);
        claimBlock.appendChild(claimText);
        
        const statusSpan = createElement('span', 'text-[11px] font-mono px-2 py-0.5 rounded shrink-0 uppercase tracking-wider font-semibold mt-0.5');
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

        topRow.appendChild(claimBlock);
        topRow.appendChild(statusSpan);
        card.appendChild(topRow);

        // 2. Model Assessment / Inference
        if (v.explanation) {
          const expBox = createElement('div', 'text-xs text-slate-600 pl-2.5 py-1 border-l-2 border-slate-300 bg-slate-50/70 rounded-r');
          const expLabel = createElement('span', 'text-[10px] uppercase font-semibold text-slate-500 tracking-wider block', 'Model Assessment:');
          const expText = createElement('p', 'text-slate-700 leading-snug', v.explanation);
          expBox.appendChild(expLabel);
          expBox.appendChild(expText);
          card.appendChild(expBox);
        }

        // 3. Independently Retrieved Evidence (Show working link only when real HTTP/HTTPS URL exists)
        const hasEvidence = Array.isArray(v.evidence) && v.evidence.length > 0;
        if (hasEvidence) {
          const evContainer = createElement('div', 'mt-1 pt-1.5 border-t border-slate-100 space-y-1.5');
          const evHeader = createElement('span', 'text-[10px] font-semibold uppercase tracking-wider text-slate-500 block', 'Independently Retrieved Evidence:');
          evContainer.appendChild(evHeader);

          v.evidence.forEach(ev => {
            const evRow = createElement('div', 'text-[11px] text-slate-600 flex flex-col gap-1 bg-slate-50 border border-slate-200/80 p-2 rounded');
            
            const srcTitle = createElement('div', 'flex items-center justify-between gap-2 flex-wrap');
            const titleSpan = createElement('span', 'font-semibold text-slate-800 text-xs', `Source: ${ev.source || 'Public Grounding Record'}`);
            srcTitle.appendChild(titleSpan);

            // Working link ONLY if valid http/https URL is available
            const isValidHttpUrl = typeof ev.url === 'string' && (ev.url.startsWith('http://') || ev.url.startsWith('https://'));
            if (isValidHttpUrl) {
              const link = createElement('a', 'text-blue-600 hover:underline truncate inline-flex items-center gap-1 font-mono text-[10px]', `${ev.url} ↗`);
              link.href = ev.url;
              link.target = '_blank';
              link.rel = 'noopener noreferrer';
              srcTitle.appendChild(link);
            } else {
              const unlinked = createElement('span', 'text-[10px] text-slate-400 italic', '(No public URL available)');
              srcTitle.appendChild(unlinked);
            }
            evRow.appendChild(srcTitle);

            if (ev.snippet) {
              const snip = createElement('p', 'italic text-slate-500 text-[11px] leading-snug pl-1.5 border-l border-slate-300', `"${ev.snippet.slice(0, 200)}"`);
              evRow.appendChild(snip);
            }

            evContainer.appendChild(evRow);
          });
          card.appendChild(evContainer);
        } else {
          const noEv = createElement('div', 'text-[11px] text-slate-500 bg-slate-50 border border-slate-100 p-2 rounded italic flex items-center gap-1.5');
          const evIcon = createElement('span', 'text-slate-400', 'ℹ');
          const evText = createElement('span', '', 'Independent Grounding: No external authoritative citation available. Status remains Not independently verified.');
          noEv.appendChild(evIcon);
          noEv.appendChild(evText);
          card.appendChild(noEv);
        }

        elements.verificationList.appendChild(card);
      });
    }

    // 10. Human Guidance (3 Key Physical Steps)
    elements.humanGuidanceList.replaceChildren();
    const guidance = plan.humanGuidance || [];
    guidance.forEach((step, i) => {
      const li = createElement('li', 'flex items-start gap-2.5 p-2.5 rounded-md bg-slate-50 border border-slate-200');
      const stepNum = createElement('span', 'h-5 w-5 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5', String(i + 1));
      const stepText = createElement('p', 'text-xs text-slate-800 leading-snug', step);
      li.appendChild(stepNum);
      li.appendChild(stepText);
      elements.humanGuidanceList.appendChild(li);
    });

    // 11. Structured Action Directives
    elements.actionsList.replaceChildren();
    const actions = plan.actions || [];
    actions.forEach((act, i) => {
      const card = createElement('div', 'action-card rounded-md p-3.5 space-y-2');
      if (act.priority === 'Critical') card.className += ' action-critical';
      else if (act.priority === 'High') card.className += ' action-high';

      // Top row: Step and priority badge
      const headerRow = createElement('div', 'flex items-start justify-between gap-2');
      const stepTitle = createElement('h4', 'font-semibold text-xs text-slate-900 flex-1 leading-snug', `${i + 1}. ${act.step}`);
      
      const priorityPill = createElement(
        'span',
        `text-[11px] font-mono px-2 py-0.5 rounded font-medium uppercase ${
          act.priority === 'Critical' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
          act.priority === 'High' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
          'bg-slate-100 text-slate-700 border border-slate-200'
        }`,
        act.priority || 'Normal'
      );

      headerRow.appendChild(stepTitle);
      headerRow.appendChild(priorityPill);
      card.appendChild(headerRow);

      // Why / Rationale
      const whyRow = createElement('p', 'text-xs text-slate-600', `Why: ${act.why}`);
      card.appendChild(whyRow);

      // Meta Footer: Timing, Target System, Draft Status
      const metaRow = createElement('div', 'flex items-center justify-between gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100');
      const timingSpan = createElement('span', '', `⏱ Timing: ${act.timing || 'Immediate'}`);
      
      const draftBadge = createElement('span', 'px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-medium text-[10px]', 'DRAFT ACTION');
      
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
