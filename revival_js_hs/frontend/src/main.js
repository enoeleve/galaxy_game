import { Game } from "./engine/Game.js";
import { BootScene } from "./scenes/BootScene.js";
import { MenuScene } from "./scenes/MenuScene.js";

const canvas = document.getElementById("game");
const game = new Game(canvas);

game.scenes.register("boot", new BootScene());
game.scenes.register("menu", new MenuScene());
game.scenes.start("boot");
game.start();
