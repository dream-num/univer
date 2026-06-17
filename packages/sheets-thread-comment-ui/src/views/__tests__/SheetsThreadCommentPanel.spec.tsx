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

import type { IDisposable, IDocumentBody, Injector, IWorkbookData, Workbook } from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import type { IThreadComment } from '@univerjs/thread-comment';
import type { ISidebarMethodOptions } from '@univerjs/ui';
import type { Root } from 'react-dom/client';
import {
    Disposable,
    ICommandService,
    IUniverInstanceService,
    LifecycleService,
    LifecycleStages,
    LocaleType,
    toDisposable,
    Univer,
    UniverInstanceType,
    UserManagerService,
} from '@univerjs/core';
import { SheetsThreadCommentModel } from '@univerjs/sheets-thread-comment';
import { CellPopupManagerService, IMarkSelectionService, SheetCanvasPopManagerService } from '@univerjs/sheets-ui';
import {
    AddCommentMutation,
    IThreadCommentDataSourceService,
    ResolveCommentCommand,
    ResolveCommentMutation,
    ThreadCommentDataSourceService,
    ThreadCommentModel,
} from '@univerjs/thread-comment';
import { SetActiveCommentOperation, ThreadCommentPanelService } from '@univerjs/thread-comment-ui';
import threadCommentEnUS from '@univerjs/thread-comment-ui/locale/en-US';
import { ISidebarService, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SheetsThreadCommentPopupService } from '../../services/sheets-thread-comment-popup.service';
import { SheetsThreadCommentPanel } from '../SheetsThreadCommentPanel';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const unitId = 'sheet-thread-comment-panel-test';
const sheet1 = 'sheet-1';
const sheet2 = 'sheet-2';

const workbookData: IWorkbookData = {
    id: unitId,
    appVersion: '3.0.0-alpha',
    name: 'Comment panel workbook',
    locale: LocaleType.EN_US,
    sheetOrder: [sheet1, sheet2],
    styles: {},
    sheets: {
        [sheet1]: {
            id: sheet1,
            name: 'Sheet 1',
            rowCount: 20,
            columnCount: 20,
            cellData: {},
        },
        [sheet2]: {
            id: sheet2,
            name: 'Sheet 2',
            rowCount: 20,
            columnCount: 20,
            cellData: {},
        },
    },
};

interface IRecordedShape {
    id: string;
    selection: ISelectionWithStyle;
}

class TestState {
    static popupDisposeCount = 0;
    static shapeSeq = 0;
    static shapes: IRecordedShape[] = [];
    static removedShapeIds: string[] = [];

    static reset() {
        this.popupDisposeCount = 0;
        this.shapeSeq = 0;
        this.shapes = [];
        this.removedShapeIds = [];
    }
}

class TestSidebarService extends Disposable implements ISidebarService {
    readonly sidebarOptions$ = new Subject<ISidebarMethodOptions>();
    readonly scrollEvent$ = new Subject<Event>();
    private _options: ISidebarMethodOptions = {};
    private _container?: HTMLElement;

    open(params: ISidebarMethodOptions): IDisposable {
        this._options = { ...params, visible: true };
        this.sidebarOptions$.next(this._options);
        return toDisposable(() => this.close());
    }

    close(): void {
        this._options = { ...this._options, visible: false };
        this.sidebarOptions$.next(this._options);
        this._options.onClose?.();
    }

    get visible(): boolean {
        return this._options.visible ?? false;
    }

    get options(): ISidebarMethodOptions {
        return this._options;
    }

    get width(): number | undefined {
        return undefined;
    }

    setWidth(): void {}

    getContainer(): HTMLElement | undefined {
        return this._container;
    }

    setContainer(element?: HTMLElement): void {
        this._container = element;
    }

    override dispose(): void {
        super.dispose();
        this.sidebarOptions$.complete();
        this.scrollEvent$.complete();
    }
}

class TestMarkSelectionService implements IMarkSelectionService {
    addShape(selection: ISelectionWithStyle): string {
        const id = `shape-${++TestState.shapeSeq}`;
        TestState.shapes.push({ id, selection });
        return id;
    }

