const express = require('express');
const Replicate = require('replicate');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files (index.html)
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Replicate API Key
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.post('/api/generate-video', async (req, res) => {
  const { imageUrl, prompt } = req.body;

  try {
    const output = await replicate.run(
      "stability-ai/stable-video-diffusion:3f045762d48284e31e54e15264b912f2043f1146c825480749003328e945c26b",
      {
        input: {
          input_image: imageUrl || "https://replicate.delivery/pbxt/IJL1Z2.../input.png",
          motion_bucket_id: 127,
          fps: 6
        }
      }
    );

    res.json({ success: true, videoUrl: output[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
