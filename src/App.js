import { TinyColor } from '@ctrl/tinycolor';
import { useState } from 'react';

// console.log(tinycolor)

function clip(x, min, max) {
  return Math.max(min, Math.min(x, max))
}

// Convert html color to rgba
function addAlpha(color, alpha) {
  const c = new TinyColor(color)
  return c.setAlpha(alpha).toRgbString()
}

function ResizableDiv(props) {

  const [width, setWidth] = useState(props.width)
  const [height, setHeight] = useState(props.height)
  const [x, setX] = useState(props.x)
  const [y, setY] = useState(props.y)

  const handleMove = (e) => {
    e.preventDefault()
    e.stopPropagation()

    // Get the height and width as a percentage of it's parent
    const parentWidth = e.target.parentElement.offsetWidth
    const parentHeight = e.target.parentElement.offsetHeight

    const prevX = e.clientX
    const prevY = e.clientY

    const handleMouseMove = (e) => {
      e.preventDefault()
      const { clientX, clientY } = e
      const deltaX = 100 * (clientX - prevX) / parentWidth
      const deltaY = 100 * (clientY - prevY) / parentHeight
      setX(clip(x + deltaX, 0, 100 - width))
      setY(clip(y + deltaY, 0, 100 - height))
    }

    const handleMouseUp = (e) => {
      e.preventDefault()
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const handleResize = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startY = e.clientY

    // Get the height and width as a percentage of it's parent
    // TODO: This assumes the resizing anchor is a direct child of the 
    // TODO: resizableDix Find a more robust way
    const parentWidth = e.target.parentElement.parentElement.offsetWidth
    const parentHeight = e.target.parentElement.parentElement.offsetHeight

    // const startXPercent = 100 * startX / parentWidth
    // const startYPercent = 100 * startY / parentHeight

    const handleMouseMove = (e) => {
      e.preventDefault()
      const { clientX, clientY } = e
      const deltaX = 100 * (clientX - startX) / parentWidth
      const deltaY = 100 * (clientY - startY) / parentHeight

      // setWidth(clip(width + deltaX, 0, 100 - startXPercent))
      // setHeight(clip(height + deltaY, 0, 100 - startYPercent))

      setWidth(width + deltaX)
      setHeight(height + deltaY)
    }

    const handleMouseUp = (e) => {
      e.preventDefault()
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const anchorStyle = {
    position: 'absolute',
    width: 5,
    height: 5,
    backgroundColor: props.color,
    transform: 'translate(-50%, -50%)',
  }

  return (
    <div
      style={{
        cursor: 'move',
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        height: `${height}%`,
        backgroundColor: addAlpha(props.color, 0.2),
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: props.color,
      }}

      onMouseDown={handleMove}
    >
      <div
        className="nw"
        style={{
          ...anchorStyle,
          cursor: 'nw-resize',
          left: 0,
          top: 0,
        }}
      ></div>

      <div
        className="ne"
        style={{
          ...anchorStyle,
          cursor: 'ne-resize',
          left: '100%',
          top: 0,
        }}
      ></div>

      <div
        className="se"
        style={{
          ...anchorStyle,
          cursor: 'se-resize',
          left: '100%',
          top: '100%',
          backgroundColor: '#f00',
          width: 10,
          height: 10,
        }}
        onMouseDown={handleResize}
      ></div>

      <div
        className="sw"
        style={{
          ...anchorStyle,
          cursor: 'sw-resize',
          left: 0,
          top: '100%',
        }}
      ></div>

    </div>
  )
}

function Canvas(props) {
  const [boxes, setBoxes] = useState([[10, 10, 10, 10]])
  const [visBox, setVisBox] = useState({
    box: [0, 0, 0, 0],
    visible: false,
  })

  const handleMouseDown = (e) => {
    e.preventDefault()

    // Get the height and width as a percentage of it's parent
    const parentWidth = e.target.parentElement.offsetWidth
    const parentHeight = e.target.parentElement.offsetHeight
    // console.log(e)
    const startX = 100 * e.nativeEvent.offsetX / parentWidth
    const startY = 100 * e.nativeEvent.offsetY / parentHeight

    const x = 100 * e.clientX / parentWidth
    const y = 100 * e.clientY / parentHeight

    let moving = false

    const handleMouseMove = (e) => {
      e.preventDefault()
      e.stopPropagation()
      moving = true
      const { clientX, clientY } = e
      const width = (100 * clientX / parentWidth) - x
      const height = (100 * clientY / parentHeight) - y
      setVisBox({
        box: [
          startX,
          startY,
          clip(width, 0, 100 - startX),
          clip(height, 0, 100 - startY)
        ],
        visible: true,
      })
    }

    const handleMouseUp = (e) => {
      e.preventDefault()
      e.stopPropagation()

      setVisBox({
        box: [startX, startY, 0, 0],
        visible: false,
      })

      if (moving) {
        const { clientX, clientY } = e
        const width = (100 * clientX / parentWidth) - x
        const height = (100 * clientY / parentHeight) - y
        setBoxes([...boxes, [
          startX,
          startY,
          clip(width, 0, 100 - startX),
          clip(height, 0, 100 - startY)
        ]])
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
      moving = false
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div style={{ width: "fit-content", position: "relative" }}>
      <img draggable={false} alt="testing" src={props.img} />
      <div
        style={{
          height: '100%',
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
        className="App"
        onMouseDown={handleMouseDown}
      >
        {boxes.map(([x, y, w, h], i) => (
          <ResizableDiv
            key={i}
            x={x}
            y={y}
            width={w}
            height={h}
            color={props.color}
          />
        ))}

        {visBox.visible && (
          <div
            style={{
              position: 'absolute',
              left: `${visBox.box[0]}%`,
              top: `${visBox.box[1]}%`,
              width: `${visBox.box[2]}%`,
              height: `${visBox.box[3]}%`,
              backgroundColor: addAlpha(props.color, 0.2),
              border: '1px solid red',
            }}
            x={visBox.box[0]}
            y={visBox.box[1]}
            width={visBox.box[2]}
            height={visBox.box[3]}
          >

          </div>
        )}
      </div>
    </div>
  )
}

function App() {

  return (
    <div className="App" style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center'}}>
      <Canvas
        img="https://source.unsplash.com/500x500"
        color="red"
      />
    </div>
  )
}

export default App
