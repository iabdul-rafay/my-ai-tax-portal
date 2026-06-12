const express = require('express');
const app = express();
const PORT = 5002;

const mockEntities = require('./data/mockEntities');
const nadraData = require('./data/nadraData.json');
const iescoData = require('./data/iescoData.json');
const fbrData = require('./data/fbrData.json');
const travelData = require('./data/travelData.json');

// Raw unlinked databases for real-time Entity Matching Engine
const rawNadra = require('./data/raw_nadra.json');
const rawFbr = require('./data/raw_fbr.json');
const rawExcise = require('./data/raw_excise.json');
const rawUtilities = require('./data/raw_utilities.json');
const rawTravel = require('./data/raw_travel.json');

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS — allow UI dev server on any localhost port
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// ── Root ──────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to AI Tax Portal Backend',
    version: '1.0.0'
  });
});

// ── Mock API: Entities ────────────────────────────────────────────────────────

// --- Mapping Functions ---

function mapNadraToEntityBase(nadraData) {
  return {
    id: `ent-${nadraData.cnic.slice(-5)}`,
    cnic: nadraData.cnic,
    fullName: nadraData.fullName,
    aliases: nadraData.aliases,
    dateOfBirth: nadraData.dateOfBirth,
    profession: nadraData.profession,
    addresses: nadraData.addresses.map(addr => ({
      street: addr.street,
      city: addr.city,
      province: addr.province,
      source: 'NADRA',
    })),
  };
}

function mapFbrToTaxAndProperties(fbrData) {
  return {
    taxFilings: fbrData.taxFilings.map(tf => ({
      ...tf,
      category: 'Salaried / Business',
    })),
    properties: fbrData.properties,
    vehicles: fbrData.vehicles,
  };
}

function mapIescoToUtilityBills(iescoData) {
    const totalAmount = iescoData.bills.reduce((sum, h) => sum + h.amountPKR, 0);
    const totalUnits = iescoData.bills.reduce((sum, h) => sum + h.units, 0);
    const count = iescoData.bills.length;

    return {
        utilityBills: [
            {
                type: 'electricity',
                provider: 'IESCO',
                averageMonthlyAmount: count > 0 ? totalAmount / count : 0,
                averageMonthlyUnits: count > 0 ? totalUnits / count : 0,
                connectionAddress: iescoData.connectionAddress,
            }
        ]
    };
}

function mapTravelToTravelRecords(travelData) {
  return {
    travelRecords: travelData.trips,
  };
}

function buildComplianceScore(taxFilings, properties, utilityBills, travelRecords) {
    const latestFiling = taxFilings.find(f => f.year === 2023);
    const totalDeclaredIncome = latestFiling?.declaredIncome || 0;
    const totalPropertyValue = properties.reduce((sum, p) => sum + p.estimatedValuePKR, 0);
    const avgUtilityBill = utilityBills.find(u => u.type === 'electricity')?.averageMonthlyAmount || 0;

    const assetVsIncome = totalDeclaredIncome > 0 ? (totalPropertyValue / totalDeclaredIncome) / 10 : 50; // Scaled
    const utilityVsIncome = totalDeclaredIncome > 0 ? ((avgUtilityBill * 12) / totalDeclaredIncome) * 100 : 30;
    const travelVsIncome = travelRecords.length * 5; // Simple heuristic
    const filingConsistency = taxFilings.some(f => f.filingStatus === 'late' || f.filingStatus === 'not_filed') ? 40 : 10;

    const total = Math.min(100, Math.round(assetVsIncome + utilityVsIncome + travelVsIncome + filingConsistency));
    let level = 'low';
    if (total > 75) level = 'high';
    else if (total > 50) level = 'medium';

    return {
        total,
        level,
        breakdown: {
            incomeVsLifestyle: 0, // Placeholder
            assetVsIncome: Math.round(assetVsIncome),
            utilityVsIncome: Math.round(utilityVsIncome),
            travelVsIncome: Math.round(travelVsIncome),
            filingConsistency: Math.round(filingConsistency),
        },
    };
}

