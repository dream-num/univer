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

import type { IAccessor, IDisposable, IMutationInfo, IRange, Nullable, Workbook } from '@univerjs/core';
import type { RenderManagerService } from '@univerjs/engine-render';
import type { ISetRangeValuesMutationParams, ISetWorksheetRowAutoHeightMutationParams } from '@univerjs/sheets';
import type { Observable } from 'rxjs';
import type { IAutoFillLocation, IAutoFillRule, ISheetAutoFillHook } from './type';
import { createIdentifier, Direction, Disposable, ICommandService, Inject, Injector, IUndoRedoService, IUniverInstanceService, ObjectMatrix, RANGE_TYPE, Rectangle, toDisposable, UniverInstanceType } from '@univerjs/core';

import { IRenderManagerService } from '@univerjs/engine-render';
import { rangeToDiscreteRange, SetRangeValuesMutation, SetSelectionsOperation, SetWorksheetRowAutoHeightMutation, SetWorksheetRowAutoHeightMutationFactory, SheetsSelectionsService } from '@univerjs/sheets';
import { BehaviorSubject } from 'rxjs';
import { AutoClearContentCommand } from '../../commands/commands/auto-fill.command';
import { AFFECT_LAYOUT_STYLES } from '../../controllers/auto-height.controller';
import { discreteRangeToRange } from '../../controllers/utils/range-tools';
import { SheetSkeletonManagerService } from '../sheet-skeleton-manager.service';
import {
    chnNumberRule,
    chnWeek2Rule,
    chnWeek3Rule,
    dateRule,
    extendNumberRule,
    loopSeriesRule,
    numberRule,
    otherRule,
} from './rules';
import { APPLY_TYPE, AutoFillHookType } from './type';

export interface IAutoFillService {
    applyType$: Observable<APPLY_TYPE>;
    applyType: APPLY_TYPE;

    direction: Direction;

    menu$: Observable<IApplyMenuItem[]>;
    menu: IApplyMenuItem[];

    showMenu$: Observable<boolean>;
    setShowMenu: (show: boolean) => void;

    setDisableApplyType: (type: APPLY_TYPE, disable: boolean) => void;

    getRules(): IAutoFillRule[];
    isFillingStyle(): boolean;

    autoFillLocation$: Observable<Nullable<IAutoFillLocation>>;
    autoFillLocation: Nullable<IAutoFillLocation>;

    setFillingStyle(isFillingStyle: boolean): void;
    registerRule(rule: IAutoFillRule): void;

    getAllHooks(): ISheetAutoFillHook[];
    getActiveHooks(): ISheetAutoFillHook[];
    addHook(hook: ISheetAutoFillHook): IDisposable;
    fillData(applyType: APPLY_TYPE): boolean;

    triggerAutoFill(unitId: string, subUnitId: string, source: IRange, target: IRange): Promise<boolean>;
}

export interface IApplyMenuItem {
    label: string;
    value: APPLY_TYPE;
    disable: boolean;
}

export class AutoFillService extends Disposable implements IAutoFillService {
    private _rules: IAutoFillRule[] = [];
    private _hooks: ISheetAutoFillHook[] = [];
    private readonly _applyType$: BehaviorSubject<APPLY_TYPE> = new BehaviorSubject<APPLY_TYPE>(APPLY_TYPE.SERIES);
    private _isFillingStyle: boolean = true;

    private _prevUndos: IMutationInfo[] = [];

    private readonly _autoFillLocation$: BehaviorSubject<Nullable<IAutoFillLocation>> = new BehaviorSubject<
        Nullable<IAutoFillLocation>
    >(null);

    readonly autoFillLocation$ = this._autoFillLocation$.asObservable();

    private readonly _showMenu$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    readonly showMenu$ = this._showMenu$.asObservable();

    private _direction: Direction = Direction.DOWN;
    readonly applyType$ = this._applyType$.asObservable();

