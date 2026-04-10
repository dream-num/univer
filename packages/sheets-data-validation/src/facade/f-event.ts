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

import type { DataValidationStatus, IDataValidationRule, IDataValidationRuleBase, IDataValidationRuleOptions, IRange, ISheetDataValidationRule } from '@univerjs/core';
import type { IEventBase } from '@univerjs/core/facade';
import type { DataValidationChangeType, IRuleChange } from '@univerjs/data-validation';
import type { FWorkbook, FWorksheet } from '@univerjs/sheets/facade';
import type { FDataValidation } from './f-data-validation';
import { FEventName } from '@univerjs/core/facade';

/**
 * Event interface triggered when a data validation rule is changed
 * @interface ISheetDataValidationChangedEventParams
 * @augments {IEventBase}
 */
export interface ISheetDataValidationChangedEventParams extends IEventBase {
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
 * @interface ISheetDataValidatorStatusChangedEventParams
 * @augments {IEventBase}
 */
export interface ISheetDataValidatorStatusChangedEventParams extends IEventBase {
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
 * @interface IBeforeSheetDataValidationAddEventParams
 * @augments {IEventBase}
 */
export interface IBeforeSheetDataValidationAddEventParams extends IEventBase {
    /** The worksheet to add the validation to */
    worksheet: FWorksheet;
    /** The workbook instance */
    workbook: FWorkbook;
    /** The validation rule to be added */
    rule: ISheetDataValidationRule;
}

/**
 * Event interface triggered before deleting a data validation rule
 * @interface IBeforeSheetDataValidationDeleteEventParams
 * @augments {IEventBase}
 */
export interface IBeforeSheetDataValidationDeleteEventParams extends IEventBase {
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
 * @interface IBeforeSheetDataValidationCriteriaUpdateEventParams
 * @augments {IEventBase}
 */
export interface IBeforeSheetDataValidationCriteriaUpdateEventParams extends IEventBase {
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
 * @interface IBeforeSheetDataValidationRangeUpdateEventParams
 * @augments {IEventBase}
 */
export interface IBeforeSheetDataValidationRangeUpdateEventParams extends IEventBase {
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
 * @interface IBeforeSheetDataValidationOptionsUpdateEventParams
 * @augments {IEventBase}
 */
export interface IBeforeSheetDataValidationOptionsUpdateEventParams extends IEventBase {
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
 * @interface IBeforeSheetDataValidationDeleteAllEventParams
 * @augments {IEventBase}
 */
export interface IBeforeSheetDataValidationDeleteAllEventParams extends IEventBase {
    /** The worksheet containing the validations */
    worksheet: FWorksheet;
    /** The workbook instance */
    workbook: FWorkbook;
    /** Array of all validation rules to be deleted */
    rules: FDataValidation[];
}

/**
 * @ignore
 */
export interface IDataValidationEventParamConfig {
    SheetDataValidationChanged: ISheetDataValidationChangedEventParams;
    SheetDataValidatorStatusChanged: ISheetDataValidatorStatusChangedEventParams;
    BeforeSheetDataValidationAdd: IBeforeSheetDataValidationAddEventParams;
    BeforeSheetDataValidationDelete: IBeforeSheetDataValidationDeleteEventParams;
    BeforeSheetDataValidationDeleteAll: IBeforeSheetDataValidationDeleteAllEventParams;
    BeforeSheetDataValidationCriteriaUpdate: IBeforeSheetDataValidationCriteriaUpdateEventParams;
    BeforeSheetDataValidationRangeUpdate: IBeforeSheetDataValidationRangeUpdateEventParams;
    BeforeSheetDataValidationOptionsUpdate: IBeforeSheetDataValidationOptionsUpdateEventParams;
}

/**
 * @ignore
 */
interface IFSheetsDataValidationEventNameMixin {
    /**
     * Event fired when a rule is added, deleted, or modified
     * @see {@link ISheetDataValidationChangedEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.SheetDataValidationChanged, (params) => {
     *   const { origin, worksheet, workbook, changeType, oldRule, rule } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly SheetDataValidationChanged: 'SheetDataValidationChanged';

    /**
     * Event fired when a cell validator status is changed
     * @see {@link ISheetDataValidatorStatusChangedEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.SheetDataValidatorStatusChanged, (params) => {
     *   const { worksheet, workbook, row, column, status, rule } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly SheetDataValidatorStatusChanged: 'SheetDataValidatorStatusChanged';

    /**
     * Event fired before a rule is added
     * @see {@link IBeforeSheetDataValidationAddEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.BeforeSheetDataValidationAdd, (params) => {
     *   const { worksheet, workbook, rule } = params;
     *   console.log(params);
     *
     *   // Cancel the data validation rule addition operation
     *   params.cancel = true;
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly BeforeSheetDataValidationAdd: 'BeforeSheetDataValidationAdd';

    /**
     * Event fired before a rule is deleted
     * @see {@link IBeforeSheetDataValidationDeleteEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.BeforeSheetDataValidationDelete, (params) => {
     *   const { worksheet, workbook, ruleId, rule } = params;
     *   console.log(params);
     *
     *   // Cancel the data validation rule deletion operation
     *   params.cancel = true;
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly BeforeSheetDataValidationDelete: 'BeforeSheetDataValidationDelete';

    /**
     * Event fired before all rules are deleted
     * @see {@link IBeforeSheetDataValidationDeleteAllEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.BeforeSheetDataValidationDeleteAll, (params) => {
     *   const { worksheet, workbook, rules } = params;
     *   console.log(params);
     *
     *   // Cancel the data validation rule deletion operation
     *   params.cancel = true;
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly BeforeSheetDataValidationDeleteAll: 'BeforeSheetDataValidationDeleteAll';

    /**
     * Event fired before the criteria of a rule are updated
     * @see {@link IBeforeSheetDataValidationCriteriaUpdateEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.BeforeSheetDataValidationCriteriaUpdate, (params) => {
     *   const { worksheet, workbook, ruleId, rule, newCriteria } = params;
     *   console.log(params);
     *
     *   // Cancel the data validation rule criteria update operation
     *   params.cancel = true;
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly BeforeSheetDataValidationCriteriaUpdate: 'BeforeSheetDataValidationCriteriaUpdate';

    /**
     * Event fired before the range of a rule is updated
     * @see {@link IBeforeSheetDataValidationRangeUpdateEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.BeforeSheetDataValidationRangeUpdate, (params) => {
     *   const { worksheet, workbook, ruleId, rule, newRanges } = params;
     *   console.log(params);
     *
     *   // Cancel the data validation rule range update operation
     *   params.cancel = true;
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly BeforeSheetDataValidationRangeUpdate: 'BeforeSheetDataValidationRangeUpdate';

    /**
     * Event fired before the options of a rule are updated
     * @see {@link IBeforeSheetDataValidationOptionsUpdateEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.BeforeSheetDataValidationOptionsUpdate, (params) => {
     *   const { worksheet, workbook, ruleId, rule, newOptions } = params;
     *   console.log(params);
     *
     *   // Cancel the data validation rule options update operation
     *   params.cancel = true;
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly BeforeSheetDataValidationOptionsUpdate: 'BeforeSheetDataValidationOptionsUpdate';
}

/**
 * @ignore
 */
export class FSheetsDataValidationEventNameMixin extends FEventName implements IFSheetsDataValidationEventNameMixin {
    override get SheetDataValidationChanged(): 'SheetDataValidationChanged' {
        return 'SheetDataValidationChanged';
    }

