import { Color, RelativeDate, Serializer, Tools, Tuples } from '@univerjs/core';

import { BooleanCriteria } from '../Enum/BooleanCriteria';
import { ConditionValue, IFilterCriteriaData } from '../IData/FilterType';
import { FilterCriteria } from './FilterCriteria';

export class FilterCriteriaBuilder extends Serializer {
    private _whenNumberGreaterThanOrEqualTo: number;

    private _criteriaType: BooleanCriteria;

    private _criteriaValues: ConditionValue[];

    private _hiddenValues: string[];

    private _visibleValues: string[];

    private _visibleForegroundColor: Color;

    private _visibleBackgroundColor: Color;

    private _whenNumberEqualToAny: number[];

    private _whenNumberGreaterThan: number;

    private _whenNumberBetweenEnd: number;

    private _whenNumberEqualTo: number;

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

    static newInstance(sequence: IFilterCriteriaData): FilterCriteriaBuilder {
        const builder = new FilterCriteriaBuilder();
        builder._criteriaType = sequence.criteriaType;
        builder._whenNumberGreaterThanOrEqualTo = sequence.whenNumberGreaterThanOrEqualTo;
        builder._whenDateNotEqualToAny = sequence.whenDateNotEqualToAny;
        builder._whenNumberBetweenStart = sequence.whenNumberBetweenStart;
        builder._whenNumberBetweenEnd = sequence.whenNumberBetweenEnd;
        builder._criteriaValues = sequence.criteriaValues;
        builder._hiddenValues = sequence.hiddenValues;
        builder._visibleValues = sequence.visibleValues;
        builder._visibleForegroundColor = sequence.visibleForegroundColor;
        builder._visibleBackgroundColor = sequence.visibleBackgroundColor;
        builder._whenDateEqualToDate = sequence.whenDateEqualToDate;
        builder._whenDateEqualToRelativeDate = sequence.whenDateEqualToRelativeDate;
        builder._whenDateAfterRelativeDate = sequence.whenDateAfterRelativeDate;
        builder._whenDateBeforeRelativeDate = sequence.whenDateBeforeRelativeDate;
        builder._whenNumberEqualToAny = sequence.whenNumberEqualToAny;
        builder._whenNumberGreaterThan = sequence.whenNumberGreaterThan;
        builder._whenDateAfter = sequence.whenDateAfter;
        builder._whenDateBefore = sequence.whenDateBefore;
        builder._whenDateNotEqualTo = sequence.whenDateNotEqualTo;
        builder._whenFormulaSatisfied = sequence.whenFormulaSatisfied;
        builder._whenDateEqualToAny = sequence.whenDateEqualToAny;
        builder._whenNumberEqualTo = sequence.whenNumberEqualTo;
        builder._whenNumberNotEqualTo = sequence.whenNumberNotEqualTo;
        builder._whenNumberNotEqualToAny = sequence.whenNumberNotEqualToAny;
        builder._whenTextContains = sequence.whenTextContains;
        builder._whenTextDoesNotContain = sequence.whenTextDoesNotContain;
        builder._whenTextEndsWith = sequence.whenTextEndsWith;
        builder._whenTextEqualTo = sequence.whenTextEqualTo;
        builder._whenTextEqualToAny = sequence.whenTextEqualToAny;
        builder._whenTextNotEqualTo = sequence.whenTextNotEqualTo;
        builder._whenTextNotEqualToAny = sequence.whenTextNotEqualToAny;
        builder._whenTextStartsWith = sequence.whenTextStartsWith;
        builder._whenNumberNotBetweenStart = sequence.whenNumberNotBetweenStart;
        builder._whenNumberNotBetweenEnd = sequence.whenNumberNotBetweenEnd;
        builder._whenNumberLessThan = sequence.whenNumberLessThan;
        builder._whenNumberLessThanOrEqualTo = sequence.whenNumberLessThanOrEqualTo;
        return builder;
    }

    // Constructs a filter criteria from the settings supplied to the builder.
    build(): FilterCriteria {
        return FilterCriteria.newInstance(this.toSequence());
    }

    // Creates a builder for a filter criteria based on this filter criteria's settings.
    copy(): FilterCriteriaBuilder {
        return FilterCriteriaBuilder.newInstance(this.toSequence());
    }

