export class AssetRegistry {
  constructor() {
    this.images = new Map();
  }

  async loadImage(key, src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images.set(key, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  getImage(key) {
    return this.images.get(key) || null;
  }

  async loadImageFromUrl(key, url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images.set(key, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = url;
    });
  }
}
