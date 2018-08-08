'use strict';

/************************************** 
 * contstant values
 ***************************************/

const browserList = {
    opera: 'Opera',
    chrome: 'Chrome',
    safari: 'Safari',
    firefox: 'Firefox',
    ie: 'IE',
    edge: 'Edge',
    unknown: 'Unknown'
}

const reportList = {
    feedHistory: 'feedhistory',
    tracebilityHistory: 'tracebilityhistory',
    printWaybill: 'printwaybill',
    printeNVDCattle: 'printenvdcattle',
    printeNVDSheep: 'printenvdsheep',
    printeNVDBobbyCalves: 'printenvdbobbycalves',
    printeNVDGoat: 'printenvdgoat',
    printeNVDEUCattle: 'printenvdeucattle'
}

const manufacturerCodes = [
    { Text: 'X', Value: 'Allflex' },
    { Text: 'E', Value: 'Aleis' },
    { Text: 'L', Value: 'Leader' },
    { Text: 'D', Value: 'Drovers' },
    { Text: 'G', Value: 'Dalton / Gallagher' },
    { Text: 'M', Value: 'Rumitag' },
    { Text: 'K', Value: 'Austock' },
    { Text: 'Q', Value: 'AnimalLife ID' },
    { Text: 'B', Value: 'Duo Tags' },
    { Text: 'R', Value: 'Enduro Tags' },
    { Text: 'S', Value: 'Stockbrands' },
    { Text: 'A', Value: 'Shearwell' },
    { Text: 'Y', Value: 'OSID' },
    { Text: 'Z', Value: 'Zee Tags' },
    { Text: 'C', Value: 'Roxan' },
    { Text: 'F', Value: 'Fofia' }
];

const yearCode = [
    { Text: 'V', Value: '2000' },
    { Text: 'W', Value: '2001' },
    { Text: 'X', Value: '2002' },
    { Text: 'Y', Value: '2003' },
    { Text: 'Z', Value: '2004' },
    { Text: 'A', Value: '2005' },
    { Text: 'B', Value: '2006' },
    { Text: 'C', Value: '2007' },
    { Text: 'D', Value: '2008' },
    { Text: 'E', Value: '2009' },
    { Text: 'F', Value: '2010' },
    { Text: 'G', Value: '2011' },
    { Text: 'H', Value: '2012' },
    { Text: 'I', Value: '2013' },
    { Text: 'J', Value: '2014' },
    { Text: 'K', Value: '2015' },
    { Text: 'L', Value: '2016' },
    { Text: 'M', Value: '2017' },
    { Text: 'N', Value: '2018' },
    { Text: 'O', Value: '2019' },
    { Text: 'P', Value: '2020' }
]

const deviceTypes = [
    { Text: 'B', Value: 'Breeder ear tag', Species: 'Cattle', SystemCode: 'CTL' },
    { Text: 'C', Value: 'Breeder rumen bolus', Species: 'Cattle', SystemCode: 'CTL' },
    { Text: 'E', Value: 'Post-breeder ear tag', Species: 'Cattle', SystemCode: 'CTL' },
    { Text: 'F', Value: 'Post-breeder rumen bolus', Species: 'Cattle', SystemCode: 'CTL' },
    { Text: 'S', Value: 'Breeder ear tag', Species: 'Sheep', SystemCode: 'SHP' },
    { Text: 'T', Value: 'Post-breeder ear tag', Species: 'Sheep', SystemCode: 'SHP' },
    { Text: 'K', Value: 'Breeder ear tag', Species: 'Goats', SystemCode: 'GOT' }
];

const rfidManufacturerCodes = [
    { Text: '900', Value: 'Gallagher, Drover’s Ay-One, Enduro Tags, Stockbrands, Roxan' },
    { Text: '937', Value: 'OSID' },
    { Text: '940', Value: 'Shearwell' },
    { Text: '942', Value: 'Zee Tags' },
    { Text: '951', Value: 'Leader, AnimalLife ID, Duo Tags' },
    { Text: '964', Value: 'Datamars' },
    { Text: '971', Value: 'Aleis, Zee Tags' },
    { Text: '982', Value: 'AllFlex' },
    { Text: '991', Value: 'Fofia' }
];

// List of livestock identifier
let livestockIdentifierDS = [
    { Text: 'EID', Value: 'EID' },
    { Text: 'NLIS ID', Value: 'NLISID' },
    { Text: 'VisualTag', Value: 'VisualTag' },
    { Text: 'Society ID', Value: 'SocietyId' }
];

// List of Accreditation Status
const accreditationStatus = [
    { Text: 'Nothing', Value: 1 },
    { Text: 'Active', Value: 2 },
    { Text: 'Inactive', Value: 3 }
];

