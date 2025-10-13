const {RegionService} = require('../services/ServiceContainer');
const {info, errorV2: errorLog} = require('../../helper/Logging');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const { PartnerService, UserService } = require('../services/ServiceContainer');
const { sequelize } = require('../../models');

class RegisterController {
    getProvince = (req, res) => {
        let search = (req.query.search) ? req.query.search : '';

        RegionService.getProvince(search)
        .then(result => {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: result,
                    error: null
                })
        })
        .catch(err => {
            errorLog(`GET PROVINCE`, err.message)

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        })
    }

    getCity = (req, res) => {
        let search = (req.query.search) ? req.query.search : '';
        let provinceId = (req.params.province_id) ? req.params.province_id : null;

        if (provinceId == null) {
            res.status(403)
                .json({
                    status: 'failed',
                    message: 'province id not found!',
                    data: null,
                    error: null
                });

            return;
        }

        RegionService.getCity(search, provinceId)
        .then(result => {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: result,
                    error: null
                })
        })
        .catch(err => {
            errorLog(`GET CITY`, `province_id: ${req.params} ${err.message}`)

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        })
    }

    getKecamatan = (req, res) => {
        let search = (req.query.search) ? req.query.search : '';
        let kotaId = (req.params.kota_id) ? req.params.kota_id : null;

        if (kotaId == null) {
            res.status(403)
                .json({
                    status: 'failed',
                    message: 'kota_id not found!',
                    data: null,
                    error: null
                });

            return;
        }

        RegionService.getKecamatan(search, kotaId)
        .then(result => {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: result,
                    error: null
                })
        })
        .catch(err => {
            errorLog('GET KECAMATAN', err.message)

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        })
    }

    getKelurahan = (req, res) => {
        let search = (req.query.search) ? req.query.search : '';
        let kecId = (req.params.kecamatan_id) ? req.params.kecamatan_id : null;

        if (kecId == null) {
            res.status(403)
                .json({
                    status: 'failed',
                    message: 'kecamatan_id not found!',
                    data: null,
                    error: null
                });

            return;
        }

        RegionService.getKelurahan(search, kecId)
        .then(result => {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: result,
                    error: null
                })
        })
        .catch(err => {
            errorLog('GET KELURAHAN', err.message)

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        })
    }

    registerEndUser = async (req, res) => {
        let transaction = await sequelize.transaction();

        try {
            let entityId = [1, 2, 3];
            let { dataValues: idUser } = await UserService.retrieveDataUserId();

            let dataPartner = await this.generateDataPartner(req.body, entityId);
            let dataHeaderGrouping = await this.generateHeaderGrouping(req.body);
            // let dataAddressPartner = await this.generateDataAddressPartner(req.body, dataPartner, entityId);
            // let dataContactPartner = this.generateDataContactPartner(req.body, dataAddressPartner);
            let dataDetailGrouping = await this.generateDetailGrouping(dataHeaderGrouping, dataPartner);
            let dataUser = this.bodyUser(idUser.user_id, req.body.usernama, req.body.password, req.body.email, req.body.phone_number, dataPartner[0].ptnr_id);

            // create data partner
            await PartnerService.insertDataPartner(dataPartner, transaction);

            // insert data address partner & header grouping
            await Promise.all([
                // PartnerService.insertDataAddressPartner(dataAddressPartner, transaction),
                PartnerService.insertDataHeaderGrouping(dataHeaderGrouping, transaction),
            ]);

            // insert data contact partner & detail grouping
            await Promise.all([
                // PartnerService.insertDataContactPartner(dataContactPartner, transaction),
                PartnerService.insertDataDetailGrouping(dataDetailGrouping, transaction)
            ]);

            // register data user
            await UserService.registerUser(dataUser, transaction);

            info('REGISTER END USER', `success register new user: ${req.body.partner_name}`, null);

            await transaction.commit();

            res.status(200)
                .json({
                    status: 'success',
                    message: 'registered!',
                    data: null,
                    error: null
                });
        } catch (error) {
            await transaction.rollback();
            await errorLog('INSERT NEW USER', error.message);

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: error.message
                });
        }
    }

    generateDataPartner = async (dataBody, dataEntity) => {
        let result = [];
        
        for (const dataEntityId of dataEntity) {
            let {dataValues: dataPartnerId} = await PartnerService.retrieveDataPartnerIdByEntity(dataEntityId);
            let partnerCode = `CUEM${dataEntityId}0${dataPartnerId.partner_id.toString().substring(1)};`
            let partnerName = '';

            switch (dataEntityId) {
                case 1:
                    partnerName = `${dataBody.usernama}`
                    break;
                case 2:
                    partnerName = `${dataBody.usernama} DMZ`
                    break;
                case 3:
                    partnerName = `${dataBody.usernama} UPM`
                    break;
            }

            result.push({
                ptnr_oid: uuidv4(),
                ptnr_dom_id: 1,
                ptnr_en_id: dataEntityId,
                ptnr_add_by: 'enduser mutif.biz.id',
                ptnr_add_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                ptnr_id: dataPartnerId.partner_id,
                ptnr_code: partnerCode,
                ptnr_name: partnerName,
                ptnr_ptnrg_id: 9916,
                ptnr_is_cust: 'Y',
                ptnr_is_vend: 'N',
                ptnr_active: 'Y',
                ptnr_dt: moment().format('YYYY-MM-DD HH:mm:ss'),
                ptnr_ac_ar_id: 0,
                ptnr_sb_ar_id: 0,
                ptnr_cc_ar_id: 0,
                ptnr_ac_ap_id: 0,
                ptnr_sb_ap_id: 0,
                ptnr_cc_ap_id: 0,
                ptnr_cu_id: 1,
                ptnr_limit_credit: 0,
                ptnr_is_member: 'Y',
                ptnr_is_emp: 'Y',
                ptnr_is_writer: 'N',
                ptnr_transaction_code_id: 9914,
                ptnr_is_ps: 'N',
                ptnr_start_periode: moment().format('YYYYMMDD'),
                ptnr_is_bm: 'N',
                ptnr_goldarah: 991221,
                ptnr_negara: 991227,
                ptnr_bp_date: moment().format('YYYY-MM-DD'),
                ptnr_bp_type: 991226,
                ptnr_is_volunteer: 'N',
                ptnr_is_sbm: 'N',
                ptnr_area_id: 1,
                ptnr_process: 'N',
                ptnr_phone_number: dataBody.phone_number
            })
        }

        return result;
    }

    generateDataAddressPartner = async (dataBody, dataPartner, dataEntity) => {
        let result = [];

        for (const dataEntityId of dataEntity) {
            let [ oidPartner ] = dataPartner.find(item => item.ptnr_en_id == dataEntityId);
            let { dataValues: dataAddressId } = await PartnerService.retrieveDataAddressIdByEntity(dataEntityId);

            result.push({
                ptnra_oid: uuidv4(),
                ptnra_id: dataAddressId.address_id,
                ptnra_dom_id: 1,
                ptnra_en_id: dataEntityId,
                ptnra_add_by: 'enduser',
                ptnra_add_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                ptnra_line: 201,
                ptnra_line_1: dataBody.kecamatan,
                ptnra_line_2: dataBody.kotakabupaten,
                ptnr_line_3: dataBody.provinsi,
                ptnra_phone_1: dataBody.no_hp_1,
                ptnra_phone_2: dataBody.no_hp_2 || '-',
                ptnra_fax_1: '-',
                ptnra_fax_2: '-',
                ptnra_zip: '-',
                ptnra_ptnr_oid: oidPartner.ptnr_oid,
                ptnra_addr_type: 992,
                ptnra_comment: '-',
                ptnra_active: 'Y',
                ptnra_dt: moment().format('YYYY-MM-DD'),
                ptnra_address: dataBody.alamat_lengkap
            })
        }

        return result;
    }

    generateDataContactPartner = (dataBody, dataAddress) => {
        let result = [];
        let baseSequence = 1;

        for (const singularDataAddress of dataAddress) {
            result.push({
                ptnrac_oid: uuidv4(),
                addrc_ptnra_oid: singularDataAddress.ptnra_oid,
                ptnrac_add_by: 'enduser',
                ptnrac_add_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                ptnrac_seq: baseSequence,
                ptnrac_function: 9945,
                ptnrac_contact_name: dataBody.nama_kontak,
                ptnrac_phone_1: dataBody.no_hp_1 || '-',
                ptnrac_phone_2: dataBody.no_hp_2 || '-',
                ptnrac_email: dataBody.email || '-',
                ptnrac_dt: moment().format('YYYY-MM-DD HH:mm:ss'),
            })
        }
    }

    generateDataLocationPartner = async (dataPartner) => {
        let result = [];

        for (const singularDataPartner of dataPartner) {
            let { dataValues: dataLocationId } = await PartnerService.retrieveDataLocationIdByEntity(singularDataPartner.ptnr_en_id);
            let warehouseId = null;

            switch (singularDataPartner.ptnr_en_id) {
                case 1:
                    warehouseId = null;
                    break;
                case 2:
                    
                    break;
                case 3:
                    
                    break;
            }

            result.push({
                loc_oid: uuidv4(),
                loc_dom_id: 1,
                loc_en_id: singularDataPartner.ptnr_en_id,
                loc_add_by: 'enduser',
                loc_add_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                loc_id: dataLocationId.location_id,
            })
        }
    }

    generateHeaderGrouping = async (dataBody) => {
        let baseCode = '0000000';
        let yearMonthCode = moment().format('YYMM');
        let [ totalAddedDataGroup, groupId ] = await Promise.all([PartnerService.countAddedGrouping(), PartnerService.retrieveDataGroupId()]);
        const incremented = parseInt(baseCode, 10) + totalAddedDataGroup;
        const resultBaseCode = incremented.toString().padStart(baseCode.length, '0');
        

        let result = {
            dbg_oid: uuidv4(),
            dbg_code: `DBG${yearMonthCode}${resultBaseCode}`,
            dbg_remarks: 'enduser registered',
            dbg_add_by: 'enduser',
            dbg_add_date: moment().format('YYYY-MM-DD HH:mm:ss'),
            dbg_desc: `Group Transaksi ${dataBody.partner_name}`,
            dbg_ptnrg_id: 9916,
            dbg_id: groupId.dataValues.group_id
        }

        return result;
    }

    generateDetailGrouping = async (dataHeaderGrouping, dataPartner) => {
        let result = [];

        for (const singularDataPartner of dataPartner) {
            result.push({
                dbgd_oid: uuidv4(),
                dbgd_dbg_oid: dataHeaderGrouping.dbg_oid,
                dbgd_en_id: singularDataPartner.ptnr_en_id,
                dbgd_ptnr_id: singularDataPartner.ptnr_id,
                dbgd_dbg_id: dataHeaderGrouping.dbg_id,
            })
        }

        return result;
    }

    bodyUser = (idUser, userName, passWord, email, phone, partnerId) => {
        let result = {
            userid: idUser,
            userkode: '-',
            usernama: userName,
            password: passWord,
            groupid: 2,
            id_karyawan: -1,
            time_reminder: 1,
            en_id: 1,
            useractive: 'Y',
            useremail: email,
            userphone: phone,
            user_ptnr_id: partnerId,
            user_ptnrg_id: 9916,
            created_at: moment().format('YYYY-MM-DD HH:mm:ss')
        }

        return result;
    }
}

module.exports = new RegisterController();