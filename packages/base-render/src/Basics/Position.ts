import { ScrollTimer } from '../ScrollTimer';

export function getCurrentScrollXY(scrollTimer: ScrollTimer) {
    const scene = scrollTimer.getScene();
    const viewport = scrollTimer.getViewportByCoord(scene);
    let scrollX = 0;
    let scrollY = 0;
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
