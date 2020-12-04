import React, { useState, useEffect, useRef } from "react";
import { SketchPicker } from 'react-color';

function ToolBar(props) {
  return (
    <div className= "wrapper">
      <div className= "toolbar">
      <a className="selected" href="#" id="open" onClick="OpenImage()">Open</a>
      <a href="#" id="save" onClick="SaveImage()">Save</a>
      <a href="#" id="brush" onClick={props.changeTool}>Brush</a>
      <a href="#" id="line" onClick={props.changeTool}>Line</a>
      <a href="#" id="rectangle" onClick={props.changeTool}>Rectangle</a>
      <a href="#" id="ellipse" onClick={props.changeTool}>Ellipse</a>
      <a href="#" id="circle" onClick={props.changeTool}>Circle</a>
      <a href="#" id="polygon" onClick={props.changeTool}>Polygon</a>
      <label>
         <input
           id="typeinp"
           type="range"
           min="0" max="20"
           value={props.lineSize}
           onChange={props.handleLineSize}
           step="1"/>
         {props.lineSize}
       </label>
       <SketchPicker color={ props.color }
       onChangeComplete={ props.handleColorChange }/>
    </div>
    </div>
  );
}

export default ToolBar;
