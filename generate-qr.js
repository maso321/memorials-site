import QRCode from 'qrcode';

const url = 'https://maso321.github.io/memorials-site/'; // поменяй при необходимости

await QRCode.toFile('public/qrcode.png', url, {
  color: {
    dark: '#000000',
    light: '#ffffff',
  },
});

console.log('QR-код создан: public/qrcode.png');

