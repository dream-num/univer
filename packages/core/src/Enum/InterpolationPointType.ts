/**
 * An enumeration representing the interpolation options for calculating a value to be used in a GradientCondition in a ConditionalFormatRule.
 */
export enum InterpolationPointType {
    INTERPOLATION_POINT_TYPE_UNSPECIFIED, // The default value, do not use.
    MIN, // The interpolation point uses the minimum value in the cells over the range of the conditional format.
    MAX, // The interpolation point uses the maximum value in the cells over the range of the conditional format.
    NUMBER, // The interpolation point uses exactly the value in InterpolationPoint.value
    PERCENT, // The interpolation point is the given percentage over all the cells in the range of the conditional format. This is equivalent to NUMBER if the value was: =(MAX(FLATTEN(range)) * (value / 100)) + (MIN(FLATTEN(range)) * (1 - (value / 100))) (where errors in the range are ignored when flattening).
    PERCENTILE, // The interpolation point is the given percentile over all the cells in the range of the conditional format. This is equivalent to NUMBER if the value was: =PERCENTILE(FLATTEN(range), value / 100) (where errors in the range are ignored when flattening).
}
