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

import type { IDocumentData } from '@univerjs/core';
import type { IDocFloatDom } from '@univerjs/docs-drawing';
import type { IBoundRectNoAngle, Scene } from '@univerjs/engine-render';
import { ComponentManager } from '@univerjs/ui';
import { act } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { createDocUiTestBed } from '../../__tests__/create-doc-ui-test-bed';
import { mountDocPrintingFloatDom } from '../DocPrintingFloatDom';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const UNIT_ID = 'doc-printing-float-dom-doc';
const PRINTING_COMPONENT_KEY = 'printing-visible-content';

class TestScene {
    constructor(
        private readonly _scroll = { x: 0, y: 0 },
        private readonly _scale = { x: 1, y: 1 }
    ) {
    }

    getViewport() {
        return {
            viewportScrollX: this._scroll.x,
            viewportScrollY: this._scroll.y,
        };
    }

    getAncestorScale() {
        return {
            scaleX: this._scale.x,
            scaleY: this._scale.y,
        };
    }
}

function PrintingVisibleContent(props: { data?: { label?: string } }) {
    return <span>{props.data?.label}</span>;
}

function createDocData(): IDocumentData {
    return {
        id: UNIT_ID,
        body: {
            dataStream: '\r\n',
        },
        documentStyle: {
            pageSize: {
                width: 200,
                height: 100,
            },
            marginTop: 0,
            marginBottom: 0,
            marginRight: 0,
            marginLeft: 0,
        },
    };
}

function createFloatDom(drawingId: string, label: string, bound: IBoundRectNoAngle): IDocFloatDom {
    return {
        drawingId,
        unitId: UNIT_ID,
        componentKey: PRINTING_COMPONENT_KEY,
        transform: {
            left: bound.left,
            top: bound.top,
            width: bound.right - bound.left,
            height: bound.bottom - bound.top,
        },
        data: { label },
    } as unknown as IDocFloatDom;
}

describe('DocPrintingFloatDom', () => {
    let root: HTMLDivElement | undefined;
    let currentTestBed: ReturnType<typeof createDocUiTestBed> | undefined;
    let disposePrinting: (() => void) | undefined;

    afterEach(() => {
        act(() => {
            disposePrinting?.();
        });
        root?.remove();
        currentTestBed?.univer.dispose();
        root = undefined;
        currentTestBed = undefined;
        disposePrinting = undefined;
    });

    it('prints only floating DOM content whose transformed bounds intersect the page bound', () => {
        currentTestBed = createDocUiTestBed(createDocData(), [
            [ComponentManager],
        ]);
        currentTestBed.injector.get(ComponentManager).register(PRINTING_COMPONENT_KEY, PrintingVisibleContent);

        root = document.createElement('div');
        document.body.appendChild(root);

        act(() => {
            disposePrinting = mountDocPrintingFloatDom({
                floatDomInfos: [
                    createFloatDom('inside-image', 'Inside printable page', { left: 20, top: 10, right: 70, bottom: 40 }),
                    createFloatDom('outside-image', 'Outside printable page', { left: 240, top: 10, right: 300, bottom: 40 }),
                ],
                scene: new TestScene() as unknown as Scene,
                skeleton: {} as never,
                unitId: UNIT_ID,
                offset: { x: 0, y: 0 },
                bound: { left: 0, top: 0, right: 200, bottom: 100 },
            }, root!, currentTestBed!.injector);
        });

        expect(root.textContent).toContain('Inside printable page');
        expect(root.textContent).not.toContain('Outside printable page');

        act(() => {
            disposePrinting?.();
            disposePrinting = undefined;
        });

        expect(root.textContent).toBe('');
    });

    it('prints floating DOM content based on viewport scroll and ancestor scale', () => {
        currentTestBed = createDocUiTestBed(createDocData(), [
            [ComponentManager],
        ]);
        currentTestBed.injector.get(ComponentManager).register(PRINTING_COMPONENT_KEY, PrintingVisibleContent);

        root = document.createElement('div');
        document.body.appendChild(root);

        act(() => {
            disposePrinting = mountDocPrintingFloatDom({
                floatDomInfos: [
                    createFloatDom('visible-after-scroll', 'Visible after scroll and zoom', { left: 110, top: 60, right: 130, bottom: 80 }),
                    createFloatDom('before-scroll', 'Before scrolled viewport', { left: 0, top: 60, right: 20, bottom: 80 }),
                    createFloatDom('below-scaled-page', 'Below scaled page', { left: 120, top: 140, right: 150, bottom: 170 }),
                ],
                scene: new TestScene({ x: 100, y: 50 }, { x: 2, y: 1.5 }) as unknown as Scene,
                skeleton: {} as never,
                unitId: UNIT_ID,
                offset: { x: 0, y: 0 },
                bound: { left: 0, top: 0, right: 200, bottom: 100 },
            }, root!, currentTestBed!.injector);
        });

        expect(root.textContent).toContain('Visible after scroll and zoom');
        expect(root.textContent).not.toContain('Before scrolled viewport');
        expect(root.textContent).not.toContain('Below scaled page');
    });

    it('prints floating DOM content that partially intersects the page edge', () => {
        currentTestBed = createDocUiTestBed(createDocData(), [
            [ComponentManager],
        ]);
        currentTestBed.injector.get(ComponentManager).register(PRINTING_COMPONENT_KEY, PrintingVisibleContent);

        root = document.createElement('div');
        document.body.appendChild(root);

        act(() => {
            disposePrinting = mountDocPrintingFloatDom({
                floatDomInfos: [
                    createFloatDom('partially-visible-left', 'Partially visible on left edge', { left: -20, top: 10, right: 20, bottom: 40 }),
                    createFloatDom('partially-visible-bottom', 'Partially visible on bottom edge', { left: 40, top: 80, right: 80, bottom: 120 }),
                    createFloatDom('fully-before-page', 'Fully before printable page', { left: -60, top: 10, right: -10, bottom: 40 }),
                ],
                scene: new TestScene() as unknown as Scene,
                skeleton: {} as never,
                unitId: UNIT_ID,
                offset: { x: 0, y: 0 },
                bound: { left: 0, top: 0, right: 200, bottom: 100 },
            }, root!, currentTestBed!.injector);
        });

        expect(root.textContent).toContain('Partially visible on left edge');
        expect(root.textContent).toContain('Partially visible on bottom edge');
        expect(root.textContent).not.toContain('Fully before printable page');
    });
});
