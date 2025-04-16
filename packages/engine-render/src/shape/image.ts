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

import type { ISrcRect, Nullable, PresetGeometryType } from '@univerjs/core';

import type { IObjectFullState, ITransformChangeState, IViewportInfo } from '../basics';
import type { UniverRenderingContext } from '../context';
import type { Scene } from '../scene';
import type { IShapeProps } from './shape';
import { ObjectType } from '../base-object';
import { RENDER_CLASS_TYPE, Vector2 } from '../basics';
import { offsetRotationAxis } from '../basics/offset-rotation-axis';
import { Shape } from './shape';

export interface IImageProps extends IShapeProps {
    image?: HTMLImageElement;
    url?: string;
    success?: () => void;
    fail?: () => void;
    /**
     * 20.1.8.55 srcRect (Source Rectangle)
     */
    srcRect?: Nullable<ISrcRect>;

    /**
     * 20.1.9.18 prstGeom (Preset geometry)
     */
    prstGeom?: Nullable<PresetGeometryType>;

    opacity?: number;
}

export class Image extends Shape<IImageProps> {
    protected _props: IImageProps;

    protected _native: Nullable<HTMLImageElement>;

    private _renderByCropper: boolean = false;

    private _transformCalculateSrcRect: boolean = true;

    override objectType = ObjectType.IMAGE;

    constructor(id: string, config: IImageProps) {
        super(id, config);
        this._props = {
            ...config,
        };

        if (config.image) {
            this._native = config.image;
            this._native.crossOrigin = 'anonymous';
            this.makeDirty(true);
        } else if (config.url) {
            this._native = document.createElement('img');
            this._native.src = config.url;
            this._native.crossOrigin = 'anonymous';
            this._native.onload = () => {
                config.success?.();
                this.makeDirty(true);
                (this.getEngine()?.activeScene as Scene)?.onFileLoaded$.emitEvent(id);
            };
            this._native.onerror = () => {
                if (config.fail) {
                    config.fail();
                } else {
                    this._native!.src =
                        'data:image/svg+xml;base64,PHN2ZyBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PHBhdGggZD0iTTMwNC4xMjggNDU2LjE5MmM0OC42NCAwIDg4LjA2NC0zOS40MjQgODguMDY0LTg4LjA2NHMtMzkuNDI0LTg4LjA2NC04OC4wNjQtODguMDY0LTg4LjA2NCAzOS40MjQtODguMDY0IDg4LjA2NCAzOS40MjQgODguMDY0IDg4LjA2NCA4OC4wNjR6bTAtMTE2LjIyNGMxNS4zNiAwIDI4LjE2IDEyLjI4OCAyOC4xNiAyOC4xNnMtMTIuMjg4IDI4LjE2LTI4LjE2IDI4LjE2LTI4LjE2LTEyLjI4OC0yOC4xNi0yOC4xNiAxMi4yODgtMjguMTYgMjguMTYtMjguMTZ6IiBmaWxsPSIjZTZlNmU2Ii8+PHBhdGggZD0iTTg4Ny4yOTYgMTU5Ljc0NEgxMzYuNzA0Qzk2Ljc2OCAxNTkuNzQ0IDY0IDE5MiA2NCAyMzIuNDQ4djU1OS4xMDRjMCAzOS45MzYgMzIuMjU2IDcyLjcwNCA3Mi43MDQgNzIuNzA0aDE5OC4xNDRMNTAwLjIyNCA2ODguNjRsLTM2LjM1Mi0yMjIuNzIgMTYyLjMwNC0xMzAuNTYtNjEuNDQgMTQzLjg3MiA5Mi42NzIgMjE0LjAxNi0xMDUuNDcyIDE3MS4wMDhoMzM1LjM2QzkyNy4yMzIgODY0LjI1NiA5NjAgODMyIDk2MCA3OTEuNTUyVjIzMi40NDhjMC0zOS45MzYtMzIuMjU2LTcyLjcwNC03Mi43MDQtNzIuNzA0em0tMTM4Ljc1MiA3MS42OHYuNTEySDg1Ny42YzE2LjM4NCAwIDMwLjIwOCAxMy4zMTIgMzAuMjA4IDMwLjIwOHYzOTkuODcyTDY3My4yOCA0MDguMDY0bDc1LjI2NC0xNzYuNjR6TTMwNC42NCA3OTIuMDY0SDE2NS44ODhjLTE2LjM4NCAwLTMwLjIwOC0xMy4zMTItMzAuMjA4LTMwLjIwOHYtOS43MjhsMTM4Ljc1Mi0xNjQuMzUyIDEwNC45NiAxMjQuNDE2LTc0Ljc1MiA3OS44NzJ6bTgxLjkyLTM1NS44NGwzNy4zNzYgMjI4Ljg2NC0uNTEyLjUxMi0xNDIuODQ4LTE2OS45ODRjLTMuMDcyLTMuNTg0LTkuMjE2LTMuNTg0LTEyLjI4OCAwTDEzNS42OCA2NTIuOFYyNjIuMTQ0YzAtMTYuMzg0IDEzLjMxMi0zMC4yMDggMzAuMjA4LTMwLjIwOGg0NzQuNjI0TDM4Ni41NiA0MzYuMjI0em01MDEuMjQ4IDMyNS42MzJjMCAxNi44OTYtMTMuMzEyIDMwLjIwOC0yOS42OTYgMzAuMjA4SDY4MC45Nmw1Ny4zNDQtOTMuMTg0LTg3LjU1Mi0yMDIuMjQgNy4xNjgtNy42OCAyMjkuODg4IDI3Mi44OTZ6IiBmaWxsPSIjZTZlNmU2Ii8+PC9zdmc+';
                    this.makeDirty(true);
                }
            };
        }

        this._init();
    }

