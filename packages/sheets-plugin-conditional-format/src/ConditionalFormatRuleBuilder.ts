// import { ConditionType, InterpolationPointType, Range, IRangeData, IStyleData, Nullable, RelativeDate } from '@univerjs/core';
// import { ConditionalFormatRule } from './ConditionalFormatRule';
// import { BooleanCondition, BooleanRule, ConditionValue, GradientRule, InterpolationPoint } from './IData/IConditionalFormatRule';

// export class ConditionalFormatRuleBuilder {
//     private _ranges: IRangeData[];

//     private _booleanRule: BooleanRule;

//     private _gradientRule: GradientRule;

//     private _format: IStyleData;

//     private _condition: BooleanCondition;

//     private _maxPoint: InterpolationPoint;

//     private _minPoint: InterpolationPoint;

//     private _midPoint: Nullable<InterpolationPoint>;

//     /**
//      * get condition of date format
//      */
//     private _getDate = (type: ConditionType, date: RelativeDate | Date) => {
//         let value: ConditionValue;
//         if (typeof date === 'object') {
//             value = {
//                 userEnteredValue: (+date).toString(),
//             };
//         } else {
//             value = {
//                 relativeDate: date,
//             };
//         }
//         this._condition = {
//             type,
//             values: [value],
//         };
//     };

//     private _setBooleanRule() {
//         this._booleanRule = {
//             condition: this._condition,
//             format: this._format,
//         };
//     }

//     /**
//      * get condition of text format
//      */
//     private _getText(type: ConditionType, value: string) {
//         this._condition = {
//             type,
//             values: [
//                 {
//                     userEnteredValue: value,
//                 },
//             ],
//         };
//     }

//     /**
//      * get condition of number format
//      */
//     private _getNumber(type: ConditionType, value: number[]) {
//         const values: ConditionValue[] = [];
//         for (let i = 0; i < value.length; i++) {
//             values.push({
//                 userEnteredValue: value[i].toString(),
//             });
//         }
//         this._condition = {
//             type,
//             values,
//         };
//     }

//     constructor(ranges?: IRangeData[], rule?: BooleanRule | GradientRule) {
//         this._ranges = ranges ?? [];
//         if (rule) {
//             if ('condition' in rule) {
//                 this._booleanRule = rule;
//             } else {
//                 this._gradientRule = rule;
//             }
//         }
//     }

//     /**
//      * Constructs a conditional format rule from the settings applied to the builder.
//      */
//     build(): ConditionalFormatRule {
//         return new ConditionalFormatRule(this._ranges, this._booleanRule ?? this._gradientRule);
//     }

//     /**
//      * Sets the background color for the conditional format rule's format. Passing in null removes the background color format setting from the rule.
//      */
//     setBackground(color: Nullable<string>): ConditionalFormatRuleBuilder {
//         const bgColor = {
//             rgb: color,
//         };
//         this._format.bg = bgColor;
//         this._setBooleanRule();

//         return this;
//     }

//     /**
//      *
//      * Sets text bolding for the conditional format rule's format. If bold is true, the rule bolds text if the condition is met; if false, the rule removes any existing bolding if the condition is met. Passing in null removes the bold format setting from the rule.
//      */
//     setBold(bold: Nullable<boolean>): ConditionalFormatRuleBuilder {
//         if (bold === null) {
//             delete this._format.bl;
//         } else if (bold) {
//             this._format.bl = 1;
//         } else {
//             this._format.bl = 0;
//         }
//         this._setBooleanRule();

//         return this;
//     }

//     /**
//      * Sets the font color for the conditional format rule's format. Passing in null removes the font color format setting from the rule.
//      */
//     setFontColor(color: Nullable<string>): ConditionalFormatRuleBuilder {
//         const fontColor = {
//             rgb: color,
//         };
//         this._format.cl = fontColor;
//         this._setBooleanRule();

//         return this;
//     }

//     /**
//      * Sets text italics for the conditional format rule's format. If italic is true, the rule italicises text if the condition is met; if false, the rule removes any existing italicization if the condition is met. Passing in null removes the italic format setting from the rule.
//      */
//     setItalic(italic: Nullable<boolean>): ConditionalFormatRuleBuilder {
//         if (italic === null) {
//             delete this._format.it;
//         } else if (italic) {
//             this._format.it = 1;
//         } else {
//             this._format.it = 0;
//         }
//         this._setBooleanRule();

//         return this;
//     }

