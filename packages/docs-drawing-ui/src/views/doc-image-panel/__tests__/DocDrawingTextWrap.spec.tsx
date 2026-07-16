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

import type { DependencyIdentifier, DocumentDataModel, ICommand, IDocumentData } from '@univerjs/core';
import type { Root } from 'react-dom/client';
import {
    BooleanNumber,
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    UniverInstanceType,
    WrapTextType,
} from '@univerjs/core';
import { DocSkeletonManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { DocDrawingController, DocDrawingService, IDocDrawingService } from '@univerjs/docs-drawing';
import { DocSelectionRenderService } from '@univerjs/docs-ui';
import { DrawingManagerService, IDrawingManagerService } from '@univerjs/drawing';
import { DocumentEditArea, IRenderManagerService } from '@univerjs/engine-render';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { createDocUiTestBed } from '../../../__tests__/create-doc-ui-test-bed';
import {
    UpdateDocDrawingDistanceCommand,
    UpdateDocDrawingWrapTextCommand,
} from '../../../commands/commands/update-doc-drawing.command';
import { DocDrawingAddRemoveController } from '../../../controllers/doc-drawing-notification.controller';
import locale from '../../../locale/en-US';
import { DocRefreshDrawingsService } from '../../../services/doc-refresh-drawings.service';
import { DocDrawingTextWrap } from '../DocDrawingTextWrap';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const UNIT_ID = 'doc-drawing-text-wrap-doc';
const DRAWING_ID = 'image-1';

class TestDocSkeletonManagerService {
    getSkeleton() {
        return {
            getSkeletonData: () => ({
                pages: [{
                    marginTop: 72,
                    marginLeft: 90,
                    marginBottom: 72,
                    pageWidth: 594,
                    pageHeight: 840,
                    headerId: '',
                    footerId: '',
                    skeDrawings: new Map([
                        [DRAWING_ID, {
                            drawingId: DRAWING_ID,
                            aLeft: 24,
                            aTop: 42,
                            columnLeft: 8,
                            lineTop: 10,
                            blockAnchorTop: 12,
                        }],
                    ]),
                    skeTables: new Map(),
                }],
                skeHeaders: new Map(),
                skeFooters: new Map(),
            }),
        };
    }

    getViewModel() {
        return {
            getEditArea: () => DocumentEditArea.BODY,
        };
    }
}

class TestDocSelectionRenderService {
    private _segment = '';
    private _segmentPage = 0;

    getSegment() {
        return this._segment;
    }

    setSegment(segment: string) {
        this._segment = segment;
    }

    getSegmentPage() {
        return this._segmentPage;
    }

    setSegmentPage(page: number) {
        this._segmentPage = page;
    }

    blur() {
        return undefined;
    }
}

class TestScene {
    controlRefreshCount = 0;

    getTransformerByCreate() {
        return {
            refreshControls: () => {
                this.controlRefreshCount += 1;
            },
        };
    }
}

class TestRenderManagerService {
    private readonly _scene = new TestScene();
    private readonly _skeletonManager = new TestDocSkeletonManagerService();
    private readonly _selectionRenderService = new TestDocSelectionRenderService();
    private _render: unknown;

    addRender(_unitId: string, render: unknown) {
        this._render = render;
    }

    getRenderUnitById(_unitId: string) {
        return this._render;
    }

    getRenderById(_unitId: string) {
        return {
            ...(this._render as object),
            scene: this._scene,
            with: <T,>(token: DependencyIdentifier<T>) => {
                if (token === DocSkeletonManagerService) {
                    return this._skeletonManager as T;
                }

                if (token === DocSelectionRenderService) {
                    return this._selectionRenderService as T;
                }

                throw new Error(`Unexpected render dependency: ${String(token)}`);
            },
        };
    }
}

function createDocData(): IDocumentData {
    return {
        id: UNIT_ID,
        body: {
            dataStream: '\b\r\n',
            customBlocks: [{
                startIndex: 0,
                blockId: DRAWING_ID,
            }],
        },
        drawings: {
            [DRAWING_ID]: {
                drawingId: DRAWING_ID,
                unitId: UNIT_ID,
                subUnitId: UNIT_ID,
                drawingType: 'image',
                layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                wrapText: WrapTextType.BOTH_SIDES,
                distT: 1,
                distL: 2,
                distB: 3,
                distR: 4,
                docTransform: {
                    positionH: {
                        relativeFrom: ObjectRelativeFromH.PAGE,
                        posOffset: 0,
                    },
                    positionV: {
                        relativeFrom: ObjectRelativeFromV.PAGE,
                        posOffset: 0,
                    },
                },
            } as never,
        },
        drawingsOrder: [DRAWING_ID],
        documentStyle: {
            pageSize: {
                width: 594.3,
                height: 840.51,
            },
            marginTop: 72,
            marginBottom: 72,
            marginRight: 90,
            marginLeft: 90,
        },
    };
}

function createPanelTestBed() {
    const testBed = createDocUiTestBed(createDocData(), [
        [IRenderManagerService, { useClass: TestRenderManagerService as never }],
    ]);
    const { injector } = testBed;

    injector.add([DocDrawingService]);
    injector.add([IDocDrawingService, { useClass: DocDrawingService }]);
    injector.add([IDrawingManagerService, { useClass: DrawingManagerService }]);
    injector.add([DocRefreshDrawingsService]);
    injector.add([DocDrawingController]);
    injector.add([DocDrawingAddRemoveController]);

    const commandService = injector.get(ICommandService);
    [
        UpdateDocDrawingDistanceCommand,
        UpdateDocDrawingWrapTextCommand,
        RichTextEditingMutation as unknown as ICommand,
    ].forEach((command) => commandService.registerCommand(command));

    injector.get(LocaleService).load({
        [LocaleType.EN_US]: locale,
    });
    injector.get(LocaleService).setLocale(LocaleType.EN_US);

    injector.get(DocDrawingController).loadDrawingDataForUnit(UNIT_ID);
    injector.get(DocDrawingAddRemoveController);
    injector.get(IDrawingManagerService).focusDrawing([{
        unitId: UNIT_ID,
        subUnitId: UNIT_ID,
        drawingId: DRAWING_ID,
    }]);

    return testBed;
}

function renderPanel(root: Root, testBed: ReturnType<typeof createPanelTestBed>) {
    const drawing = testBed.doc.getSnapshot().drawings![DRAWING_ID];

    act(() => {
        root.render(
            <RediContext.Provider value={{ injector: testBed.injector }}>
                <DocDrawingTextWrap drawings={[drawing as never]} />
            </RediContext.Provider>
        );
    });
}

function currentDrawing(testBed: ReturnType<typeof createPanelTestBed>) {
    return testBed.get(IUniverInstanceService)
        .getUnit<DocumentDataModel>(UNIT_ID, UniverInstanceType.UNIVER_DOC)!
        .getSnapshot()
        .drawings![DRAWING_ID];
}

function getRadioInput(container: HTMLElement, index: number): HTMLInputElement {
    return container.querySelectorAll<HTMLInputElement>('[data-u-comp="radio"] input')[index];
}

function getNumberInput(container: HTMLElement, index: number): HTMLInputElement {
    return container.querySelectorAll<HTMLInputElement>('[data-u-comp="input"] input')[index];
}

function setInputValue(input: HTMLInputElement, value: string) {
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    valueSetter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('DocDrawingTextWrap', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentTestBed: ReturnType<typeof createPanelTestBed> | undefined;

    afterEach(() => {
        act(() => {
            root?.unmount();
        });
        container?.remove();
        currentTestBed?.univer.dispose();
        root = undefined;
        container = undefined;
        currentTestBed = undefined;
    });

    it('persists behind-text wrapping on the focused drawing', async () => {
        currentTestBed = createPanelTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        renderPanel(root, currentTestBed);

        await act(async () => {
            getRadioInput(container!, 3).click();
            await Promise.resolve();
        });

        expect(currentDrawing(currentTestBed)).toMatchObject({
            layoutType: PositionedObjectLayoutType.WRAP_NONE,
            behindDoc: BooleanNumber.TRUE,
            docTransform: {
                positionH: {
                    relativeFrom: ObjectRelativeFromH.PAGE,
                    posOffset: 24,
                },
                positionV: {
                    relativeFrom: ObjectRelativeFromV.PAGE,
                    posOffset: 114,
                },
            },
        });
    });

    it('persists in-front-of-text wrapping on the focused drawing', async () => {
        currentTestBed = createPanelTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        renderPanel(root, currentTestBed);

        await act(async () => {
            getRadioInput(container!, 4).click();
            await Promise.resolve();
        });

        expect(currentDrawing(currentTestBed)).toMatchObject({
            layoutType: PositionedObjectLayoutType.WRAP_NONE,
            behindDoc: BooleanNumber.FALSE,
            docTransform: {
                positionH: {
                    relativeFrom: ObjectRelativeFromH.PAGE,
                    posOffset: 24,
                },
                positionV: {
                    relativeFrom: ObjectRelativeFromV.PAGE,
                    posOffset: 114,
                },
            },
        });
    });

    it('preserves wrap metadata when switching to top-and-bottom text flow', async () => {
        currentTestBed = createPanelTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        renderPanel(root, currentTestBed);

        await act(async () => {
            getRadioInput(container!, 2).click();
            await Promise.resolve();
        });

        expect(currentDrawing(currentTestBed)).toMatchObject({
            layoutType: PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM,
            wrapText: WrapTextType.BOTH_SIDES,
            distT: 1,
            distL: 2,
            distB: 3,
            distR: 4,
            docTransform: {
                positionH: {
                    relativeFrom: ObjectRelativeFromH.PAGE,
                    posOffset: 24,
                },
                positionV: {
                    relativeFrom: ObjectRelativeFromV.PAGE,
                    posOffset: 114,
                },
            },
        });
    });

    it('persists left distance from text on the focused drawing', async () => {
        currentTestBed = createPanelTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        renderPanel(root, currentTestBed);

        const leftDistanceInput = getNumberInput(container, 1);

        await act(async () => {
            setInputValue(leftDistanceInput, '12.5');
            await Promise.resolve();
        });

        expect(currentDrawing(currentTestBed)).toMatchObject({
            distT: 1,
            distL: 12.5,
            distB: 3,
            distR: 4,
        });
    });

    it('disables side distance controls when text only wraps above and below the drawing', async () => {
        currentTestBed = createPanelTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        renderPanel(root, currentTestBed);

        await act(async () => {
            getRadioInput(container!, 2).click();
            await Promise.resolve();
        });

        expect(getNumberInput(container, 0).disabled).toBe(false);
        expect(getNumberInput(container, 2).disabled).toBe(false);
        expect(getNumberInput(container, 1).disabled).toBe(true);
        expect(getNumberInput(container, 3).disabled).toBe(true);
    });

    it('persists right-only text wrapping on the focused drawing', async () => {
        currentTestBed = createPanelTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        renderPanel(root, currentTestBed);

        await act(async () => {
            getRadioInput(container!, 7).click();
            await Promise.resolve();
        });

        expect(currentDrawing(currentTestBed)).toMatchObject({
            layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
            wrapText: WrapTextType.RIGHT,
        });
    });

    it('hides the text wrapping controls when doc drawing focus is cleared', async () => {
        currentTestBed = createPanelTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        renderPanel(root, currentTestBed);

        expect(container.firstElementChild?.classList.contains('univer-hidden')).toBe(false);

        await act(async () => {
            currentTestBed!.get(IDrawingManagerService).focusDrawing([]);
            await Promise.resolve();
        });

        expect(container.firstElementChild?.classList.contains('univer-hidden')).toBe(true);
    });
});
