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

/* eslint-disable ts/explicit-function-return-type */

import type { IRange } from '@univerjs/core';
import type {
    CFTimePeriodOperator,
    IAverageHighlightCell,
    IColorScale,
    IConditionalFormattingRuleConfig,
    IConditionFormattingRule,
    IDataBar,
    IDuplicateValuesHighlightCell,
    IFormulaHighlightCell,
    IIconSet,
    INumberHighlightCell,
    IRankHighlightCell,
    ITextHighlightCell,
    ITimePeriodHighlightCell,
    IUniqueValuesHighlightCell,
    IValueConfig,
} from '@univerjs/sheets-conditional-formatting';
import { BooleanNumber, ColorKit, Tools } from '@univerjs/core';
import { CFNumberOperator, CFRuleType, CFSubRuleType, CFTextOperator, CFValueType, createCfId, EMPTY_ICON_TYPE, iconMap } from '@univerjs/sheets-conditional-formatting';

/**
 * @ignore
 * @hideconstructor
 */
class ConditionalFormatRuleBaseBuilder {
    protected _rule: Partial<IConditionFormattingRule> = {};

    protected get _ruleConfig() {
        return this._rule.rule || null;
    }

    protected _getDefaultConfig(type: CFRuleType = CFRuleType.highlightCell): IConditionalFormattingRuleConfig {
        switch (type) {
            case CFRuleType.colorScale: {
                return {
                    type,
                    config: [
                        { index: 0, color: new ColorKit('').toRgbString(), value: { type: CFValueType.min } },
                        { index: 0, color: new ColorKit('green').toRgbString(), value: { type: CFValueType.max } },
                    ],
                } as IColorScale;
            }
            case CFRuleType.dataBar: {
                return {
                    type,
                    isShowValue: true,
                    config: { min: { type: CFValueType.min }, max: { type: CFValueType.max }, positiveColor: new ColorKit('green').toRgbString(), nativeColor: new ColorKit('').toRgbString(), isGradient: false },
                } as IDataBar;
            }
            case CFRuleType.highlightCell: {
                return {
                    type,
                    subType: CFSubRuleType.text,
                    operator: CFTextOperator.containsText,
                    value: 'abc',
                    style: {},
                } as ITextHighlightCell;
            }
            case CFRuleType.iconSet: {
                return {
                    type,
                    isShowValue: true,
                    config: [{
                        operator: CFNumberOperator.greaterThanOrEqual,
                        value: { type: CFValueType.min },
                        iconType: EMPTY_ICON_TYPE,
                        iconId: '',
                    }, {
                        operator: CFNumberOperator.greaterThanOrEqual,
                        value: { type: CFValueType.percentile, value: 0.5 },
                        iconType: EMPTY_ICON_TYPE,
                        iconId: '',
                    }, {
                        operator: CFNumberOperator.lessThanOrEqual,
                        value: { type: CFValueType.max },
                        iconType: EMPTY_ICON_TYPE,
                        iconId: '',
                    }],
                } as IIconSet;
            }
        }
    }

    constructor(initRule: Partial<IConditionFormattingRule> = {}) {
        this._rule = initRule;
        this._ensureAttr(this._rule, ['rule']);
    }

    // eslint-disable-next-line ts/no-explicit-any
    protected _ensureAttr(obj: Record<string, any>, keys: string[]) {
        keys.reduce((pre, cur) => {
            if (!pre[cur]) {
                pre[cur] = {};
            }
            return pre[cur];
        }, obj);
        return obj;
    }

    /**
     * Constructs a conditional format rule from the settings applied to the builder.
     * @returns {IConditionFormattingRule} The conditional format rule.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with no content in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenCellEmpty()
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    build(): IConditionFormattingRule {
        if (!this._rule.cfId) {
            this._rule.cfId = createCfId();
        }
        if (!this._rule.ranges) {
            this._rule.ranges = [];
        }
        if (this._rule.stopIfTrue === undefined) {
            this._rule.stopIfTrue = false;
        }
        if (!this._rule.rule?.type) {
            this._rule.rule!.type = CFRuleType.highlightCell;
            this._ensureAttr(this._rule, ['rule', 'style']);
        }
        const defaultConfig = this._getDefaultConfig(this._rule.rule!.type);
        const result = { ...this._rule, rule: { ...defaultConfig, ...this._rule.rule } } as IConditionFormattingRule;
        return result;
    }

    /**
     * Deep clone a current builder.
     * @returns {ConditionalFormatRuleBaseBuilder} A new builder with the same settings as the original.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with no content in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const builder = fWorksheet.newConditionalFormattingRule()
     *   .whenCellEmpty()
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()]);
     * fWorksheet.addConditionalFormattingRule(builder.build());
     *
     * // Copy the rule and change the background color to green for the range A1:B2.
     * const newRange = fWorksheet.getRange('A1:B2');
     * const newBuilder = builder.copy()
     *   .setBackground('#00FF00')
     *   .setRanges([newRange.getRange()]);
     * fWorksheet.addConditionalFormattingRule(newBuilder.build());
     * ```
     */
    copy(): ConditionalFormatRuleBaseBuilder {
        const newRule = Tools.deepClone(this._rule);
        if (newRule.cfId) {
            newRule.cfId = createCfId();
        }
        return new ConditionalFormatRuleBaseBuilder(newRule);
    }

    /**
     * Gets the scope of the current conditional format.
     * @returns {IRange[]} The ranges to which the conditional format applies.
     */
    getRanges(): IRange[] {
        return this._rule.ranges || [];
    }

    /**
     * Get the icon set mapping dictionary.
     * @returns {Record<string, string[]>} The icon set mapping dictionary.
     */
    getIconMap(): Record<string, string[]> {
        return iconMap;
    }

    /**
     * Create a conditional format ID.
     * @returns {string} The conditional format ID.
     */
    createCfId(): string {
        return createCfId();
    }

    /**
     * Sets the scope for conditional formatting.
     * @param {IRange[]} ranges - The ranges to which the conditional format applies.
     * @returns {ConditionalFormatRuleBaseBuilder} This builder for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with no content in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenCellEmpty()
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    setRanges(ranges: IRange[]) {
        this._rule.ranges = ranges;
        return this;
    }
}

/**
 * @hideconstructor
 */
class ConditionalFormatHighlightRuleBuilder extends ConditionalFormatRuleBaseBuilder {
    constructor(initConfig: Partial<IConditionFormattingRule> = {}) {
        super(initConfig);
        this._ensureAttr(this._rule, ['rule', 'style']);
    }

