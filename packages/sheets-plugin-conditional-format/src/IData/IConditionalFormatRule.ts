import { ConditionType, IColor, IColorStyle, InterpolationPointType, IRangeData, IStyleData, RelativeDate } from '@univerjs/core';

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

/**
 * A rule that may or may not match, depending on the condition.
 */
export type BooleanRule = {
    condition: BooleanCondition;
    format: IStyleData;
};

/**
 * A single interpolation point on a gradient conditional format. These pin the gradient color scale according to the color, type and value chosen.
 */
export type InterpolationPoint = {
    color?: IColor;
    colorStyle?: IColorStyle;
    type?: InterpolationPointType;
    value?: string;
};

/**
 * A rule that applies a gradient color scale format, based on the interpolation points listed. The format of a cell will vary based on its contents as compared to the values of the interpolation points.
 */
export type GradientRule = {
    minpoint: InterpolationPoint;
    midpoint?: InterpolationPoint;
    maxpoint: InterpolationPoint;
};

/**
 * A rule describing a conditional format.
 */
export interface IConditionalFormatRule {
    ranges: IRangeData[];
    rule: BooleanRule | GradientRule;
}
