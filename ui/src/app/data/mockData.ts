// ============================================================
// Mock data: Realistic synthetic Pakistani dataset
// Replace this file's consumers with real API calls later.
// ============================================================

import type {
  Entity,
  DashboardSummary,
  Alert,
  DataSource,
} from "../types";

// ---- Sample Entities -------------------------------------------

export const mockEntities: Entity[] = [
  // ---- HIGH RISK: Multiple inconsistencies ----
  {
    id: "ENT-001",
    cnic: "35202-1234567-9",
    fullName: "Muhammad Kamran Akhtar",
    aliases: [
      { name: "M. Kamran Akhtar", source: "excise" },
      { name: "Kamran Aktar", source: "utility" },
    ],
    dateOfBirth: "1975-04-12",
    profession: "Grocery Shop Owner",
    addresses: [
      {
        street: "House 14-B, Street 7, Gulberg III",
        city: "Lahore",
        province: "Punjab",
        source: "fbr",
      },
      {
        street: "14-B/7, Gulberg 3",
        city: "Lahore",
        province: "Punjab",
        source: "utility",
      },
      {
        street: "Plot 14, Block B, Gulberg III",
        city: "Lahore",
        province: "Punjab",
        source: "nadra",
      },
    ],
    taxFilings: [
      {
        year: 2023,
        declaredIncome: 1200000,
        taxPaid: 18000,
        filingStatus: "filed",
        category: "Individual – Trader",
      },
      {
        year: 2022,
        declaredIncome: 1100000,
        taxPaid: 14000,
        filingStatus: "filed",
        category: "Individual – Trader",
      },
      {
        year: 2021,
        declaredIncome: 900000,
        taxPaid: 8000,
        filingStatus: "late",
        category: "Individual – Trader",
      },
    ],
    vehicles: [
      {
        registrationNumber: "LHR-2021-7734",
        make: "Toyota",
        model: "Prado TZ",
        year: 2021,
        engineCC: 4000,
        registeredCity: "Lahore",
      },
      {
        registrationNumber: "LHR-2019-3321",
        make: "Honda",
        model: "Civic",
        year: 2019,
        engineCC: 1500,
        registeredCity: "Lahore",
      },
    ],
    utilityBills: [
      {
        type: "electricity",
        provider: "LESCO",
        averageMonthlyUnits: 3200,
        averageMonthlyAmount: 96000,
        connectionAddress: "14-B/7, Gulberg 3, Lahore",
      },
      {
        type: "gas",
        provider: "SNGPL",
        averageMonthlyUnits: 420,
        averageMonthlyAmount: 28000,
        connectionAddress: "14-B/7, Gulberg 3, Lahore",
      },
    ],
    properties: [
      {
        type: "residential",
        location: "Gulberg III, Lahore",
        estimatedValuePKR: 85000000,
        area: "10 Marla",
        registeredIn: "Muhammad Kamran Akhtar",
      },
      {
        type: "commercial",
        location: "DHA Phase 5, Lahore",
        estimatedValuePKR: 120000000,
        area: "2 Kanal",
        registeredIn: "M. Kamran Akhtar",
      },
    ],
    travelRecords: [
      {
        destination: "Dubai, UAE",
        departureDate: "2023-03-10",
        returnDate: "2023-03-25",
        purpose: "personal",
        airline: "Emirates",
      },
      {
        destination: "Bangkok, Thailand",
        departureDate: "2023-07-01",
        returnDate: "2023-07-12",
        purpose: "personal",
        airline: "Thai Airways",
      },
      {
        destination: "London, UK",
        departureDate: "2022-12-20",
        returnDate: "2023-01-05",
        purpose: "personal",
        airline: "PIA",
      },
      {
        destination: "Istanbul, Turkey",
        departureDate: "2022-06-15",
        returnDate: "2022-06-28",
        purpose: "personal",
        airline: "Turkish Airlines",
      },
    ],
    complianceScore: {
      total: 87,
      level: "critical",
      breakdown: {
        incomeVsLifestyle: 92,
        assetVsIncome: 95,
        utilityVsIncome: 88,
        travelVsIncome: 91,
        filingConsistency: 62,
      },
    },
    caseStatus: "escalated",
    flaggedAt: "2024-01-15T09:30:00Z",
    assignedAnalyst: "Analyst Zafar",
    auditTrail: [
      {
        id: "AUD-001-1",
        timestamp: "2024-01-15T09:30:00Z",
        category: "Asset vs Income Mismatch",
        finding:
          "Declared annual income PKR 1.2M but owns 2 properties worth PKR 205M",
        severity: "critical",
        dataSource: "property",
        detail:
          "FBR income records show declared income of PKR 1,200,000 for tax year 2023. Property registry (PUNJAB) shows ownership of residential property in Gulberg III worth ~PKR 85M and commercial property in DHA Phase 5 worth ~PKR 120M. Total asset value is 170× declared annual income.",
      },
      {
        id: "AUD-001-2",
        timestamp: "2024-01-15T09:30:00Z",
        category: "Luxury Vehicle Ownership",
        finding: "Toyota Prado TZ (2021) market value ~PKR 22M on PKR 1.2M income",
        severity: "high",
        dataSource: "excise",
        detail:
          "Excise Department records show a 2021 Toyota Prado TZ registered to the entity. Market value approximately PKR 22,000,000. Entity's declared income of PKR 1.2M/year is insufficient to service a vehicle of this value.",
      },
      {
        id: "AUD-001-3",
        timestamp: "2024-01-15T09:30:00Z",
        category: "Utility Consumption Mismatch",
        finding:
          "Monthly electricity bill ~PKR 96,000 suggests premium lifestyle",
        severity: "high",
        dataSource: "utility",
        detail:
          "LESCO records show average monthly consumption of 3,200 kWh, generating bills of ~PKR 96,000/month (PKR 1.15M/year). This alone exceeds the entity's declared annual income.",
      },
      {
        id: "AUD-001-4",
        timestamp: "2024-01-15T09:30:00Z",
        category: "International Travel Pattern",
        finding:
          "4 international trips in 18 months inconsistent with declared income",
        severity: "high",
        dataSource: "immigration",
        detail:
          "FIA immigration records show 4 international trips (Dubai, Bangkok, London, Istanbul) within 18 months. Estimated travel expenditure exceeds PKR 1.5M. Entity's declared income does not support this travel pattern.",
      },
      {
        id: "AUD-001-5",
        timestamp: "2024-01-16T11:00:00Z",
        category: "Case Escalation",
        finding: "Case escalated to Large Taxpayers Unit (LTU) for audit",
        severity: "critical",
        dataSource: "fbr",
        detail:
          "Based on aggregate deviation score of 87/100, case has been escalated for formal audit proceedings under Section 177 of Income Tax Ordinance 2001.",
      },
    ],
    analystNotes: [
      {
        id: "NOTE-001-1",
        authorName: "Analyst Zafar",
        timestamp: "2024-01-16T14:00:00Z",
        content:
          "Entity operates grocery business as front. Multiple business associates in the supply chain space with no formal company registration. Recommend cross-referencing with SECP records.",
      },
    ],
  },

  // ---- CRITICAL RISK: Politician / public figure type ----
  {
    id: "ENT-002",
    cnic: "42101-9876543-1",
    fullName: "Farida Noor Siddiqui",
    aliases: [
      { name: "Farida Siddiqui", source: "fbr" },
      { name: "F. N. Siddiqui", source: "property" },
    ],
    dateOfBirth: "1968-11-03",
    profession: "Real Estate Consultant",
    addresses: [
      {
        street: "B-14, Clifton Block 5",
        city: "Karachi",
        province: "Sindh",
        source: "nadra",
      },
      {
        street: "B-14 Clifton, Block-5",
        city: "Karachi",
        province: "Sindh",
        source: "fbr",
      },
    ],
    taxFilings: [
      {
        year: 2023,
        declaredIncome: 3500000,
        taxPaid: 210000,
        filingStatus: "filed",
        category: "Individual – Professional",
      },
      {
        year: 2022,
        declaredIncome: 2800000,
        taxPaid: 140000,
        filingStatus: "filed",
        category: "Individual – Professional",
      },
      {
        year: 2021,
        declaredIncome: 0,
        taxPaid: 0,
        filingStatus: "not_filed",
        category: "Individual – Professional",
      },
    ],
    vehicles: [
      {
        registrationNumber: "KHI-2022-1190",
        make: "Mercedes-Benz",
        model: "GLE 450",
        year: 2022,
        engineCC: 3000,
        registeredCity: "Karachi",
      },
      {
        registrationNumber: "KHI-2020-4455",
        make: "BMW",
        model: "7 Series",
        year: 2020,
        engineCC: 3000,
        registeredCity: "Karachi",
      },
    ],
    utilityBills: [
      {
        type: "electricity",
        provider: "KESC",
        averageMonthlyUnits: 5500,
        averageMonthlyAmount: 175000,
        connectionAddress: "B-14 Clifton, Block-5, Karachi",
      },
    ],
    properties: [
      {
        type: "residential",
        location: "Clifton Block 5, Karachi",
        estimatedValuePKR: 200000000,
        area: "2 Kanal Bungalow",
        registeredIn: "F. N. Siddiqui",
      },
      {
        type: "commercial",
        location: "Defence Housing Authority, Karachi",
        estimatedValuePKR: 85000000,
        area: "5 Marla Commercial",
        registeredIn: "Farida Siddiqui",
      },
      {
        type: "residential",
        location: "Bahria Town, Rawalpindi",
        estimatedValuePKR: 45000000,
        area: "1 Kanal",
        registeredIn: "Farida Noor Siddiqui",
      },
    ],
    travelRecords: [
      {
        destination: "London, UK",
        departureDate: "2023-01-05",
        returnDate: "2023-01-25",
        purpose: "personal",
        airline: "British Airways",
      },
      {
        destination: "Geneva, Switzerland",
        departureDate: "2023-04-10",
        returnDate: "2023-04-15",
        purpose: "business",
        airline: "Swiss Air",
      },
      {
        destination: "Dubai, UAE",
        departureDate: "2023-08-20",
        returnDate: "2023-09-05",
        purpose: "personal",
        airline: "Emirates",
      },
    ],
    complianceScore: {
      total: 92,
      level: "critical",
      breakdown: {
        incomeVsLifestyle: 95,
        assetVsIncome: 98,
        utilityVsIncome: 90,
        travelVsIncome: 88,
        filingConsistency: 78,
      },
    },
    caseStatus: "under_review",
    flaggedAt: "2024-02-01T08:00:00Z",
    assignedAnalyst: "Analyst Nadia",
    auditTrail: [
      {
        id: "AUD-002-1",
        timestamp: "2024-02-01T08:00:00Z",
        category: "Asset vs Income Mismatch",
        finding: "3 properties worth PKR 330M on declared income of PKR 3.5M/year",
        severity: "critical",
        dataSource: "property",
        detail:
          "Property records across Sindh and Punjab registries show 3 properties totaling ~PKR 330M. Entity's declared professional income of PKR 3.5M/year represents 0.1% of total property value.",
      },
      {
        id: "AUD-002-2",
        timestamp: "2024-02-01T08:00:00Z",
        category: "Non-Filing for Tax Year 2021",
        finding: "Failed to file return for TY2021 despite clear lifestyle indicators",
        severity: "high",
        dataSource: "fbr",
        detail:
          "FBR records show no return filed for Tax Year 2021. Utility and travel records confirm active residency and international travel during this period.",
      },
    ],
    analystNotes: [],
  },

  // ---- MEDIUM RISK ----
  {
    id: "ENT-003",
    cnic: "61101-4567890-3",
    fullName: "Ahmed Raza Qureshi",
    aliases: [{ name: "A.R. Qureshi", source: "excise" }],
    dateOfBirth: "1985-07-22",
    profession: "IT Consultant",
    addresses: [
      {
        street: "House 45, F-7/2",
        city: "Islamabad",
        province: "ICT",
        source: "fbr",
      },
    ],
    taxFilings: [
      {
        year: 2023,
        declaredIncome: 5500000,
        taxPaid: 550000,
        filingStatus: "filed",
        category: "Individual – Salaried",
      },
      {
        year: 2022,
        declaredIncome: 4800000,
        taxPaid: 432000,
        filingStatus: "filed",
        category: "Individual – Salaried",
      },
      {
        year: 2021,
        declaredIncome: 4200000,
        taxPaid: 336000,
        filingStatus: "filed",
        category: "Individual – Salaried",
      },
    ],
    vehicles: [
      {
        registrationNumber: "ISB-2020-5521",
        make: "Honda",
        model: "Civic",
        year: 2020,
        engineCC: 1500,
        registeredCity: "Islamabad",
      },
    ],
    utilityBills: [
      {
        type: "electricity",
        provider: "IESCO",
        averageMonthlyUnits: 800,
        averageMonthlyAmount: 24000,
        connectionAddress: "House 45, F-7/2, Islamabad",
      },
    ],
    properties: [
      {
        type: "residential",
        location: "F-7/2, Islamabad",
        estimatedValuePKR: 28000000,
        area: "7 Marla",
        registeredIn: "Ahmed Raza Qureshi",
      },
    ],
    travelRecords: [
      {
        destination: "Dubai, UAE",
        departureDate: "2023-06-10",
        returnDate: "2023-06-20",
        purpose: "business",
        airline: "Emirates",
      },
    ],
    complianceScore: {
      total: 42,
      level: "medium",
      breakdown: {
        incomeVsLifestyle: 40,
        assetVsIncome: 48,
        utilityVsIncome: 38,
        travelVsIncome: 42,
        filingConsistency: 20,
      },
    },
    caseStatus: "open",
    flaggedAt: "2024-03-01T10:00:00Z",
    auditTrail: [
      {
        id: "AUD-003-1",
        timestamp: "2024-03-01T10:00:00Z",
        category: "Minor Asset Discrepancy",
        finding:
          "Property acquisition value slightly above 5-year income accumulation",
        severity: "medium",
        dataSource: "property",
        detail:
          "Property in F-7/2 valued at PKR 28M. Sum of declared income over 3 available years: PKR 14.5M. Discrepancy may be explained by savings or loans. Requires verification.",
      },
    ],
    analystNotes: [],
  },

  // ---- LOW RISK: Clean record ----
  {
    id: "ENT-004",
    cnic: "35301-7654321-5",
    fullName: "Sara Bilal Chaudhry",
    aliases: [],
    dateOfBirth: "1990-02-18",
    profession: "School Teacher",
    addresses: [
      {
        street: "52-C, New Muslim Town",
        city: "Lahore",
        province: "Punjab",
        source: "nadra",
      },
    ],
    taxFilings: [
      {
        year: 2023,
        declaredIncome: 960000,
        taxPaid: 0,
        filingStatus: "filed",
        category: "Individual – Salaried",
      },
      {
        year: 2022,
        declaredIncome: 840000,
        taxPaid: 0,
        filingStatus: "filed",
        category: "Individual – Salaried",
      },
    ],
    vehicles: [],
    utilityBills: [
      {
        type: "electricity",
        provider: "LESCO",
        averageMonthlyUnits: 180,
        averageMonthlyAmount: 4500,
        connectionAddress: "52-C, New Muslim Town, Lahore",
      },
    ],
    properties: [],
    travelRecords: [],
    complianceScore: {
      total: 8,
      level: "low",
      breakdown: {
        incomeVsLifestyle: 5,
        assetVsIncome: 10,
        utilityVsIncome: 8,
        travelVsIncome: 0,
        filingConsistency: 12,
      },
    },
    caseStatus: "closed",
    auditTrail: [],
    analystNotes: [],
  },

  // ---- HIGH RISK: Business owner ----
  {
    id: "ENT-005",
    cnic: "42201-3456789-7",
    fullName: "Tariq Mehmood Butt",
    aliases: [
      { name: "T.M. Butt", source: "fbr" },
      { name: "Tariq Butt", source: "property" },
    ],
    dateOfBirth: "1972-09-30",
    profession: "Import/Export Business",
    addresses: [
      {
        street: "A-301, PECHS Block 6",
        city: "Karachi",
        province: "Sindh",
        source: "fbr",
      },
      {
        street: "A-301 PECHS-6",
        city: "Karachi",
        province: "Sindh",
        source: "utility",
      },
    ],
    taxFilings: [
      {
        year: 2023,
        declaredIncome: 2400000,
        taxPaid: 72000,
        filingStatus: "filed",
        category: "Individual – Business",
      },
      {
        year: 2022,
        declaredIncome: 1900000,
        taxPaid: 38000,
        filingStatus: "late",
        category: "Individual – Business",
      },
      {
        year: 2021,
        declaredIncome: 1600000,
        taxPaid: 0,
        filingStatus: "not_filed",
        category: "Individual – Business",
      },
    ],
    vehicles: [
      {
        registrationNumber: "KHI-2022-8821",
        make: "Land Cruiser",
        model: "V8 VXR",
        year: 2022,
        engineCC: 4500,
        registeredCity: "Karachi",
      },
      {
        registrationNumber: "KHI-2018-3312",
        make: "Toyota",
        model: "Fortuner",
        year: 2018,
        engineCC: 2800,
        registeredCity: "Karachi",
      },
    ],
    utilityBills: [
      {
        type: "electricity",
        provider: "KESC",
        averageMonthlyUnits: 4100,
        averageMonthlyAmount: 130000,
        connectionAddress: "A-301 PECHS-6, Karachi",
      },
    ],
    properties: [
      {
        type: "residential",
        location: "PECHS Block 6, Karachi",
        estimatedValuePKR: 75000000,
        area: "500 sq yd",
        registeredIn: "Tariq Butt",
      },
      {
        type: "commercial",
        location: "Korangi Industrial Area, Karachi",
        estimatedValuePKR: 60000000,
        area: "Industrial Unit",
        registeredIn: "T.M. Butt",
      },
    ],
    travelRecords: [
      {
        destination: "China (Guangzhou)",
        departureDate: "2023-02-20",
        returnDate: "2023-03-05",
        purpose: "business",
        airline: "PIA",
      },
      {
        destination: "Dubai, UAE",
        departureDate: "2023-09-01",
        returnDate: "2023-09-10",
        purpose: "business",
        airline: "Emirates",
      },
    ],
    complianceScore: {
      total: 74,
      level: "high",
      breakdown: {
        incomeVsLifestyle: 78,
        assetVsIncome: 82,
        utilityVsIncome: 76,
        travelVsIncome: 55,
        filingConsistency: 70,
      },
    },
    caseStatus: "under_review",
    flaggedAt: "2024-02-20T07:45:00Z",
    assignedAnalyst: "Analyst Kamil",
    auditTrail: [
      {
        id: "AUD-005-1",
        timestamp: "2024-02-20T07:45:00Z",
        category: "Non-Filing + Lifestyle Mismatch",
        finding: "Failed to file TY2021; owns 2 luxury SUVs and 2 properties",
        severity: "high",
        dataSource: "fbr",
        detail:
          "FBR records confirm no return was filed for TY2021 despite utility bills confirming residency. Combined property value PKR 135M exceeds 56× declared annual income.",
      },
    ],
    analystNotes: [
      {
        id: "NOTE-005-1",
        authorName: "Analyst Kamil",
        timestamp: "2024-02-21T09:00:00Z",
        content:
          "Business involves import of electronics via Afghan Transit Trade. Suggest customs authority cross-reference.",
      },
    ],
  },
];

