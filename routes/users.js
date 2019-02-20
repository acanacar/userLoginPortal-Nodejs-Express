const express = require('express')
const router = express.Router()

/* Log a user out */
router.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

module.exports = router

//https://dev-135388.oktapreview.com

//0oajfp0izwa0PMIqD0h7

//apl_c6PQBYM0YKjFLm0iMfZArKxmVqnjPVauliVz

//009ngOv6Ew95zhgwRMXuR-31_wE1UKpTv_wiKkEqdd
