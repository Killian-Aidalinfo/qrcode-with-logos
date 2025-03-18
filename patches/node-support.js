/**
 * Patch pour QrCodeWithLogo qui améliore la prise en charge de Node.js
 */
const originalLib = require('../lib/qrcode-with-logos.common.js');
const QRCode = require('qrcode');

class QrCodeWithLogoNodeSupport extends originalLib {
  constructor(options) {
    // Vérifier si nous sommes dans Node.js
    const isNode = typeof window === 'undefined';
    
    if (isNode) {
      try {
        // Importer les modules nécessaires à Node.js
        const { createCanvas, Image } = require('canvas');
        
        // S'assurer que les options contiennent canvas et image
        options = options || {};
        
        if (!options.canvas) {
          const canvas = createCanvas(options.width || 800, options.width || 800);
          options.canvas = canvas;
        }
        
        if (!options.image) {
          options.image = new Image();
        }
      } catch (err) {
        console.error('Modules requis manquants. Installez-les avec: npm install canvas');
        throw err;
      }
    }
    
    // Appel du constructeur parent
    super(options);
    
    // Marquer les promesses comme résolues dans l'environnement Node.js
    if (isNode) {
      setTimeout(() => {
        this.ifCanvasDrawed = true;
        this.ifImageCreated = true;
        
        // Résoudre toutes les promesses en attente
        if (Array.isArray(this.drawCanvasPromiseResolve)) {
          this.drawCanvasPromiseResolve.forEach(resolve => {
            if (typeof resolve === 'function') resolve();
          });
          this.drawCanvasPromiseResolve = [];
        }
        
        if (Array.isArray(this.drawImagePromiseResolve)) {
          this.drawImagePromiseResolve.forEach(resolve => {
            if (typeof resolve === 'function') resolve();
          });
          this.drawImagePromiseResolve = [];
        }
      }, 500); // Délai pour permettre l'initialisation
    }
  }
  
  // Réécriture de getCanvas pour Node.js
  async getCanvas() {
    const isNode = typeof window === 'undefined';
    
    if (isNode) {
      // En Node.js, on résout immédiatement avec le canvas
      await new Promise(resolve => setTimeout(resolve, 500)); // Attendre que le QR code soit généré
      return this.options.canvas;
    } else {
      // Comportement d'origine pour les navigateurs
      return super.getCanvas();
    }
  }
  
  // Réécriture de getImage pour Node.js  
  async getImage() {
    const isNode = typeof window === 'undefined';
    
    if (isNode) {
      // En Node.js, on résout immédiatement avec l'image
      await new Promise(resolve => setTimeout(resolve, 500)); // Attendre que l'image soit générée
      return this.options.image;
    } else {
      // Comportement d'origine pour les navigateurs
      return super.getImage();
    }
  }
  
  // Réécriture de downloadImage pour Node.js
  async downloadImage(name) {
    const isNode = typeof window === 'undefined';
    
    if (isNode) {
      const fs = require('fs');
      const canvas = this.options.canvas;
      const buffer = canvas.toBuffer('image/png');
      
      if (name) {
        fs.writeFileSync(name, buffer);
      }
      
      return buffer;
    } else {
      // Comportement d'origine pour les navigateurs
      return super.downloadImage(name);
    }
  }
}

module.exports = QrCodeWithLogoNodeSupport;