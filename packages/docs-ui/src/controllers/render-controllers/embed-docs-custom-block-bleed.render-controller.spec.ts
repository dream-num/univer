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

import type { IRenderContext } from '@univerjs/engine-render';
import { DocumentFlavor, UniverInstanceType } from '@univerjs/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { VIEWPORT_KEY } from '../../basics/docs-view-key';
import { SetDocZoomRatioOperation } from '../../commands/operations/set-doc-zoom-ratio.operation';
import { EmbedDocsCustomBlockBleedRenderController } from './embed-docs-custom-block-bleed.render-controller';

const providerState = vi.hoisted(() => ({
    provider: null as null | ((unitId: string, blockId: string, input: Record<string, number>) => unknown),
}));

vi.mock('@univerjs/engine-render', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/engine-render')>();
    return {
        ...actual,
        setDocsCustomBlockRenderViewportProvider: vi.fn((provider) => {
            providerState.provider = provider;
            return () => {
                if (providerState.provider === provider) {
                    providerState.provider = null;
                }
            };
        }),
    };
});

describe('EmbedDocsCustomBlockBleedRenderController', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('provides sheet-like custom block viewport data and refreshes when child units change', () => {
        vi.useFakeTimers();
        const commandListeners: Array<(command: { id: string; params?: unknown }) => void> = [];
        const commandService = {
            onCommandExecuted: vi.fn((listener) => {
                commandListeners.push(listener);
                return { dispose: vi.fn() };
            }),
            syncExecuteCommand: vi.fn(),
        };
        const context = createRenderContext();
        const contentSizeRegistry = {
            measureContentSize: vi.fn(() => ({ height: 700, width: 1500 })),
        };
        const controller = new EmbedDocsCustomBlockBleedRenderController(
            context as never,
            createInstanceService({ getUnit: vi.fn(() => ({ unit: true })) }) as never,
            commandService as never,
            contentSizeRegistry as never
        );

        expect(providerState.provider?.('other-doc', 'sheet-block', createViewportInput())).toBeNull();
        expect(providerState.provider?.('doc-1', 'slide-block', createViewportInput())).toBeNull();

        const viewport = providerState.provider?.('doc-1', 'sheet-block', createViewportInput());
        expect(viewport).toMatchObject({
            contentHeight: 700,
            contentWidth: 1500,
            height: 700,
            layoutWidth: 1000,
            viewportHeight: 300,
            width: 1000,
        });
        expect(contentSizeRegistry.measureContentSize).toHaveBeenCalledWith({
            childType: UniverInstanceType.UNIVER_SHEET,
            childUnit: { unit: true },
            childUnitId: 'sheet-1',
            viewportWidth: 960,
        });

        commandListeners[0]({ id: SetDocZoomRatioOperation.id, params: { unitId: 'sheet-1' } });
        expect(commandService.syncExecuteCommand).not.toHaveBeenCalled();

        commandListeners[0]({ id: 'sheet-command', params: { unitId: 'sheet-1' } });
        vi.runOnlyPendingTimers();
        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(SetDocZoomRatioOperation.id, {
            unitId: 'doc-1',
            zoomRatio: 1.5,
        });

        commandListeners[0]({ id: 'host-command', params: { unitId: 'doc-1' } });
        expect(commandService.syncExecuteCommand).toHaveBeenCalledTimes(1);

        controller.dispose();
        expect(providerState.provider).toBeNull();
    });

    it('resolves runtime child unit ids from embed descriptors when custom block drawings only persist embed ids', () => {
        vi.useFakeTimers();
        const commandListeners: Array<(command: { id: string; params?: unknown }) => void> = [];
        const commandService = {
            onCommandExecuted: vi.fn((listener) => {
                commandListeners.push(listener);
                return { dispose: vi.fn() };
            }),
            syncExecuteCommand: vi.fn(),
        };
        const context = createRenderContext({
            drawings: {
                'sheet-block': {
                    data: {
                        childType: UniverInstanceType.UNIVER_SHEET,
                        embedId: 'sheet-embed',
                        hostUnitId: 'doc-1',
                    },
                },
            },
        });
        const childUnit = { unit: true };
        const instanceService = {
            getUnit: vi.fn(() => childUnit),
        };
        const contentSizeRegistry = {
            measureContentSize: vi.fn(() => ({ height: 720, width: 1280 })),
        };
        const embedModelService = {
            getDescriptor: vi.fn(() => ({
                childType: UniverInstanceType.UNIVER_SHEET,
                source: {
                    ref: '#unit=sheet-1&type=sheet',
                    unitType: UniverInstanceType.UNIVER_SHEET,
                },
            })),
        };

        const controller = new EmbedDocsCustomBlockBleedRenderController(
            context as never,
            createInstanceService(instanceService) as never,
            commandService as never,
            contentSizeRegistry as never,
            embedModelService as never
        );

        expect(providerState.provider?.('doc-1', 'sheet-block', createViewportInput())).toMatchObject({
            contentHeight: 720,
            contentWidth: 1280,
            height: 720,
        });
        expect(embedModelService.getDescriptor).toHaveBeenCalledWith('doc-1', 'sheet-embed');
        expect(instanceService.getUnit).toHaveBeenCalledWith('sheet-1', UniverInstanceType.UNIVER_SHEET);
        expect(contentSizeRegistry.measureContentSize).toHaveBeenCalledWith({
            childType: UniverInstanceType.UNIVER_SHEET,
            childUnit,
            childUnitId: 'sheet-1',
            viewportWidth: 960,
        });

        commandListeners[0]({ id: 'sheet-command', params: { unitId: 'sheet-1' } });
        vi.runOnlyPendingTimers();
        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(SetDocZoomRatioOperation.id, {
            unitId: 'doc-1',
            zoomRatio: 1.5,
        });

        controller.dispose();
    });

    it('does not cache missing sync child units before late materialization', () => {
        const commandService = {
            onCommandExecuted: vi.fn(() => ({ dispose: vi.fn() })),
            syncExecuteCommand: vi.fn(),
        };
        const context = createRenderContext();
        const childUnit = { unit: true };
        const instanceService = createInstanceService({
            getUnit: vi.fn()
                .mockReturnValueOnce(undefined)
                .mockReturnValueOnce(childUnit),
        });
        const contentSizeRegistry = {
            measureContentSize: vi.fn(() => ({ height: 700, width: 1500 })),
        };
        const controller = new EmbedDocsCustomBlockBleedRenderController(
            context as never,
            instanceService as never,
            commandService as never,
            contentSizeRegistry as never
        );

        expect(providerState.provider?.('doc-1', 'sheet-block', createViewportInput())).toMatchObject({
            contentHeight: 480,
            height: 480,
        });
        expect(contentSizeRegistry.measureContentSize).not.toHaveBeenCalled();

        expect(providerState.provider?.('doc-1', 'sheet-block', createViewportInput())).toMatchObject({
            contentHeight: 700,
            height: 700,
        });
        expect(contentSizeRegistry.measureContentSize).toHaveBeenCalledWith({
            childType: UniverInstanceType.UNIVER_SHEET,
            childUnit,
            childUnitId: 'sheet-1',
            viewportWidth: 960,
        });

        controller.dispose();
    });

    it('returns null when visible canvas bounds are invalid', () => {
        const context = createRenderContext({
            canvasRect: { height: 0, width: 0 },
        });

        const controller = new EmbedDocsCustomBlockBleedRenderController(
            context as never,
            createInstanceService({ getUnit: vi.fn() }) as never,
            { onCommandExecuted: vi.fn(() => ({ dispose: vi.fn() })), syncExecuteCommand: vi.fn() } as never
        );

        expect(providerState.provider?.('doc-1', 'sheet-block', createViewportInput())).toMatchObject({
            height: 480,
            width: 960,
        });
        controller.dispose();
    });

    it('keeps sheet-like custom block visible while async child units resolve', async () => {
        vi.useFakeTimers();
        const commandService = {
            onCommandExecuted: vi.fn(() => ({ dispose: vi.fn() })),
            syncExecuteCommand: vi.fn(),
        };
        const context = createRenderContext();
        const childUnit = { unit: true };
        const contentSizeRegistry = {
            measureContentSize: vi.fn((measureContext: { childUnit?: unknown }) => {
                return measureContext.childUnit === childUnit ? { height: 700, width: 1500 } : undefined;
            }),
        };
        const controller = new EmbedDocsCustomBlockBleedRenderController(
            context as never,
            createInstanceService({ getUnit: vi.fn(() => Promise.resolve(childUnit)) }) as never,
            commandService as never,
            contentSizeRegistry as never
        );

        const loadingViewport = providerState.provider?.('doc-1', 'sheet-block', createCollapsedViewportInput());
        expect(loadingViewport).toMatchObject({
            contentHeight: 480,
            height: 480,
            width: 960,
        });
        expect(contentSizeRegistry.measureContentSize).not.toHaveBeenCalled();

        await Promise.resolve();
        vi.runOnlyPendingTimers();
        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(SetDocZoomRatioOperation.id, {
            unitId: 'doc-1',
            zoomRatio: 1.5,
        });

        const measuredViewport = providerState.provider?.('doc-1', 'sheet-block', createCollapsedViewportInput());
        expect(measuredViewport).toMatchObject({
            contentHeight: 700,
            contentWidth: 1500,
            height: 700,
        });
        expect(contentSizeRegistry.measureContentSize).toHaveBeenCalledWith({
            childType: UniverInstanceType.UNIVER_SHEET,
            childUnit,
            childUnitId: 'sheet-1',
            viewportWidth: 1,
        });

        controller.dispose();
    });
});

