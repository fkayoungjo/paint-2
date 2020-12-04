import ToolBar from './ToolBar.js';
import React, { useState, useEffect, useRef } from "react";
import { SketchPicker } from 'react-color';


function App() {
  const [color, setColor] = useState('#000000');
  const [lineSize, setLineSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false)
  const [isUsingBrush, setIsUsingBrush] = useState(false)
  const [image, saveImage] = useState(null)
  const [currentTool, setCurrentTool] = useState('brush')
  const canvasRef = useRef(null)
  const contextRef = useRef(null)
  const [boxCoor, setBoxCoor] = useState({left: 0,top: 0, width: 0, height: 0 });
  const [mouseDown, setMouseDown] = useState({ x: 0, y: 0 });
  const [loc, setLoc] = useState({ x: 0, y: 0 });
  const [brushXPoints, setBrushXPoints] = useState([])
  const [brushYPoints, setBrushYPoints] = useState([])
  const [brushDownPos, setbrushDownPos] = useState({x:0, y: 0})


  function handleColorChange(color)  {
    setColor(color.hex)
  };

  function handleLineSize(event) {
    setLineSize(event.target.value);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const context = canvas.getContext("2d")
    context.scale(2,2)
    context.lineCap = "round"
    contextRef.current = context;
  }, [] )

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d")
    context.strokeStyle = color
  }, [color] )

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d")
    context.lineWidth = lineSize
  }, [lineSize] )

  useEffect(() => {

  }, [currentTool] )

  function changeTool(e){
  setCurrentTool(e.target.id)
  document.getElementById("open").className = "";
  document.getElementById("save").className = "";
  document.getElementById("brush").className = "";
  document.getElementById("line").className = "";
  document.getElementById("rectangle").className = "";
  document.getElementById("circle").className = "";
  document.getElementById("ellipse").className = "";
  document.getElementById(e.target.id).className = "selected"
}

function GetMousePosition(x,y){
    // Get canvas size and position in web page
    const canvas = canvasRef.current
    let canvasSizeData = canvas.getBoundingClientRect();
     setLoc( (x - canvasSizeData.left) * (canvas.width  / canvasSizeData.width),
     (y - canvasSizeData.top)  * (canvas.height / canvasSizeData.height))
}

function SaveCanvasImage(){
    // Save image
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    saveImage(context.getImageData(0,0,canvas.width,canvas.height));
}

function RedrawCanvasImage(){
    // Restore image
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d")
    context.putImageData(image,0,0);
}

function UpdateRubberbandSizeData(prevState){
    // Height & width are the difference between were clicked
    // and current mouse position
    setBoxCoor({...prevState.setBoxCoor, width: Math.abs(loc.x - mouseDown.x)})
    setBoxCoor({...prevState.setBoxCoor, height: Math.abs(loc.y - mouseDown.y)})

    // If mouse is below where mouse was clicked originally
    if(loc.x > mouseDown.x){

        // Store mousedown because it is farthest left
        setBoxCoor({...prevState.setBoxCoor, left: mouseDown.x})
    } else {

        // Store mouse location because it is most left
        setBoxCoor({...prevState.setBoxCoor,left: loc.x})
    }

    // If mouse location is below where clicked originally
    if(loc.y > mouseDown.y){

        // Store mousedown because it is closer to the top
        // of the canvas
        setBoxCoor({...prevState.setBoxCoor, top: mouseDown.y})
    } else {

        // Otherwise store mouse position
        setBoxCoor({...prevState.setBoxCoor, top: loc.y})
    }
}



function startDrawing(e){
  const canvas = canvasRef.current;
    // Change the mouse pointer to a crosshair
    canvas.style.cursor = "crosshair";
    GetMousePosition(e.clientX, e.clientY);
    // Store location

    // Save the current canvas image
    SaveCanvasImage();
    // Store mouse position when clicked
    setMouseDown(loc.x, loc.y);
    // Store that yes the mouse is being held down
    setIsDrawing(true)

    // Brush will store points in an array
    if(currentTool === 'brush'){
        setIsUsingBrush(true);
        AddBrushPoint(loc.x, loc.y);
    }
};

