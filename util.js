async function loadImage(imagePath) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error(`Failed to load image: ${imagePath}`));
    img.src = imagePath;
  });
}

async function loadJSON(jsonPath) {
  return new Promise((resolve, reject) => {
    fetch(jsonPath)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load JSON: ${jsonPath} (status: ${response.status})`);
        }
        return response.json();
      })
      .then(data => resolve(data))
      .catch(err => reject(err));
  });
}

document.getElementById("characterSelect").addEventListener("change", ()=>{
  character = document.getElementById("characterSelect").value;
  setup();
});

document.getElementById("canvas").addEventListener("touchstart", (e)=>{
  mouse.down = true;
  
  let touch = e.changedTouches[0];
  let [x, y] = getTouchPos(touch);
  mouse.x = x;
  mouse.y = y;
  if(touchIdentifier.touches(x, y)){
    mouse.touchingCharacter = true;
    e.preventDefault();
  }
  //debugTool.startingY = y;
});
document.getElementById("canvas").addEventListener("touchmove", (e)=>{
  let touch = e.changedTouches[0];
  let [x, y] = getTouchPos(touch);
  mouse.x = x;
  mouse.y = y;
  if(touchIdentifier.touches(x, y)){
    mouse.touchingCharacter = true;
    e.preventDefault();  
  }
});
document.getElementById("canvas").addEventListener("touchend", ()=>{
  mouse.down = false;
  mouse.touchingCharacter = false;
});

document.getElementById("canvas").addEventListener("touchcancel", ()=>{
  mouse.down = false;
  mouse.touchingCharacter = false;
});

document.getElementById("canvas").addEventListener("mousedown", (e)=>{
  mouse.down = true;
  
  let touch = e.changedTouches[0];
  let [x, y] = getMousePos(touch);
  mouse.x = x;
  mouse.y = y;
  if(touchIdentifier.touches(x, y)){
    mouse.touchingCharacter = true;
    e.preventDefault();
  }
  //debugTool.startingY = y;
});
document.getElementById("canvas").addEventListener("mousemove", (e)=>{
  let touch = e.changedTouches[0];
  let [x, y] = getMousePos(touch);
  mouse.x = x;
  mouse.y = y;
  if(touchIdentifier.touches(x, y)){
    mouse.touchingCharacter = true;
    e.preventDefault();  
  }
});
document.getElementById("canvas").addEventListener("mouseup", ()=>{
  mouse.down = false;
  mouse.touchingCharacter = false;
});

document.getElementById("canvas").addEventListener("touchcancel", ()=>{
  mouse.down = false;
  mouse.touchingCharacter = false;
});

function getTouchPos(touch) {  
  let rect = canvas.getBoundingClientRect();

  return [(touch.clientX - rect.left) * (canvas.width / rect.width), (touch.clientY - rect.top) * (canvas.height / rect.height)]
}

function getMousePos(touch) {  
  let rect = canvas.getBoundingClientRect();

  return [
    (touch.clientX - rect.left) * (canvas.width / rect.width),
    (touch.clientY - rect.top) * (canvas.height / rect.height)
  ];
}
