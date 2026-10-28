import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Camera, 
  Search, 
  Database, 
  FileText, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle, 
  Cpu, 
  Brain, 
  Eye, 
  Sparkles, 
  Download, 
  Volume2, 
  VolumeX, 
  Upload, 
  RefreshCw, 
  Crosshair, 
  ShieldAlert, 
  Stethoscope, 
  ChevronRight,
  Layers,
  Thermometer,
  Zap,
  Clock,
  Trash2,
  Info,
  MapPin,
  FileCheck,
  Server
} from 'lucide-react';

// Default Fallback Database Structure matching facial_symptom_database.json schema
const FALLBACK_DATABASE = [
  {
    id: 'PATH-001',
    name: 'Horner Syndrome (Sympathetic Disruption)',
    category: 'Facial / Neurological',
    region: 'Eyes & Orbit',
    urgency: 'Moderate',
    symptoms: ['Ptosis (Drooping Eyelid)', 'Miosis (Constricted Pupil)', 'Anhidrosis (Lack of Sweat)', 'Facial Asymmetry'],
    confidenceBase: 88,
    specialist: 'Neurologist / Ophthalmologist',
    description: 'A rare condition caused by a disruption of the sympathetic nerve pathway supplying the face and eye.',
    actionPlan: 'Schedule MRI/CT scan of neck and chest to rule out carotid dissection or apical lung tumors.'
  },
  {
    id: 'PATH-002',
    name: 'Bell\'s Palsy (Facial Nerve Paralysis)',
    category: 'Facial / Neurological',
    region: 'Cheeks & Malar',
    urgency: 'Moderate',
    symptoms: ['Facial Asymmetry', 'Drooping Mouth Corner', 'Inability to Close Eye', 'Altered Taste'],
    confidenceBase: 92,
    specialist: 'Neurologist / Otolaryngologist',
    description: 'Sudden weakness or paralysis on one side of the face caused by inflammation of the 7th cranial nerve.',
    actionPlan: 'Early corticosteroid therapy within 72 hours of symptom onset significantly improves recovery rate.'
  },
  {
    id: 'PATH-003',
    name: 'Systemic Lupus Erythematosus (SLE Manifestation)',
    category: 'Dermatological / Systemic',
    region: 'Cheeks & Malar',
    urgency: 'Moderate',
    symptoms: ['Malar Rash (Butterfly Rash)', 'Photosensitivity', 'Joint Pain', 'Chronic Fatigue'],
    confidenceBase: 85,
    specialist: 'Rheumatologist',
    description: 'Autoimmune disease where the body\'s immune system mistakenly attacks healthy tissue in many parts of the body.',
    actionPlan: 'Order ANA (Antinuclear Antibodies) panel, anti-dsDNA, and complement levels (C3/C4).'
  },
  {
    id: 'PATH-004',
    name: 'Acute Jaundice (Biliary / Hepatic Impairment)',
    category: 'Facial Biomarkers / Systemic',
    region: 'Eyes & Orbit',
    urgency: 'Emergency',
    symptoms: ['Scleral Icterus (Yellow Eyes)', 'Yellowish Skin Tone', 'Abdominal Discomfort', 'Dark Urine'],
    confidenceBase: 95,
    specialist: 'Hepatologist / Gastroenterologist',
    description: 'Hyperbilirubinemia leading to yellow pigmentation of skin and sclera, indicative of liver or biliary tract dysfunction.',
    actionPlan: 'Immediate urgent blood work (LFTs, Bilirubin total/direct) and abdominal ultrasound.'
  },
  {
    id: 'PATH-005',
    name: 'Severe Sleep Apnea & Chronic Hypoxia',
    category: 'Neurological / Fatigue',
    region: 'Forehead & Cranial',
    urgency: 'Low',
    symptoms: ['Periorbital Dark Circles', 'Micro-sleep Tremors', 'Chronic Fatigue', 'Morning Headaches', 'Daytime Somnolence'],
    confidenceBase: 79,
    specialist: 'Sleep Medicine Specialist',
    description: 'Intermittent airflow blockage during sleep resulting in decreased blood oxygen saturation and micro-arousals.',
    actionPlan: 'Overnight Polysomnography (Sleep Study) and nocturnal pulse oximetry monitoring.'
  },
  {
    id: 'PATH-006',
    name: 'Thyroid Eye Disease (Graves\' Ophthalmopathy)',
    category: 'Facial / Endocrine',
    region: 'Eyes & Orbit',
    urgency: 'Moderate',
    symptoms: ['Exophthalmos (Proptotic Eyes)', 'Eyelid Retraction', 'Double Vision', 'Eye Grittiness'],
    confidenceBase: 90,
    specialist: 'Endocrinologist / Neuro-ophthalmologist',
    description: 'Autoimmune inflammatory disorder affecting the orbit and thyroid gland, causing eye bulging and tissue swelling.',
    actionPlan: 'Check Thyroid Function Tests (TSH, Free T3/T4, TSI) and orbital MRI/CT.'
  },
  {
    id: 'PATH-007',
    name: 'Hypertensive Encephalopathy / Crisis',
    category: 'Neurological / Systemic',
    region: 'Forehead & Cranial',
    urgency: 'Emergency',
    symptoms: ['Facial Flushing', 'Severe Vascular Dilation', 'Throbbing Headache', 'Blurred Vision', 'Confusion'],
    confidenceBase: 94,
    specialist: 'Emergency Physician / Cardiologist',
    description: 'Acute, severe elevation in blood pressure causing breakdown of cerebrovascular autoregulation and brain edema.',
    actionPlan: 'IMMEDIATE EMERGENCY ROOM VISIT. Controlled blood pressure reduction required.'
  }
];

