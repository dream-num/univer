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

import type { DataValidationStatus, IDataValidationRule, IDataValidationRuleBase, IDataValidationRuleOptions, IEventBase, IRange, ISheetDataValidationRule } from '@univerjs/core';
import type { DataValidationChangeType, IRuleChange } from '@univerjs/data-validation';
import type { FWorkbook, FWorksheet } from '@univerjs/sheets/facade';
import type { FDataValidation } from './f-data-validation';
import { FEventName } from '@univerjs/core';

export interface ISheetDataValidationChangedEvent extends IEventBase {
    origin: IRuleChange;
    worksheet: FWorksheet;
    workbook: FWorkbook;
    changeType: DataValidationChangeType;
    oldRule?: IDataValidationRule;
    rule: FDataValidation;
}

export interface ISheetDataValidatorStatusChangedEvent extends IEventBase {
    worksheet: FWorksheet;
    workbook: FWorkbook;
    row: number;
    column: number;
    status: DataValidationStatus;
    rule: FDataValidation;
}

export interface IBeforeSheetDataValidationAddEvent extends IEventBase {
    worksheet: FWorksheet;
    workbook: FWorkbook;
    rule: ISheetDataValidationRule;
}

export interface IBeforeSheetDataValidationDeleteEvent extends IEventBase {
    worksheet: FWorksheet;
    workbook: FWorkbook;
    ruleId: string;
    rule: FDataValidation;
}

export interface IBeforeSheetDataValidationCriteriaUpdateEvent extends IEventBase {
    worksheet: FWorksheet;
    workbook: FWorkbook;
    ruleId: string;
    rule: FDataValidation;
    newCriteria: IDataValidationRuleBase;
}

export interface IBeforeSheetDataValidationRangeUpdateEvent extends IEventBase {
    worksheet: FWorksheet;
    workbook: FWorkbook;
    ruleId: string;
    rule: FDataValidation;
    newRanges: IRange[];
}

export interface IBeforeSheetDataValidationOptionsUpdateEvent extends IEventBase {
    worksheet: FWorksheet;
    workbook: FWorkbook;
    ruleId: string;
    rule: FDataValidation;
    newOptions: IDataValidationRuleOptions;
}

export interface IBeforeSheetDataValidationDeleteAllEvent extends IEventBase {
    worksheet: FWorksheet;
    workbook: FWorkbook;
    rules: FDataValidation[];
}

export interface IDataValidationEventParamConfig {
    SheetDataValidationChanged: ISheetDataValidationChangedEvent;
    SheetDataValidatorStatusChanged: ISheetDataValidatorStatusChangedEvent;
    BeforeSheetDataValidationAdd: IBeforeSheetDataValidationAddEvent;
    BeforeSheetDataValidationDelete: IBeforeSheetDataValidationDeleteEvent;
    BeforeSheetDataValidationDeleteAll: IBeforeSheetDataValidationDeleteAllEvent;
    BeforeSheetDataValidationCriteriaUpdate: IBeforeSheetDataValidationCriteriaUpdateEvent;
    BeforeSheetDataValidationRangeUpdate: IBeforeSheetDataValidationRangeUpdateEvent;
    BeforeSheetDataValidationOptionsUpdate: IBeforeSheetDataValidationOptionsUpdateEvent;
}

interface IDataValidationEvent {
    readonly SheetDataValidationChanged: 'SheetDataValidationChanged';
    readonly SheetDataValidatorStatusChanged: 'SheetDataValidatorStatusChanged';
    readonly BeforeSheetDataValidationAdd: 'BeforeSheetDataValidationAdd';
    readonly BeforeSheetDataValidationDelete: 'BeforeSheetDataValidationDelete';
    readonly BeforeSheetDataValidationDeleteAll: 'BeforeSheetDataValidationDeleteAll';
    readonly BeforeSheetDataValidationCriteriaUpdate: 'BeforeSheetDataValidationCriteriaUpdate';
    readonly BeforeSheetDataValidationRangeUpdate: 'BeforeSheetDataValidationRangeUpdate';
    readonly BeforeSheetDataValidationOptionsUpdate: 'BeforeSheetDataValidationOptionsUpdate';
}

export class FDataValidationEvent implements IDataValidationEvent {
    /**
     * SheetDataValidationChanged event
     * @see {@link ISheetDataValidationChangedEvent}
     * @example
     * ```ts
     * univerAPI.on(univerAPI.Event.SheetDataValidationChanged, (event) => {
     *     console.log(event);
     * });
     * ```
     */
    get SheetDataValidationChanged(): 'SheetDataValidationChanged' {
        return 'SheetDataValidationChanged';
    }