//     /**
//      * Sets one or more ranges to which this conditional format rule is applied. This operation replaces any existing ranges. Setting an empty array clears any existing ranges. A rule must have at least one range.
//      */
//     setRanges(ranges: Range[]): ConditionalFormatRuleBuilder {
//         const range = [];
//         for (let i = 0; i < ranges.length; i++) {
//             range.push(ranges[i].getRangeData());
//         }
//         this._ranges = range;

//         return this;
//     }

//     /**
//      * Sets text strikethrough for the conditional format rule's format. If strikethrough is true, the rule strikesthrough text if the condition is met; if false, the rule removes any existing strikethrough formatting if the condition is met. Passing in null removes the strikethrough format setting from the rule.
//      */
//     setStrikethrough(strikethrough: Nullable<boolean>): ConditionalFormatRuleBuilder {
//         if (!this._format.st) {
//             this._format.st = { s: 1 };
//         }

//         if (strikethrough === null) {
//             delete this._format.st;
//         } else if (strikethrough) {
//             this._format.st.s = 1;
//         } else {
//             this._format.st.s = 0;
//         }
//         this._setBooleanRule();

//         return this;
//     }

//     /**
//      * Sets text underlining for the conditional format rule's format. If underline is true, the rule underlines text if the condition is met; if false, the rule removes any existing underlines if the condition is met. Passing in null removes the underline format setting from the rule.
//      */
//     setUnderline(underline: Nullable<boolean>): ConditionalFormatRuleBuilder {
//         if (!this._format.ul) {
//             this._format.ul = { s: 1 };
//         }

//         if (underline === null) {
//             delete this._format.st;
//         } else if (underline) {
//             this._format.ul.s = 1;
//         } else {
//             this._format.ul.s = 0;
//         }
//         this._setBooleanRule();

//         return this;
//     }

//     /**
//      * Sets the conditional format rule to trigger when the cell is empty.
//      */
//     whenCellEmpty(): ConditionalFormatRuleBuilder {
//         const type = ConditionType.BLANK;
//         this._condition = {
//             type,
//         };

//         return this;
//     }

//     /**
//      * Sets the conditional format rule to trigger when the cell is not empty.
//      */
//     whenCellNotEmpty(): ConditionalFormatRuleBuilder {
//         const type = ConditionType.NOT_BLANK;
//         this._condition = {
//             type,
//         };

//         return this;
//     }

//     /**
//      * Sets the conditional format rule to trigger when a date is after the given value.
//      */
//     whenDateAfter(date: RelativeDate | Date): ConditionalFormatRuleBuilder {
//         this._getDate(ConditionType.DATE_AFTER, date);
//         return this;
//     }

//     /**
//      * Sets the conditional format rule to trigger when a date is before the given date.
//      */
//     whenDateBefore(date: RelativeDate | Date): ConditionalFormatRuleBuilder {
//         this._getDate(ConditionType.DATE_BEFORE, date);
//         return this;
//     }

//     /**
//      * Sets the conditional format rule to trigger when a date is equal to the given relative date.
//      */
//     whenDateEqualTo(date: RelativeDate | Date): ConditionalFormatRuleBuilder {
//         this._getDate(ConditionType.DATE_EQ, date);
//         return this;
//     }

//     /**
//      * Sets the conditional format rule to trigger when a number falls between, or is either of, two specified values.
//      */
//     whenNumberBetween(start: number, end: number): ConditionalFormatRuleBuilder {
//         let value: number[];
//         if (start === end) {
//             value = [start];
//         } else if (start > end) {
//             value = [end, start];
//         } else {
//             value = [start, end];
//         }

//         this._getNumber(ConditionType.NUMBER_BETWEEN, value);
//         return this;
//     }

//     /**
//      * Sets the conditional format rule to trigger when a number is equal to the given value.
//      */
//     whenNumberEqualTo(number: number): ConditionalFormatRuleBuilder {
//         this._getNumber(ConditionType.NUMBER_EQ, [number]);
//         return this;
//     }

//     /**
//      * Sets the conditional format rule to trigger when a number is greater than the given value.
//      */
//     whenNumberGreaterThan(number: number): ConditionalFormatRuleBuilder {
//         this._getNumber(ConditionType.NUMNUMBER_BETWEENR_GREATER, [number]);
//         return this;
//     }