// ---- Dashboard Summary -----------------------------------------

export const mockDashboardSummary: DashboardSummary = {
  totalEntitiesScanned: 14872,
  flaggedHigh: 342,
  flaggedCritical: 89,
  casesUnderReview: 127,
  newAlertsToday: 14,
  totalRevenueLeakageEstimatePKR: 48700000000, // ~48.7 Billion PKR
};

// ---- Alerts -----------------------------------------------------

export const mockAlerts: Alert[] = [
  {
    id: "ALT-001",
    entityId: "ENT-001",
    entityName: "Muhammad Kamran Akhtar",
    cnic: "35202-1234567-9",
    message:
      "New property registration detected in DHA Lahore — not consistent with declared income",
    severity: "critical",
    timestamp: "2024-03-10T08:15:00Z",
    isRead: false,
  },
  {
    id: "ALT-002",
    entityId: "ENT-002",
    entityName: "Farida Noor Siddiqui",
    cnic: "42101-9876543-1",
    message: "International departure detected (Geneva, Switzerland) — travel pattern anomaly",
    severity: "high",
    timestamp: "2024-03-09T14:30:00Z",
    isRead: false,
  },
  {
    id: "ALT-003",
    entityId: "ENT-005",
    entityName: "Tariq Mehmood Butt",
    cnic: "42201-3456789-7",
    message: "Vehicle registered (Land Cruiser V8) — value exceeds 9× annual declared income",
    severity: "high",
    timestamp: "2024-03-08T11:00:00Z",
    isRead: true,
  },
  {
    id: "ALT-004",
    entityId: "ENT-003",
    entityName: "Ahmed Raza Qureshi",
    cnic: "61101-4567890-3",
    message: "FBR filing submitted — income increase of 14.6% year-over-year (expected)",
    severity: "low",
    timestamp: "2024-03-07T09:00:00Z",
    isRead: true,
  },
];

