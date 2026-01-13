/**
 * Nano Banana (Gemini 2.5 Flash Image) API Client
 * Author: Ateeq Shaikh (via Gemini)
 */

const API_KEY = ""; // The environment provides the key at runtime, or paste yours here for local testing.
const MODEL_ID = "gemini-2.5-flash-image-preview";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${API_KEY}`;

/**
 * Generates an image using the Nano Banana model with exponential backoff.
 * @param {string} prompt - The text description of the image you want.
 * @returns {Promise<string|null>} - Base64 image data or null if failed.
 */
async function generateNanoBananaImage(prompt) {
  const payload = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      responseModalities: ["IMAGE"]
    }
  };

  let delay = 1000; // Starting delay: 1s
  const maxRetries = 5;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "API Request Failed");
      }

      const result = await response.json();
      
      // Extract the base64 image data from the response
      const base64Data = result.candidates?.[0]?.content?.parts?.find(
        (p) => p.inlineData
      )?.inlineData?.data;

      if (!base64Data) {
        throw new Error("No image data returned from Nano Banana.");
      }

      return base64Data;

    } catch (error) {
      if (i === maxRetries) {
        console.error("Max retries reached. Final Error:", error.message);
        return null;
      }
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
}

// --- Example Usage ---
async function runExample() {
  const prompt = "A futuristic cyberpunk city with neon signs in the shape of bananas, 4k, cinematic lighting";
  console.log("Requesting image from Nano Banana...");
  
  const base64Image = await generateNanoBananaImage(prompt);
  
  if (base64Image) {
    console.log("Image generated successfully!");
    // In a browser, you could display it:
    // document.getElementById('myImage').src = `data:image/png;base64,${base64Image}`;
    console.log("Base64 string (first 50 chars):", base64Image.substring(0, 50) + "...");
  } else {
    console.log("Failed to generate image.");
  }
}

runExample();