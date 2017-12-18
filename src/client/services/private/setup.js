'use strict';

/*************************************
 * setup services
 * *************************************/

import { get, post } from '../../lib/http/http-service';


// get list of setup menu
function getSetupMenu(controlMenuId) {
    return get('/getsetupmenu', { controlMenuId: controlMenuId }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// save/update specy master data
function saveSpecies(specyObj) {
    return post('/species/save', specyObj).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get data of species for modify
function getSpeciesModifyDetails(id) {
    return get('/species/detail', { id: id }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// delete species data
function deleteSpecies(uuids, auditLogIds) {
    return post('/species/delete', { uuids: uuids, auditLogIds: auditLogIds }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get species for breed master
function getAllSpecies() {
    return get('/species/getall').then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get breed type for breed master
function getAllBreedType() {
    return get('/breedtype/getall').then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// save breed master data
function saveBreed(obj) {
    return post('/breed/save', {
        speciesId: obj.species, breedTypeId: obj.breedType, breedName: obj.breedName,
        breedCode: obj.breedCode, uuid: obj.breedId, auditLogId: obj.auditId
    }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get breed by UUID
function getBreedDetail(uuid) {
    return get('/breed/detail', { uuid: uuid }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// delete breed
function deleteBreed(uuids, auditLogIds) {
    return post('/breed/delete', { uuids: uuids, auditLogIds: auditLogIds }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// save maturity master data
function saveMaturity(obj) {
    return post('/maturity/save', {
        speciesId: obj.species, maturityName: obj.maturityName, maturityCode: obj.maturityCode,
        uuid: obj.maturityId, auditLogId: obj.auditId
    }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get maturity by UUID
function getMaturityDetail(uuid) {
    return get('/maturity/detail', { uuid: uuid }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// delete maturity
function deleteMaturity(uuids, auditLogIds) {
    return post('/maturity/delete', { uuids: uuids, auditLogIds: auditLogIds }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// save species type master data
function saveSpeciesType(obj) {
    return post('/speciestype/save', {
        speciesId: obj.species, speciesTypeName: obj.speciesTypeName,
        speciesTypeCode: obj.speciesTypeCode, uuid: obj.speciesTypeId, auditLogId: obj.auditId
    }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get species type by UUID
function getSpeciesTypeDetail(uuid) {
    return get('/speciestype/detail', { uuid: uuid }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// delete species type
function deleteSpeciesType(uuids, auditLogIds) {
    return post('/speciestype/delete', { uuids: uuids, auditLogIds: auditLogIds }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// save/update gender master data
function saveGender(genderObj) {
    return post('/gender/save', genderObj).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get data of gender for modify
function getGenderModifyDetails(id) {
    return get('/gender/detail', { id: id }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// delete gender data
function deleteGender(uuids, auditLogIds) {
    return post('/gender/delete', { uuids: uuids, auditLogIds: auditLogIds }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// save/update property type master data
function savePropertyType(propertyObj) {
    return post('/propertytype/save', propertyObj).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get data of property type for modify
function getPropertyTypeModifyDetails(id) {
    return get('/propertytype/detail', { id: id }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// delete property type data
function deletePropertyType(uuids, auditLogIds) {
    return post('/propertytype/delete', { uuids: uuids, auditLogIds: auditLogIds }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get all property types
function getAllPropertyTypes() {
    return get('/propertytype/getall').then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// save/update Unit of Measure master data
function saveUom(uomObj) {
    return post('/uom/save', uomObj).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get data of Unit of Measure for modify
function getUomModifyDetails(id) {
    return get('/uom/detail', { id: id }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// delete Unit of Measure data
function deleteUom(uuids, auditLogIds) {
    return post('/uom/delete', { uuids: uuids, auditLogIds: auditLogIds }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get UoM for UoM conversion
function getAllUoM(types) {
    return get('/uom/getall', { types: types }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// save/update Unit of Measure Conversion master data
function saveUomConversion(uomConversionObj) {
    return post('/uomconversion/save', uomConversionObj).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get data of Unit of Measure Conversion for modify
function getUomConversionModifyDetails(id) {
    return get('/uomconversion/detail', { id: id }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// delete Unit of Measure Conversion data
function deleteUomConversion(uuids, auditLogIds) {
    return post('/uomconversion/delete', { uuids: uuids, auditLogIds: auditLogIds }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// save service type master data
function saveServiceType(obj) {
    return post('/servicetype/save', {
        serviceTypeName: obj.serviceTypeName, serviceTypeCode: obj.serviceTypeCode,
        uuid: obj.serviceTypeId, auditLogId: obj.auditId, ColorCode: obj.ColorCode
    }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}


function getServiceTypeDetail(uuid) {
    return get('/servicetype/detail', { uuid: uuid }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get all service types
function getAllServiceTypes() {
    return get('/servicetype/getall').then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// delete service type data
function deleteServiceType(uuids, auditLogIds) {
    return post('/servicetype/delete', { uuids: uuids, auditLogIds: auditLogIds }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// save breed type master data
function saveBreedType(obj) {
    return post('/breedtype/save', {
        breedTypeName: obj.breedTypeName, breedTypeCode: obj.breedTypeCode,
        uuid: obj.breedTypeId, auditLogId: obj.auditId
    }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get data of breed type for modify
function getBreedTypeDetail(uuid) {
    return get('/breedtype/detail', { uuid: uuid }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// delete breed type data
function deleteBreedType(uuids, auditLogIds) {
    return post('/breedtype/delete', { uuids: uuids, auditLogIds: auditLogIds }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// save enclosure type master data
function saveEnclosureType(obj, configuredByAdmin) {
    return post('/enclosuretype/save', {
        enclosureTypeName: obj.enclosureTypeName, enclosureTypeCode: obj.enclosureTypeCode,
        uuid: obj.enclosureTypeId, auditLogId: obj.auditId, configuredByAdmin: configuredByAdmin
    }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get data of enclosure type for modify
function getEnclosureTypeDetail(uuid) {
    return get('/enclosuretype/detail', { uuid: uuid }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get all data of enclosure type
function getAllEnclosureType() {
    return get('/enclosuretype/getall').then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// delete enclosure type data
function deleteEnclosureType(uuids, auditLogIds) {
    return post('/enclosuretype/delete', { uuids: uuids, auditLogIds: auditLogIds }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// save dose by measure records
function saveDoseByMeasure(uuids, configuredByAdmin) {
    return post('/dosebymeasure/save', { uuids: uuids, configuredByAdmin: configuredByAdmin }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get all dose by measure records
function getDoseByMeasure(configuredByAdmin) {
    return get('/dosebymeasure/getall', { configuredByAdmin: configuredByAdmin }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// save chemical category master data
function saveChemicalCategory(obj) {
    return post('/chemicalcategory/save', {
        chemicalCategoryName: obj.chemicalCategoryName, chemicalCategoryCode: obj.chemicalCategoryCode,
        uuid: obj.chemicalCategoryId, auditLogId: obj.auditId
    }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get data of chemical category for modify
function getChemicalCategoryDetail(uuid) {
    return get('/chemicalcategory/detail', { uuid: uuid }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get all chemical category records
function getAllChemicalCategory() {
    return get('/chemicalcategory/getall').then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// delete chemical category data
function deleteChemicalCategory(uuids, auditLogIds) {
    return post('/chemicalcategory/delete', { uuids: uuids, auditLogIds: auditLogIds }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// save/update treatment type master data
function saveTreatmentType(treatmenttypeObj) {
    return post('/treatmenttype/save', treatmenttypeObj).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get data of treatment type for modify
function getTreatmentTypeModifyDetails(id) {
    return get('/treatmenttype/detail', { id: id }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// delete treatment type data
function deleteTreatmentType(uuids, auditLogIds) {
    return post('/treatmenttype/delete', { uuids: uuids, auditLogIds: auditLogIds }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// save/update treatment method master data
function saveTreatmentMethod(treatmentmethodObj) {
    return post('/treatmentmethod/save', treatmentmethodObj).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get data of treatment method for modify
function getTreatmentMethodModifyDetails(id) {
    return get('/treatmentmethod/detail', { id: id }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// delete treatment method data
function deleteTreatmentMethod(uuids, auditLogIds) {
    return post('/treatmentmethod/delete', { uuids: uuids, auditLogIds: auditLogIds }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// save/update livestock colour master data
function saveLivestockColour(livestockcolourObj) {
    return post('/livestockcolour/save', livestockcolourObj).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get data of livestock colour for modify
function getLivestockColourModifyDetails(id) {
    return get('/livestockcolour/detail', { id: id }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// delete livestock colour data
function deleteLivestockColour(uuids, auditLogIds) {
    return post('/livestockcolour/delete', { uuids: uuids, auditLogIds: auditLogIds }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// save/update group master data
function saveGroup(groupObj) {
    return post('/livestockgroup/save', groupObj).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get data of group for modify
function getGroupModifyDetails(id) {
    return get('/livestockgroup/detail', { id: id }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// delete group data
function deleteGroup(uuids, auditLogIds) {
    return post('/livestockgroup/delete', { uuids: uuids, auditLogIds: auditLogIds }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// save/update death reason master data
function saveDeathReason(deathReasonObj) {
    return post('/deathreason/save', deathReasonObj).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get data of death reason for modify
function getDeathReasonModifyDetails(id) {
    return get('/deathreason/detail', { id: id }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// delete death reason data
function deleteDeathReason(uuids, auditLogIds) {
    return post('/deathreason/delete', { uuids: uuids, auditLogIds: auditLogIds }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get uom types for uom master
function getAllUoMTypes() {
    return get('/uomtypes/getall').then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// save/update accreditation program master data
function saveAccreditationProgram(accreditationprogramObj) {
    return post('/accreditationprogram/save', accreditationprogramObj).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get data of accreditation program for modify
function getAccreditationProgramModifyDetails(id) {
    return get('/accreditationprogram/detail', { id: id }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// delete accreditation program data
function deleteAccreditationProgram(uuids, auditLogIds) {
    return post('/accreditationprogram/delete', { uuids: uuids, auditLogIds: auditLogIds }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get Chemical Product Activities 
function getAllChemicalProductActivity() {
    return get('/chemicalproductactivity/getall').then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get all active countries
function getAllCountry() {
    return get('/country/getall').then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// save/update chemical product master data
function saveChemicalProduct(chemicalProductObj) {
    return post('/chemicalproduct/save', chemicalProductObj).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get data of chemical product program for modify
function getChemicalProductModifyDetails(id) {
    return get('/chemicalproduct/detail', { id: id }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// delete chemical product data
function deleteChemicalProduct(uuids, auditLogIds) {
    return post('/chemicalproduct/delete', { uuids: uuids, auditLogIds: auditLogIds }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get detail from selected suburb
function getSuburbDetails(id) {
    return get('/suburb/detail', { id: id }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get all states for drop down
function getAllState() {
    return get('/state/getall').then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

module.exports = {
    saveSpecies: saveSpecies,
    getSpeciesModifyDetails: getSpeciesModifyDetails,
    deleteSpecies: deleteSpecies,
    getAllSpecies: getAllSpecies,
    getAllBreedType: getAllBreedType,
    saveBreed: saveBreed,
    getBreedDetail: getBreedDetail,
    deleteBreed: deleteBreed,
    getSetupMenu: getSetupMenu,
    saveMaturity: saveMaturity,
    getMaturityDetail: getMaturityDetail,
    deleteMaturity: deleteMaturity,
    saveSpeciesType: saveSpeciesType,
    getSpeciesTypeDetail: getSpeciesTypeDetail,
    deleteSpeciesType: deleteSpeciesType,
    saveGender: saveGender,
    getGenderModifyDetails: getGenderModifyDetails,
    deleteGender: deleteGender,
    savePropertyType: savePropertyType,
    getPropertyTypeModifyDetails: getPropertyTypeModifyDetails,
    deletePropertyType: deletePropertyType,
    getAllPropertyTypes: getAllPropertyTypes,
    saveUom: saveUom,
    getUomModifyDetails: getUomModifyDetails,
    deleteUom: deleteUom,
    getAllUoM: getAllUoM,
    saveUomConversion: saveUomConversion,
    getUomConversionModifyDetails: getUomConversionModifyDetails,
    deleteUomConversion: deleteUomConversion,
    saveServiceType: saveServiceType,
    getServiceTypeDetail: getServiceTypeDetail,
    deleteServiceType: deleteServiceType,
    saveBreedType: saveBreedType,
    getBreedTypeDetail: getBreedTypeDetail,
    deleteBreedType: deleteBreedType,
    saveEnclosureType: saveEnclosureType,
    getEnclosureTypeDetail: getEnclosureTypeDetail,
    getAllEnclosureType: getAllEnclosureType,
    deleteEnclosureType: deleteEnclosureType,
    saveDoseByMeasure: saveDoseByMeasure,
    getDoseByMeasure: getDoseByMeasure,
    saveChemicalCategory: saveChemicalCategory,
    getChemicalCategoryDetail: getChemicalCategoryDetail,
    deleteChemicalCategory: deleteChemicalCategory,
    getAllChemicalCategory: getAllChemicalCategory,
    saveTreatmentType: saveTreatmentType,
    getTreatmentTypeModifyDetails: getTreatmentTypeModifyDetails,
    deleteTreatmentType: deleteTreatmentType,
    saveTreatmentMethod: saveTreatmentMethod,
    getTreatmentMethodModifyDetails: getTreatmentMethodModifyDetails,
    deleteTreatmentMethod: deleteTreatmentMethod,
    saveLivestockColour: saveLivestockColour,
    getLivestockColourModifyDetails: getLivestockColourModifyDetails,
    deleteLivestockColour: deleteLivestockColour,
    saveGroup: saveGroup,
    getGroupModifyDetails: getGroupModifyDetails,
    deleteGroup: deleteGroup,
    saveDeathReason: saveDeathReason,
    getDeathReasonModifyDetails: getDeathReasonModifyDetails,
    deleteDeathReason: deleteDeathReason,
    getAllUoMTypes: getAllUoMTypes,
    saveAccreditationProgram: saveAccreditationProgram,
    getAccreditationProgramModifyDetails: getAccreditationProgramModifyDetails,
    deleteAccreditationProgram: deleteAccreditationProgram,
    getAllChemicalProductActivity: getAllChemicalProductActivity,
    getAllCountry: getAllCountry,
    saveChemicalProduct: saveChemicalProduct,
    getChemicalProductModifyDetails: getChemicalProductModifyDetails,
    deleteChemicalProduct: deleteChemicalProduct,
    getSuburbDetails: getSuburbDetails,
    getAllServiceTypes: getAllServiceTypes,
    getAllState: getAllState
}