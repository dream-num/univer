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

import type { ImageSourceType, Injector, IObjectPositionH, IObjectPositionV, ISize, ITextRangeParam } from '@univerjs/core';
import type { IDocImage, IUpdateDocDrawingWrappingStyleParams, TextWrappingStyle } from '@univerjs/docs-drawing';
import type { FDocument } from '@univerjs/docs/facade';
import {
    ArrangeTypeEnum,
    DrawingTypeEnum,
    ICommandService,
} from '@univerjs/core';
import {
    RemoveDocDrawingCommand,
    SetDocDrawingArrangeCommand,
    UpdateDocDrawingWrappingStyleCommand,
    UpdateDrawingDocTransformCommand,
} from '@univerjs/docs-drawing';

/**
 * Facade API for an image in a document.
 * @hideconstructor
 */
export class FDocumentImage {
    constructor(
        private readonly _document: FDocument,
        private readonly _imageId: string,
        private readonly _injector: Injector
    ) {}

    /**
     * Gets the id of the document containing the image.
     * @returns {string} The document unit id.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const image = fDocument.getImages()[0];
     *
     * if (image) {
     *   console.log(image.getUnitId());
     * }
     * ```
     */
    getUnitId(): string {
        return this._document.getId();
    }

    /**
     * Gets the drawing id of the image.
     * @returns {string} The drawing id.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const image = fDocument.getImages()[0];
     *
     * if (image) {
     *   console.log(image.getId());
     * }
     * ```
     */
    getId(): string {
        return this._imageId;
    }

    /**
     * Gets the image source supplied at insertion time.
     * @returns {string | undefined} The image source, or `undefined` when the image no longer exists.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const image = fDocument.getImages()[0];
     *
     * if (image) {
     *   console.log(image.getSource());
     * }
     * ```
     */
    getSource(): string | undefined {
        return this.getImageData()?.source;
    }

    /**
     * Gets the image source type supplied at insertion time.
     * @returns {ImageSourceType | undefined} The image source type, or `undefined` when the image no longer exists.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const image = fDocument.getImages()[0];
     *
     * if (image) {
     *   console.log(image.getSourceType());
     * }
     * ```
     */
    getSourceType(): ImageSourceType | undefined {
        return this.getImageData()?.imageSourceType;
    }

    /**
     * Gets the current image size.
     * @returns {ISize | null} The width and height in pixels, or `null` when the image no longer exists.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const image = fDocument.getImages()[0];
     *
     * if (image) {
     *   console.log(image.getSize());
     * }
     * ```
     */
    getSize(): ISize | null {
        return this.getImageData()?.docTransform.size ?? null;
    }

    /**
     * Gets the current clockwise rotation angle.
     * @returns {number | undefined} The rotation angle in degrees, or `undefined` when the image no longer exists.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const image = fDocument.getImages()[0];
     *
     * if (image) {
     *   console.log(image.getAngle());
     * }
     * ```
     */
    getAngle(): number | undefined {
        return this.getImageData()?.docTransform.angle;
    }

    /**
     * Gets the current horizontal position.
     * @returns {IObjectPositionH | null} The horizontal position, or `null` when the image no longer exists.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const image = fDocument.getImages()[0];
     *
     * if (image) {
     *   console.log(image.getPositionH());
     * }
     * ```
     */
    getPositionH(): IObjectPositionH | null {
        return this.getImageData()?.docTransform.positionH ?? null;
    }

    /**
     * Gets the current vertical position.
     * @returns {IObjectPositionV | null} The vertical position, or `null` when the image no longer exists.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const image = fDocument.getImages()[0];
     *
     * if (image) {
     *   console.log(image.getPositionV());
     * }
     * ```
     */
    getPositionV(): IObjectPositionV | null {
        return this.getImageData()?.docTransform.positionV ?? null;
    }

