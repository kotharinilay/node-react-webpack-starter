'use strict';

/****************************************
 * convert to schema table from view model
 * mapping
 * ********************************** */

import { uuidToBuffer, newUUID, bufferToUUID } from '../../shared/uuid';
import { isEmpty as _isEmpty, isUndefined as _isUndefined } from 'lodash';

let Livestock = (obj) => {
    let livestockObj = {
        Mob: obj.mob,
        NumberOfHead: obj.livestockquantity || 1,
        BirthDate: obj.dateofbirth,
        BirthWeight: obj.birthweight,
        BirthPIC: obj.birthpic,
        BreedTypeId: uuidToBuffer(obj.breedtype),
        CurrentPropertyId: uuidToBuffer(obj.topPIC.PropertyId),
        CurrentEnclosureId: uuidToBuffer(obj.enclosurename),
        InductionDate: obj.inductiondate || new Date(),
        DefaultGPS: obj.inductionGPS,
        SpeciesId: uuidToBuffer(obj.species),
        SpeciesTypeId: uuidToBuffer(obj.speciestype),
        MaturityStatusId: uuidToBuffer(obj.maturity),
        GenderId: uuidToBuffer(obj.sex),
        CurrentWeight: obj.livestockweight,
        DSE: obj.livestockweight ? obj.livestockweight < 50 ? 1 : (obj.livestockweight / 50).toFixed(2) : undefined,
        ColorId: uuidToBuffer(obj.colour),
        TagPlace: obj.tagPlace,
        LivestockCategoryId: uuidToBuffer(obj.category),
        HasLT: obj.hasLT,
        HasEU: obj.hasEU,
        IsFinancierOwned: obj.financierOwned ? 1 : 0,
        LivestockOriginId: uuidToBuffer(obj.livestockorigin),
        Identifier: obj.livestockidentifier
    }
    return livestockObj;
}

let MultipleLivestock = (obj) => {
    let livestockObj = {}
    if (obj.mob != undefined) livestockObj['Mob'] = obj.mob;
    if (obj.livestockquantity != undefined) livestockObj['NumberOfHead'] = obj.livestockquantity || 1;
    if (obj.dateofbirth != undefined) livestockObj['BirthDate'] = obj.dateofbirth;
    if (obj.birthweight != undefined) livestockObj['BirthWeight'] = obj.birthweight;
    if (obj.birthpic != undefined) livestockObj['BirthPIC'] = obj.birthpic;
    if (obj.breedtype != undefined) livestockObj['BreedTypeId'] = uuidToBuffer(obj.breedtype);
    if (obj.enclosurename != undefined) livestockObj['CurrentEnclosureId'] = uuidToBuffer(obj.enclosurename);
    if (obj.inductiondate != undefined) livestockObj['InductionDate'] = obj.inductiondate;
    if (obj.inductionGPS != undefined) livestockObj['DefaultGPS'] = obj.inductionGPS;
    if (obj.species != undefined) livestockObj['SpeciesId'] = uuidToBuffer(obj.species);
    if (obj.speciestype != undefined) livestockObj['SpeciesTypeId'] = uuidToBuffer(obj.speciestype);
    if (obj.maturity != undefined) livestockObj['MaturityStatusId'] = uuidToBuffer(obj.maturity);
    if (obj.sex != undefined) livestockObj['GenderId'] = uuidToBuffer(obj.sex);
    if (obj.livestockweight != undefined) livestockObj['CurrentWeight'] = obj.livestockweight;
    if (obj.livestockweight != undefined) livestockObj['DSE'] = obj.livestockweight < 50 ? 1 : (obj.livestockweight / 50).toFixed(2);
    if (obj.colour != undefined) livestockObj['ColorId'] = uuidToBuffer(obj.colour);
    if (obj.tagPlace != undefined) livestockObj['TagPlace'] = obj.tagPlace;
    if (obj.category != undefined) livestockObj['LivestockCategoryId'] = uuidToBuffer(obj.category);
    if (obj.hasLT != undefined) livestockObj['HasLT'] = obj.hasLT;
    if (obj.hasEU != undefined) livestockObj['HasEU'] = obj.hasEU;
    if (obj.financierOwned != undefined) livestockObj['IsFinancierOwned'] = obj.financierOwned ? 1 : 0;
    if (obj.livestockorigin != undefined) livestockObj['LivestockOriginId'] = uuidToBuffer(obj.livestockorigin);
    if (obj.livestockidentifier != undefined) livestockObj['Identifier'] = obj.livestockidentifier

    return livestockObj;
}

