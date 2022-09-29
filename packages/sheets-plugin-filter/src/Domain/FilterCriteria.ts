import { BooleanCriteria, Color, Context, RelativeDate, Sequence, Serializer, Tools } from '@univer/core';
import { ConditionValue } from '../../../sheets-plugin-conditional-format';
import { FilterCriteriaBuilder } from './FilterCriteriaBuilder';

export interface IFilterCriteria extends Sequence {
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

export class FilterCriteria extends Serializer implements Context.WithContext<FilterCriteria> {
    static newInstance(sequence: IFilterCriteria): FilterCriteria {
        const criteria = new FilterCriteria();
        criteria._criteriaType = sequence.criteriaType;
        criteria._whenNumberGreaterThanOrEqualTo = sequence.whenNumberGreaterThanOrEqualTo;
        criteria._whenDateNotEqualToAny = sequence.whenDateNotEqualToAny;
        criteria._whenNumberBetweenStart = sequence.whenNumberBetweenStart;
        criteria._whenNumberBetweenEnd = sequence.whenNumberBetweenEnd;
        criteria._criteriaValues = sequence.criteriaValues;
        criteria._hiddenValues = sequence.hiddenValues;
        criteria._visibleValues = sequence.visibleValues;
        criteria._visibleForegroundColor = sequence.visibleForegroundColor;
        criteria._visibleBackgroundColor = sequence.visibleBackgroundColor;
        criteria._whenDateEqualToDate = sequence.whenDateEqualToDate;
        criteria._whenDateEqualToRelativeDate = sequence.whenDateEqualToRelativeDate;
        criteria._whenDateAfterRelativeDate = sequence.whenDateAfterRelativeDate;
        criteria._whenDateBeforeRelativeDate = sequence.whenDateBeforeRelativeDate;
        criteria._whenNumberEqualToAny = sequence.whenNumberEqualToAny;
        criteria._whenNumberGreaterThan = sequence.whenNumberGreaterThan;
        criteria._whenDateAfter = sequence.whenDateAfter;
        criteria._whenDateBefore = sequence.whenDateBefore;
        criteria._whenDateNotEqualTo = sequence.whenDateNotEqualTo;
        criteria._whenFormulaSatisfied = sequence.whenFormulaSatisfied;
        criteria._whenDateEqualToAny = sequence.whenDateEqualToAny;
        criteria._whenNumberEqualTo = sequence.whenNumberEqualTo;
        criteria._whenNumberNotEqualTo = sequence.whenNumberNotEqualTo;
        criteria._whenNumberNotEqualToAny = sequence.whenNumberNotEqualToAny;
        criteria._whenTextContains = sequence.whenTextContains;
        criteria._whenTextDoesNotContain = sequence.whenTextDoesNotContain;
        criteria._whenTextEndsWith = sequence.whenTextEndsWith;
        criteria._whenTextEqualTo = sequence.whenTextEqualTo;
        criteria._whenTextEqualToAny = sequence.whenTextEqualToAny;
        criteria._whenTextNotEqualTo = sequence.whenTextNotEqualTo;
        criteria._whenTextNotEqualToAny = sequence.whenTextNotEqualToAny;
        criteria._whenTextStartsWith = sequence.whenTextStartsWith;
        criteria._whenNumberNotBetweenStart = sequence.whenNumberNotBetweenStart;
        criteria._whenNumberNotBetweenEnd = sequence.whenNumberNotBetweenEnd;
        criteria._whenNumberLessThan = sequence.whenNumberLessThan;
        criteria._whenNumberLessThanOrEqualTo = sequence.whenNumberLessThanOrEqualTo;
        return criteria;
    }

    private _context: Context;

    private _whenNumberGreaterThanOrEqualTo: number;

    private _criteriaType: BooleanCriteria;

    private _criteriaValues: ConditionValue[];

    private _hiddenValues: string[];

    private _visibleValues: string[];

