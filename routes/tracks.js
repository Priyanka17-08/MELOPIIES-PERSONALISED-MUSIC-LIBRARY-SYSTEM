const router = require('express').Router();
const c = require('../controllers/trackController');
const { authenticate } = require('../middleware/auth');

router.get('/',          authenticate, c.getAll);
router.get('/:id',       authenticate, c.getOne);
router.post('/',         authenticate, c.create);
router.put('/:id',       authenticate, c.update);
router.delete('/:id',    authenticate, c.remove);
router.post('/:id/play', authenticate, c.incrementPlay);

module.exports = router;
