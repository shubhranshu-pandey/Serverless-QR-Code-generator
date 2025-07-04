// Lambda endpoint for QR code generation
const lambdaUrl = "https://mf5unwipcjuei5j7jylt6bnyay0akvaj.lambda-url.us-east-1.on.aws/";

// DOM Elements
const generateBtn = document.getElementById('generateBtn');
const urlInput = document.getElementById('urlInput');
const qrImage = document.getElementById('qrImage');
const errorDiv = document.getElementById('error');
const loadingDiv = document.getElementById('loading');

// Event handler for QR code generation
generateBtn.onclick = async function () {
  // Get and validate URL input
  const url = urlInput.value.trim();
  errorDiv.textContent = '';
  qrImage.style.display = 'none';

  if (!url) {
    errorDiv.textContent = 'Please enter a URL.';
    return;
  }

  // Show loading state
  loadingDiv.style.display = 'block';
  generateBtn.disabled = true;

  try {
    // Send POST request to Lambda function
    const response = await fetch(lambdaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    if (!response.ok) throw new Error('Failed to generate QR code.');

    const data = await response.json();
    if (!data.qr_code_url) throw new Error('No QR code URL returned.');

    // Display the generated QR code
    qrImage.src = data.qr_code_url;
    qrImage.style.display = 'block';
  } catch (err) {
    // Show error message
    errorDiv.textContent = err.message;
  } finally {
    // Reset loading state
    loadingDiv.style.display = 'none';
    generateBtn.disabled = false;
  }
}; 