import Paper, { Point } from 'paper'

const ZOOM_FACTOR = 1.2
const PAN_FACTOR = 0.5

function changeZoom(delta: number, point: paper.Point) {
  const oldZoom = Paper.view.zoom
  const c = Paper.view.center
  const zoom = delta < 0 ? oldZoom * ZOOM_FACTOR : oldZoom / ZOOM_FACTOR
  const beta = oldZoom / zoom
  const pc = point.subtract(c)
  const offset = point.subtract(pc.multiply(beta)).subtract(c)
  return { zoom, offset }
}

export function zoomOnWheel(e: WheelEvent) {
  e.preventDefault()

  const view = Paper.view

  if (e.ctrlKey) {
    // Pan up and down
    const delta = new Point(0, PAN_FACTOR * e.deltaY)
    view.center = view.center.add(delta)
  } else if (e.shiftKey) {
    // Pan left and right
    const delta = new Point(PAN_FACTOR * e.deltaY, 0)
    view.center = view.center.add(delta)
  } else {
    const viewPosition = view.viewToProject(new Point(e.offsetX, e.offsetY))
    const transform = changeZoom(e.deltaY, viewPosition)
    if (transform.zoom < 10 && transform.zoom > 0.01) {
      view.zoom = transform.zoom
      view.center = view.center.add(transform.offset)
    }
  }
  return false
}

export function resetZoom(center: paper.Point) {
  Paper.view.center = center
  Paper.view.zoom = 1
}
