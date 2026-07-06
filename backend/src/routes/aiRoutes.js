const express = require('express');
const axios = require('axios');

const router = express.Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

async function callAi(path, payload) {
  const response = await axios.post(`${AI_SERVICE_URL}${path}`, payload, {
    timeout: 8000,
  });
  return response.data;
}

router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/`, { timeout: 3000 });
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Khong the ket noi AI Service',
      detail: error.message,
    });
  }
});

router.post('/suggest-slots', async (req, res) => {
  try {
    const data = await callAi('/api/optimize/suggest-slots', req.body);
    res.json({ success: true, data });
  } catch (error) {
    res.status(502).json({ success: false, message: error.message });
  }
});

router.post('/study-plan', async (req, res) => {
  try {
    const data = await callAi('/api/study-plan/allocate', req.body);
    res.json({ success: true, data });
  } catch (error) {
    res.status(502).json({ success: false, message: error.message });
  }
});

router.post('/habits/learn', async (req, res) => {
  try {
    const data = await callAi('/api/habits/learn', req.body);
    res.json({ success: true, data });
  } catch (error) {
    res.status(502).json({ success: false, message: error.message });
  }
});

router.post('/reports/burnout/anonymize', async (req, res) => {
  try {
    const data = await callAi('/api/reports/burnout/anonymize', req.body);
    res.json({ success: true, data });
  } catch (error) {
    res.status(502).json({ success: false, message: error.message });
  }
});

module.exports = router;
