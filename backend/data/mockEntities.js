const mockEntities = [
  {
    id: "ent-00142",
    cnic: "35202-7891234-5",
    fullName: "Kamran Ashraf Sheikh",
    aliases: [
      { name: "Kamran Sheikh", source: "fbr" },
      { name: "K.A. Sheikh", source: "property" },
      { name: "Kamran A. Sheikh", source: "immigration" }
    ],
    dateOfBirth: "1975-03-22T00:00:00Z",
    profession: "Real Estate Developer",
    addresses: [
      {
        street: "House 14-B, Street 7, DHA Phase 5",
        city: "Lahore",
        province: "Punjab",
        source: "nadra"
      },
      {
        street: "Flat 603, Centaurus Residences, Jinnah Avenue",
        city: "Islamabad",
        province: "ICT",
        source: "utility"
      },
      {
        street: "Plot 22, Block F, Gulberg III",
        city: "Lahore",
        province: "Punjab",
        source: "property"
      }
    ],
    taxFilings: [
      {
        year: 2019,
        declaredIncome: 3200000,
        taxPaid: 192000,
        filingStatus: "filed",
        category: "Individual - Business"
      },
      {
        year: 2020,
        declaredIncome: 2800000,
        taxPaid: 168000,
        filingStatus: "late",
        category: "Individual - Business"
      },
      {
        year: 2021,
        declaredIncome: 4100000,
        taxPaid: 328000,
        filingStatus: "filed",
        category: "Individual - Business"
      },
      {
        year: 2022,
        declaredIncome: 3750000,
        taxPaid: 262500,
        filingStatus: "filed",
        category: "Individual - Business"
      },
      {
        year: 2023,
        declaredIncome: 0,
        taxPaid: 0,
        filingStatus: "not_filed",
        category: "Individual - Business"
      }
    ],
    vehicles: [
      {
        registrationNumber: "LEA-19-7432",
        make: "Toyota",
        model: "Land Cruiser V8",
        year: 2021,
        engineCC: 4608,
        registeredCity: "Lahore"
      },
      {
        registrationNumber: "LEA-17-3891",
        make: "Honda",
        model: "Civic",
        year: 2019,
        engineCC: 1498,
        registeredCity: "Lahore"
      },
      {
        registrationNumber: "ISB-22-5610",
        make: "Mercedes-Benz",
        model: "E200",
        year: 2022,
        engineCC: 1991,
        registeredCity: "Islamabad"
      }
    ],
    utilityBills: [
      {
        type: "electricity",
        provider: "LESCO",
        averageMonthlyUnits: 2400,
        averageMonthlyAmount: 72000,
        connectionAddress: "House 14-B, Street 7, DHA Phase 5, Lahore"
      },
      {
        type: "gas",
        provider: "SNGPL",
        averageMonthlyUnits: 180,
        averageMonthlyAmount: 14400,
        connectionAddress: "House 14-B, Street 7, DHA Phase 5, Lahore"
      },
      {
        type: "electricity",
        provider: "IESCO",
        averageMonthlyUnits: 1800,
        averageMonthlyAmount: 54000,
        connectionAddress: "Flat 603, Centaurus Residences, Jinnah Avenue, Islamabad"
      },
      {
        type: "gas",
        provider: "SNGPL",
        averageMonthlyUnits: 120,
        averageMonthlyAmount: 9600,
        connectionAddress: "Flat 603, Centaurus Residences, Jinnah Avenue, Islamabad"
      }
    ],
    properties: [
      {
        type: "residential",
        location: "House 14-B, Street 7, DHA Phase 5, Lahore",
        estimatedValuePKR: 85000000,
        area: "1 Kanal",
        registeredIn: "Kamran Ashraf Sheikh"
      },
      {
        type: "commercial",
        location: "Plot 22, Block F, Gulberg III, Lahore",
        estimatedValuePKR: 120000000,
        area: "10 Marla",
        registeredIn: "K.A. Sheikh"
      },
      {
        type: "residential",
        location: "Flat 603, Centaurus Residences, Jinnah Avenue, Islamabad",
        estimatedValuePKR: 45000000,
        area: "2200 sq ft",
        registeredIn: "Kamran Ashraf Sheikh"
      },
      {
        type: "agricultural",
        location: "Village Kot Radha Kishan, Kasur District, Punjab",
        estimatedValuePKR: 18000000,
        area: "25 Acres",
        registeredIn: "K.A. Sheikh"
      }
    ],
    travelRecords: [
      {
        destination: "Dubai, UAE",
        departureDate: "2023-11-10T08:00:00Z",
        returnDate: "2023-11-17T22:30:00Z",
        purpose: "business",
        airline: "Emirates"
      },
      {
        destination: "London, UK",
        departureDate: "2023-06-02T14:00:00Z",
        returnDate: "2023-06-12T19:45:00Z",
        purpose: "personal",
        airline: "British Airways"
      },
      {
        destination: "Istanbul, Turkey",
        departureDate: "2022-12-20T06:30:00Z",
        returnDate: "2023-01-01T23:15:00Z",
        purpose: "personal",
        airline: "Turkish Airlines"
      },
      {
        destination: "Riyadh, Saudi Arabia",
        departureDate: "2022-08-14T09:00:00Z",
        returnDate: "2022-08-19T16:00:00Z",
        purpose: "business",
        airline: "Saudia"
      },
      {
        destination: "Dubai, UAE",
        departureDate: "2022-03-05T07:45:00Z",
        returnDate: "2022-03-10T20:00:00Z",
        purpose: "business",
        airline: "Pakistan International Airlines"
      },
      {
        destination: "Bangkok, Thailand",
        departureDate: "2021-10-08T11:00:00Z",
        returnDate: "2021-10-16T14:30:00Z",
        purpose: "unknown",
        airline: "Thai Airways"
      }
    ],
    complianceScore: {
      total: 72,
      level: "high",
      breakdown: {
        incomeVsLifestyle: 78,
        assetVsIncome: 85,
        utilityVsIncome: 65,
        travelVsIncome: 70,
        filingConsistency: 60
      }
    },
    caseStatus: "under_review",
    auditTrail: [
      {
        id: "audit-001",
        timestamp: "2024-02-01T09:15:00Z",
        category: "Asset Discrepancy",
        finding: "Declared properties worth PKR 268M vs declared cumulative income of PKR 13.85M (2019–2022)",
        severity: "critical",
        dataSource: "property",
        detail:
          "Cross-referencing FBR tax filings with property registration records reveals a discrepancy of approximately PKR 254M in unexplained asset accumulation."
      },
      {
        id: "audit-002",
        timestamp: "2024-02-03T11:40:00Z",
        category: "Utility vs Income",
        finding: "Monthly utility expenditure (~PKR 150,000) inconsistent with declared annual income of PKR 3.75M",
        severity: "high",
        dataSource: "utility",
        detail:
          "LESCO and IESCO records show combined monthly electricity bills averaging PKR 126,000 across two properties, implying an affluent lifestyle inconsistent with declared income."
      },
      {
        id: "audit-003",
        timestamp: "2024-02-05T14:20:00Z",
        category: "High-Value Vehicle",
        finding: "Ownership of Toyota Land Cruiser V8 (2021) estimated market value PKR 22M, not reflected in wealth statement",
        severity: "high",
        dataSource: "excise",
        detail:
          "Excise & Taxation records confirm registration of a 4608cc Land Cruiser in 2021. No matching asset entry found in FBR wealth statement for fiscal year 2021–22."
      },
      {
        id: "audit-004",
        timestamp: "2024-02-10T10:05:00Z",
        category: "Non-Filing",
        finding: "Tax return for fiscal year 2023 not submitted by due date (Sep 30, 2023)",
        severity: "medium",
        dataSource: "fbr",
        detail:
          "FBR Active Taxpayer List shows taxpayer marked as non-filer for tax year 2023. Previous year filings show inconsistent declared incomes with no apparent business downturn."
      },
      {
        id: "audit-005",
        timestamp: "2024-02-14T16:30:00Z",
        category: "International Travel",
        finding: "6 international trips in 3 years with business-classified Dubai trips but no corresponding foreign income declared",
        severity: "medium",
        dataSource: "immigration",
        detail:
          "NADRA immigration records show frequent travel to UAE, UK, Turkey and Saudi Arabia. Business-purpose trips should reflect corresponding foreign income in FBR filing per Section 111 of Income Tax Ordinance 2001."
      },
      {
        id: "audit-006",
        timestamp: "2024-02-20T09:00:00Z",
        category: "Alias Mismatch",
        finding: "Properties registered under 'K.A. Sheikh' — alias not linked in NADRA records",
        severity: "medium",
        dataSource: "nadra",
        detail:
          "Two out of four properties are registered under the name 'K.A. Sheikh'. NADRA records only reflect 'Kamran Ashraf Sheikh' as the legal name. Alias linkage requires manual verification."
      }
    ],
    analystNotes: [
      {
        id: "note-001",
        authorName: "Sana Mirza",
        timestamp: "2024-02-15T11:00:00Z",
        content:
          "Initial review completed. Subject appears to be a real estate developer with significant undisclosed assets. Recommend obtaining bank statements via FBR's Section 176 notice and cross-checking with SECP company registrations."
      },
      {
        id: "note-002",
        authorName: "Adnan Khalid",
        timestamp: "2024-02-22T14:45:00Z",
        content:
          "Contacted DHA Lahore records department for transfer deed history on Plot 22, Gulberg III. Awaiting response. Also flagged two Dubai trips for STR (Suspicious Transaction Report) check with FMU."
      },
      {
        id: "note-003",
        authorName: "Sana Mirza",
        timestamp: "2024-03-05T10:20:00Z",
        content:
          "FBR Section 176 notice issued on 2024-03-01. Taxpayer has 21 days to respond. Case escalated to Commissioner IR for potential audit proceedings under Section 177. All evidence compiled in case file CF-2024-00142."
      },
      {
        id: "note-004",
        authorName: "Tariq Hussain",
        timestamp: "2024-03-12T16:00:00Z",
        content:
          "Verified through SECP that subject has directorship in two private limited companies: 'Sheikh Developers Pvt. Ltd.' and 'AK Real Assets Pvt. Ltd.' Neither company filed annual returns for 2022-23. Expanding case scope to include corporate non-compliance."
      }
    ],
    flaggedAt: "2024-02-01T09:00:00Z",
    assignedAnalyst: "Sana Mirza"
  }
];

module.exports = mockEntities;

