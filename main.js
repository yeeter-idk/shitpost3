let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let characterSelect = document.getElementById("characterSelect");

let character = "yuuka";
let alreadyStarted = false;

let bodyImg;
let blinkImg;
let haloImg;
let backgroundImg;
let spriteInfo;
let loadingNewCharacter = false;

let screenHeight = 180;
let frame = 0;
let untilNextBlink = 20;
let blinkDuration = 4;
let blinkFrames = blinkDuration;

let touchIdentifier = {
  scale: 5,
  data: [],
  width: 0,
  height: 0,
  setup: function() {
    let originalWidth = canvas.width;
    let originalHeight = canvas.height;
    
    canvas.width = (originalWidth / this.scale) | 0;
    canvas.height = (originalHeight / this.scale) | 0;
    
    this.height = canvas.height;
    this.width = canvas.width;
    
    drawAnimatedSprite(true);
    
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    
    this.data = new Uint8Array(canvas.width * canvas.height);
    
    for(let i = 0; i<this.data.length; i++){
      this.data[i] = imageData[i * 4 + 3];
    }
    
    canvas.width = originalWidth;
    canvas.height = originalHeight;
  },
  touches: function(x, y) {
    let scaledX = x / this.scale;
    let scaledY = y / this.scale;
    
    if(scaledX < 0 || scaledX > this.width) return false;
    if(scaledY < 0 || scaledY > this.height) return false;
    
    let index = (scaledX | 0) + (scaledY | 0) * this.width;
    
    return this.data[index] > 128;
  }
};

let debugTool = {
  startingY: 0
};

let mouse = {
  x: 0,
  y: 0,
  down: false,
  touchingCharacter: false
};
let mouseTrail = [];

setup();
async function setup() {
  loadingNewCharacter = true;
  let lSpriteInfo = await loadJSON(character + "/info.json");

  const [lBodyImg, lBlinkImg, lHaloImg, lBackgroundImg] = await Promise.all([
    loadImage(character + "/body.png"),
    loadImage(character + "/blink.png"),
    loadImage(character + "/halo.png"),
    loadImage("Backgrounds/" + lSpriteInfo.school + ".jpg")
  ]);
  
  console.log(JSON.stringify(lSpriteInfo, null, 2))
  
  bodyImg = lBodyImg;
  blinkImg = lBlinkImg;
  haloImg = lHaloImg;
  backgroundImg = lBackgroundImg;
  spriteInfo = lSpriteInfo;
    
  canvas.width = window.innerWidth * 2;
  canvas.height = (window.innerHeight - 30) * 2;
 
  loadingNewCharacter = false;
  
  touchIdentifier.setup();
  
  if(!alreadyStarted){
    alreadyStarted = true;
    loop();
  }
}

function drawAnimatedSprite(isBare = false) {
  const scale = (spriteInfo.charHeight / screenHeight) * canvas.height / spriteInfo.charHeightPx;
  
  const drawHeight = bodyImg.height * scale;
  const drawWidth = bodyImg.width * scale; // preserve aspect ratio
  
  const xOffset = canvas.width / 2 - drawWidth / 2;
  const yOffset = canvas.height - drawHeight;
  
  if(isBare){
    ctx.drawImage(bodyImg, xOffset, yOffset, drawWidth, drawHeight);
    return;
  }
  
  // Example floating halo
  ctx.drawImage(
    haloImg,
    xOffset,
    Math.sin(frame / 30) * 10 * scale + yOffset, // float also needs scaling
    haloImg.width * scale,
    haloImg.height * scale
  );

  if(untilNextBlink <= 0){
    ctx.drawImage(blinkImg, xOffset, yOffset, drawWidth, drawHeight);
    blinkFrames--;
  }else if(mouse.touchingCharacter){
    ctx.drawImage(blinkImg, xOffset, yOffset, drawWidth, drawHeight);
    untilNextBlink = Math.max(30, untilNextBlink);
  }else{
    ctx.drawImage(bodyImg, xOffset, yOffset, drawWidth, drawHeight);
  }
}

function drawBackground() {
  let width = (canvas.height / backgroundImg.height) * backgroundImg.width;
  
  ctx.drawImage(backgroundImg, canvas.width / 2 - width / 2, 0, width, canvas.height);
}

function drawThrobber() {
  let radius = 30;
  let lineSize = 6;
  
  let x = radius + lineSize / 2;
  let y = radius + lineSize / 2;
  
  let startRad = (frame / 10);
  let endRad = startRad + Math.PI;
  
  ctx.strokeStyle = "white";
  ctx.lineWidth = lineSize;
  ctx.beginPath();
  ctx.arc(x, y, radius, startRad, endRad);
  ctx.stroke();
  
  startRad = -(frame / 7.643);
  endRad = startRad + Math.PI;
  
  //ctx.strokeStyle = "white";
  ctx.lineWidth = lineSize;
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.7, startRad, endRad);
  ctx.stroke();
}

function loop() {
  drawBackground();
  
  drawAnimatedSprite();
  
  if(loadingNewCharacter) drawThrobber();
  
  ctx.fillStyle = "#80d6ff";
  ctx.globalAlpha = 0.3;
  for(let i = 0; i<mouseTrail.length; i++){
    let trail = mouseTrail[i];
    
    let radius = 20 * (1 - 1 / (trail.life + 1));
    ctx.beginPath();
    ctx.arc(trail.x, trail.y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    trail.life--;
    if(trail.life <= 0){
      mouseTrail.splice(i, 1);
      i--;
    }
  }
  ctx.globalAlpha = 1;
  
  
  if(mouse.down){
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#aacaff";
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 20, 0, Math.PI * 2);
    ctx.stroke();
    
    mouseTrail.push({
      x: mouse.x,
      y: mouse.y,
      life: 10
    });
  }
  
  //ctx.fillRect(0, debugTool.startingY, canvas.width, 1);
  
  // reset blinking
  if(blinkFrames <= 0){
    blinkFrames = blinkDuration;
    untilNextBlink = ((Math.random() * 300) | 0) + 60;
  }else{
    untilNextBlink--;
  }
  
  frame++;
  window.requestAnimationFrame(loop);
}