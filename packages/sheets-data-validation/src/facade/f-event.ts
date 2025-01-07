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

/**
 * Event interface triggered when a data validation rule is changed
 * @interface ISheetDataValidationChangedEvent
 * @augments {IEventBase}
 */
export interface ISheetDataValidationChangedEvent extends IEventBase {
    /** The source of the rule change */
    origin: IRuleChange;
    /** The worksheet containing the validation rule */
    worksheet: FWorksheet;
    /** The workbook instance */
    workbook: FWorkbook;
    /** Type of change made to the validation rule */
    changeType: DataValidationChangeType;
    /** The previous validation rule, if it exists */
    oldRule?: IDataValidationRule;
    /** The new or modified validation rule */
    rule: FDataValidation;
}

/**
 * Event interface triggered when a data validation status changes
 * @interface ISheetDataValidatorStatusChangedEvent
 * @augments {IEventBase}
 */
export interface ISheetDataValidatorStatusChangedEvent extends IEventBase {
    /** The worksheet containing the validation */
    worksheet: FWorksheet;
    /** The workbook instance */
    workbook: FWorkbook;
    /** Row index of the validated cell */
    row: number;
    /** Column index of the validated cell */
    column: number;
    /** Current validation status */
    status: DataValidationStatus;
    /** The validation rule that was checked */
    rule: FDataValidation;
}

/**
 * Event interface triggered before adding a new data validation rule
 * @interface IBeforeSheetDataValidationAddEvent
 * @augments {IEventBase}
 */
export interface IBeforeSheetDataValidationAddEvent extends IEventBase {
    /** The worksheet to add the validation to */
    worksheet: FWorksheet;
    /** The workbook instance */
    workbook: FWorkbook;
    /** The validation rule to be added */
    rule: ISheetDataValidationRule;
}

/**
 * Event interface triggered before deleting a data validation rule
 * @interface IBeforeSheetDataValidationDeleteEvent
 * @augments {IEventBase}
 */
export interface IBeforeSheetDataValidationDeleteEvent extends IEventBase {
    /** The worksheet containing the validation */
    worksheet: FWorksheet;
    /** The workbook instance */
    workbook: FWorkbook;
    /** Unique identifier of the rule to be deleted */
    ruleId: string;
    /** The validation rule to be deleted */
    rule: FDataValidation;
}

/**
 * Event interface triggered before updating a data validation rule's criteria
 * @interface IBeforeSheetDataValidationCriteriaUpdateEvent
 * @augments {IEventBase}
 */
export interface IBeforeSheetDataValidationCriteriaUpdateEvent extends IEventBase {
    /** The worksheet containing the validation */
    worksheet: FWorksheet;
    /** The workbook instance */
    workbook: FWorkbook;
    /** Unique identifier of the rule to be updated */
    ruleId: string;
    /** The current validation rule */
    rule: FDataValidation;
    /** The new criteria to be applied */
    newCriteria: IDataValidationRuleBase;
}

/**
 * Event interface triggered before updating a data validation rule's ranges
 * @interface IBeforeSheetDataValidationRangeUpdateEvent
 * @augments {IEventBase}
 */
export interface IBeforeSheetDataValidationRangeUpdateEvent extends IEventBase {
    /** The worksheet containing the validation */
    worksheet: FWorksheet;
    /** The workbook instance */
    workbook: FWorkbook;
    /** Unique identifier of the rule to be updated */
    ruleId: string;
    /** The current validation rule */
    rule: FDataValidation;
    /** The new ranges to be applied */
    newRanges: IRange[];
}

/**
 * Event interface triggered before updating a data validation rule's options
 * @interface IBeforeSheetDataValidationOptionsUpdateEvent
 * @augments {IEventBase}
 */
export interface IBeforeSheetDataValidationOptionsUpdateEvent extends IEventBase {
    /** The worksheet containing the validation */
    worksheet: FWorksheet;
    /** The workbook instance */
    workbook: FWorkbook;
    /** Unique identifier of the rule to be updated */
    ruleId: string;
    /** The current validation rule */
    rule: FDataValidation;
    /** The new options to be applied */
    newOptions: IDataValidationRuleOptions;
}

/**
 * Event interface triggered before deleting all data validation rules
 * @interface IBeforeSheetDataValidationDeleteAllEvent
 * @augments {IEventBase}
 */