    /**
     * Deep clone a current builder.
     * @returns {ConditionalFormatHighlightRuleBuilder} A new builder with the same settings as the original.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with no content in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const builder = fWorksheet.newConditionalFormattingRule()
     *   .whenCellEmpty()
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()]);
     * fWorksheet.addConditionalFormattingRule(builder.build());
     *
     * // Copy the rule and change the background color to green for the range A1:B2.
     * const newRange = fWorksheet.getRange('A1:B2');
     * const newBuilder = builder.copy()
     *   .setBackground('#00FF00')
     *   .setRanges([newRange.getRange()]);
     * fWorksheet.addConditionalFormattingRule(newBuilder.build());
     * ```
     */
    override copy(): ConditionalFormatHighlightRuleBuilder {
        const newRule = Tools.deepClone(this._rule);
        if (newRule.cfId) {
            newRule.cfId = createCfId();
        }
        return new ConditionalFormatHighlightRuleBuilder(newRule);
    }

    /**
     * Set average rule.
     * @param {IAverageHighlightCell['operator']} operator - The operator to use for the average rule.
     * @returns {ConditionalFormatHighlightRuleBuilder} This builder for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with greater than average values in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .setAverage(univerAPI.Enum.ConditionFormatNumberOperatorEnum.greaterThan)
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    setAverage(operator: IAverageHighlightCell['operator']): ConditionalFormatHighlightRuleBuilder {
        const ruleConfig = this._ruleConfig as IAverageHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.average;
        ruleConfig.operator = operator;
        return this;
    }

    /**
     * Set unique values rule.
     * @returns {ConditionalFormatHighlightRuleBuilder} This builder for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with unique values in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .setUniqueValues()
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    setUniqueValues(): ConditionalFormatHighlightRuleBuilder {
        const ruleConfig = this._ruleConfig as IUniqueValuesHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.uniqueValues;
        return this;
    }

    /**
     * Set duplicate values rule.
     * @returns {ConditionalFormatHighlightRuleBuilder} This builder for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with duplicate values in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .setDuplicateValues()
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    setDuplicateValues(): ConditionalFormatHighlightRuleBuilder {
        const ruleConfig = this._ruleConfig as IDuplicateValuesHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.duplicateValues;
        return this;
    }

    /**
     * Set rank rule.
     * @param {{ isBottom: boolean, isPercent: boolean, value: number }} config - The rank rule settings.
     * @param {boolean} config.isBottom - Whether to highlight the bottom rank.
     * @param {boolean} config.isPercent - Whether to use a percentage rank.
     * @param {number} config.value - The rank value.
     * @returns {ConditionalFormatHighlightRuleBuilder} This builder for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights the bottom 10% of values in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .setRank({ isBottom: true, isPercent: true, value: 10 })
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    setRank(config: { isBottom: boolean; isPercent: boolean; value: number }): ConditionalFormatHighlightRuleBuilder {
        const ruleConfig = this._ruleConfig as IRankHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.rank;
        ruleConfig.isBottom = config.isBottom;
        ruleConfig.isPercent = config.isPercent;
        ruleConfig.value = config.value;
        return this;
    }

    /**
     * Sets the background color for the conditional format rule's format.
     * @param {string} [color] - The background color to set. If not provided, the background color is removed.
     * @returns {ConditionalFormatHighlightRuleBuilder} This builder for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with no content in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenCellEmpty()
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    setBackground(color?: string): ConditionalFormatHighlightRuleBuilder {
        if (this._ruleConfig?.type === CFRuleType.highlightCell) {
            if (color) {
                this._ensureAttr(this._ruleConfig, ['style', 'bg']);
                const colorKit = new ColorKit(color);
                this._ruleConfig.style!.bg!.rgb = colorKit.toRgbString();
            } else {
                delete this._ruleConfig.style.bg;
            }
        }
        return this;
    }

    /**
     * Sets text bolding for the conditional format rule's format.
     * @param {boolean} isBold - Whether to bold the text.
     * @returns {ConditionalFormatHighlightRuleBuilder} This builder for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that bolds the text for cells with not empty content in the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenCellNotEmpty()
     *   .setBold(true)
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    setBold(isBold: boolean): ConditionalFormatHighlightRuleBuilder {
        if (this._ruleConfig?.type === CFRuleType.highlightCell) {
            this._ensureAttr(this._ruleConfig, ['style']);

            this._ruleConfig.style.bl = isBold ? BooleanNumber.TRUE : BooleanNumber.FALSE;
        }
        return this;
    }

    /**
     * Sets the font color for the conditional format rule's format.
     * @param {string} [color] - The font color to set. If not provided, the font color is removed.
     * @returns {ConditionalFormatHighlightRuleBuilder} This builder for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that changes the font color to red for cells with not empty content in the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenCellNotEmpty()
     *   .setFontColor('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    setFontColor(color?: string): ConditionalFormatHighlightRuleBuilder {
        if (this._ruleConfig?.type === CFRuleType.highlightCell) {
            if (color) {
                const colorKit = new ColorKit(color);
                this._ensureAttr(this._ruleConfig, ['style', 'cl']);
                this._ruleConfig.style!.cl!.rgb = colorKit.toRgbString();
            } else {
                delete this._ruleConfig.style.cl;
            }
        }
        return this;
    }

    /**
     * Sets text italics for the conditional format rule's format.
     * @param {boolean} isItalic - Whether to italicize the text.
     * @returns {ConditionalFormatHighlightRuleBuilder} This builder for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that italicizes the text for cells with not empty content in the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenCellNotEmpty()
     *   .setItalic(true)
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    setItalic(isItalic: boolean): ConditionalFormatHighlightRuleBuilder {
        if (this._ruleConfig?.type === CFRuleType.highlightCell) {
            this._ensureAttr(this._ruleConfig, ['style']);
            this._ruleConfig.style.it = isItalic ? BooleanNumber.TRUE : BooleanNumber.FALSE;
        }
        return this;
    }

    /**
     * Sets text strikethrough for the conditional format rule's format.
     * @param {boolean} isStrikethrough - Whether is strikethrough the text.
     * @returns {ConditionalFormatHighlightRuleBuilder} This builder for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that set text strikethrough for cells with not empty content in the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenCellNotEmpty()
     *   .setStrikethrough(true)
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    setStrikethrough(isStrikethrough: boolean): ConditionalFormatHighlightRuleBuilder {
        if (this._ruleConfig?.type === CFRuleType.highlightCell) {
            this._ensureAttr(this._ruleConfig, ['style', 'st']);
            this._ruleConfig.style.st!.s = isStrikethrough ? BooleanNumber.TRUE : BooleanNumber.FALSE;
        }
        return this;
    }

    /**
     * Sets text underlining for the conditional format rule's format.
     * @param {boolean} isUnderline - Whether to underline the text.
     * @returns {ConditionalFormatHighlightRuleBuilder} This builder for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that underlines the text for cells with not empty content in the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenCellNotEmpty()
     *   .setUnderline(true)
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    setUnderline(isUnderline: boolean): ConditionalFormatHighlightRuleBuilder {
        if (this._ruleConfig?.type === CFRuleType.highlightCell) {
            this._ensureAttr(this._ruleConfig, ['style', 'ul']);
            this._ruleConfig.style.ul!.s = isUnderline ? BooleanNumber.TRUE : BooleanNumber.FALSE;
        }
        return this;
    }

    /**
     * Sets the conditional format rule to trigger when the cell is empty.
     * @returns {ConditionalFormatHighlightRuleBuilder} This builder for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with no content in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenCellEmpty()
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenCellEmpty(): ConditionalFormatHighlightRuleBuilder {
        const ruleConfig = this._ruleConfig as ITextHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.text;
        ruleConfig.value = '';
        ruleConfig.operator = CFTextOperator.equal;
        return this;
    }

    /**
     * Sets the conditional format rule to trigger when the cell is not empty.
     * @returns {ConditionalFormatHighlightRuleBuilder} This builder for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that changes the font color to red for cells with not empty content in the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenCellNotEmpty()
     *   .setFontColor('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenCellNotEmpty(): ConditionalFormatHighlightRuleBuilder {
        const ruleConfig = this._ruleConfig as ITextHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.text;
        ruleConfig.value = '';
        ruleConfig.operator = CFTextOperator.notEqual;
        return this;
    }

    /**
     * Sets the conditional format rule to trigger when a time period is met.
     * @param {CFTimePeriodOperator} date - The time period to check for.
     * @returns {ConditionalFormatHighlightRuleBuilder} This builder for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with dates in the last 7 days in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenDate(univerAPI.Enum.ConditionFormatTimePeriodOperatorEnum.last7Days)
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenDate(date: CFTimePeriodOperator): ConditionalFormatHighlightRuleBuilder {
        const ruleConfig = this._ruleConfig as ITimePeriodHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.timePeriod;
        ruleConfig.operator = date;
        return this;
    }

    /**
     * Sets the conditional format rule to trigger when that the given formula evaluates to `true`.
     * @param {string} formulaString - A custom formula that evaluates to true if the input is valid. formulaString start with '='.
     * @returns {ConditionalFormatHighlightRuleBuilder} This builder for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with values greater than 10 in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenFormulaSatisfied('=A1>10')
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenFormulaSatisfied(formulaString: string): ConditionalFormatHighlightRuleBuilder {
        const ruleConfig = this._ruleConfig as IFormulaHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.formula;
        ruleConfig.value = formulaString;
        return this;
    }

    /**
     * Sets the conditional format rule to trigger when a number falls between, or is either of, two specified values.
     * @param {number} start - The lowest acceptable value.
     * @param {number} end - The highest acceptable value.
     * @returns {ConditionalFormatHighlightRuleBuilder} This builder for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with values between 10 and 20 in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenNumberBetween(10, 20)
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenNumberBetween(start: number, end: number): ConditionalFormatHighlightRuleBuilder {
        const min = Math.min(start, end);
        const max = Math.max(start, end);
        const ruleConfig = this._ruleConfig as INumberHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.number;
        ruleConfig.value = [min, max];
        ruleConfig.operator = CFNumberOperator.between;
        return this;
    }

    /**
     * Sets the conditional format rule to trigger when a number is equal to the given value.
     * @param {number} value - The sole acceptable value.
     * @returns {ConditionalFormatHighlightRuleBuilder} This builder for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with values equal to 10 in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenNumberEqualTo(10)
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenNumberEqualTo(value: number): ConditionalFormatHighlightRuleBuilder {
        const ruleConfig = this._ruleConfig as INumberHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.number;
        ruleConfig.value = value;
        ruleConfig.operator = CFNumberOperator.equal;
        return this;
    }

    /**
     * Sets the conditional format rule to trigger when a number is greater than the given value.
     * @param {number} value - The highest unacceptable value.
     * @returns {ConditionalFormatHighlightRuleBuilder} This builder for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with values greater than 10 in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenNumberGreaterThan(10)
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenNumberGreaterThan(value: number): ConditionalFormatHighlightRuleBuilder {
        const ruleConfig = this._ruleConfig as INumberHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.number;
        ruleConfig.value = value;
        ruleConfig.operator = CFNumberOperator.greaterThan;
        return this;
    }

    /**
     * Sets the conditional format rule to trigger when a number is greater than or equal to the given value.
     * @param {number} value - The lowest acceptable value.
     * @returns {ConditionalFormatHighlightRuleBuilder} This builder for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with values greater than or equal to 10 in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenNumberGreaterThanOrEqualTo(10)
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenNumberGreaterThanOrEqualTo(value: number): ConditionalFormatHighlightRuleBuilder {
        const ruleConfig = this._ruleConfig as INumberHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.number;
        ruleConfig.value = value;
        ruleConfig.operator = CFNumberOperator.greaterThanOrEqual;
        return this;
    }

    /**
     * Sets the conditional conditional format rule to trigger when a number less than the given value.
     * @param {number} value - The lowest unacceptable value.
     * @returns {ConditionalFormatHighlightRuleBuilder} This builder for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with values less than 10 in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenNumberLessThan(10)
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenNumberLessThan(value: number): ConditionalFormatHighlightRuleBuilder {
        const ruleConfig = this._ruleConfig as INumberHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.number;
        ruleConfig.value = value;
        ruleConfig.operator = CFNumberOperator.lessThan;
        return this;
    }

    /**
     * Sets the conditional format rule to trigger when a number less than or equal to the given value.
     * @param {number} value - The highest acceptable value.
     * @returns {ConditionalFormatHighlightRuleBuilder} This builder for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with values less than or equal to 10 in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenNumberLessThanOrEqualTo(10)
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenNumberLessThanOrEqualTo(value: number): ConditionalFormatHighlightRuleBuilder {
        const ruleConfig = this._ruleConfig as INumberHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.number;
        ruleConfig.value = value;
        ruleConfig.operator = CFNumberOperator.lessThanOrEqual;
        return this;
    }

    /**
     * Sets the conditional format rule to trigger when a number does not fall between, and is neither of, two specified values.
     * @param {number} start - The lowest unacceptable value.
     * @param {number} end - The highest unacceptable value.
     * @returns {ConditionalFormatHighlightRuleBuilder} This builder for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with values not between 10 and 20 in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenNumberNotBetween(10, 20)
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenNumberNotBetween(start: number, end: number): ConditionalFormatHighlightRuleBuilder {
        const min = Math.min(start, end);
        const max = Math.max(start, end);
        const ruleConfig = this._ruleConfig as INumberHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.number;
        ruleConfig.value = [min, max];
        ruleConfig.operator = CFNumberOperator.notBetween;
        return this;
    }

    /**
     * Sets the conditional format rule to trigger when a number is not equal to the given value.
     * @param {number} value - The sole unacceptable value.
     * @returns {ConditionalFormatHighlightRuleBuilder} This builder for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with values not equal to 10 in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenNumberNotEqualTo(10)
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenNumberNotEqualTo(value: number): ConditionalFormatHighlightRuleBuilder {
        const ruleConfig = this._ruleConfig as INumberHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.number;
        ruleConfig.value = value;
        ruleConfig.operator = CFNumberOperator.notEqual;
        return this;
    }

    /**
     * Sets the conditional format rule to trigger when that the input contains the given value.
     * @param {string} text - The value that the input must contain.
     * @returns {ConditionalFormatHighlightRuleBuilder} This builder for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with text containing 'apple' in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenTextContains('apple')
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenTextContains(text: string): ConditionalFormatHighlightRuleBuilder {
        const ruleConfig = this._ruleConfig as ITextHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.text;
        ruleConfig.value = text;
        ruleConfig.operator = CFTextOperator.containsText;
        return this;
    }

    /**
     * Sets the conditional format rule to trigger when that the input does not contain the given value.
     * @param {string} text - The value that the input must not contain.
     * @returns {ConditionalFormatHighlightRuleBuilder} This builder for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with text not containing 'apple' in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenTextDoesNotContain('apple')
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenTextDoesNotContain(text: string): ConditionalFormatHighlightRuleBuilder {
        const ruleConfig = this._ruleConfig as ITextHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.text;
        ruleConfig.value = text;
        ruleConfig.operator = CFTextOperator.notContainsText;
        return this;
    }

    /**
     * Sets the conditional format rule to trigger when that the input ends with the given value.
     * @param {string} text - Text to compare against the end of the string.
     * @returns {ConditionalFormatHighlightRuleBuilder} This builder for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with text ending with '.ai' in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenTextEndsWith('.ai')
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenTextEndsWith(text: string): ConditionalFormatHighlightRuleBuilder {
        const ruleConfig = this._ruleConfig as ITextHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.text;
        ruleConfig.value = text;
        ruleConfig.operator = CFTextOperator.endsWith;
        return this;
    }

    /**
     * Sets the conditional format rule to trigger when that the input is equal to the given value.
     * @param {string} text - The sole acceptable value.
     * @returns {ConditionalFormatHighlightRuleBuilder} This builder for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with text equal to 'apple' in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenTextEqualTo('apple')
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenTextEqualTo(text: string): ConditionalFormatHighlightRuleBuilder {
        const ruleConfig = this._ruleConfig as ITextHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.text;
        ruleConfig.value = text;
        ruleConfig.operator = CFTextOperator.equal;
        return this;
    }

    /**
     * Sets the conditional format rule to trigger when that the input starts with the given value.
     * @param {string} text - Text to compare against the beginning of the string.
     * @returns {ConditionalFormatHighlightRuleBuilder} This builder for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with text starting with 'https://' in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenTextStartsWith('https://')
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenTextStartsWith(text: string): ConditionalFormatHighlightRuleBuilder {
        const ruleConfig = this._ruleConfig as ITextHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.text;
        ruleConfig.value = text;
        ruleConfig.operator = CFTextOperator.beginsWith;
        return this;
    }
}

class ConditionalFormatDataBarRuleBuilder extends ConditionalFormatRuleBaseBuilder {
    /**
     * Deep clone a current builder.
     * @returns {ConditionalFormatDataBarRuleBuilder} A new instance of the builder with the same settings as the original.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that adds a data bar to cells with values between -100 and 100 in the range A1:D10.
     * // positive values are green and negative values are red.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const builder = fWorksheet.newConditionalFormattingRule()
     *   .setDataBar({
     *     min: { type: 'num', value: -100 },
     *     max: { type: 'num', value: 100 },
     *     positiveColor: '#00FF00',
     *     nativeColor: '#FF0000',
     *     isShowValue: true
     *   })
     *   .setRanges([fRange.getRange()]);
     * fWorksheet.addConditionalFormattingRule(builder.build());
     *
     * // Copy the rule and apply it to a new range.
     * const newRange = fWorksheet.getRange('F1:F10');
     * const newBuilder = builder.copy()
     *   .setRanges([newRange.getRange()]);
     * fWorksheet.addConditionalFormattingRule(newBuilder.build());
     * ```
     */
    override copy(): ConditionalFormatDataBarRuleBuilder {
        const newRule = Tools.deepClone(this._rule);
        if (newRule.cfId) {
            newRule.cfId = createCfId();
        }
        return new ConditionalFormatDataBarRuleBuilder(newRule);
    }