//     /**
//      * Sets the conditional format rule to trigger when a number is greater than or equal to the given value.
//      */
//     whenNumberGreaterThanOrEqualTo(number: number): ConditionalFormatRuleBuilder {
//         this._getNumber(ConditionType.NUMBER_GREATER_THAN_EQ, [number]);
//         return this;
//     }

//     /**
//      * Sets the conditional conditional format rule to trigger when a number less than the given value.
//      */
//     whenNumberLessThan(number: number): ConditionalFormatRuleBuilder {
//         this._getNumber(ConditionType.NUMBER_LESS, [number]);
//         return this;
//     }

//     /**
//      * Sets the conditional format rule to trigger when a number less than or equal to the given value.
//      */
//     whenNumberLessThanOrEqualTo(number: number): ConditionalFormatRuleBuilder {
//         this._getNumber(ConditionType.NUMBER_LESS_THAN_EQ, [number]);
//         return this;
//     }

//     /**
//      * Sets the conditional format rule to trigger when a number does not fall between, and is neither of, two specified values.
//      */
//     whenNumberNotBetween(start: number, end: number): ConditionalFormatRuleBuilder {
//         let value: number[];
//         if (start === end) {
//             value = [start];
//         } else if (start > end) {
//             value = [end, start];
//         } else {
//             value = [start, end];
//         }

//         this._getNumber(ConditionType.NUMBER_NOT_BETWEEN, value);
//         return this;
//     }

//     /**
//      * Sets the conditional format rule to trigger when a number is not equal to the given value.
//      */
//     whenNumberNotEqualTo(number: number): ConditionalFormatRuleBuilder {
//         this._getNumber(ConditionType.NUMBER_NOT_EQ, [number]);
//         return this;
//     }

//     /**
//      * Sets the conditional format rule to trigger when that the given formula evaluates to true.
//      */
//     whenFormulaSatisfied(formula: string): ConditionalFormatRuleBuilder {
//         this._getText(ConditionType.CUSTOM_FORMULA, formula);
//         return this;
//     }

//     /**
//      * Sets the conditional format rule to trigger when that the input contains the given value.
//      */
//     whenTextContains(text: string): ConditionalFormatRuleBuilder {
//         this._getText(ConditionType.TEXT_CONTAINS, text);
//         return this;
//     }

//     /**
//      * Sets the conditional format rule to trigger when that the input does not contain the given value.
//      */
//     whenTextDoesNotContain(text: string): ConditionalFormatRuleBuilder {
//         this._getText(ConditionType.TEXT_NOT_CONTAINS, text);
//         return this;
//     }

//     /**
//      * Sets the conditional format rule to trigger when that the input ends with the given value.
//      */
//     whenTextEndsWith(text: string): ConditionalFormatRuleBuilder {
//         this._getText(ConditionType.TEXT_ENDS_WITH, text);
//         return this;
//     }

//     /**
//      * Sets the conditional format rule to trigger when that the input is equal to the given value.
//      */
//     whenTextEqualTo(text: string): ConditionalFormatRuleBuilder {
//         this._getText(ConditionType.TEXT_EQ, text);
//         return this;
//     }

//     /**
//      * Sets the conditional format rule to trigger when that the input starts with the given value.
//      */
//     whenTextStartsWith(text: string): ConditionalFormatRuleBuilder {
//         this._getText(ConditionType.TEXT_STARTS_WITH, text);
//         return this;
//     }

//     /**
//      * Sets the conditional format rule to criteria defined by BooleanCriteria values, typically taken from the criteria and arguments of an existing rule.
//      */
//     withCriteria(criteria: ConditionType, args: ConditionValue[]): ConditionalFormatRuleBuilder {
//         this._condition = {
//             type: criteria,
//             values: args,
//         };
//         return this;
//     }

//     /**
//      * Clears the conditional format rule's gradient maxpoint value, and instead uses the maximum value in the rule's ranges. Also sets the gradient's maxpoint color to the input color.
//      */
//     setGradientMaxpoint(color: string): ConditionalFormatRuleBuilder {
//         this._maxPoint = {
//             colorStyle: {
//                 rgb: color,
//             },
//         };

//         return this;
//     }

//     /**
//      * Sets the conditional format rule's gradient maxpoint fields.
//      */
//     setGradientMaxpointWithValue(color: string, type: InterpolationPointType, value: string): ConditionalFormatRuleBuilder {
//         this._maxPoint = {
//             colorStyle: {
//                 rgb: color,
//             },
//             type,
//             value,
//         };

