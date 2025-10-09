const express = require('express');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.get('/ping', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

router.get('/headers', (req, res) => {
  res.json({ headers: req.headers });
});

router.get('/session', (req, res) => {
  res.json({ session: req.session });
});

router.get('/jwt', authenticate, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;