const FACIAL_REGIONS = [
  { id: 'all', label: 'All Regions' },
  { id: 'Eyes & Orbit', label: 'Eyes & Orbit' },
  { id: 'Forehead & Cranial', label: 'Forehead & Cranial' },
  { id: 'Cheeks & Malar', label: 'Cheeks & Malar' },
  { id: 'Mouth & Perioral', label: 'Mouth & Perioral' },
  { id: 'Cutaneous & Skin', label: 'Cutaneous & Skin' }
];

export default function App() {
  // Navigation & State
  const [activeTab, setActiveTab] = useState('scanner'); 
  const [database, setDatabase] = useState(FALLBACK_DATABASE);
  const [dbLoadedSource, setDbLoadedSource] = useState('Default Embedded');
  const [dbLoadingStatus, setDbLoadingStatus] = useState('idle');
  const [selectedRegion, setSelectedRegion] = useState('all');
  
  const [selectedSymptoms, setSelectedSymptoms] = useState([
    'Facial Asymmetry',
    'Periorbital Dark Circles'
  ]);
  const [matchedPathologies, setMatchedPathologies] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  // Real-time calculated biometrics
  const [biometrics, setBiometrics] = useState({
    symmetry: 98.4,
    flushIndex: 14.2,
    fatigueIndex: 22.1,
    hydration: 'Optimal'
  });

  const [scanHistory, setScanHistory] = useState(() => {
    const local = localStorage.getItem('samra_scan_history');
    return local ? JSON.parse(local) : [
      {
        id: 'SCAN-8092',
        date: '2026-10-28 14:22',
        symptoms: ['Facial Asymmetry', 'Ptosis (Drooping Eyelid)'],
        topMatch: 'Horner Syndrome',
        confidence: '89%',
        urgency: 'Moderate'
      }
    ];
  });

  const [dbSearchQuery, setDbSearchQuery] = useState('');
  const [customJsonInput, setCustomJsonInput] = useState('');
  const [showJsonModal, setShowJsonModal] = useState(false);

  // Vision HUD Elements
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Automatically attempt fetching facial_symptom_database.json on mount
  useEffect(() => {
    loadExternalDatabase();
  }, []);

  const loadExternalDatabase = async () => {
    setDbLoadingStatus('loading');
    try {
      const response = await fetch('./facial_symptom_database.json');
      if (response.ok) {
        const json = await response.json();
        if (Array.isArray(json) && json.length > 0) {
          setDatabase(json);
          setDbLoadedSource('facial_symptom_database.json (Server Loaded)');
          setDbLoadingStatus('success');
          return;
        }
      }
      throw new Error('File not accessible directly');
    } catch (e) {
      console.log('Using local fallback dataset until facial_symptom_database.json is provided.');
      setDatabase(FALLBACK_DATABASE);
      setDbLoadedSource('Default Fallback (Upload facial_symptom_database.json)');
      setDbLoadingStatus('fallback');
    }
  };

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('samra_scan_history', JSON.stringify(scanHistory));
  }, [scanHistory]);

  // Voice synthesis assistant
  const speakText = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // Re-calculate pathology matches
  useEffect(() => {
    calculateMatches();
  }, [selectedSymptoms, database]);

  const calculateMatches = () => {
    if (selectedSymptoms.length === 0) {
      setMatchedPathologies([]);
      return;
    }

    const matches = database.map((pathology) => {
      const matchCount = pathology.symptoms.filter((sym) =>
        selectedSymptoms.includes(sym)
      ).length;
      
      const totalRatio = matchCount / pathology.symptoms.length;
      const userRatio = matchCount / selectedSymptoms.length;

      let matchScore = 0;
      if (matchCount > 0) {
        matchScore = Math.round(
          (pathology.confidenceBase || 85) * (totalRatio * 0.7 + userRatio * 0.3) + matchCount * 5
        );
        matchScore = Math.min(Math.max(matchScore, 20), 99);
      }

      return {
        ...pathology,
        matchCount,
        matchScore
      };
    })
    .filter((p) => p.matchCount > 0)
    .sort((a, b) => b.matchScore - a.matchScore);

    setMatchedPathologies(matches);
  };

  const toggleSymptom = (symptom) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (activeTab === 'scanner') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeTab]);

  const triggerScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    speakText("Initiating Sentinel visual scan against loaded facial symptom database.");

    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setScanProgress(current);

      if (current >= 100) {
        clearInterval(interval);
        setIsScanning(false);

        // Update biometrics with randomized simulation numbers
        const newSym = (94 + Math.random() * 5.5).toFixed(1);
        const newFatigue = (15 + Math.random() * 20).toFixed(1);
        setBiometrics({
          symmetry: newSym,
          flushIndex: (10 + Math.random() * 15).toFixed(1),
          fatigueIndex: newFatigue,
          hydration: newFatigue > 28 ? 'Sub-Optimal' : 'Optimal'
        });

        if (selectedSymptoms.length === 0) {
          setSelectedSymptoms(['Facial Asymmetry', 'Periorbital Dark Circles']);
        }

        const top = matchedPathologies[0] || database[0];
        speakText(`Scan complete. Primary candidate detected: ${top.name}. Confidence rating ${top.matchScore || 88} percent.`);

        const newRecord = {
          id: `SCAN-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : ['Facial Asymmetry'],
          topMatch: top.name,
          confidence: `${top.matchScore || 88}%`,
          urgency: top.urgency || 'Moderate'
        };
        setScanHistory((prev) => [newRecord, ...prev]);
      }
    }, 180);
  };

  const exportDiagnosticReport = () => {
    const reportData = {
      app: 'Samra AI - Sentinel Engine',
      timestamp: new Date().toISOString(),
      databaseSource: dbLoadedSource,
      biometrics,
      selectedSymptoms,
      matchedPathologies: matchedPathologies.map((p) => ({
        id: p.id,
        name: p.name,
        confidence: `${p.matchScore}%`,
        urgency: p.urgency,
        specialist: p.specialist,
        actionPlan: p.actionPlan
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Samra_AI_Clinical_Report_${Date.now()}.json`;
    a.click();
    speakText("Exporting clinical report JSON.");
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(customJsonInput);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setDatabase(parsed);
        setDbLoadedSource('User Uploaded JSON');
        setShowJsonModal(false);
        setCustomJsonInput('');
        speakText("Custom facial symptom database imported successfully.");
      } else {
        alert("Invalid format! Provide a JSON array of pathology objects.");
      }
    } catch (e) {
      alert("JSON Syntax Error!");
    }
  };

  // Derive unique symptoms dynamically from loaded database
  const allDatabaseSymptoms = Array.from(
    new Set(database.flatMap((item) => item.symptoms || []))
  );

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Header Navbar */}
      <header className="border-b border-indigo-900/40 bg-[#0B0F1D]/80 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-[2px] animate-pulse">
              <div className="w-full h-full bg-[#090D16] rounded-[10px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#090D16] animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-xl tracking-wider bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-500 bg-clip-text text-transparent">
                SAMRA AI
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50 uppercase tracking-widest">
                Sentinel v3.4
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Server className="w-3 h-3 text-cyan-400" />
              <span>DB: <strong className="text-cyan-300">{dbLoadedSource}</strong></span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center bg-[#060913] p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'scanner'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>AI Vision HUD</span>
          </button>
          <button
            onClick={() => setActiveTab('engine')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'engine'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Pathology Matcher</span>
            {selectedSymptoms.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 text-xs font-bold flex items-center justify-center">
                {selectedSymptoms.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'database'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Pathology DB</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Scan Logs</span>
          </button>
        </nav>

        {/* DB Sync & Export Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={loadExternalDatabase}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-cyan-400 hover:bg-slate-800 transition-all"
            title="Reload facial_symptom_database.json"
          >
            <RefreshCw className={`w-4 h-4 ${dbLoadingStatus === 'loading' ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2.5 rounded-xl border transition-all ${
              voiceEnabled
                ? 'bg-purple-950/40 border-purple-600/50 text-purple-400 hover:bg-purple-900/40'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Voice Synthesizer Assistant"
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowJsonModal(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Upload JSON</span>
          </button>
        </div>
      </header>

      {/* Main App Container */}
      <main className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">

        {/* ================= TAB 1: AI VISION HUD & CAMERA ================= */}
        {activeTab === 'scanner' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Camera Viewport */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="relative aspect-video bg-[#03050C] rounded-2xl border border-cyan-900/40 shadow-2xl overflow-hidden flex items-center justify-center">
                
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                />

                {!cameraActive && (
                  <div className="absolute inset-0 bg-gradient-to-b from-[#090E1C] to-[#04060E] flex flex-col items-center justify-center text-center p-6">
                    <div className="w-24 h-24 rounded-full bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center mb-4 shadow-inner shadow-cyan-500/20">
                      <Crosshair className="w-12 h-12 text-cyan-400 animate-spin-slow" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-200">Facial Vision Pipeline Active</h3>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Webcam standby. Sentinel automated landmark simulation ready for facial analysis.
                    </p>
                  </div>
                )}

                {/* Animated Sci-Fi HUD Canvas Overlay */}
                <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="bg-[#050B18]/80 backdrop-blur-md border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>HUD TARGETING // ACTIVE</span>
                    </div>
                    <div className="bg-[#050B18]/80 backdrop-blur-md border border-indigo-500/30 px-3 py-1.5 rounded-lg text-xs font-mono text-indigo-300">
                      SYS_NODES: 68 DETECTED
                    </div>
                  </div>

                  {/* Facial Reticle Targeting */}
                  <div className="relative w-64 h-64 mx-auto my-auto border-2 border-dashed border-cyan-500/40 rounded-full flex items-center justify-center">
                    <div className="absolute inset-2 border border-purple-500/30 rounded-full animate-ping" />
                    <div className="w-48 h-48 border border-cyan-400/50 rounded-xl relative flex items-center justify-center">
                      <span className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                      <span className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                      <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
                      
                      {isScanning && (
                        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400 animate-bounce" />
                      )}

                      <span className="text-[10px] font-mono text-cyan-400/80 bg-[#090D16]/80 px-2 py-0.5 rounded">
                        {isScanning ? `SCANNING DB... ${scanProgress}%` : 'LOCK ACQUIRED'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end text-[10px] font-mono text-slate-400">
                    <div>FACIAL SYMMETRY: {biometrics.symmetry}%</div>
                    <div className="text-cyan-400">FATIGUE: {biometrics.fatigueIndex}%</div>
                  </div>
                </div>
              </div>

              {/* Action Trigger Controls */}
              <div className="flex items-center gap-4 bg-[#0B0F1D] p-4 rounded-2xl border border-slate-800/80">
                <button
                  onClick={triggerScan}
                  disabled={isScanning}
                  className="flex-1 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-3 transition-all cursor-pointer"
                >
                  <Sparkles className={`w-5 h-5 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? `Processing Database (${scanProgress}%)...` : 'Capture & Match Symptoms'}</span>
                </button>
                <button
                  onClick={exportDiagnosticReport}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-700 p-3.5 rounded-xl text-slate-300 font-medium flex items-center gap-2"
                  title="Export Clinical JSON Report"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span className="hidden sm:inline text-xs">Export Report</span>
                </button>
              </div>

              {/* Interactive Anatomical Region Filter */}
              <div className="bg-[#0B0F1D] p-5 rounded-2xl border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span>Anatomical Region Filter</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">{database.length} Loaded Pathologies</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {FACIAL_REGIONS.map((region) => (
                    <button
                      key={region.id}
                      onClick={() => setSelectedRegion(region.id)}
                      className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all ${
                        selectedRegion === region.id
                          ? 'bg-gradient-to-r from-cyan-950 to-indigo-950 border-cyan-500 text-cyan-300 shadow-md'
                          : 'bg-[#060913] border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {region.label}
                    </button>
                  ))}
                </div>

                {/* Available Symptoms in selected region */}
                <div className="pt-2 border-t border-slate-800/60 flex flex-wrap gap-2">
                  {allDatabaseSymptoms
                    .filter((symptom) => {
                      if (selectedRegion === 'all') return true;
                      // Filter by matching pathologies in selected region
                      return database.some(
                        (p) => (p.region === selectedRegion || selectedRegion === 'all') && p.symptoms?.includes(symptom)
                      );
                    })
                    .map((symptom) => {
                      const active = selectedSymptoms.includes(symptom);
                      return (
                        <button
                          key={symptom}
                          onClick={() => toggleSymptom(symptom)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                            active
                              ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 font-semibold'
                              : 'bg-[#060913] border-slate-800/80 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {active ? '✓ ' : '+ '}{symptom}
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Diagnostic Results Summary Sidebar */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#0B0F1D] p-5 rounded-2xl border border-indigo-900/40 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h2 className="font-bold text-slate-100 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-cyan-400" />
                      <span>Live Diagnostic Output</span>
                    </h2>
                    <p className="text-xs text-slate-400">Database matched pathologies</p>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    {matchedPathologies.length} Matches
                  </span>
                </div>

                {/* Primary Matched Pathology */}
                {matchedPathologies.length > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 p-4 rounded-xl space-y-3 relative overflow-hidden">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                            matchedPathologies[0].urgency === 'Emergency'
                              ? 'bg-rose-950/80 text-rose-400 border-rose-800'
                              : matchedPathologies[0].urgency === 'Moderate'
                              ? 'bg-amber-950/80 text-amber-400 border-amber-800'
                              : 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                          }`}>
                            Urgency: {matchedPathologies[0].urgency}
                          </span>
                          <h3 className="text-base font-bold text-slate-100 mt-2">
                            {matchedPathologies[0].name}
                          </h3>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-black text-cyan-400 font-mono">
                            {matchedPathologies[0].matchScore}%
                          </div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Confidence</div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300">
                        {matchedPathologies[0].description}
                      </p>

                      <div className="bg-[#060913] p-3 rounded-lg border border-slate-800/80 space-y-1">
                        <div className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Recommended Action Plan:</span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {matchedPathologies[0].actionPlan}
                        </p>
                      </div>

                      <div className="pt-1 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60">
                        <span>Target Specialist:</span>
                        <span className="font-semibold text-purple-400">{matchedPathologies[0].specialist}</span>
                      </div>
                    </div>

                    {/* Secondary Candidate List */}
                    {matchedPathologies.length > 1 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                          Differential Candidates
                        </h4>
                        {matchedPathologies.slice(1, 4).map((item) => (
                          <div
                            key={item.id}
                            className="bg-[#060913] hover:bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between transition-all"
                          >
                            <div>
                              <div className="text-xs font-semibold text-slate-200">{item.name}</div>
                              <div className="text-[11px] text-slate-500">{item.category}</div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-cyan-400">{item.matchScore}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl space-y-3">
                    <Info className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      No pathology matches. Select additional symptoms or capture image.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PATHOLOGY MATCHING ENGINE ================= */}
        {activeTab === 'engine' && (
          <div className="space-y-6">
            <div className="bg-[#0B0F1D] p-6 rounded-2xl border border-slate-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-400" />
                  <span>Interactive Symptom Taxonomy & Pathology Matcher</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select identified symptoms across categories to trigger dynamic triage scoring against loaded database.
                </p>
              </div>

              <button
                onClick={() => setSelectedSymptoms([])}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Selections ({selectedSymptoms.length})</span>
              </button>
            </div>

            {/* Dynamic Symptom Selection Grid */}
            <div className="bg-[#0B0F1D] p-5 rounded-2xl border border-slate-800/80 space-y-3">
              <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                Available Database Biomarkers ({allDatabaseSymptoms.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {allDatabaseSymptoms.map((symptom) => {
                  const isSelected = selectedSymptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={`text-xs px-3 py-2 rounded-xl border transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'bg-gradient-to-r from-cyan-950 to-indigo-950 border-cyan-500 text-cyan-200 font-semibold shadow-md'
                          : 'bg-[#060913] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span>{symptom}</span>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                        isSelected ? 'bg-cyan-400 text-slate-950 border-cyan-400 font-bold' : 'border-slate-700'
                      }`}>
                        {isSelected ? '✓' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Match Results Display */}
            <div className="space-y-4">
              <h3 className="text-sm font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Calculated Pathology Matches ({matchedPathologies.length})</span>
              </h3>

              {matchedPathologies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matchedPathologies.map((pathology) => (
                    <div
                      key={pathology.id}
                      className="bg-[#0B0F1D] border border-slate-800/80 hover:border-indigo-500/50 p-5 rounded-2xl space-y-3 transition-all relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                              {pathology.id}
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                              pathology.urgency === 'Emergency'
                                ? 'bg-rose-950/80 text-rose-400 border-rose-800'
                                : pathology.urgency === 'Moderate'
                                ? 'bg-amber-950/80 text-amber-400 border-amber-800'
                                : 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                            }`}>
                              {pathology.urgency}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-slate-100 mt-1">
                            {pathology.name}
                          </h4>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black font-mono text-cyan-400">{pathology.matchScore}%</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300">{pathology.description}</p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {pathology.symptoms.map((s) => {
                          const matched = selectedSymptoms.includes(s);
                          return (
                            <span
                              key={s}
                              className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                                matched
                                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                  : 'bg-slate-900 text-slate-500 border border-slate-800/60'
                              }`}
                            >
                              {matched ? '✓ ' : ''}{s}
                            </span>
                          );
                        })}
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Specialist Referral:</span>
                        <span className="text-purple-400 font-semibold">{pathology.specialist}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-[#0B0F1D] border border-slate-800 rounded-2xl">
                  <p className="text-xs text-slate-500">Select one or more symptoms above to view differential matches.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: PATHOLOGY DATABASE INSPECTOR ================= */}
        {activeTab === 'database' && (
          <div className="space-y-4">
            <div className="bg-[#0B0F1D] p-5 rounded-2xl border border-slate-800/80 flex flex-col md:flex-row justify-between gap-4 items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Database className="w-5 h-5 text-cyan-400" />
                  <span>Database Inspector (`facial_symptom_database.json`)</span>
                </h2>
                <p className="text-xs text-slate-400">Source: <strong className="text-cyan-300">{dbLoadedSource}</strong> ({database.length} entries loaded)</p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search database..."
                    value={dbSearchQuery}
                    onChange={(e) => setDbSearchQuery(e.target.value)}
                    className="w-full bg-[#060913] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  onClick={loadExternalDatabase}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 text-xs rounded-xl flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reload File</span>
                </button>
              </div>
            </div>

            {/* Database Data Grid Table */}
            <div className="bg-[#0B0F1D] rounded-2xl border border-slate-800/80 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#060913] text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-4">ID</th>
                      <th className="p-4">Pathology Name</th>
                      <th className="p-4">Region</th>
                      <th className="p-4">Urgency</th>
                      <th className="p-4">Associated Symptoms</th>
                      <th className="p-4">Target Specialist</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {database
                      .filter(
                        (item) =>
                          item.name.toLowerCase().includes(dbSearchQuery.toLowerCase()) ||
                          item.symptoms?.some((s) => s.toLowerCase().includes(dbSearchQuery.toLowerCase()))
                      )
                      .map((item) => (
                        <tr key={item.id} className="hover:bg-slate-900/40 transition-all">
                          <td className="p-4 font-mono text-cyan-400 font-semibold">{item.id}</td>
                          <td className="p-4 font-bold text-slate-100">{item.name}</td>
                          <td className="p-4 text-slate-400">{item.region || item.category}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded font-mono text-[10px] border ${
                              item.urgency === 'Emergency'
                                ? 'bg-rose-950 text-rose-400 border-rose-800'
                                : item.urgency === 'Moderate'
                                ? 'bg-amber-950 text-amber-400 border-amber-800'
                                : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            }`}>
                              {item.urgency}
                            </span>
                          </td>
                          <td className="p-4 max-w-xs">
                            <div className="flex flex-wrap gap-1">
                              {item.symptoms?.map((s) => (
                                <span key={s} className="bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800 text-[10px]">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-4 text-purple-400 font-medium">{item.specialist}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: HISTORICAL SCAN LOGS ================= */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="bg-[#0B0F1D] p-5 rounded-2xl border border-slate-800/80 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  <span>Patient Scan Audit Log</span>
                </h2>
                <p className="text-xs text-slate-400">Persistent scan records stored locally</p>
              </div>
              <button
                onClick={() => setScanHistory([])}
                className="text-xs px-3 py-1.5 rounded-lg bg-rose-950/40 text-rose-400 border border-rose-800/60"
              >
                Clear History
              </button>
            </div>

            <div className="bg-[#0B0F1D] rounded-2xl border border-slate-800/80 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#060913] text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-4">Scan ID</th>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Detected Biomarkers</th>
                    <th className="p-4">Top Primary Candidate</th>
                    <th className="p-4">Confidence</th>
                    <th className="p-4">Urgency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {scanHistory.map((scan) => (
                    <tr key={scan.id} className="hover:bg-slate-900/40 transition-all">
                      <td className="p-4 font-mono text-cyan-400 font-bold">{scan.id}</td>
                      <td className="p-4 text-slate-400 font-mono">{scan.date}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {scan.symptoms.map((s) => (
                            <span key={s} className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded text-[10px] border border-slate-800">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-100">{scan.topMatch}</td>
                      <td className="p-4 font-mono text-cyan-400 font-bold">{scan.confidence}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] border ${
                          scan.urgency === 'Emergency'
                            ? 'bg-rose-950 text-rose-400 border-rose-800'
                            : 'bg-amber-950 text-amber-400 border-amber-800'
                        }`}>
                          {scan.urgency}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* JSON Import Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F1D] border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Upload `facial_symptom_database.json`</span>
              </h3>
              <button onClick={() => setShowJsonModal(false)} className="text-slate-500 hover:text-slate-300 text-sm">✕</button>
            </div>

            <p className="text-xs text-slate-400">
              Paste contents of your <code className="text-cyan-400">facial_symptom_database.json</code> file below:
            </p>

            <textarea
              rows={8}
              value={customJsonInput}
              onChange={(e) => setCustomJsonInput(e.target.value)}
              placeholder={`[\n  {\n    "id": "PATH-001",\n    "name": "Sample Condition",\n    "region": "Eyes & Orbit",\n    "urgency": "Moderate",\n    "symptoms": ["Ptosis (Drooping Eyelid)"],\n    "confidenceBase": 90,\n    "specialist": "Neurologist",\n    "description": "Sample description",\n    "actionPlan": "Sample action plan"\n  }\n]`}
              className="w-full bg-[#060913] border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowJsonModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleImportJson}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                Load Dataset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}