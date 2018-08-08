'use strict';

/*************************************
 * database interaction methods related to 
 * 'livestock' table
 * *************************************/

import models from '../schema';
import { includes, intersection, sum, map } from 'lodash';
import { genderSystemCodes, livestockActivityStatusCodes } from '../../shared/constants';
import { uuidToBuffer } from '../../shared/uuid';
import { getAllActivityStatus } from './livestockactivitystatus';
import { map as _map } from 'lodash';

// get livestock grid data 
let getDataSet = (pageSize, skipRec, sortOrder, sortColumn, filterObj, searchText, language) => {

    if (!sortColumn) {
        sortColumn = 'EID';
    }

    let pagingFilter = '';
    if (pageSize != null && skipRec != null)
        pagingFilter = ` LIMIT ${skipRec},${pageSize}`;

    let propertyId = filterObj.propertyId;
    let searchQuery = generateSearchQuery(filterObj);

    let groupByQuery = '';
    if (includes(filterObj.columns, 'BreedComposition') || filterObj.filter.breed)
        groupByQuery = ` GROUP BY l.Id`;

    let joinQuery = generateJoinQuery(filterObj, language, searchText);
    filterObj = changeFilterObj(filterObj);

    let newJoinQuery = joinQuery.replace(/left join breedcomposition bc on bc.LivestockId = l.Id/g, '').replace(/left join breeddata bd on bd.BreedId = bc.BreedId/g, '');

    return getAllActivityStatus({ Language: language }).then(function (data) {
        return data;
    }).then(function (data) {

        let baseQuery = '';
        let { activityStatus } = filterObj.filter;
        let selectedActivityStatus = null;
        if (activityStatus) {
            selectedActivityStatus = data.filter(function (f) {
                return f.Id == activityStatus;
            })[0];
        }

        let topSearchQuery = '';
        if (searchText) {
            topSearchQuery = ` AND (l.EID LIKE '${searchText}' OR l.VisualTag LIKE '${searchText}' 
            OR l.NLISID  LIKE '${searchText}' OR l.SocietyId LIKE '${searchText}'
            OR l.Mob LIKE '${searchText}' OR e.Name LIKE '${searchText}' OR la.ManagementGroup LIKE '${searchText}'
            OR la.ManagementNo LIKE '${searchText}' OR l.BirthPIC LIKE '${searchText}' OR la.LivestockOriginPIC LIKE '${searchText}'
            OR la.LastPIC LIKE '${searchText}' OR la.PICEarTag LIKE '${searchText}' OR la.BrandText LIKE '${searchText}'
            OR la.AdditionalTag LIKE '${searchText}' OR la.FeedlotTag LIKE '${searchText}' OR la.BreederTag LIKE '${searchText}'
            OR la.StudName LIKE '${searchText}' OR la.ReferenceId LIKE '${searchText}' OR la.Appraisal LIKE '${searchText}'
            OR la.LivestockOriginPIC LIKE '${searchText}' OR la.BreederPIC LIKE '${searchText}' OR la.FinancierName LIKE '${searchText}')`;
        }

        // query to fetch livestocks if Available, PrepareForMove OR Intransit
        if (selectedActivityStatus == null || (selectedActivityStatus && (selectedActivityStatus.SystemCode == livestockActivityStatusCodes.Available ||
            selectedActivityStatus.SystemCode == livestockActivityStatusCodes.PrepareForMove ||
            selectedActivityStatus.SystemCode == livestockActivityStatusCodes.InTransit || selectedActivityStatus.SystemCode == livestockActivityStatusCodes.Lost))) {
            // query for livestocks
            baseQuery = `
                select distinct SQL_CALC_FOUND_ROWS 
                ${filterObj.columns.join()},
                l.NumberOfHead, l.IsMob, l.Mob as MobName, l.InductionDate, l.BirthDate, s.UUID as SpeciesId, 
                l.CurrentWeight, m.SystemCode AS MaturityCode,
                l.AuditLogId, las.SystemCode AS ActivitySystemCode
                from livestock l
                left join species s on l.SpeciesId = s.Id
                left join maturity m on m.Id = l.MaturityStatusId
                left JOIN livestockactivitystatus las on l.ActivityStatusId = las.Id
                left join filestorage fm on s.MobIconFileId = fm.Id
                left join filestorage fi on s.IndFileIconId = fi.Id
                left join enclosure e on e.Id = l.CurrentEnclosureId
                ${joinQuery}
                where l.IsDeleted = 0 and l.NumberOfHead <> 0 and l.CurrentPropertyId = fn_UuidToBin('${propertyId}') ${searchQuery} 
                 ${topSearchQuery} ${groupByQuery}
                ORDER BY  ${sortColumn} ${sortOrder} ${pagingFilter};

                SELECT FOUND_ROWS() as Total;
                
                select count(1) as Total
                from livestock l
                ${newJoinQuery}
                where l.IsMob = 1 and l.IsDeleted = 0 and l.NumberOfHead <> 0 and l.CurrentPropertyId = fn_UuidToBin('${propertyId}') ${searchQuery} ${topSearchQuery};
                
                select sd1.SpeciesName, sum(l.NumberOfHead) as Total
                from livestock l
                left join speciesdata sd1 on l.SpeciesId = sd1.SpeciesId and sd1.Language = '${language}'
                ${newJoinQuery}
                where l.IsDeleted = 0 and l.NumberOfHead <> 0 and l.CurrentPropertyId = fn_UuidToBin('${propertyId}') ${searchQuery} ${topSearchQuery}
                group by sd1.SpeciesId;`;
        }
        if (selectedActivityStatus && (selectedActivityStatus.SystemCode == livestockActivityStatusCodes.Killed || selectedActivityStatus.SystemCode == livestockActivityStatusCodes.Deceased)) {
            // query for livestocks
            baseQuery = `
                select distinct SQL_CALC_FOUND_ROWS 
                ${filterObj.columns.join()},
                l.NumberOfHead, l.IsMob, l.Mob as MobName, l.InductionDate, l.BirthDate, s.UUID as SpeciesId, l.CurrentWeight, m.SystemCode AS MaturityCode,
                l.AuditLogId, las.SystemCode AS ActivitySystemCode
                from livestock l
                left join species s on l.SpeciesId = s.Id
                left join maturity m on m.Id = l.MaturityStatusId
                left JOIN livestockactivitystatus las on l.ActivityStatusId = las.Id
                left join filestorage fm on s.MobIconFileId = fm.Id
                left join filestorage fi on s.IndFileIconId = fi.Id
                left join enclosure e on e.Id = l.CurrentEnclosureId
                ${joinQuery}
                where l.IsDeleted = 0 and l.IsMob=0 and l.NumberOfHead <> 0 and l.CurrentPropertyId = fn_UuidToBin('${propertyId}') ${searchQuery} 
                 ${topSearchQuery} ${groupByQuery}
                UNION
                select 
                ${filterObj.columns.join()},
                abs(sum(mch.LivestockCount)) as NumberOfHead,l.IsMob, l.Mob as MobName, l.InductionDate, l.BirthDate, s.UUID as SpeciesId, l.CurrentWeight, m.SystemCode AS MaturityCode,
                l.AuditLogId,'${selectedActivityStatus.SystemCode}' as ActivitySystemCode
                from mobcounthistory mch
                join livestock l on l.Id = mch.LivestockId
                join livestockevent le on le.Id = mch.LivestockEventId
                join livestockpropertyhistory lph on lph.LivestockId = mch.LivestockId and lph.PropertyId = fn_UuidToBin('${propertyId}')
                left join species s on l.SpeciesId = s.Id
                left join maturity m on m.Id = l.MaturityStatusId
                left join filestorage fm on s.MobIconFileId = fm.Id
                left join filestorage fi on s.IndFileIconId = fi.Id
                left join enclosure e on e.Id = l.CurrentEnclosureId
                ${joinQuery}                
                where l.IsDeleted = 0 and l.IsMob=1 and mch.LivestockCount < 0 and le.EventDate >= lph.EntryDate and (le.EventDate <= lph.ExitDate or lph.ExitDate is null)
                 ${topSearchQuery}
                ORDER BY  ${sortColumn} ${sortOrder} ${pagingFilter};

                SELECT FOUND_ROWS() as Total;
                
                select count(DISTINCT l.Id) as Total
                from mobcounthistory mch
                join livestock l on l.Id = mch.LivestockId
                join livestockevent le on le.Id = mch.LivestockEventId
                join livestockpropertyhistory lph on lph.LivestockId = mch.LivestockId and lph.PropertyId = fn_UuidToBin('${propertyId}')
                ${newJoinQuery}
                where l.IsMob = 1 and l.IsDeleted = 0  and mch.LivestockCount < 0 and l.CurrentPropertyId = fn_UuidToBin('${propertyId}') ${searchQuery} ${topSearchQuery};
                
                select sd1.SpeciesName, sum(l.NumberOfHead - ifnull(mch.LivestockCount,0)) as Total
                from livestock l
                left join speciesdata sd1 on l.SpeciesId = sd1.SpeciesId and sd1.Language = '${language}'
                left join mobcounthistory mch on mch.LivestockId = l.Id
                ${newJoinQuery}
                where l.IsDeleted = 0  and (mch.LivestockCount < 0 or l.NumberOfHead <>0) and l.CurrentPropertyId = fn_UuidToBin('${propertyId}') ${searchQuery} ${topSearchQuery}                
                group by sd1.SpeciesId;`;
        }

        return models.sequelize.query(baseQuery).then(function (result) {
            let resultData = JSON.parse(JSON.stringify(result[0]));
            let response = {
                data: resultData[0],
                total: resultData[1][0].Total,
                mobCount: resultData[2][0].Total,
                livestockCount: sum(map(resultData[0], 'NumberOfHead')),
                livestockData: resultData[3]
            }
            return response;
        }).catch(function (err) {
            throw new Error(err);
        });
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get livestock details by livestockIds
let getById = (ids) => {
    // let livestockIds = ids.map((id) => {
    //     return uuidToBuffer(id);
    // });
    let resultData = {};
    return models.livestock.findAll({
        where: { UUID: ids }, raw: true,
        include: [{
            model: models.livestockattribute,
            as: 'livestockattribute'
        },
        {
            model: models.enclosure,
            attributes: ['EnclosureTypeId'],
            as: 'enclosure'
        }]
    }).then(function (result) {
        resultData.livestocks = result;
        if (ids.length == 1) {
            let query = `SELECT LivestockId AS LivestockId, BreedId AS BreedId,
                    Percentage FROM breedcomposition 
                    WHERE fn_BinToUuid(LivestockId) = '${ids[0]}'`;
            return models.sequelize.query(query);
        }
        else
            return true;
    }).then(function (result) {
        if (result.length > 0)
            resultData.breedComposition = JSON.parse(JSON.stringify(result[0]));
        return resultData;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// export livestock data as csv
let exportData = (filterObj, language) => {
    let joinQuery = generateJoinQuery(filterObj, language);
    filterObj = changeFilterObj(filterObj);

    let uuids = [];
    filterObj.uuid.map(id => {
        uuids.push(`'${id}'`);
    });

    let baseQuery = `select  
        ${filterObj.columns.join()}
        from livestock l
        ${joinQuery}
        where l.IsDeleted = 0 and l.NumberOfHead <> 0 and l.UUID in (${uuids.join()})
        group by l.Id;`;

    return models.sequelize.query(baseQuery).then(function (result) {
        let response = JSON.parse(JSON.stringify(result[0]));
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// generate dynamic search query for livestock display
function generateSearchQuery(filterObj) {
    let searchQuery = '';
    let { display, activityStatus, species, breed, speciesType, maturity, gender, category,
        enclosure, livestockOrigin, financierOwned, dropBirthYear, ltStatus, euStatus } = filterObj.filter;

    if (ltStatus == 1) searchQuery += ` and l.HasLT is null`;
    else if (ltStatus == 2) searchQuery += ` and l.HasLT = 1`;
    else if (ltStatus == 3) searchQuery += ` and l.HasLT = 2`;

    if (euStatus == 1) searchQuery += ` and l.HasEU is null`;
    else if (euStatus == 2) searchQuery += ` and l.HasEU = 1`;
    else if (euStatus == 3) searchQuery += ` and l.HasEU = 2`;

    if (display == 2) searchQuery += ' and l.IsMob = 0';
    else if (display == 3) searchQuery += ' and l.IsMob = 1';

    if (activityStatus) searchQuery += ` and l.ActivityStatusId = fn_UuidToBin('${activityStatus}')`;
    if (species) searchQuery += ` and l.SpeciesId = fn_UuidToBin('${species}')`;
    if (breed) searchQuery += ` and bc1.BreedId = fn_UuidToBin('${breed}')`;
    if (speciesType) searchQuery += ` and l.SpeciesTypeId = fn_UuidToBin('${speciesType}')`;
    if (maturity) searchQuery += ` and l.MaturityStatusId = fn_UuidToBin('${maturity}')`;
    if (gender) searchQuery += ` and l.GenderId = fn_UuidToBin('${gender}')`;
    if (category) searchQuery += ` and l.LivestockCategoryId = fn_UuidToBin('${category}')`;
    if (enclosure) searchQuery += ` and l.CurrentEnclosureId = fn_UuidToBin('${enclosure}')`;
    if (livestockOrigin) searchQuery += ` and l.LivestockOriginId = fn_UuidToBin('${livestockOrigin}')`;
    if (financierOwned) searchQuery += ` and l.IsFinancierOwned = 1`;
    if (dropBirthYear && dropBirthYear.length == 4) searchQuery += ` and EXTRACT(YEAR FROM l.BirthDate) = ${dropBirthYear}`;

    // if (includes(filterObj.columns, 'BreedComposition') || breed)
    //     searchQuery += ` GROUP BY l.Id`;

    return searchQuery;
}

// generate dynamic join query for livestock display
function generateJoinQuery(filterObj, language, searchText = null) {
    let joinQuery = ` `;
    let breed = filterObj.filter ? filterObj.filter.breed : null;
    let laColumns = ['la.EarmarkText', 'la.BrandText', 'la.LivestockOriginReference', 'la.LivestockOriginPIC',
        'la.IsPPSR', 'la.FinancierName', 'la.ManagementNo', 'la.ManagementGroup', 'la.NumberInBirth',
        'la.NumberInReared', 'la.BirthProductivity', 'la.Progeny', 'la.IsHGP', 'la.HGPText', 'la.EIDBatchNo',
        'la.LastMonthOfShearing', 'la.LastComment', 'la.AdditionalTag', 'la.FeedlotTag', 'la.BreederTag',
        'la.StudName', 'la.RegistrationDetail', 'la.WeighBridgeTicket', 'la.ReferenceId', 'la.Name', 'la.Appraisal',
        'la.SupplyChain', 'la.ReminderNote', 'la.ReminderDate', 'la.IsFreeMartin', 'la.DraftGroup',
        'dd.DentitionName', 'cgd.GroupName as ContemporaryGroupName', 'gsd.StatusName as GeneticStatusName',
        'csd.ScoreName as ConditionScoreName', 'lgd.GroupName as LivestockGroupName', 'lclsd.ClassificationName',
        'la.GeneticSireText', 'la.GeneticDamText', 'la.FosterDamText', 'la.RecipientDamText',
        'mgd.GroupName as MultiSireGroupName'];

    let isTopSearch = (searchText != null);

    if (intersection(filterObj.columns, laColumns).length != 0 || isTopSearch)
        joinQuery += ` left join livestockattribute la on la.LivestockId = l.Id`;

    // if (includes(filterObj.columns, 'e.Name as EnclosureName') || includes(filterObj.columns, 'etd.EnclosureTypeName') || isTopSearch)
    //     joinQuery += ` left join enclosure e on e.Id = l.CurrentEnclosureId`;

    if (includes(filterObj.columns, 'asd.StatusName as LivestockActivityStatus'))
        joinQuery += ` left join livestockactivitystatusdata asd on asd.ActivityStatusId = l.ActivityStatusId and asd.Language = '${language}'`;

    if (includes(filterObj.columns, 'sd.SpeciesName'))
        joinQuery += ` left join speciesdata sd on l.SpeciesId = sd.SpeciesId and sd.Language = '${language}'`;

    if (includes(filterObj.columns, 'std.SpeciesTypeName'))
        joinQuery += ` left join speciestypedata std on l.SpeciesTypeId = std.SpeciesTypeId and std.Language = '${language}'`;

    if (includes(filterObj.columns, 'md.MaturityName'))
        joinQuery += ` left join maturitydata md on l.MaturityStatusId = md.MaturityId and md.Language = '${language}'`;

    if (includes(filterObj.columns, 'gd.GenderName'))
        joinQuery += ` left join genderdata gd on l.GenderId = gd.GenderId and gd.Language = '${language}'`;

    if (includes(filterObj.columns, 'lcd.CategoryName'))
        joinQuery += ` left join livestockcategorydata lcd on l.LivestockCategoryId = lcd.LivestockCategoryId and lcd.Language = '${language}'`;

    if (includes(filterObj.columns, 'lcld.ColourName'))
        joinQuery += ` left join livestockcolourdata lcld on l.ColorId = lcld.LivestockColourId and lcld.Language = '${language}'`;

    if (includes(filterObj.columns, 'etd.EnclosureTypeName'))
        joinQuery += ` left join enclosuretypedata etd on e.EnclosureTypeId = etd.EnclosureTypeId and etd.Language = '${language}'`;

    if (includes(filterObj.columns, 'lod.OriginName'))
        joinQuery += ` left join livestockorigindata lod on lod.LivestockOriginId = l.LivestockOriginId and lod.Language = '${language}'`;

    if (includes(filterObj.columns, 'dd.DentitionName'))
        joinQuery += ` left join dentitiondata dd on dd.DentitionId = la.DentitionId and dd.Language = '${language}'`;

    if (includes(filterObj.columns, 'cgd.GroupName as ContemporaryGroupName'))
        joinQuery += ` left join contemporarygroupdata cgd on cgd.ContemporaryGroupId = la.ContemporaryId and cgd.Language = '${language}'`;

    if (includes(filterObj.columns, 'gsd.StatusName as GeneticStatusName'))
        joinQuery += ` left join geneticstatusdata gsd on gsd.GeneticStatusId = la.GeneticStatusId and gsd.Language = '${language}'`;

    if (includes(filterObj.columns, 'csd.ScoreName as ConditionScoreName'))
        joinQuery += ` left join conditionscoredata csd on csd.ConditionScoreId = la.ConditionScoreId and csd.Language = '${language}'`;

    if (includes(filterObj.columns, 'lgd.GroupName as LivestockGroupName'))
        joinQuery += ` left join livestockgroupdata lgd on lgd.LivestockGroupId = la.LivestockGroupId and lgd.Language = '${language}'`;

    if (includes(filterObj.columns, 'lclsd.ClassificationName'))
        joinQuery += ` left join livestockclassificationdata lclsd on lclsd.LivestockClassificationId = la.ClassificationId and lclsd.Language = '${language}'`;

    if (includes(filterObj.columns, 'la.GeneticSireText'))
        joinQuery += `  left join livestock lgs on lgs.Id = la.GeneticSireLivestockId`;

    if (includes(filterObj.columns, 'la.GeneticDamText'))
        joinQuery += `  left join livestock lgd1 on lgd1.Id = la.GeneticDamLivestockId`;

    if (includes(filterObj.columns, 'la.FosterDamText'))
        joinQuery += `  left join livestock lfd on lfd.Id = la.FosterDamLivestockId`;

    if (includes(filterObj.columns, 'la.RecipientDamText'))
        joinQuery += `  left join livestock lrd on lrd.Id = la.RecipientDamLivestockId`;

    if (includes(filterObj.columns, 'mgd.GroupName as MultiSireGroupName'))
        joinQuery += ` left join multisiregroupdata mgd on mgd.MultiSireGroupId = la.MultiSireGroup`;

    if (includes(filterObj.columns, 'BreedComposition') || breed)
        joinQuery += ` left join breedcomposition bc on bc.LivestockId = l.Id
                    left join breeddata bd on bd.BreedId = bc.BreedId`;
    if (breed)
        joinQuery += ` left join breedcomposition bc1 on bc1.LivestockId = l.Id`;

    return joinQuery;
}

// change column name for display 
function changeFilterObj(filterObj) {

    if (includes(filterObj.columns, 'la.GeneticSireText')) {
        filterObj.columns = filterObj.columns.map(c => {
            if (c == 'la.GeneticSireText')
                c = "if(la.GeneticSireLivestockId is null, la.GeneticSireText,(if(lgs.Identifier = 'EID', lgs.EID, if(lgs.Identifier = 'NLISID', lgs.NLISID, if(lgs.Identifier ='VisualTag', lgs.VisualTag, if(lgs.Identifier ='SocietyId', lgs.SocietyId, null)))))) as GeneticSireText";
            return c;
        });
    }
    if (includes(filterObj.columns, 'la.GeneticDamText')) {
        filterObj.columns = filterObj.columns.map(c => {
            if (c == 'la.GeneticDamText')
                c = "if(la.GeneticDamLivestockId is null, la.GeneticDamText,(if(lgd1.Identifier = 'EID', lgd1.EID, if(lgd1.Identifier = 'NLISID', lgd1.NLISID, if(lgd1.Identifier ='VisualTag', lgd1.VisualTag, if(lgd1.Identifier ='SocietyId', lgd1.SocietyId, null)))))) as GeneticDamText";
            return c;
        });
    }
    if (includes(filterObj.columns, 'la.FosterDamText')) {
        filterObj.columns = filterObj.columns.map(c => {
            if (c == 'la.FosterDamText')
                "if(la.FosterDamLivestockId is null, la.FosterDamText,(if(lfd.Identifier = 'EID', lfd.EID, if(lfd.Identifier = 'NLISID', lfd.NLISID, if(lfd.Identifier ='VisualTag', lfd.VisualTag, if(lfd.Identifier ='SocietyId', lfd.SocietyId, null)))))) as FosterDamText";
            return c;
        });
    }
    if (includes(filterObj.columns, 'la.RecipientDamText')) {
        filterObj.columns = filterObj.columns.map(c => {
            if (c == 'la.RecipientDamText')
                c = "if(la.RecipientDamLivestockId is null, la.RecipientDamText,(if(lrd.Identifier = 'EID', lrd.EID, if(lrd.Identifier = 'NLISID', lrd.NLISID, if(lrd.Identifier ='VisualTag', lrd.VisualTag, if(lrd.Identifier ='SocietyId', lrd.SocietyId, null)))))) as RecipientDamText";
            return c;
        });
    }
    if (includes(filterObj.columns, 'BreedComposition')) {
        filterObj.columns = filterObj.columns.map(c => {
            if (c == 'BreedComposition')
                c = 'GROUP_CONCAT(concat(bd.BreedName, " ", bc.Percentage) SEPARATOR " - ") BreedComposition';
            return c;
        });
    }
    if (includes(filterObj.columns, 'l.NumberOfHead as LivestockQuantity')) {
        filterObj.columns = filterObj.columns.map(c => {
            if (c == 'l.NumberOfHead as LivestockQuantity')
                c = 'if(l.IsMob = 1, l.NumberOfHead, "") as LivestockQuantity';
            return c;
        });
    }

    return filterObj;
}

// create multiple livestock record to DB
let bulkCreate = (obj, trans = null) => {
    return models.livestock.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// create multiple livestock attribute record to DB
let bulkCreateAttr = (obj, trans = null) => {
    return models.livestockattribute.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// create multiple livestockpropertyhistory attribute record to DB
let bulkCreatePropertyHistory = (obj, trans = null) => {
    return models.livestockpropertyhistory.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// create multiple livestockpropertyhistory attribute record to DB
let bulkCreateWeightHistory = (obj, trans = null) => {
    return models.livestockweighthistory.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// create multiple livestockstatushistory attribute record to DB
let bulkCreateStatusHistory = (obj, trans = null) => {
    return models.livestockstatushistory.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// create multiple livestockstatushistory attribute record to DB
let bulkCreateEnclosureHistory = (obj, trans = null) => {
    return models.livestockenclosurehistory.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// create multiple mobcounthistory attribute record to DB
let bulkCreateMobCountHistory = (obj, trans = null) => {
    return models.mobcounthistory.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// create multiple livestock tg replacement record to DB
let bulkCreateTagReplacementHistory = (obj, trans = null) => {
    return models.livestocktagreplacementhistory.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// create bulk data for recording scan result
let bulkCreateLivestockScanDetail = (obj, trans = null) => {
    return models.livestockscandetail.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// create multiple livestockevent attribute record to DB
let bulkCreateEvent = (obj, trans = null) => {
    return models.livestockevent.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

let getSireOrDamData = (speciesId, type, serachValue) => {
    let genderSystemCode, searchCondition;
    if (type == 'sire') {
        genderSystemCode = genderSystemCodes.filter((gsc) => {
            return gsc.Text == 'Male';
        })[0].Value
    }
    else {
        genderSystemCode = genderSystemCodes.filter((gsc) => {
            return gsc.Text == 'Female';
        })[0].Value
    }
    if (serachValue) {
        searchCondition = ` AND (l.EID like '%${serachValue}%' OR l.VisualTag like '%${serachValue}%' OR
        l.SocietyId like '%${serachValue}%' OR l.NLISID like '%${serachValue}%')`;
    }
    let query = ` SELECT EID, VisualTag, NLISID, SocietyId, l.UUID, l.Identifier FROM livestock l
            INNER JOIN gender g ON l.GenderId = g.Id
            WHERE SpeciesId = fn_UuidToBin('${speciesId}') AND g.SystemCode = '${genderSystemCode}' ${searchCondition}`;

    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update livestock record to DB
let updateLivestock = (obj, condition, trans = null) => {
    return models.livestock.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update livestock attribute record to DB
let updateLivestockAttr = (obj, condition, trans = null) => {
    return models.livestockattribute.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update livestock record to DB
let createLivestockScan = (obj, trans = null) => {
    return models.livestockscan.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

let checkReference = (livestockIds) => {
    return models.livestock.findAll({
        raw: true, where: { UUID: livestockIds, IsDeleted: 0, '$livestockenclosurehistory.Id$': null },
        include: [{
            required: false,
            model: models.livestockenclosurehistory,
            as: 'livestockenclosurehistory',
            attributes: []
        }],
        attributes: ['UUID']
    }).then(function (result) {
        let response = [];
        result.map((d) => {
            response.push(d.UUID);
        })
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get livestock details by conditions
let getByCondition = (condition, joins, columns) => {
    let baseQuery = `select ${columns} from livestock l ${joins} where l.IsDeleted = 0 and l.NumberOfHead <> 0 and ${condition};`;
    return models.sequelize.query(baseQuery).then(function (result) {
        let response = JSON.parse(JSON.stringify(result[0]));
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get livestockpropertyhistory latest entrydate record by LivestockId and PropertyId
let getLatestPropertyHistory = (condition, trans = null) => {
    let baseQuery = `
    SELECT p.UUID, p.LivestockId, p.PropertyId, MAX(p.EntryDate) AS EntryDate, p.CostOfFeed, p.QtyOfFeed, 
    p.EntryWeight, e.AuditLogId
    FROM livestockpropertyhistory p
    LEFT JOIN livestockevent e on p.LivestockEntryEventId = e.Id
	WHERE ${condition}
    GROUP BY p.LivestockId, p.PropertyId;
    `;
    return models.sequelize.query(baseQuery).then(function (result) {
        let response = JSON.parse(JSON.stringify(result[0]));
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get livestockenclosurehistory latest entrydate record by LivestockId and EnclosureId
let getLatestEnclosureHistory = (condition, trans = null) => {
    let baseQuery = `
    SELECT en.UUID, en.LivestockId, en.EnclosureId, MAX(en.EntryDate) AS EntryDate,
    en.EntryWeight, e.AuditLogId
    FROM livestockenclosurehistory en
    LEFT JOIN livestockevent e on en.LivestockEventId = e.Id
	WHERE ${condition}
    GROUP BY en.LivestockId, en.EnclosureId;
    `;
    return models.sequelize.query(baseQuery).then(function (result) {
        let response = JSON.parse(JSON.stringify(result[0]));
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update LivestockPropertyHistory record to DB
let updateLivestockPropertyHistory = (obj, condition, trans = null) => {
    return models.livestockpropertyhistory.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

let baseQuery = (language, livestockId) => {
    return `select l.UUID as Id,l.EID,l.VisualTag,l.SocietyId,l.NLISID,l.Mob as MobName,e.Name as EnclosureName, sd.SpeciesName, lsire.EID as Sire, ldam.EID as Dam from livestock l
    left join enclosure e on e.Id = l.CurrentEnclosureId
    left join species s on s.Id = l.SpeciesId
    left join speciesdata sd on sd.SpeciesId = s.Id and sd.Language='${language}'    
    left join livestockattribute la on la.LivestockId = l.Id
    left join livestock lsire on lsire.Id = la.GeneticSireLivestockId
    left join livestock ldam on ldam.Id = la.GeneticDamLivestockId
    where l.Id = fn_UuidToBin('${livestockId}'); `;
}

// get feed history of livestock from birth to death
let getFeedHistory = (language, livestockId) => {

    let livestockQuery = baseQuery(language, livestockId);
    let mainQuery = `
    select lfd.UUID as FeedDetailId,lf.DateOfFeed, f.Name as FeedType, lfd.FeedQty, lfd.FeedCost, IFNULL(lf.FeedPersonName,'') as FeededBy, IFNULL(p.PIC,'') as FeedOnPIC,
    l.UUID as LivestockId from livestockfeeddetail lfd
    inner join livestockfeed lf on lf.Id = lfd.LivestockFeedId
    inner join livestock l on l.Id = lfd.LivestockId
    inner join feed f on f.Id = lf.FeedId
    inner join property p on p.Id = lf.PropertyId
    where lf.IsDeleted = 0 and lfd.LivestockId = fn_UuidToBin('${livestockId}') 
    order by lf.DateOfFeed desc; `;

    return models.sequelize.query(livestockQuery + mainQuery, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        let livestock = JSON.parse((JSON.stringify(result[0][0])));
        let feed = JSON.parse(JSON.stringify(result[1]));
        let data = _map(feed, function (m) {
            return m;
        });
        return { livestock, data };
    }).catch(function (err) {
        throw new Error(err);
    });
}

let getLivestockTracebility = (language, livestockId) => {
    let livestockQuery = baseQuery(language, livestockId);
    let mainQuery = `
        select le.UUID as LivestockEventId, le.EventType as Event, le.EventDate as DateOfEvent,p.PIC, IFNULL(e.Name,'') as EnclosureName,IFNULL(le.Reference,'') as Reference from livestockevent le
        join Property p on p.Id = le.PropertyId
        join Enclosure e on e.Id = le.EnclosureId        
        where le.LivestockId = fn_UuidToBin('${livestockId}')
        order by le.EventDate desc;`;

    return models.sequelize.query(livestockQuery + mainQuery, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        let livestock = JSON.parse((JSON.stringify(result[0][0])));
        let feed = JSON.parse(JSON.stringify(result[1]));
        let data = _map(feed, function (m) {
            return m;
        });

        return { livestock, data };
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getLivestockDataSet: getDataSet,
    getLivestockById: getById,
    getSireOrDamData: getSireOrDamData,
    getLivestockByCondition: getByCondition,
    getLivestockFeedHistory: getFeedHistory,
    getLivestockTracebility: getLivestockTracebility,
    bulkCreateLivestock: bulkCreate,
    bulkCreateLivestockAttribute: bulkCreateAttr,
    bulkCreateLivestockPropertyHistory: bulkCreatePropertyHistory,
    bulkCreateLivestockWeightHistory: bulkCreateWeightHistory,
    bulkCreateLivestockStatusHistory: bulkCreateStatusHistory,
    bulkCreateLivestockEnclosureHistory: bulkCreateEnclosureHistory,
    bulkCreateMobCountHistory: bulkCreateMobCountHistory,
    bulkCreateTagReplacementHistory: bulkCreateTagReplacementHistory,
    bulkCreateLivestockEvent: bulkCreateEvent,
    bulkCreateLivestockScanDetail: bulkCreateLivestockScanDetail,
    createLivestockScan: createLivestockScan,
    exportLivestock: exportData,
    updateLivestock: updateLivestock,
    updateLivestockAttr: updateLivestockAttr,
    checkLivestockReference: checkReference,
    getLatestLivestockPropertyHistory: getLatestPropertyHistory,
    getLatestLivestockEnclosureHistory: getLatestEnclosureHistory,
    updateLivestockPropertyHistory: updateLivestockPropertyHistory
}