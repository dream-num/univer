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

import type { ThemeService } from '@univerjs/core';
import type { Image, Scene, UniverRenderingContext } from '@univerjs/engine-render';
import { DisposableCollection } from '@univerjs/core';
import { render, unmount } from '@univerjs/design';
import { CURSOR_TYPE, Rect, Vector2 } from '@univerjs/engine-render';
import { ExpandIcon } from '@univerjs/icons';
import { createElement } from 'react';

/** Transient canvas chrome: never part of the image model or its transformer. */
export class MobileImagePreviewButton extends Rect {
    private _enabled = true;
    private readonly _icon = document.createElement('img');
    private readonly _iconContainer = document.createElement('div');
    private readonly _gesture = new DisposableCollection();
    private _pressed = false;
    private _background = '';
    private _border = '';
    private _pressedBackground = '';

    constructor(
        private readonly _image: Image,
        private readonly _scene: Scene,
        themeService: ThemeService,
        preview: () => void
    ) {
        super(`${_image.oKey}-mobile-preview`, { width: 44, height: 44 });
        this.cursor = CURSOR_TYPE.POINTER;
        this.disposeWithMe(this._gesture);
        this.disposeWithMe(_image.onDispose$.subscribeEvent(() => this.dispose()));
        this.disposeWithMe(_image.onTransformChange$.subscribeEvent(() => this._syncPosition()));
        this.disposeWithMe(_scene.onTransformChange$.subscribeEvent(() => this._syncPosition()));
        this.disposeWithMe(_scene.beforeRender$.subscribe(() => this._syncPosition()));
        this.disposeWithMe(themeService.currentTheme$.subscribe(() => {
            this._background = themeService.getColorFromTheme('white');
            this._border = themeService.getColorFromTheme('gray.200');
            this._pressedBackground = themeService.getColorFromTheme('gray.100');
            render(createElement(
                ExpandIcon,
                {
                    width: 20,
                    height: 20,
                    color: themeService.getColorFromTheme('gray.900'),
                    ref: (svg) => {
                        if (svg) {
                            this._icon.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
                        }
                    },
                }
            ), this._iconContainer);
            this.makeDirty(true);
        }));
        this._icon.onload = () => this.makeDirty(true);
        this.disposeWithMe(() => {
            this._icon.onload = null;
            unmount(this._iconContainer);
        });
        this.disposeWithMe(this.onPointerDown$.subscribeEvent((event) => {
            this._gesture.dispose();
            const start = { x: event.offsetX, y: event.offsetY, time: Date.now() };
            let moved = false;
            this._setPressed(true);
            // Let the host handle scrolling, but never attach the image transformer to this button.
            this._gesture.add(_scene.onPointerDown$.subscribeEvent((nextEvent) => {
                if (nextEvent !== event) {
                    moved = true;
                    this._setPressed(false);
                }
            }));
            this._gesture.add(_scene.onPointerMove$.subscribeEvent((moveEvent) => {
                moved ||= Math.hypot(moveEvent.offsetX - start.x, moveEvent.offsetY - start.y) >= 12;
                if (moved) {
                    this._setPressed(false);
                }
            }));
            this._gesture.add(_scene.onPointerCancel$.subscribeEvent(() => {
                this._gesture.dispose();
                this._setPressed(false);
            }));
            this._gesture.add(_scene.onPointerUp$.subscribeEvent((upEvent) => {
                this._gesture.dispose();
                this._setPressed(false);
                if (!moved && this.visible && Date.now() - start.time < 500 &&
                    Math.hypot(upEvent.offsetX - start.x, upEvent.offsetY - start.y) < 12) {
                    preview();
                }
            }));
        }));
        this.disposeWithMe(this.onClick$.subscribeEvent((_event, state) => state.stopPropagation()));
        this.disposeWithMe(this.onDblclick$.subscribeEvent((_event, state) => state.stopPropagation()));
        _scene.addObject(this, _image.getLayerIndex());
        this._syncPosition();
    }

    setPreviewEnabled(enabled: boolean): void {
        this._enabled = enabled;
        this._syncPosition();
    }

    override dispose(): void {
        if (this._disposed) {
            return;
        }
        super.dispose();
    }

    private _setPressed(pressed: boolean): void {
        this._pressed = pressed;
        this.makeDirty(true);
    }

    private _syncPosition(): void {
        const { scaleX, scaleY } = this._scene.getAncestorScale();
        const width = 44 / Math.max(scaleX, 0.01);
        const height = 44 / Math.max(scaleY, 0.01);
        const visible = this._enabled && this._image.visible && !this._image.isInGroup &&
            this._image.width >= width && this._image.height >= height;
        if (visible !== this.visible) {
            visible ? this.show() : this.hide();
        }
        if (!visible) {
            return;
        }
        if (this.layer && this.getLayerIndex() !== this._image.getLayerIndex()) {
            this._scene.removeObject(this);
            this._scene.addObject(this, this._image.getLayerIndex());
        }
        const point = this._image.ancestorTransform.applyPoint(new Vector2(this._image.width, 0));
        const left = point.x - width;
        const top = point.y;
        if (left !== this.left || top !== this.top || width !== this.width || height !== this.height) {
            this.transformByState({ left, top, width, height });
        }
        if (this.zIndex !== this._image.zIndex + 0.5) {
            this.zIndex = this._image.zIndex + 0.5;
        }
    }

    protected override _draw(ctx: UniverRenderingContext): void {
        ctx.save();
        ctx.scale(this.width / 44, this.height / 44);
        ctx.translate(6, 6);
        Rect.drawWith(ctx, {
            width: 32,
            height: 32,
            radius: 8,
            fill: this._pressed ? this._pressedBackground : this._background,
            stroke: this._border,
            strokeWidth: 1,
        });
        if (this._icon.complete && this._icon.naturalWidth > 0) {
            ctx.drawImage(this._icon, 6, 6, 20, 20);
        }
        ctx.restore();
    }
}