function draw(e){
  const canvas = canvasRef.current;
    canvas.style.cursor = "crosshair";
    GetMousePosition(e.clientX, e.clientY);

    // If using brush tool and dragging store each point
    if(currentTool === 'brush' && isDrawing && isUsingBrush){
        // Throw away brush drawings that occur outside of the canvas
        if(loc.x > 0 && loc.x < canvas.width && loc.y > 0 && loc.y < canvas.height){
            AddBrushPoint(loc.x, loc.y, true);
        }
        RedrawCanvasImage();
        DrawBrush();
    } else {
        if(isDrawing){
            RedrawCanvasImage();
            UpdateRubberbandOnMove(loc);
        }
    }
}

function finishDrawing(e){
  const canvas = canvasRef.current;
    canvas.style.cursor = "default";
    GetMousePosition(e.clientX, e.clientY);
    RedrawCanvasImage();
    UpdateRubberbandOnMove(loc);
    setIsDrawing(false);
    setIsUsingBrush(false);
}

// Saves the image in your default download directory
function SaveImage(){
  const canvas = canvasRef.current;
    // Get a reference to the link element
    var imageFile = document.getElementById("img-file");
    // Set that you want to download the image when link is clicked
    imageFile.setAttribute('download', 'image.png');
    // Reference the image in canvas for download
    imageFile.setAttribute('href', canvas.toDataURL());
}

function OpenImage(){
  const canvas = canvasRef.current;
  const context = canvas.getContext("2d")
    let img = new Image();
    // Once the image is loaded clear the canvas and draw it
    img.onload = function(){
        context.clearRect(0,0,canvas.width, canvas.height);
        context.drawImage(img,0,0);
    }
    img.src = 'image.png';

}

function UpdateRubberbandOnMove(loc){
    // Stores changing height, width, x & y position of most
    // top left point being either the click or mouse location
    UpdateRubberbandSizeData(loc);

    // Redraw the shape
    drawRubberbandShape(loc);
}

function AddBrushPoint(x, y, mouseDown, prevState){
    setBrushXPoints({...prevState.brushXPoints, x})
    setBrushYPoints({...prevState.brushYPoints, x})
    // Store true that mouse is down
    brushDownPos(...prevState.brushDownPos, mouseDown);
}

function DrawBrush(){
  const canvas = canvasRef.current;
  const context = canvas.getContext("2d")
    for(let i = 1; i < brushXPoints.length; i++){
        context.beginPath();

        // Check if the mouse button was down at this point
        // and if so continue drawing
        if(brushDownPos[i]){
            context.moveTo(brushXPoints[i-1], brushYPoints[i-1]);
        } else {
            context.moveTo(brushXPoints[i]-1, brushYPoints[i]);
        }
        context.lineTo(brushXPoints[i], brushYPoints[i]);
        context.closePath();
        context.stroke();
    }
}

function drawRubberbandShape(loc){
  const canvas = canvasRef.current;
  const context = canvas.getContext("2d")
    context.strokeStyle = color;
    context.fillStyle = color;
    if(currentTool === "brush"){
        // Create paint brush
        DrawBrush();
    } else if(currentTool === "line"){
        // Draw Line
        context.beginPath();
        context.moveTo(mouseDown.x, mouseDown.y);
        context.lineTo(loc.x, loc.y);
        context.stroke();
    } else if(currentTool === "rectangle"){
        // Creates rectangles
        context.strokeRect(boxCoor.left, boxCoor.top, boxCoor.width, boxCoor.height);
    } else if(currentTool === "circle"){
        // Create circles
        let radius = boxCoor.width;
        context.beginPath();
        context.arc(mouseDown.x, mouseDown.y, radius, 0, Math.PI * 2);
        context.stroke();
    } else if(currentTool === "ellipse"){
        // Create ellipses
        // context.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle)
        let radiusX = boxCoor.width / 2;
        let radiusY = boxCoor.height / 2;
        context.beginPath();
        context.ellipse(mouseDown.x, mouseDown.y, radiusX, radiusY, Math.PI / 4, 0, Math.PI * 2);
        context.stroke();
    }
}







  return (
    <div>
    <ToolBar handleLineSize={handleLineSize} lineSize={lineSize} SketchPicker={SketchPicker} color={color} handleColorChange={handleColorChange} changeTool={changeTool}/>
    <canvas
    onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        ref={canvasRef}
      />
    <a href="#" id="img-file" download="image.png">Download Image</a>

    </div>
  );
}

export default App;