//         return this;
//     }

//     /**
//      * Sets the conditional format rule's gradient midpoint fields. Clears all of the midpoint fields if the passed in interpolation type is null.
//      */
//     setGradientMidpointWithValue(color: string, type: Nullable<InterpolationPointType>, value: string): ConditionalFormatRuleBuilder {
//         if (!type) {
//             this._midPoint = null;
//         } else {
//             this._midPoint = {
//                 colorStyle: {
//                     rgb: color,
//                 },
//                 type,
//                 value,
//             };
//         }

//         return this;
//     }

//     /**
//      * Clears the conditional format rule's gradient minpoint value, and instead uses the minimum value in the rule's ranges. Also sets the gradient's minpoint color to the input color.
//      */
//     setGradientMinpoint(color: string): ConditionalFormatRuleBuilder {
//         this._minPoint = {
//             colorStyle: {
//                 rgb: color,
//             },
//         };

//         return this;
//     }

//     /**
//      * Sets the conditional format rule's gradient minpoint fields.
//      */
//     setGradientMinpointWithValue(color: string, type: InterpolationPointType, value: string): ConditionalFormatRuleBuilder {
//         this._minPoint = {
//             colorStyle: {
//                 rgb: color,
//             },
//             type,
//             value,
//         };

//         return this;
//     }
// }

// // /**
// //  * Creates a builder for a conditional formatting rule.
// //  */
// //  newConditionalFormatRule(): ConditionalFormatRuleBuilder {
// //     return new ConditionalFormatRuleBuilder();
// // }

// // /**
// //  * Get all conditional format rules in this sheet.
// //  */
// // getConditionalFormatRules(): ConditionalFormatRule[] {
// //     const condition = this._config.conditionalFormats;
// //     const rules = [];
// //     for (let i = 0; i < condition.length; i++) {
// //         rules.push(
// //             new ConditionalFormatRule(condition[i].ranges, condition[i].rule)
// //         );
// //     }
// //     return rules;
// // }

// // /**
// //  * Replaces all currently existing conditional format rules in the sheet with the input rules. Rules are evaluated in their input order.
// //  */
// // setConditionalFormatRules(rules: ConditionalFormatRule[]) {
// //     let ruleRange: IRangeData[] = [];
// //     for (let i = 0; i < rules.length; i++) {
// //         const rule = rules[i];
// //         const rangeList = rule.getRanges();
// //         const booleanConditon = rule.getBooleanCondition();
// //         const gradientCondition = rule.getGradientCondition();

// //         if (booleanConditon) {
// //             ruleRange = this._setBooleanCondtionRange(
// //                 ruleRange,
// //                 rangeList,
// //                 booleanConditon
// //             );
// //         } else if (gradientCondition) {
// //             ruleRange = this._setGradientContionRange(
// //                 ruleRange,
// //                 rangeList,
// //                 gradientCondition
// //             );
// //         }
// //     }
// // }

