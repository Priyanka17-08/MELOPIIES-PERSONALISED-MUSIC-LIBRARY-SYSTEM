const { authenticate, requireAdmin } = require('../middleware/auth');

const albumRouter = require('express').Router();
const ac = require('../controllers/albumController');
albumRouter.get('/',       authenticate, ac.getAll);
albumRouter.get('/:id',    authenticate, ac.getOne);
albumRouter.post('/',      authenticate, requireAdmin, ac.create);
albumRouter.put('/:id',    authenticate, requireAdmin, ac.update);
albumRouter.delete('/:id', authenticate, requireAdmin, ac.remove);
module.exports.albumRouter = albumRouter;

const playlistRouter = require('express').Router();
const pc = require('../controllers/playlistController');
playlistRouter.get('/',                       authenticate, pc.getAll);
playlistRouter.get('/:id',                    authenticate, pc.getOne);
playlistRouter.post('/',                      authenticate, pc.create);
playlistRouter.put('/:id',                    authenticate, pc.update);
playlistRouter.delete('/:id',                 authenticate, pc.remove);
playlistRouter.post('/:id/tracks',            authenticate, pc.addTrack);
playlistRouter.delete('/:id/tracks/:trackId', authenticate, pc.removeTrack);
module.exports.playlistRouter = playlistRouter;

const favoriteRouter = require('express').Router();
const fc = require('../controllers/favoriteController');
favoriteRouter.get('/',            authenticate, fc.getFavorites);
favoriteRouter.post('/:trackId',   authenticate, fc.addFavorite);
favoriteRouter.delete('/:trackId', authenticate, fc.removeFavorite);
module.exports.favoriteRouter = favoriteRouter;

const searchRouter = require('express').Router();
const sc = require('../controllers/searchController');
searchRouter.get('/', authenticate, sc.search);
module.exports.searchRouter = searchRouter;

const analyticsRouter = require('express').Router();
const an = require('../controllers/analyticsController');
analyticsRouter.get('/top-tracks',          authenticate, an.topTracks);
analyticsRouter.get('/genre-preferences',   authenticate, an.genrePreferences);
analyticsRouter.get('/most-active-artists', authenticate, an.mostActiveArtists);
analyticsRouter.get('/listening-history',   authenticate, an.listeningHistory);
module.exports.analyticsRouter = analyticsRouter;