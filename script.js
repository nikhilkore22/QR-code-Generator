document.addEventListener('DOMContentLoaded', () => {
    const qrDataType = document.getElementById('qrDataType');
    const dataInputs = { // Group all data input divs
        text: document.getElementById('textInput'),
        url: document.getElementById('urlInput'),
        whatsapp: document.getElementById('whatsappInput'),
        wifi: document.getElementById('wifiInput'),
        email: document.getElementById('emailInput'),
        phone: document.getElementById('phoneInput'),
        sms: document.getElementById('smsInput')
    };

    // Specific input fields for each type
    const qrText = document.getElementById('qrText');
    const qrUrl = document.getElementById('qrUrl'); // New URL input
    const whatsappNumber = document.getElementById('whatsappNumber');
    const whatsappMessage = document.getElementById('whatsappMessage');
    const wifiSsid = document.getElementById('wifiSsid');
    const wifiPassword = document.getElementById('wifiPassword');
    const wifiEncryption = document.getElementById('wifiEncryption');
    const emailAddress = document.getElementById('emailAddress');
    const emailSubject = document.getElementById('emailSubject');
    const emailBody = document.getElementById('emailBody');
    const phoneNumber = document.getElementById('phoneNumber');
    const smsNumber = document.getElementById('smsNumber');
    const smsMessage = document.getElementById('smsMessage');

    const foregroundColor = document.getElementById('foregroundColor');
    const backgroundColor = document.getElementById('backgroundColor');
    const logoUploadInput = document.getElementById('logoUploadInput'); // New file input for logo
    const logoUrlInput = document.getElementById('logoUrlInput'); // Existing URL input for logo
    const qrSize = document.getElementById('qrSize');
    const qrQuality = document.getElementById('qrQuality');
    const qrMargin = document.getElementById('qrMargin'); // New margin input

    const generateQrBtn = document.getElementById('generateQrBtn');
    const downloadQrBtn = document.getElementById('downloadQrBtn');
    const qrCodeContainer = document.getElementById('qrCodeContainer');

    let qrCodeInstance = null; // To hold the QRious instance
    let currentLogoSrc = ''; // To store the current logo data URL or URL

    // Function to show/hide input fields based on QR type
    const toggleInputFields = () => {
        for (const key in dataInputs) {
            dataInputs[key].classList.remove('active');
        }
        const selectedType = qrDataType.value;
        if (dataInputs[selectedType]) {
            dataInputs[selectedType].classList.add('active');
        }
        generateQrCode(); // Regenerate QR code when type changes
    };

    // Function to generate and display the QR code
    const generateQrCode = () => {
        let data = '';
        const type = qrDataType.value;

        switch (type) {
            case 'text':
                data = qrText.value;
                break;
            case 'url':
                data = qrUrl.value;
                break;
            case 'whatsapp':
                let number = whatsappNumber.value.replace(/\D/g, ''); // Remove non-digits
                if (number.startsWith('0')) { // Handle leading zero if present
                    number = number.substring(1);
                }
                // Basic assumption for India if 10 digits and no explicit country code
                if (number.length === 10 && !number.startsWith('91')) {
                    number = '91' + number;
                } else if (number.length > 10 && number.startsWith('0')) { // Remove leading zero if country code is included
                     number = number.substring(1);
                }
                data = `https://wa.me/${number}`;
                if (whatsappMessage.value) {
                    data += `?text=${encodeURIComponent(whatsappMessage.value)}`;
                }
                break;
            case 'wifi':
                const ssid = wifiSsid.value;
                const password = wifiPassword.value;
                const encryption = wifiEncryption.value;
                // WIFI:S:<SSID>;T:<ENCRYPTION TYPE>;P:<PASSWORD>;H:<HIDDEN (true/false)>;
                data = `WIFI:S:${ssid};T:${encryption};P:${password};;`;
                break;
            case 'email':
                const email = emailAddress.value;
                const subject = encodeURIComponent(emailSubject.value);
                const body = encodeURIComponent(emailBody.value);
                data = `mailto:${email}`;
                if (subject) data += `?subject=${subject}`;
                if (body && subject) data += `&body=${body}`;
                else if (body) data += `?body=${body}`;
                break;
            case 'phone':
                data = `tel:${phoneNumber.value}`;
                break;
            case 'sms':
                const smsNum = smsNumber.value;
                const smsMsg = encodeURIComponent(smsMessage.value);
                data = `sms:${smsNum}`;
                if (smsMsg) data += `?body=${smsMsg}`;
                break;
        }

        if (!data) {
            qrCodeContainer.innerHTML = '<p>Please enter data to generate QR Code.</p>';
            return;
        }

        qrCodeContainer.innerHTML = ''; // Clear previous QR and logo
        const canvas = document.createElement('canvas');
        qrCodeContainer.appendChild(canvas);

        const size = parseInt(qrSize.value);
        const margin = parseInt(qrMargin.value);

        qrCodeInstance = new QRious({
            element: canvas,
            value: data,
            size: size,
            level: qrQuality.value, // Error correction level (L, M, Q, H)
            foreground: foregroundColor.value,
            background: backgroundColor.value,
            padding: margin // Set the quiet zone margin
        });

        // Handle logo embedding
        if (currentLogoSrc) {
            const logoImg = new Image();
            logoImg.src = currentLogoSrc;
            logoImg.id = 'qrLogo';
            logoImg.onload = () => {
                // If you want to draw the logo *onto* the canvas for a single image download
                // you would need to adjust this. For now, it's an overlay.
                qrCodeContainer.appendChild(logoImg);
            };
            logoImg.onerror = () => {
                console.warn("Could not load logo image. Please check the URL or file.");
                // Clear logo if it fails to load
                const existingLogo = document.getElementById('qrLogo');
                if (existingLogo) existingLogo.remove();
            };
        } else {
            // Remove logo if no source is set
            const existingLogo = document.getElementById('qrLogo');
            if (existingLogo) existingLogo.remove();
        }
    };

    // Function to download the QR code
    const downloadQrCode = () => {
        if (!qrCodeInstance || !qrCodeContainer.querySelector('canvas')) {
            alert('Please generate a QR code first!');
            return;
        }

        const canvas = qrCodeContainer.querySelector('canvas');
        const link = document.createElement('a');
        link.download = 'qrcode.png';
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Event listener for logo file upload
    logoUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                currentLogoSrc = e.target.result; // Data URL of the uploaded image
                logoUrlInput.value = ''; // Clear URL input if file is uploaded
                generateQrCode();
            };
            reader.readAsDataURL(file); // Read file as Data URL
        } else {
            currentLogoSrc = ''; // Clear logo if no file selected
            generateQrCode();
        }
    });

    // Event listener for logo URL input
    logoUrlInput.addEventListener('input', () => {
        currentLogoSrc = logoUrlInput.value;
        logoUploadInput.value = ''; // Clear file input if URL is entered
        generateQrCode();
    });

    // General event listeners for inputs to trigger live preview
    qrDataType.addEventListener('change', toggleInputFields);
    generateQrBtn.addEventListener('click', generateQrCode);
    downloadQrBtn.addEventListener('click', downloadQrCode);

    // Live preview updates for all relevant inputs
    qrText.addEventListener('input', generateQrCode);
    qrUrl.addEventListener('input', generateQrCode);
    whatsappNumber.addEventListener('input', generateQrCode);
    whatsappMessage.addEventListener('input', generateQrCode);
    wifiSsid.addEventListener('input', generateQrCode);
    wifiPassword.addEventListener('input', generateQrCode);
    wifiEncryption.addEventListener('change', generateQrCode);
    emailAddress.addEventListener('input', generateQrCode);
    emailSubject.addEventListener('input', generateQrCode);
    emailBody.addEventListener('input', generateQrCode);
    phoneNumber.addEventListener('input', generateQrCode);
    smsNumber.addEventListener('input', generateQrCode);
    smsMessage.addEventListener('input', generateQrCode);

    foregroundColor.addEventListener('input', generateQrCode);
    backgroundColor.addEventListener('input', generateQrCode);
    qrSize.addEventListener('change', generateQrCode);
    qrQuality.addEventListener('change', generateQrCode);
    qrMargin.addEventListener('input', generateQrCode); // Listen for margin changes

    // Initial generation on page load
    toggleInputFields();
});
