import { BaseObject } from '../BaseObject';
import { ScrollTimer } from '../ScrollTimer';
import { IBoundRect } from './Vector2';

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

export function getOffsetRectForDom(ele: HTMLElement) {
    let box = ele.getBoundingClientRect();
    let body = document.body;
    let docElem = document.documentElement;
    //获取页面的scrollTop,scrollLeft(兼容性写法)
    let scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
    let scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
    let clientTop = docElem.clientTop || body.clientTop;
    let clientLeft = docElem.clientLeft || body.clientLeft;
    let top = box.top + scrollTop - clientTop;
    let left = box.left + scrollLeft - clientLeft;
    return {
        //Math.round 兼容火狐浏览器bug
        top,
        left,
    };
}

export function transformBoundingCoord(object: BaseObject, bounds: IBoundRect) {
    const tl = object.transform.clone().invert().applyPoint(bounds.tl);
    const tr = object.transform.clone().invert().applyPoint(bounds.tr);
    const bl = object.transform.clone().invert().applyPoint(bounds.bl);
    const br = object.transform.clone().invert().applyPoint(bounds.br);

    const xList = [tl.x, tr.x, bl.x, br.x];
    const yList = [tl.y, tr.y, bl.y, br.y];

    const maxX = Math.max(...xList);
    const minX = Math.min(...xList);
    const maxY = Math.max(...yList);
    const minY = Math.min(...yList);

    return {
        minX,
        maxX,
        minY,
        maxY,
    };
}