let LivestockAttribute = (obj) => {
    let livestockAttributeObj = {
        ManagementNo: obj.mgmtnumber,
        ManagementGroup: obj.mgmtgroup,
        NumberInBirth: obj.numberinbirth,
        NumberInReared: obj.numberreared,
        GeneticSireLivestockId: uuidToBuffer(obj.geneticsireId),
        GeneticSireText: obj.geneticsire,
        FosterDamLivestockId: uuidToBuffer(obj.foasterdamId),
        FosterDamText: obj.foasterdam,
        GeneticDamLivestockId: uuidToBuffer(obj.geneticdamId),
        GeneticDamText: obj.geneticdam,
        RecipientDamLivestockId: uuidToBuffer(obj.receipientdamId),
        RecipientDamText: obj.receipientdam,
        MultiSireGroup: obj.multisiregroup,
        EarmarkText: obj.eartag,
        BrandText: obj.brand,
        BirthProductivity: obj.birthproductivity,
        Progeny: obj.progeny,
        IsHGP: obj.hgp ? 1 : 0,
        HGPText: obj.hgpdetail,
        LastMonthOfShearing: obj.lastmonthofshearing,
        LastComment: obj.lastcomment,
        AdditionalTag: obj.additionaltag,
        FeedlotTag: obj.feedlottag,
        BreederTag: obj.breedertag,
        StudName: obj.studname,
        RegistrationDetail: obj.registrationdetail,
        WeighBridgeTicket: obj.weighbridgeticket,
        ReferenceId: obj.referenceid,
        Name: obj.name,
        Appraisal: obj.apprialsal,
        ReminderNote: obj.remindernote,
        ReminderDate: obj.reminderdate,
        BreederPIC: obj.breederpic,
        BreederContact: obj.breedercontact,
        BreederContactMobile: obj.breedercontactmobile,
        BreederContactEmail: obj.breedercontactemail,
        IsFreeMartin: obj.freemartin ? 1 : 0,
        DraftGroup: obj.draftgroup,
        IsPPSR: obj.ppsr ? 1 : 0,
        FinancierName: obj.financierName,
        EIDBatchNo: obj.batchnumber,
        SupplyChain: obj.supplychain,
        ClassificationId: uuidToBuffer(obj.classification),
        ConditionScoreId: uuidToBuffer(obj.conditionscore),
        ContemporaryId: uuidToBuffer(obj.contemporarygroup),
        TagPlaceId: uuidToBuffer(obj.tagPlace),
        GeneticStatusId: uuidToBuffer(obj.geneticstatus),
        LivestockGroupId: uuidToBuffer(obj.group),
        Drop: obj.drop,
        ScanDate: obj.scandate,
        LivestockOriginReference: obj.livestockoriginref,
        LivestockOriginPIC: obj.livestockoriginpic,
        DentitionId: uuidToBuffer(obj.dentition)
    }
    return livestockAttributeObj;
}