    private readonly _menu$: BehaviorSubject<IApplyMenuItem[]> = new BehaviorSubject<IApplyMenuItem[]>([
        {
            label: 'autoFill.copy',
            value: APPLY_TYPE.COPY,
            disable: false,
        },
        {
            label: 'autoFill.series',
            value: APPLY_TYPE.SERIES,
            disable: false,
        },
        {
            label: 'autoFill.formatOnly',
            value: APPLY_TYPE.ONLY_FORMAT,
            disable: false,
        },
        {
            label: 'autoFill.noFormat',
            value: APPLY_TYPE.NO_FORMAT,
            disable: false,
        },
    ]);

    readonly menu$ = this._menu$.asObservable();
    constructor(
        @ICommandService private _commandService: ICommandService,
        @IUndoRedoService private _undoRedoService: IUndoRedoService,
        @IRenderManagerService private readonly _renderManagerService: RenderManagerService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(SheetsSelectionsService) private _selectionManagerService: SheetsSelectionsService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();
        this._init();
    }

    private _init() {
        this._rules = [
            dateRule,
            numberRule,
            extendNumberRule,
            chnNumberRule,
            chnWeek2Rule,
            chnWeek3Rule,
            loopSeriesRule,
            otherRule,
        ].sort((a, b) => b.priority - a.priority);
        this._isFillingStyle = true;
    }

    private _getOneByPriority(items: ISheetAutoFillHook[]) {
        if (items.length <= 0) {
            return [];
        }
        const maxPriority = items.reduce((maxItem, currentItem) => {
            return (currentItem.priority || 0) > (maxItem.priority || 0) ? currentItem : maxItem;
        }, items[0]);
        return [maxPriority];
    }

    // a cache to undo commands of last apply-type
    private _initPrevUndo() {
        this._prevUndos = [];
    }

    // eslint-disable-next-line max-lines-per-function
    async triggerAutoFill(unitId: string, subUnitId: string, source: IRange, selection: IRange) {
        // if source range === dest range, do nothing;
        if (
            source.startColumn === selection.startColumn &&
                source.startRow === selection.startRow &&
                source.endColumn === selection.endColumn &&
                source.endRow === selection.endRow
        ) {
            return false;
        }
        // situation 1: drag to smaller range, horizontally.
        if (selection.endColumn < source.endColumn && selection.endColumn > source.startColumn) {
            return this._commandService.executeCommand(AutoClearContentCommand.id, {
                clearRange: {
                    startRow: selection.startRow,
                    endRow: selection.endRow,
                    startColumn: selection.endColumn + 1,
                    endColumn: source.endColumn,
                },
                selectionRange: selection,
            });
        }
        // situation 2: drag to smaller range, vertically.
        if (selection.endRow < source.endRow && selection.endRow > source.startRow) {
            return this._commandService.executeCommand(AutoClearContentCommand.id, {
                clearRange: {
                    startRow: selection.endRow + 1,
                    endRow: source.endRow,
                    startColumn: selection.startColumn,
                    endColumn: selection.endColumn,
                },
                selectionRange: selection,
            });
        }
        // situation 3: drag to larger range, expand to fill

        // save ranges
        const target = {
            startRow: selection.startRow,
            endRow: selection.endRow,
            startColumn: selection.startColumn,
            endColumn: selection.endColumn,
        };
        let direction: Nullable<Direction> = null;
        if (selection.startRow < source.startRow) {
            direction = Direction.UP;
            target.endRow = source.startRow - 1;
        } else if (selection.endRow > source.endRow) {
            direction = Direction.DOWN;
            target.startRow = source.endRow + 1;
        } else if (selection.startColumn < source.startColumn) {
            direction = Direction.LEFT;
            target.endColumn = source.startColumn - 1;
        } else if (selection.endColumn > source.endColumn) {
            direction = Direction.RIGHT;
            target.startColumn = source.endColumn + 1;
        } else {
            return false;
        }

        this.direction = direction;

        const autoFillSource = this._injector.invoke((accessor: IAccessor) => rangeToDiscreteRange(source, accessor));
        const autoFillTarget = this._injector.invoke((accessor: IAccessor) => rangeToDiscreteRange(target, accessor));

        if (!autoFillSource || !autoFillTarget) {
            return false;
        }
        this.autoFillLocation = {
            source: autoFillSource,
            target: autoFillTarget,
            unitId,
            subUnitId,
        };

        const preferTypes: APPLY_TYPE[] = [];
        const activeHooks = this.getActiveHooks();
        activeHooks.forEach((hook) => {
            const type = hook?.onBeforeFillData?.({ source: autoFillSource, target: autoFillTarget, unitId, subUnitId }, direction!);
            if (type) {
                preferTypes.unshift(type);
            }
        });

        this._initPrevUndo();
        // set apply type will trigger fillData
        for (let i = 0; i < preferTypes.length; i++) {
            const menuItem = this.menu.find((m) => m.value === preferTypes[i]);
            if (menuItem && !menuItem.disable) {
                return this.fillData(preferTypes[i]);
            }
        }
        // if no hook return apply type, use first available apply type
        const first = this.menu.find((m) => m.disable === false)?.value;
        if (first) {
            return this.fillData(first);
        }

        return false;
    }