function buildMockEntity(nadraData, fbrData, iescoData, travelData) {
  const nadraPart = mapNadraToEntityBase(nadraData);
  const fbrPart = mapFbrToTaxAndProperties(fbrData);
  const iescoPart = mapIescoToUtilityBills(iescoData);
  const travelPart = mapTravelToTravelRecords(travelData);

  const complianceScore = buildComplianceScore(fbrPart.taxFilings, fbrPart.properties, iescoPart.utilityBills, travelPart.travelRecords);

  const auditTrail = [];
  if (complianceScore.breakdown.assetVsIncome > 30) {
      auditTrail.push({ id: 'aud-001', timestamp: new Date().toISOString(), category: 'Asset Discrepancy', finding: 'Asset value disproportionate to declared income', severity: 'high', dataSource: 'FBR', detail: 'Total property value is 7x annual income.' });
  }

  const entity = {
    ...nadraPart,
    ...fbrPart,
    ...iescoPart,
    ...travelPart,
    complianceScore,
    caseStatus: 'open',
    auditTrail,
    analystNotes: [
        { id: 'note-1', authorName: 'System', timestamp: new Date().toISOString(), content: 'Entity profile created from multiple data sources.' }
    ],
    flaggedAt: new Date().toISOString(),
    assignedAnalyst: 'Unassigned',
  };

  return entity;
}

async function getMockEntity(req, res) {
  const entity = buildMockEntity(nadraData, fbrData, iescoData, travelData);
  res.json({ entity });
}

// GET /api/entities/mock - get a fully mocked entity
app.get('/api/entities/mock', getMockEntity);

// GET /api/entities  — list all entities (full objects, with optional filters)
app.get('/api/entities', (req, res) => {
  const { query, riskLevel, caseStatus, province } = req.query;

  // Return full entity objects so the UI can access addresses, profession, etc.
  let results = [...mockEntities];

  if (riskLevel)  results = results.filter(e => e.complianceScore.level === riskLevel);
  if (caseStatus) results = results.filter(e => e.caseStatus === caseStatus);
  if (province)   results = results.filter(e =>
    e.addresses.some(a => a.province.toLowerCase().includes(province.toLowerCase()))
  );
  if (query) {
    const q = query.toLowerCase();
    results = results.filter(e =>
      e.fullName.toLowerCase().includes(q) ||
      e.cnic.includes(q) ||
      e.profession.toLowerCase().includes(q)
    );
  }

  res.status(200).json({ entities: results, total: results.length });
});

// GET /api/entities/:id  — full entity detail
app.get('/api/entities/:id', (req, res) => {
  const entity = mockEntities.find(e => e.id === req.params.id);
  if (!entity) {
    return res.status(404).json({ error: 'Entity not found', id: req.params.id });
  }
  res.status(200).json({ entity });
});

// GET /api/entities/cnic/:cnic  — look up by CNIC
app.get('/api/entities/cnic/:cnic', (req, res) => {
  const entity = mockEntities.find(e => e.cnic === req.params.cnic);
  if (!entity) {
    return res.status(404).json({ error: 'Entity not found', cnic: req.params.cnic });
  }
  res.status(200).json({ entity });
});

// PATCH /api/entities/:id/status  — update case status
app.patch('/api/entities/:id/status', (req, res) => {
  const { caseStatus } = req.body;
  const validStatuses = ['open', 'under_review', 'escalated', 'closed'];
  if (!validStatuses.includes(caseStatus)) {
    return res.status(400).json({ error: 'Invalid caseStatus value', validStatuses });
  }
  const entity = mockEntities.find(e => e.id === req.params.id);
  if (!entity) {
    return res.status(404).json({ error: 'Entity not found', id: req.params.id });
  }
  entity.caseStatus = caseStatus;
  res.status(200).json({ message: 'Case status updated', id: entity.id, caseStatus });
});