let MultipleLivestockAttribute = (obj) => {
    let livestockAttributeObj = {}
    if (obj.mgmtnumber != undefined) livestockAttributeObj['ManagementNo'] = obj.mgmtnumber;
    if (obj.mgmtgroup != undefined) livestockAttributeObj['ManagementGroup'] = obj.mgmtgroup;
    if (obj.numberinbirth != undefined) livestockAttributeObj['NumberInBirth'] = obj.numberinbirth;
    if (obj.numberreared != undefined) livestockAttributeObj['NumberInReared'] = obj.numberreared;
    if (obj.geneticsireId != undefined) livestockAttributeObj['GeneticSireLivestockId'] = uuidToBuffer(obj.geneticsireId);
    if (obj.geneticsire != undefined) livestockAttributeObj['GeneticSireText'] = obj.geneticsire;
    if (obj.foasterdamId != undefined) livestockAttributeObj['FosterDamLivestockId'] = uuidToBuffer(obj.foasterdamId);
    if (obj.foasterdam != undefined) livestockAttributeObj['FosterDamText'] = obj.foasterdam;
    if (obj.geneticdamId != undefined) livestockAttributeObj['GeneticDamLivestockId'] = uuidToBuffer(obj.geneticdamId);
    if (obj.geneticdam != undefined) livestockAttributeObj['GeneticDamText'] = obj.geneticdam;
    if (obj.receipientdamId != undefined) livestockAttributeObj['RecipientDamLivestockId'] = uuidToBuffer(obj.receipientdamId);
    if (obj.receipientdam != undefined) livestockAttributeObj['RecipientDamText'] = obj.receipientdam;
    if (obj.multisiregroup != undefined) livestockAttributeObj['MultiSireGroup'] = obj.multisiregroup;
    if (obj.eartag != undefined) livestockAttributeObj['EarmarkText'] = obj.eartag;
    if (obj.brand != undefined) livestockAttributeObj['BrandText'] = obj.brand;
    if (obj.birthproductivity != undefined) livestockAttributeObj['BirthProductivity'] = obj.birthproductivity;
    if (obj.progeny != undefined) livestockAttributeObj['Progeny'] = obj.progeny;
    if (obj.hgp != undefined) livestockAttributeObj['IsHGP'] = obj.hgp ? 1 : 0;
    if (obj.hgpdetail != undefined) livestockAttributeObj['HGPText'] = obj.hgpdetail;
    if (obj.lastmonthofshearing != undefined) livestockAttributeObj['LastMonthOfShearing'] = obj.lastmonthofshearing;
    if (obj.lastcomment != undefined) livestockAttributeObj['LastComment'] = obj.lastcomment;
    if (obj.additionaltag != undefined) livestockAttributeObj['AdditionalTag'] = obj.additionaltag;
    if (obj.feedlottag != undefined) livestockAttributeObj['FeedlotTag'] = obj.feedlottag;
    if (obj.breedertag != undefined) livestockAttributeObj['BreederTag'] = obj.breedertag;
    if (obj.studname != undefined) livestockAttributeObj['StudName'] = obj.studname;
    if (obj.registrationdetail != undefined) livestockAttributeObj['RegistrationDetail'] = obj.registrationdetail;
    if (obj.weighbridgeticket != undefined) livestockAttributeObj['WeighBridgeTicket'] = obj.weighbridgeticket;
    if (obj.referenceid != undefined) livestockAttributeObj['ReferenceId'] = obj.referenceid;
    if (obj.name != undefined) livestockAttributeObj['Name'] = obj.name;
    if (obj.apprialsal != undefined) livestockAttributeObj['Appraisal'] = obj.apprialsal;
    if (obj.remindernote != undefined) livestockAttributeObj['ReminderNote'] = obj.remindernote;
    if (obj.reminderdate != undefined) livestockAttributeObj['ReminderDate'] = obj.reminderdate;
    if (obj.breederpic != undefined) livestockAttributeObj['BreederPIC'] = obj.breederpic;
    if (obj.breedercontact != undefined) livestockAttributeObj['BreederContact'] = obj.breedercontact;
    if (obj.breedercontactmobile != undefined) livestockAttributeObj['BreederContactMobile'] = obj.breedercontactmobile;
    if (obj.breedercontactemail != undefined) livestockAttributeObj['BreederContactEmail'] = obj.breedercontactemail;
    if (obj.freemartin != undefined) livestockAttributeObj['IsFreeMartin'] = obj.freemartin ? 1 : 0;
    if (obj.draftgroup != undefined) livestockAttributeObj['DraftGroup'] = obj.draftgroup;
    if (obj.ppsr != undefined) livestockAttributeObj['IsPPSR'] = obj.ppsr ? 1 : 0;
    if (obj.financierName != undefined) livestockAttributeObj['FinancierName'] = obj.financierName;
    if (obj.batchnumber != undefined) livestockAttributeObj['EIDBatchNo'] = obj.batchnumber;
    if (obj.supplychain != undefined) livestockAttributeObj['SupplyChain'] = obj.supplychain;
    if (obj.classification != undefined) livestockAttributeObj['ClassificationId'] = uuidToBuffer(obj.classification);
    if (obj.conditionscore != undefined) livestockAttributeObj['ConditionScoreId'] = uuidToBuffer(obj.conditionscore);
    if (obj.contemporarygroup != undefined) livestockAttributeObj['ContemporaryId'] = uuidToBuffer(obj.contemporarygroup);
    if (obj.tagPlace != undefined) livestockAttributeObj['TagPlaceId'] = uuidToBuffer(obj.tagPlace);
    if (obj.geneticstatus != undefined) livestockAttributeObj['GeneticStatusId'] = uuidToBuffer(obj.geneticstatus);
    if (obj.group != undefined) livestockAttributeObj['LivestockGroupId'] = uuidToBuffer(obj.group);
    if (obj.drop != undefined) livestockAttributeObj['Drop'] = obj.drop;
    if (obj.scandate != undefined) livestockAttributeObj['ScanDate'] = obj.scandate;
    if (obj.livestockoriginref != undefined) livestockAttributeObj['LivestockOriginReference'] = obj.livestockoriginref;
    if (obj.livestockoriginpic != undefined) livestockAttributeObj['LivestockOriginPIC'] = obj.livestockoriginpic;
    if (obj.dentition != undefined) livestockAttributeObj['DentitionId'] = uuidToBuffer(obj.dentition);

    return livestockAttributeObj;
}

