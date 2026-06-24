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

import type { DocumentDataModel } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import type { IDocFitToWidthOptions, IUniverDocsUIConfig } from '../config/config';
import { Disposable, DocumentFlavor, IConfigService, MODERN_DOCUMENT_WIDTH, ModernDocumentWidthMode } from '@univerjs/core';
import { DEFAULT_DOC_FIT_TO_WIDTH_OPTIONS, DOCS_UI_PLUGIN_CONFIG_KEY } from '../config/config';
import { getDocEffectiveZoomRatio } from './doc-zoom';

export interface ICalcDocFitToWidthScaleParams {
    availableWidth: number;
    baseWidth: number;
    options?: IDocFitToWidthOptions;
}

export interface IResolveDocFitBaseWidthParams {
    documentFlavor?: DocumentFlavor;
    documentStylePageWidth?: number;
    skeletonPageWidth?: number;
}

export function normalizeDocFitToWidthOptions(options?: IDocFitToWidthOptions) {
    return {
        ...DEFAULT_DOC_FIT_TO_WIDTH_OPTIONS,
        ...options,
    };
}

export function resolveDocFitPaddingX(availableWidth: number, paddingX: IDocFitToWidthOptions['paddingX']): number {
    if (typeof paddingX === 'number') {
        return Number.isFinite(paddingX) ? paddingX : 0;
    }

    if (typeof paddingX === 'string') {
        const trimmedPadding = paddingX.trim();
        if (trimmedPadding.endsWith('%')) {
            const percent = Number(trimmedPadding.slice(0, -1));
            return Number.isFinite(percent) ? availableWidth * percent / 100 : 0;
        }
    }

    return 0;
}

export function calcDocFitToWidthScale(params: ICalcDocFitToWidthScaleParams): number {
    const options = normalizeDocFitToWidthOptions(params.options);
    if (options.mode !== 'fit-width') {
        return 1;
    }

    if (!Number.isFinite(params.availableWidth) || !Number.isFinite(params.baseWidth) || params.baseWidth <= 0) {
        return 1;
    }

    const paddingX = resolveDocFitPaddingX(params.availableWidth, options.paddingX);
    const availableWidth = Math.max(0, params.availableWidth - paddingX * 2);
    const rawScale = availableWidth / params.baseWidth;
    const maxScale = options.maxScale ?? Number.POSITIVE_INFINITY;

    return Math.min(maxScale, Math.max(options.minScale, rawScale));
}

export function resolveDocFitBaseWidth(params: IResolveDocFitBaseWidthParams): number {
    if (params.documentStylePageWidth != null && Number.isFinite(params.documentStylePageWidth) && params.documentStylePageWidth > 0) {
        return params.documentStylePageWidth;
    }

    if (params.documentFlavor === DocumentFlavor.MODERN) {
        return MODERN_DOCUMENT_WIDTH[ModernDocumentWidthMode.MEDIUM];
    }

    if (params.skeletonPageWidth != null && Number.isFinite(params.skeletonPageWidth) && params.skeletonPageWidth > 0) {
        return params.skeletonPageWidth;
    }

    return MODERN_DOCUMENT_WIDTH[ModernDocumentWidthMode.MEDIUM];
}

export function resolveDocViewScale(userZoomRatio: number, fitToWidthScale: number): number {
    return userZoomRatio * fitToWidthScale;
}

export class DocViewScaleService extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();
    }

    getPluginConfig(): Partial<IUniverDocsUIConfig> {
        return this._configService.getConfig<IUniverDocsUIConfig>(DOCS_UI_PLUGIN_CONFIG_KEY) ?? {};
    }

    getOptions(): IDocFitToWidthOptions {
        return this.getPluginConfig().fitToWidth ?? DEFAULT_DOC_FIT_TO_WIDTH_OPTIONS;
    }

    getBaseWidth(): number {
        const documentStyle = this._context.unit?.getSnapshot?.()?.documentStyle;
        return resolveDocFitBaseWidth({
            documentFlavor: documentStyle?.documentFlavor,
            documentStylePageWidth: documentStyle?.pageSize?.width,
        });
    }

    getAvailableWidth(): number {
        const config = this.getPluginConfig();
        const options = normalizeDocFitToWidthOptions(config.fitToWidth);
        if (options.target === 'container') {
            const container = this._resolveContainer(config.container);
            const containerWidth = container?.clientWidth;
            if (containerWidth != null && Number.isFinite(containerWidth) && containerWidth > 0) {
                return containerWidth;
            }
        }

        return this._context.engine.width;
    }

    getUserZoomRatio(): number {
        if (this._context.unit == null) {
            return 1;
        }

        return getDocEffectiveZoomRatio(this._context.unit);
    }

    getFitToWidthScale(): number {
        return calcDocFitToWidthScale({
            availableWidth: this.getAvailableWidth(),
            baseWidth: this.getBaseWidth(),
            options: this.getOptions(),
        });
    }

    getViewScale(userZoomRatio = this.getUserZoomRatio()): number {
        return resolveDocViewScale(userZoomRatio, this.getFitToWidthScale());
    }

    private _resolveContainer(container?: HTMLElement | string): HTMLElement | undefined {
        if (container == null) {
            return undefined;
        }

        if (typeof container === 'string') {
            return document.querySelector<HTMLElement>(container) ?? document.getElementById(container) ?? undefined;
        }

        return container;
    }
}