    /**
     * Gets the current raw document image data.
     * @returns {IDocImage | null} The image data, or `null` when the image no longer exists.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const image = fDocument.getImages()[0];
     *
     * if (image) {
     *   console.log(image.getImageData());
     * }
     * ```
     */
    getImageData(): IDocImage | null {
        const drawing = this._document.getDocumentDataModel().getDrawings()?.[this._imageId];
        if (!drawing || drawing.drawingType !== DrawingTypeEnum.DRAWING_IMAGE) {
            return null;
        }
        return drawing as IDocImage;
    }

    /**
     * Sets the image size.
     * @param {number} width The width in pixels.
     * @param {number} height The height in pixels.
     * @returns {boolean} `true` when the update command succeeds; otherwise, `false`.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const image = fDocument.getImages()[0];
     *
     * if (image) {
     *   const success = image.setSize(400, 300);
     *   console.log(success);
     * }
     * ```
     */
    setSize(width: number, height: number): boolean {
        return this._updateTransform('size', { width, height });
    }

    /**
     * Sets the clockwise rotation angle.
     * @param {number} angle The rotation angle in degrees.
     * @returns {boolean} `true` when the update command succeeds; otherwise, `false`.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const image = fDocument.getImages()[0];
     *
     * if (image) {
     *   const success = image.setRotate(45);
     *   console.log(success);
     * }
     * ```
     */
    setRotate(angle: number): boolean {
        return this._updateTransform('angle', angle);
    }

    /**
     * Sets the horizontal position of the image.
     * Inline images are positioned by their document placeholder, so this has a visible effect only when the image
     * wrapping style is not `TextWrappingStyle.INLINE`.
     * @param {IObjectPositionH} positionH The horizontal position relative to the document.
     * @returns {boolean} `true` when the update command succeeds; otherwise, `false`.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const image = fDocument.getImages()[0];
     *
     * if (image) {
     *   const success = image.setPositionH({
     *     relativeFrom: univerAPI.Enum.DocsImageRelativeFromH.MARGIN,
     *     posOffset: 100
     *   });
     *   console.log(success);
     * }
     * ```
     */
    setPositionH(positionH: IObjectPositionH): boolean {
        return this._updateTransform('positionH', positionH);
    }

    /**
     * Sets the vertical position of the image.
     * Inline images are positioned by their document placeholder, so this has a visible effect only when the image
     * wrapping style is not `TextWrappingStyle.INLINE`.
     * @param {IObjectPositionV} positionV The vertical position relative to the document.
     * @returns {boolean} `true` when the update command succeeds; otherwise, `false`.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const image = fDocument.getImages()[0];
     *
     * if (image) {
     *   const success = image.setPositionV({
     *     relativeFrom: univerAPI.Enum.DocsImageRelativeFromV.MARGIN,
     *     posOffset: 100
     *   });
     *   console.log(success);
     * }
     * ```
     */
    setPositionV(positionV: IObjectPositionV): boolean {
        return this._updateTransform('positionV', positionV);
    }

    /**
     * Sets the image wrapping style.
     * When switching from inline to a floating style in a UI environment, the current visual position is preserved.
     * @param {TextWrappingStyle} wrappingStyle The wrapping style to apply.
     * @returns {boolean} `true` when the update command succeeds; otherwise, `false`.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const image = fDocument.getImages()[0];
     *
     * if (image) {
     *   const success = image.setWrappingStyle(univerAPI.Enum.DocsImageWrappingStyle.WRAP_SQUARE);
     *   console.log(success);
     * }
     * ```
     */
    setWrappingStyle(wrappingStyle: TextWrappingStyle): boolean {
        const image = this.getImageData();
        if (!image) {
            return false;
        }

        return this._injector.get(ICommandService).syncExecuteCommand<IUpdateDocDrawingWrappingStyleParams>(
            UpdateDocDrawingWrappingStyleCommand.id,
            {
                unitId: this.getUnitId(),
                subUnitId: this.getUnitId(),
                drawings: [image],
                wrappingStyle,
            }
        );
    }