    /**
     * Set data bar rule.
     * @param {{
     *         min: IValueConfig;
     *         max: IValueConfig;
     *         isGradient?: boolean;
     *         positiveColor: string;
     *         nativeColor: string;
     *         isShowValue?: boolean;
     *     }} config - The data bar rule settings.
     * @param {IValueConfig} config.min - The minimum value for the data bar.
     * @param {IValueConfig} config.max - The maximum value for the data bar.
     * @param {boolean} [config.isGradient] - Whether the data bar is gradient.
     * @param {string} config.positiveColor - The color for positive values.
     * @param {string} config.nativeColor - The color for negative values.
     * @param {boolean} [config.isShowValue] - Whether to show the value in the cell.
     * @returns {ConditionalFormatDataBarRuleBuilder} This builder for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that adds a data bar to cells with values between -100 and 100 in the range A1:D10.
     * // positive values are green and negative values are red.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .setDataBar({
     *     min: { type: 'num', value: -100 },
     *     max: { type: 'num', value: 100 },
     *     positiveColor: '#00FF00',
     *     nativeColor: '#FF0000',
     *     isShowValue: true
     *   })
     *  .setRanges([fRange.getRange()])
     * .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    setDataBar(config: {
        min: IValueConfig;
        max: IValueConfig;
        isGradient?: boolean;
        positiveColor: string;
        nativeColor: string;
        isShowValue?: boolean;
    }): ConditionalFormatDataBarRuleBuilder {
        const ruleConfig = this._ruleConfig as IDataBar;
        ruleConfig.type = CFRuleType.dataBar;
        ruleConfig.isShowValue = !!config.isShowValue;
        ruleConfig.config = {
            min: config.min,
            max: config.max,
            positiveColor: config.positiveColor,
            nativeColor: config.nativeColor,
            isGradient: !!config.isGradient,
        };
        return this;
    }
}

class ConditionalFormatColorScaleRuleBuilder extends ConditionalFormatRuleBaseBuilder {
    /**
     * Deep clone a current builder.
     * @returns {ConditionalFormatColorScaleRuleBuilder} A new instance of the builder with the same settings as the original.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that adds a color scale to cells with values between 0 and 100 in the range A1:D10.
     * // The color scale is green for 0, yellow for 50, and red for 100.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const builder = fWorksheet.newConditionalFormattingRule()
     *   .setColorScale([
     *     { index: 0, color: '#00FF00', value: { type: 'num', value: 0 } },
     *     { index: 1, color: '#FFFF00', value: { type: 'num', value: 50 } },
     *     { index: 2, color: '#FF0000', value: { type: 'num', value: 100 } }
     *   ])
     *   .setRanges([fRange.getRange()]);
     * fWorksheet.addConditionalFormattingRule(builder.build());
     *
     * // Copy the rule and apply it to a new range.
     * const newRange = fWorksheet.getRange('F1:F10');
     * const newBuilder = builder.copy()
     *   .setRanges([newRange.getRange()]);
     * fWorksheet.addConditionalFormattingRule(newBuilder.build());
     * ```
     */
    override copy(): ConditionalFormatColorScaleRuleBuilder {
        const newRule = Tools.deepClone(this._rule);
        if (newRule.cfId) {
            newRule.cfId = createCfId();
        }
        return new ConditionalFormatColorScaleRuleBuilder(newRule);
    }

