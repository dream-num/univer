import { Color, ConditionType, IColor, ISelectionRange, Nullable, RelativeDate, Sequence } from '@univerjs/core';

import { BooleanCriteria } from '../Enum/BooleanCriteria';

/**
 * The value of the condition.
 */
export type ConditionValue = {
    relativeDate?: RelativeDate;
    userEnteredValue?: string;
};

/**
 * A condition that can evaluate to true or false. BooleanConditions are used by conditional formatting, data validation, and the criteria in filters.
 */
export type BooleanCondition = {
    type: ConditionType;
    values?: ConditionValue[];
};

export type IFilterType = {
    range: ISelectionRange;
    sortSpecs: {};
    filterSpecs: IFilterSpecsType[];
};

export type IFilterSpecsType = {
    filterCriteria: Nullable<IFilterCriteria>;
    // Union field reference can be only one of the following:
    columnIndex: number;
    dataSourceColumnReference: {};
    // End of list of possible types for union field reference.
};

export type IFilterCriteria = {
    hiddenValues: string[];
    condition: BooleanCondition;
    visibleBackgroundColor: IColor;
    // visibleBackgroundColorStyle: IColorStyle;
    visibleForegroundColor: IColor;
    // visibleForegroundColorStyle: IColorStyle;
};

export interface IFilter extends Sequence {
    range: ISelectionRange;
    sheetId: string;
    criteriaColumns: {
        [column: number]: IFilterCriteriaColumn;
    };
}

export interface IAddFilterActionData {
    filter: Nullable<IFilter>;
}

export interface IFilterCriteriaColumn extends Sequence {
    column: number;
    criteria: IFilterCriteriaData;
}

export interface IAddFilterCriteriaActionData {
    columnPosition: number;
    criteriaColumn: Nullable<IFilterCriteriaColumn>;
}

export interface IRemoveFilterActionData {}

export interface IRemoveFilterCriteriaAction {
    columnPosition: number;
}

export interface IFilterCriteriaData extends Sequence {
    whenNumberGreaterThanOrEqualTo: number;

    criteriaType: BooleanCriteria;

    criteriaValues: ConditionValue[];

    hiddenValues: string[];

    visibleValues: string[];

    visibleForegroundColor: Color;

    visibleBackgroundColor: Color;

    whenNumberEqualToAny: number[];

    whenNumberGreaterThan: number;

    whenNumberBetweenEnd: number;

    whenNumberEqualTo: number;

    whenDateEqualToAny: Date[];

    whenDateNotEqualTo: Date;

    whenFormulaSatisfied: string;

    whenDateNotEqualToAny: Date[];

    whenNumberBetweenStart: number;

    whenDateAfter: Date;

    whenNumberNotBetweenStart: number;

    whenNumberNotBetweenEnd: number;

    whenNumberNotEqualTo: number;

    whenNumberNotEqualToAny: number[];

    whenTextContains: string;

    whenTextDoesNotContain: string;

    whenTextEndsWith: string;

    whenTextEqualTo: string;

    whenTextEqualToAny: string[];

    whenTextNotEqualTo: string;

    whenTextNotEqualToAny: string[];

    whenTextStartsWith: string;

    whenDateAfterRelativeDate: RelativeDate;

    whenDateBefore: Date;

    whenDateBeforeRelativeDate: RelativeDate;

    whenDateEqualToDate: Date;

    whenDateEqualToRelativeDate: RelativeDate;

    whenNumberLessThan: number;

    whenNumberLessThanOrEqualTo: number;
}