    addHook(hook: ISheetAutoFillHook) {
        if (this._hooks.find((h) => h.id === hook.id)) {
            throw new Error(`Add hook failed, hook id '${hook.id}' already exist!`);
        }
        if (hook.priority === undefined) {
            hook.priority = 0;
        }

        if (hook.type === undefined) {
            hook.type = AutoFillHookType.Append;
        }
        this._hooks.push(hook);
        return toDisposable(() => {
            const index = this._hooks.findIndex((item) => item === hook);
            if (index > -1) {
                this._hooks.splice(index, 1);
            }
        });
    }

    registerRule(rule: IAutoFillRule) {
        // if rule.type is used, console error
        if (this._rules.find((r) => r.type === rule.type)) {
            throw new Error(`Registry rule failed, type '${rule.type}' already exist!`);
        }
        // insert rules according to the rule.priority, the higher priority will be inserted at the beginning of the array
        const index = this._rules.findIndex((r) => r.priority < rule.priority);
        this._rules.splice(index === -1 ? this._rules.length : index, 0, rule);
    }

    getRules() {
        return this._rules;
    }

    getAllHooks() {
        return this._hooks;
    }

    getActiveHooks() {
        const { source, target, unitId, subUnitId } = this.autoFillLocation || {};
        if (!source || !target || !unitId || !subUnitId) {
            return [];
        }
        const enabledHooks = this._hooks.filter(
            (h) => !h.disable?.({ source, target, unitId, subUnitId }, this._direction, this.applyType) === true
        );
        const onlyHooks = enabledHooks.filter((h) => h.type === AutoFillHookType.Only);
        if (onlyHooks.length > 0) {
            return this._getOneByPriority(onlyHooks);
        }

        const defaultHooks = this._getOneByPriority(enabledHooks.filter((h) => h.type === AutoFillHookType.Default));

        const appendHooks = enabledHooks.filter((h) => h.type === AutoFillHookType.Append) || [];

        return [...defaultHooks, ...appendHooks];
    }

    get applyType() {
        return this._applyType$.getValue();
    }

    set applyType(type: APPLY_TYPE) {
        this._applyType$.next(type);
    }

    get menu() {
        return this._menu$.getValue();
    }

    get direction() {
        return this._direction;
    }

    set direction(direction: Direction) {
        this._direction = direction;
    }

    isFillingStyle(): boolean {
        return this._isFillingStyle;
    }

    setFillingStyle(isFillingStyle: boolean) {
        this._isFillingStyle = isFillingStyle;
    }

    get autoFillLocation() {
        return this._autoFillLocation$.getValue();
    }

    set autoFillLocation(location: Nullable<IAutoFillLocation>) {
        this._autoFillLocation$.next(location);
    }

    setDisableApplyType(type: APPLY_TYPE, disable: boolean) {
        this._menu$.next(
            this._menu$.getValue().map((item) => {
                if (item.value === type) {
                    return {
                        ...item,
                        disable,
                    };
                }
                return item;
            })
        );
    }

    setShowMenu(show: boolean) {
        this._showMenu$.next(show);
    }

