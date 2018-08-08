'use strict';

/************************************** 
 * contstant values related to import CSV
 ***************************************/

// List of import component
const importCSVComponent = [
    'import-tag',
    'import-property',
    'import-deceased',
    'import-carcass'
];

// import-property
const propertyColumns = [
    'Company', 'Region', 'Business', 'PIC', 'Property Name',
    'Property Type', 'Address', 'Suburb', 'State', 'Postcode',
    'Property Manager', 'Brand Text', 'Earmark Text', 'NLIS Username', 'NLIS Password',
    'Export Eligibility', 'EU Accreditation', 'EU Accreditation License Number',
    'EU Accreditation Expiry Date', 'EU Accreditation State',
    'EU Accreditation Description', 'EU Accreditation Status'
];

// import-tag
const tagColumns = [
    'EID', 'NLIS ID', 'Visual Tag', 'Issue Date', 'Scan Date', 'Tag Year', 'PIC',
    'Received Date', 'Description', 'Status'
];

// import-deceased
const deceasedColumns = [
    'EID', 'NLISID', 'VisualTag', 'SocietyId', 'Deceased Date', 'Disposal Method', 'Death Reason'
];

// import-carcass
const carcassColumns = [
    'EID', 'NLISID', 'VisualTag', 'SocietyId', 'Mob Name', 'Livestock Count', 'From Body Number', 'To Body Number',
    'Processed Date', 'Processed Time', 'Lot Number', 'Chain Number', 'Operator Number', 'Processed PIC',
    'Carcass Weight', 'Fat Thickness', 'Rib Fatness', 'Rump Fat Thickness', 'Dentition', 'Live Carcass Weight',
    'Hot Standard Carcass Weight', 'Bruise Score', 'Carcass Category', 'Butt Shape', 'EQS Reference',
    'Producer License Number', 'MSA Start Code', 'Boning Group', 'MSA Grader', 'Grade Date', 'Left Side Scan Time',
    'Right Side Scan Time', 'Hang Method', 'HGP', 'Left Side HSCW', 'Right Side HSCW', 'Brand', 'Price KG',
    'Dest', 'Version Of MSA Model', 'Tropical Breed Content', 'Hump Cold', 'Eye Muscle Area', 'Ossification',
    'AUS Marbling', 'MSA Marbling', 'Meat Colour', 'Fat Muscle', 'Fat Colour', 'Fat Depth', 'pH', 'Loin Temperature',
    'Cost', 'Is Milk Fed Vealer', 'Is Rinse', 'Hump Height', 'Is MSA Saleyard', 'Is RIB', 'Feed Type',
    'Dressing Percentage', 'Retail Product Yield', 'Disease', 'Grade Code', 'Is Grass Seed', 'Is Arthritis'
];

// nvd delivery import-csv
const nvdDeliveryImportColumns = [
    'EID', 'NLISID', 'VisualTag', 'SocietyId'
];

module.exports = {
    importCSVComponent: importCSVComponent,
    propertyColumns: propertyColumns,
    tagColumns: tagColumns,
    deceasedColumns: deceasedColumns,
    carcassColumns: carcassColumns,
    nvdDeliveryImportColumns: nvdDeliveryImportColumns
}