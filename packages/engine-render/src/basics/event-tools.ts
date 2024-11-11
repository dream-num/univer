/**
 * Copyright 2023-present DreamNum Inc.
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

import type { IMouseEvent, IPointerEvent } from './i-events';

export function copyPointEvent<T extends PointerEvent>(originalEvent: T): IPointerEvent | IMouseEvent {
    return {
        pointerId: originalEvent.pointerId + Math.round(Math.random() * 1000),
        bubbles: originalEvent.bubbles,
        cancelable: originalEvent.cancelable,
        view: originalEvent.view,
        detail: originalEvent.detail,
        screenX: originalEvent.screenX,
        screenY: originalEvent.screenY,
        clientX: originalEvent.clientX,
        clientY: originalEvent.clientY,
        ctrlKey: originalEvent.ctrlKey,
        altKey: originalEvent.altKey,
        shiftKey: originalEvent.shiftKey,
        metaKey: originalEvent.metaKey,
        button: originalEvent.button,
        buttons: originalEvent.buttons,
        relatedTarget: originalEvent.relatedTarget,
        // pointerId: originalEvent.pointerId,
        // width: originalEvent.width,
        // height: originalEvent.height,
        // pressure: originalEvent.pressure,
        // tangentialPressure: originalEvent.tangentialPressure,
        // tiltX: originalEvent.tiltX,
        // tiltY: originalEvent.tiltY,
        // twist: originalEvent.twist,
        // pointerType: originalEvent.pointerType,
        // isPrimary: originalEvent.isPrimary

        offsetX: originalEvent.offsetX,
        offsetY: originalEvent.offsetY,
        x: originalEvent.x,
        y: originalEvent.y,
        layerX: originalEvent.layerX,
        layerY: originalEvent.layerY,
        movementX: originalEvent.movementX,
        movementY: originalEvent.movementY,
        timeStamp: originalEvent.timeStamp,
        type: originalEvent.type,
        target: originalEvent.target,
        currentTarget: originalEvent.currentTarget,
        composedPath: originalEvent.composedPath,
        preventDefault: originalEvent.preventDefault,
        stopPropagation: originalEvent.stopPropagation,
        stopImmediatePropagation: originalEvent.stopImmediatePropagation,
        composed: originalEvent.composed,
    } as IPointerEvent | IMouseEvent;
}
