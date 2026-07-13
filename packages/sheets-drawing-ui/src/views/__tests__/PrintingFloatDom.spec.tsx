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

import type { Worksheet } from '@univerjs/core';
import type { Scene, SpreadsheetSkeleton } from '@univerjs/engine-render';
import type { IFloatDomData } from '@univerjs/sheets-drawing';
import { DrawingTypeEnum } from '@univerjs/core';
import { SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import { ComponentManager } from '@univerjs/ui';
import { act } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { createSheetsDrawingUiTestBed } from '../../__tests__/create-sheets-drawing-ui-test-bed';
import { createPrintingFloatDom, mountPrintingFloatDom } from '../PrintingFloatDom';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const PRINTING_COMPONENT_KEY = 'printing-visible-content';

class TestPrintingScene {
    getAncestorScale() {
        return { scaleX: 1.5, scaleY: 2 };
    }

    getViewport(key: string) {
        if (key !== SHEET_VIEWPORT_KEY.VIEW_MAIN) {
            return null;
        }

        return {
            left: 0,
            top: 0,
            right: 600,
            bottom: 500,
            viewportScrollX: 0,
            viewportScrollY: 0,
        };
    }
}

class TestPrintingSkeleton {
    readonly rowHeaderWidth = 46;
    readonly columnHeaderHeight = 28;

    rowStartY(row: number): number {
        return row * 24;
    }

    colStartX(column: number): number {
        return column * 72;
    }
}

class TestPrintingWorksheet {
    getFreeze() {
        return {
            startColumn: 0,
            startRow: 0,
            xSplit: 0,
            ySplit: 0,
        };
    }
}

function PrintingContent(props: { data?: { label?: string }; printingLabel?: string }) {
    return <span data-testid="printed-content">{props.printingLabel ?? props.data?.label}</span>;
}

function createFloatDomInfo(drawingId = 'printed-float-dom', label = 'printing'): IFloatDomData {
    return {
        unitId: 'test',
        subUnitId: 'sheet1',
        drawingId,
        drawingType: DrawingTypeEnum.DRAWING_DOM,
        componentKey: PRINTING_COMPONENT_KEY,
        transform: {
            left: 20,
            top: 40,
            width: 200,
            height: 100,
            angle: 27,
            flipX: false,
            flipY: false,
            skewX: 0,
            skewY: 0,
        },
        data: {
            label,
        },
        axisAlignSheetTransform: {
            angle: 0,
            flipX: false,
            flipY: false,
            skewX: 0,
            skewY: 0,
            from: { row: 1, column: 1, rowOffset: 0, columnOffset: 0 },
            to: { row: 4, column: 3, rowOffset: 0, columnOffset: 0 },
        },
    };
}

describe('PrintingFloatDom', () => {
    let container: HTMLDivElement | undefined;
    let currentTestBed: ReturnType<typeof createSheetsDrawingUiTestBed> | undefined;
    let unmountPrintingFloatDom: (() => void) | undefined;

    afterEach(() => {
        act(() => {
            unmountPrintingFloatDom?.();
        });
        container?.remove();
        currentTestBed?.univer.dispose();
        container = undefined;
        currentTestBed = undefined;
        unmountPrintingFloatDom = undefined;
    });

    it('prints floating doms with the scene scale applied to size and rotation', async () => {
        currentTestBed = createSheetsDrawingUiTestBed(undefined, [
            [ComponentManager],
        ]);
        currentTestBed.injector.get(ComponentManager).register(PRINTING_COMPONENT_KEY, PrintingContent);
        const root = document.createElement('div');
        container = root;
        document.body.appendChild(root);

        await act(async () => {
            unmountPrintingFloatDom = mountPrintingFloatDom({
                floatDomInfos: [createFloatDomInfo()],
                scene: new TestPrintingScene() as unknown as Scene,
                skeleton: new TestPrintingSkeleton() as unknown as SpreadsheetSkeleton,
                worksheet: new TestPrintingWorksheet() as unknown as Worksheet,
            }, root, currentTestBed!.injector);
            await Promise.resolve();
        });

        const printedFloatDom = root.querySelector<HTMLElement>('#printed-float-dom');
        if (!printedFloatDom?.parentElement) {
            throw new Error('Printed float dom was not rendered');
        }

        expect(printedFloatDom.style.width).toBe('296px');
        expect(printedFloatDom.style.height).toBe('196px');
        expect(printedFloatDom.parentElement.style.width).toBe('298px');
        expect(printedFloatDom.parentElement.style.height).toBe('198px');
        expect(printedFloatDom.parentElement.style.transform).toBe('rotate(27deg)');
    });

    it('prints each floating DOM with its own component data', async () => {
        currentTestBed = createSheetsDrawingUiTestBed(undefined, [
            [ComponentManager],
        ]);
        currentTestBed.injector.get(ComponentManager).register(PRINTING_COMPONENT_KEY, PrintingContent);
        const root = document.createElement('div');
        container = root;
        document.body.appendChild(root);

        await act(async () => {
            unmountPrintingFloatDom = mountPrintingFloatDom({
                floatDomInfos: [
                    createFloatDomInfo('first-printed-float-dom', 'First printed label'),
                    createFloatDomInfo('second-printed-float-dom', 'Second printed label'),
                ],
                scene: new TestPrintingScene() as unknown as Scene,
                skeleton: new TestPrintingSkeleton() as unknown as SpreadsheetSkeleton,
                worksheet: new TestPrintingWorksheet() as unknown as Worksheet,
            }, root, currentTestBed!.injector);
            await Promise.resolve();
        });

        expect(root.textContent).toContain('First printed label');
        expect(root.textContent).toContain('Second printed label');
    });

    it('forwards printing-only component props', () => {
        const info = {
            ...createFloatDomInfo(),
            props: { printingLabel: 'Ready callback props' },
        } as IFloatDomData;

        const [, floatDom] = createPrintingFloatDom(
            info,
            new TestPrintingScene() as unknown as Scene,
            new TestPrintingSkeleton() as unknown as SpreadsheetSkeleton,
            new TestPrintingWorksheet() as unknown as Worksheet
        );

        expect(floatDom.props).toEqual({ printingLabel: 'Ready callback props' });
    });
});