    addShapeWithNoFresh(selection: ISelectionWithStyle): string {
        return this.addShape(selection);
    }

    removeShape(id: string): void {
        TestState.removedShapeIds.push(id);
        TestState.shapes = TestState.shapes.filter((shape) => shape.id !== id);
    }

    removeAllShapes(): void {
        TestState.removedShapeIds.push(...TestState.shapes.map((shape) => shape.id));
        TestState.shapes = [];
    }

    refreshShapes(): void {}

    getShapeMap(): Map<string, never> {
        return new Map<string, never>();
    }
}

class TestCellPopupManagerService {
    showPopup(): IDisposable {
        return toDisposable(() => {
            TestState.popupDisposeCount += 1;
        });
    }
}

class TestSheetCanvasPopManagerService {}

function createTextBody(text: string): IDocumentBody {
    const dataStream = `${text}\r\n`;
    return {
        dataStream,
        textRuns: [],
        paragraphs: [
            {
                startIndex: dataStream.length - 2,
                paragraphId: `paragraph-${text}`,
            },
        ],
        sectionBreaks: [
            {
                startIndex: dataStream.length - 1,
            },
        ],
    };
}

function createComment(id: string, subUnitId: string, ref: string, text: string, resolved = false): IThreadComment {
    return {
        id,
        threadId: id,
        ref,
        unitId,
        subUnitId,
        dT: '2026-06-17T00:00:00.000Z',
        personId: 'user-1',
        resolved,
        text: createTextBody(text),
    };
}

function createTestBed() {
    const univer = new Univer({
        locale: LocaleType.EN_US,
        locales: {
            [LocaleType.EN_US]: threadCommentEnUS,
        },
    });
    const injector = univer.__getInjector();
    const get = injector.get.bind(injector) as Injector['get'];

    injector.add([IThreadCommentDataSourceService, { useClass: ThreadCommentDataSourceService }]);
    injector.add([ThreadCommentModel]);
    injector.add([SheetsThreadCommentModel]);
    injector.add([IMarkSelectionService, { useClass: TestMarkSelectionService }]);
    injector.add([CellPopupManagerService, { useClass: TestCellPopupManagerService as never }]);
    injector.add([SheetCanvasPopManagerService, { useClass: TestSheetCanvasPopManagerService as never }]);
    injector.add([SheetsThreadCommentPopupService]);
    injector.add([ISidebarService, { useClass: TestSidebarService as never }]);
    injector.add([ThreadCommentPanelService]);

    univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, workbookData);
    get(IUniverInstanceService).focusUnit(unitId);
    get(LifecycleService).stage = LifecycleStages.Rendered;
    get(UserManagerService).setCurrentUser({ userID: 'user-1', name: 'Ada' });

    const commandService = get(ICommandService);
    commandService.registerCommand(AddCommentMutation);
    commandService.registerCommand(ResolveCommentMutation);
    commandService.registerCommand(ResolveCommentCommand);
    commandService.registerCommand(SetActiveCommentOperation);

    return {
        univer,
        injector,
        get,
        commandService,
        threadCommentModel: get(ThreadCommentModel),
        popupService: get(SheetsThreadCommentPopupService),
    };
}

function renderPanel(injector: Injector) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                <SheetsThreadCommentPanel />
            </RediContext.Provider>
        );
    });

    return { container, root };
}

function orderOf(text: string, ...items: string[]) {
    return items.map((item) => {
        const index = text.indexOf(item);
        expect(index).toBeGreaterThanOrEqual(0);
        return index;
    });
}

function dispatchMouseEvent(element: Element, type: string) {
    act(() => {
        element.dispatchEvent(new MouseEvent(type, { bubbles: true }));
    });
}

