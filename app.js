const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const targetNickname = document.getElementById("target-nickname");
const prevButton = document.getElementById("target-prev");
const nextButton = document.getElementById("target-next");
const chatLog = document.getElementById("chat-log");

const GROUND_Y = 840;
const GROUND_SCREEN_OFFSET = 24;
const OWN_NICKNAME = "Rays";
const CHAT_FONT_PATH = "./interface/абв.png";
const CHAT_ALPHABET = "абвгдежзийклмнопрстуфхцчшщъыьэюяё";

const spriteCache = new Map();
const scene = {
  cameraX: 0,
  cameraTargetX: 0,
  targetIndex: 0,
  ownIndex: 0,
  lastFrameMs: 0,
  characters: [],
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getSprite(path) {
  if (spriteCache.has(path)) return spriteCache.get(path);
  const img = new Image();
  img.addEventListener("load", draw);
  img.src = path;
  spriteCache.set(path, img);
  return img;
}

function createCharacters() {
  const baseNames = [
    "Math137",
    "Ebo228",
    "NeoLeve",
    "Rays",
    "Mirra",
    "Dars",
  ];
  const generatedNames = Array.from({ length: 30 }, (_, index) => `Test${index + 1}`);
  const names = [...baseNames, ...generatedNames];

  return names.map((nickname, index) => ({
    nickname,
    x: 460 + index * 320,
    y: GROUND_Y,
    headId: (index % 49) + 1,
    bodyId: ((index * 2) % 51) + 1,
  }));
}

function resizeCanvasToFrame() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(canvas.clientWidth * dpr);
  canvas.height = Math.floor(canvas.clientHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw();
}

function worldToScreenX(worldX) {
  return Math.round(worldX - scene.cameraX);
}

function worldToScreenY(worldY) {
  const groundScreenY = canvas.clientHeight - GROUND_SCREEN_OFFSET;
  return Math.round(groundScreenY - (GROUND_Y - worldY));
}

function getCameraBounds() {
  if (!scene.characters.length) {
    return { minX: 0, maxX: 0 };
  }

  const halfScreen = canvas.clientWidth / 2;
  const firstCharacterX = scene.characters[0].x;
  const lastCharacterX = scene.characters[scene.characters.length - 1].x;
  return {
    minX: firstCharacterX - halfScreen,
    maxX: lastCharacterX - halfScreen,
  };
}

function updateCameraTarget() {
  const target = scene.characters[scene.targetIndex];
  if (!target) return;
  const desiredX = target.x - canvas.clientWidth / 2;
  const cameraBounds = getCameraBounds();
  scene.cameraTargetX = clamp(desiredX, cameraBounds.minX, cameraBounds.maxX);
  targetNickname.textContent = target.nickname;
  prevButton.disabled = scene.targetIndex === 0;
  nextButton.disabled = scene.targetIndex === scene.characters.length - 1;
}

function selectNext(delta) {
  const nextIndex = scene.targetIndex + delta;
  if (nextIndex < 0 || nextIndex >= scene.characters.length) return;
  scene.targetIndex = nextIndex;
  updateCameraTarget();
  draw();
}

function focusOwnCharacter() {
  scene.targetIndex = scene.ownIndex;
  updateCameraTarget();
  draw();
}

function drawGround(width, height) {
  const groundY = worldToScreenY(GROUND_Y);
  ctx.fillStyle = "#909090";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, groundY, width, height - groundY);

  ctx.strokeStyle = "#747474";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundY + 1);
  ctx.lineTo(width, groundY + 1);
  ctx.stroke();
}

function drawCharacter(character) {
  const body = getSprite(`./telo/${character.bodyId}.png`);
  const head = getSprite(`./golova/${character.headId}.png`);
  const bodyW = body.naturalWidth || 68;
  const bodyH = body.naturalHeight || 68;
  const headW = head.naturalWidth || 50;
  const headH = head.naturalHeight || 50;
  const centerX = worldToScreenX(character.x);
  const feetY = worldToScreenY(character.y);
  const bodyX = centerX - bodyW / 2;
  const bodyY = feetY - bodyH;
  const headX = centerX - headW / 2;
  const headY = bodyY - headH + 12;

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(body, bodyX, bodyY, bodyW, bodyH);
  ctx.drawImage(head, headX, headY, headW, headH);

}

function draw() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  ctx.clearRect(0, 0, width, height);
  drawGround(width, height);

  for (let i = 0; i < scene.characters.length; i += 1) {
    drawCharacter(scene.characters[i]);
  }
}

function getGlyphSegments(image) {
  const buffer = document.createElement("canvas");
  buffer.width = image.naturalWidth;
  buffer.height = image.naturalHeight;
  const bufferCtx = buffer.getContext("2d", { willReadFrequently: true });
  bufferCtx.drawImage(image, 0, 0);

  const { width, height } = buffer;
  const pixelData = bufferCtx.getImageData(0, 0, width, height).data;
  const visibleColumns = [];

  for (let x = 0; x < width; x += 1) {
    let hasPixel = false;
    for (let y = 0; y < height; y += 1) {
      const alpha = pixelData[(y * width + x) * 4 + 3];
      if (alpha > 0) {
        hasPixel = true;
        break;
      }
    }
    visibleColumns.push(hasPixel);
  }

  const segments = [];
  let start = -1;
  for (let x = 0; x < width; x += 1) {
    if (visibleColumns[x] && start === -1) start = x;
    if (!visibleColumns[x] && start !== -1) {
      segments.push({ x: start, width: x - start });
      start = -1;
    }
  }
  if (start !== -1) {
    segments.push({ x: start, width: width - start });
  }

  return segments;
}