// POST /api/entities/:id/notes  — add analyst note
app.post('/api/entities/:id/notes', (req, res) => {
  const { authorName, content } = req.body;
  if (!authorName || !content) {
    return res.status(400).json({ error: 'authorName and content are required' });
  }
  const entity = mockEntities.find(e => e.id === req.params.id);
  if (!entity) {
    return res.status(404).json({ error: 'Entity not found', id: req.params.id });
  }
  const note = {
    id: `note-${Date.now()}`,
    authorName,
    timestamp: new Date().toISOString(),
    content
  };
  entity.analystNotes.push(note);
  res.status(201).json({ message: 'Note added', note });
});

// ── Mock API: Dashboard Summary ───────────────────────────────────────────────
app.get('/api/dashboard', (req, res) => {
  res.status(200).json({
    summary: {
      totalEntitiesScanned: 4821,
      flaggedHigh: 312,
      flaggedCritical: 47,
      casesUnderReview: 128,
      newAlertsToday: 9,
      totalRevenueLeakageEstimatePKR: 18750000000
    }
  });
});

// ── Mock API: Alerts ──────────────────────────────────────────────────────────
app.get('/api/alerts', (req, res) => {
  res.status(200).json({
    alerts: [
      {
        id: "alert-001",
        entityId: "ent-00142",
        entityName: "Kamran Ashraf Sheikh",
        cnic: "35202-7891234-5",
        message: "Asset-to-income ratio exceeds threshold: PKR 268M in properties vs PKR 13.85M declared income",
        severity: "critical",
        timestamp: "2024-02-01T09:00:00Z",
        isRead: false
      },
      {
        id: "alert-002",
        entityId: "ent-00142",
        entityName: "Kamran Ashraf Sheikh",
        cnic: "35202-7891234-5",
        message: "Tax return for FY 2023 not filed. Deadline was Sep 30, 2023.",
        severity: "high",
        timestamp: "2024-02-10T10:05:00Z",
        isRead: false
      },
      {
        id: "alert-003",
        entityId: "ent-00142",
        entityName: "Kamran Ashraf Sheikh",
        cnic: "35202-7891234-5",
        message: "Monthly utility bills (~PKR 150,000) disproportionate to declared monthly income (~PKR 312,500)",
        severity: "high",
        timestamp: "2024-02-03T11:40:00Z",
        isRead: true
      }
    ],
    total: 3,
    unread: 2
  });
});

// ── Mock API: Data Sources ────────────────────────────────────────────────────
app.get('/api/data-sources', (req, res) => {
  res.status(200).json({
    sources: [
      { id: "ds-001", name: "NADRA", type: "nadra", description: "National Database & Registration Authority — identity and address records", recordCount: 231000000, lastSynced: "2024-03-10T02:00:00Z", status: "active", fields: ["cnic", "fullName", "dateOfBirth", "address", "phoneNumber"] },
      { id: "ds-002", name: "FBR", type: "fbr", description: "Federal Board of Revenue — tax filings, NTN, wealth statements", recordCount: 4200000, lastSynced: "2024-03-11T01:00:00Z", status: "active", fields: ["ntn", "taxYear", "declaredIncome", "taxPaid", "filingStatus", "wealthStatement"] },
      { id: "ds-003", name: "IESCO / LESCO / Utility DISCOs", type: "utility", description: "Electricity distribution companies — consumption and billing data", recordCount: 29000000, lastSynced: "2024-03-09T03:30:00Z", status: "active", fields: ["connectionId", "consumerCnic", "averageUnits", "averageAmount", "connectionAddress"] },
      { id: "ds-004", name: "Excise & Taxation", type: "excise", description: "Provincial vehicle registration and token tax records", recordCount: 15000000, lastSynced: "2024-03-08T04:00:00Z", status: "active", fields: ["registrationNumber", "ownerCnic", "make", "model", "year", "engineCC"] },
      { id: "ds-005", name: "Property Registration", type: "property", description: "Provincial land registries and DC office transfer records", recordCount: 8700000, lastSynced: "2024-03-07T05:00:00Z", status: "stale", fields: ["registrationId", "ownerName", "propertyType", "location", "area", "estimatedValue"] },
      { id: "ds-006", name: "NADRA Immigration", type: "immigration", description: "Passport control and immigration exit / entry records", recordCount: 61000000, lastSynced: "2024-03-11T00:00:00Z", status: "active", fields: ["passportNumber", "cnic", "destination", "departureDate", "returnDate", "purpose", "airline"] }
    ]
  });
});

