import { Point, Rectangle, Size, Path, Color, PointText, Group } from 'paper'

export function createTooltip(name: string, position: paper.Point) {
  const tooltipRect = new Rectangle(
    position.add(new Point(-20, -40)),
    new Size(name.length * 6, 28)
  )
  const tooltipBox = new Path.Rectangle(tooltipRect)
  tooltipBox.fillColor = new Color('white')
  tooltipBox.strokeColor = new Color('black')

  const tooltipText = new PointText(position.add(new Point(-20, -20)))
  tooltipText.content = name
  tooltipText.fitBounds(tooltipRect)

  const tooltip = new Group([tooltipBox, tooltipText])
  tooltip.name = 'tooltip'

  return tooltip
}

export function removeTooltip(context: paper.CompoundPath) {
  const tooltip = context.parent.children.find(i => i.name === 'tooltip')
  if (tooltip) tooltip.remove()
}