    /**
     * Set color scale rule.
     * @param {{ index: number; color: string; value: IValueConfig }[]} config - The color scale rule settings.
     * @param {number} config.index - The index of the color scale configuration.
     * @param {string} config.color - The color corresponding to the index of the color scale configuration.
     * @param {IValueConfig} config.value - The condition value corresponding to the index of the color scale configuration.
     * @returns {ConditionalFormatColorScaleRuleBuilder} This builder for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that adds a color scale to cells with values between 0 and 100 in the range A1:D10.
     * // The color scale is green for 0, yellow for 50, and red for 100.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .setColorScale([
     *     { index: 0, color: '#00FF00', value: { type: 'num', value: 0 } },
     *     { index: 1, color: '#FFFF00', value: { type: 'num', value: 50 } },
     *     { index: 2, color: '#FF0000', value: { type: 'num', value: 100 } }
     *   ])
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    setColorScale(config: IColorScale['config']): ConditionalFormatColorScaleRuleBuilder {
        const ruleConfig = this._ruleConfig as IColorScale;
        ruleConfig.type = CFRuleType.colorScale;
        ruleConfig.config = config;
        return this;
    }
}

class ConditionalFormatIconSetRuleBuilder extends ConditionalFormatRuleBaseBuilder {
    /**
     * Deep clone a current builder.
     * @returns {ConditionalFormatIconSetRuleBuilder} A new instance of the builder with the same settings as the original.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a 3-arrow icon set conditional formatting rule in the range A1:D10.
     * // The first arrow is green for values greater than 20.
     * // The second arrow is yellow for values greater than 10.
     * // The third arrow is red for values less than or equal to 10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const builder = fWorksheet.newConditionalFormattingRule()
     *   .setIconSet({
     *     iconConfigs: [
     *       { iconType: '3Arrows', iconId: '0', operator: univerAPI.Enum.ConditionFormatNumberOperatorEnum.greaterThan, value: { type: 'num', value: 20 } },
     *       { iconType: '3Arrows', iconId: '1', operator: univerAPI.Enum.ConditionFormatNumberOperatorEnum.greaterThan, value: { type: 'num', value: 10 } },
     *       { iconType: '3Arrows', iconId: '2', operator: univerAPI.Enum.ConditionFormatNumberOperatorEnum.lessThanOrEqual, value: { type: 'num', value: 10 } }
     *     ],
     *     isShowValue: true,
     *   })
     *   .setRanges([fRange.getRange()]);
     * fWorksheet.addConditionalFormattingRule(builder.build());
     *
     * // Copy the rule and apply it to a new range.
     * const newRange = fWorksheet.getRange('F1:F10');
     * const newBuilder = builder.copy()
     *   .setRanges([newRange.getRange()]);
     * fWorksheet.addConditionalFormattingRule(newBuilder.build());
     * ```
     */
    override copy(): ConditionalFormatIconSetRuleBuilder {
        const newRule = Tools.deepClone(this._rule);
        if (newRule.cfId) {
            newRule.cfId = createCfId();
        }
        return new ConditionalFormatIconSetRuleBuilder(newRule);
    }