    override get SheetDataValidatorStatusChanged(): 'SheetDataValidatorStatusChanged' {
        return 'SheetDataValidatorStatusChanged';
    }

    override get BeforeSheetDataValidationAdd(): 'BeforeSheetDataValidationAdd' {
        return 'BeforeSheetDataValidationAdd';
    }

    override get BeforeSheetDataValidationDelete(): 'BeforeSheetDataValidationDelete' {
        return 'BeforeSheetDataValidationDelete';
    }

    override get BeforeSheetDataValidationDeleteAll(): 'BeforeSheetDataValidationDeleteAll' {
        return 'BeforeSheetDataValidationDeleteAll';
    }

    override get BeforeSheetDataValidationCriteriaUpdate(): 'BeforeSheetDataValidationCriteriaUpdate' {
        return 'BeforeSheetDataValidationCriteriaUpdate';
    }

    override get BeforeSheetDataValidationRangeUpdate(): 'BeforeSheetDataValidationRangeUpdate' {
        return 'BeforeSheetDataValidationRangeUpdate';
    }

    override get BeforeSheetDataValidationOptionsUpdate(): 'BeforeSheetDataValidationOptionsUpdate' {
        return 'BeforeSheetDataValidationOptionsUpdate';
    }
}

/**
 * @ignore
 */
export interface ISheetsDataValidationEventParamConfig {
    SheetDataValidationChanged: ISheetDataValidationChangedEventParams;
    SheetDataValidatorStatusChanged: ISheetDataValidatorStatusChangedEventParams;
    BeforeSheetDataValidationAdd: IBeforeSheetDataValidationAddEventParams;
    BeforeSheetDataValidationDelete: IBeforeSheetDataValidationDeleteEventParams;
    BeforeSheetDataValidationDeleteAll: IBeforeSheetDataValidationDeleteAllEventParams;
    BeforeSheetDataValidationCriteriaUpdate: IBeforeSheetDataValidationCriteriaUpdateEventParams;
    BeforeSheetDataValidationRangeUpdate: IBeforeSheetDataValidationRangeUpdateEventParams;
    BeforeSheetDataValidationOptionsUpdate: IBeforeSheetDataValidationOptionsUpdateEventParams;
}

FEventName.extend(FSheetsDataValidationEventNameMixin);
declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FEventName extends IFSheetsDataValidationEventNameMixin {
    }

    interface IEventParamConfig extends ISheetsDataValidationEventParamConfig {
    }
}