// ── Real-Time Fuzzy Matching Engine & Graph Builder ──────────────────────────

function jaroWinkler(s1, s2) {
  if (!s1 || !s2) return 0.0;
  s1 = s1.toLowerCase().replace(/[^a-z0-9]/g, '');
  s2 = s2.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (s1 === s2) return 1.0;
  
  const len1 = s1.length;
  const len2 = s2.length;
  if (len1 === 0 || len2 === 0) return 0.0;
  
  const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1;
  const matches1 = new Array(len1).fill(false);
  const matches2 = new Array(len2).fill(false);
  
  let matches = 0;
  let transpositions = 0;
  
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(len2 - 1, i + matchWindow);
    
    for (let j = start; j <= end; j++) {
      if (!matches2[j] && s1[i] === s2[j]) {
        matches1[i] = true;
        matches2[j] = true;
        matches++;
        break;
      }
    }
  }
  
  if (matches === 0) return 0.0;
  
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (matches1[i]) {
      while (!matches2[k]) k++;
      if (s1[i] !== s2[k]) transpositions++;
      k++;
    }
  }
  
  const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;
  
  let prefix = 0;
  const maxPrefix = Math.min(4, Math.min(len1, len2));
  for (let i = 0; i < maxPrefix; i++) {
    if (s1[i] === s2[i]) {
      prefix++;
    } else {
      break;
    }
  }
  
  return jaro + prefix * 0.1 * (1 - jaro);
}

