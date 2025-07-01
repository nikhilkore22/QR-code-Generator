// --- DOM Element References ---
const textInput = document.getElementById('text-input');
const colorDarkInput = document.getElementById('color-dark');
const colorLightInput = document.getElementById('color-light');
const sizeSlider = document.getElementById('size-slider');
const sizeText = document.getElementById('size-text');
const errorCorrectionSelect = document.getElementById('error-correction');
const logoInput = document.getElementById('logo-input');
const generateBtn = document.getElementById('generate-btn');
const downloadBtn = document.getElementById('download-btn');
const qrCodeContainer = document.getElementById('qr-code-container');

let qrcode = null; // To hold the QRCode.js instance
let finalCanvas = null; // To hold the canvas with the logo

// --- Event Listeners ---

// Update size text display when slider is moved
sizeSlider.addEventListener('input', () => {
    sizeText.textContent = `${sizeSlider.value}px`;
});

// Generate QR code on button click
generateBtn.addEventListener('click', generateQRCode);

// Download QR code on button click
downloadBtn.addEventListener('click', () => {
    if (finalCanvas) {
        const link = document.createElement('a');
        link.download = 'qr-code.png';
        link.href = finalCanvas.toDataURL('image/png');
        link.click();
    }
});

// --- Core Functions ---

/**
 * Main function to generate the QR code based on user settings.
 */
function generateQRCode() {
    const text = textInput.value.trim();
    if (!text) {
        alert('Please enter text or a URL.');
        return;
    }

    // Clear previous QR code
    qrCodeContainer.innerHTML = '';
    qrCodeContainer.classList.remove('hidden');

    const size = parseInt(sizeSlider.value);
    const colorDark = colorDarkInput.value;
    const colorLight = colorLight.value;
    const errorCorrectionLevel = errorCorrectionSelect.value;
    const logoUrl = logoInput.value.trim();

    // Create a temporary div for qrcode.js to draw on
    const tempDiv = document.createElement('div');
    
    // Generate the base QR code using the library
    new QRCode(tempDiv, {
        text: text,
        width: size,
        height: size,
        colorDark: colorDark,
        colorLight: colorLight,
        correctLevel: QRCode.CorrectLevel[errorCorrectionLevel]
    });

    // Wait a moment for the QR code to be generated
    setTimeout(() => {
        const qrCanvas = tempDiv.querySelector('canvas');
        const qrImg = tempDiv.querySelector('img');

        if (qrCanvas) {
            // If a logo is provided, draw it on the canvas
            if (logoUrl) {
                drawLogoOnCanvas(qrCanvas, logoUrl);
            } else {
                finalCanvas = qrCanvas;
                qrCodeContainer.appendChild(finalCanvas);
                downloadBtn.disabled = false;
            }
        } else if (qrImg) {
            // Fallback for when qrcode.js generates an img tag
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(qrImg, 0, 0, size, size);
            
            if (logoUrl) {
                drawLogoOnCanvas(canvas, logoUrl);
            } else {
                finalCanvas = canvas;
                qrCodeContainer.appendChild(finalCanvas);
                downloadBtn.disabled = false;
            }
        }
    }, 100);
}

/**
 * Draws a user-provided logo onto the center of the QR code canvas.
 * @param {HTMLCanvasElement} baseCanvas - The canvas with the base QR code.
 * @param {string} logoUrl - The URL of the logo image.
 */
function drawLogoOnCanvas(baseCanvas, logoUrl) {
    const ctx = baseCanvas.getContext('2d');
    const size = baseCanvas.width;
    
    const logo = new Image();
    logo.crossOrigin = "Anonymous"; // Handle CORS issues for images from other domains
    
    logo.onload = () => {
        // Calculate logo dimensions to cover about 25% of the QR code
        const logoSize = size * 0.25;
        const logoX = (size - logoSize) / 2;
        const logoY = (size - logoSize) / 2;

        // Draw a white background behind the logo for better readability
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);

        // Draw the logo
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
        
        // Finalize and display
        finalCanvas = baseCanvas;
        qrCodeContainer.appendChild(finalCanvas);
        downloadBtn.disabled = false;
    };
    
    logo.onerror = () => {
        alert('Could not load the logo image. Please check the URL.');
        // Display the QR code without the logo as a fallback
        finalCanvas = baseCanvas;
        qrCodeContainer.appendChild(finalCanvas);
        downloadBtn.disabled = false;
    };

    logo.src = logoUrl;
}