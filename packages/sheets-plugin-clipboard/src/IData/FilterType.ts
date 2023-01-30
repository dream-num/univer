import { IColor, IRangeData, Nullable } from '@univerjs/core';

export type IFilterType = {
    range: IRangeData;
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

type IFilterCriteria = {
    hiddenValues: string[];
    condition: BooleanCondition;
    visibleBackgroundColor: IColor;
    // visibleBackgroundColorStyle: IColorStyle;
    visibleForegroundColor: IColor;
    // visibleForegroundColorStyle: IColorStyle;
};
