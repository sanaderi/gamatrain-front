/**
 * An inline <svg> without a viewBox is drawn through a fixed 300x150 window, so a larger drawing (for example a
 * 460x310 diagram) is cut off at the bottom and the right. This works out the viewBox from the drawing itself.
 * It needs the element to be attached and visible, because it relies on getBBox().
 */
export function computeSvgViewBox(svg: SVGGraphicsElement): string | null {
  if (svg.hasAttribute('viewBox')) {
    return null
  }

  let box: DOMRect
  try {
    box = svg.getBBox()
  }
  catch {
    return null
  }

  if (!box.width || !box.height) {
    return null
  }

  // Keep the drawing's own outer margin: start at the origin (or a little before any negative coordinates) and add
  // 10 units on the far side, which is the margin the diagrams are laid out with.
  const minX = Math.min(0, Math.floor(box.x) - 2)
  const minY = Math.min(0, Math.floor(box.y) - 2)
  const width = Math.ceil(box.x + box.width + 10) - minX
  const height = Math.ceil(box.y + box.height + 10) - minY

  return `${minX} ${minY} ${width} ${height}`
}

export function ensureSvgViewBoxes(root: ParentNode | null | undefined) {
  root?.querySelectorAll('svg').forEach((svg) => {
    const viewBox = computeSvgViewBox(svg as unknown as SVGGraphicsElement)
    if (viewBox) {
      svg.setAttribute('viewBox', viewBox)
    }
  })
}
