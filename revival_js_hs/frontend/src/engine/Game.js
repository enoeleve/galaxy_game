import { SceneManager } from "./SceneManager.js";
import { AssetRegistry } from "./AssetRegistry.js";

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.assets = new AssetRegistry();
    this.scenes = new SceneManager(this);
    this.lastTs = 0;
    this.running = false;
  }

  start() {
    this.running = true;
    requestAnimationFrame((ts) => this.loop(ts));
  }

  loop(ts) {
    if (!this.running) return;

    const dt = (ts - this.lastTs) / 1000;
    this.lastTs = ts;

    this.scenes.update(dt);
    this.scenes.render(this.ctx);

    requestAnimationFrame((nextTs) => this.loop(nextTs));
  }
}