    // eslint-disable-next-line max-lines-per-function
    fillData(applyType: APPLY_TYPE) {
        this.applyType = applyType;
        const { source, target, unitId = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId(), subUnitId = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()?.getSheetId() } = this.autoFillLocation || {};

        if (!source || !target || !unitId || !subUnitId) {
            return false;
        }

        const direction = this.direction;

        if (this._prevUndos.length > 0) {
            this._prevUndos.forEach((undo) => {
                this._commandService.syncExecuteCommand(undo.id, undo.params);
            });
        }
        this._prevUndos = [];

        const selection = Rectangle.union(discreteRangeToRange(source), discreteRangeToRange(target));
        const activeHooks = this.getActiveHooks();
        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET)!;

        this._commandService.syncExecuteCommand(SetSelectionsOperation.id, {
            selections: [
                {
                    primary: { ...(this._selectionManagerService.getCurrentLastSelection()?.primary ?? selection) },
                    range: {
                        ...selection,
                        rangeType: RANGE_TYPE.NORMAL,
                    },
                },
            ],
            unitId,
            subUnitId,
        });

        const undos: IMutationInfo[] = [];
        const redos: IMutationInfo[] = [];
        activeHooks.forEach((hook) => {
            const { undos: hookUndos, redos: hookRedos } =
                hook.onFillData?.({ source, target, unitId, subUnitId }, direction, applyType) || {};
            if (hookUndos) {
                undos.push(...hookUndos);
            }
            if (hookRedos) {
                redos.push(...hookRedos);
            }
        });
        const result = redos.every((m) => this._commandService.syncExecuteCommand(m.id, m.params));

        // deal with auto-height
        const autoHeightRanges: IRange[] = [];
        if (applyType !== APPLY_TYPE.NO_FORMAT) {
            redos.forEach((m) => {
                if (m.id === SetRangeValuesMutation.id) {
                    const { cellValue } = m.params as ISetRangeValuesMutationParams;
                    const matrix = new ObjectMatrix(cellValue);
                    matrix.forValue((row, col, value) => {
                        const style = Object.keys(workbook.getStyles().get(value?.s) || {});
                        if (value?.p || (style.length && AFFECT_LAYOUT_STYLES.some((s) => style.includes(s)))) {
                            autoHeightRanges.push({ startRow: row, endRow: row, startColumn: col, endColumn: col });
                        }
                    });
                }
            });
        }

        const autoHeightUndoRedos = this._getAutoHeightUndoRedos(unitId, subUnitId, autoHeightRanges);
        const autoHeightResult = autoHeightUndoRedos.redos.every((m) => this._commandService.syncExecuteCommand(m.id, m.params));
        if (autoHeightResult) {
            undos.push(...autoHeightUndoRedos.undos);
            redos.push(...autoHeightUndoRedos.redos);
        }
        if (result) {
            this._prevUndos = undos;
            // add to undo redo services
            this._undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: undos,
                redoMutations: redos,
            });
        }
        activeHooks.forEach((hook) => {
            hook.onAfterFillData?.({ source, target, unitId, subUnitId }, direction, applyType);
        });
        this.setShowMenu(true);
        return true;
    }

    private _getAutoHeightUndoRedos(unitId: string, subUnitId: string, ranges: IRange[]) {
        const sheetSkeletonService = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService);
        const skeleton = sheetSkeletonService?.getCurrentParam()?.skeleton;
        if (!skeleton) return { redos: [], undos: [] };

        const rowsAutoHeightInfo = skeleton.calculateAutoHeightInRange(ranges);
        const redoParams: ISetWorksheetRowAutoHeightMutationParams = { subUnitId, unitId, rowsAutoHeightInfo };
        const worksheet = skeleton.worksheet;
        const undoParams = SetWorksheetRowAutoHeightMutationFactory(redoParams, worksheet);
        return {
            undos: [{ id: SetWorksheetRowAutoHeightMutation.id, params: undoParams }],
            redos: [{ id: SetWorksheetRowAutoHeightMutation.id, params: redoParams }],
        };
    }
}

export const IAutoFillService = createIdentifier<IAutoFillService>('univer.auto-fill-service');
