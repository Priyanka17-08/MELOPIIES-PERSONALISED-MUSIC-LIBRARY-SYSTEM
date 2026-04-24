const router = require('express').Router();
const c = require('../controllers/artistController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/',       authenticate, c.getAll);
router.get('/:id',    authenticate, c.getOne);
router.post('/',      authenticate, requireAdmin, c.create);
router.put('/:id',    authenticate, requireAdmin, c.update);
router.delete('/:id', authenticate, requireAdmin, c.remove);

module.exports = router;