    /**
     * Moves the image forward by one level in the drawing order.
     * @returns {boolean} `true` when the arrange command succeeds; otherwise, `false`.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const image = fDocument.getImages()[0];
     *
     * if (image) {
     *   const success = image.setForward();
     *   console.log(success);
     * }
     * ```
     */
    setForward(): boolean {
        return this._arrange(ArrangeTypeEnum.forward);
    }

    /**
     * Moves the image backward by one level in the drawing order.
     * @returns {boolean} `true` when the arrange command succeeds; otherwise, `false`.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const image = fDocument.getImages()[0];
     *
     * if (image) {
     *   const success = image.setBackward();
     *   console.log(success);
     * }
     * ```
     */
    setBackward(): boolean {
        return this._arrange(ArrangeTypeEnum.backward);
    }

    /**
     * Moves the image to the back of the drawing order.
     * @returns {boolean} `true` when the arrange command succeeds; otherwise, `false`.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const image = fDocument.getImages()[0];
     *
     * if (image) {
     *   const success = image.setBack();
     *   console.log(success);
     * }
     * ```
     */
    setBack(): boolean {
        return this._arrange(ArrangeTypeEnum.back);
    }

    /**
     * Moves the image to the front of the drawing order.
     * @returns {boolean} `true` when the arrange command succeeds; otherwise, `false`.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const image = fDocument.getImages()[0];
     *
     * if (image) {
     *   const success = image.setFront();
     *   console.log(success);
     * }
     * ```
     */
    setFront(): boolean {
        return this._arrange(ArrangeTypeEnum.front);
    }

    /**
     * Removes the image and its document placeholder.
     * @returns {boolean} `true` when the remove command succeeds; otherwise, `false`.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const image = fDocument.getImages()[0];
     *
     * if (image) {
     *   const success = image.remove();
     *   console.log(success);
     * }
     * ```
     */
    remove(): boolean {
        const image = this.getImageData();
        const textRange = this._getTextRange();
        if (!image || !textRange) {
            return false;
        }

        return this._injector.get(ICommandService).syncExecuteCommand(RemoveDocDrawingCommand.id, {
            unitId: this.getUnitId(),
            drawings: [{
                unitId: this.getUnitId(),
                subUnitId: this.getUnitId(),
                drawingId: this._imageId,
                drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            }],
            textRange,
        });
    }

    private _updateTransform(
        key: 'size' | 'angle' | 'positionH' | 'positionV',
        value: ISize | number | IObjectPositionH | IObjectPositionV
    ): boolean {
        return this._injector.get(ICommandService).syncExecuteCommand(UpdateDrawingDocTransformCommand.id, {
            unitId: this.getUnitId(),
            subUnitId: this.getUnitId(),
            drawings: [{ drawingId: this._imageId, key, value }],
        });
    }

    private _arrange(arrangeType: ArrangeTypeEnum): boolean {
        return this._injector.get(ICommandService).syncExecuteCommand(SetDocDrawingArrangeCommand.id, {
            unitId: this.getUnitId(),
            subUnitId: this.getUnitId(),
            drawingIds: [this._imageId],
            arrangeType,
        });
    }

    private _getTextRange(): ITextRangeParam | null {
        const snapshot = this._document.getDocumentDataModel().getSnapshot();
        const { body, headers = {}, footers = {} } = snapshot;
        const segments = [
            { segmentId: '', body },
            ...Object.entries(headers).map(([segmentId, header]) => ({ segmentId, body: header.body })),
            ...Object.entries(footers).map(([segmentId, footer]) => ({ segmentId, body: footer.body })),
        ];

        for (const { segmentId, body } of segments) {
            const customBlock = body?.customBlocks?.find((block) => block.blockId === this._imageId);
            if (customBlock) {
                return {
                    startOffset: customBlock.startIndex,
                    endOffset: customBlock.startIndex,
                    collapsed: true,
                    segmentId,
                };
            }
        }

        return null;
    }
}