// ---- Data Sources -----------------------------------------------

export const mockDataSources: DataSource[] = [
  {
    id: "DS-001",
    name: "FBR Tax Returns",
    type: "fbr",
    description:
      "Federal Board of Revenue income tax returns, declarations, and payment records",
    recordCount: 8200000,
    lastSynced: "2024-03-10T06:00:00Z",
    status: "active",
    fields: [
      "CNIC",
      "NTN",
      "Declared Income",
      "Tax Paid",
      "Category",
      "Filing Date",
    ],
  },
  {
    id: "DS-002",
    name: "NADRA Identity Database",
    type: "nadra",
    description:
      "National Database and Registration Authority — identity, address, and biometric records",
    recordCount: 140000000,
    lastSynced: "2024-03-09T12:00:00Z",
    status: "active",
    fields: ["CNIC", "Full Name", "DOB", "Address", "Family Tree"],
  },
  {
    id: "DS-003",
    name: "Excise & Taxation (Vehicle Reg.)",
    type: "excise",
    description:
      "Provincial excise department vehicle registration and ownership records",
    recordCount: 19500000,
    lastSynced: "2024-03-08T18:00:00Z",
    status: "active",
    fields: [
      "Registration No.",
      "Owner CNIC",
      "Make/Model",
      "Engine CC",
      "Year",
    ],
  },
  {
    id: "DS-004",
    name: "LESCO / KESC / IESCO Utility Data",
    type: "utility",
    description:
      "Electricity and gas distribution company consumption and billing records",
    recordCount: 28000000,
    lastSynced: "2024-03-07T20:00:00Z",
    status: "stale",
    fields: [
      "Consumer ID",
      "Address",
      "Monthly Units",
      "Bill Amount",
      "Owner Name",
    ],
  },
  {
    id: "DS-005",
    name: "Property Registry (Punjab & Sindh)",
    type: "property",
    description:
      "Provincial land and property registration authority ownership and valuation records",
    recordCount: 5600000,
    lastSynced: "2024-03-06T15:00:00Z",
    status: "active",
    fields: [
      "Registration No.",
      "Owner Name",
      "CNIC",
      "Property Type",
      "Value",
      "Area",
    ],
  },
  {
    id: "DS-006",
    name: "FIA Immigration Records",
    type: "immigration",
    description:
      "Federal Investigation Agency border crossing and international travel records",
    recordCount: 42000000,
    lastSynced: "2024-03-10T04:00:00Z",
    status: "active",
    fields: [
      "Passport No.",
      "CNIC",
      "Destination",
      "Departure Date",
      "Return Date",
      "Airline",
    ],
  },
];

