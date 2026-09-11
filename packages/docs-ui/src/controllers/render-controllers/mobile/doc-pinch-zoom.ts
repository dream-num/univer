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

import type { ICommandService, IContextService } from '@univerjs/core';
import type { DocSelectionManagerService } from '@univerjs/docs';
import type { Engine, Scene, Viewport } from '@univerjs/engine-render';
import type { DocViewScaleService } from '../../../services/doc-view-scale';
import { Disposable, toDisposable } from '@univerjs/core';
import { Vector2 } from '@univerjs/engine-render';
import { MobileZoomIndicator } from '@univerjs/ui';
import { SetDocZoomRatioOperation } from '../../../commands/operations/set-doc-zoom-ratio.operation';
import { MOBILE_DOC_PINCH_ZOOMING } from '../../../consts/mobile-context';

const MOBILE_DOC_ZOOM_MIN = 0.5;
const MOBILE_DOC_ZOOM_MAX = 3;

export function resolveMobileDocPinchZoomRatio(
    initialZoomRatio: number,
    initialDistance: number,
    currentDistance: number
): number {
    if (initialDistance <= 0 || !Number.isFinite(currentDistance)) {
        return initialZoomRatio;
    }

    const ratio = initialZoomRatio * currentDistance / initialDistance;
    return Math.round(Math.max(MOBILE_DOC_ZOOM_MIN, Math.min(MOBILE_DOC_ZOOM_MAX, ratio)) * 100) / 100;
}

interface IMobileDocPinchZoomGestureOptions {
    canvasElement: HTMLCanvasElement;
    commandService: ICommandService;
    contextService: IContextService;
    docViewScaleService: DocViewScaleService;
    engine: Engine;
    scene: Scene;
    textSelectionManagerService: DocSelectionManagerService;
    unitId: string;
    viewport: Viewport;
}

export class MobileDocPinchZoomGesture extends Disposable {
    private readonly _zoomIndicator: MobileZoomIndicator;
    private _gestureOwned = false;
    private _pinchZooming = false;
    private _initialDistance = 0;
    private _initialZoomRatio = 1;
    private _anchor = Vector2.Zero();

    constructor(private readonly _options: IMobileDocPinchZoomGestureOptions) {
        super();

        const { canvasElement } = _options;
        this._zoomIndicator = new MobileZoomIndicator(canvasElement);
        this.disposeWithMe(this._zoomIndicator);
        canvasElement.addEventListener('touchstart', this._handleTouchStart, { passive: false });
        canvasElement.addEventListener('touchmove', this._handleTouchMove, { passive: false });
        canvasElement.addEventListener('touchend', this._handleTouchEnd, { passive: false });
        canvasElement.addEventListener('touchcancel', this._handleTouchCancel, { passive: false });
        this.disposeWithMe(toDisposable(() => {
            canvasElement.removeEventListener('touchstart', this._handleTouchStart);
            canvasElement.removeEventListener('touchmove', this._handleTouchMove);
            canvasElement.removeEventListener('touchend', this._handleTouchEnd);
            canvasElement.removeEventListener('touchcancel', this._handleTouchCancel);
            this._finishPinch();
        }));
    }

    private readonly _handleTouchStart = (event: TouchEvent): void => {
        const { contextService, docViewScaleService, scene, viewport } = this._options;
        if (event.touches.length !== 2 || scene.objectsEvented === false) {
            return;
        }

        this._gestureOwned = true;
        this._pinchZooming = true;
        contextService.setContextValue(MOBILE_DOC_PINCH_ZOOMING, true);
        const [touch1, touch2] = event.touches;
        this._initialDistance = this._getTouchDistance(touch1, touch2);
        this._initialZoomRatio = docViewScaleService.getUserZoomRatio();
        this._anchor = viewport.transformVector2SceneCoord(this._getPinchCenter(touch1, touch2));
        this._zoomIndicator.show(Math.round(this._initialZoomRatio * 100));
        event.preventDefault();
    };

    private readonly _handleTouchMove = (event: TouchEvent): void => {
        if (!this._gestureOwned || !this._pinchZooming || event.touches.length !== 2) {
            return;
        }

        const { commandService, docViewScaleService, unitId, viewport } = this._options;
        const [touch1, touch2] = event.touches;
        const nextZoomRatio = resolveMobileDocPinchZoomRatio(
            this._initialZoomRatio,
            this._initialDistance,
            this._getTouchDistance(touch1, touch2)
        );
        if (Math.abs(nextZoomRatio - docViewScaleService.getUserZoomRatio()) >= 0.01) {
            commandService.syncExecuteCommand(SetDocZoomRatioOperation.id, { unitId, zoomRatio: nextZoomRatio });
        }

        const currentPoint = viewport.transformVector2SceneCoord(this._getPinchCenter(touch1, touch2));
        viewport.scrollByViewportDeltaVal({
            viewportScrollX: this._anchor.x - currentPoint.x,
            viewportScrollY: this._anchor.y - currentPoint.y,
        });
        this._zoomIndicator.show(Math.round(nextZoomRatio * 100));
        event.preventDefault();
    };

    private readonly _handleTouchEnd = (event: TouchEvent): void => {
        if (!this._gestureOwned) {
            return;
        }
        if (event.touches.length < 2 && this._pinchZooming) {
            this._pinchZooming = false;
            this._zoomIndicator.hide();
        }
        if (event.touches.length === 0) {
            this._finishPinch();
        }
    };

    private readonly _handleTouchCancel = (): void => this._finishPinch();

    private _getTouchPoint(touch: Touch): Vector2 {
        const { canvasElement, engine } = this._options;
        const rect = canvasElement.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) {
            return Vector2.FromArray([touch.clientX - rect.left, touch.clientY - rect.top]);
        }

        return Vector2.FromArray([
            (touch.clientX - rect.left) * engine.width / rect.width,
            (touch.clientY - rect.top) * engine.height / rect.height,
        ]);
    }

    private _getPinchCenter(touch1: Touch, touch2: Touch): Vector2 {
        const first = this._getTouchPoint(touch1);
        const second = this._getTouchPoint(touch2);
        return Vector2.FromArray([(first.x + second.x) / 2, (first.y + second.y) / 2]);
    }

    private _getTouchDistance(touch1: Touch, touch2: Touch): number {
        const first = this._getTouchPoint(touch1);
        const second = this._getTouchPoint(touch2);
        return Math.hypot(first.x - second.x, first.y - second.y);
    }

    private _finishPinch(): void {
        if (!this._gestureOwned) {
            return;
        }
        this._gestureOwned = false;
        this._pinchZooming = false;
        this._options.contextService.setContextValue(MOBILE_DOC_PINCH_ZOOMING, false);
        this._zoomIndicator.hide();
        this._options.textSelectionManagerService.refreshSelection();
    }
}
