'use strict';

/**************************************
 * APIs for setup menu
 ************************************/

import { createSpecies, getSpeciesDataSet, deleteSpecies, getSpeciesDetail, getAllSpecies, updateSpecies } from '../../business/private/setup-species';
import {
    createBreed, getBreedDataSet, getBreedDetail, updateBreed, deleteBreed,
    getBreedDetailDataset
} from '../../business/private/setup-breed';
import {
    createMaturity, getMaturityDataSet, getMaturityDetail, updateMaturity, deleteMaturity,
    getMaturityDetailDataset
} from '../../business/private/setup-maturity';
import {
    createSpeciesType, getSpeciesTypeDataSet, getSpeciesTypeDetail, updateSpeciesType, deleteSpeciesType,
    getSpeciesTypeDetailDataset
} from '../../business/private/setup-speciestype';
import { createGender, updateGender, getGenderDataSet, deleteGender, getGenderDetail } from '../../business/private/setup-gender';
import { createPropertyType, updatePropertyType, getPropertyTypeDataSet, deletePropertyType, getPropertyTypeDetail, getAllPropertyTypes } from '../../business/private/setup-propertytype';
import { createServiceType, updateServiceType, getServiceTypeDataSet, deleteServiceType, getServiceTypeDetail, getAllServiceTypes } from '../../business/private/setup-servicetype';
import { createBreedType, updateBreedType, getBreedTypeDataSet, deleteBreedType, getBreedTypeDetail, getAllBreedType } from '../../business/private/setup-breedtype';
import {
    createEnclosureType, updateEnclosureType, getEnclosureTypeDataSet, deleteEnclosureType,
    getEnclosureTypeDetail, getAllEnclosureType, getEnclosureTypeBindings
} from '../../business/private/setup-enclosuretype';
import { createChemicalCategory, updateChemicalCategory, getChemicalCategoryDataSet, deleteChemicalCategory, getChemicalCategoryDetail, getAllChemicalCategory } from '../../business/private/setup-chemicalcategory';
import { createUoM, updateUoM, getUoMDataSet, deleteUoM, getUoMDetail, getAllUoM, getAllUoMTypes } from '../../business/private/setup-uom';
import {
    createUoMConversion, updateUoMConversion, getUoMConversionDataSet, deleteUoMConversion, getUoMConversionDetail
} from '../../business/private/setup-uomconversion';
import { createDoseByMeasure, getDoseByMeasureAll } from '../../business/private/setup-dosebymeasure';
import { createTreatmentType, updateTreatmentType, getTreatmentTypeDataSet, deleteTreatmentType, getTreatmentTypeDetail } from '../../business/private/setup-treatmenttype';
import { createTreatmentMethod, updateTreatmentMethod, getTreatmentMethodDataSet, deleteTreatmentMethod, getTreatmentMethodDetail, getTreatmentMethodListSearch } from '../../business/private/setup-treatmentmethod';
import { createLivestockGroup, updateLivestockGroup, getLivestockGroupDataSet, deleteLivestockGroup, getLivestockGroupDetail } from '../../business/private/setup-livestockgroup';
import { createLivestockColour, updateLivestockColour, getLivestockColourDataSet, deleteLivestockColour, getLivestockColourDetail, getAllLivestockColour } from '../../business/private/setup-livestockcolour';
import { createDeathReason, updateDeathReason, getDeathReasonDataSet, deleteDeathReason, getDeathReasonDetail } from '../../business/private/setup-deathreason';
import {
    createProgram, updateProgram, getProgramDataSet,
    deleteProgram, getProgramDetail
} from '../../business/private/setup-accreditationprogram';
import { getAllProperty } from '../../business/private/setup-property';
import { getAllSuburb, getSuburbDetail } from '../../business/private/setup-suburb';
import { getAllChemicalProductActivity } from '../../business/private/setup-chemicalproductactivity';
import { getAllCountry } from '../../business/private/setup-country';
import {
    createChemicalProduct, updateChemicalProduct, deleteChemicalProduct,
    getChemicalProductDataSet, getChemicalProductDetail, getChemicalProductListSearch,
    getChemicalProductStockListSearch
} from '../../business/private/setup-chemicalproduct';
import { getAllState } from '../../business/private/setup-state';
import { getSetupMenu } from '../../business/private/setup';

