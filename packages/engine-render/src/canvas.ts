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

import type { Nullable } from '@univerjs/core';
import type { ICanvasColorService } from './services/canvas-color.service';
import { getDevicePixelRatio } from './basics/draw';
import { createCanvasElement } from './basics/tools';
import { UniverPrintingContext, UniverRenderingContext } from './context';

/**
 * canvas render mode
 */
export enum CanvasRenderMode {
    /**
     * Normal canvas render mode
     */
    Rendering,
    /**
     * Printing render mode,
     * in case of to generate high dpi pdf,
     * some canvas api was disabled by some unknown reason.
     */
    Printing,
}

interface ICanvasProps {
    colorService?: ICanvasColorService;
    id?: string;
    width?: number;
    height?: number;
    pixelRatio?: number;
    mode?: CanvasRenderMode;
}

/**
 * View Renderer constructor. It is a wrapper around native canvas element.
 * Usually you don't need to use it manually.
 * @constructor
 * @abstract
 * @param {object} props
 * @param {number} props.width
 * @param {number} props.height
 * @param {number} props.pixelRatio
 */
export class Canvas {
    isCache = false;

    private _pixelRatio = 1;
    private _canvasEle: Nullable<HTMLCanvasElement>;
    private _context: Nullable<UniverRenderingContext>;
    private _width = 0;
    private _height = 0;

    constructor(_props?: ICanvasProps) {
        const props = _props || {};

        this._canvasEle = createCanvasElement();
        // set inline styles
        this._canvasEle.style.padding = '0';
        this._canvasEle.style.margin = '0';
        this._canvasEle.style.border = '0';
        this._canvasEle.style.background = 'transparent';
        this._canvasEle.style.position = 'absolute';
        this._canvasEle.style.top = '0';
        this._canvasEle.style.left = '0';
        this._canvasEle.style.zIndex = '8';

        this._canvasEle.dataset.uComp = 'render-canvas';

        // focusable
        this._canvasEle.tabIndex = 1;
        this._canvasEle.style.touchAction = 'none';
        this._canvasEle.style.outline = '0';

        const context = this._canvasEle.getContext('2d');
        if (context == null) {
            throw new Error('context is not support');
        }

        if (props.mode === CanvasRenderMode.Printing) {
            this._context = new UniverPrintingContext(context);
        } else {
            this._context = new UniverRenderingContext(context, {
                canvasColorService: props.colorService,
            });
        }

        this.setSize(props.width, props.height, props.pixelRatio);
    }

    getCanvasEle() {
        return this._canvasEle!;
    }

    /**
     * get canvas context
     * @method
     * @returns {CanvasContext} context
     */
    getContext() {
        return this._context!;
    }

    getPixelRatio() {
        return this._pixelRatio;
    }

    getWidth() {
        return this._width;
    }

    getHeight() {
        return this._height;
    }

    setId(id: string) {
        this._canvasEle!.id = id;
    }

    /**
     * Resize canvas when width or height or devicePixelRatio changed.
     * @param width
     * @param height
     * @param devicePixelRatio
     */
    setSize(width?: number, height?: number, devicePixelRatio?: number) {
        this._pixelRatio = devicePixelRatio || getDevicePixelRatio();
        const canvasElement = this.getCanvasEle();

        if (canvasElement && width !== undefined) {
            // canvasElement.width & height requires integer value.
            // canvasElement.width would return a integer even you set a decimal number.
            canvasElement.width = width * this._pixelRatio;
            this._width = canvasElement.width / this._pixelRatio;
            canvasElement.style.width = `${this._width}px`;
        }

        if (canvasElement && height !== undefined) {
            canvasElement.height = height * this._pixelRatio;
            this._height = canvasElement.height / this._pixelRatio;
            canvasElement.style.height = `${this._height}px`;
        }

        this.getContext()?.setTransform(this._pixelRatio, 0, 0, this._pixelRatio, 0, 0);
    }

    setPixelRatio(pixelRatio: number) {
        if (this._width === 0 || this._height === 0) {
            return;
        }
        if (pixelRatio < 1) {
            pixelRatio = 1;
        }
        this.setSize(this._width, this._height, pixelRatio);
    }

    dispose() {
        this.clear();
        this._canvasEle?.remove();
        this._canvasEle = null;
        this._context = null;
    }

    clear() {
        const ctx = this.getContext();
        ctx.clearRect(0, 0, this._width * this._pixelRatio, this._height * this._pixelRatio);
    }

    /**
     * to data url
     * @method
     * @param {string} mimeType
     * @param {number} quality between 0 and 1 for jpg mime types
     * @returns {string} data url string
     */
    toDataURL(mimeType: string, quality: number) {
        try {
            // If this call fails (due to browser bug, like in Firefox 3.6),
            // then revert to previous no-parameter image/png behavior
            return this.getCanvasEle().toDataURL(mimeType, quality);
        } catch (e) {
            try {
                return this.getCanvasEle().toDataURL();
            } catch (err: unknown) {
                const { message } = err as Error;
                console.error(
                    `Unable to get data URL. ${message} For more info read https://universheet.net/docs/Canvas.html.`
                );
                return '';
            }
        }
    }
}

export class SceneCanvas extends Canvas {
    constructor(props: ICanvasProps = { width: 0, height: 0 }) {
        super(props);
        this.setSize(props.width!, props.height!);
    }
}

export class HitCanvas extends Canvas {
    hitCanvas = true;

    constructor(props: ICanvasProps = { width: 0, height: 0 }) {
        super(props);
        this.setSize(props.width!, props.height!);
    }
}
