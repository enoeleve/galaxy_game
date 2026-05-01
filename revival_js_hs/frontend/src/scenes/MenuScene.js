import { VersionAssets } from "../engine/VersionAssets.js";

export class MenuScene {
  async enter(game) {
    this.assetsByVersion = new VersionAssets();
    this.previewKey = "preview";
    this.previewImg = null;
    this.status = "Loading version manifest...";
    this.loading = false;

    this.onKeyDown = async (event) => {
      if (event.key === "ArrowRight") {
        this.assetsByVersion.nextVersion();
        await this.loadVersion(game);
      } else if (event.key === "ArrowLeft") {
        this.assetsByVersion.prevVersion();
        await this.loadVersion(game);
      }
    };

    window.addEventListener("keydown", this.onKeyDown);
    await this.loadVersion(game);
  }

  update() {}

  async loadVersion(game) {
    if (this.loading) return;
    this.loading = true;
    this.status = `Loading v${this.assetsByVersion.version}...`;
    this.previewImg = null;

    try {
      await this.assetsByVersion.loadCurrentManifest();
      const previewUrl = this.assetsByVersion.getFirstRawImageUrl();
      if (previewUrl) {
        this.previewImg = await game.assets.loadImageFromUrl(this.previewKey, previewUrl);
      }
      this.status = `Loaded v${this.assetsByVersion.version} (${this.assetsByVersion.manifest.length} assets)`;
    } catch (err) {
      this.status = `Load error: ${err.message}`;
    } finally {
      this.loading = false;
    }
  }

  render(game, ctx) {
    ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
    ctx.fillStyle = "#0f1a3a";
    ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);

    ctx.fillStyle = "#e8eeff";
    ctx.font = "bold 16px Arial";
    ctx.fillText("Galaxy Revival", 52, 36);

    ctx.font = "12px Arial";
    ctx.fillStyle = "#b8c8ff";
    ctx.fillText("LEFT/RIGHT: switch version", 42, 58);
    ctx.fillText(`Version: ${this.assetsByVersion?.version ?? "-"}`, 72, 78);
    ctx.fillText(this.status ?? "", 8, 96);

    if (this.previewImg) {
      const maxW = 180;
      const maxH = 160;
      const scale = Math.min(maxW / this.previewImg.width, maxH / this.previewImg.height);
      const w = Math.max(1, Math.floor(this.previewImg.width * scale));
      const h = Math.max(1, Math.floor(this.previewImg.height * scale));
      const x = Math.floor((game.canvas.width - w) / 2);
      const y = 116;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(this.previewImg, x, y, w, h);
    } else {
      ctx.fillStyle = "#7f90c6";
      ctx.fillText("No preview image loaded", 55, 170);
    }
  }

  exit() {
    if (this.onKeyDown) {
      window.removeEventListener("keydown", this.onKeyDown);
    }
  }
}