let AuditLog = (obj, raw) => {
    let auditLogId = newUUID();

    if (_isEmpty(obj.ContactId) || _isUndefined(obj.ContactId)) {
        throw new Error("ContactId is required.");
    }

    return {
        Id: uuidToBuffer(livestockEventId),
        UUID: livestockEventId,
        CreatedBy: obj.ContactId,
        CreatedStamp: new Date(),
        CreatedFromSource: obj.CreatedFromSource,
        CreatedFromFeature: obj.CreatedFromFeature,
        CreatedFromDeviceIdentity: obj.CreatedFromDeviceIdentity
    }
}

let LivestockEvent = (livestockId, propertyId, enclosureId, numberOfHead, eventType, eventDate, eventGps, reference) => {
    let livestockEventId = newUUID();

    if (_isEmpty(propertyId) || _isUndefined(propertyId)) {
        throw new Error("PropertyId is required.");
    }
    if (_isEmpty(livestockId) || _isUndefined(livestockId)) {
        throw new Error("LivestockId is required.");
    }
    if (_isEmpty(eventType) || _isUndefined(eventType)) {
        throw new Error("EventType is required.");
    }

    let auditLogId = newUUID();
    var obj =
        {
            LivestockEvent_AuditLogId: auditLogId,
            LivestockEvent: {
                Id: uuidToBuffer(livestockEventId),
                UUID: livestockEventId,
                PropertyId: propertyId,
                EnclosureId: _isEmpty(enclosureId) || _isUndefined(enclosureId) ? null : enclosureId,
                EventGPS: _isEmpty(eventGps) || _isUndefined(eventGps) ? null : eventGps,
                NumberOfHead: numberOfHead == null ? 1 : numberOfHead,
                Reference: reference,
                LivestockId: livestockId,
                EventType: eventType,
                EventDate: _isEmpty(eventDate) || _isUndefined(eventDate) ? new Date() : eventDate,
                AuditLogId: uuidToBuffer(auditLogId)
            }
        };
    return obj;
}

let LivestockPropertyHistory = (livestockId, propertyId, weight, eventDate, costOfFeed, eventId) => {
    let id = newUUID();

    if (_isEmpty(livestockId) || _isUndefined(livestockId)) {
        throw new Error("LivestockId is required.");
    }
    if (_isEmpty(propertyId) || _isUndefined(propertyId)) {
        throw new Error("PropertyId is required.");
    }
    if (_isEmpty(eventId) || _isUndefined(eventId)) {
        throw new Error("EventId is required.");
    }
    return {
        Id: uuidToBuffer(id),
        UUID: id,
        LivestockId: livestockId,
        PropertyId: propertyId,
        EntryDate: _isEmpty(eventDate) || _isUndefined(eventDate) ? new Date() : eventDate,
        CostOfFeed: _isEmpty(costOfFeed) || _isUndefined(costOfFeed) ? 0 : costOfFeed,
        LivestockEntryEventId: eventId,
        EntryWeight: weight == null ? 0 : weight
    }
}

let LivestockEnclosureHistory = (livestockId, propertyId, enclosureId, weight, eventDate, eventId) => {
    let id = newUUID();

    if (_isEmpty(livestockId) || _isUndefined(livestockId)) {
        throw new Error("LivestockId is required.");
    }
    if (_isEmpty(propertyId) || _isUndefined(propertyId)) {
        throw new Error("PropertyId is required.");
    }
    if (_isEmpty(enclosureId) || _isUndefined(enclosureId)) {
        throw new Error("EnclosureId is required.");
    }
    if (_isEmpty(eventId) || _isUndefined(eventId)) {
        throw new Error("EventId is required.");
    }
    return {
        Id: uuidToBuffer(id),
        UUID: id,
        LivestockId: livestockId,
        EnclosureId: enclosureId,
        EntryDate: _isEmpty(eventDate) || _isUndefined(eventDate) ? new Date() : eventDate,
        EntryWeight: weight == null ? 0 : weight,
        LivestockEventId: eventId
    }
}

