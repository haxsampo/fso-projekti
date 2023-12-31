require('dotenv').config()
const { spawn } = require('child_process')
const { getLastUpdate } = require('../utils/helpfuncs')
const router = require('express').Router()
const fs = require('fs')

router.get('/winsagainst/', async(req, res)=> {
  const {civ1, civ2} = req.query
  var matchResults = JSON.parse(fs.readFileSync('./data/result.json', 'utf8'))
  let res1 = matchResults[civ1][civ2]
  let res2 = matchResults[civ2][civ1]
  res.send({'civ1wins':res1, 'civ2wins':res2})
})

router.get('/update/', async(req, res)=> {
  if (!process.env.UPDATE_SECRET === req.body.UPDATE_SECRET) {
    return res.status(401)
  }
  const pythonProcess = spawn('python', ['../matches_update/matchupdater.py'], {
    cwd: __dirname,
  });

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Python stdout: ${data}`)
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python stderr: ${data}`)
  });
  
  pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`)
    if (code === 0) {
      res.status(200).send('Python script completed successfully')
    } else {
      res.status(500).send('Python script failed')
    }
  })
})

router.get('/version', async (req, res)=> { 
  let version = await getLastUpdate()
  res.send({'version':version})
})

module.exports = router