function buildGlyphMap(image) {
  const segments = getGlyphSegments(image);
  const map = new Map();

  if (segments.length >= CHAT_ALPHABET.length) {
    for (let i = 0; i < CHAT_ALPHABET.length; i += 1) {
      map.set(CHAT_ALPHABET[i], segments[i]);
    }
    return map;
  }

  // Фолбэк, если не удалось точно распознать сегменты.
  const cellWidth = Math.floor(image.naturalWidth / CHAT_ALPHABET.length);
  for (let i = 0; i < CHAT_ALPHABET.length; i += 1) {
    map.set(CHAT_ALPHABET[i], { x: i * cellWidth, width: cellWidth });
  }
  return map;
}

function convertRowToBitmapFont(row, glyphMap, image) {
  const fragment = document.createDocumentFragment();
  const makePixelSpan = (text) => {
    const wrapper = document.createElement("span");
    wrapper.className = "chat-pixel-part";
    for (const char of text) {
      if (char === " ") {
        const spacer = document.createElement("span");
        spacer.className = "chat-space";
        wrapper.append(spacer);
        continue;
      }

      const glyph = glyphMap.get(char.toLowerCase());
      if (!glyph) {
        const plain = document.createElement("span");
        plain.className = "chat-fallback";
        plain.textContent = char;
        wrapper.append(plain);
        continue;
      }

      const letter = document.createElement("span");
      letter.className = "chat-glyph";
      letter.style.backgroundImage = `url("${CHAT_FONT_PATH}")`;
      letter.style.backgroundSize = `${image.naturalWidth}px ${image.naturalHeight}px`;
      letter.style.backgroundPosition = `-${glyph.x}px 0px`;
      letter.style.width = `${glyph.width}px`;
      letter.style.height = `${image.naturalHeight}px`;
      wrapper.append(letter);
    }
    return wrapper;
  };

  const originalText = (row.textContent || "").trim();
  row.textContent = "";

  // Формат обычного сообщения: (время) Ник: текст
  const regularMatch = originalText.match(/^\(([^)]+)\)\s*([^:]+):\s*(.*)$/);
  if (regularMatch) {
    row.classList.add("chat-row-mixed");
    const [, time, nickname, message] = regularMatch;
    fragment.append(makePixelSpan(`(${time}) `));
    fragment.append(makePixelSpan(`${nickname}: `));

    const messageSpan = document.createElement("span");
    messageSpan.className = "chat-message-part";
    messageSpan.textContent = message;
    fragment.append(messageSpan);
    row.append(fragment);
    return;
  }

  // Системные строки (например: "* ...") полностью рисуем bitmap-шрифтом.
  if (originalText.startsWith("*")) {
    row.classList.add("chat-row-pixel");
    row.append(makePixelSpan(originalText));
    return;
  }

  // Для остальных строк: если это префикс без двоеточия, считаем системной надписью.
  if (!originalText.includes(":")) {
    row.classList.add("chat-row-pixel");
    row.append(makePixelSpan(originalText));
    return;
  }

  // Фолбэк: не трогаем строку, если формат не распознан.
  row.textContent = originalText;
}

function applyBitmapFontToChat() {
  const fontImage = new Image();
  fontImage.addEventListener("load", () => {
    const glyphMap = buildGlyphMap(fontImage);
    const rows = chatLog.querySelectorAll("p");
    rows.forEach((row) => convertRowToBitmapFont(row, glyphMap, fontImage));
  });
  fontImage.src = CHAT_FONT_PATH;
}

function tick(timestampMs) {
  if (!scene.lastFrameMs) {
    scene.lastFrameMs = timestampMs;
  }
  const deltaSec = Math.min((timestampMs - scene.lastFrameMs) / 1000, 0.05);
  scene.lastFrameMs = timestampMs;

  const t = Math.min(1, deltaSec * 10);
  scene.cameraX += (scene.cameraTargetX - scene.cameraX) * t;

  draw();
  requestAnimationFrame(tick);
}

function wireControls() {
  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectNext(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      selectNext(1);
    } else if (event.key === "1") {
      event.preventDefault();
      focusOwnCharacter();
    }
  });

  prevButton.addEventListener("click", () => selectNext(-1));
  nextButton.addEventListener("click", () => selectNext(1));
}

function init() {
  scene.characters = createCharacters();
  scene.ownIndex = Math.max(
    0,
    scene.characters.findIndex((character) => character.nickname === OWN_NICKNAME),
  );
  scene.targetIndex = scene.ownIndex;
  wireControls();
  updateCameraTarget();
  scene.cameraX = scene.cameraTargetX;
  resizeCanvasToFrame();
  applyBitmapFontToChat();
  requestAnimationFrame(tick);
}

window.addEventListener("resize", () => {
  updateCameraTarget();
  scene.cameraX = scene.cameraTargetX;
  resizeCanvasToFrame();
});
window.addEventListener("load", init);