    private _visibleForegroundColor: Color;

    private _visibleBackgroundColor: Color;

    private _whenNumberBetweenEnd: number;

    private _whenNumberEqualTo: number;

    private _whenNumberEqualToAny: number[];

    private _whenNumberGreaterThan: number;

    private _whenDateEqualToAny: Date[];

    private _whenDateNotEqualTo: Date;

    private _whenFormulaSatisfied: string;

    private _whenDateNotEqualToAny: Date[];

    private _whenNumberBetweenStart: number;

    private _whenDateAfter: Date;

    private _whenNumberNotBetweenStart: number;

    private _whenNumberNotBetweenEnd: number;

    private _whenNumberNotEqualTo: number;

    private _whenNumberNotEqualToAny: number[];

    private _whenTextContains: string;

    private _whenTextDoesNotContain: string;

    private _whenTextEndsWith: string;

    private _whenTextEqualTo: string;

    private _whenTextEqualToAny: string[];

    private _whenTextNotEqualTo: string;

    private _whenTextNotEqualToAny: string[];

    private _whenTextStartsWith: string;

    private _whenDateAfterRelativeDate: RelativeDate;

    private _whenDateBefore: Date;

    private _whenDateBeforeRelativeDate: RelativeDate;

    private _whenDateEqualToDate: Date;

    private _whenDateEqualToRelativeDate: RelativeDate;

    private _whenNumberLessThan: number;

    private _whenNumberLessThanOrEqualTo: number;

    copy(): FilterCriteriaBuilder {
        return FilterCriteriaBuilder.newInstance(this.toSequence());
    }

    toSequence(): IFilterCriteria {
        return {
            className: Tools.getClassName(this),
            visibleForegroundColor: this._visibleForegroundColor,
            visibleBackgroundColor: this._visibleBackgroundColor,
            whenNumberEqualToAny: this._whenNumberEqualToAny,
            whenNumberGreaterThan: this._whenNumberGreaterThan,
            whenNumberBetweenEnd: this._whenNumberBetweenEnd,
            whenNumberEqualTo: this._whenNumberEqualTo,
            whenDateEqualToAny: this._whenDateEqualToAny,
            whenDateNotEqualTo: this._whenDateNotEqualTo,
            whenFormulaSatisfied: this._whenFormulaSatisfied,
            whenDateNotEqualToAny: this._whenDateNotEqualToAny,
            whenNumberBetweenStart: this._whenNumberBetweenStart,
            whenNumberGreaterThanOrEqualTo: 0,
            criteriaType: this._criteriaType,
            criteriaValues: this._criteriaValues,
            hiddenValues: this._hiddenValues,
            visibleValues: this._visibleValues,
            whenDateAfter: this._whenDateAfter,
            whenNumberNotBetweenStart: this._whenNumberNotBetweenStart,
            whenNumberNotBetweenEnd: this._whenNumberNotBetweenEnd,
            whenNumberNotEqualTo: this._whenNumberNotEqualTo,
            whenNumberNotEqualToAny: this._whenNumberNotEqualToAny,
            whenTextContains: this._whenTextContains,
            whenTextDoesNotContain: this._whenTextDoesNotContain,
            whenTextEndsWith: this._whenTextEndsWith,
            whenTextEqualTo: this._whenTextEqualTo,
            whenTextEqualToAny: this._whenTextEqualToAny,
            whenTextNotEqualTo: this._whenTextNotEqualTo,
            whenTextNotEqualToAny: this._whenTextNotEqualToAny,
            whenTextStartsWith: this._whenTextStartsWith,
            whenDateAfterRelativeDate: this._whenDateAfterRelativeDate,
            whenDateBefore: this._whenDateBefore,
            whenDateBeforeRelativeDate: this._whenDateBeforeRelativeDate,
            whenDateEqualToDate: this._whenDateEqualToDate,
            whenDateEqualToRelativeDate: this._whenDateEqualToRelativeDate,
            whenNumberLessThan: this._whenNumberLessThan,
            whenNumberLessThanOrEqualTo: this._whenNumberLessThanOrEqualTo,
        };
    }