describe('SheetsThreadCommentPanel', () => {
    let univer: Univer | undefined;
    let root: Root | undefined;
    let container: HTMLElement | undefined;
    let scrollIntoViewDescriptor: PropertyDescriptor | undefined;

    beforeEach(() => {
        TestState.reset();
        scrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView');
        Object.defineProperty(Element.prototype, 'scrollIntoView', {
            configurable: true,
            value() {},
        });
    });

    afterEach(() => {
        if (root) {
            act(() => root!.unmount());
        }
        container?.remove();
        univer?.dispose();
        if (scrollIntoViewDescriptor) {
            Object.defineProperty(Element.prototype, 'scrollIntoView', scrollIntoViewDescriptor);
        } else {
            delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView;
        }
        root = undefined;
        container = undefined;
        univer = undefined;
    });

    it('orders panel comments by unresolved status, sheet order, and cell reference', () => {
        const testBed = createTestBed();
        univer = testBed.univer;
        testBed.threadCommentModel.addComment(unitId, sheet2, createComment('sheet-2-a1', sheet2, 'A1', 'Sheet two A1'));
        testBed.threadCommentModel.addComment(unitId, sheet1, createComment('sheet-1-c3', sheet1, 'C3', 'Sheet one C3'));
        testBed.threadCommentModel.addComment(unitId, sheet1, createComment('sheet-1-a2', sheet1, 'A2', 'Sheet one A2'));
        testBed.threadCommentModel.addComment(unitId, sheet1, createComment('sheet-1-a1-done', sheet1, 'A1', 'Resolved sheet one A1', true));

        const rendered = renderPanel(testBed.injector);
        root = rendered.root;
        container = rendered.container;

        const [sheet1A2, sheet1C3, sheet2A1, resolvedSheet1A1] = orderOf(
            container.textContent ?? '',
            'Sheet one A2',
            'Sheet one C3',
            'Sheet two A1',
            'Resolved sheet one A1'
        );
        expect(sheet1A2).toBeLessThan(sheet1C3);
        expect(sheet1C3).toBeLessThan(sheet2A1);
        expect(sheet2A1).toBeLessThan(resolvedSheet1A1);
    });

    it('highlights only unresolved comments on the current sheet and closes the cell popup when resolved', () => {
        const testBed = createTestBed();
        univer = testBed.univer;
        testBed.threadCommentModel.addComment(unitId, sheet1, createComment('current-sheet-thread', sheet1, 'B2', 'Current sheet B2'));
        testBed.threadCommentModel.addComment(unitId, sheet2, createComment('other-sheet-thread', sheet2, 'A1', 'Other sheet A1'));
        testBed.threadCommentModel.addComment(unitId, sheet1, createComment('resolved-thread', sheet1, 'C3', 'Resolved sheet C3', true));
        testBed.popupService.showPopup({
            unitId,
            subUnitId: sheet1,
            row: 1,
            col: 1,
            commentId: 'current-sheet-thread',
        });

        const rendered = renderPanel(testBed.injector);
        root = rendered.root;
        container = rendered.container;

        const currentThread = container.querySelector(`#PANEL-${unitId}-${sheet1}-current-sheet-thread`);
        const otherSheetThread = container.querySelector(`#PANEL-${unitId}-${sheet2}-other-sheet-thread`);
        const resolvedThread = container.querySelector(`#PANEL-${unitId}-${sheet1}-resolved-thread`);
        expect(currentThread).toBeInstanceOf(HTMLElement);
        expect(otherSheetThread).toBeInstanceOf(HTMLElement);
        expect(resolvedThread).toBeInstanceOf(HTMLElement);

        dispatchMouseEvent(currentThread!, 'mouseover');
        expect(TestState.shapes).toEqual([
            expect.objectContaining({
                selection: expect.objectContaining({
                    range: {
                        startRow: 1,
                        endRow: 1,
                        startColumn: 1,
                        endColumn: 1,
                    },
                }),
            }),
        ]);

        dispatchMouseEvent(currentThread!, 'mouseout');
        expect(TestState.shapes).toHaveLength(0);
        expect(TestState.removedShapeIds).toEqual(['shape-1']);

        dispatchMouseEvent(otherSheetThread!, 'mouseover');
        dispatchMouseEvent(resolvedThread!, 'mouseover');
        expect(TestState.shapes).toHaveLength(0);

        const resolveButton = currentThread!.querySelector('.univer-flex-shrink-0 .univer-cursor-pointer');
        expect(resolveButton).toBeInstanceOf(HTMLElement);

        act(() => {
            resolveButton!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(testBed.popupService.activePopup).toBeNull();
        expect(TestState.popupDisposeCount).toBe(1);
    });
});
