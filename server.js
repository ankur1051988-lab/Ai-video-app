const express = require('express');
const cors = require('cors');
const Replicate = require('replicate');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.post('/api/generate-video', async (req, res) => {
  try {
    const { prompt, imageUrl } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    // Minimax Video-01 Model (Fast & High Quality Text-to-Video)
    const inputConfig = {
      prompt: prompt,
    };

    if (imageUrl && imageUrl.trim() !== '') {
      inputConfig.first_frame_image = imageUrl.trim();
    }

    const output = await replicate.run("minimax/video-01", {
      input: inputConfig
    });

    // Replicate output stream/URL extraction
    let finalVideoUrl = output;
    if (Array.isArray(output)) {
      finalVideoUrl = output[0];
    } else if (typeof output === 'object' && output.url) {
      finalVideoUrl = typeof output.url === 'function' ? output.url() : output.url;
    }

    res.json({
      success: true,
      videoUrl: String(finalVideoUrl)
    });

  } catch (error) {
    console.error('Error generating video:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate video'
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
