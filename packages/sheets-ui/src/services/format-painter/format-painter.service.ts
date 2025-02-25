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

import type { IMutationInfo, IRange, IStyleData } from '@univerjs/core';
import { createIdentifier, Disposable, ICommandService, ILogService, Inject, IUndoRedoService, ObjectMatrix, ThemeService } from '@univerjs/core';
import { SetRangeValuesMutation, SheetsSelectionsService } from '@univerjs/sheets';
import type { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

import { IMarkSelectionService } from '../mark-selection/mark-selection.service';
import { createCopyPasteSelectionStyle } from '../utils/selection-util';

export interface IFormatPainterService {
    status$: Observable<FormatPainterStatus>;
    addHook(hooks: IFormatPainterHook): void;
    getHooks(): IFormatPainterHook[];
    setStatus(status: FormatPainterStatus): void;
    getStatus(): FormatPainterStatus;
    setSelectionFormat(format: ISelectionFormatInfo): void;
    getSelectionFormat(): ISelectionFormatInfo;
    applyFormatPainter(unitId: string, subUnitId: string, range: IRange): boolean;
}

export interface ISelectionFormatInfo {
    styles: ObjectMatrix<IStyleData>;
    merges: IRange[];
}

export interface IFormatPainterHook {
    id: string;
    isDefaultHook?: boolean;
    priority?: number;
    onStatusChange?(status: FormatPainterStatus): void;
    onApply?(
        unitId: string,
        subUnitId: string,
        range: IRange,
        format: ISelectionFormatInfo): {
        undos: IMutationInfo[];
        redos: IMutationInfo[];
    };
    onBeforeApply?(ctx: IFormatPainterBeforeApplyHookParams): boolean;
}
export enum FormatPainterStatus {
    OFF,
    ONCE,
    INFINITE,
}
export interface IFormatPainterBeforeApplyHookParams {
    unitId: string;
    subUnitId: string;
    range: IRange;
    redoMutationsInfo: IMutationInfo[];
    undoMutationsInfo: IMutationInfo[];
    format: ISelectionFormatInfo;
}

export const IFormatPainterService = createIdentifier<IFormatPainterService>('univer.format-painter-service');

export class FormatPainterService extends Disposable implements IFormatPainterService {
    readonly status$: Observable<FormatPainterStatus>;
    private _selectionFormat: ISelectionFormatInfo;
    private _markId: string | null = null;
    private readonly _status$: BehaviorSubject<FormatPainterStatus>;
    private _defaultHook: IFormatPainterHook | null = null;
    private _extendHooks: IFormatPainterHook[] = [];

    constructor(
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @Inject(ThemeService) private readonly _themeService: ThemeService,
        @IMarkSelectionService private readonly _markSelectionService: IMarkSelectionService,
        @ILogService private readonly _logService: ILogService,
        @ICommandService private readonly _commandService: ICommandService,
        @IUndoRedoService private readonly _undoRedoService: IUndoRedoService
    ) {
        super();

        this._status$ = new BehaviorSubject<FormatPainterStatus>(FormatPainterStatus.OFF);
        this.status$ = this._status$.asObservable();
        this._selectionFormat = { styles: new ObjectMatrix<IStyleData>(), merges: [] };
    }

    addHook(hook: IFormatPainterHook): void {
        if (hook.isDefaultHook && (hook.priority ?? 0) > (this._defaultHook?.priority ?? -1)) {
            this._defaultHook = hook;
        } else {
            this._extendHooks.push(hook);
            this._extendHooks.sort((a, b) => (a.priority || 0) - (b.priority || 0));
        }
    }

    getHooks(): IFormatPainterHook[] {
        return this._defaultHook ? [this._defaultHook, ...this._extendHooks] : this._extendHooks;
    }

    setStatus(status: FormatPainterStatus): void {
        this._updateRangeMark(status);
        this._status$.next(status);
        const hooks = this.getHooks();
        hooks.forEach((hook) => {
            if (hook.onStatusChange !== undefined) {
                hook.onStatusChange(status);
            }
        });
    }

    getStatus(): FormatPainterStatus {
        return this._status$.getValue();
    }

    setSelectionFormat(format: ISelectionFormatInfo): void {
        this._selectionFormat = format;
    }

    getSelectionFormat(): ISelectionFormatInfo {
        return this._selectionFormat;
    }

    applyFormatPainter(unitId: string, subUnitId: string, range: IRange): boolean {
        const hooks = this.getHooks();
        const redoMutationsInfo: IMutationInfo[] = [];
        const undoMutationsInfo: IMutationInfo[] = [];
        hooks.forEach((h) => {
            if (h.onApply !== undefined) {
                const applyReturn = h.onApply(
                    unitId,
                    subUnitId,
                    range,
                    this._selectionFormat
                );
                if (applyReturn) {
                    redoMutationsInfo.push(...applyReturn.redos);
                    undoMutationsInfo.push(...applyReturn.undos);
                }
            }
        });

        for (const beforeHook of hooks) {
            if (beforeHook.onBeforeApply !== undefined) {
                // check before apply hook， it can cancel the apply action
                const result = beforeHook.onBeforeApply({
                    unitId,
                    subUnitId,
                    range,
                    redoMutationsInfo,
                    format: this._selectionFormat,
                    undoMutationsInfo,
                });

                if (!result) {
                    return false;
                }
            }
        }

        this._logService.log('[FormatPainterService]', 'apply mutations', {
            undoMutationsInfo,
            redoMutationsInfo,
        });

        const result = redoMutationsInfo.every((m) => this._commandService.executeCommand(m.id, m.params));
        if (result) {
            // add to undo redo services
            this._undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: undoMutationsInfo,
                redoMutations: redoMutationsInfo,
            });
        }

        return result;
    }

    private _updateRangeMark(status: FormatPainterStatus): void {
        this._markSelectionService.removeAllShapes();

        if (status !== FormatPainterStatus.OFF) {
            const selection = this._selectionManagerService.getCurrentLastSelection();
            if (selection) {
                const style = createCopyPasteSelectionStyle(this._themeService);
                if (status === FormatPainterStatus.INFINITE) {
                    this._markId = this._markSelectionService.addShape({ ...selection, style });
                } else {
                    this._markId = this._markSelectionService.addShape({ ...selection, style }, [
                        SetRangeValuesMutation.id,
                    ]);
                }
            }
        }
    }
}