    /**
     * Set up icon set conditional formatting rule.
     * @param {{ iconConfigs: IIconSet['config'], isShowValue: boolean }} config - The icon set conditional formatting rule settings.
     * @param {IIconSet['config']} config.iconConfigs - The icon configurations. iconId property is a string indexing of a group icons.
     * @param {boolean} config.isShowValue - Whether to show the value in the cell.
     * @returns {ConditionalFormatIconSetRuleBuilder} This builder for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a 3-arrow icon set conditional formatting rule in the range A1:D10.
     * // The first arrow is green for values greater than 20.
     * // The second arrow is yellow for values greater than 10.
     * // The third arrow is red for values less than or equal to 10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const builder = fWorksheet.newConditionalFormattingRule();
     * console.log(builder.getIconMap()); // icons key-value map
     * const rule = builder.setIconSet({
     *     iconConfigs: [
     *       { iconType: '3Arrows', iconId: '0', operator: univerAPI.Enum.ConditionFormatNumberOperatorEnum.greaterThan, value: { type: 'num', value: 20 } },
     *       { iconType: '3Arrows', iconId: '1', operator: univerAPI.Enum.ConditionFormatNumberOperatorEnum.greaterThan, value: { type: 'num', value: 10 } },
     *       { iconType: '3Arrows', iconId: '2', operator: univerAPI.Enum.ConditionFormatNumberOperatorEnum.lessThanOrEqual, value: { type: 'num', value: 10 } }
     *     ],
     *     isShowValue: true,
     *   })
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    setIconSet(config: { iconConfigs: IIconSet['config']; isShowValue: boolean }): ConditionalFormatIconSetRuleBuilder {
        const ruleConfig = this._ruleConfig as IIconSet;
        ruleConfig.type = CFRuleType.iconSet;
        ruleConfig.config = config.iconConfigs;
        ruleConfig.isShowValue = config.isShowValue;
        return this;
    }
}

/**
 * @hideconstructor
 */
export class FConditionalFormattingBuilder {
    constructor(private _initConfig: { ranges?: IRange[] } = {}) {

    }