function createViewportInput() {
    return {
        fallbackHeight: 480,
        fallbackWidth: 960,
        pageMarginLeft: 100,
        pageMarginRight: 100,
        pageWidth: 1200,
    };
}

function createInstanceService(overrides: { getUnit?: ReturnType<typeof vi.fn> } = {}) {
    return {
        getUnit: vi.fn(),
        getTypeOfUnitAdded$: vi.fn(() => ({
            subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })),
        })),
        ...overrides,
    };
}

function createCollapsedViewportInput() {
    return {
        ...createViewportInput(),
        fallbackHeight: 1,
        fallbackWidth: 1,
    };
}

function createRenderContext(overrides: {
    canvasRect?: { height: number; width: number };
    drawings?: Record<string, unknown>;
} = {}): Partial<IRenderContext<never>> {
    const drawings = overrides.drawings ?? {
        'sheet-block': {
            data: {
                childType: UniverInstanceType.UNIVER_SHEET,
                childUnitId: 'sheet-1',
            },
        },
        'slide-block': {
            data: {
                childType: UniverInstanceType.UNIVER_SLIDE,
                childUnitId: 'slide-1',
            },
        },
    };

    return {
        engine: {
            getCanvasElement: () => ({
                getBoundingClientRect: () => ({
                    height: overrides.canvasRect?.height ?? 900,
                    width: overrides.canvasRect?.width ?? 1600,
                }),
            }),
        } as never,
        mainComponent: {
            getOffsetConfig: () => ({ docsLeft: 40 }),
            height: 900,
            width: 1600,
        } as never,
        scene: {
            getAncestorScale: () => ({ scaleX: 2, scaleY: 3 }),
            getViewport: (key: string) => key === VIEWPORT_KEY.VIEW_MAIN ? { viewportScrollX: 120 } : undefined,
            height: 900,
            width: 1600,
        } as never,
        unit: {
            getSnapshot: () => ({
                documentStyle: { documentFlavor: DocumentFlavor.MODERN },
                drawings,
            }),
            zoomRatio: 1.5,
        } as never,
        unitId: 'doc-1',
    };
}