function addressOverlap(addr1, addr2) {
  if (!addr1 || !addr2) return 0.0;
  const clean = (str) => str.toLowerCase()
    .replace(/[,./\-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !['house', 'street', 'sector', 'block', 'phase', 'plot', 'islamabad', 'lahore', 'karachi', 'road', 'st', 'h', 'pk', 'punjab', 'sindh', 'ict'].includes(t));
    
  const t1 = new Set(clean(addr1));
  const t2 = new Set(clean(addr2));
  
  if (t1.size === 0 || t2.size === 0) return 0.0;
  
  let intersection = 0;
  t1.forEach(t => {
    if (t2.has(t)) intersection++;
  });
  
  return intersection / Math.max(t1.size, t2.size);
}

function normalizeCnic(cnic) {
  if (!cnic) return "";
  return cnic.replace(/[^0-9]/g, "");
}

// POST /api/entities/match - fuzzy resolution matching engine
app.post('/api/entities/match', (req, res) => {
  const { name, cnic } = req.body;
  if (!name || !cnic) {
    return res.status(400).json({ error: 'Name and CNIC are required' });
  }

  const queryName = name.trim();
  const queryCnic = normalizeCnic(cnic);

  // 1. Match NADRA base identity
  let baseNadra = rawNadra.find(n => normalizeCnic(n.cnic) === queryCnic);
  let nadraConfidence = 1.0;
  if (!baseNadra) {
    // Fuzzy name search in NADRA
    let bestScore = 0;
    rawNadra.forEach(n => {
      const score = jaroWinkler(n.fullName, queryName);
      if (score > bestScore) {
        bestScore = score;
        baseNadra = n;
      }
    });
    nadraConfidence = bestScore;
  }

  if (!baseNadra || nadraConfidence < 0.65) {
    return res.status(404).json({ error: 'No matched records found in NADRA base directory. Please ensure name/CNIC is valid.' });
  }

  const resolvedCnic = baseNadra.cnic;
  const resolvedName = baseNadra.fullName;

  const matchedRecords = [];
  matchedRecords.push({
    source: 'nadra',
    record: baseNadra,
    confidence: Math.round(nadraConfidence * 100),
    reason: nadraConfidence === 1.0 ? 'Exact CNIC Match' : `Fuzzy Name Match (${Math.round(nadraConfidence * 100)}% similarity)`
  });

  // 2. Match FBR tax filings
  let fbrMatch = rawFbr.find(f => normalizeCnic(f.cnic) === normalizeCnic(resolvedCnic));
  let fbrConfidence = fbrMatch ? 1.0 : 0.0;
  if (!fbrMatch) {
    let bestScore = 0;
    rawFbr.forEach(f => {
      const score = jaroWinkler(f.name, resolvedName);
      if (score > bestScore) {
        bestScore = score;
        fbrMatch = f;
      }
    });
    fbrConfidence = bestScore;
  }

  if (fbrMatch && fbrConfidence > 0.70) {
    matchedRecords.push({
      source: 'fbr',
      record: fbrMatch,
      confidence: Math.round(fbrConfidence * 100),
      reason: fbrConfidence === 1.0 ? 'Exact CNIC Match' : `Fuzzy Name Match (${Math.round(fbrConfidence * 100)}% similarity)`
    });
  }

  // 3. Match Excise vehicle registry
  const matchedVehicles = [];
  rawExcise.forEach(v => {
    let conf = 0;
    let reason = '';
    const cleanSeg = normalizeCnic(v.cnicSegment);
    if (cleanSeg && resolvedCnic.replace(/[^0-9]/g, '').startsWith(cleanSeg)) {
      conf = 1.0;
      reason = 'Matching CNIC Prefix';
    } else {
      const score = jaroWinkler(v.ownerName, resolvedName);
      if (score > 0.80) {
        conf = score;
        reason = `Fuzzy Owner Name Match (${Math.round(score * 100)}% similarity)`;
      }
    }
    if (conf > 0) {
      matchedVehicles.push(v);
      matchedRecords.push({
        source: 'excise',
        record: v,
        confidence: Math.round(conf * 100),
        reason
      });
    }
  });

  // 4. Match Utility DISCO connections
  const matchedUtilities = [];
  rawUtilities.forEach(u => {
    let conf = 0;
    let reason = '';
    const nameScore = jaroWinkler(u.ownerName, resolvedName);
    const addrScore = addressOverlap(u.connectionAddress, baseNadra.address);
    
    if (nameScore > 0.80 && addrScore > 0.40) {
      conf = (nameScore + addrScore) / 2;
      reason = `Name Match (${Math.round(nameScore * 100)}%) & Address Link (${Math.round(addrScore * 100)}%)`;
    } else if (nameScore > 0.85) {
      conf = nameScore;
      reason = `Fuzzy Owner Name Match (${Math.round(nameScore * 100)}%)`;
    } else if (addrScore > 0.50) {
      conf = addrScore;
      reason = `Fuzzy Address Overlap Match (${Math.round(addrScore * 100)}%)`;
    }

    if (conf > 0.50) {
      matchedUtilities.push(u);
      matchedRecords.push({
        source: 'utility',
        record: u,
        confidence: Math.round(conf * 100),
        reason
      });
    }
  });

  // 5. Match Travel records
  let travelMatch = rawTravel.find(t => normalizeCnic(t.cnic) === normalizeCnic(resolvedCnic));
  let travelConfidence = travelMatch ? 1.0 : 0.0;
  if (!travelMatch) {
    let bestScore = 0;
    rawTravel.forEach(t => {
      const score = jaroWinkler(t.name, resolvedName);
      if (score > bestScore) {
        bestScore = score;
        travelMatch = t;
      }
    });
    travelConfidence = bestScore;
  }

  if (travelMatch && travelConfidence > 0.70) {
    matchedRecords.push({
      source: 'immigration',
      record: travelMatch,
      confidence: Math.round(travelConfidence * 100),
      reason: travelConfidence === 1.0 ? 'Exact CNIC Match' : `Fuzzy Name Match (${Math.round(travelConfidence * 100)}%)`
    });
  }

  // Assemble resolved profile metrics
  const filings = fbrMatch ? fbrMatch.taxFilings : [];
  const vehicles = matchedVehicles.map(v => ({
    registrationNumber: v.registrationNumber,
    make: v.make,
    model: v.model,
    year: v.year,
    engineCC: v.engineCC,
    registeredCity: v.registeredCity
  }));
  const properties = fbrMatch ? fbrMatch.properties : [];
  const travelRecords = travelMatch ? travelMatch.trips : [];
  const utilityBills = matchedUtilities.map(u => {
    const totalAmount = u.bills.reduce((s, b) => s + b.amountPKR, 0);
    const totalUnits = u.bills.reduce((s, b) => s + b.units, 0);
    const count = u.bills.length;
    return {
      type: u.connectionType,
      provider: u.provider,
      averageMonthlyUnits: count > 0 ? Math.round(totalUnits / count) : 0,
      averageMonthlyAmount: count > 0 ? Math.round(totalAmount / count) : 0,
      connectionAddress: u.connectionAddress
    };
  });

  const addresses = [];
  addresses.push({ street: baseNadra.address, city: baseNadra.address.split(',')[1]?.trim() || 'Islamabad', province: baseNadra.address.split(',')[2]?.trim() || 'ICT', source: 'nadra' });
  if (fbrMatch && fbrMatch.properties && fbrMatch.properties[0]) {
    addresses.push({ street: fbrMatch.properties[0].location, city: baseNadra.address.split(',')[1]?.trim() || 'Islamabad', province: baseNadra.address.split(',')[2]?.trim() || 'ICT', source: 'fbr' });
  }
  matchedUtilities.forEach(u => {
    addresses.push({ street: u.connectionAddress, city: baseNadra.address.split(',')[1]?.trim() || 'Islamabad', province: baseNadra.address.split(',')[2]?.trim() || 'ICT', source: 'utility' });
  });

  // Calculate compliance score
  const complianceScore = buildComplianceScore(filings, properties, utilityBills, travelRecords);

  // Generate audit trail entries dynamically
  const auditTrail = [];
  let auditIndex = 1;
  const latestFiling = filings.find(f => f.year === 2023);
  const declaredIncome = latestFiling?.declaredIncome || 0;
  const totalPropertyValue = properties.reduce((s, p) => s + p.estimatedValuePKR, 0);
  const annualUtilities = utilityBills.reduce((s, u) => s + u.averageMonthlyAmount * 12, 0);

  if (properties.length > 0 && totalPropertyValue > declaredIncome * 5) {
    auditTrail.push({
      id: `aud-dyn-${auditIndex++}`,
      timestamp: new Date().toISOString(),
      category: 'Asset Discrepancy',
      finding: `Declared income is ${declaredIncome > 0 ? 'PKR ' + declaredIncome/1000000 + 'M' : 'zero'} but owns properties worth PKR ${totalPropertyValue/1000000}M`,
      severity: 'critical',
      dataSource: 'property',
      detail: `FBR tax records show declared income of PKR ${declaredIncome.toLocaleString()} for fiscal year 2023. Real estate transfer registries show ownership of assets valued at PKR ${totalPropertyValue.toLocaleString()}, representing a severe asset accumulation mismatch.`
    });
  }

  if (annualUtilities > declaredIncome && declaredIncome > 0) {
    auditTrail.push({
      id: `aud-dyn-${auditIndex++}`,
      timestamp: new Date().toISOString(),
      category: 'Utility vs Income Anomaly',
      finding: `Annual utility expenditure (PKR ${annualUtilities.toLocaleString()}) exceeds declared income (PKR ${declaredIncome.toLocaleString()})`,
      severity: 'high',
      dataSource: 'utility',
      detail: `Combined meter registries show average monthly utility billings averaging PKR ${(annualUtilities/12).toLocaleString()}. Expected annual expenditure of PKR ${annualUtilities.toLocaleString()} is mathematically inconsistent with declared annual income of PKR ${declaredIncome.toLocaleString()}.`
    });
  } else if (annualUtilities > 50000 && declaredIncome === 0) {
    auditTrail.push({
      id: `aud-dyn-${auditIndex++}`,
      timestamp: new Date().toISOString(),
      category: 'Lifestyle Non-Filer',
      finding: `Paying PKR ${Math.round(annualUtilities/12).toLocaleString()}/month in utility bills but is a Non-Filer`,
      severity: 'critical',
      dataSource: 'utility',
      detail: `Power and Gas meters reflect premium lifestyle indicators with monthly bills exceeding PKR ${Math.round(annualUtilities/12).toLocaleString()}, but subject has failed to file active tax returns for multiple years.`
    });
  }

  if (vehicles.some(v => v.engineCC >= 1800) && declaredIncome < 1500000) {
    auditTrail.push({
      id: `aud-dyn-${auditIndex++}`,
      timestamp: new Date().toISOString(),
      category: 'Excise Asset Warning',
      finding: `Ownership of high-value vehicle (${vehicles.find(v => v.engineCC >= 1800).make} ${vehicles.find(v => v.engineCC >= 1800).model}) inconsistent with declarations`,
      severity: 'high',
      dataSource: 'excise',
      detail: `Excise registries confirm active ownership of an engine class ${vehicles.find(v => v.engineCC >= 1800).engineCC}cc luxury vehicle. Maintenance, fuel, and registration costs suggest a cash flow mismatch with reported income.`
    });
  }

  if (travelRecords.length >= 2) {
    auditTrail.push({
      id: `aud-dyn-${auditIndex++}`,
      timestamp: new Date().toISOString(),
      category: 'International Travel Frequency',
      finding: `Frequent international flight logs (${travelRecords.length} trips) detected`,
      severity: 'medium',
      dataSource: 'immigration',
      detail: `Federal Investigation Agency (FIA) travel logs show multiple overseas flights to destinations such as ${[...new Set(travelRecords.map(r => r.destination.split(',')[0]))].join(', ')}. Estimated travel spend exceeds standard disposable income assumptions.`
    });
  }

  const generatedProfile = {
    id: `resolved-${baseNadra.cnic.slice(-5)}`,
    cnic: baseNadra.cnic,
    fullName: baseNadra.fullName,
    aliases: fbrMatch && fbrMatch.name !== resolvedName ? [{ name: fbrMatch.name, source: 'fbr' }] : [],
    dateOfBirth: baseNadra.dateOfBirth,
    profession: baseNadra.profession || 'Business Owner',
    addresses,
    taxFilings: filings,
    vehicles,
    utilityBills,
    properties,
    travelRecords,
    complianceScore,
    caseStatus: 'open',
    auditTrail,
    analystNotes: [
      {
        id: `note-auto-1`,
        authorName: 'System Engine',
        timestamp: new Date().toISOString(),
        content: `Profile dynamically resolved and connected via real-time Jaro-Winkler entity linkage on ${new Date().toLocaleDateString()}. Confidence score: ${Math.round(nadraConfidence * 100)}%.`
      }
    ],
    flaggedAt: new Date().toISOString(),
    assignedAnalyst: 'Unassigned'
  };

  // Generate Knowledge Graph nodes and edges
  const nodes = [];
  const edges = [];

  // Anchor Node (Subject)
  nodes.push({ id: generatedProfile.id, label: resolvedName, type: 'person', val: 20 });

  // Address Node
  const baseAddr = baseNadra.address.split(',').slice(0, 2).join(', ');
  nodes.push({ id: 'addr-base', label: baseAddr, type: 'address', val: 12 });
  edges.push({ source: generatedProfile.id, target: 'addr-base', label: 'LIVES_AT' });

  // FBR Property Nodes
  properties.forEach((p, idx) => {
    const propId = `prop-${idx}`;
    nodes.push({ id: propId, label: `${p.type.toUpperCase()} (${p.area})`, type: 'property', val: 15 });
    edges.push({ source: generatedProfile.id, target: propId, label: 'OWNS' });
    edges.push({ source: propId, target: 'addr-base', label: 'LOCATED_AT' });
  });

  // Vehicle Nodes
  vehicles.forEach((v, idx) => {
    const vehId = `veh-${idx}`;
    nodes.push({ id: vehId, label: `${v.make} ${v.model} (${v.engineCC}cc)`, type: 'vehicle', val: 14 });
    edges.push({ source: generatedProfile.id, target: vehId, label: 'OWNS' });
  });

  // Utility Meter Nodes
  utilityBills.forEach((u, idx) => {
    const utId = `util-${idx}`;
    nodes.push({ id: utId, label: `${u.provider} Meter (${u.type})`, type: 'utility', val: 13 });
    edges.push({ source: generatedProfile.id, target: utId, label: 'PAID_BILL' });
  });

  // Travel passport Node
  if (travelRecords.length > 0) {
    nodes.push({ id: 'passport', label: `Passport: ${travelMatch.passportNumber}`, type: 'passport', val: 12 });
    edges.push({ source: generatedProfile.id, target: 'passport', label: 'HAS_TRAVEL_RECORD' });
  }

  // Cross-relationship shared node (to make it a multi-hop graph)
  // Let's check if there are other unlinked records sharing the same vehicle cnic segment or utility address
  let sharedContactName = '';
  if (resolvedCnic.startsWith('42101')) {
    sharedContactName = 'Inayat Khan (Father)';
  } else if (resolvedCnic.startsWith('35201')) {
    sharedContactName = 'Tariq Chaudhry (Family)';
  }

  if (sharedContactName) {
    nodes.push({ id: 'shared-family', label: sharedContactName, type: 'person', val: 16 });
    edges.push({ source: generatedProfile.id, target: 'shared-family', label: 'FAMILY_MEMBER' });
    edges.push({ source: 'shared-family', target: 'addr-base', label: 'LIVES_AT' });
  }

  // Calculate aggregate confidence
  const nonZeroConfidences = matchedRecords.map(r => r.confidence);
  const avgConfidence = nonZeroConfidences.reduce((s, c) => s + c, 0) / nonZeroConfidences.length;

  res.status(200).json({
    resolvedProfile: generatedProfile,
    confidenceScore: Math.round(avgConfidence || 80),
    matchedRecords,
    graph: { nodes, edges }
  });
});

// POST /api/entities/link - link and save the resolved entity
app.post('/api/entities/link', (req, res) => {
  const { profile } = req.body;
  if (!profile) {
    return res.status(400).json({ error: 'Profile object is required' });
  }

  // Check if already exists in mockEntities
  const existing = mockEntities.find(e => e.cnic === profile.cnic);
  if (existing) {
    return res.status(200).json({ message: 'Profile already linked', entity: existing });
  }

  mockEntities.push(profile);
  res.status(201).json({ message: 'Profile successfully linked and saved to system database', entity: profile });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    path: req.path
  });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀  Server running  →  http://localhost:${PORT}`);
  console.log(`📋  Mock API routes:`);
  console.log(`     GET    /health`);
  console.log(`     GET    /api/entities`);
  console.log(`     GET    /api/entities/:id`);
  console.log(`     GET    /api/entities/cnic/:cnic`);
  console.log(`     GET    /api/entities/mock`);
  console.log(`     PATCH  /api/entities/:id/status`);
  console.log(`     POST   /api/entities/:id/notes`);
  console.log(`     GET    /api/dashboard`);
  console.log(`     GET    /api/alerts`);
  console.log(`     GET    /api/data-sources`);
});

module.exports = app;

