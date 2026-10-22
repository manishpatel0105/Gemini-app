/**
 * SAARTHI AI — Demo Data Fixtures
 * High-fidelity, deterministic presets for judging and offline exploration.
 * Structured strictly according to the SAARTHI Intent-to-Action JSON Schema.
 * 
 * Works in both Node.js (for backend testing/fallback) and browser window environments.
 */

const DEMO_PRESETS = {
  medical_crisis: {
    id: "preset_medical_crisis",
    name: "Medical Crisis (Hinglish)",
    category: "MEDICAL",
    subtitle: "Panicked Hinglish report • Sudden chest pain • NH48 Toll",
    inputText: "Arrey suno jaldi, pitaji (68 yr) ko achanak chest me bohot tez dard ho raha hai, left arm me jaa raha hai aur behisaab pasina aa raha hai! He has diabetes since 12 years and takes Telma 40 for BP. We are stuck near Khed Shivapur toll plaza on NH48, traffic jam hai! Please tell what to do quick!",
    language: "hi-IN",
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
          evidence: [
            {
              source: "Standard Indian & International Clinical Emergency Practice Guidelines",
              url: "https://www.mohfw.gov.in",
              snippet: "Diabetic patients experiencing chest pain with autonomic signs require emergent 12-lead ECG and immediate PCI capable center transport.",
              retrievedAt: "2026-10-23T04:10:00Z"
            }
          ],
          explanation: "High clinical sensitivity for myocardial infarction; immediate non-pharmacologic stabilizing measures must occur while dispatch runs."
        },
        {
          claim: "Immediate self-administration of high dose prescription vasodilators without physician consultation.",
          status: "Contradicted",
          evidence: [
            {
              source: "Emergency Care Pharmacology Safety Protocol",
              url: "https://cdsco.gov.in",
              snippet: "Do not administer unprescribed cardiac medications or antiplatelets if patient blood pressure or allergies are unconfirmed in field.",
              retrievedAt: "2026-10-23T04:10:00Z"
            }
          ],
          explanation: "Telmisartan is an ARB for BP; unmonitored nitroglycerin could cause catastrophic hypotension if inferior wall MI is present."
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
        },
        routing: {
          primaryResponder: "EMS_ALS_108_112",
          auxiliarySupport: "NHAI_PATROL_1033",
          secondaryAgency: "HIGHWAY_TRAFFIC_POLICE"
        }
      },
      safety_note: "CRITICAL SAFETY OVERRIDE: This application is an automated decision-support engine, not a licensed medical professional or physician. In life-threatening emergencies, dial 112 immediately.",
      follow_up_question: "Are you parked on the northbound (towards Pune) or southbound lane, and what is your vehicle color/registration number for dispatch identification?"
    }
  },

  community_safety: {
    id: "preset_community_safety",
    name: "Community Safety & Disaster",
    category: "DISASTER",
    subtitle: "Flooded underpass • Stalled school bus (18 kids) • Snapped live wire",
    inputText: "Emergency at Minto Bridge underpass! Water level has reached 5 feet rapidly due to cloudburst. A yellow school bus with 18 kids is half submerged and stalled. High-tension wire just snapped from the pole above and is hanging close to the water! WhatsApp group is claiming road is officially blocked but cars are still entering from the CP side!",
    language: "en-IN",
    hasImage: false,
    imageInfo: null,
    plan: {
      title: "Flash Flood, Snapped High-Tension Electrical Wire & Trapped School Bus Emergency Cordon",
      intent: {
        said: "School bus carrying 18 children stalled in 5-foot water at Minto Bridge underpass with live electrical wire hanging overhead and unauthorized traffic still entering.",
        trueIntent: "Emergency grid power de-energization, multi-victim aquatic rescue dispatch, and physical police traffic blockade at all entry approaches."
      },
      urgency: "Immediate",
      confidenceScore: 0.98,
      domain: "DISASTER",
      summary: "Catastrophic dual-threat incident involving rapid flash flooding, 18 trapped school children in a submerged bus, and active electrocution peril from a snapped overhead high-tension line at Minto Bridge underpass. Demands instantaneous power station trip before waterborne rescue ingress.",
      facts: [
        "Location is the Minto Bridge underpass (connecting Connaught Place / New Delhi Railway Station area).",
        "Water depth is approximately 5 feet and rising following intense precipitation.",
        "School bus is stalled and partially submerged with approximately 18 children inside.",
        "High-tension electrical wire is snapped and hanging in close proximity to the standing water.",
        "Vehicle ingress remains active from the Connaught Place (CP) side despite online claims of closure."
      ],
      unknowns: [
        "Whether electrical wire is physically touching or arcing into the water pool.",
        "Exact school name and bus registration number to contact school administration and parents.",
        "Internal water height inside the bus passenger compartment.",
        "Presence of adult attendants or driver status inside the bus."
      ],
      conflicts: [
        "Social media / messaging groups report road closure, but physical on-ground vehicles are still actively driving into the hazard zone."
      ],
      extractedEntities: {
        primaryIssue: "Submerged School Bus with Live Overhead Electrical Hazard",
        symptoms: [
          "5-foot flash flood submersion",
          "Vehicle engine stall / hydrostatic lock",
          "Mass civilian entrapment (minors)",
          "Overhead power line rupture"
        ],
        history: [
          "Minto Bridge underpass is an established severe monsoon waterlogging vulnerability hotspot"
        ],
        risks: [
          "Mass electrocution via water conductivity",
          "Drowning / hypothermia of minor occupants",
          "Secondary multi-vehicle pileup in blind underpass entrance"
        ],
        locationContext: "Minto Bridge Underpass, New Delhi (CP Outer Circle to DDU Marg arterial route)"
      },
      verification: [
        {
          claim: "Minto Bridge is an officially documented high-risk flood depression under Delhi Municipal and Traffic Police monitoring.",
          status: "Verified",
          evidence: [
            {
              source: "Delhi Disaster Management Authority (DDMA) & PWD Flood Control Registry",
              url: "https://ddma.delhigovt.nic.in",
              snippet: "Minto Road railway underpass has automated flood pumps and CCTV sensors designated for immediate monsoon traffic diversions.",
              retrievedAt: "2026-10-23T04:10:00Z"
            }
          ],
          explanation: "Historical data and municipal documentation corroborate recurring flash inundation vulnerability at this specific coordinate."
        },
        {
          claim: "High-tension wire rupture creates lethal electrical potential gradient in conductive rainwater pools.",
          status: "Verified",
          evidence: [
            {
              source: "Central Electricity Authority (CEA) Safety Regulations",
              url: "https://cea.nic.in",
              snippet: "Severed conductors in standing water require feeder line lock-out tag-out (LOTO) de-energization prior to emergency personnel approach.",
              retrievedAt: "2026-10-23T04:10:00Z"
            }
          ],
          explanation: "Rescue personnel cannot safely deploy boats or enter water until electricity distribution company confirms circuit breaker trip."
        },
        {
          claim: "Road is officially sealed by automated barrier gates.",
          status: "Contradicted",
          evidence: [
            {
              source: "Caller Field Observation Report",
              url: "field://caller-observation",
              snippet: "Physical motor vehicles are observed continuing entry from Connaught Place approach ramp.",
              retrievedAt: "2026-10-23T04:10:00Z"
            }
          ],
          explanation: "Claims that the street is blocked are contradicted by ongoing traffic inflow; manual physical barrier team must be dispatched."
        }
      ],
      actions: [
        {
          step: "Emergency Substation Trip: BSES / DISCOM Feeder De-energization",
          why: "Eliminates lethal electrocution risk for trapped children and incoming rescue divers.",
          timing: "Immediate (< 60 seconds)",
          priority: "Critical",
          requiresHumanApproval: true
        },
        {
          step: "Dispatch Delhi Fire Services & NDRF Aquatic Rescue Unit",
          why: "Inflatable rescue rafts and high-clearance rescue vehicles required to safely evacuate 18 children from submerged vehicle.",
          timing: "Immediate (< 2 minutes)",
          priority: "Critical",
          requiresHumanApproval: true
        },
        {
          step: "Deploy Traffic Police Physical Barricade at CP & DDU Marg Approaches",
          why: "Stop incoming civilian cars from entering deep water pool and aggravating the hazard.",
          timing: "Within 3 minutes",
          priority: "Critical",
          requiresHumanApproval: true
        }
      ],
      humanGuidance: [
        "STAY AWAY FROM WATER: Warn all bystanders on the sidewalk to stay at least 30 meters back from the water edge due to live electrical wire hazard.",
        "SHOUT CLEAR INSTRUCTIONS TO BUS: Tell the driver and children through megaphone or loud voice to REMAIN INSIDE THE BUS on seats. Do NOT let children jump into the water.",
        "STOP INCOMING VEHICLES: From a dry, safe position on the CP ramp, signal incoming cars with flashlights or hand waving to halt before descending."
      ],
      draftPayloads: [
        {
          targetSystem: "POWER_DISCOM_GRID_CONTROL",
          actionCode: "POWER_GRID_ISOLATE",
          priority: "P1",
          payloadSummary: "IMMEDIATE FEEDER TRIP: Minto Bridge Substation, Feeder 11kV/33kV Line Cordon. Active wire collapse into floodwater.",
          sent: false
        },
        {
          targetSystem: "DISASTER_MGMT_EOC",
          actionCode: "DISASTER_NDRF_DISPATCH",
          priority: "P1",
          payloadSummary: "Code Red: Flash flood entrapment, 18 school children in submerged bus at Minto Bridge underpass. Rubber boats + ALS backup requested.",
          sent: false
        },
        {
          targetSystem: "METROPOLITAN_TRAFFIC_POLICE",
          actionCode: "TRAFFIC_POLICE_CORDON",
          priority: "P1",
          payloadSummary: "Emergency total closure: Seal Minto Bridge approaches from Outer Circle Connaught Place and Deen Dayal Upadhyaya Marg.",
          sent: false
        }
      ],
      rawSystemPayload: {
        header: {
          specVersion: "SAARTHI-EOC-v1.0",
          incidentId: "INC-DIS-2026-4412",
          timestampUtc: "2026-10-23T04:10:00Z",
          classification: "DRAFT_SIMULATION_ONLY",
          regulatoryNotice: "DRAFT PAYLOAD — NOT SENT TO ANY REAL SYSTEM"
        },
        incidentClassification: "CIVIL_MASS_PERIL_FLOOD_ELECTRICAL",
        hazardMatrix: {
          waterDepthFeet: 5.0,
          structuralEnclosure: "RAILWAY_UNDERPASS",
          electricalHazard: "ACTIVE_LIVE_HT_WIRE",
          occupantVulnerability: "PEDIATRIC_MINORS_18"
        },
        actionDirectives: [
          { agency: "DISCOM_GRID", command: "TRIP_SUBSTATION_BREAKER_EMERGENCY" },
          { agency: "FIRE_DISASTER_SERVICE", command: "INFLATABLE_BOAT_EXTRACTION" },
          { agency: "TRAFFIC_POLICE", command: "PHYSICAL_BARRIER_DEPLOYMENT" }
        ]
      },
      safety_note: "CRITICAL DANGER: Never step into water in the vicinity of fallen cables. Pure water conductivity and ground potential gradient can be fatal up to tens of meters away. Do not attempt rescue until grid isolation is verified.",
      follow_up_question: "Are the bus tires completely submerged, and is water visibly rising inside the cabin floorboards?"
    }
  },

  health_prescription_navigator: {
    id: "preset_health_navigator",
    name: "Health & Prescription Navigator",
    category: "CIVIC",
    subtitle: "Elderly patient (74) • Warfarin + Ciprofloxacin conflict • Hives & facial swelling",
    inputText: "My 74yo grandmother was prescribed Ciprofloxacin 500mg yesterday for UTI by a local clinic. She also takes Warfarin 3mg daily for atrial fibrillation. She took the first dose this morning, and now has widespread itchy hives, facial swelling, and says she's dizzy. She had a penicillin reaction 10 years ago. Can she take another dose with Avil or Cetirizine?",
    language: "en-IN",
    hasImage: false,
    imageInfo: null,
    plan: {
      title: "Acute Allergic Reaction (Angioedema Risk) & Severe Warfarin-Fluoroquinolone Interaction Triage",
      intent: {
        said: "74-year-old female on Warfarin experiencing acute hives, facial swelling, and dizziness after starting Ciprofloxacin for UTI, asking if she can take another dose alongside an antihistamine.",
        trueIntent: "Emergency clinical safety halt: Prevent lethal repeat antibiotic dose, evaluate emergent angioedema airway risk, and alert treating physician to severe anticoagulant drug interaction."
      },
      urgency: "Immediate",
      confidenceScore: 0.95,
      domain: "MEDICAL",
      summary: "Patient is exhibiting signs of an acute hypersensitivity reaction (urticaria, facial angioedema, dizziness) following initiation of Ciprofloxacin. Concurrently, co-administration of Ciprofloxacin with Warfarin is a major Category X/D drug interaction that dangerously inhibits CYP1A2/CYP2C9, precipitating severe supratherapeutic INR and catastrophic hemorrhage risk. Repeat dosing must be strictly withheld and immediate emergency evaluation conducted.",
      facts: [
        "Patient is a 74-year-old female taking maintenance Warfarin 3mg daily for atrial fibrillation.",
        "Prescribed Ciprofloxacin 500mg yesterday for urinary tract infection (UTI).",
        "Developed widespread pruritic hives, facial swelling, and dizziness following the first dose.",
        "Remote historical allergic reaction to Penicillin 10 years ago.",
        "Family is considering administering an over-the-counter antihistamine (Avil / Cetirizine) and continuing Ciprofloxacin."
      ],
      unknowns: [
        "Presence of hoarseness, throat tightness, stridor, or difficulty swallowing/breathing.",
        "Current blood pressure and pulse rate (dizziness may indicate anaphylactic hypotension or severe arrhythmia).",
        "Most recent baseline International Normalized Ratio (INR) level.",
        "Prescribing physician contact info or local emergency department proximity."
      ],
      conflicts: [
        "Family is questioning whether to administer another Ciprofloxacin dose with an antihistamine, whereas continuing the offending antibiotic could trigger fatal anaphylactic shock."
      ],
      extractedEntities: {
        primaryIssue: "Drug-Induced Angioedema & Major Anticoagulant Interaction",
        symptoms: [
          "Widespread urticarial hives",
          "Facial edema / swelling",
          "Dizziness / lightheadedness",
          "Acute onset post-ingestion"
        ],
        history: [
          "Atrial fibrillation managed on Warfarin 3mg",
          "Urinary tract infection (UTI)",
          "Penicillin allergy (10 years ago)"
        ],
        risks: [
          "Laryngeal angioedema and fatal airway obstruction",
          "Anaphylactic shock / vascular collapse",
          "Supratherapeutic INR elevation leading to spontaneous internal / intracranial hemorrhage"
        ],
        locationContext: "Home residential setting; requires transport to emergency or urgent outpatient clinic"
      },
      verification: [
        {
          claim: "Ciprofloxacin potently inhibits Warfarin metabolism, drastically increasing bleeding risk.",
          status: "Verified",
          evidence: [
            {
              source: "Pharmacology Compendium & CDSCO Drug Safety Monographs",
              url: "https://cdsco.gov.in",
              snippet: "Fluoroquinolones (Ciprofloxacin) inhibit hepatic CYP enzymes and alter intestinal vitamin K flora, potentiating Warfarin anticoagulant effects.",
              retrievedAt: "2026-10-23T04:10:00Z"
            }
          ],
          explanation: "Established major drug-drug interaction requiring immediate medical substitution and urgent INR surveillance."
        },
        {
          claim: "Facial swelling and hives after starting a new antibiotic signify systemic type I hypersensitivity.",
          status: "Verified",
          evidence: [
            {
              source: "World Allergy Organization (WAO) Anaphylaxis Guidelines",
              url: "https://www.worldallergy.org",
              snippet: "Acute mucocutaneous symptoms combined with systemic signs (dizziness/hypotension) constitute clinical criteria for impending anaphylaxis.",
              retrievedAt: "2026-10-23T04:10:00Z"
            }
          ],
          explanation: "Under no circumstances should the patient be administered a second dose; antihistamines will not prevent airway closure."
        },
        {
          claim: "Administering Cetirizine or Avil allows the patient to continue Ciprofloxacin safely.",
          status: "Contradicted",
          evidence: [
            {
              source: "Standard Clinical Toxicology & Allergy Protocol",
              url: "https://mohfw.gov.in",
              snippet: "Antihistamines mask cutaneous warning signs while serious internal anaphylactic cascades continue to progress.",
              retrievedAt: "2026-10-23T04:10:00Z"
            }
          ],
          explanation: "Treating hives with antihistamines while continuing the causal drug carries lethal risk of full-blown anaphylaxis."
        }
      ],
      actions: [
        {
          step: "STOP Ciprofloxacin Immediately — Do Not Administer Next Dose",
          why: "Re-exposure to an allergen causing facial edema and dizziness can cause rapid airway compromise and fatal shock.",
          timing: "Immediate",
          priority: "Critical",
          requiresHumanApproval: true
        },
        {
          step: "Emergency Clinical Assessment for Impending Anaphylaxis (Airway & BP)",
          why: "Facial swelling accompanied by dizziness indicates potential vascular dilation or laryngeal involvement requiring IM epinephrine.",
          timing: "Immediate (< 5 minutes)",
          priority: "Critical",
          requiresHumanApproval: true
        },
        {
          step: "Urgent Treating Physician / Cardiologist Escalation for Warfarin & Antibiotic Re-prescription",
          why: "Urgent alternative non-interacting antimicrobial for UTI required; urgent INR test needed to adjust Warfarin dose.",
          timing: "Within 2 hours",
          priority: "High",
          requiresHumanApproval: true
        }
      ],
      humanGuidance: [
        "DO NOT GIVE ANOTHER DOSE OF CIPROFLOXACIN. Withhold it immediately.",
        "Check her breathing right now: Is her voice raspy or hoarse? Is she struggling to breathe or swallow? If YES, call 112 immediately or proceed to the nearest Emergency Room without waiting.",
        "Keep her sitting or lying comfortably with feet elevated if dizzy. Keep all medication boxes with you when consulting the doctor."
      ],
      draftPayloads: [
        {
          targetSystem: "CLINICAL_SAFETY_ADVISORY",
          actionCode: "MED_SAFETY_HOLD_ALERT",
          priority: "P1",
          payloadSummary: "IMMEDIATE MEDICATION HOLD: Ciprofloxacin 500mg. Adverse reaction: Facial angioedema + urticaria + dizziness.",
          sent: false
        },
        {
          targetSystem: "PHARMACY_INTERACTION_AUDIT",
          actionCode: "PHARMACY_ALERT_INTERACTION",
          priority: "P1",
          payloadSummary: "Critical drug interaction alert: Warfarin + Ciprofloxacin. Severe risk of supratherapeutic anticoagulation and hemorrhage.",
          sent: false
        },
        {
          targetSystem: "URGENT_CARE_REFERRAL",
          actionCode: "CLINICAL_URGENT_TRIAGE",
          priority: "P2",
          payloadSummary: "74F presenting with possible anaphylaxis precursor. Airway monitoring, vitals, alternative UTI antibiotic selection required.",
          sent: false
        }
      ],
      rawSystemPayload: {
        header: {
          specVersion: "SAARTHI-EOC-v1.0",
          incidentId: "INC-MED-2026-1049",
          timestampUtc: "2026-10-23T04:10:00Z",
          classification: "DRAFT_SIMULATION_ONLY",
          regulatoryNotice: "DRAFT PAYLOAD — NOT SENT TO ANY REAL SYSTEM"
        },
        adverseEvent: {
          drugTrigger: "CIPROFLOXACIN_500MG",
          reactionType: "TYPE_1_HYPERSENSITIVITY_ANGIOEDEMA_RISK",
          contraindicatedAction: "REPEAT_DOSE_STRICTLY_PROHIBITED"
        },
        pharmacologyConflict: {
          interactingPair: ["WARFARIN_3MG", "CIPROFLOXACIN_500MG"],
          mechanism: "CYP1A2_CYP2C9_INHIBITION_GUT_FLORA_DEPLETION",
          consequence: "HIGH_BLEEDING_HEMORRHAGE_RISK",
          recommendedAction: "INR_MONITORING_AND_ANTIBIOTIC_SWITCH"
        }
      },
      safety_note: "CLINICAL PHARMACOLOGY NOTICE: This is an automated algorithmic safety check. SAARTHI AI does not prescribe, alter medications, or provide official diagnostic decisions. Contact a registered physician or emergency center immediately.",
      follow_up_question: "Is she experiencing any hoarseness in her voice, coughing, or throat tightness right now?"
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
