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

import type { IDisposable, Nullable, Workbook } from '@univerjs/core';
import type { IEditorInputConfig } from '@univerjs/docs-ui';
import type { IRender, IRenderContext, IRenderModule } from '@univerjs/engine-render';
import type { IEditorBridgeServiceVisibleParam } from '../../services/editor-bridge.service';
import type { ISheetObjectParam } from '../utils/component-tools';
import {
    DisposableCollection,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    FOCUSING_FX_BAR_EDITOR,
    FOCUSING_SHEET,
    ICommandService,
    IContextService,
    Inject,
    IUniverInstanceService,
    Optional,
    RxDisposable,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionRenderService } from '@univerjs/docs-ui';
import { DeviceInputEventType, IRenderManagerService } from '@univerjs/engine-render';
import { isCellImage, SheetsSelectionsService } from '@univerjs/sheets';
import { DISABLE_AUTO_FOCUS_KEY, getEmbedChildUnitId } from '@univerjs/ui';
import { filter } from 'rxjs';
import { SetCellEditVisibleOperation } from '../../commands/operations/cell-edit.operation';
import { IEditorBridgeService } from '../../services/editor-bridge.service';
import {
    ISheetEmbedRuntimeFocusCoordinator,
    SHEET_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE,
} from '../../services/sheet-embed-integration.service';
import { getSheetObject } from '../utils/component-tools';