    override toSequence(): IFilterCriteriaData {
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

    // Sets the values to hide.
    setHiddenValues(values: string[]): FilterCriteriaBuilder {
        this._hiddenValues = values;
        return this;
    }

    // Sets the background color used as a filter criteria.
    setVisibleBackgroundColor(visibleBackgroundColor: Color) {
        this._visibleBackgroundColor = visibleBackgroundColor;
    }

    // Sets the foreground color used as a filter criteria.
    setVisibleForegroundColor(visibleForegroundColor: Color) {
        this._visibleForegroundColor = visibleForegroundColor;
    }

    // Sets the values to show.
    setVisibleValues(values: string[]): FilterCriteriaBuilder {
        this._visibleValues = values;
        return this;
    }

    // Sets the filter criteria to show cells where the cell is empty.
    whenCellEmpty(): FilterCriteriaBuilder {
        this._criteriaType = BooleanCriteria.CELL_EMPTY;
        return this;
    }

    // Sets the filter criteria to show cells where the cell is not empty.
    whenCellNotEmpty(): FilterCriteriaBuilder {
        this._criteriaType = BooleanCriteria.CELL_NOT_EMPTY;
        return this;
    }

    // Sets the filter criteria to show cells where the cell date is after the specified value.
    whenDateAfter(date: Date): FilterCriteriaBuilder;
    // Sets the filter criteria to show cells where the cell date is after the specified relative date.
    whenDateAfter(date: RelativeDate): FilterCriteriaBuilder;
    whenDateAfter(...argument: any): FilterCriteriaBuilder {
        if (Tuples.checkup(argument, Date)) {
            this._whenDateAfter = argument[0];
            this._criteriaType = BooleanCriteria.DATE_AFTER;
        } else {
            this._whenDateAfterRelativeDate = argument[0];
            this._criteriaType = BooleanCriteria.DATE_AFTER_RELATIVE;
        }
        return this;
    }

    // Sets the filter criteria to show cells where the cell date is before the specified date.
    whenDateBefore(date: Date): FilterCriteriaBuilder;
    // Sets the filter criteria to show cells where a cell date is before the specified relative date.
    whenDateBefore(date: RelativeDate): FilterCriteriaBuilder;
    whenDateBefore(...argument: any): FilterCriteriaBuilder {
        if (Tuples.checkup(argument, Date)) {
            this._whenDateBefore = argument[0];
            this._criteriaType = BooleanCriteria.DATE_BEFORE;
        } else {
            this._whenDateBeforeRelativeDate = argument[0];
            this._criteriaType = BooleanCriteria.DATE_BEFORE_RELATIVE;
        }

        return this;
    }

    // Sets the filter criteria to show cells where a cell date is equal to the specified date.
    whenDateEqualTo(date: Date): FilterCriteriaBuilder;
    // Sets the filter criteria to show cells where a cell date is equal to the specified relative date.
    whenDateEqualTo(date: RelativeDate): FilterCriteriaBuilder;
    whenDateEqualTo(...argument: any): FilterCriteriaBuilder {
        if (Tuples.checkup(argument, Date)) {
            this._whenDateEqualToDate = argument[0];
            this._criteriaType = BooleanCriteria.DATE_EQUAL_TO;
        } else {
            this._whenDateEqualToRelativeDate = argument[0];
            this._criteriaType = BooleanCriteria.DATE_EQUAL_TO_RELATIVE;
        }

        return this;
    }

    // Sets the filter criteria to show cells where the cell date is equal to any of the specified dates.
    whenDateEqualToAny(dates: Date[]): FilterCriteriaBuilder {
        this._whenDateEqualToAny = dates;
        this._criteriaType = BooleanCriteria.DATE_EQUAL_TO;
        return this;
    }

    // Sets the filter criteria to show cells where the cell date is not equal to the specified date.
    whenDateNotEqualTo(date: Date): FilterCriteriaBuilder {
        this._whenDateNotEqualTo = date;
        this._criteriaType = BooleanCriteria.DATE_NOT_EQUAL_TO;
        return this;
    }

    // Sets the filter criteria to show cells where the cell date is not equal to any of the specified dates.
    whenDateNotEqualToAny(dates: Date[]): FilterCriteriaBuilder {
        this._whenDateNotEqualToAny = dates;
        this._criteriaType = BooleanCriteria.DATE_NOT_EQUAL_TO;
        return this;
    }

    // Sets the filter criteria to show cells where the specified formula (such as =B:B<C:C) evaluates to true.
    whenFormulaSatisfied(formula: string): FilterCriteriaBuilder {
        this._whenFormulaSatisfied = formula;
        this._criteriaType = BooleanCriteria.CUSTOM_FORMULA;
        return this;
    }

    // Sets the filter criteria to show cells where the cell number is falls between, or is either of, two specified numbers.
    whenNumberBetween(start: number, end: number): FilterCriteriaBuilder {
        this._whenNumberBetweenStart = start;
        this._whenNumberBetweenEnd = end;
        this._criteriaType = BooleanCriteria.NUMBER_BETWEEN;
        return this;
    }

    // Sets the filter criteria to show cells where the cell number is equal to the specified value.
    whenNumberEqualTo(number: number): FilterCriteriaBuilder {
        this._whenNumberEqualTo = number;
        this._criteriaType = BooleanCriteria.NUMBER_EQUAL_TO;
        return this;
    }

    // Sets the filter criteria to show cells where the cell number is equal to any of the specified numbers.
    whenNumberEqualToAny(numbers: number[]): FilterCriteriaBuilder {
        this._whenNumberEqualToAny = numbers;
        this._criteriaType = BooleanCriteria.NUMBER_EQUAL_TO;
        return this;
    }

    // Sets the filter criteria to show cells where the cell number is greater than the specified value.
    whenNumberGreaterThan(number: number): FilterCriteriaBuilder {
        this._whenNumberGreaterThan = number;
        this._criteriaType = BooleanCriteria.NUMBER_GREATER_THAN;
        return this;
    }

    // Sets the filter criteria to show cells where the cell number is greater than or equal to the specified value.
    whenNumberGreaterThanOrEqualTo(number: number): FilterCriteriaBuilder {
        this._whenNumberGreaterThanOrEqualTo = number;
        this._criteriaType = BooleanCriteria.NUMBER_GREATER_THAN_OR_EQUAL_TO;
        return this;
    }

    // Sets the conditional conditional format rule to show cells where the cell number is less than the specified value.
    whenNumberLessThan(number: number): FilterCriteriaBuilder {
        this._whenNumberLessThan = number;
        this._criteriaType = BooleanCriteria.NUMBER_LESS_THAN;
        return this;
    }

    // Sets the filter criteria to show cells where the cell number is less than or equal to the specified value.
    whenNumberLessThanOrEqualTo(number: number): FilterCriteriaBuilder {
        this._whenNumberLessThanOrEqualTo = number;
        this._criteriaType = BooleanCriteria.NUMBER_LESS_THAN_OR_EQUAL_TO;
        return this;
    }

    // Sets the filter criteria to show cells where the cell number does not fall between, and is neither of, two specified numbers.
    whenNumberNotBetween(start: number, end: number): FilterCriteriaBuilder {
        this._whenNumberNotBetweenStart = start;
        this._whenNumberNotBetweenEnd = end;
        this._criteriaType = BooleanCriteria.NUMBER_NOT_BETWEEN;
        return this;
    }

    // Sets the filter criteria to show cells where the cell number is not equal to the specified value.
    whenNumberNotEqualTo(number: number): FilterCriteriaBuilder {
        this._whenNumberNotEqualTo = number;
        this._criteriaType = BooleanCriteria.NUMBER_NOT_BETWEEN;
        return this;
    }

    // Sets the filter criteria to show cells where the cell number is not equal to any of the specified numbers.
    whenNumberNotEqualToAny(numbers: number[]): FilterCriteriaBuilder {
        this._whenNumberNotEqualToAny = numbers;
        this._criteriaType = BooleanCriteria.NUMBER_NOT_BETWEEN;
        return this;
    }

    // Sets the filter criteria to show cells where the cell text contains the specified text.
    whenTextContains(text: string): FilterCriteriaBuilder {
        this._whenTextContains = text;
        this._criteriaType = BooleanCriteria.TEXT_CONTAINS;
        return this;
    }

    // Sets the filter criteria to show cells where the cell text does not contain the specified text.
    whenTextDoesNotContain(text: string): FilterCriteriaBuilder {
        this._whenTextDoesNotContain = text;
        this._criteriaType = BooleanCriteria.TEXT_DOES_NOT_CONTAIN;
        return this;
    }

    // Sets the filter criteria to show cells where the cell text ends with the specified text.
    whenTextEndsWith(text: string): FilterCriteriaBuilder {
        this._whenTextEndsWith = text;
        this._criteriaType = BooleanCriteria.TEXT_ENDS_WITH;
        return this;
    }

    // Sets the filter criteria to show cells where the cell text is equal to the specified text.
    whenTextEqualTo(text: string): FilterCriteriaBuilder {
        this._whenTextEqualTo = text;
        this._criteriaType = BooleanCriteria.TEXT_EQUAL_TO;
        return this;
    }

    // Sets the filter criteria to show cells where the cell text is equal to any of the specified values.
    whenTextEqualToAny(text: string[]): FilterCriteriaBuilder {
        this._whenTextEqualToAny = text;
        this._criteriaType = BooleanCriteria.TEXT_EQUAL_TO;
        return this;
    }

    // Sets the filter criteria to show cells where the cell text is not equal to the specified text.
    whenTextNotEqualTo(text: string): FilterCriteriaBuilder {
        this._whenTextNotEqualTo = text;
        this._criteriaType = BooleanCriteria.TEXT_NOT_EQUAL_TO;
        return this;
    }

    // Sets the filter criteria to show cells where the cell text is not equal to any of the specified values.
    whenTextNotEqualToAny(text: string[]): FilterCriteriaBuilder {
        this._whenTextNotEqualToAny = text;
        this._criteriaType = BooleanCriteria.TEXT_NOT_EQUAL_TO;
        return this;
    }

    // Sets the filter criteria to show cells where the cell text starts with the specified text.
    whenTextStartsWith(text: string): FilterCriteriaBuilder {
        this._whenTextStartsWith = text;
        this._criteriaType = BooleanCriteria.TEXT_STARTS_WITH;
        return this;
    }

    // Sets the boolean criteria to criteria defined by BooleanCriteria values, typically taken from the criteria and arguments of an existing criteria.
    withCriteria(criteria: BooleanCriteria, args: ConditionValue[]): FilterCriteriaBuilder {
        this._criteriaType = criteria;
        this._criteriaValues = args;
        return this;
    }
}
