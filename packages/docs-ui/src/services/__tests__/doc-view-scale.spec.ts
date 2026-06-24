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

/**
 * @vitest-environment jsdom
 */

import { DocumentFlavor, MODERN_DOCUMENT_WIDTH, ModernDocumentWidthMode } from '@univerjs/core';
import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_DOC_FIT_TO_WIDTH_OPTIONS } from '../../config/config';
import { calcDocFitToWidthScale, DocViewScaleService, resolveDocFitBaseWidth, resolveDocViewScale } from '../doc-view-scale';

describe('doc view scale helpers', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('does not fit when mode is none', () => {
        expect(calcDocFitToWidthScale({
            availableWidth: 1600,
            baseWidth: 800,
            options: DEFAULT_DOC_FIT_TO_WIDTH_OPTIONS,
        })).toBe(1);
    });

    it('fits width with padding and min scale', () => {
        expect(calcDocFitToWidthScale({
            availableWidth: 1200,
            baseWidth: 800,
            options: { mode: 'fit-width', paddingX: 20, minScale: 1 },
        })).toBe(1.45);
        expect(calcDocFitToWidthScale({
            availableWidth: 600,
            baseWidth: 800,
            options: { mode: 'fit-width', paddingX: 20, minScale: 1 },
        })).toBe(1);
    });

    it('fits width with percentage padding relative to available width', () => {
        expect(calcDocFitToWidthScale({
            availableWidth: 1200,
            baseWidth: 960,
            options: { mode: 'fit-width', paddingX: '10%', minScale: 0 },
        })).toBe(1);
    });

    it('allows embedded containers to shrink and clamp max scale', () => {
        expect(calcDocFitToWidthScale({
            availableWidth: 480,
            baseWidth: 960,
            options: { mode: 'fit-width', paddingX: 0, minScale: 0 },
        })).toBe(0.5);
        expect(calcDocFitToWidthScale({
            availableWidth: 2400,
            baseWidth: 960,
            options: { mode: 'fit-width', paddingX: 0, minScale: 0, maxScale: 2 },
        })).toBe(2);
    });

    it('resolves traditional and modern base widths without table overflow', () => {
        expect(resolveDocFitBaseWidth({
            documentFlavor: DocumentFlavor.TRADITIONAL,
            documentStylePageWidth: 794,
            skeletonPageWidth: 1254,
        })).toBe(794);
        expect(resolveDocFitBaseWidth({
            documentFlavor: DocumentFlavor.MODERN,
            documentStylePageWidth: undefined,
            skeletonPageWidth: 1254,
        })).toBe(MODERN_DOCUMENT_WIDTH[ModernDocumentWidthMode.MEDIUM]);
        expect(resolveDocFitBaseWidth({
            documentFlavor: DocumentFlavor.MODERN,
            documentStylePageWidth: MODERN_DOCUMENT_WIDTH[ModernDocumentWidthMode.WIDE],
            skeletonPageWidth: 1500,
        })).toBe(MODERN_DOCUMENT_WIDTH[ModernDocumentWidthMode.WIDE]);
    });

    it('keeps user zoom separate from fit scale', () => {
        expect(resolveDocViewScale(1.25, 0.5)).toBe(0.625);
        expect(resolveDocViewScale(1, 1.5)).toBe(1.5);
    });

    it('computes view scale from engine width, document zoom, and configured page width', () => {
        const context = {
            engine: { width: 1440 },
            unit: {
                getSettings: () => ({ zoomRatio: 1.25 }),
                getSnapshot: () => ({
                    documentStyle: {
                        documentFlavor: DocumentFlavor.MODERN,
                        pageSize: { width: 960, height: Number.POSITIVE_INFINITY },
                    },
                }),
            },
        };
        const service = new DocViewScaleService(
            context as never,
            { getConfig: () => ({ fitToWidth: { mode: 'fit-width', paddingX: 0, minScale: 0 } }) } as never
        );

        expect(service.getFitToWidthScale()).toBe(1.5);
        expect(service.getViewScale()).toBe(1.875);
    });

    it('falls back to default modern width and zoom while embedded doc units are not resolved', () => {
        const service = new DocViewScaleService(
            {
                engine: { width: 960 },
                unit: null,
            } as never,
            { getConfig: () => ({ fitToWidth: { mode: 'fit-width', paddingX: 0, minScale: 0 } }) } as never
        );

        expect(service.getBaseWidth()).toBe(MODERN_DOCUMENT_WIDTH[ModernDocumentWidthMode.MEDIUM]);
        expect(service.getUserZoomRatio()).toBe(1);
        expect(service.getViewScale()).toBe(1);
    });

    it('uses configured container width for container-targeted fitting', () => {
        const context = {
            engine: { width: 960 },
            unit: {
                getSettings: () => ({ zoomRatio: 1 }),
                getSnapshot: () => ({
                    documentStyle: {
                        documentFlavor: DocumentFlavor.MODERN,
                        pageSize: { width: 960, height: Number.POSITIVE_INFINITY },
                    },
                }),
            },
        };
        const service = new DocViewScaleService(
            context as never,
            {
                getConfig: () => ({
                    container: { clientWidth: 480 },
                    fitToWidth: { mode: 'fit-width', target: 'container', paddingX: 0, minScale: 0 },
                }),
            } as never
        );

        expect(service.getAvailableWidth()).toBe(480);
        expect(service.getFitToWidthScale()).toBe(0.5);
    });

    it('resolves string containers as element ids for embedded fitting', () => {
        const container = document.createElement('div');
        container.id = 'univerdoc';
        Object.defineProperty(container, 'clientWidth', {
            configurable: true,
            value: 480,
        });
        document.body.appendChild(container);

        const context = {
            engine: { width: 960 },
            unit: {
                getSettings: () => ({ zoomRatio: 1 }),
                getSnapshot: () => ({
                    documentStyle: {
                        documentFlavor: DocumentFlavor.MODERN,
                        pageSize: { width: 960, height: Number.POSITIVE_INFINITY },
                    },
                }),
            },
        };
        const service = new DocViewScaleService(
            context as never,
            {
                getConfig: () => ({
                    container: 'univerdoc',
                    fitToWidth: { mode: 'fit-width', target: 'container', paddingX: 0, minScale: 0 },
                }),
            } as never
        );

        expect(service.getAvailableWidth()).toBe(480);
        expect(service.getFitToWidthScale()).toBe(0.5);
    });
});
