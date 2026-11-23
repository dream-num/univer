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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import type { ReactElement } from 'react';
import type { Root } from 'react-dom/client';
import {
    CustomCommandExecutionError,
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    ObjectMatrix,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { CanvasColorService, ICanvasColorService, IRenderManagerService } from '@univerjs/engine-render';
import { SheetPermissionCheckController } from '@univerjs/sheets';
import { DesktopLayoutService, ILayoutService, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it, onTestFinished, vi } from 'vitest';
import { SheetOptionalPasteCommand } from '../../../commands/commands/clipboard.command';
import { SheetRenderController } from '../../../controllers/render-controllers/sheet.render-controller';
import { clipboardTestBed } from '../../../services/clipboard/__tests__/clipboard-test-bed';
import { ISheetClipboardService, PREDEFINED_HOOK_NAME_PASTE } from '../../../services/clipboard/clipboard.service';
import { SheetSkeletonManagerService } from '../../../services/sheet-skeleton-manager.service';
import { SheetsRenderService } from '../../../services/sheets-render.service';
import { ClipboardPopupMenu } from '../ClipboardPopupMenu';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const UNIT_ID = 'clipboard-popup-unit';
const SHEET_ID = 'sheet-1';

class TestSheetClipboardService {
    private readonly _showMenu$ = new BehaviorSubject(false);
    readonly showMenu$ = this._showMenu$.asObservable();

    private readonly _pasteOptionsCache$ = new BehaviorSubject({
        target: {
            unitId: UNIT_ID,
            subUnitId: SHEET_ID,
            pastedRange: { rows: [0, 1], cols: [0, 1] },
        },
        cellMatrix: new ObjectMatrix(),
        pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE,
    });

    readonly pasteOptionsCache$ = this._pasteOptionsCache$.asObservable();
    readonly selectedPasteTypes: string[] = [];

    setShowMenu(show: boolean): void {
        this._showMenu$.next(show);
    }

    getPasteMenuVisible(): boolean {
        return this._showMenu$.getValue();
    }

    getPasteOptionsCache(): unknown {
        return this._pasteOptionsCache$.getValue();
    }

    updatePasteOptionsCache(cache: unknown): void {
        this._pasteOptionsCache$.next(cache as never);
    }

    rePasteWithPasteType(type: string): boolean {
        this.selectedPasteTypes.push(type);
        return true;
    }
}

class TestSheetSkeletonManagerService {
    getCurrentSkeleton() {
        return {
            getNoMergeCellWithCoordByIndex: () => ({ endX: 80, endY: 40 }),
        };
    }
}

class TestRenderUnit {
    readonly components = new Map();
    readonly mainComponent = {};
    readonly canvas = document.createElement('canvas');
    readonly engine = {
        getCanvasElement: () => this.canvas,
        getCanvas: () => ({ getWidth: () => 400, getHeight: () => 300 }),
    };

    readonly sheetSkeletonManagerService = new TestSheetSkeletonManagerService();
    readonly scene = {
        scaleX: 1,
        scaleY: 1,
        getViewport: () => ({}),
        getViewportScrollXY: () => ({ x: 0, y: 0 }),
        getEngine: () => this.engine,
    };

    with(token: unknown): unknown {
        if (token === SheetSkeletonManagerService) {
            return this.sheetSkeletonManagerService;
        }

        return null;
    }
}

class TestRenderManagerService {
    readonly renderUnit = new TestRenderUnit();
    getRenderUnitById(): TestRenderUnit {
        return this.renderUnit;
    }
}

class TestLayoutService {
    readonly content = document.createElement('div');

    getContentElement(): HTMLElement {
        return this.content;
    }

    focusCount = 0;
    menuOpenWhenFocused = false;

    focus(): void {
        this.focusCount += 1;
        this.menuOpenWhenFocused = document.querySelector('[role="menu"][data-state="open"]') !== null;
    }
}

function createWorkbookData(): IWorkbookData {
    return {
        id: UNIT_ID,
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: 'Clipboard Popup',
        sheetOrder: [SHEET_ID],
        styles: {},
        sheets: {
            [SHEET_ID]: {
                id: SHEET_ID,
                name: 'Sheet1',
                cellData: {},
            },
        },
    };
}

function createClipboardPopupTestBed(permissionCheckWithRanges = vi.fn(() => true)) {
    const univer = new Univer();
    const injector = univer.__getInjector();

    injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
    injector.add([ISheetClipboardService, { useClass: TestSheetClipboardService as never }]);
    injector.add([ILayoutService, { useClass: TestLayoutService as never }]);
    injector.add([SheetPermissionCheckController, { useValue: {
        permissionCheckWithRanges,
        blockExecuteWithoutPermission: () => {
            throw new CustomCommandExecutionError('have no permission');
        },
    } as unknown as SheetPermissionCheckController }]);

    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());
    injector.get(IUniverInstanceService).focusUnit(UNIT_ID);
    injector.get(LocaleService).load({ [LocaleType.EN_US]: {} });
    injector.get(LocaleService).setLocale(LocaleType.EN_US);
    injector.get(ICommandService).registerCommand(SheetOptionalPasteCommand);

    return { univer, injector, workbook, permissionCheckWithRanges };
}