// List of Export Eligibility
const exportEligibility = [
    { Text: 'Africa', Value: 'Africa' },
    { Text: 'China', Value: 'China' },
    { Text: 'Europe', Value: 'Europe' },
    { Text: 'Russia', Value: 'Russia' },
    { Text: 'Saudi Arabia', Value: 'SaudiArabia' }
];

// List of assets markers for map
const assetsMarkers = [
    { Title: 'Car', Name: 'car.png' },
    { Title: 'Chemical Storage Sheds', Name: 'chemical_storage_sheds.png' },
    { Title: 'Dams', Name: 'dams.png' },
    { Title: 'Fence', Name: 'fence.png' },
    { Title: 'Gates', Name: 'gates.png' },
    { Title: 'House', Name: 'house.png' },
    { Title: 'Machinery Shed', Name: 'machinery_shed.png' },
    { Title: 'Machinery', Name: 'machinery.png' },
    { Title: 'Power Poles', Name: 'power_poles.png' },
    { Title: 'Rubbish Dump', Name: 'rubbish_dump.png' },
    { Title: 'Sheds', Name: 'sheds.png' },
    { Title: 'Stock yard', Name: 'stock_yard.png' },
    { Title: 'Timber yard', Name: 'timber_yard.png' },
    { Title: 'Truck', Name: 'truck.png' },
    { Title: 'Wash down area', Name: 'wash_down_area.png' }
];

// List of livestock LT/EU Status
const livestockLTEUStatus = [
    { Text: 'Nothing', Value: "1" },
    { Text: 'Yes', Value: "2" },
    { Text: 'No', Value: "3" }
];

// List of Gender System Code
const genderSystemCodes = [
    { Text: 'Male', Value: 'ML' },
    { Text: 'Female', Value: 'FML' }
]

const livestockActivityStatusCodes = {
    Available: 'AVL',
    PrepareForMove: 'PFM',
    InTransit: 'INT',
    Killed: 'KLD',
    Deceased: 'DCD',
    Lost: 'LST'
}

const tagStatusCodes = {
    Pending: 'PND',
    Active: 'ACT',
    Lost: 'LST',
    Damaged: 'DMG',
    Inactive: 'IAC',
    Deceased: 'DCD'
}

// List of Livetock identifier
const livestockIdentifierCodes = {
    EID: 'EID',
    NLISID: 'NLISID'
}

// List of Gender System Code
const lastMonthOfShearing = [
    { Text: '0', Value: '0' },
    { Text: '1', Value: '1' },
    { Text: '2', Value: '2' },
    { Text: '3', Value: '3' },
    { Text: '4', Value: '4' },
    { Text: '5', Value: '5' },
    { Text: '6', Value: '6' },
    { Text: '7', Value: '7' },
    { Text: '8', Value: '8' },
    { Text: '9', Value: '9' },
    { Text: '10', Value: '10' },
    { Text: '11', Value: '11' },
    { Text: '12', Value: '12' }
]

const lactationCode = [
    { Text: 'Wet', Value: '1' },
    { Text: 'Dry', Value: '2' }];

const uomTypeCodes = {
    Treatment: 'TRT',
    Area: 'ARA',
    LivestockWeight: 'WGT'
}

const chemicalProductService = [
    { Value: '1', Text: 'Chemical/Vaccine' },
    { Value: '2', Text: 'Non - Chemical' }
]

const eventTypes = {
    Activated: 'Tag Activated',
    eNVDDelivery: 'Property Movement',
    Inducted: 'Livestock Inducted',
    MergeMob: 'Mob Merged',
    ModifyCount: 'Livestock Count Modified',
    ModifyEnclosure: 'Assigned to Enclosure',
    ModifyStatus: 'Status Modified',
    ModifyTag: 'Tag Modified',
    ModifyWeight: 'Weight Modified',
    ModifyLivestock: 'Livestock Modified',
    MoveToEnclosure: 'Enclosure Movement',
    RecordCarcass: 'Recorded as Carcass',
    RecordDeceased: 'Recorded as Deceased',
    RecordFeed: 'Feed Recorded',
    RecordLostTags: 'Tag Lost',
    RecordScan: 'Scan Recorded',
    RecordTagReplacement: 'Tag Replaced',
    RecordWeight: 'Weight Recorded',
    SplitMob: 'Mob Split'
}

const nvdSteps = [
    'prepare_livestock', 'consigned_to_property', 'consignor_declaration',
    'questionnaire', 'transporter', 'sale_agent'
]

const LocalStorageKeys = {
    LivestockData: 'livestock_data',
    eNVDData: 'nvd_data'
}

