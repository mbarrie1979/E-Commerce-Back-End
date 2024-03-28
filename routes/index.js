const router = require('express').Router();
const apiRoutes = require('./api');

router.use('/api', apiRoutes);
// router.use('/api', (req, res, next) => {
//   console.log(`API Request Received: ${req.method} ${req.originalUrl}`);
//   next(); // Pass control to the next handler, including your apiRoutes
// });
router.use((req, res) => {
  res.send("<h1>Wrong Route!</h1>")
});

module.exports = router;