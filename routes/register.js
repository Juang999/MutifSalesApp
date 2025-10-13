const {Router} = require('express');
const router = Router();
const {getProvince, getCity, getKecamatan, getKelurahan, registerEndUser} = require('../app/controllers/RegisterController');

router.get('/province', getProvince);
router.get('/:province_id/city', getCity);
router.get('/:kota_id/regency', getKecamatan);
router.post('/register-end-user', registerEndUser);
router.get('/:kecamatan_id/sub-regency', getKelurahan);

module.exports = router;