// ---- Mock AI Chat Responses -------------------------------------

export const mockChatResponses: Record<string, string> = {
  default:
    "I've analyzed the available data. Based on the cross-referenced records from FBR, NADRA, Excise, and Utility databases, I can provide compliance intelligence. Please specify an entity ID, CNIC, or ask a specific analytical question.",
  score:
    "The Tax Compliance Deviation Score is calculated using a weighted algorithm that considers: (1) Income vs Lifestyle Index — compares declared income against utility bills and property valuations; (2) Asset vs Income Ratio — measures total declared asset value against cumulative income; (3) Travel Pattern Score — correlates international travel frequency with income level; (4) Filing Consistency — checks timeliness and completeness of tax return history.",
  kamran:
    "Muhammad Kamran Akhtar (CNIC: 35202-1234567-9) has a Critical compliance score of 87/100. Key findings: Properties worth PKR 205M on PKR 1.2M declared income; Toyota Prado TZ (2021) market value ~PKR 22M; LESCO bills of PKR 96,000/month exceed declared income; 4 international trips in 18 months. Case has been escalated to LTU.",
  high:
    "Currently there are 89 Critical-risk and 342 High-risk entities in the system. The top sectors by risk concentration are: (1) Undeclared real estate traders; (2) Wholesale/retail businesses with cash transactions; (3) Professionals with offshore income. Would you like me to generate a sector-specific breakdown?",
  help: "I can assist you with: • Fetching compliance scores for specific individuals • Explaining how risk factors are weighted • Identifying patterns across data sources • Summarizing audit findings for a case • Generating export-ready summaries for LTU referrals. Type a CNIC, an entity name, or ask a question about methodology.",
};