export class DesktopCellEditRenderController extends RxDisposable implements IRenderModule {
    private _d: Nullable<IDisposable>;

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @IUniverInstanceService private readonly _instanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @IContextService private readonly _contextService: IContextService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Optional(ISheetEmbedRuntimeFocusCoordinator)
        private readonly _embedRuntimeFocusCoordinator?: ISheetEmbedRuntimeFocusCoordinator
    ) {
        super();

        this.disposeWithMe(
            this._instanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET).subscribe((workbook) => {
                if (workbook && workbook.getUnitId() === this._context.unitId) {
                    if (!this._d) {
                        this._d = this._init();
                    }
                } else {
                    this._disposeCurrent();
                }
            })
        );
    }

    private _init(): IDisposable {
        const d = new DisposableCollection();
        this._initEventListener(d);
        this._initialKeyboardListener(d);
        this._initSheetFocusListener(d);
        this._initInputPositionListener(d);
        return d;
    }

    private _disposeCurrent(): void {
        this._d?.dispose();
        this._d = null;
    }

    private _initEventListener(d: DisposableCollection): void {
        const sheetObject = this._getSheetObject();
        if (!sheetObject) {
            return;
        }

        const { spreadsheet, spreadsheetColumnHeader, spreadsheetLeftTopPlaceholder, spreadsheetRowHeader } = sheetObject;

        d.add(spreadsheet.onDblclick$.subscribeEvent((evt) => {
            if (evt.button === 2) {
                return;
            }

            const snapshot = this._editorBridgeService.getEditCellState()?.documentLayoutObject.documentModel?.getSnapshot();
            if (isCellImage(snapshot)) {
                return;
            }

            this._commandService.executeCommand(SetCellEditVisibleOperation.id, {
                visible: true,
                eventType: DeviceInputEventType.Dblclick,
                unitId: this._context.unitId,
            } as IEditorBridgeServiceVisibleParam);
        }));

        d.add(spreadsheet.onPointerDown$.subscribeEvent({
            next: (payload) => {
                this._tryHideEditor(resolvePointerEventPayload(payload));
                this._focusCellEditorInput();
            },
            priority: -1,
        }));
        d.add(spreadsheetColumnHeader.onPointerDown$.subscribeEvent({
            next: (payload) => this._tryHideEditor(resolvePointerEventPayload(payload)),
            priority: -1,
        }));
        d.add(spreadsheetLeftTopPlaceholder.onPointerDown$.subscribeEvent({
            next: (payload) => this._tryHideEditor(resolvePointerEventPayload(payload)),
            priority: -1,
        }));
        d.add(spreadsheetRowHeader.onPointerDown$.subscribeEvent({
            next: (payload) => this._tryHideEditor(resolvePointerEventPayload(payload)),
            priority: -1,
        }));
    }

    private _initialKeyboardListener(d: DisposableCollection): void {
        let disposable: Nullable<IDisposable> = null;
        const addEvent = (render: IRender) => {
            disposable?.dispose();
            disposable = null;

            const docSelectionRenderService = render.with(DocSelectionRenderService);
            if (docSelectionRenderService) {
                disposable = toDisposable(docSelectionRenderService.onInputBefore$.subscribe((config) => {
                    if (this._contextService.getContextValue(DISABLE_AUTO_FOCUS_KEY)) {
                        return;
                    }
                    if (!this._isCurrentSheetFocused()) {
                        return;
                    }

                    const isFocusFormulaEditor = this._contextService.getContextValue(FOCUSING_FX_BAR_EDITOR);
                    const isFocusSheets = this._contextService.getContextValue(FOCUSING_SHEET) ||
                        this._embedRuntimeFocusCoordinator?.isChildUnitInActiveSession(this._context.unitId) === true;
                    if (
                        render.unitId &&
                        isFocusSheets &&
                        !isFocusFormulaEditor &&
                        !this._editorBridgeService.isVisible().visible
                    ) {
                        this._showEditorByKeyboard(config);
                    }
                }));
            }
        };

        const render = this._renderManagerService.getRenderUnitById(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
        if (render) {
            addEvent(render);
        }

        d.add(
            this._renderManagerService.created$
                .pipe(filter((renderUnit) => renderUnit.unitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY))
                .subscribe(addEvent)
        );
        d.add(toDisposable(() => {
            disposable?.dispose();
            disposable = null;
        }));
    }

    private _initSheetFocusListener(d: DisposableCollection): void {
        d.add(this._contextService.subscribeContextValue$(FOCUSING_SHEET).subscribe((isFocusingSheet) => {
            if (
                !isFocusingSheet ||
                !this._isCurrentSheetFocused() ||
                this._contextService.getContextValue(FOCUSING_FX_BAR_EDITOR) ||
                this._editorBridgeService.isVisible().visible
            ) {
                return;
            }

            this._focusCellEditorInput();
        }));
    }

    private _initInputPositionListener(d: DisposableCollection): void {
        const selections = this._selectionManagerService.getWorkbookSelections(this._context.unitId);
        d.add(selections.selectionMoveEnd$.subscribe((params) => {
            if (params?.[params.length - 1]?.primary) {
                this._updateInputPosition();
            }
        }));
    }

    private _updateInputPosition(): void {
        if (this._editorBridgeService.isVisible().visible) {
            return;
        }

        const layout = this._editorBridgeService.getEditCellLayout();
        const docSelectionRenderService = this._renderManagerService
            .getRenderUnitById(DOCS_NORMAL_EDITOR_UNIT_ID_KEY)
            ?.with(DocSelectionRenderService);
        if (!layout || !docSelectionRenderService) {
            return;
        }

        const { position, canvasOffset } = layout;
        docSelectionRenderService.setInputPosition(
            canvasOffset.left + position.startX,
            canvasOffset.top + position.startY
        );
    }

    private _focusCellEditorInput(): void {
        const focusedChildUnitId = getEmbedChildUnitId(typeof document === 'undefined' ? null : document.activeElement);
        if (
            this._contextService.getContextValue(DISABLE_AUTO_FOCUS_KEY) ||
            (focusedChildUnitId != null && focusedChildUnitId !== this._context.unitId) ||
            !this._isCurrentSheetFocused() ||
            this._contextService.getContextValue(FOCUSING_FX_BAR_EDITOR) ||
            this._editorBridgeService.isVisible().visible
        ) {
            return;
        }

        const render = this._renderManagerService.getRenderUnitById(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
        const docSelectionRenderService = render?.with(DocSelectionRenderService);

        if (!docSelectionRenderService?.isFocusing) {
            docSelectionRenderService?.focus();
        }
    }

    private _showEditorByKeyboard(config: Nullable<IEditorInputConfig>): void {
        const event = config?.event as InputEvent;
        if (config == null || (!event.data && event.inputType !== 'InsertParagraph')) {
            return;
        }

        const initialValue = config.content ?? event.data ?? '';
        this._commandService.syncExecuteCommand(SetCellEditVisibleOperation.id, {
            visible: true,
            eventType: DeviceInputEventType.Keyboard,
            keycode: event.which,
            initialValue,
            unitId: this._context.unitId,
        });
    }

    private _tryHideEditor(evt?: PointerEventLike): void {
        if (this._editorBridgeService.isForceKeepVisible()) {
            return;
        }
        if (!evt && this._isEmbeddedFormulaEditorActive()) {
            return;
        }
        if (this._isEmbeddedFormulaEditorActive() && this._isCurrentEmbedRuntimeEvent(evt)) {
            return;
        }
        if (isEmbedCellEditorInteraction(evt)) {
            return;
        }

        this._hideEditor();
    }

    private _isEmbeddedFormulaEditorActive(): boolean {
        if (this._embedRuntimeFocusCoordinator?.isChildUnitInActiveSession(this._context.unitId) !== true) {
            return false;
        }

        const editCellState = this._editorBridgeService.getEditCellState();
        const dataStream = editCellState?.documentLayoutObject.documentModel?.getSnapshot().body?.dataStream;

        return typeof dataStream === 'string' && dataStream.startsWith('=');
    }

    private _isCurrentEmbedRuntimeEvent(evt?: PointerEventLike): boolean {
        return this._embedRuntimeFocusCoordinator?.isChildUnitRuntimeEvent(
            this._context.unitId,
            evt?.target,
            evt instanceof Event ? evt : evt as Event | undefined
        ) === true;
    }

    private _hideEditor(): void {
        if (this._editorBridgeService.isVisible().visible !== true) {
            return;
        }

        this._commandService.syncExecuteCommand(SetCellEditVisibleOperation.id, {
            visible: false,
            eventType: DeviceInputEventType.PointerDown,
            unitId: this._context.unitId,
        });
    }

    private _getSheetObject(): Nullable<ISheetObjectParam> {
        if (!this._context.unit) {
            return null;
        }

        return getSheetObject(this._context.unit, this._context);
    }

    private _isCurrentSheetFocused(): boolean {
        return this._instanceService.getFocusedUnit()?.getUnitId() === this._context.unitId ||
            this._embedRuntimeFocusCoordinator?.isChildUnitInActiveSession(this._context.unitId) === true;
    }
}

type PointerEventLike = Event | {
    target?: EventTarget | null;
    clientX?: number;
    clientY?: number;
    x?: number;
    y?: number;
};

interface IPointerEventPoint {
    clientX?: number;
    clientY?: number;
    x?: number;
    y?: number;
}

function resolvePointerEventPayload(
    payload: PointerEventLike | [PointerEventLike, unknown] | undefined
): PointerEventLike | undefined {
    return Array.isArray(payload) ? payload[0] : payload;
}

function isEmbedCellEditorInteraction(evt: PointerEventLike | undefined): boolean {
    return isEmbedCellEditorInteractionTarget(evt?.target) || isEmbedCellEditorInteractionPoint(resolvePointerEventPoint(evt));
}

function isEmbedCellEditorInteractionTarget(target: EventTarget | null | undefined): boolean {
    if (typeof HTMLElement === 'undefined' || !(target instanceof HTMLElement)) {
        return false;
    }

    return target.closest(`[${SHEET_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE}="child-editor"]`) != null ||
        target.closest('[data-u-comp="editor"]') != null ||
        target.closest('[id^="__editor___INTERNAL_EDITOR__"]') != null ||
        target.closest('[id^="univer-doc-selection-container-__INTERNAL_EDITOR__"]') != null;
}

function resolvePointerEventPoint(evt: PointerEventLike | undefined): IPointerEventPoint | undefined {
    if (!evt) {
        return undefined;
    }

    return {
        clientX: 'clientX' in evt ? evt.clientX : undefined,
        clientY: 'clientY' in evt ? evt.clientY : undefined,
        x: 'x' in evt ? evt.x : undefined,
        y: 'y' in evt ? evt.y : undefined,
    };
}

function isEmbedCellEditorInteractionPoint(evt: IPointerEventPoint | undefined): boolean {
    if (typeof document === 'undefined') {
        return false;
    }

    const clientX = Number.isFinite(evt?.clientX) ? evt?.clientX : evt?.x;
    const clientY = Number.isFinite(evt?.clientY) ? evt?.clientY : evt?.y;
    if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) {
        return false;
    }

    const editorRoots = document.querySelectorAll<HTMLElement>([
        `[${SHEET_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE}="child-editor"]`,
        '[data-u-comp="editor"]',
        '[id^="__editor___INTERNAL_EDITOR__"]',
        '[id^="univer-doc-selection-container-__INTERNAL_EDITOR__"]',
    ].join(','));

    return [...editorRoots].some((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 &&
            rect.height > 0 &&
            clientX! >= rect.left &&
            clientX! <= rect.right &&
            clientY! >= rect.top &&
            clientY! <= rect.bottom;
    });
}