function renderWithDependencies(element: ReactElement, injector: ReturnType<typeof createClipboardPopupTestBed>['injector']) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                {element}
            </RediContext.Provider>
        );
    });

    return { container, root };
}

async function clickElement(element: HTMLElement): Promise<void> {
    await act(async () => {
        element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await Promise.resolve();
    });
}

function getByText(text: string): HTMLElement {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
        if (node.textContent === text) {
            const element = node.parentElement;
            if (element) {
                return element;
            }
        }
        node = walker.nextNode();
    }

    throw new Error(`Text not found: ${text}`);
}

describe('ClipboardPopupMenu', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentBed: ReturnType<typeof createClipboardPopupTestBed> | undefined;

    afterEach(() => {
        act(() => {
            root?.unmount();
        });
        container?.remove();
        currentBed?.univer.dispose();
        document.body.innerHTML = '';
        root = undefined;
        container = undefined;
        currentBed = undefined;
    });

    it.each([2, 0])('positions a companion paste menu relative to the content host while preserving local visibility for row %s', async (row) => {
        vi.useFakeTimers();
        onTestFinished(() => {
            vi.useRealTimers();
        });
        const canvasContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
            return new Proxy({
                canvas: this,
                webkitBackingStorePixelRatio: 1,
                mozBackingStorePixelRatio: 1,
                msBackingStorePixelRatio: 1,
                oBackingStorePixelRatio: 1,
                backingStorePixelRatio: 1,
                getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
                measureText: () => ({ width: 10, actualBoundingBoxAscent: 10, actualBoundingBoxDescent: 2 }),
            }, { get: (target, key) => Reflect.get(target, key) ?? (() => {}) }) as unknown as CanvasRenderingContext2D;
        });
        onTestFinished(() => canvasContext.mockRestore());
        const bed = clipboardTestBed();
        const injector = bed.univer.__getInjector();
        currentBed = { univer: bed.univer, injector, workbook: bed.sheet, permissionCheckWithRanges: vi.fn(() => true) };
        injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
        injector.add([ILayoutService, { useClass: DesktopLayoutService }]);
        injector.add([SheetsRenderService]);
        const renders = injector.get(IRenderManagerService);
        renders.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetSkeletonManagerService]);
        renders.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetRenderController]);
        const companion = renders.createRender('test', undefined, 'popup-companion');
        companion.engine.resizeBySize(1000, 700);
        const manager = companion.with(SheetSkeletonManagerService);
        manager.setCurrent({ sheetId: 'sheet1' });
        if (row === 0) {
            companion.scene.getMainViewport().scrollToViewportPos({ viewportScrollX: 0, viewportScrollY: 100 });
        }
        renders.focusRender?.('popup-companion');
        const host = document.createElement('div');
        injector.get(ILayoutService).registerContentElement(host);
        vi.spyOn(companion.engine.getCanvasElement(), 'getBoundingClientRect').mockReturnValue(new DOMRect(500, 100, 1000, 700));
        vi.spyOn(host, 'getBoundingClientRect').mockReturnValue(new DOMRect(20, 30, 1400, 900));
        const clipboard = injector.get(ISheetClipboardService);
        clipboard.updatePasteOptionsCache({
            target: { unitId: 'test', subUnitId: 'sheet1', pastedRange: { rows: [row], cols: [2] } },
            cellMatrix: new ObjectMatrix(),
            pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE,
        });
        const rendered = renderWithDependencies(<ClipboardPopupMenu />, injector);
        root = rendered.root;
        container = rendered.container;
        await act(async () => {
            await Promise.resolve();
            clipboard.setShowMenu(true);
        });
        const cell = manager.getCurrentSkeleton()!.getNoMergeCellWithCoordByIndex(row, 2);
        const positioned = container.querySelector<HTMLElement>('[style]');
        if (row === 0) {
            expect(positioned).toBeNull();
            return;
        }
        expect(positioned?.style.left).toBe(`${String(cell.endX + 480 + 2)}px`);
        expect(positioned?.style.top).toBe(`${String(cell.endY + 70 + 2)}px`);
    });

    it('runs optional paste through the command service with the selected paste option', async () => {
        currentBed = createClipboardPopupTestBed();
        const clipboardService = currentBed.injector.get(ISheetClipboardService) as unknown as TestSheetClipboardService;
        const rendered = renderWithDependencies(<ClipboardPopupMenu />, currentBed.injector);
        root = rendered.root;
        container = rendered.container;

        act(() => {
            clipboardService.setShowMenu(true);
        });

        const trigger = rendered.container.querySelector('[data-slot="dropdown-menu-trigger"]');
        if (!(trigger instanceof HTMLElement)) {
            throw new TypeError('Clipboard menu trigger not found');
        }

        await clickElement(trigger);
        await clickElement(getByText('sheets-ui.rightClick.pasteValue'));

        expect(clipboardService.selectedPasteTypes).toEqual(['SPECIAL_PASTE_VALUE']);
    });

    it('restores focus after selecting a paste option', async () => {
        currentBed = createClipboardPopupTestBed();
        const clipboardService = currentBed.injector.get(ISheetClipboardService) as unknown as TestSheetClipboardService;
        const layoutService = currentBed.injector.get(ILayoutService) as unknown as TestLayoutService;
        const rendered = renderWithDependencies(<ClipboardPopupMenu />, currentBed.injector);
        root = rendered.root;
        container = rendered.container;

        act(() => {
            clipboardService.setShowMenu(true);
        });

        const trigger = rendered.container.querySelector('[data-slot="dropdown-menu-trigger"]');
        if (!(trigger instanceof HTMLElement)) {
            throw new TypeError('Clipboard menu trigger not found');
        }

        await clickElement(trigger);
        await clickElement(getByText('sheets-ui.rightClick.pasteValue'));

        await expect.poll(() => layoutService.focusCount).toBe(1);
        expect(layoutService.menuOpenWhenFocused).toBe(false);
    });

    it('does not replay the selected paste option when the target permission is denied', async () => {
        currentBed = createClipboardPopupTestBed(vi.fn(() => false));
        const clipboardService = currentBed.injector.get(ISheetClipboardService) as unknown as TestSheetClipboardService;
        const rendered = renderWithDependencies(<ClipboardPopupMenu />, currentBed.injector);
        root = rendered.root;
        container = rendered.container;

        act(() => {
            clipboardService.setShowMenu(true);
        });

        const trigger = rendered.container.querySelector('[data-slot="dropdown-menu-trigger"]');
        if (!(trigger instanceof HTMLElement)) {
            throw new TypeError('Clipboard menu trigger not found');
        }

        await clickElement(trigger);
        await clickElement(getByText('sheets-ui.rightClick.pasteColWidth'));

        expect(currentBed.permissionCheckWithRanges).toHaveBeenCalled();
        expect(clipboardService.selectedPasteTypes).toEqual([]);
    });
});