export interface IBeforeSheetDataValidationDeleteAllEvent extends IEventBase {
    /** The worksheet containing the validations */
    worksheet: FWorksheet;
    /** The workbook instance */
    workbook: FWorkbook;
    /** Array of all validation rules to be deleted */
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
    /**
     * Event fired when a rule is added, deleted, or modified
     * @see {@link ISheetDataValidationChangedEvent}
     * @example
     * ```ts
     * univerAPI.on(univerAPI.Event.SheetDataValidationChanged, (event) => {
     *     const { worksheet, workbook, changeType, oldRule, rule } = event;
     *     console.log(event);
     * });
     * ```
     */
    readonly SheetDataValidationChanged: 'SheetDataValidationChanged';
    /**
     * Event fired when a cell validator status is changed
     * @see {@link ISheetDataValidatorStatusChangedEvent}
     * @example
     * ```ts
     * univerAPI.on(univerAPI.Event.SheetDataValidatorStatusChanged, (event) => {
     *     const { worksheet, workbook, row, column, status, rule } = event;
     *     console.log(event);
     * });
     * ```
     */
    readonly SheetDataValidatorStatusChanged: 'SheetDataValidatorStatusChanged';
    /**
     * Event fired before a rule is added
     * @see {@link IBeforeSheetDataValidationAddEvent}
     * @example
     * ```ts
     * univerAPI.on(univerAPI.Event.BeforeSheetDataValidationAdd, (event) => {
     *      const { worksheet, workbook, rule } = event;
     *     console.log(event);
     * });
     * ```
     */
    readonly BeforeSheetDataValidationAdd: 'BeforeSheetDataValidationAdd';
    /**
     * Event fired before a rule is deleted
     * @see {@link IBeforeSheetDataValidationDeleteEvent}
     * @example
     * ```ts
     * univerAPI.on(univerAPI.Event.BeforeSheetDataValidationDelete, (event) => {
     *     const { worksheet, workbook, rule } = event;
     *     console.log(event);
     * });
     * ```
     */
    readonly BeforeSheetDataValidationDelete: 'BeforeSheetDataValidationDelete';
    /**
     * Event fired before all rules are deleted
     * @see {@link IBeforeSheetDataValidationDeleteAllEvent}
     * @example
     * ```ts
     * univerAPI.on(univerAPI.Event.BeforeSheetDataValidationDeleteAll, (event) => {
     *     const { worksheet, workbook, rules } = event;
     *     console.log(event);
     * });
     * ```
     */
    readonly BeforeSheetDataValidationDeleteAll: 'BeforeSheetDataValidationDeleteAll';
    /**
     * Event fired before the criteria of a rule are updated
     * @see {@link IBeforeSheetDataValidationCriteriaUpdateEvent}
     * @example
     * ```ts
     * univerAPI.on(univerAPI.Event.BeforeSheetDataValidationCriteriaUpdate, (event) => {
     *     const { worksheet, workbook, rule, newCriteria } = event;
     *     console.log(event);
     * });
     * ```
     */
    readonly BeforeSheetDataValidationCriteriaUpdate: 'BeforeSheetDataValidationCriteriaUpdate';
    /**
     * Event fired before the range of a rule is updated
     * @see {@link IBeforeSheetDataValidationRangeUpdateEvent}
     * @example
     * ```ts
     * univerAPI.on(univerAPI.Event.BeforeSheetDataValidationRangeUpdate, (event) => {
     *     const { worksheet, workbook, rule, newRanges } = event;
     *     console.log(event);
     * });
     * ```
     */
    readonly BeforeSheetDataValidationRangeUpdate: 'BeforeSheetDataValidationRangeUpdate';
    /**
     * Event fired before the options of a rule are updated
     * @see {@link IBeforeSheetDataValidationOptionsUpdateEvent}
     * @example
     * ```ts
     * univerAPI.on(univerAPI.Event.BeforeSheetDataValidationOptionsUpdate, (event) => {
     *     const { worksheet, workbook, rule, newOptions } = event;
     *     console.log(event);
     * });
     * ```
     */
    readonly BeforeSheetDataValidationOptionsUpdate: 'BeforeSheetDataValidationOptionsUpdate';
}

export class FDataValidationEvent implements IDataValidationEvent {
    get SheetDataValidationChanged(): 'SheetDataValidationChanged' {
        return 'SheetDataValidationChanged';
    }

    get SheetDataValidatorStatusChanged(): 'SheetDataValidatorStatusChanged' {
        return 'SheetDataValidatorStatusChanged';
    }

    get BeforeSheetDataValidationAdd(): 'BeforeSheetDataValidationAdd' {
        return 'BeforeSheetDataValidationAdd';
    }

    get BeforeSheetDataValidationDelete(): 'BeforeSheetDataValidationDelete' {
        return 'BeforeSheetDataValidationDelete';
    }

    get BeforeSheetDataValidationDeleteAll(): 'BeforeSheetDataValidationDeleteAll' {
        return 'BeforeSheetDataValidationDeleteAll';
    }

    get BeforeSheetDataValidationCriteriaUpdate(): 'BeforeSheetDataValidationCriteriaUpdate' {
        return 'BeforeSheetDataValidationCriteriaUpdate';
    }

    get BeforeSheetDataValidationRangeUpdate(): 'BeforeSheetDataValidationRangeUpdate' {
        return 'BeforeSheetDataValidationRangeUpdate';
    }

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