    withContext(context: Context): FilterCriteria {
        this._context = context;
        return this;
    }

    getContext(): Context {
        return this._context;
    }

    getWhenNumberGreaterThanOrEqualTo(): number {
        return this._whenNumberGreaterThanOrEqualTo;
    }

    getCriteriaType(): BooleanCriteria {
        return this._criteriaType;
    }

    getCriteriaValues(): ConditionValue[] {
        return this._criteriaValues;
    }

    getHiddenValues(): string[] {
        return this._hiddenValues;
    }

    getVisibleValues(): string[] {
        return this._visibleValues;
    }

    getVisibleForegroundColor(): Color {
        return this._visibleForegroundColor;
    }

    getVisibleBackgroundColor(): Color {
        return this._visibleBackgroundColor;
    }

    getWhenNumberEqualToAny(): number[] {
        return this._whenNumberEqualToAny;
    }

    getWhenNumberGreaterThan(): number {
        return this._whenNumberGreaterThan;
    }

    getWhenNumberBetweenEnd(): number {
        return this._whenNumberBetweenEnd;
    }

    getWhenNumberEqualTo(): number {
        return this._whenNumberEqualTo;
    }

    getWhenDateEqualToAny(): Date[] {
        return this._whenDateEqualToAny;
    }

    getWhenDateNotEqualTo(): Date {
        return this._whenDateNotEqualTo;
    }

    getWhenFormulaSatisfied(): string {
        return this._whenFormulaSatisfied;
    }

    getWhenDateNotEqualToAny(): Date[] {
        return this._whenDateNotEqualToAny;
    }

    getWhenNumberBetweenStart(): number {
        return this._whenNumberBetweenStart;
    }

    getWhenDateAfter(): Date {
        return this._whenDateAfter;
    }

    getWhenNumberNotBetweenStart(): number {
        return this._whenNumberNotBetweenStart;
    }

    getWhenNumberNotBetweenEnd(): number {
        return this._whenNumberNotBetweenEnd;
    }

    getWhenNumberNotEqualTo(): number {
        return this._whenNumberNotEqualTo;
    }

    getWhenNumberNotEqualToAny(): number[] {
        return this._whenNumberNotEqualToAny;
    }

    getWhenTextContains(): string {
        return this._whenTextContains;
    }

    getWhenTextDoesNotContain(): string {
        return this._whenTextDoesNotContain;
    }

    getWhenTextEndsWith(): string {
        return this._whenTextEndsWith;
    }

    getWhenTextEqualTo(): string {
        return this._whenTextEqualTo;
    }

    getWhenTextEqualToAny(): string[] {
        return this._whenTextEqualToAny;
    }

    getWhenTextNotEqualTo(): string {
        return this._whenTextNotEqualTo;
    }

    getWhenTextNotEqualToAny(): string[] {
        return this._whenTextNotEqualToAny;
    }

    getWhenTextStartsWith(): string {
        return this._whenTextStartsWith;
    }

    getWhenDateAfterRelativeDate(): RelativeDate {
        return this._whenDateAfterRelativeDate;
    }

    getWhenDateBefore(): Date {
        return this._whenDateBefore;
    }

    getWhenDateBeforeRelativeDate(): RelativeDate {
        return this._whenDateBeforeRelativeDate;
    }

    getWhenDateEqualToDate(): Date {
        return this._whenDateEqualToDate;
    }

    getWhenDateEqualToRelativeDate(): RelativeDate {
        return this._whenDateEqualToRelativeDate;
    }

    getWhenNumberLessThan(): number {
        return this._whenNumberLessThan;
    }

    getWhenNumberLessThanOrEqualTo(): number {
        return this._whenNumberLessThanOrEqualTo;
    }
}