    /**
     * SheetDataValidatorStatusChanged event
     * @see {@link ISheetDataValidatorStatusChangedEvent}
     * @example
     * ```ts
     * univerAPI.on(univerAPI.Event.SheetDataValidatorStatusChanged, (event) => {
     *     console.log(event);
     * });
     * ```
     */
    get SheetDataValidatorStatusChanged(): 'SheetDataValidatorStatusChanged' {
        return 'SheetDataValidatorStatusChanged';
    }

    /**
     * BeforeSheetDataValidationAdd event
     * @see {@link IBeforeSheetDataValidationAddEvent}
     * @example
     * ```ts
     * univerAPI.on(univerAPI.Event.BeforeSheetDataValidationAdd, (event) => {
     *     console.log(event);
     * });
     * ```
     */
    get BeforeSheetDataValidationAdd(): 'BeforeSheetDataValidationAdd' {
        return 'BeforeSheetDataValidationAdd';
    }

    /**
     * BeforeSheetDataValidationDelete event
     * @see {@link IBeforeSheetDataValidationDeleteEvent}
     * @example
     * ```ts
     * univerAPI.on(univerAPI.Event.BeforeSheetDataValidationDelete, (event) => {
     *     console.log(event);
     * });
     * ```
     */
    get BeforeSheetDataValidationDelete(): 'BeforeSheetDataValidationDelete' {
        return 'BeforeSheetDataValidationDelete';
    }

    /**
     * BeforeSheetDataValidationDeleteAll event
     * @see {@link IBeforeSheetDataValidationDeleteAllEvent}
     * @example
     * ```ts
     * univerAPI.on(univerAPI.Event.BeforeSheetDataValidationDeleteAll, (event) => {
     *     console.log(event);
     * });
     * ```
     */
    get BeforeSheetDataValidationDeleteAll(): 'BeforeSheetDataValidationDeleteAll' {
        return 'BeforeSheetDataValidationDeleteAll';
    }

    /**
     * BeforeSheetDataValidationCriteriaUpdate event
     * @see {@link IBeforeSheetDataValidationCriteriaUpdateEvent}
     * @example
     * ```ts
     * univerAPI.on(univerAPI.Event.BeforeSheetDataValidationCriteriaUpdate, (event) => {
     *     console.log(event);
     * });
     * ```
     */
    get BeforeSheetDataValidationCriteriaUpdate(): 'BeforeSheetDataValidationCriteriaUpdate' {
        return 'BeforeSheetDataValidationCriteriaUpdate';
    }

    /**
     * BeforeSheetDataValidationRangeUpdate event
     * @see {@link IBeforeSheetDataValidationRangeUpdateEvent}
     * @example
     * ```ts
     * univerAPI.on(univerAPI.Event.BeforeSheetDataValidationRangeUpdate, (event) => {
     *     console.log(event);
     * });
     * ```
     */
    get BeforeSheetDataValidationRangeUpdate(): 'BeforeSheetDataValidationRangeUpdate' {
        return 'BeforeSheetDataValidationRangeUpdate';
    }

    /**
     * BeforeSheetDataValidationOptionsUpdate event
     * @see {@link IBeforeSheetDataValidationOptionsUpdateEvent}
     * @example
     * ```ts
     * univerAPI.on(univerAPI.Event.BeforeSheetDataValidationOptionsUpdate, (event) => {
     *     console.log(event);
     * });
     * ```
     */
    get BeforeSheetDataValidationOptionsUpdate(): 'BeforeSheetDataValidationOptionsUpdate' {
        return 'BeforeSheetDataValidationOptionsUpdate';
    }
}

export interface IDataValidationEventConfig {
    SheetDataValidationChanged: ISheetDataValidationChangedEvent;
    SheetDataValidatorStatusChanged: ISheetDataValidatorStatusChangedEvent;
    BeforeSheetDataValidationAdd: IBeforeSheetDataValidationAddEvent;
    BeforeSheetDataValidationDelete: IBeforeSheetDataValidationDeleteEvent;
    BeforeSheetDataValidationDeleteAll: IBeforeSheetDataValidationDeleteAllEvent;
    BeforeSheetDataValidationCriteriaUpdate: IBeforeSheetDataValidationCriteriaUpdateEvent;
    BeforeSheetDataValidationRangeUpdate: IBeforeSheetDataValidationRangeUpdateEvent;
    BeforeSheetDataValidationOptionsUpdate: IBeforeSheetDataValidationOptionsUpdateEvent;
}

FEventName.extend(FDataValidationEvent);
declare module '@univerjs/core' {
    // eslint-disable-next-line ts/naming-convention
    interface FEventName extends IDataValidationEvent {
    }

    interface IEventParamConfig extends IDataValidationEventParamConfig {
    }
}
