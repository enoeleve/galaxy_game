export class SceneManager {
  constructor(game) {
    this.game = game;
    this.registry = new Map();
    this.activeScene = null;
  }

  register(name, scene) {
    this.registry.set(name, scene);
  }

  start(name) {
    const nextScene = this.registry.get(name);
    if (!nextScene) throw new Error(`Scene not found: ${name}`);

    if (this.activeScene?.exit) this.activeScene.exit(this.game);
    this.activeScene = nextScene;
    if (this.activeScene.enter) this.activeScene.enter(this.game);
  }

  update(dt) {
    this.activeScene?.update?.(this.game, dt);
  }

  render(ctx) {
    this.activeScene?.render?.(this.game, ctx);
  }
}
