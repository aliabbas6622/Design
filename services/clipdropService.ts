export const generateImageWithClipDrop = async (apiKey: string, prompt: string): Promise<string> => {
  console.log('ClipDrop: Generating image for prompt:', prompt);
  console.log('ClipDrop: API key provided:', apiKey ? 'Yes' : 'No');
  
  if (!apiKey) throw new Error("ClipDrop API key is missing.");
  
  const fullPrompt = `A vibrant, colorful, dreamy digital artwork representing '${prompt}'. Rich saturated colors, bright hues, magical atmosphere, fantasy art style, vivid and eye-catching, beautiful lighting.`;
  
  const formData = new FormData();
  formData.append('prompt', fullPrompt);
  
  console.log('ClipDrop: Making API request...');
  const response = await fetch('https://clipdrop-api.co/text-to-image/v1', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
    },
    body: formData,
  });
  
  console.log('ClipDrop: Response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('ClipDrop API error:', response.status, errorText);
    throw new Error(`ClipDrop API error: ${response.status} - ${errorText}`);
  }
  
  const imageBlob = await response.blob();
  console.log('ClipDrop: Image blob size:', imageBlob.size);
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(',')[1];
      console.log('ClipDrop: Base64 data length:', base64Data.length);
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageBlob);
  });
};