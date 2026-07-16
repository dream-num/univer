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

import type { IObjectPositionH, IObjectPositionV, ISize, ITextRangeParam } from '@univerjs/core';
import type { IDocImage } from '@univerjs/docs-drawing';
import {
    BooleanNumber,
    DrawingTypeEnum,
    generateRandomId,
    ICommandService,
    IImageIoService,
    ImageSourceType,
    IURLImageService,
    WrapTextType,
} from '@univerjs/core';
import { buildDocTransform, docDrawingPositionToTransform } from '@univerjs/docs';
import {
    InsertDocDrawingCommand,
    TextWrappingStyle,
    WRAPPING_STYLE_TO_LAYOUT_TYPE,
} from '@univerjs/docs-drawing';
import { FDocument } from '@univerjs/docs/facade';
import { DRAWING_IMAGE_HEIGHT_LIMIT, DRAWING_IMAGE_WIDTH_LIMIT, getImageSize } from '@univerjs/drawing';
import { FDocumentImage } from './f-document-image';

/** Options for inserting an image into a document. */
export interface IFDocumentInsertImageOptions {
    /** The image source. It cannot be changed after insertion. */
    source: string;
    /** The image source type. It cannot be changed after insertion. */
    imageSourceType: ImageSourceType;
    /** The width in pixels. When only width is provided, height is calculated from the intrinsic aspect ratio. */
    width?: number;
    /** The height in pixels. When only height is provided, width is calculated from the intrinsic aspect ratio. */
    height?: number;
    /** The clockwise rotation angle in degrees. Defaults to `0`. */
    angle?: number;
    /**
     * The horizontal position relative to the document. Defaults to the page with an offset of `0`.
     * It has a visible positioning effect only when `wrappingStyle` is not `INLINE`.
     */
    positionH?: IObjectPositionH;
    /**
     * The vertical position relative to the document. Defaults to the paragraph with an offset of `0`.
     * It has a visible positioning effect only when `wrappingStyle` is not `INLINE`.
     */
    positionV?: IObjectPositionV;
    /** The image wrapping style. Defaults to `TextWrappingStyle.INLINE`. */
    wrappingStyle?: TextWrappingStyle;
    /** The document range at which to insert the image. The current selection is used when omitted. */
    textRange?: ITextRangeParam;
}

/** Image facade methods mixed into `FDocument`. */
export interface IFDocumentImageMixin {
    /**
     * Inserts an image into the document.
     *
     * When width and height are both omitted, the intrinsic size is proportionally limited to 500 by 500 pixels.
     *
     * @param {IFDocumentInsertImageOptions} options The image source, optional transform, and insertion range.
     * @returns {Promise<FDocumentImage | null>} The inserted image facade, or `null` when the insertion command fails.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const image = await fDocument.insertImage({
     *   source: 'https://avatars.githubusercontent.com/u/61444807?s=48&v=4',
     *   imageSourceType: univerAPI.Enum.ImageSourceType.URL,
     *   width: 320,
     *   textRange: {
     *     startOffset: 30,
     *   },
     * });
     * console.log(image);
     * ```
     *
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const image = await fDocument.insertImage({
     *   source: 'https://avatars.githubusercontent.com/u/61444807?s=48&v=4',
     *   imageSourceType: univerAPI.Enum.ImageSourceType.URL,
     *   width: 320,
     *   wrappingStyle: univerAPI.Enum.DocsImageWrappingStyle.WRAP_SQUARE,
     *   textRange: {
     *     startOffset: 30,
     *   },
     * });
     * console.log(image);
     * ```
     */
    insertImage(options: IFDocumentInsertImageOptions): Promise<FDocumentImage | null>;

    /**
     * Gets an image by its drawing id.
     * @param {string} imageId The drawing id of the image.
     * @returns {FDocumentImage | null} The image facade, or `null` when the image does not exist.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const image = fDocument.getImage('image-1');
     * console.log(image);
     * ```
     */
    getImage(imageId: string): FDocumentImage | null;

    /**
     * Gets all images in the document in drawing order.
     * @returns {FDocumentImage[]} The image facades in drawing order.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const images = fDocument.getImages();
     * console.log(images);
     * ```
     */
    getImages(): FDocumentImage[];
}

