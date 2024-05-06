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

import type { Nullable } from '@univerjs/core';
import {
    Direction,
    Disposable,
    LifecycleStages,
    OnLifecycle,
    toDisposable,
} from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

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

    menu$: Observable<IApplyMenuItem[]>;
    menu: IApplyMenuItem[];

    activeUnit$: Observable<null | string>;
    disposeUnit: (unitId: string) => void;

    setDisableApplyType: (type: APPLY_TYPE, disable: boolean) => void;

    getRules(): IAutoFillRule[];
    registerRule(rule: IAutoFillRule): void;

    setAutoFillInfo(unitId: string, info: Partial<IAutoFillInfo>): void;
    getAutoFillInfo(unitId: string): Nullable<IAutoFillInfo>;

    getAllHooks(unitId: string): ISheetAutoFillHook[];
    getActiveHooks(unitId: string): ISheetAutoFillHook[];
    addHook(hook: ISheetAutoFillHook): IDisposable;
}

export interface IApplyMenuItem {
    label: string;
    value: APPLY_TYPE;
    disable: boolean;
}

export type IAutoFillInfoMap = Map<string, IAutoFillInfo>;
export interface IAutoFillInfo {
    direction: Direction;
    location: Nullable<IAutoFillLocation>;
    showMenu: boolean;
    isFillingStyle: boolean;
}

@OnLifecycle(LifecycleStages.Rendered, AutoFillService)
export class AutoFillService extends Disposable implements IAutoFillService {
    private readonly _autoFillInfoMap: IAutoFillInfoMap = new Map();
    private _rules: IAutoFillRule[] = [];
    private _hooks: ISheetAutoFillHook[] = [];
    private readonly _applyType$: BehaviorSubject<APPLY_TYPE> = new BehaviorSubject<APPLY_TYPE>(APPLY_TYPE.SERIES);

    private readonly _activeUnit$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
    readonly activeUnit$ = this._activeUnit$.asObservable();

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
        // this._isFillingStyle = true;
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

    private _ensureUnit(unit: string) {
        if (this._autoFillInfoMap.has(unit)) {
            return;
        }
        this._autoFillInfoMap.set(unit, {
            direction: Direction.DOWN,
            location: null,
            showMenu: false,
            isFillingStyle: true,
        });
    }

    disposeUnit(unitId: string) {
        this._autoFillInfoMap.delete(unitId);
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

        if (hook.bindUnit) {
            this._ensureUnit(hook.bindUnit);
        }
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

    getAllHooks(unitId?: string) {
        return this._hooks.filter((h) => h.bindUnit === unitId || h.bindUnit === undefined);
    }

    getActiveHooks(unitId: string) {
        const autoFillInfo = this._autoFillInfoMap.get(unitId);
        if (!autoFillInfo) {
            return [];
        }
        const { location, direction } = autoFillInfo;
        const { source, target, subUnitId } = location || {};
        if (!source || !target || !unitId || !subUnitId) {
            return [];
        }
        const enabledHooks = this.getAllHooks(unitId).filter(
            (h) => !h.disable?.({ source, target, unitId, subUnitId }, direction, this.applyType) === true
        );
        const onlyHooks = enabledHooks.filter((h) => h.type === AutoFillHookType.Only);
        if (onlyHooks.length > 0) {
            return this.getOneByPriority(onlyHooks);
        }

        const defaultHooks = this.getOneByPriority(enabledHooks.filter((h) => h.type === AutoFillHookType.Default));

        const appendHooks = enabledHooks.filter((h) => h.type === AutoFillHookType.Append) || [];

        return [...defaultHooks, ...appendHooks];
    }

    getAutoFillInfo(unitId: string) {
        return this._autoFillInfoMap.get(unitId);
    }

    setAutoFillInfo(unitId: string, autoFillInfo: Partial<IAutoFillInfo>) {
        const old = this._autoFillInfoMap.get(unitId);
        if (old) {
            this._autoFillInfoMap.set(unitId, {
                ...old,
                ...autoFillInfo,
            });
            this._activeUnit$.next(unitId);
        }
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

    // getAutoFillLocation(unitId: string) {
    //     return this._autoFillInfoMap.get(unitId)?.location;
    // }

    // setAutoFillLocation(unitId: string, location: Nullable<IAutoFillLocation>) {
    //     const old = this._autoFillInfoMap.get(unitId);
    //     if (old) {
    //         this._autoFillInfoMap.set(unitId, {
    //             ...old,
    //             location,
    //         });
    //     }
    // }

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
}

export const IAutoFillService = createIdentifier<AutoFillService>('univer.auto-fill-service');
