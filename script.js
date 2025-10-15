// Lambda endpoint for QR code generation
const lambdaUrl = "https://qjzteoc2yejjeqi443rzpjnwq40ddfvq.lambda-url.eu-north-1.on.aws/";

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

    if (!response.ok) throw new Error('Failed to generate QR code (server error).');

    // Try to parse expected Lambda-style response safely
    let lambdaResponse = null;
    try {
      lambdaResponse = await response.json();
    } catch (e) {
      // not JSON, fall through
      lambdaResponse = null;
    }

    let data = null;
    if (lambdaResponse && lambdaResponse.body) {
      try {
        data = JSON.parse(lambdaResponse.body);
      } catch (e) {
        // body wasn't stringified JSON, use as-is
        data = lambdaResponse.body;
      }
    } else if (lambdaResponse && lambdaResponse.qr_code_url) {
      data = lambdaResponse;
    } else {
      // Attempt to read plain text / fallback
      try {
        const text = await response.text();
        if (text) data = { qr_code_url: text };
      } catch (e) {
        data = null;
      }
    }

    // If we have a usable QR URL, display it
    if (data && data.qr_code_url) {
      qrImage.src = data.qr_code_url;
      qrImage.style.display = 'block';
      errorDiv.textContent = '';
    } else {
      throw new Error('No QR code URL returned from server.');
    }
  } catch (err) {
    // If server call failed (network/CORS/etc), fall back to client-side QR via Google Chart API
    const fallbackMsg = 'Server generate failed, using client-side fallback.';
    console.warn(fallbackMsg, err);
    errorDiv.textContent = fallbackMsg + (err && err.message ? ` (${err.message})` : '');

    // Use Google Chart API as a lightweight fallback (no server changes required)
    const getGoogleQRUrl = (payload, size = 300) =>
      `https://chart.googleapis.com/chart?cht=qr&chl=${encodeURIComponent(payload)}&chs=${size}x${size}&chld=L|1&choe=UTF-8`;

    qrImage.src = getGoogleQRUrl(url);
    qrImage.style.display = 'block';
  } finally {
    // Reset loading state
    loadingDiv.style.display = 'none';
    generateBtn.disabled = false;
  }
};