import { resizeImage } from '../../lib/image-compression';
import { upload, deleteServerFile } from '../../business/private/file-middleware';

export default function (router) {

    /****************************** GENERAL API ********************************* */
    // store uploaded pictures for setup in "uploads" folder to 
    // further store in S3 storage
    router.post('/upload', upload.single("file"), function (req, res, next) {
        //var s3_upload = require('../../../../aws/s3').upload;        
        return resizeImage(req.file).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // delete middleware stored file from server while upload to s3 server
    router.post('/deletefile', function (req, res, next) {
        let { filename, deleteThumb } = req.body;
        return deleteServerFile(filename, deleteThumb).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // get list of setup menu
    router.get('/getsetupmenu', function (req, res, next) {
        let { language } = req.authInfo;
        return getSetupMenu(req.query.controlMenuId, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // retrieve all product actities
    router.get('/chemicalproductactivity/getall', function (req, res, next) {
        return getAllChemicalProductActivity().then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // retrieve all countries
    router.get('/country/getall', function (req, res, next) {
        let { language } = req.authInfo;
        return getAllCountry(language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    /****************************** SPECIES API ********************************* */
    // create or update species details
    router.post('/species/save', function (req, res, next) {
        let { speciesName, speciesCode, mobPicture, indPicture, speciesId, auditId, systemCode } = req.body;

        if (!speciesId) {
            return createSpecies(speciesName, speciesCode, mobPicture, indPicture, req.authInfo.contactId).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
        else {
            return updateSpecies(speciesName, speciesCode, mobPicture, indPicture, req.authInfo.contactId, speciesId,
                auditId, systemCode, req.authInfo.language).then(function (result) {
                    return res.status(result.status).send(result.response);
                }).catch(function (err) {
                    next(err);
                });
        }
    });
    // retreive species data with server side paging/filtering/sortin
    router.get('/species/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, searchText } = JSON.parse(req.query.params);
        let { language } = req.authInfo;
        return getSpeciesDataSet(pageSize, skipRec, sortColumn, sortOrder, searchText, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // logical delete species
    router.post('/species/delete', function (req, res, next) {
        let { uuids, auditLogIds } = req.body;
        return deleteSpecies(uuids, auditLogIds, req.authInfo.contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // get species details by Id
    router.get('/species/detail', function (req, res, next) {
        let { language } = req.authInfo;
        return getSpeciesDetail(req.query.id, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // retrieve all species except deleted
    router.get('/species/getall', function (req, res, next) {
        let { language } = req.authInfo;
        return getAllSpecies(language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    /****************************** BREED API ********************************* */
    // create or update breed details
    router.post('/breed/save', function (req, res, next) {
        let { speciesId, breedTypeId, breedName, breedCode, uuid, auditLogId } = req.body;
        if (!uuid) {
            return createBreed(speciesId, breedTypeId, breedName, breedCode, req.authInfo.contactId).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
        else {
            return updateBreed(speciesId, breedTypeId, breedName, breedCode, uuid, auditLogId, req.authInfo.contactId, req.authInfo.language).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
    });
    // retrieve breeds with server side paging/filtering/sortin
    router.get('/breed/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, searchText } = JSON.parse(req.query.params);
        let { language } = req.authInfo;
        return getBreedDataSet(pageSize, skipRec, sortColumn, sortOrder, searchText, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // get data for breed detail dataset
    router.get('/breed/detaildataset', function (req, res, next) {
        let { SpeciesId, BreedTypeId } = JSON.parse(req.query.params).filterObj;
        let { pageSize, skipRec, sortColumn, sortOrder } = JSON.parse(req.query.params);
        let { language } = req.authInfo;
        return getBreedDetailDataset(SpeciesId, BreedTypeId, language, pageSize, skipRec, sortOrder, sortColumn).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get breed details by id
    router.get('/breed/detail', function (req, res, next) {
        let { language } = req.authInfo;
        return getBreedDetail(req.query.uuid, language).then(function (result) {
            return res.status(result.status).send(result.response);
        });
    });
    // delete breed by supplied Ids
    router.post('/breed/delete', function (req, res, next) {
        let { uuids, auditLogIds } = req.body;
        return deleteBreed(uuids, auditLogIds, req.authInfo.contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    /****************************** MATURITY STATUS API ********************************* */
    // create or update maturity details
    router.post('/maturity/save', function (req, res, next) {
        let { speciesId, maturityName, maturityCode, uuid, auditLogId } = req.body;
        if (!uuid) {
            return createMaturity(speciesId, maturityName, maturityCode, req.authInfo.contactId).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
        else {
            return updateMaturity(speciesId, maturityName, maturityCode, uuid, auditLogId, req.authInfo.contactId, req.authInfo.language).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
    });
    // retrieve maturities with server side paging/filtering/sorting
    router.get('/maturity/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, searchText } = JSON.parse(req.query.params);
        let { language } = req.authInfo;
        return getMaturityDataSet(pageSize, skipRec, sortColumn, sortOrder, searchText, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // get data for maturity detail dataset
    router.get('/maturity/detaildataset', function (req, res, next) {
        let { SpeciesId } = JSON.parse(req.query.params).filterObj;
        let { pageSize, skipRec, sortColumn, sortOrder } = JSON.parse(req.query.params);
        let { language } = req.authInfo;
        return getMaturityDetailDataset(SpeciesId, language, pageSize, skipRec, sortOrder, sortColumn).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // get maturity details by Id
    router.get('/maturity/detail', function (req, res, next) {
        let { language } = req.authInfo;
        return getMaturityDetail(req.query.uuid, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // delete maturity by supplied Ids
    router.post('/maturity/delete', function (req, res, next) {
        let { uuids, auditLogIds } = req.body;
        return deleteMaturity(uuids, auditLogIds, req.authInfo.contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    /****************************** SPECIES TYPE API ********************************* */
    // create or update species type 
    router.post('/speciestype/save', function (req, res, next) {
        let { speciesId, speciesTypeName, speciesTypeCode, uuid, auditLogId, configuredByAdmin } = req.body;
        if (!uuid) {
            return createSpeciesType(speciesId, speciesTypeName, speciesTypeCode, req.authInfo.contactId, configuredByAdmin).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
        else {
            return updateSpeciesType(speciesId, speciesTypeName, speciesTypeCode, uuid, auditLogId, req.authInfo.contactId, req.authInfo.language).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
    });
    // retrieve species type with server paging/filtering/sorting
    router.get('/speciestype/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, searchText } = JSON.parse(req.query.params);
        let { language } = req.authInfo;

        return getSpeciesTypeDataSet(pageSize, skipRec, sortColumn, sortOrder, searchText, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // get data for species type detail dataset
    router.get('/speciestype/detaildataset', function (req, res, next) {
        let { SpeciesId } = JSON.parse(req.query.params).filterObj;
        let { pageSize, skipRec, sortColumn, sortOrder } = JSON.parse(req.query.params);
        let { language } = req.authInfo;
        return getSpeciesTypeDetailDataset(SpeciesId, language, pageSize, skipRec, sortOrder, sortColumn).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // get species type by Id
    router.get('/speciestype/detail', function (req, res, next) {
        let { language } = req.authInfo;
        return getSpeciesTypeDetail(req.query.uuid, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // delete species type
    router.post('/speciestype/delete', function (req, res, next) {
        let { uuids, auditLogIds } = req.body;
        return deleteSpeciesType(uuids, auditLogIds, req.authInfo.contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    /****************************** GENDER API ********************************* */
    // create or update gender details
    router.post('/gender/save', function (req, res, next) {
        let { genderName, genderCode, genderId, auditId } = req.body;
        if (!genderId) {
            return createGender(genderName, genderCode, req.authInfo.contactId).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
        else {
            return updateGender(genderName, genderCode, req.authInfo.contactId, genderId, auditId, req.authInfo.language).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
    });
    // retrieve all genders with server side paging/filtering/sortin
    router.get('/gender/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, searchText } = JSON.parse(req.query.params);
        let { language } = req.authInfo;
        return getGenderDataSet(pageSize, skipRec, sortColumn, sortOrder, searchText, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // delete gender
    router.post('/gender/delete', function (req, res, next) {
        let { uuids, auditLogIds } = req.body;
        return deleteGender(uuids, auditLogIds, req.authInfo.contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // fetch gender detail by id
    router.get('/gender/detail', function (req, res, next) {
        let { language } = req.authInfo;
        return getGenderDetail(req.query.id, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    /****************************** PROPERTY TYPE API ********************************* */
    // create or update property type
    router.post('/propertytype/save', function (req, res, next) {
        let { propertytypeName, propertytypeCode, propertytypeId, auditId, ColorCode } = req.body;
        if (!propertytypeId) {
            return createPropertyType(propertytypeName, propertytypeCode, req.authInfo.contactId, ColorCode).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
        else {
            return updatePropertyType(propertytypeName, propertytypeCode, req.authInfo.contactId, propertytypeId, auditId, ColorCode, req.authInfo.language).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
    });
    // get property types with server side sorting/filtering/paging
    router.get('/propertytype/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, searchText } = JSON.parse(req.query.params);
        let { language } = req.authInfo;
        return getPropertyTypeDataSet(pageSize, skipRec, sortColumn, sortOrder, searchText, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // delete property type
    router.post('/propertytype/delete', function (req, res, next) {
        let { uuids, auditLogIds } = req.body;
        return deletePropertyType(uuids, auditLogIds, req.authInfo.contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // get property type by id
    router.get('/propertytype/detail', function (req, res, next) {
        let { language } = req.authInfo;
        return getPropertyTypeDetail(req.query.id, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // get all property types
    router.get('/propertytype/getall', function (req, res, next) {
        let { language } = req.authInfo;
        return getAllPropertyTypes(language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    /****************************** SERVICE TYPE API ********************************* */
    // create or update service type 
    router.post('/servicetype/save', function (req, res, next) {
        let { serviceTypeName, serviceTypeCode, uuid, auditLogId, ColorCode, configuredByAdmin } = req.body;
        if (!uuid) {
            return createServiceType(serviceTypeName, serviceTypeCode, req.authInfo.contactId, ColorCode, configuredByAdmin).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
        else {
            return updateServiceType(serviceTypeName, serviceTypeCode, uuid, auditLogId,
                req.authInfo.contactId, ColorCode, req.authInfo.language).then(function (result) {
                    return res.status(result.status).send(result.response);
                }).catch(function (err) {
                    next(err);
                });
        }
    });
    // retrieve service types server side filtering/paging/sorting
    router.get('/servicetype/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, searchText } = JSON.parse(req.query.params);
        let { language } = req.authInfo;
        return getServiceTypeDataSet(pageSize, skipRec, sortColumn, sortOrder, searchText, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // delete service type 
    router.post('/servicetype/delete', function (req, res, next) {
        let { uuids, auditLogIds } = req.body;
        return deleteServiceType(uuids, auditLogIds, req.authInfo.contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // get service type details for update
    router.get('/servicetype/detail', function (req, res, next) {
        let { language } = req.authInfo;
        return getServiceTypeDetail(req.query.uuid, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // retrieve all species types except deleted
    router.get('/servicetype/getall', function (req, res, next) {
        let { language } = req.authInfo;
        return getAllServiceTypes(language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    /****************************** UNIT OF MEASURE API ********************************* */
    // create or update uom details
    router.post('/uom/save', function (req, res, next) {
        let { uomName, uomCode, uomTypes, uomId, auditId } = req.body;
        if (!uomId) {
            return createUoM(uomName, uomCode, uomTypes, req.authInfo.contactId).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
        else {
            return updateUoM(uomName, uomCode, uomTypes, req.authInfo.contactId, uomId, auditId, req.authInfo.language).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
    });
    // retrieve uoms by server paging/filtering/sorting
    router.get('/uom/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, searchText } = JSON.parse(req.query.params);
        let { language } = req.authInfo;
        return getUoMDataSet(pageSize, skipRec, sortColumn, sortOrder, searchText, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // delete selected uom
    router.post('/uom/delete', function (req, res, next) {
        let { uuids, auditLogIds } = req.body;
        return deleteUoM(uuids, auditLogIds, req.authInfo.contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // fetch uom by id
    router.get('/uom/detail', function (req, res, next) {
        let { language } = req.authInfo;
        return getUoMDetail(req.query.id, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // fetch all uoms without paging
    // 'types' is comma saperated string for filter uom for specific types
    router.get('/uom/getall', function (req, res, next) {
        let { language } = req.authInfo;
        return getAllUoM(req.query.types, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    /****************************** UNIT OF MEASURE CONVERSION API ********************************* */
    // create or update uom conversion
    router.post('/uomconversion/save', function (req, res, next) {
        let { fromUom, fromUomValue, toUom, toUomValue, uomConversionId, auditId } = req.body;
        if (!uomConversionId) {
            return createUoMConversion(fromUom, fromUomValue, toUom, toUomValue, req.authInfo.contactId).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
        else {
            return updateUoMConversion(fromUom, fromUomValue, toUom, toUomValue, req.authInfo.contactId,
                uomConversionId, auditId).then(function (result) {
                    return res.status(result.status).send(result.response);
                }).catch(function (err) {
                    next(err);
                });
        }
    });
    // retrieve uom conversion by server paging/filtering/sorting
    router.get('/uomconversion/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, searchText } = JSON.parse(req.query.params);
        let { language } = req.authInfo;
        return getUoMConversionDataSet(pageSize, skipRec, sortColumn, sortOrder, searchText, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // delete uom conversion
    router.post('/uomconversion/delete', function (req, res, next) {
        let { uuids, auditLogIds } = req.body;
        return deleteUoMConversion(uuids, auditLogIds, req.authInfo.contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // fetch uom conversion by id
    router.get('/uomconversion/detail', function (req, res, next) {
        return getUoMConversionDetail(req.query.id).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    /****************************** BREED TYPE API **********************************/
    // retrieve all breedtypes excepet deleted
    router.get('/breedtype/getall', function (req, res, next) {
        let { language } = req.authInfo;
        return getAllBreedType(language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // create or update breed type
    router.post('/breedtype/save', function (req, res, next) {
        let { breedTypeName, breedTypeCode, uuid, auditLogId } = req.body;
        if (!uuid) {
            return createBreedType(breedTypeName, breedTypeCode, req.authInfo.contactId).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
        else {
            return updateBreedType(breedTypeName, breedTypeCode, uuid, auditLogId, req.authInfo.contactId, req.authInfo.language).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
    });
    // retrieve breed types by server sorting/paging/filtering
    router.get('/breedtype/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, searchText } = JSON.parse(req.query.params);
        let { language } = req.authInfo;
        return getBreedTypeDataSet(pageSize, skipRec, sortColumn, sortOrder, searchText, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // delete breed tyoe
    router.post('/breedtype/delete', function (req, res, next) {
        let { uuids, auditLogIds } = req.body;
        return deleteBreedType(uuids, auditLogIds, req.authInfo.contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // retrieve breed type by id
    router.get('/breedtype/detail', function (req, res, next) {
        let { language } = req.authInfo;
        return getBreedTypeDetail(req.query.uuid, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    /****************************** ENCLOSURE TYPE API ********************************* */
    // create or update enclosure type
    router.post('/enclosuretype/save', function (req, res, next) {
        let { enclosureTypeName, enclosureTypeCode, configuredByAdmin, uuid, auditLogId } = req.body;
        if (!uuid) {
            return createEnclosureType(enclosureTypeName, enclosureTypeCode, configuredByAdmin, req.authInfo.contactId).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
        else {
            return updateEnclosureType(enclosureTypeName, enclosureTypeCode, uuid, auditLogId, req.authInfo.contactId, req.authInfo.language).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
    });
    // retrieve enclosure types by server sorting/filtering/paging
    router.get('/enclosuretype/getdataset', function (req, res, next) {
        let { language } = req.authInfo;
        let { pageSize, skipRec, sortColumn, sortOrder, searchText, filterObj } = JSON.parse(req.query.params);
        return getEnclosureTypeDataSet(language, pageSize, skipRec, sortColumn, sortOrder, searchText, filterObj).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // delete selected enclosure types
    router.post('/enclosuretype/delete', function (req, res, next) {
        let { uuids, auditLogIds } = req.body;
        return deleteEnclosureType(uuids, auditLogIds, req.authInfo.contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // retrieve enclosure type by id
    router.get('/enclosuretype/detail', function (req, res, next) {
        let { language } = req.authInfo;
        return getEnclosureTypeDetail(req.query.uuid, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // retrieve all enclosure type
    router.get('/enclosuretype/getall', function (req, res, next) {
        let { language } = req.authInfo;
        return getAllEnclosureType(language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get enclosure types for dropdown binding
    router.post('/enclosuretype/getbinding', function (req, res, next) {
        return getEnclosureTypeBindings(req.authInfo.language, req.body.topPIC).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    /****************************** DOSE BY MEASURE API ********************************* */
    // create or update dose by measure
    router.post('/dosebymeasure/save', function (req, res, next) {
        let { uuids, configuredByAdmin } = req.body;
        return createDoseByMeasure(uuids, configuredByAdmin, req.authInfo.contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // retrieve all dose by measure
    router.get('/dosebymeasure/getall', function (req, res, next) {
        return getDoseByMeasureAll(req.query.configuredByAdmin).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    /****************************** CHEMICAL CATEGORY API ********************************* */
    // create or update chemical category
    router.post('/chemicalcategory/save', function (req, res, next) {
        let { chemicalCategoryName, chemicalCategoryCode, uuid, auditLogId } = req.body;
        if (!uuid) {
            return createChemicalCategory(chemicalCategoryName, chemicalCategoryCode, req.authInfo.contactId).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
        else {
            return updateChemicalCategory(chemicalCategoryName, chemicalCategoryCode, uuid, auditLogId, req.authInfo.contactId, req.authInfo.language).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
    });
    // retreive chemical category by server sorting/paging/filtering
    router.get('/chemicalcategory/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, searchText } = JSON.parse(req.query.params);
        let { language } = req.authInfo;
        return getChemicalCategoryDataSet(pageSize, skipRec, sortColumn, sortOrder, searchText, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // delete selected chemical category
    router.post('/chemicalcategory/delete', function (req, res, next) {
        let { uuids, auditLogIds } = req.body;
        return deleteChemicalCategory(uuids, auditLogIds, req.authInfo.contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // fetch chemical category by id
    router.get('/chemicalcategory/detail', function (req, res, next) {
        let { language } = req.authInfo;
        return getChemicalCategoryDetail(req.query.uuid, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // retrieve all chemical categories
    router.get('/chemicalcategory/getall', function (req, res, next) {
        let { language } = req.authInfo;
        return getAllChemicalCategory(language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    /****************************** TREATMENT TYPE API ********************************* */
    // create or update treatment type
    router.post('/treatmenttype/save', function (req, res, next) {
        let { treatmenttypeName, treatmenttypeCode, treatmenttypeId, auditId, configuredByAdmin } = req.body;
        if (!treatmenttypeId) {
            return createTreatmentType(treatmenttypeName, treatmenttypeCode, req.authInfo.contactId, configuredByAdmin).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
        else {
            return updateTreatmentType(treatmenttypeName, treatmenttypeCode, req.authInfo.contactId, treatmenttypeId, auditId, req.authInfo.language).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
    });
    // retrieve all treatment types by server paging/filtering/sorting
    router.get('/treatmenttype/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, searchText } = JSON.parse(req.query.params);
        let { language } = req.authInfo;
        return getTreatmentTypeDataSet(pageSize, skipRec, sortColumn, sortOrder, searchText, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // delete selected treatment types
    router.post('/treatmenttype/delete', function (req, res, next) {
        let { uuids, auditLogIds } = req.body;
        return deleteTreatmentType(uuids, auditLogIds, req.authInfo.contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // get Treatment Type details for update
    router.get('/treatmenttype/detail', function (req, res, next) {
        let { language } = req.authInfo;
        return getTreatmentTypeDetail(req.query.id, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    /****************************** TREATMENT METHOD API ********************************* */
    // create or update treatment methods
    router.post('/treatmentmethod/save', function (req, res, next) {
        let { treatmentmethodName, treatmentmethodCode, treatmentmethodId, auditId, configuredByAdmin } = req.body;
        if (!treatmentmethodId) {
            return createTreatmentMethod(treatmentmethodName, treatmentmethodCode, req.authInfo.contactId, configuredByAdmin).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
        else {
            return updateTreatmentMethod(treatmentmethodName, treatmentmethodCode, req.authInfo.contactId, treatmentmethodId, auditId, req.authInfo.language).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
    });
    // retrieve treatment methods by server paging/filtering/sorting
    router.get('/treatmentmethod/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, searchText } = JSON.parse(req.query.params);
        let { language } = req.authInfo;
        return getTreatmentMethodDataSet(pageSize, skipRec, sortColumn, sortOrder, searchText, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    //  delete selected treatment methods
    router.post('/treatmentmethod/delete', function (req, res, next) {
        let { uuids, auditLogIds } = req.body;
        return deleteTreatmentMethod(uuids, auditLogIds, req.authInfo.contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // fetch treatment method by detail
    router.get('/treatmentmethod/detail', function (req, res, next) {
        let { language } = req.authInfo;
        return getTreatmentMethodDetail(req.query.id, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    /****************************** GROUP API ********************************* */
    // create or update group details
    router.post('/livestockgroup/save', function (req, res, next) {
        let { groupName, groupCode, groupId, auditId, configuredByAdmin } = req.body;
        if (!groupId) {
            return createLivestockGroup(groupName, groupCode, req.authInfo.contactId, configuredByAdmin).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
        else {
            return updateLivestockGroup(groupName, groupCode, req.authInfo.contactId, groupId, auditId, req.authInfo.language).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
    });
    // retrieve group by server filtering/sorting/paging
    router.get('/livestockgroup/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, searchText } = JSON.parse(req.query.params);
        let { language } = req.authInfo;
        return getLivestockGroupDataSet(pageSize, skipRec, sortColumn, sortOrder, searchText, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // delete selected group
    router.post('/livestockgroup/delete', function (req, res, next) {
        let { uuids, auditLogIds } = req.body;
        return deleteLivestockGroup(uuids, auditLogIds, req.authInfo.contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // fetch group by detail
    router.get('/livestockgroup/detail', function (req, res, next) {
        let { language } = req.authInfo;
        return getLivestockGroupDetail(req.query.id, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    /****************************** LIVESTOCK COLOUR API ********************************* */
    // create or update livestock colour
    router.post('/livestockcolour/save', function (req, res, next) {
        let { livestockcolourName, livestockcolourCode, livestockcolourId, auditId, configuredByAdmin } = req.body;
        if (!livestockcolourId) {
            return createLivestockColour(livestockcolourName, livestockcolourCode, req.authInfo.contactId, configuredByAdmin).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
        else {
            return updateLivestockColour(livestockcolourName, livestockcolourCode, req.authInfo.contactId, livestockcolourId, auditId, req.authInfo.language).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
    });
    // retrieve livestock colour by server filtering/sorting/paging
    router.get('/livestockcolour/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, searchText } = JSON.parse(req.query.params);
        let { language } = req.authInfo;
        return getLivestockColourDataSet(pageSize, skipRec, sortColumn, sortOrder, searchText, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // delete selected livestock colour
    router.post('/livestockcolour/delete', function (req, res, next) {
        let { uuids, auditLogIds } = req.body;
        return deleteLivestockColour(uuids, auditLogIds, req.authInfo.contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // fetch livestock colour details
    router.get('/livestockcolour/detail', function (req, res, next) {
        let { language } = req.authInfo;
        return getLivestockColourDetail(req.query.id, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // fetch all livestock colours for drop down 
    router.get('/livestockcolour/getall', function (req, res, next) {
        let { language } = req.authInfo;
        let { companyId, regionId, businessId, propertyId } = req.body;
        return getAllLivestockColour(language, companyId, regionId, businessId, propertyId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    /****************************** DEATH REASON API ********************************* */
    // create or update death reason
    router.post('/deathreason/save', function (req, res, next) {
        let { deathReasonName, deathReasonCode, deathReasonId, auditId, configuredByAdmin } = req.body;
        if (!deathReasonId) {
            return createDeathReason(deathReasonName, deathReasonCode, req.authInfo.contactId, configuredByAdmin).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
        else {
            return updateDeathReason(deathReasonName, deathReasonCode, req.authInfo.contactId, deathReasonId, auditId, req.authInfo.language).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
    });
    // retrieve death reason by server filtering/sorting/paging
    router.get('/deathreason/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, searchText } = JSON.parse(req.query.params);
        let { language } = req.authInfo;
        return getDeathReasonDataSet(pageSize, skipRec, sortColumn, sortOrder, searchText, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // delete selected death reason
    router.post('/deathreason/delete', function (req, res, next) {
        let { uuids, auditLogIds } = req.body;
        return deleteDeathReason(uuids, auditLogIds, req.authInfo.contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // fetch death reason by details
    router.get('/deathreason/detail', function (req, res, next) {
        let { language } = req.authInfo;
        return getDeathReasonDetail(req.query.id, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    /****************************** UOM TYPES API **********************************/
    // fetch all uom types 
    router.get('/uomtypes/getall', function (req, res, next) {
        let { language } = req.authInfo;
        return getAllUoMTypes(language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    /****************************** STATE API **********************************/
    // fetch all states 
    router.get('/state/getall', function (req, res, next) {
        let { language } = req.authInfo;
        return getAllState(language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    /****************************** ACCREDITATION PROGRAM API **********************************/
    // create or update accreditation program 
    router.post('/accreditationprogram/save', function (req, res, next) {
        let { accreditationprogramName, accreditationprogramCode, isActive, accreditationprogramId, auditId } = req.body;
        if (!accreditationprogramId) {
            return createProgram(accreditationprogramName, accreditationprogramCode, isActive, req.authInfo.contactId).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
        else {
            return updateProgram(accreditationprogramName, accreditationprogramCode, isActive, req.authInfo.contactId, accreditationprogramId, auditId, req.authInfo.language).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
    });
    // retrieve program by server filtering/sorting/paging
    router.get('/accreditationprogram/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, searchText } = JSON.parse(req.query.params);
        let { language } = req.authInfo;
        return getProgramDataSet(pageSize, skipRec, sortColumn, sortOrder, searchText, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // delete selected accreditations
    router.post('/accreditationprogram/delete', function (req, res, next) {
        let { uuids, auditLogIds } = req.body;
        return deleteProgram(uuids, auditLogIds, req.authInfo.contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // fetch accreditation by id
    router.get('/accreditationprogram/detail', function (req, res, next) {
        let { language } = req.authInfo;
        return getProgramDetail(req.query.id, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    /****************************** PROPERTY API **********************************/
    // fetch all uom types 
    router.get('/property/getall', function (req, res, next) {
        let search = req.query.search;
        return getAllProperty(search).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    /****************************** CHEMICAL PRODUCT API **********************************/
    // create or update chemical product 
    router.post('/chemicalproduct/save', function (req, res, next) {
        let { chemicalproduct, chemicalproductstock, chemicalproductesi, chemicalproductwhp } = req.body;
        if (!chemicalproduct.chemicalproductId) {
            return createChemicalProduct(chemicalproduct, chemicalproductstock, chemicalproductesi, chemicalproductwhp, req.authInfo.contactId).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
        else {
            return updateChemicalProduct(chemicalproduct, chemicalproductstock, chemicalproductesi, chemicalproductwhp, req.authInfo.contactId).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
    });
    // retrieve chemical product  by server filtering/sorting/paging
    router.get('/chemicalproduct/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, searchText } = JSON.parse(req.query.params);
        return getChemicalProductDataSet(pageSize, skipRec, sortColumn, sortOrder, searchText).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // fetch chemical product by id
    router.get('/chemicalproduct/detail', function (req, res, next) {
        return getChemicalProductDetail(req.query.id, req.authInfo.language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // delete selected accreditations
    router.post('/chemicalproduct/delete', function (req, res, next) {
        let { uuids, auditLogIds } = req.body;
        return deleteChemicalProduct(uuids, auditLogIds, req.authInfo.contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    /****************************** SUBURB API **********************************/
    // fetch all uom types 
    router.get('/suburb/getall', function (req, res, next) {
        let countryId = req.query.countryId;
        let search = req.query.search;
        return getAllSuburb(search, countryId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // fetch suburb detail by id
    router.get('/suburb/detail', function (req, res, next) {
        let { language } = req.authInfo;
        return getSuburbDetail(req.query.id, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // search chemical product list for autocomplete
    router.get('/chemicalproduct/getlist', function (req, res, next) {
        let { search, topPIC = null, speciesId = null } = req.query;
        return getChemicalProductListSearch(search, topPIC, speciesId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });


    // search chemical product list for autocomplete
    router.get('/chemicalproductstock/getlist', function (req, res, next) {
        let { search, chemicalProductId = null, speciesId = null } = req.query;
        return getChemicalProductStockListSearch(search, chemicalProductId, speciesId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // search treatment method list for autocomplete
    router.get('/treatmentmethod/getlist', function (req, res, next) {
        let { search, topPIC = null } = req.query;
        return getTreatmentMethodListSearch(search, topPIC, req.authInfo.language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

}
