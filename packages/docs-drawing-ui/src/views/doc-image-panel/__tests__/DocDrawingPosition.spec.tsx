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
import locale from '../../../locale/en-US';
import { DocDrawingPosition } from '../DocDrawingPosition';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const UNIT_ID = 'doc-drawing-position-doc';
const DRAWING_ID = 'image-1';

class TestDocSkeletonManagerService {
    private readonly _page = { marginTop: 72 };
    private readonly _column = {
        lines: [] as Array<{
            top: number;
            paragraphIndex: number;
            paragraphStart?: boolean;
        }>,
        parent: {
            parent: this._page,
        },
    };

    private readonly _paragraphStartLine = {
        top: 20,
        paragraphIndex: 1,
        paragraphStart: true,
    };

    private readonly _line = {
        top: 44,
        paragraphIndex: 1,
        parent: this._column,
    };

    private readonly _glyph = {
        parent: {
            parent: this._line,
        },
    };

    constructor() {
        this._column.lines.push(this._paragraphStartLine, this._line);
    }

    getSkeleton() {
        return {
            findNodeByCharIndex: () => this._glyph,
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
            reset: () => undefined,
        };
    }
}

class TestDocSelectionRenderService {
    getSegment() {
        return '';
    }

    getSegmentPage() {
        return 0;
    }

    blur() {
        return undefined;
    }
}

class TestScene {
    getTransformerByCreate() {
        return {
            refreshControls: () => undefined,
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

    private _getRender() {
        if (this._render == null) {
            return null;
        }

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

    getRenderUnitById(_unitId: string) {
        return this._getRender();
    }

    getRenderById(_unitId: string) {
        return this._getRender();
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
                docTransform: {
                    positionH: {
                        relativeFrom: ObjectRelativeFromH.PAGE,
                        posOffset: 0,
                    },
                    positionV: {
                        relativeFrom: ObjectRelativeFromV.PARAGRAPH,
                        posOffset: 12,
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

function createPositionTestBed() {
    const testBed = createDocUiTestBed(createDocData(), [
        [IRenderManagerService, { useClass: TestRenderManagerService as never }],
    ]);
    const { injector } = testBed;

    injector.add([DocDrawingService]);
    injector.add([IDocDrawingService, { useClass: DocDrawingService }]);
    injector.add([IDrawingManagerService, { useClass: DrawingManagerService }]);
    injector.add([DocDrawingController]);

    const commandService = injector.get(ICommandService);
    [
        RichTextEditingMutation as unknown as ICommand,
    ].forEach((command) => commandService.registerCommand(command));

    injector.get(LocaleService).load({
        [LocaleType.EN_US]: locale,
    });
    injector.get(LocaleService).setLocale(LocaleType.EN_US);

    injector.get(DocDrawingController).loadDrawingDataForUnit(UNIT_ID);
    injector.get(IDrawingManagerService).focusDrawing([{
        unitId: UNIT_ID,
        subUnitId: UNIT_ID,
        drawingId: DRAWING_ID,
    }]);

    return testBed;
}

function renderPanel(root: Root, testBed: ReturnType<typeof createPositionTestBed>) {
    const drawing = testBed.doc.getSnapshot().drawings![DRAWING_ID];

    act(() => {
        root.render(
            <RediContext.Provider value={{ injector: testBed.injector }}>
                <DocDrawingPosition drawings={[drawing as never]} />
            </RediContext.Provider>
        );
    });
}

function currentDrawing(testBed: ReturnType<typeof createPositionTestBed>) {
    return testBed.get(IUniverInstanceService)
        .getUnit<DocumentDataModel>(UNIT_ID, UniverInstanceType.UNIVER_DOC)!
        .getSnapshot()
        .drawings![DRAWING_ID];
}

function getNumberInput(container: HTMLElement, index: number): HTMLInputElement {
    return container.querySelectorAll<HTMLInputElement>('[data-u-comp="input"] input')[index];
}

function getMoveWithTextInput(container: HTMLElement): HTMLInputElement {
    return container.querySelector<HTMLInputElement>('[data-u-comp="checkbox"] input')!;
}

function setInputValue(input: HTMLInputElement, value: string) {
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    valueSetter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

async function selectPositionRelativeFrom(container: HTMLDivElement, selectIndex: number, optionIndex: number) {
    const select = Array.from(container.querySelectorAll('[data-u-comp="select"]'))[selectIndex] as HTMLElement | undefined;

    expect(select).toBeDefined();

    await act(async () => {
        select!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
        await Promise.resolve();
    });

    const option = document.querySelectorAll<HTMLElement>('[data-slot="dropdown-menu-radio-item"]')[optionIndex];

    expect(option).toBeDefined();

    await act(async () => {
        option!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await Promise.resolve();
    });
}

describe('DocDrawingPosition', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentTestBed: ReturnType<typeof createPositionTestBed> | undefined;

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

    it('anchors the focused drawing to the page when move-with-text is turned off', async () => {
        currentTestBed = createPositionTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        renderPanel(root, currentTestBed);

        const moveWithText = getMoveWithTextInput(container);
        expect(moveWithText.checked).toBe(true);

        await act(async () => {
            moveWithText.click();
            await Promise.resolve();
        });

        expect(moveWithText.checked).toBe(false);
        expect(currentDrawing(currentTestBed)).toMatchObject({
            docTransform: {
                positionV: {
                    relativeFrom: ObjectRelativeFromV.PAGE,
                    posOffset: 104,
                },
            },
        });
    });

    it('persists horizontal absolute position on the focused drawing', async () => {
        currentTestBed = createPositionTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        renderPanel(root, currentTestBed);

        const horizontalPositionInput = getNumberInput(container, 0);

        await act(async () => {
            setInputValue(horizontalPositionInput, '36.5');
            await Promise.resolve();
        });

        expect(currentDrawing(currentTestBed)).toMatchObject({
            docTransform: {
                positionH: {
                    relativeFrom: ObjectRelativeFromH.PAGE,
                    posOffset: 36.5,
                },
            },
        });
    });

    it('keeps the image visually fixed when horizontal positioning changes from page to margin', async () => {
        currentTestBed = createPositionTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        renderPanel(root, currentTestBed);

        await selectPositionRelativeFrom(container, 0, 2);

        expect(currentDrawing(currentTestBed)).toMatchObject({
            docTransform: {
                positionH: {
                    relativeFrom: ObjectRelativeFromH.MARGIN,
                    posOffset: -90,
                },
            },
        });
    });

    it('persists vertical absolute position on the focused drawing', async () => {
        currentTestBed = createPositionTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        renderPanel(root, currentTestBed);

        const verticalPositionInput = getNumberInput(container, 1);

        await act(async () => {
            setInputValue(verticalPositionInput, '18.5');
            await Promise.resolve();
        });

        expect(currentDrawing(currentTestBed)).toMatchObject({
            docTransform: {
                positionV: {
                    relativeFrom: ObjectRelativeFromV.PARAGRAPH,
                    posOffset: 18.5,
                },
            },
        });
    });

    it('hides the position controls when doc drawing focus is cleared', async () => {
        currentTestBed = createPositionTestBed();
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