const speciesCodes = {
    Cattle: 'CTL',
    Sheep: 'SHP',
    Goat: 'GOT'
}

const nvdStatusCodes = {
    Draft: 'DFT',
    Pending: 'PND',
    InTransit: 'INT',
    Received: 'REC',
    Delivered: 'DEL',
    Archived: 'ACH'
}

const nvdAccreditationQuestionnaire = {
    ntLastAccess: '1010',
    ntBiosecurityOfficer: '1020',
    ntMovementToArea: '1030',
    ntMovementFor: '1040',
    ntSignature: '1050',
    ntSignatureDate: '1060',
    ntPhoneNumber: '1070',

    healthBRD: '1080',
    healthBottleId: '1090',
    healthBatchNo: '1100',
    healthExpiryDate: '1110',

    msaMilkFedVealers: '1120',
    msaSoldThroughMSAAccredited: '1130',
    msaHighestTropicalBreed: '1140',
    msaComment: '1150',

    nfasFedAtNFASFeelot: '1160',
    nfasName: '1170',
    nfasCertiNo: '1180',
    nfasSignature: '1190',
    nfasDate: '1200',
    nfasSlaughterDate: '1210',

    obeOrganic: '1220',

    ausMeatRecordDays: '1230',
    ausMeatSignature: '1240',
    ausMeatDate: '1250',
    ausMeatName: '1260',
    ausMeatSlaughterDate: '1270'
}

const nvdTypes = {
    Cattle: 1,
    EUCattle: 5,
    'Bobby Calves': 3,
    Sheep: 2,
    Goat: 4
}

const MLASchemaVersions = {
    Cattle: 'C0413.0',
    EUCattle: 'E0413.0',
    'Bobby Calves': 'BC0412.0',
    Sheep: 'S0413.0',
    Goat: 'G0413.0'
}

const MLAAPIVersion = 'V2';

// nvd type data for dropdown binding
const nvdTypesData = [
    { Value: 1, Text: 'Cattle' },
    { Value: 2, Text: 'Sheep' },
    { Value: 3, Text: 'Bobby Calves' },
    { Value: 4, Text: 'Goat' },
    { Value: 5, Text: 'EUCattle' },
    { Value: 6, Text: 'Pig' }
]

const maturityCodes = {
    BobbyCalve: 'BCV'
}

const accreditationProgramCodes = {
    LPA: 'LPA',
    EUCattle: 'EUCAS',
    NFAS: 'NFAS',
    MSA: 'MSA',
    OBE: 'OBE',
    AUSMEAT: 'AMAS'
}

const serviceTypes = {
    Transporter: 'TR',
    Police: 'PLC',
    Saleyard: 'SLY',
    Buyers: 'BYR',
    SaleAgent: 'SA'
}

const mapAreaUnitSystemCodes = {
    Hectare: 'HCT',
    Acre: 'ACR'
}

const nvdImportTypes = {
    Variance: 0,
    DeliveredLivestock: 1
}

const varianceTypes = {
    Less: 0,
    More: 1
}

module.exports = {
    reportList: reportList,
    manufacturerCodes: manufacturerCodes,
    rfidManufacturerCodes: rfidManufacturerCodes,
    deviceTypes: deviceTypes,
    livestockIdentifierDS: livestockIdentifierDS,
    accreditationStatus: accreditationStatus,
    exportEligibility: exportEligibility,
    assetsMarkers: assetsMarkers,
    yearCode: yearCode,
    livestockLTEUStatus: livestockLTEUStatus,
    genderSystemCodes: genderSystemCodes,
    lastMonthOfShearing: lastMonthOfShearing,
    livestockIdentifierCodes: livestockIdentifierCodes,
    livestockActivityStatusCodes: livestockActivityStatusCodes,
    tagStatusCodes: tagStatusCodes,
    lactationCode: lactationCode,
    uomTypeCodes: uomTypeCodes,
    chemicalProductService: chemicalProductService,
    eventTypes: eventTypes,
    nvdSteps: nvdSteps,
    LocalStorageKeys: LocalStorageKeys,
    speciesCodes: speciesCodes,
    nvdAccredQue: nvdAccreditationQuestionnaire,
    nvdTypes: nvdTypes,
    MLASchemaVersions: MLASchemaVersions,
    MLAAPIVersion: MLAAPIVersion,
    nvdTypesData: nvdTypesData,
    maturityCodes: maturityCodes,
    nvdStatusCodes: nvdStatusCodes,
    accreditationProgramCodes: accreditationProgramCodes,
    serviceTypes: serviceTypes,
    mapAreaUnitSystemCodes: mapAreaUnitSystemCodes,
    nvdImportTypes: nvdImportTypes,
    varianceTypes: varianceTypes,
    browserList: browserList
}