let LivestockStatusHistory = (livestockId, propertyId, activityStatusId, eventGps, comment, eventId) => {
    let id = newUUID(), livestockEvent = {};

    if (_isEmpty(propertyId) || _isUndefined(propertyId)) {
        throw new Error("PropertyId is required.");
    }
    if (_isEmpty(livestockId) || _isUndefined(livestockId)) {
        throw new Error("LivestockId is required.");
    }
    if (_isEmpty(activityStatusId) || _isUndefined(activityStatusId)) {
        throw new Error("ActivityStatusId is required.");
    }
    if (_isEmpty(eventId) || _isUndefined(eventId)) {
        throw new Error("EventId is required.");
    }
    return {
        Id: uuidToBuffer(id),
        UUID: id,
        LivestockId: livestockId,
        PropertyId: propertyId,
        ActivityStatusId: activityStatusId,
        LivestockEventId: eventId,
        Comment: comment
    }
}

let LivestockWeightHistory = (livestockId, propertyId, enclosureId, pic, weight, eventDate, eventId) => {
    let id = newUUID();

    if (_isEmpty(livestockId) || _isUndefined(livestockId)) {
        throw new Error("LivestockId is required.");
    }
    if (_isEmpty(propertyId) || _isUndefined(propertyId)) {
        throw new Error("PropertyId is required.");
    }
    if (_isEmpty(pic) || _isUndefined(pic)) {
        throw new Error("PIC is required.");
    }
    if (_isEmpty(weight) || _isUndefined(weight)) {
        throw new Error("Weight is required.");
    }
    if (_isEmpty(eventId) || _isUndefined(eventId)) {
        throw new Error("EventId is required.");
    }
    return {
        Id: uuidToBuffer(id),
        UUID: id,
        LivestockId: livestockId,
        EventDate: _isEmpty(eventDate) || _isUndefined(eventDate) ? new Date() : eventDate,
        Weight: weight,
        PIC: pic,
        EnclosureId: enclosureId,
        LivestockEventId: eventId
    }
}

let MobCountHistory = (livestockId, propertyId, numberOfHead, disposalMethodId, deathReason, eventId) => {
    let id = newUUID();
    if (_isEmpty(livestockId) || _isUndefined(livestockId)) {
        throw new Error("LivestockId is required.");
    }
    if (_isEmpty(propertyId) || _isUndefined(propertyId)) {
        throw new Error("PropertyId is required.");
    }
    if (numberOfHead == null) {
        throw new Error("NumberOfHead is required.");
    }
    if (_isEmpty(eventId) || _isUndefined(eventId)) {
        throw new Error("EventId is required.");
    }
    return {
        Id: uuidToBuffer(id),
        UUID: id,
        LivestockId: livestockId,
        PropertyId: propertyId,
        LivestockCount: numberOfHead,
        DisposalMethodId: disposalMethodId,
        DeathReason: deathReason,
        LivestockEventId: eventId
    }
}

let LivestockFeedDetail = (livestockId, propertyId, numberOfHead, livestockFeedId, feedQty, feedCost, eventId) => {
    let id = newUUID();
    if (_isEmpty(livestockId) || _isUndefined(livestockId)) {
        throw new Error("LivestockId is required.");
    }
    if (_isEmpty(propertyId) || _isUndefined(propertyId)) {
        throw new Error("PropertyId is required.");
    }
    if (numberOfHead == null) {
        throw new Error("NumberOfHead is required.");
    }
    if (_isEmpty(eventId) || _isUndefined(eventId)) {
        throw new Error("EventId is required.");
    }
    return {
        Id: uuidToBuffer(id),
        UUID: id,
        LivestockFeedId: livestockFeedId,
        LivestockId: livestockId,
        LivestockEventId: eventId,
        FeedQty: feedQty,
        FeedCost: feedCost,
        LivestockCount: numberOfHead
    }
}