    get srcRect() {
        return this._props.srcRect;
    }

    get prstGeom() {
        return this._props.prstGeom;
    }

    get opacity() {
        return this._props.opacity ?? 1;
    }

    setOpacity(opacity: number) {
        this._props.opacity = opacity;
        this.makeDirty(true);
    }

    override get classType(): RENDER_CLASS_TYPE {
        return RENDER_CLASS_TYPE.IMAGE;
    }

    transformByStateCloseCropper(option: IObjectFullState) {
        this._transformCalculateSrcRect = false;
        this.transformByState(option);
        this._transformCalculateSrcRect = true;
    }

    changeSource(url: string) {
        if (this._native == null) {
            this._native = document.createElement('img');
        }
        this._native.src = url;
        this._native.onload = () => {
            this.makeDirty(true);
        };
    }

    resetSize() {
        if (this._native == null) {
            return;
        }
        this.transformByState({
            width: this._native.width,
            height: this._native.height,
        });
        this.setSrcRect(null);
    }

    setPrstGeom(prstGeom?: Nullable<PresetGeometryType>) {
        this._props.prstGeom = prstGeom;
    }

    setSrcRect(srcRect?: Nullable<ISrcRect>) {
        this._props.srcRect = srcRect;

        this.makeDirty(true);
    }

    getProps(): IImageProps {
        return this._props;
    }

    getNative(): Nullable<HTMLImageElement> {
        return this._native;
    }

    getNativeSize() {
        if (this._native == null) {
            return { width: this.width, height: this.height };
        }
        return { width: this._native.width, height: this._native.height };
    }

    closeRenderByCropper() {
        this._renderByCropper = false;
    }

    openRenderByCropper() {
        this._renderByCropper = true;
        this._transformBySrcRect();
    }
    // override transformForAngle(transform: Transform) {
    //     if (this.angle === 0) {
    //         return transform;
    //     }

    //     let cx = (this.width + this.strokeWidth) / 2;
    //     let cy = (this.height + this.strokeWidth) / 2;
    //     if (this.srcRect != null) {
    //         const { left = 0, top = 0, right = 0, bottom = 0 } = this.srcRect;
    //         cx = (this.width + left + right + this.strokeWidth) / 2;
    //         cy = (this.height + top + bottom + this.strokeWidth) / 2;
    //     }

    //     transform.rotate(-this.angle);
    //     transform.translate(cx, cy);
    //     transform.rotate(this.angle);
    //     transform.translate(-cx, -cy);

    //     return transform;
    // }
    calculateTransformWithSrcRect() {
        const {
            left: imageLeft,
            top: imageTop,
            width: imageWidth,
            height: imageHeight,
        } = this;

        if (this.srcRect == null) {
            return {
                left: imageLeft,
                top: imageTop,
                width: imageWidth,
                height: imageHeight,
                angle: this.angle,
            };
        }
        const { left = 0, top = 0, right = 0, bottom = 0 } = this.srcRect;

        const newLeft = imageLeft - left;
        const newTop = imageTop - top;

        const width = imageWidth + right + left;
        const height = imageHeight + bottom + top;

        return {
            left: newLeft,
            top: newTop,
            width,
            height,
            angle: this.angle,
        };
    }

