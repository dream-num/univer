/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { BaseObject } from '../base-object';
import type { IBoundRect } from './vector2';

export function getOffsetRectForDom(ele: HTMLElement) {
    const box = ele.getBoundingClientRect();
    const body = document.body;
    const docElem = document.documentElement;
    // 获取页面的 scrollTop,scrollLeft(兼容性写法)
    const scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
    const scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
    const clientTop = docElem.clientTop || body.clientTop;
    const clientLeft = docElem.clientLeft || body.clientLeft;
    const top = box.top + scrollTop - clientTop;
    const left = box.left + scrollLeft - clientLeft;

    return {
        // Math.round 兼容火狐浏览器 bug
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