    /**
     * Constructs a conditional format rule from the settings applied to the builder.
     * @returns {IConditionFormattingRule} The conditional format rule.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with values greater than 10 in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenNumberGreaterThan(10)
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    build(): IConditionFormattingRule {
        return new ConditionalFormatRuleBaseBuilder(this._initConfig).build();
    }

    /**
     * Set average rule.
     * @param {IAverageHighlightCell['operator']} operator - The operator to use for the average rule.
     * @returns {ConditionalFormatHighlightRuleBuilder} The conditional format highlight rule builder.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with greater than average values in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .setAverage(univerAPI.Enum.ConditionFormatNumberOperatorEnum.greaterThan)
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    setAverage(operator: IAverageHighlightCell['operator']): ConditionalFormatHighlightRuleBuilder {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).setAverage(operator);
    }

    /**
     * Set unique values rule.
     * @returns {ConditionalFormatHighlightRuleBuilder} The conditional format highlight rule builder.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with unique values in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .setUniqueValues()
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    setUniqueValues(): ConditionalFormatHighlightRuleBuilder {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).setUniqueValues();
    }

    /**
     * Set duplicate values rule.
     * @returns {ConditionalFormatHighlightRuleBuilder} The conditional format highlight rule builder.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with duplicate values in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .setDuplicateValues()
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    setDuplicateValues(): ConditionalFormatHighlightRuleBuilder {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).setDuplicateValues();
    }

    /**
     * Set rank rule.
     * @param {{ isBottom: boolean, isPercent: boolean, value: number }} config - The rank rule settings.
     * @param {boolean} config.isBottom - Whether to highlight the bottom rank.
     * @param {boolean} config.isPercent - Whether to use a percentage rank.
     * @param {number} config.value - The rank value.
     * @returns {ConditionalFormatHighlightRuleBuilder} The conditional format highlight rule builder.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights the bottom 10% of values in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .setRank({ isBottom: true, isPercent: true, value: 10 })
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    setRank(config: { isBottom: boolean; isPercent: boolean; value: number }): ConditionalFormatHighlightRuleBuilder {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).setRank(config);
    }

    /**
     * Get the icon set mapping dictionary.
     * @returns {Record<string, string[]>} The icon set mapping dictionary.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * console.log(fWorksheet.newConditionalFormattingRule().getIconMap()); // icons key-value map
     * ```
     */
    getIconMap(): Record<string, string[]> {
        return iconMap;
    }