export class FDocumentImageMixin extends FDocument implements IFDocumentImageMixin {
    override async insertImage(options: IFDocumentInsertImageOptions): Promise<FDocumentImage | null> {
        const unitId = this.getId();
        const imageId = generateRandomId(6);
        const intrinsicSize = await this._getIntrinsicSize(options.source, options.imageSourceType);
        const size = resolveImageSize(intrinsicSize, options);
        const defaultTransform = buildDocTransform(size.width, size.height);
        const wrappingStyle = options.wrappingStyle ?? TextWrappingStyle.INLINE;
        const docTransform = {
            ...defaultTransform,
            angle: options.angle ?? defaultTransform.angle,
            positionH: options.positionH ?? defaultTransform.positionH,
            positionV: options.positionV ?? defaultTransform.positionV,
        };
        const transform = docDrawingPositionToTransform(docTransform);
        const drawing: IDocImage = {
            unitId,
            subUnitId: unitId,
            drawingId: imageId,
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            imageSourceType: options.imageSourceType,
            source: options.source,
            transform,
            docTransform,
            behindDoc: wrappingStyle === TextWrappingStyle.BEHIND_TEXT ? BooleanNumber.TRUE : BooleanNumber.FALSE,
            title: '',
            description: '',
            layoutType: WRAPPING_STYLE_TO_LAYOUT_TYPE[wrappingStyle],
            wrapText: WrapTextType.BOTH_SIDES,
            distB: 0,
            distL: 0,
            distR: 0,
            distT: 0,
        };

        const inserted = this._injector.get(ICommandService).syncExecuteCommand(InsertDocDrawingCommand.id, {
            unitId,
            drawings: [drawing],
            textRange: options.textRange,
        });

        if (!inserted) {
            return null;
        }

        return this._injector.createInstance(FDocumentImage, this, imageId, this._injector);
    }

    override getImage(imageId: string): FDocumentImage | null {
        const drawing = this.getDocumentDataModel().getDrawings()?.[imageId];
        if (!drawing || drawing.drawingType !== DrawingTypeEnum.DRAWING_IMAGE) {
            return null;
        }
        return this._injector.createInstance(FDocumentImage, this, imageId, this._injector);
    }

    override getImages(): FDocumentImage[] {
        const documentDataModel = this.getDocumentDataModel();
        const drawings = documentDataModel.getDrawings() ?? {};
        const drawingIds = documentDataModel.getDrawingsOrder() ?? Object.keys(drawings);
        return drawingIds
            .filter((drawingId) => drawings[drawingId]?.drawingType === DrawingTypeEnum.DRAWING_IMAGE)
            .map((drawingId) => this._injector.createInstance(FDocumentImage, this, drawingId, this._injector));
    }

    private async _getIntrinsicSize(source: string, imageSourceType: ImageSourceType): Promise<Required<ISize>> {
        const imageIoService = this._injector.has(IImageIoService) ? this._injector.get(IImageIoService) : null;
        let resolvedSource = source;

        if (imageSourceType === ImageSourceType.UUID && imageIoService) {
            resolvedSource = await imageIoService.getImage(source);
        } else if (imageSourceType === ImageSourceType.URL && this._injector.has(IURLImageService)) {
            try {
                resolvedSource = await this._injector.get(IURLImageService).getImage(source);
            } catch {
                resolvedSource = source;
            }
        }

        const { width, height, image } = await getImageSize(resolvedSource);
        imageIoService?.addImageSourceCache(source, imageSourceType, image);
        return { width, height };
    }
}

function resolveImageSize(
    intrinsicSize: Required<ISize>,
    options: Pick<IFDocumentInsertImageOptions, 'width' | 'height'>
): Required<ISize> {
    const { width: intrinsicWidth, height: intrinsicHeight } = intrinsicSize;
    if (options.width != null && options.height != null) {
        return { width: options.width, height: options.height };
    }

    if (options.width != null) {
        return { width: options.width, height: intrinsicHeight * options.width / intrinsicWidth };
    }

    if (options.height != null) {
        return { width: intrinsicWidth * options.height / intrinsicHeight, height: options.height };
    }

    const scale = Math.min(
        1,
        DRAWING_IMAGE_WIDTH_LIMIT / intrinsicWidth,
        DRAWING_IMAGE_HEIGHT_LIMIT / intrinsicHeight
    );
    return { width: intrinsicWidth * scale, height: intrinsicHeight * scale };
}

FDocument.extend(FDocumentImageMixin);
declare module '@univerjs/docs/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FDocument extends IFDocumentImageMixin {}
}
