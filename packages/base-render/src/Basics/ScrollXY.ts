export function getCurrentScrollXY(scrollTimer: any) {
    const scene = scrollTimer.getScene();
    const viewport = scrollTimer.getViewportByCoord(scene);
    const scrollX = 0;
    const scrollY = 0;
    if (!viewport) {
        return {
            scrollX,
            scrollY,
        };
    }
    const actualScroll = viewport.getActualScroll(viewport.scrollX, viewport.scrollY);
    return {
        scrollX: actualScroll.x,
        scrollY: actualScroll.y,
    };
}
