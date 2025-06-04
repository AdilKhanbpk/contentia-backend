// New DDM conversion tracking endpoint
import express from 'express';
import axios from 'axios';

const trackingRoutes = express.Router();
router.post('/track-conversion', async (req, res) => {
  const { action, customData } = req.body; // e.g., action: "signup", customData: { u1: "user123" }

  if (!action) {
    return res.status(400).json({ error: 'Action is required' });
  }

  const orderId = Date.now().toString(); // Unique order ID
  const url = `https://ad.doubleclick.net/ddm/s2s/appactivity/src=${process.env.DDM_SRC};cat=${process.env.DDM_CAT};type=conv;ord=${orderId};u1=${customData?.u1 || ''}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.DDM_TOKEN || ''}`,
      },
    });
    res.json({
      success: true,
      attributed: response.data.attributed,
      details: response.data,
    });
  } catch (error) {
    console.error('DDM Error:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.response?.data || 'Failed to track conversion' });
  }
});
export default trackingRoutes;
