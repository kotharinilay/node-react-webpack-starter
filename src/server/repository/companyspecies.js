'use strict';

/*************************************
 * database interaction methods related to 
 * 'companyspecies' table
 * *************************************/

import models from '../schema';

// create multiple company species record to DB
let bulkCreate = (obj, trans = null) => {
    return models.companyspecies.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all company species record
let getAllDetails = (language, companyId) => {

    let baseQuery = `
        
        select Id, Language, SpeciesName, SpeciesCode from view_species
        where Language = '${language}';

                
        select distinct r.UUID as Id, r.Name as RegionName
        from company c
        left join company r on r.CompanyId = c.Id and r.CompanyType = 'R'
        where c.UUID = '${companyId}' and c.IsDeleted = 0 and r.IsDeleted=0;


        select distinct b.UUID as Id, b.Name as BusinessName, r.UUID as RegionId, r.Name as RegionName
        from company c
        left join company r on r.CompanyId = c.Id and r.CompanyType = 'R'
        left join company b on b.RegionId = r.Id and b.CompanyType = 'B'
        where c.UUID = '${companyId}' and c.IsDeleted = 0 and r.IsDeleted=0 and b.IsDeleted=0 and b.UUID is not null;


        select distinct p.UUID as Id, p.PIC, p.Name, 
        r.UUID as RegionId, r.Name as RegionName, b.UUID as BusinessId, b.Name as BusinessName
        from property p
        left join company b on b.Id = p.CompanyId and b.CompanyType = 'B'
        left join company c on (c.Id = p.CompanyId OR c.Id = b.CompanyId ) and c.CompanyType = 'C'
        left join company r on r.Id = b.RegionId and r.CompanyType = 'R'
        where p.IsDeleted=0 and c.IsDeleted = 0
        and (c.UUID = '${companyId}' or b.UUID = '${companyId}');
        

        select cs.IsExclude, s.UUID as SpeciesId, c.UUID as CompanyId, r.UUID as RegionId, b.UUID as BusinessId,
        p.UUID as PropertyId, rp.UUID as PRId, bp.UUID as PBId
        from companyspecies cs
        left join species s on s.Id = cs.SpeciesId
        left join company c on cs.CompanyId = c.Id and c.CompanyType = 'C'
        left join company r on cs.RegionId = r.Id and r.CompanyType = 'R'
        left join company b on cs.BusinessId = b.Id and b.CompanyType = 'B'
        left join property p on cs.PropertyId = p.Id
        left join company bp on bp.Id = p.CompanyId and bp.CompanyType = 'B'
        left join company cp on (cp.Id = p.CompanyId OR cp.Id = bp.CompanyId ) and cp.CompanyType = 'C'
        left join company rp on rp.Id = bp.RegionId and rp.CompanyType = 'R'
        where cs.CompanyId = fn_UuidToBin('${companyId}');
        `;

    return models.sequelize.query(baseQuery).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result[0]));
        let response = {
            species: resultData[0],
            region: resultData[1],
            business: resultData[2],
            property: resultData[3],
            result: resultData[4]
        }
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// delete company species records from DB
let remove = (condition, trans = null) => {
    return models.companyspecies.destroy({ where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getCompanySpeciesDetails: getAllDetails,
    createCompanySpecies: bulkCreate,
    removeCompanySpecies: remove
}