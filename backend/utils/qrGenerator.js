const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

/**
 * Generates a unique QR token code and corresponding Base64 Data URL.
 * Secure: QR contains only the verified UUID token key, not sensitive citizen info.
 */
const generateSecureQr = async (prefix = 'QL-') => {
  const secureKey = `${prefix}${uuidv4()}`;
  try {
    const dataUrl = await QRCode.toDataURL(secureKey, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 256,
      color: {
        dark: '#1e3a8a', // Deep Government Blue
        light: '#ffffff',
      },
    });
    return {
      qrToken: secureKey,
      qrDataUrl: dataUrl,
    };
  } catch (error) {
    console.error('Error generating QR code:', error);
    return {
      qrToken: secureKey,
      qrDataUrl: '',
    };
  }
};

module.exports = {
  generateSecureQr,
};
