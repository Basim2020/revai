import express from 'express';
import { RevAiApiClient } from 'revai-node-sdk';
import multer from 'multer';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';

const app = express();
//const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

const upload = multer({ dest: 'uploads/' });
const revaiClient = new RevAiApiClient('02-W52uDvCys1Zd62eLIufgk1XBHWPwCZfqsjtGcQ9yR1exjUlhdtKMVxt0L-xILaRJuOAWsxmWcnNOqX0p6KybV4JuvM');

app.post('/api/revai', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;
  const { metadata, language } = req.body;


  try {
    const response = await revaiClient.submitJobLocalFile(filePath, { metadata , language });
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  } finally {
    fs.unlinkSync(filePath);
  }
});

app.get('/api/revai/:id', async (req, res) => {
  const jobId = req.params.id;

  try {
    const jobDetails = await revaiClient.getJobDetails(jobId);
    if (jobDetails.status === 'transcribed') {
      const transcript = await revaiClient.getTranscriptObject(jobId);
      res.json(transcript);
    } else {
      res.json(jobDetails);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

//app.listen(port, () => {
  //console.log(`Proxy server running at http://localhost:${port}`);
//});