    private _transformBySrcRect() {
        if (this.srcRect == null) {
            return;
        }
        const { left = 0, top = 0, right = 0, bottom = 0 } = this.srcRect;
        const {
            width: imageWidth,
            height: imageHeight,
        } = this;

        // let newLeft = imageLeft - left;
        // let newTop = imageTop - top;

        // const width = imageWidth + right + left;
        // const height = imageHeight + bottom + top;

        let { left: newLeft, top: newTop, width, height } = this.calculateTransformWithSrcRect();

        if (this.angle !== 0) {
            /**
             * Calculate the offset of the center rotation to correctly position the object entering the cropping.
             */
            const cx = (imageWidth + this.strokeWidth) / 2;
            const cy = (imageHeight + this.strokeWidth) / 2;

            const newCx = width / 2 - left;
            const newCy = height / 2 - top;

            const finalPoint = offsetRotationAxis(new Vector2(cx, cy), this.angle, new Vector2(newLeft, newTop), new Vector2(newCx, newCy));

            newLeft = finalPoint.x;
            newTop = finalPoint.y;
        }

        this.transformByState({
            left: newLeft,
            top: newTop,
            width,
            height,
        });
    }

    override render(mainCtx: UniverRenderingContext, bounds?: IViewportInfo) {
        if (!this.visible) {
            this.makeDirty(false);
            return this;
        }

        // Temporarily ignore the on-demand display of elements within a group：this.isInGroup
        if (this.isRender(bounds)) {
            const { top, left, bottom, right } = bounds!.viewBound;

            if (
                this.width + this.strokeWidth + this.left < left ||
                right < this.left ||
                this.height + this.strokeWidth + this.top < top ||
                bottom < this.top
            ) {
                return this;
            }
        }

        const m = this.transform.getMatrix();
        mainCtx.save();
        mainCtx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        if (this.opacity !== 1) {
            mainCtx.globalAlpha = this.opacity;
        }
        this._draw(mainCtx);
        mainCtx.restore();
        this.makeDirty(false);
        return this;
    }

    protected override _draw(ctx: UniverRenderingContext) {
        if (this._native == null) {
            return;
        }
        if (!this._renderByCropper && this.srcRect) {
            const { left = 0, top = 0, right = 0, bottom = 0 } = this.srcRect;
            ctx.beginPath();
            ctx.rect(0, 0, this.width, this.height);
            ctx.clip();
            ctx.drawImage(this._native, -left, -top, this.width + right + left, this.height + bottom + top);
        } else {
            ctx.drawImage(this._native, 0, 0, this.width, this.height);
        }
    }

    private _init(): void {
        this.onTransformChange$.subscribeEvent((state) => {
            this._updateSrcRectByTransform(state);
        });
    }

    private _updateSrcRectByTransform(state: ITransformChangeState) {
        if (this.srcRect == null || !this._transformCalculateSrcRect) {
            return;
        }
        const { width, height, left, top, angle } = this;
        const { width: preWidth = 0, height: preHeight = 0, left: preLeft = 0, top: preTop = 0, angle: preAngle } = state.preValue as IObjectFullState;
        const { left: srcLeft = 0, top: srcTop = 0, right: srcRight = 0, bottom: srcBottom = 0 } = this.srcRect;

        let newLeft = srcLeft;
        let newTop = srcTop;
        let newRight = srcRight;
        let newBottom = srcBottom;

        let isChange = false;

        if (preWidth !== 0 && preWidth !== width) {
            const preLeftRatio = srcLeft / preWidth;
            const preRightRatio = srcRight / preWidth;

            newLeft = width * preLeftRatio;
            newRight = width * preRightRatio;

            isChange = true;
        }

        if (preHeight !== 0 && preHeight !== height) {
            const preTopRatio = srcTop / preHeight;
            const preBottomRatio = srcBottom / preHeight;

            newTop = height * preTopRatio;
            newBottom = height * preBottomRatio;

            isChange = true;
        }

        if (isChange) {
            this.setSrcRect({
                left: newLeft,
                top: newTop,
                right: newRight,
                bottom: newBottom,
            });
        }
    }
}