let BreedComposition = (livestockId, data) => {
    let query = 'INSERT INTO breedcomposition (LivestockId, BreedId, Percentage) VALUES ';
    let arr = [];
    data.map((breed) => {
        arr.push(`(fn_UuidToBin('${livestockId}'),fn_UuidToBin('${breed.BreedId}'), ${breed.Percentage})`);
    });
    query += arr.join();
    query += ';';
    return query;
}

let TagHistory = (tagId, livestockId, assignDate, reason) => {
    let id = newUUID();
    let auditId = newUUID();
    if (_isEmpty(livestockId) || _isUndefined(livestockId)) {
        throw new Error("LivestockId is required.");
    }
    if (_isEmpty(tagId) || _isUndefined(tagId)) {
        throw new Error("TagId is required.");
    }
    let TagHistory = {};
    return {
        TagHistory_AuditLogId: auditId,
        TagHistory: {
            Id: uuidToBuffer(id),
            UUID: id,
            DeviceTagId: uuidToBuffer(tagId),
            LivestockId: uuidToBuffer(livestockId),
            AssignDate: _isEmpty(assignDate) || _isUndefined(assignDate) ? new Date() : assignDate,
            AuditLogId: uuidToBuffer(auditId),
            Reason: reason
        }
    }
}

let LivestockTagReplacementHistory = (livestockId, tagId, propertyId, comments, eventId) => {
    let id = newUUID();

    if (_isEmpty(livestockId) || _isUndefined(livestockId)) {
        throw new Error("LivestockId is required.");
    }
    if (_isEmpty(tagId) || _isUndefined(tagId)) {
        throw new Error("TagId is required.");
    }
    if (_isEmpty(propertyId) || _isUndefined(propertyId)) {
        throw new Error("PropertyId is required.");
    }
    if (_isEmpty(eventId) || _isUndefined(eventId)) {
        throw new Error("EventId is required.");
    }
    return {
        Id: uuidToBuffer(id),
        UUID: id,
        LivestockId: livestockId,
        TagId: tagId,
        Comments: comments,
        LivestockEventId: eventId
    }
}

let AccreditationQuestionObj = (element, nvdId, fileArr, deleteFileArr, category, additionalPath) => {
    if (_isEmpty(nvdId) || _isUndefined(nvdId)) {
        throw new Error("NVDId is required.");
    }

    let id = newUUID();
    if (element.AgliveFile) {
        if (element.AgliveFile.deletedFile) {
            element.AgliveFile.deletedFile.Id = uuidToBuffer(element.AgliveFile.fileId);
            element.AgliveFile.deletedFile.imagePath = `/nvd/${bufferToUUID(nvdId)}/Questionnaire/`;
            deleteFileArr.push(element.AgliveFile.deletedFile);
        }
        if (element.AgliveFile.file && element.AgliveFile.fileId == null) {
            element.AgliveFile.fileId = newUUID();
            element.AgliveFile.additionalPath = additionalPath;//'Questionnaire';
            element.AgliveFile.category = category;
            fileArr.push(element.AgliveFile);
        }
    }
    let accreditationQuestionObj = {
        Id: uuidToBuffer(id),
        UUID: id,
        NVDId: nvdId,
        AccreditationProgramId: element.AccreditationProgramId ?
            uuidToBuffer(element.AccreditationProgramId) : null,
        DataId: element.DataId,
        Value: element.Value,
        AgliveFileId: element.AgliveFile && element.AgliveFile.file ? uuidToBuffer(element.AgliveFile.fileId) : null
    }
    return accreditationQuestionObj;
}

module.exports = {
    LivestockMapper: Livestock,
    MultipleLivestockMapper: MultipleLivestock,
    LivestockPropertyHistoryMapper: LivestockPropertyHistory,
    LivestockAttributeMapper: LivestockAttribute,
    MultipleLivestockAttributeMapper: MultipleLivestockAttribute,
    LivestockEventMapper: LivestockEvent,
    LivestockEnclosureHistoryMapper: LivestockEnclosureHistory,
    LivestockStatusHistoryMapper: LivestockStatusHistory,
    LivestockWeightHistoryMapper: LivestockWeightHistory,
    MobCountHistoryMapper: MobCountHistory,
    LivestockFeedDetailMapper: LivestockFeedDetail,
    BreedCompositionMapper: BreedComposition,
    TagHistoryMapper: TagHistory,
    LivestockTagReplacementHistory: LivestockTagReplacementHistory,
    AccreditationQuestionObj: AccreditationQuestionObj
}