    /**
     * Set up icon set conditional formatting rule.
     * @param {{ iconConfigs: IIconSet['config'], isShowValue: boolean }} config - The icon set conditional formatting rule settings.
     * @param {IIconSet['config']} config.iconConfigs - The icon configurations. iconId property is a string indexing of a group icons.
     * @param {boolean} config.isShowValue - Whether to show the value in the cell.
     * @returns {ConditionalFormatIconSetRuleBuilder} The conditional format icon set rule builder.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a 3-arrow icon set conditional formatting rule in the range A1:D10.
     * // The first arrow is green for values greater than 20.
     * // The second arrow is yellow for values greater than 10.
     * // The third arrow is red for values less than or equal to 10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const builder = fWorksheet.newConditionalFormattingRule();
     * console.log(builder.getIconMap()); // icons key-value map
     * const rule = builder.setIconSet({
     *     iconConfigs: [
     *       { iconType: '3Arrows', iconId: '0', operator: univerAPI.Enum.ConditionFormatNumberOperatorEnum.greaterThan, value: { type: 'num', value: 20 } },
     *       { iconType: '3Arrows', iconId: '1', operator: univerAPI.Enum.ConditionFormatNumberOperatorEnum.greaterThan, value: { type: 'num', value: 10 } },
     *       { iconType: '3Arrows', iconId: '2', operator: univerAPI.Enum.ConditionFormatNumberOperatorEnum.lessThanOrEqual, value: { type: 'num', value: 10 } }
     *     ],
     *     isShowValue: true,
     *   })
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    setIconSet(config: { iconConfigs: IIconSet['config']; isShowValue: boolean }): ConditionalFormatIconSetRuleBuilder {
        return new ConditionalFormatIconSetRuleBuilder(this._initConfig).setIconSet(config);
    }

    /**
     * Set color scale rule.
     * @param {{ index: number; color: string; value: IValueConfig }[]} config - The color scale rule settings.
     * @param {number} config.index - The index of the color scale.
     * @param {string} config.color - The color for the color scale.
     * @param {IValueConfig} config.value - The value for the color scale.
     * @returns {ConditionalFormatColorScaleRuleBuilder} The conditional format color scale rule builder.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that adds a color scale to cells with values between 0 and 100 in the range A1:D10.
     * // The color scale is green for 0, yellow for 50, and red for 100.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .setColorScale([
     *     { index: 0, color: '#00FF00', value: { type: 'num', value: 0 } },
     *     { index: 1, color: '#FFFF00', value: { type: 'num', value: 50 } },
     *     { index: 2, color: '#FF0000', value: { type: 'num', value: 100 } }
     *   ])
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    setColorScale(config: IColorScale['config']): ConditionalFormatColorScaleRuleBuilder {
        return new ConditionalFormatColorScaleRuleBuilder(this._initConfig).setColorScale(config);
    }

    /**
     * Set data bar rule.
     * @param {{
     *         min: IValueConfig;
     *         max: IValueConfig;
     *         isGradient?: boolean;
     *         positiveColor: string;
     *         nativeColor: string;
     *         isShowValue?: boolean;
     *     }} config - The data bar rule settings.
     * @param {IValueConfig} config.min - The minimum value for the data bar.
     * @param {IValueConfig} config.max - The maximum value for the data bar.
     * @param {boolean} [config.isGradient] - Whether the data bar is gradient.
     * @param {string} config.positiveColor - The color for positive values.
     * @param {string} config.nativeColor - The color for negative values.
     * @param {boolean} [config.isShowValue] - Whether to show the value in the cell.
     * @returns {ConditionalFormatDataBarRuleBuilder} The conditional format data bar rule builder.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that adds a data bar to cells with values between -100 and 100 in the range A1:D10.
     * // positive values are green and negative values are red.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .setDataBar({
     *     min: { type: 'num', value: -100 },
     *     max: { type: 'num', value: 100 },
     *     positiveColor: '#00FF00',
     *     nativeColor: '#FF0000',
     *     isShowValue: true
     *   })
     *  .setRanges([fRange.getRange()])
     * .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    setDataBar(config: {
        min: IValueConfig;
        max: IValueConfig;
        isGradient?: boolean;
        positiveColor: string;
        nativeColor: string;
        isShowValue?: boolean;
    }): ConditionalFormatDataBarRuleBuilder {
        return new ConditionalFormatDataBarRuleBuilder(this._initConfig).setDataBar(config);
    }

    /**
     * Sets the background color for the conditional format rule's format.
     * @param {string} [color] - The background color to set. If not provided, the background color is removed.
     * @returns {ConditionalFormatHighlightRuleBuilder} The conditional format highlight rule builder.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with no content in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenCellEmpty()
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    setBackground(color?: string): ConditionalFormatHighlightRuleBuilder {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).setBackground(color);
    }

    /**
     * Sets text bolding for the conditional format rule's format.
     * @param {boolean} isBold - Whether to bold the text.
     * @returns {ConditionalFormatHighlightRuleBuilder} The conditional format highlight rule builder.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that bolds the text for cells with not empty content in the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenCellNotEmpty()
     *   .setBold(true)
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    setBold(isBold: boolean): ConditionalFormatHighlightRuleBuilder {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).setBold(isBold);
    }

    /**
     * Sets the font color for the conditional format rule's format.
     * @param {string} [color] - The font color to set. If not provided, the font color is removed.
     * @returns {ConditionalFormatHighlightRuleBuilder} The conditional format highlight rule builder.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that changes the font color to red for cells with not empty content in the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenCellNotEmpty()
     *   .setFontColor('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    setFontColor(color?: string): ConditionalFormatHighlightRuleBuilder {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).setFontColor(color);
    }

    /**
     * Sets text italics for the conditional format rule's format.
     * @param {boolean} isItalic - Whether to italicize the text.
     * @returns {ConditionalFormatHighlightRuleBuilder} The conditional format highlight rule builder.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that italicizes the text for cells with not empty content in the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenCellNotEmpty()
     *   .setItalic(true)
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    setItalic(isItalic: boolean): ConditionalFormatHighlightRuleBuilder {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).setItalic(isItalic);
    }

    /**
     * Sets text strikethrough for the conditional format rule's format.
     * @param {boolean} isStrikethrough - Whether is strikethrough the text.
     * @returns {ConditionalFormatHighlightRuleBuilder} The conditional format highlight rule builder.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that set text strikethrough for cells with not empty content in the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenCellNotEmpty()
     *   .setStrikethrough(true)
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    setStrikethrough(isStrikethrough: boolean): ConditionalFormatHighlightRuleBuilder {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).setStrikethrough(isStrikethrough);
    }

    /**
     * Sets text underlining for the conditional format rule's format.
     * @param {boolean} isUnderline - Whether to underline the text.
     * @returns {ConditionalFormatHighlightRuleBuilder} The conditional format highlight rule builder.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that underlines the text for cells with not empty content in the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenCellNotEmpty()
     *   .setUnderline(true)
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    setUnderline(isUnderline: boolean): ConditionalFormatHighlightRuleBuilder {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).setUnderline(isUnderline);
    }

    /**
     * Sets the conditional format rule to trigger when the cell is empty.
     * @returns {ConditionalFormatHighlightRuleBuilder} The conditional format highlight rule builder.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with no content in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenCellEmpty()
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenCellEmpty(): ConditionalFormatHighlightRuleBuilder {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenCellEmpty();
    }

    /**
     * Sets the conditional format rule to trigger when the cell is not empty.
     * @returns {ConditionalFormatHighlightRuleBuilder} The conditional format highlight rule builder.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that changes the font color to red for cells with not empty content in the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenCellNotEmpty()
     *   .setFontColor('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenCellNotEmpty(): ConditionalFormatHighlightRuleBuilder {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenCellNotEmpty();
    }

    /**
     * Sets the conditional format rule to trigger when a time period is met.
     * @param {CFTimePeriodOperator} date - The time period to check for.
     * @returns {ConditionalFormatHighlightRuleBuilder} The conditional format highlight rule builder.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with dates in the last 7 days in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenDate(univerAPI.Enum.ConditionFormatTimePeriodOperatorEnum.last7Days)
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenDate(date: CFTimePeriodOperator): ConditionalFormatHighlightRuleBuilder {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenDate(date);
    }

    /**
     * Sets the conditional format rule to trigger when that the given formula evaluates to `true`.
     * @param {string} formulaString - A custom formula that evaluates to true if the input is valid. formulaString start with '='.
     * @returns {ConditionalFormatHighlightRuleBuilder} The conditional format highlight rule builder.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with values greater than 10 in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenFormulaSatisfied('=A1>10')
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenFormulaSatisfied(formulaString: string): ConditionalFormatHighlightRuleBuilder {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenFormulaSatisfied(formulaString);
    }

    /**
     * Sets the conditional format rule to trigger when a number falls between, or is either of, two specified values.
     * @param {number} start - The lowest acceptable value.
     * @param {number} end - The highest acceptable value.
     * @returns {ConditionalFormatHighlightRuleBuilder} The conditional format highlight rule builder.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with values between 10 and 20 in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenNumberBetween(10, 20)
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenNumberBetween(start: number, end: number): ConditionalFormatHighlightRuleBuilder {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenNumberBetween(start, end);
    }

    /**
     * Sets the conditional format rule to trigger when a number is equal to the given value.
     * @param {number} value - The sole acceptable value.
     * @returns {ConditionalFormatHighlightRuleBuilder} The conditional format highlight rule builder.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with values equal to 10 in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenNumberEqualTo(10)
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenNumberEqualTo(value: number): ConditionalFormatHighlightRuleBuilder {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenNumberEqualTo(value);
    }

    /**
     * Sets the conditional format rule to trigger when a number is greater than the given value.
     * @param {number} value - The highest unacceptable value.
     * @returns {ConditionalFormatHighlightRuleBuilder} The conditional format highlight rule builder.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with values greater than 10 in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenNumberGreaterThan(10)
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenNumberGreaterThan(value: number): ConditionalFormatHighlightRuleBuilder {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenNumberGreaterThan(value);
    }

    /**
     * Sets the conditional format rule to trigger when a number is greater than or equal to the given value.
     * @param {number} value - The lowest acceptable value.
     * @returns {ConditionalFormatHighlightRuleBuilder} The conditional format highlight rule builder.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with values greater than or equal to 10 in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenNumberGreaterThanOrEqualTo(10)
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenNumberGreaterThanOrEqualTo(value: number): ConditionalFormatHighlightRuleBuilder {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenNumberGreaterThanOrEqualTo(value);
    }

    /**
     * Sets the conditional conditional format rule to trigger when a number less than the given value.
     * @param {number} value - The lowest unacceptable value.
     * @returns {ConditionalFormatHighlightRuleBuilder} The conditional format highlight rule builder.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with values less than 10 in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenNumberLessThan(10)
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenNumberLessThan(value: number): ConditionalFormatHighlightRuleBuilder {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenNumberLessThan(value);
    }

    /**
     * Sets the conditional format rule to trigger when a number less than or equal to the given value.
     * @param {number} value - The highest acceptable value.
     * @returns {ConditionalFormatHighlightRuleBuilder} The conditional format highlight rule builder.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with values less than or equal to 10 in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenNumberLessThanOrEqualTo(10)
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenNumberLessThanOrEqualTo(value: number): ConditionalFormatHighlightRuleBuilder {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenNumberLessThanOrEqualTo(value);
    }

    /**
     * Sets the conditional format rule to trigger when a number does not fall between, and is neither of, two specified values.
     * @param {number} start - The lowest unacceptable value.
     * @param {number} end - The highest unacceptable value.
     * @returns {ConditionalFormatHighlightRuleBuilder} The conditional format highlight rule builder.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with values not between 10 and 20 in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenNumberNotBetween(10, 20)
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenNumberNotBetween(start: number, end: number): ConditionalFormatHighlightRuleBuilder {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenNumberNotBetween(start, end);
    }

    /**
     * Sets the conditional format rule to trigger when a number is not equal to the given value.
     * @param {number} value - The sole unacceptable value.
     * @returns {ConditionalFormatHighlightRuleBuilder} The conditional format highlight rule builder.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with values not equal to 10 in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenNumberNotEqualTo(10)
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenNumberNotEqualTo(value: number): ConditionalFormatHighlightRuleBuilder {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenNumberNotEqualTo(value);
    }

    /**
     * Sets the conditional format rule to trigger when that the input contains the given value.
     * @param {string} text - The value that the input must contain.
     * @returns {ConditionalFormatHighlightRuleBuilder} The conditional format highlight rule builder.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with text containing 'apple' in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenTextContains('apple')
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenTextContains(text: string): ConditionalFormatHighlightRuleBuilder {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenTextContains(text);
    }

    /**
     * Sets the conditional format rule to trigger when that the input does not contain the given value.
     * @param {string} text - The value that the input must not contain.
     * @returns {ConditionalFormatHighlightRuleBuilder} The conditional format highlight rule builder.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with text not containing 'apple' in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenTextDoesNotContain('apple')
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenTextDoesNotContain(text: string): ConditionalFormatHighlightRuleBuilder {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenTextDoesNotContain(text);
    }

    /**
     * Sets the conditional format rule to trigger when that the input ends with the given value.
     * @param {string} text - Text to compare against the end of the string.
     * @returns {ConditionalFormatHighlightRuleBuilder} The conditional format highlight rule builder.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with text ending with '.ai' in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenTextEndsWith('.ai')
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenTextEndsWith(text: string): ConditionalFormatHighlightRuleBuilder {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenTextEndsWith(text);
    }

    /**
     * Sets the conditional format rule to trigger when that the input is equal to the given value.
     * @param {string} text - The sole acceptable value.
     * @returns {ConditionalFormatHighlightRuleBuilder} The conditional format highlight rule builder.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with text equal to 'apple' in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenTextEqualTo('apple')
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenTextEqualTo(text: string): ConditionalFormatHighlightRuleBuilder {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenTextEqualTo(text);
    }

    /**
     * Sets the conditional format rule to trigger when that the input starts with the given value.
     * @param {string} text - Text to compare against the beginning of the string.
     * @returns {ConditionalFormatHighlightRuleBuilder} The conditional format highlight rule builder.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that highlights cells with text starting with 'https://' in red for the range A1:D10.
     * const fRange = fWorksheet.getRange('A1:D10');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenTextStartsWith('https://')
     *   .setBackground('#FF0000')
     *   .setRanges([fRange.getRange()])
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
     */
    whenTextStartsWith(text: string): ConditionalFormatHighlightRuleBuilder {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenTextStartsWith(text);
    }
}
