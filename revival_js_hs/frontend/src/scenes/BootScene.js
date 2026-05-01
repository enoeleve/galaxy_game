export class BootScene {
  async enter(game) {
    // Placeholder: map recovered files from max_pack_all_versions here.
    // Example:
    // await game.assets.loadImage("logo", "../path/to/logo.png");
    this.timer = 0;
  }

  update(game, dt) {
    this.timer += dt;
    if (this.timer > 0.8) {
      game.scenes.start("menu");
    }
  }

  render(game, ctx) {
    ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
    ctx.fillStyle = "#0a1433";
    ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
    ctx.fillStyle = "#9db3ff";
    ctx.font = "14px Arial";
    ctx.fillText("Booting assets...", 62, 160);
  }
}