// // private _setBooleanCondtionRange = (
// //     ranges: IRangeData[],
// //     rangeList: IRangeData[],
// //     booleanRule: BooleanRule
// // ) => {
// //     const map = new Map([
// //         [
// //             ConditionType.CONDITION_TYPE_UNSPECIFIED,
// //             (cell: Nullable<ICellData>, values?: ConditionValue[]) => true,
// //         ],
// //         [ConditionType.BLANK, (cell) => !cell || cell.m === ''],
// //         [ConditionType.NOT_BLANK, (cell) => !!cell && !!cell.m],
// //         [
// //             ConditionType.DATE_AFTER,
// //             (cell, values) => {
// //                 values = values!;
// //                 if (cell && cell.fm && cell.fm.t === FormatType.DATE) {
// //                     if ('relativeDate' in values[0]) {
// //                     } else {
// //                         if (cell.v && cell.v > values[0].userEnteredValue!) {
// //                             return true;
// //                         }
// //                     }
// //                 }
// //                 return false;
// //             },
// //         ],
// //         [
// //             ConditionType.DATE_BEFORE,
// //             (cell, values) => {
// //                 values = values!;
// //                 if (cell && cell.fm && cell.fm.t === FormatType.DATE) {
// //                     if ('relativeDate' in values[0]) {
// //                     } else {
// //                         if (cell.v && cell.v < values[0].userEnteredValue!) {
// //                             return true;
// //                         }
// //                     }
// //                 }
// //                 return false;
// //             },
// //         ],
// //         [
// //             ConditionType.DATE_EQ,
// //             (cell, values) => {
// //                 values = values!;
// //                 if (cell && cell.fm && cell.fm.t === FormatType.DATE) {
// //                     if ('relativeDate' in values[0]) {
// //                     } else {
// //                         if (cell.v == values[0].userEnteredValue!) {
// //                             return true;
// //                         }
// //                     }
// //                 }
// //                 return false;
// //             },
// //         ],
// //         [
// //             ConditionType.NUMBER_BETWEEN,
// //             (cell, values) =>
// //                 cell &&
// //                 cell.v &&
// //                 values &&
// //                 cell.v > values[0].userEnteredValue! &&
// //                 cell.v < values[1].userEnteredValue!,
// //         ],
// //         [
// //             ConditionType.NUMBER_EQ,
// //             (cell, values) =>
// //                 cell && values && cell.v == values[0].userEnteredValue!,
// //         ],
// //         [
// //             ConditionType.NUMNUMBER_BETWEENR_GREATER,
// //             (cell, values) =>
// //                 cell && cell.v && values && cell.v > values[0].userEnteredValue!,
// //         ],
// //         [
// //             ConditionType.NUMBER_GREATER_THAN_EQ,
// //             (cell, values) =>
// //                 cell &&
// //                 cell.v &&
// //                 values &&
// //                 cell.v >= values[0].userEnteredValue!,
// //         ],
// //         [
// //             ConditionType.NUMBER_GREATER_THAN_EQ,
// //             (cell, values) =>
// //                 values &&
// //                 cell &&
// //                 cell.v &&
// //                 cell.v >= values[0].userEnteredValue!,
// //         ],
// //         [
// //             ConditionType.NUMBER_LESS,
// //             (cell, values) =>
// //                 values && cell && cell.v && cell.v < values[0].userEnteredValue!,
// //         ],
// //         [
// //             ConditionType.NUMBER_LESS_THAN_EQ,
// //             (cell, values) =>
// //                 values &&
// //                 cell &&
// //                 cell.v &&
// //                 cell.v <= values[0].userEnteredValue!,
// //         ],
// //         [
// //             ConditionType.NUMBER_NOT_BETWEEN,
// //             (cell, values) =>
// //                 values &&
// //                 cell &&
// //                 cell.v &&
// //                 (cell.v < values[0].userEnteredValue! ||
// //                     cell.v > values[1].userEnteredValue!),
// //         ],
// //         [
// //             ConditionType.NUMBER_NOT_EQ,
// //             (cell, values) =>
// //                 values && cell && cell.v != values[0].userEnteredValue!,
// //         ],
// //         [
// //             ConditionType.CUSTOM_FORMULA,
// //             (cell, values) =>
// //                 values && cell && cell.f == values[0].userEnteredValue!,
// //         ],
// //         [
// //             ConditionType.TEXT_CONTAINS,
// //             (cell, values) =>
// //                 values && cell && cell.m?.includes(values[0].userEnteredValue!),
// //         ],
// //         [
// //             ConditionType.TEXT_NOT_CONTAINS,
// //             (cell, values) =>
// //                 values &&
// //                 (!cell ||
// //                     !cell.m ||
// //                     !cell.m.includes(values[0].userEnteredValue!)),
// //         ],
// //         [
// //             ConditionType.TEXT_ENDS_WITH,
// //             (cell, values) =>
// //                 values &&
// //                 cell &&
// //                 cell.m &&
// //                 new RegExp(values[0].userEnteredValue! + '$').test(cell.m),
// //         ],
// //     ]);

// //     for (let i = 0; i < rangeList.length; i++) {
// //         const range = new Range(this, rangeList[i]);
// //         const matrix = range.getMatrix();
// //         range.forEach((row, column) => {
// //             const cell = matrix.getValue(row, column);
// //             const condition = map.get(booleanRule.condition.type)!(
// //                 cell,
// //                 booleanRule.condition.values
// //             );
// //             if (condition) {
// //                 ranges.push({
// //                     startRow: row,
// //                     endRow: row,
// //                     startColumn: column,
// //                     endColumn: column,
// //                 });
// //             }
// //         });
// //     }

// //     return ranges;
// // };

// // private _setGradientContionRange = (
// //     ranges: IRangeData[],
// //     rangeList: IRangeData[],
// //     booleanRule: GradientRule
// // ) => {
// //     return ranges;
// // };
