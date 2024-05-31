/**
 * Copyright 2023-present DreamNum Inc.
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

import type { IMutationInfo, Nullable, Workbook } from '@univerjs/core';
import {
    Direction,
    Disposable,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    RANGE_TYPE,
    Rectangle,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import { SelectionManagerService, SetSelectionsOperation } from '@univerjs/sheets';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier, Inject } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

import { discreteRangeToRange } from '../../controllers/utils/range-tools';
import {
    chnNumberRule,
    chnWeek2Rule,
    chnWeek3Rule,
    extendNumberRule,
    loopSeriesRule,
    numberRule,
    otherRule,
} from './rules';
import type { IAutoFillLocation, IAutoFillRule, ISheetAutoFillHook } from './type';
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
    fillData(triggerUnitId: string, triggerSubUnitId: string): boolean;
}

export interface IApplyMenuItem {
    label: string;
    value: APPLY_TYPE;
    disable: boolean;
}

@OnLifecycle(LifecycleStages.Rendered, AutoFillService)
export class AutoFillService extends Disposable implements IAutoFillService {
    private _rules: IAutoFillRule[] = [];
    private _hooks: ISheetAutoFillHook[] = [];
    private readonly _applyType$: BehaviorSubject<APPLY_TYPE> = new BehaviorSubject<APPLY_TYPE>(APPLY_TYPE.SERIES);
    private _isFillingStyle: boolean = true;

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
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(SelectionManagerService) private _selectionManagerService: SelectionManagerService,
        @ICommandService private _commandService: ICommandService,
        @IUndoRedoService private _undoRedoService: IUndoRedoService
    ) {
        super();
        this._init();
    }

    private _init() {
        this._rules = [
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

    private getOneByPriority(items: ISheetAutoFillHook[]) {
        if (items.length <= 0) {
            return [];
        }
        const maxPriority = items.reduce((maxItem, currentItem) => {
            return (currentItem.priority || 0) > (maxItem.priority || 0) ? currentItem : maxItem;
        }, items[0]);
        return [maxPriority];
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
            return this.getOneByPriority(onlyHooks);
        }

        const defaultHooks = this.getOneByPriority(enabledHooks.filter((h) => h.type === AutoFillHookType.Default));

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

    fillData(triggerUnitId: string, triggerSubUnitId: string) {
        const {
            source,
            target,
            unitId = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId(),
            subUnitId = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet().getSheetId(),
        } = this.autoFillLocation || {};
        const direction = this.direction;
        if (!source || !target || unitId !== triggerUnitId || subUnitId !== triggerSubUnitId) {
            return false;
        }

        const selection = Rectangle.union(discreteRangeToRange(source), discreteRangeToRange(target));
        const applyType = this.applyType;
        const activeHooks = this.getActiveHooks();

        this._commandService.syncExecuteCommand(SetSelectionsOperation.id, {
            selections: [
                {
                    primary: { ...(this._selectionManagerService.getLast()?.primary ?? selection) },
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
        if (result) {
            // add to undo redo services
            this._undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: undos,
                redoMutations: redos,
            });
        }
        // this._commandService.executeCommand(AutoFillCommand.id);
        activeHooks.forEach((hook) => {
            hook.onAfterFillData?.({ source, target, unitId, subUnitId }, direction, applyType);
        });
        this.setShowMenu(true);
        return true;
    }
}

export const IAutoFillService = createIdentifier<AutoFillService>('univer.auto-fill-service');
