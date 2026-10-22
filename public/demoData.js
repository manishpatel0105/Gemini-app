/**
 * SAARTHI AI — Demo Data Fixtures (Competition Build)
 * High-fidelity, deterministic presets for judging and offline exploration.
 * Structured strictly according to the SAARTHI Intent-to-Action JSON Schema.
 * 
 * Includes the 3 official competition scenarios + emergency dispatch:
 * A. Community Safety (Severe weather & blocked road report)
 * B. Health Information Organization (Messy symptom notes & clinician question prep)
 * C. Public-Service Navigation (Benefits application & fee exploitation prevention)
 * D. Medical Crisis (Acute coronary syndrome / highway triage)
 * 
 * Works in both Node.js (for backend testing/fallback) and browser environments.
 */

const DEMO_PRESETS = {
  // ---------------------------------------------------------------------------
  // SCENARIO A: Community Safety (Severe Weather & Blocked Road)
  // ---------------------------------------------------------------------------
  community_safety: {
    id: "preset_community_safety",
    name: "A. Community Safety",
    category: "DISASTER",
    subtitle: "Severe weather alert • Blocked underpass rumor vs eyewitness • Safe route check",
    inputText: "WhatsApp forward received at 4:30 PM: 'URGENT: Red alert in Sector 14-18 belt! Main arterial underpass completely flooded with 4 feet water, large fallen neem tree crushed a streetlight and road is officially closed until tomorrow morning! Take bypass road through village.' But my colleague just passed the same underpass 20 minutes ago and says cars were moving slowly, though water was pooling near the culvert and wind is picking up heavily. Is the road actually shut down or can I drive home before dark?",
    language: "en-IN",
    context: "community_safety",
    hasImage: false,
    imageInfo: null,
    plan: {
      title: "Severe Weather Travel Advisory & Underpass Road Closure Verification",
      intent: {
        said: "Inquiring whether the Sector 14-18 arterial underpass is officially closed due to flooding and a fallen tree, weighing a viral WhatsApp alert against an eyewitness report.",
        trueIntent: "Route safety verification, identifying confirmed vs unconfirmed road hazards, and establishing safe contingency travel protocols during worsening weather."
      },
      urgency: "High",
      confidenceScore: 0.94,
      domain: "DISASTER",
      summary: "Conflicting reports exist regarding the Sector 14-18 arterial underpass. A viral forward claims complete 4-foot inundation and official closure, while a recent eyewitness observed slow-moving traffic with localized pooling and gusty winds. The situation is dynamically deteriorating; official traffic police verification is required prior to transit.",
      facts: [
        "User received a viral WhatsApp forward at 4:30 PM asserting a red alert, 4-foot water level, fallen tree, and road closure.",
        "An eyewitness colleague drove through the underpass ~20 minutes prior and observed slow-moving traffic with culvert pooling.",
        "Weather conditions are actively deteriorating with intensifying wind speeds.",
        "User is evaluating whether to attempt commuting home via the underpass before nightfall."
      ],
      unknowns: [
        "Whether municipal traffic police or PWD have issued a formal, gazetted road closure order.",
        "Current water level rate of rise at the culvert over the last 20 minutes.",
        "Presence of downed live electrical wires from the reportedly crushed streetlight.",
        "Roadway and drainage conditions along the alternative unpaved village bypass."
      ],
      conflicts: [
        "WhatsApp forward claims the road is officially closed until morning, whereas direct eyewitness confirmed vehicle transit 20 minutes ago."
      ],
      extractedEntities: {
        primaryIssue: "Severe Weather Underpass Inundation & Rumored Road Closure",
        symptoms: [
          "Localized water pooling near culvert",
          "Accelerating wind gusts",
          "Reported fallen tree obstructing roadway"
        ],
        history: [
          "Arterial underpass susceptible to rapid monsoon waterlogging during intense precipitation"
        ],
        risks: [
          "Hydrostatic vehicle stall in blind underpass depression",
          "Crushed streetlight potentially carrying energization risk",
          "Narrow village bypass becoming unnavigable in low-light rain conditions"
        ],
        locationContext: "Sector 14-18 arterial underpass corridor and adjacent village bypass route"
      },
      verification: [
        {
          claim: "Arterial underpass is officially closed by municipal authority.",
          status: "Unverified",
          evidenceUrl: "https://traffic.delhipolice.gov.in",
          evidenceExplanation: "No official municipal closure notice has been posted on the regional traffic authority advisory portal as of last check.",
          evidence: [
            {
              source: "Metropolitan Traffic Police Public Advisory Feed",
              url: "https://traffic.delhipolice.gov.in",
              snippet: "Real-time traffic diversions are broadcasted via official handle @dtptraffic; unverified messaging forwards often misrepresent spot congestion as statutory closures.",
              retrievedAt: "2026-10-23T04:30:00Z"
            }
          ],
          explanation: "The viral claim of official closure is unverified and contradicts recent eyewitness observation. Official traffic handles must be checked directly."
        },
        {
          claim: "Underpass depressions experience rapid flash waterlogging during high-wind rainfall.",
          status: "Verified",
          evidenceUrl: "https://ndma.gov.in",
          evidenceExplanation: "National Disaster Management Authority urban flood guidelines document rapid depth increases in railway/highway underpasses.",
          evidence: [
            {
              source: "National Disaster Management Authority (NDMA) Urban Flood Safety Guidelines",
              url: "https://ndma.gov.in",
              snippet: "Motorists are cautioned that submerged underpasses conceal deep potholes and rising water; never drive through moving water of unknown depth.",
              retrievedAt: "2026-10-23T04:30:00Z"
            }
          ],
          explanation: "Regardless of closure status, underpasses pose severe hydrostatic lock and submersion perils during active pooling."
        }
      ],
      actions: [
        {
          step: "Check Official Traffic Police Advisory (@dtptraffic or Local Traffic Helpline) Before Commencing Travel",
          why: "Distinguishes actual civil blockades from viral social media rumors without relying on stale reports.",
          timing: "Immediate (< 5 minutes)",
          priority: "High",
          requiresHumanApproval: true
        },
        {
          step: "Avoid Entering Underpass if Standing Water Reaches Mid-Wheel Level",
          why: "Entering standing water of 6+ inches can cause catalytic stall and rapid interior flooding in low-clearance passenger cars.",
          timing: "During commute",
          priority: "Critical",
          requiresHumanApproval: true
        },
        {
          step: "Identify Well-Lit Elevated Alternative Arterials Over Unpaved Rural Bypasses",
          why: "Unpaved village roads carry severe mud-trap hazards and lack emergency towing during storm conditions.",
          timing: "Before departure",
          priority: "Normal",
          requiresHumanApproval: true
        }
      ],
      humanGuidance: [
        "DO NOT RUSH INTO THE UNDERPASS: If water is visibly pooling past the curb or you cannot see the road markings, TURN AROUND immediately.",
        "CHECK OFFICIAL CHANNELS: Verify traffic status via the official police Twitter/X feed or traffic hotline rather than forwarding unverified WhatsApp alerts.",
        "STAY OFF UNLIGHTED BYPASSES: If traveling before dark, prefer major multi-lane elevated corridors even if slightly slower than village cut-throughs."
      ],
      draftPayloads: [
        {
          targetSystem: "CIVIC_TRAFFIC_EOC",
          actionCode: "CIVIC_INCIDENT_REPORT",
          priority: "P2",
          payloadSummary: "Verify water level & tree obstruction at Sector 14-18 Underpass. Spot culvert pooling reported.",
          sent: false
        },
        {
          targetSystem: "METROPOLITAN_PWD_HELPDESK",
          actionCode: "DRAINAGE_INSPECTION_REQUEST",
          priority: "P2",
          payloadSummary: "Inspect culvert drainage pumps and streetlight integrity at Sector 14-18 arterial approach.",
          sent: false
        }
      ],
      rawSystemPayload: {
        header: {
          specVersion: "SAARTHI-EOC-v1.0",
          incidentId: "INC-CIV-2026-3021",
          timestampUtc: "2026-10-23T04:30:00Z",
          classification: "DRAFT_SIMULATION_ONLY",
          regulatoryNotice: "DRAFT PAYLOAD — NOT SENT TO ANY REAL SYSTEM"
        },
        context: "COMMUNITY_SAFETY_WEATHER",
        hazardTriage: {
          rumorValidation: "CONFLICTING_EYEWITNESS_VS_FORWARD",
          weatherCondition: "ACCELERATING_GUSTS_RAINFALL",
          recommendedStatus: "ROUTE_CAUTION_CHECK_OFFICIAL"
        }
      },
      safety_note: "PUBLIC SAFETY ADVISORY: This tool provides information organization and does not replace live meteorological or traffic authority directives. If stranded in rising water, exit vehicle to higher ground immediately.",
      safetyNotes: [
        "PUBLIC SAFETY ADVISORY: This tool provides information organization and does not replace live meteorological or traffic authority directives.",
        "Never drive through standing floodwater of unknown depth.",
        "Treat all downed utility poles and streetlights as energized until certified isolated by the electric utility."
      ],
      follow_up_question: "Are you currently in a safe indoor shelter, and what vehicle type (two-wheeler, hatchback, SUV) are you intending to drive?",
      followUpQuestions: [
        "Are you currently in a safe indoor shelter or already in transit?",
        "What vehicle type (two-wheeler, hatchback, SUV) are you intending to drive?"
      ]
    }
  },

  // ---------------------------------------------------------------------------
  // SCENARIO B: Health Information Organization (Symptoms & Meds Notes)
  // ---------------------------------------------------------------------------
  health_organization: {
    id: "preset_health_organization",
    name: "B. Health Information Organization",
    category: "CIVIC",
    subtitle: "Messy symptoms note • Metformin + Amlodipine + new Ibuprofen • Clinician questions",
    inputText: "My father (62) has been feeling unusually fatigued for the past 2 weeks, with mild swelling in both ankles by evening. He has had Type 2 diabetes for 8 years (takes Metformin 500mg twice daily) and mild hypertension (Amlodipine 5mg morning). Yesterday he started an OTC painkiller (Ibuprofen 400mg) for lower back pain, and today he noticed decreased urination and slight nausea. Can he continue the Ibuprofen, and what should we ask his doctor when we visit tomorrow?",
    language: "en-IN",
    context: "health_notes",
    hasImage: false,
    imageInfo: null,
    plan: {
      title: "Clinical Consultation Preparation: Symptom Timeline & NSAID-Renal Risk Organization",
      intent: {
        said: "Father (62) with diabetes and hypertension on Metformin/Amlodipine developed fatigue, ankle swelling, and acute oliguria/nausea after taking OTC Ibuprofen for back pain; inquiring about drug safety and doctor consultation questions.",
        trueIntent: "Organizing patient clinical timeline, flagging high-risk OTC NSAID interaction with underlying diabetic renal function, and preparing targeted questions for the treating physician."
      },
      urgency: "High",
      confidenceScore: 0.95,
      domain: "MEDICAL",
      summary: "Patient details organized for physician consultation. 62-year-old male with chronic diabetes and hypertension presenting with progressive fatigue and ankle edema, followed by acute decreased urination (oliguria) and nausea after starting OTC Ibuprofen. In patients with diabetes and hypertension, NSAIDs carry significant risk of acute kidney injury (AKI) and blunting of antihypertensive effect. Immediate withholding of OTC NSAID pending clinical evaluation is strongly recommended.",
      facts: [
        "Patient is a 62-year-old male.",
        "Chronic conditions: Type 2 Diabetes Mellitus (8 years) and Hypertension.",
        "Current maintenance medications: Metformin 500mg twice daily; Amlodipine 5mg once daily.",
        "Symptoms: Progressive fatigue (2 weeks), bilateral ankle swelling (evenings), acute decreased urination (today), and nausea (today).",
        "Recent change: Initiated over-the-counter Ibuprofen 400mg yesterday for lower back pain."
      ],
      unknowns: [
        "Most recent baseline renal function panel (Serum Creatinine, eGFR, Blood Urea Nitrogen).",
        "Most recent HbA1c and home blood glucose readings.",
        "Current resting blood pressure measurement.",
        "Exact 24-hour fluid intake and presence of fever or urinary burning/dysuria."
      ],
      conflicts: [
        "Patient is considering continuing an OTC NSAID (Ibuprofen) for pain relief, but new-onset oliguria and nausea suggest potential acute renal stress requiring medical review."
      ],
      extractedEntities: {
        primaryIssue: "Symptom & Medication History Organization for Physician Evaluation",
        symptoms: [
          "Generalized fatigue (2 weeks duration)",
          "Bilateral peripheral ankle edema (evening onset)",
          "Acute oliguria (decreased urine output)",
          "Mild nausea",
          "Lower back pain (trigger for analgesic)"
        ],
        history: [
          "Type 2 Diabetes Mellitus (8 years duration)",
          "Essential Hypertension"
        ],
        risks: [
          "NSAID-induced Acute Kidney Injury (AKI) in diabetic patient",
          "Metformin accumulation risk if renal clearance is impaired",
          "Worsening fluid retention / edema"
        ],
        locationContext: "Home outpatient setting; scheduled for in-person physician appointment tomorrow"
      },
      verification: [
        {
          claim: "NSAIDs (Ibuprofen) can impair renal hemodynamics in diabetic and hypertensive patients.",
          status: "Verified",
          evidenceUrl: "https://www.kidney.org",
          evidenceExplanation: "National Kidney Foundation and clinical pharmacology guidelines document that NSAIDs inhibit prostaglandins, reducing renal blood flow and eGFR in chronic kidney disease or diabetes.",
          evidence: [
            {
              source: "National Kidney Foundation (NKF) Clinical Care Protocols",
              url: "https://www.kidney.org",
              snippet: "Patients with diabetes and hypertension should avoid routine NSAID usage without nephrologist approval due to heightened risk of acute interstitial nephritis and renal hypoperfusion.",
              retrievedAt: "2026-10-23T04:30:00Z"
            }
          ],
          explanation: "Established pharmacologic risk. Co-administration of Metformin during acute renal decrement also requires medical oversight."
        },
        {
          claim: "SAARTHI AI can provide clinical diagnosis or adjust prescription dosages.",
          status: "Contradicted",
          evidenceUrl: "https://www.mohfw.gov.in",
          evidenceExplanation: "Telemedicine Practice Guidelines and statutory health standards require registered medical practitioners to conduct diagnosis and dosing.",
          evidence: [
            {
              source: "Ministry of Health & Family Welfare Telemedicine Practice Guidelines",
              url: "https://www.mohfw.gov.in",
              snippet: "Algorithmic and decision-support systems must not replace registered clinical diagnosis, laboratory testing, or physician prescribing authority.",
              retrievedAt: "2026-10-23T04:30:00Z"
            }
          ],
          explanation: "This system organizes notes and questions but strictly avoids diagnosing or prescribing."
        }
      ],
      actions: [
        {
          step: "Withhold Further Doses of OTC Ibuprofen Pending Tomorrow's Doctor Visit",
          why: "Halts further prostaglandin inhibition and mitigates acute renal perfusion stress until kidney function is checked.",
          timing: "Immediate",
          priority: "Critical",
          requiresHumanApproval: true
        },
        {
          step: "Log 24-Hour Urine Output and Fluid Intake in a Written Notebook",
          why: "Provides objective intake/output volumetric data to the consulting physician to assess true oliguria.",
          timing: "Today until appointment",
          priority: "High",
          requiresHumanApproval: true
        },
        {
          step: "Present Structured Clinical Questions to the Physician Tomorrow",
          why: "Ensures essential diagnostic tests (Serum Creatinine, eGFR, Urinalysis) are requested during consultation.",
          timing: "During consultation tomorrow",
          priority: "High",
          requiresHumanApproval: true
        }
      ],
      humanGuidance: [
        "BRING ALL MEDICATION PACKAGES: Take his Metformin, Amlodipine, and the exact Ibuprofen strip to the clinic so the doctor sees exact strengths.",
        "WRITE DOWN THIS SPECIFIC QUESTION LIST: Ask the doctor: 'Given his new decreased urination and diabetes, should we check his Serum Creatinine and eGFR today, and is an alternative for his back pain safer than Ibuprofen?'",
        "RED FLAG WARNING: If he develops severe vomiting, shortness of breath, confusion, or complete inability to pass urine, go to the Emergency Room tonight without waiting for tomorrow."
      ],
      draftPayloads: [
        {
          targetSystem: "CLINICAL_SUMMARY_EXPORT",
          actionCode: "PATIENT_BRIEF_GENERATION",
          priority: "P2",
          payloadSummary: "Patient Brief: 62M, T2DM, HTN, Metformin+Amlodipine. Acute oliguria + nausea post-Ibuprofen. Clinician consultation prep.",
          sent: false
        }
      ],
      rawSystemPayload: {
        header: {
          specVersion: "SAARTHI-EOC-v1.0",
          incidentId: "INC-MED-2026-7782",
          timestampUtc: "2026-10-23T04:30:00Z",
          classification: "DRAFT_SIMULATION_ONLY",
          regulatoryNotice: "DRAFT PAYLOAD — NOT SENT TO ANY REAL SYSTEM"
        },
        context: "HEALTH_INFORMATION_ORGANIZATION",
        clinicalTriage: {
          patientAge: 62,
          comorbidities: ["TYPE_2_DIABETES", "HYPERTENSION"],
          offendingDrugTrigger: "IBUPROFEN_OTC",
          reportedSymptomOnset: "ACUTE_OLIGURIA_NAUSEA",
          advisoryAction: "WITHHOLD_NSAID_PHYSICIAN_EVAL_RECOMMENDED"
        }
      },
      safety_note: "CLINICAL INFORMATION DISCLAIMER: SAARTHI AI is an information-structuring tool. It does NOT diagnose conditions, prescribe medications, or replace a clinical consultation. If red flag symptoms appear, seek emergency medical care immediately.",
      safetyNotes: [
        "CLINICAL INFORMATION DISCLAIMER: SAARTHI AI is an information-structuring tool, not a physician.",
        "Do not discontinue prescribed chronic medications (Metformin, Amlodipine) without explicit physician instructions.",
        "Seek emergency hospital care if chest tightness, labored breathing, or severe intractable vomiting occurs."
      ],
      follow_up_question: "Has he passed any urine in the last 6 to 8 hours, and does he have any swelling in his face or around his eyes?",
      followUpQuestions: [
        "Has he passed any urine in the last 6 to 8 hours?",
        "Does he have any puffiness or swelling around his eyes or hands?"
      ]
    }
  },

  // ---------------------------------------------------------------------------
  // SCENARIO C: Public-Service Navigation (Benefits & Application Aid)
  // ---------------------------------------------------------------------------
  public_service: {
    id: "preset_public_service",
    name: "C. Public-Service Navigation",
    category: "CIVIC",
    subtitle: "Senior pension & disability benefits • Fee exploitation check • Official portal guide",
    inputText: "I'm trying to apply for the senior citizen pension scheme and disability assistance for my uncle (67yo, partial visual impairment). The cyber cafe guy asked for ₹2,500 cash and told us to submit his ration card, old voter ID, and a medical certificate from 2018, but a neighbor said the state portal requires an Aadhaar-linked bank account, income certificate below ₹2 lakh, and a new digital UDID disability card. Is the offline form still valid, and do we have to pay this fee or can we apply directly through the government portal?",
    language: "en-IN",
    context: "public_service",
    hasImage: false,
    imageInfo: null,
    plan: {
      title: "Public Benefit Navigation: Senior Pension (IGNOAPS) & UDID Disability Application Guide",
      intent: {
        said: "Inquiring about applying for senior pension and disability benefits for a 67-year-old uncle with visual impairment, questioning a ₹2,500 intermediary cash demand and conflicting documentation requirements.",
        trueIntent: "Clarifying legitimate government welfare eligibility, preventing unauthorized fee exploitation, and organizing mandatory digital documentation for official portal submission."
      },
      urgency: "Moderate",
      confidenceScore: 0.96,
      domain: "CIVIC",
      summary: "Navigational guidance for National Social Assistance Programme (NSAP) senior pension and Unique Disability ID (UDID) assistance. Demands for ₹2,500 cash by private cyber cafe operators represent unauthorized intermediary exploitation: official government applications are free of service fees or carry nominal CSC fee caps (₹30–50). Submissions require an active Aadhaar-seeded bank account, current income certificate, and a digital UDID card rather than an expired 2018 paper slip.",
      facts: [
        "Beneficiary is a 67-year-old male with reported partial visual impairment.",
        "Seeking both Senior Citizen Pension and Disability Assistance benefits.",
        "Cyber cafe operator demanded ₹2,500 cash to file the application with 2018 medical certificate and ration card.",
        "Beneficiary has existing ration card and voter ID; status of Aadhaar bank seeding and UDID card is unconfirmed."
      ],
      unknowns: [
        "Specific State / Union Territory of residence (NSAP pension top-ups and income cutoffs vary by state).",
        "Whether applicant's bank account has active NPCI Aadhaar-DBT (Direct Benefit Transfer) mapping.",
        "Certified percentage of visual impairment (national disability assistance typically requires ≥ 40% certified disability on UDID portal).",
        "Current annual household income verified by Tehsildar / Revenue Authority."
      ],
      conflicts: [
        "Cyber cafe claims ₹2,500 cash fee and 2018 medical certificate suffice, whereas official guidelines provide free/nominal filing and mandate national UDID registration."
      ],
      extractedEntities: {
        primaryIssue: "Senior Pension & Disability Welfare Scheme Navigation & Fee Protection",
        symptoms: [],
        history: [
          "Possesses 2018 legacy medical certificate",
          "Possesses ration card and voter ID"
        ],
        risks: [
          "Financial exploitation via unauthorized intermediary fee (₹2,500)",
          "Application rejection due to obsolete 2018 medical slip instead of digital UDID card",
          "Pension disbursement failure if bank account is not Aadhaar-DBT seeded"
        ],
        locationContext: "State Social Welfare Department jurisdiction / CSC Common Service Center network"
      },
      verification: [
        {
          claim: "Government pension applications under NSAP carry no official ₹2,500 filing fee.",
          status: "Verified",
          evidenceUrl: "https://nsap.nic.in",
          evidenceExplanation: "National Social Assistance Programme guidelines state that social welfare schemes are free public services, and Common Service Centers (CSCs) have strictly regulated nominal transaction fees.",
          evidence: [
            {
              source: "Ministry of Rural Development — NSAP Portal Guidelines",
              url: "https://nsap.nic.in",
              snippet: "Application forms for Indira Gandhi National Old Age Pension Scheme (IGNOAPS) can be filed online free of charge or through authorized CSCs for nominal government-fixed charges.",
              retrievedAt: "2026-10-23T04:30:00Z"
            }
          ],
          explanation: "Demanding ₹2,500 for welfare form filling is fraudulent intermediary behavior. Beneficiaries can file directly on nsap.nic.in or at district social welfare offices."
        },
        {
          claim: "Unique Disability ID (UDID) digital card is the mandatory national standard for disability schemes.",
          status: "Verified",
          evidenceUrl: "https://www.swavlambancard.gov.in",
          evidenceExplanation: "Department of Empowerment of Persons with Disabilities mandates digital UDID cards for all central and state welfare benefits.",
          evidence: [
            {
              source: "Department of Empowerment of Persons with Disabilities (DEPwD)",
              url: "https://www.swavlambancard.gov.in",
              snippet: "The UDID card serves as the single national document of identification and disability verification, replacing manual state hospital certificates.",
              retrievedAt: "2026-10-23T04:30:00Z"
            }
          ],
          explanation: "The 2018 manual slip must be transitioned to the UDID portal via online medical board assessment."
        }
      ],
      actions: [
        {
          step: "DO NOT PAY the ₹2,500 Cash Demand to Private Intermediaries",
          why: "Welfare scheme forms are free. Authorized Common Service Centers (CSC) charge only a fixed nominal fee (₹30–50).",
          timing: "Immediate",
          priority: "Critical",
          requiresHumanApproval: true
        },
        {
          step: "Apply for Digital UDID Card on Official Swavlamban Portal (swavlambancard.gov.in)",
          why: "Converts legacy 2018 medical slip into the legally mandated national digital disability credential.",
          timing: "Step 1 of application",
          priority: "High",
          requiresHumanApproval: true
        },
        {
          step: "Verify Aadhaar-DBT Seeding at Beneficiary's Bank Branch",
          why: "Direct Benefit Transfer pension disbursements bounce if the account lacks NPCI Aadhaar bridge linking.",
          timing: "Step 2 of application",
          priority: "High",
          requiresHumanApproval: true
        },
        {
          step: "Submit Online Pension Application on Official NSAP Portal (nsap.nic.in) or District Social Welfare Office",
          why: "Ensures direct government registry enrollment without unverified third-party paper intermediaries.",
          timing: "Step 3 of application",
          priority: "High",
          requiresHumanApproval: true
        }
      ],
      humanGuidance: [
        "REFUSE PRIVATE FEES: Report or decline any person charging thousands of rupees to file government pension forms. Visit a government-authorized CSC center (csc.gov.in) where charges are capped.",
        "GATHER REQUIRED DOCUMENTS: Prepare: (1) Aadhaar Card, (2) Bank passbook copy with IFSC, (3) Recent passport photo, (4) Income certificate from local Tehsildar, (5) New UDID registration receipt.",
        "USE OFFICIAL PORTALS ONLY: Access the national portal at https://nsap.nic.in or your respective State Social Welfare Department website."
      ],
      draftPayloads: [
        {
          targetSystem: "PUBLIC_PORTAL_ROUTING",
          actionCode: "BENEFITS_NAVIGATOR_DIRECTIVE",
          priority: "P2",
          payloadSummary: "Route to NSAP IGNOAPS + Swavlamban UDID workflows. Issue fee-exploitation alert to applicant.",
          sent: false
        }
      ],
      rawSystemPayload: {
        header: {
          specVersion: "SAARTHI-EOC-v1.0",
          incidentId: "INC-PUB-2026-1904",
          timestampUtc: "2026-10-23T04:30:00Z",
          classification: "DRAFT_SIMULATION_ONLY",
          regulatoryNotice: "DRAFT PAYLOAD — NOT SENT TO ANY REAL SYSTEM"
        },
        context: "PUBLIC_SERVICE_NAVIGATION",
        schemeEligibility: {
          targetScheme: "IGNOAPS_AND_DISABILITY_PENSION",
          applicantAge: 67,
          mandatoryCredentials: ["UDID_DIGITAL_CARD", "AADHAAR_DBT_SEEDED_ACCOUNT", "INCOME_CERTIFICATE"],
          antiFraudAlert: "UNAUTHORIZED_INTERMEDIARY_FEE_FLAGGED"
        }
      },
      safety_note: "PUBLIC SERVICE NOTICE: SAARTHI AI provides procedural navigation and information. It is not an official government portal and does not submit welfare applications directly. Never share banking PINs, OTPs, or passwords.",
      safetyNotes: [
        "PUBLIC SERVICE NOTICE: SAARTHI AI provides navigational guidance, not official government processing.",
        "Never share bank account passwords, UPI PINs, or Aadhaar OTPs with cyber cafe operators or third parties.",
        "Official government welfare applications carry no hidden processing fee."
      ],
      follow_up_question: "Which State and District does your uncle reside in, and is his bank account already linked to his Aadhaar card?",
      followUpQuestions: [
        "Which State and District does your uncle reside in?",
        "Is his bank account currently linked with his Aadhaar card for Direct Benefit Transfer (DBT)?"
      ]
    }
  },

  // ---------------------------------------------------------------------------
  // SCENARIO D: Medical Crisis (Acute Coronary Syndrome / Highway Triage)
  // ---------------------------------------------------------------------------
  medical_crisis: {
    id: "preset_medical_crisis",
    name: "D. Emergency Dispatch",
    category: "MEDICAL",
    subtitle: "Panicked Hinglish report • Sudden chest pain • NH48 Toll bottleneck",
    inputText: "Arrey suno jaldi, pitaji (68 yr) ko achanak chest me bohot tez dard ho raha hai, left arm me jaa raha hai aur behisaab pasina aa raha hai! He has diabetes since 12 years and takes Telma 40 for BP. We are stuck near Khed Shivapur toll plaza on NH48, traffic jam hai! Please tell what to do quick!",
    language: "hi-IN",
    context: "emergency_crisis",
    hasImage: false,
    imageInfo: null,
    plan: {
      title: "Acute Coronary Syndrome / Suspected STEMI Emergency Action Plan",
      intent: {
        said: "Father (68) experiencing sudden severe radiating chest pain and profuse sweating while stranded in NH48 traffic near Khed Shivapur toll plaza.",
        trueIntent: "Emergency medical rescue dispatch, cardiac cath lab pre-alert, and highway traffic clearance for an acute life-threatening cardiovascular event."
      },
      urgency: "Immediate",
      confidenceScore: 0.96,
      domain: "MEDICAL",
      summary: "68-year-old male with chronic diabetes and hypertension presenting with classic hallmarks of acute myocardial infarction (substernal pain radiating to left arm, diaphoresis) immobilized in a highway traffic bottleneck. Immediate ALS ambulance triage and corridor clearance required.",
      facts: [
        "Patient is a 68-year-old male present in vehicle near Khed Shivapur Toll Plaza on NH48.",
        "Symptoms include sudden severe chest pain radiating down left arm with profuse diaphoresis (sweating).",
        "Known medical history of Type 2 Diabetes Mellitus (12 years) and Hypertension.",
        "Current medication includes Telma 40 (Telmisartan 40mg).",
        "Vehicle is currently halted in an active highway traffic congestion."
      ],
      unknowns: [
        "Exact vehicle license plate and live GPS coordinate offset from the toll barrier.",
        "Availability of nearest Level-1 Cardiac Cath Lab with door-to-balloon capacity under 60 minutes.",
        "Whether patient has a personal supply of sublingual Nitroglycerin or Aspirin 325mg on hand.",
        "Current oxygen saturation (SpO2) and conscious awareness level."
      ],
      conflicts: [
        "Caller is asking for quick advice via phone while patient condition necessitates instantaneous physical Advanced Life Support (ALS) intervention."
      ],
      extractedEntities: {
        primaryIssue: "Suspected Acute Myocardial Infarction / STEMI",
        symptoms: [
          "Severe crushing chest pain",
          "Radiation to left arm",
          "Profuse diaphoresis (sweating)",
          "Acute onset"
        ],
        history: [
          "Type 2 Diabetes Mellitus (12 years duration)",
          "Hypertension managed on Telma 40 (Telmisartan)"
        ],
        risks: [
          "Cardiogenic shock",
          "Ventricular fibrillation / sudden cardiac arrest",
          "Delayed reperfusion due to highway gridlock"
        ],
        locationContext: "NH48 Highway corridor near Khed Shivapur Toll Plaza, Pune-Satara section (Maharashtra, India)"
      },
      verification: [
        {
          claim: "Khed Shivapur Toll Plaza is situated on NH48 Pune-Satara highway with dedicated emergency NHAI ambulance patrol.",
          status: "Verified",
          evidenceUrl: "https://morth.nic.in",
          evidenceExplanation: "NHAI Expressways and National Highways maintain 24/7 dedicated patrolling and 1033 helpline with nearest ambulance stationing.",
          evidence: [
            {
              source: "NHAI Highway Operations Directory / Regional Transport Registry",
              url: "https://morth.nic.in",
              snippet: "NHAI Expressways and National Highways maintain 24/7 dedicated patrolling and 1033 helpline with nearest ambulance stationing.",
              retrievedAt: "2026-10-23T04:10:00Z"
            }
          ],
          explanation: "Geographic positioning places caller within jurisdiction of NH48 NHAI Toll Patrol and Maharashtra Emergency Medical Services (108 / 112)."
        },
        {
          claim: "Substernal chest pain radiating to left arm with diaphoresis in a diabetic male indicates acute coronary syndrome.",
          status: "Verified",
          evidenceUrl: "https://www.mohfw.gov.in",
          evidenceExplanation: "Diabetic patients experiencing chest pain with autonomic signs require emergent 12-lead ECG and immediate PCI capable center transport.",
          evidence: [
            {
              source: "Standard Indian & International Clinical Emergency Practice Guidelines",
              url: "https://www.mohfw.gov.in",
              snippet: "Diabetic patients experiencing chest pain with autonomic signs require emergent 12-lead ECG and immediate PCI capable center transport.",
              retrievedAt: "2026-10-23T04:10:00Z"
            }
          ],
          explanation: "High clinical sensitivity for myocardial infarction; immediate non-pharmacologic stabilizing measures must occur while dispatch runs."
        }
      ],
      actions: [
        {
          step: "Dispatch Advanced Life Support (ALS) Ambulance via National Emergency Number (112 / 108 / 1033 NHAI)",
          why: "Patient requires onboard 12-lead ECG, oxygenation, defibrillator standby, and intravenous access immediately.",
          timing: "Immediate (< 2 minutes)",
          priority: "Critical",
          requiresHumanApproval: true
        },
        {
          step: "Trigger NHAI Highway Patrol & Traffic Police Emergency Green Corridor Alert",
          why: "Physical traffic jam at Khed Shivapur toll plaza will block standard ambulance transit without highway patrol clearance.",
          timing: "Within 3 minutes",
          priority: "Critical",
          requiresHumanApproval: true
        },
        {
          step: "Pre-Alert Nearest Interventional Cardiology ER / Cath Lab",
          why: "Pre-activating cath lab reduces door-to-balloon time by up to 35 minutes for primary angioplasty.",
          timing: "Within 5 minutes",
          priority: "High",
          requiresHumanApproval: true
        }
      ],
      humanGuidance: [
        "DIAL 112 or 108 immediately from another phone. State clearly: 'Suspected heart attack, stopped near Khed Shivapur toll plaza on NH48'.",
        "Position patient comfortably in a semi-reclined sitting posture with knees slightly bent. Loosen tight collar, belt, and shirt buttons.",
        "Keep patient calm, still, and do NOT give heavy solid food, stimulants, or unprescribed medicines while waiting for medical responders."
      ],
      draftPayloads: [
        {
          targetSystem: "EMS_DISPATCH_GATEWAY",
          actionCode: "EMS_DISPATCH_UNIT",
          priority: "P1",
          payloadSummary: "Dispatch ALS unit with cardiac monitor to NH48 Khed Shivapur Toll (Pune direction). Chief complaint: Crushing chest pain + diaphoresis.",
          sent: false
        },
        {
          targetSystem: "REGIONAL_TRAFFIC_EOC",
          actionCode: "TRAFFIC_GRID_REROUTE",
          priority: "P1",
          payloadSummary: "Establish dedicated shoulder corridor / toll lane bypass for incoming emergency medical vehicle at Khed Shivapur plaza.",
          sent: false
        },
        {
          targetSystem: "HOSPITAL_TRIAGE_NETWORK",
          actionCode: "HOSPITAL_ER_PREALERT",
          priority: "P1",
          payloadSummary: "STEMI alert: 68M inbound, severe angina, diabetic history, estimated arrival pending dispatch coordinates.",
          sent: false
        }
      ],
      rawSystemPayload: {
        header: {
          specVersion: "SAARTHI-EOC-v1.0",
          incidentId: "INC-MED-2026-8901",
          timestampUtc: "2026-10-23T04:10:00Z",
          classification: "DRAFT_SIMULATION_ONLY",
          regulatoryNotice: "DRAFT PAYLOAD — NOT SENT TO ANY REAL SYSTEM"
        },
        triage: {
          esiScore: 1,
          urgencyCode: "IMMEDIATE_RED",
          clinicalSuspicions: ["ACUTE_CORONARY_SYNDROME", "SUSPECTED_STEMI"],
          vitalRisks: ["VENTRICULAR_ARRHYTHMIA", "CARDIOGENIC_SHOCK"]
        },
        telemetry: {
          reportedCorridor: "NH48_PUNE_SATARA",
          landmark: "KHED_SHIVAPUR_TOLL_PLAZA",
          trafficStatus: "GRIDLOCK_DETECTED"
        }
      },
      safety_note: "CRITICAL SAFETY OVERRIDE: This application is an automated decision-support engine, not a licensed medical professional or physician. In life-threatening emergencies, dial 112 immediately.",
      safetyNotes: [
        "CRITICAL SAFETY OVERRIDE: This application is an automated decision-support engine, not a licensed medical professional or physician.",
        "In life-threatening emergencies, dial 112 or 108 immediately.",
        "Do not leave the patient unattended in a stalled vehicle."
      ],
      follow_up_question: "Are you parked on the northbound (towards Pune) or southbound lane, and what is your vehicle color/registration number for dispatch identification?",
      followUpQuestions: [
        "Are you parked on the northbound or southbound lane?",
        "What is your vehicle color/registration number for dispatch identification?"
      ]
    }
  }
};

// Export for Node.js environments (tests, server) and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEMO_PRESETS };
}
if (typeof window !== 'undefined') {
  window.SAARTHI_DEMO_DATA = DEMO_PRESETS;
}
