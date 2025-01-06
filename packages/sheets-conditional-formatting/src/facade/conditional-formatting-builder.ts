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

/* eslint-disable ts/explicit-function-return-type */

import type { IRange } from '@univerjs/core';
import type { CFTimePeriodOperator, IAverageHighlightCell, IColorScale, IConditionalFormattingRuleConfig, IConditionFormattingRule, IDataBar, IDuplicateValuesHighlightCell, IFormulaHighlightCell, IIconSet, INumberHighlightCell, IRankHighlightCell, ITextHighlightCell, ITimePeriodHighlightCell, IUniqueValuesHighlightCell, IValueConfig } from '@univerjs/sheets-conditional-formatting';
import { BooleanNumber, ColorKit, Tools } from '@univerjs/core';
import { CFNumberOperator, CFRuleType, CFSubRuleType, CFTextOperator, CFValueType, createCfId, EMPTY_ICON_TYPE, iconMap } from '@univerjs/sheets-conditional-formatting';

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
                        { index: 0, color: new ColorKit('green').toRgbString(), value: { type: CFValueType.max } }],
                } as IColorScale;
            }
            case CFRuleType.dataBar: {
                return {
                    type, isShowValue: true,
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
                        operator: CFNumberOperator.greaterThanOrEqual, value: { type: CFValueType.min },
                        iconType: EMPTY_ICON_TYPE, iconId: '',
                    },
                    {
                        operator: CFNumberOperator.greaterThanOrEqual, value: { type: CFValueType.percentile, value: 0.5 },
                        iconType: EMPTY_ICON_TYPE, iconId: '',
                    },
                    {
                        operator: CFNumberOperator.lessThanOrEqual, value: { type: CFValueType.max },
                        iconType: EMPTY_ICON_TYPE, iconId: '',
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

    build() {
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
     * @returns {*}
     * @memberof ConditionalFormatRuleBuilder
     */
    copy() {
        return new ConditionalFormatRuleBaseBuilder(Tools.deepClone(this._rule));
    }

    /**
     * Gets the scope of the current conditional format
     * @returns {*}
     * @memberof ConditionalFormatRuleBuilder
     */
    getRanges() {
        return this._rule.ranges || [];
    }

    /**
     * Get the icon set mapping dictionary
     */
    getIconMap() {
        return iconMap;
    }

    /**
     * Create a conditional format ID.
     * @returns {*}
     * @memberof ConditionalFormatRuleBuilder
     */
    createCfId() {
        return createCfId();
    }

    /**
     * Sets the scope for conditional formatting
     * @param {IRange[]} ranges
     * @returns {*}
     * @memberof ConditionalFormatRuleBuilder
     */
    setRanges(ranges: IRange[]) {
        this._rule.ranges = ranges;
        return this;
    }
}

class ConditionalFormatHighlightRuleBuilder extends ConditionalFormatRuleBaseBuilder {
    constructor(initConfig: Partial<IConditionFormattingRule> = {}) {
        super(initConfig);
        this._ensureAttr(this._rule, ['rule', 'style']);
    }

    override copy(): ConditionalFormatHighlightRuleBuilder {
        return new ConditionalFormatHighlightRuleBuilder(Tools.deepClone(this._rule));
    }

    /**
     * Set average rule
     * @param {IAverageHighlightCell['operator']} operator
     * @memberof ConditionalFormatHighlightRuleBuilder
     */
    setAverage(operator: IAverageHighlightCell['operator']) {
        const ruleConfig = this._ruleConfig as IAverageHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.average;
        ruleConfig.operator = operator;
        return this;
    }

    /**
     * Set uniqueValues rule
     * @memberof ConditionalFormatHighlightRuleBuilder
     */
    setUniqueValues() {
        const ruleConfig = this._ruleConfig as IUniqueValuesHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.uniqueValues;
        return this;
    }

    /**
     * Set duplicateValues rule
     * @memberof ConditionalFormatHighlightRuleBuilder
     */
    setDuplicateValues() {
        const ruleConfig = this._ruleConfig as IDuplicateValuesHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.duplicateValues;
        return this;
    }

    /**
     * Set rank rule
     * @param {{ isBottom: boolean, isPercent: boolean, value: number }} config
     * @param config.isBottom
     * @param config.isPercent
     * @param config.value
     * @memberof ConditionalFormatHighlightRuleBuilder
     */
    setRank(config: { isBottom: boolean; isPercent: boolean; value: number }) {
        const ruleConfig = this._ruleConfig as IRankHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.rank;
        ruleConfig.isBottom = config.isBottom;
        ruleConfig.isPercent = config.isPercent;
        ruleConfig.value = config.value;
        return this;
    }

    /**
     * Sets the background color
     * @param {string} [color]
     * @returns {*}
     * @memberof ConditionalFormatRuleBuilder
     */
    setBackground(color?: string) {
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
     * Set Bold
     * @param {boolean} isBold
     * @returns {*}
     * @memberof ConditionalFormatRuleBuilder
     */
    setBold(isBold: boolean) {
        if (this._ruleConfig?.type === CFRuleType.highlightCell) {
            this._ensureAttr(this._ruleConfig, ['style']);

            this._ruleConfig.style.bl = isBold ? BooleanNumber.TRUE : BooleanNumber.FALSE;
        }
        return this;
    }

    /**
     * Sets the font color
     * @param {string} [color]
     * @returns {*}
     * @memberof ConditionalFormatRuleBuilder
     */
    setFontColor(color?: string) {
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
     * Set the text to italic
     * @param {boolean} isItalic
     * @returns {*}
     * @memberof ConditionalFormatRuleBuilder
     */
    setItalic(isItalic: boolean) {
        if (this._ruleConfig?.type === CFRuleType.highlightCell) {
            this._ensureAttr(this._ruleConfig, ['style']);
            this._ruleConfig.style.it = isItalic ? BooleanNumber.TRUE : BooleanNumber.FALSE;
        }
        return this;
    }

    /**
     * Set the strikethrough
     * @param {boolean} isStrikethrough
     * @returns {*}
     * @memberof ConditionalFormatRuleBuilder
     */
    setStrikethrough(isStrikethrough: boolean) {
        if (this._ruleConfig?.type === CFRuleType.highlightCell) {
            this._ensureAttr(this._ruleConfig, ['style', 'st']);
            this._ruleConfig.style.st!.s = isStrikethrough ? BooleanNumber.TRUE : BooleanNumber.FALSE;
        }
        return this;
    }

    /**
     * Set the underscore
     * @param {boolean} isUnderline
     * @returns {*}
     * @memberof ConditionalFormatRuleBuilder
     */
    setUnderline(isUnderline: boolean) {
        if (this._ruleConfig?.type === CFRuleType.highlightCell) {
            this._ensureAttr(this._ruleConfig, ['style', 'ul']);
            this._ruleConfig.style.ul!.s = isUnderline ? BooleanNumber.TRUE : BooleanNumber.FALSE;
        }
        return this;
    }

    /**
     * Sets the conditional formatting rule to fire when the cell is empty.
     */
    whenCellEmpty() {
        const ruleConfig = this._ruleConfig as ITextHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.text;
        ruleConfig.value = '';
        ruleConfig.operator = CFTextOperator.equal;
        return this;
    }

    /**
     * Sets the conditional formatting rule to fire when the cell is not empty
     * @returns {*}
     * @memberof ConditionalFormatRuleBuilder
     */
    whenCellNotEmpty() {
        const ruleConfig = this._ruleConfig as ITextHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.text;
        ruleConfig.value = '';
        ruleConfig.operator = CFTextOperator.notEqual;
        return this;
    }

    /**
     * Highlight when the date is in a time period, custom time is not supported.
     * @param {CFTimePeriodOperator} date
     * @returns {*}
     * @memberof ConditionalFormatRuleBuilder
     */
    whenDate(date: CFTimePeriodOperator) {
        const ruleConfig = this._ruleConfig as ITimePeriodHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.timePeriod;
        ruleConfig.operator = date;
        return this;
    }

    /**
     * Sets a conditional formatting rule to fire when a given formula evaluates to true.
     * @param {string} formulaString  formulaString start with' = '
     * @memberof ConditionalFormatRuleBuilder
     */
    whenFormulaSatisfied(formulaString: string) {
        const ruleConfig = this._ruleConfig as IFormulaHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.formula;
        ruleConfig.value = formulaString;
        return this;
    }

    /**
     * Sets the conditional formatting rule to fire when a number is between two specified values or equal to one of them.
     * @param {number} start
     * @param {number} end
     * @memberof ConditionalFormatRuleBuilder
     */
    whenNumberBetween(start: number, end: number) {
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
     * Sets the conditional formatting rule to fire when the number equals the given value
     * @param {number} value
     * @memberof ConditionalFormatRuleBuilder
     */
    whenNumberEqualTo(value: number) {
        const ruleConfig = this._ruleConfig as INumberHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.number;
        ruleConfig.value = value;
        ruleConfig.operator = CFNumberOperator.equal;
        return this;
    }

    /**
     * Sets the conditional formatting rule to fire when the number is greater than the given value
     * @param {number} value
     * @memberof ConditionalFormatRuleBuilder
     */
    whenNumberGreaterThan(value: number) {
        const ruleConfig = this._ruleConfig as INumberHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.number;
        ruleConfig.value = value;
        ruleConfig.operator = CFNumberOperator.greaterThan;
        return this;
    }

    /**
     * Sets a conditional formatting rule to fire when a number is greater than or equal to a given value.
     * @param {number} value
     * @memberof ConditionalFormatRuleBuilder
     */
    whenNumberGreaterThanOrEqualTo(value: number) {
        const ruleConfig = this._ruleConfig as INumberHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.number;
        ruleConfig.value = value;
        ruleConfig.operator = CFNumberOperator.greaterThanOrEqual;
        return this;
    }

    /**
     * Sets a conditional formatting rule to fire when the number is less than the given value.
     * @param {number} value
     * @memberof ConditionalFormatRuleBuilder
     */
    whenNumberLessThan(value: number) {
        const ruleConfig = this._ruleConfig as INumberHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.number;
        ruleConfig.value = value;
        ruleConfig.operator = CFNumberOperator.lessThan;
        return this;
    }

    /**
     * Sets the conditional formatting rule to fire when the value is less than or equal to the given value.
     * @param {number} value
     * @memberof ConditionalFormatRuleBuilder
     */
    whenNumberLessThanOrEqualTo(value: number) {
        const ruleConfig = this._ruleConfig as INumberHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.number;
        ruleConfig.value = value;
        ruleConfig.operator = CFNumberOperator.lessThanOrEqual;
        return this;
    }

    /**
     * Sets a conditional formatting rule to fire when a number is not between two specified values and is not equal to them.
     * @param {number} start
     * @param {number} end
     * @memberof ConditionalFormatRuleBuilder
     */
    whenNumberNotBetween(start: number, end: number) {
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
     * Sets the conditional formatting rule to fire when a number does not equal a given value.
     * @param value
     * @memberof ConditionalFormatRuleBuilder
     */
    whenNumberNotEqualTo(value: number) {
        const ruleConfig = this._ruleConfig as INumberHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.number;
        ruleConfig.value = value;
        ruleConfig.operator = CFNumberOperator.notEqual;
        return this;
    }

    /**
     * Sets the conditional formatting rule to fire when the input contains the given value.
     * @param {string} text
     * @memberof ConditionalFormatRuleBuilder
     */
    whenTextContains(text: string) {
        const ruleConfig = this._ruleConfig as ITextHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.text;
        ruleConfig.value = text;
        ruleConfig.operator = CFTextOperator.containsText;
        return this;
    }

    /**
     * Sets a conditional formatting rule to fire when the input does not contain the given value.
     * @param {string} text
     * @memberof ConditionalFormatRuleBuilder
     */
    whenTextDoesNotContain(text: string) {
        const ruleConfig = this._ruleConfig as ITextHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.text;
        ruleConfig.value = text;
        ruleConfig.operator = CFTextOperator.notContainsText;
        return this;
    }

    /**
     * Sets a conditional formatting rule to fire when input ends with a specified value.
     * @param {string} text
     * @memberof ConditionalFormatRuleBuilder
     */
    whenTextEndsWith(text: string) {
        const ruleConfig = this._ruleConfig as ITextHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.text;
        ruleConfig.value = text;
        ruleConfig.operator = CFTextOperator.endsWith;
        return this;
    }

    /**
     * Sets the conditional formatting rule to fire when the input equals the given value.
     * @param {string} text
     * @memberof ConditionalFormatRuleBuilder
     */
    whenTextEqualTo(text: string) {
        const ruleConfig = this._ruleConfig as ITextHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.text;
        ruleConfig.value = text;
        ruleConfig.operator = CFTextOperator.equal;
        return this;
    }

    /**
     * Sets the conditional formatting rule to fire when the input value begins with the given value.
     * @param {string} text
     * @memberof ConditionalFormatRuleBuilder
     */
    whenTextStartsWith(text: string) {
        const ruleConfig = this._ruleConfig as ITextHighlightCell;
        ruleConfig.type = CFRuleType.highlightCell;
        ruleConfig.subType = CFSubRuleType.text;
        ruleConfig.value = text;
        ruleConfig.operator = CFTextOperator.beginsWith;
        return this;
    }
}
class ConditionalFormatDataBarRuleBuilder extends ConditionalFormatRuleBaseBuilder {
    override copy(): ConditionalFormatDataBarRuleBuilder {
        return new ConditionalFormatDataBarRuleBuilder(Tools.deepClone(this._rule));
    }

    /**
     * Data bar settings
     * @param {{
     *         min: IValueConfig;
     *         max: IValueConfig;
     *         isGradient?: boolean;
     *         positiveColor: string;
     *         nativeColor: string;
     *         isShowValue?: boolean;
     *     }} config
     * @param config.min
     * @param config.max
     * @param config.isGradient
     * @param config.positiveColor
     * @param config.nativeColor
     * @param config.isShowValue
     * @memberof ConditionalFormatRuleBuilder
     */
    setDataBar(config: {
        min: IValueConfig;
        max: IValueConfig;
        isGradient?: boolean;
        positiveColor: string;
        nativeColor: string;
        isShowValue?: boolean;
    }) {
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
    override copy(): ConditionalFormatColorScaleRuleBuilder {
        return new ConditionalFormatColorScaleRuleBuilder(Tools.deepClone(this._rule));
    }

    /**
     * Color scale set
     * @param {{ index: number; color: string; value: IValueConfig }[]} config
     * @memberof ConditionalFormatRuleBuilder
     */
    setColorScale(config: IColorScale['config']) {
        const ruleConfig = this._ruleConfig as IColorScale;
        ruleConfig.type = CFRuleType.colorScale;
        ruleConfig.config = config;
        return this;
    }
}

class ConditionalFormatIconSetRuleBuilder extends ConditionalFormatRuleBaseBuilder {
    override copy(): ConditionalFormatIconSetRuleBuilder {
        return new ConditionalFormatIconSetRuleBuilder(Tools.deepClone(this._rule));
    }

    /**
     *
     * Icon Set
     * @param {{ iconConfigs: IIconSet['config'], isShowValue: boolean }} config
     * @param config.iconConfigs
     * @param config.isShowValue
     * @memberof ConditionalFormatRuleBuilder
     */
    setIconSet(config: { iconConfigs: IIconSet['config']; isShowValue: boolean }) {
        const ruleConfig = this._ruleConfig as IIconSet;
        ruleConfig.type = CFRuleType.iconSet;
        ruleConfig.config = config.iconConfigs;
        ruleConfig.isShowValue = config.isShowValue;
        return this;
    }
}

export class FConditionalFormattingBuilder {
    constructor(private _initConfig: { ranges?: IRange[] } = {}) {

    }

    build() {
        return new ConditionalFormatRuleBaseBuilder(this._initConfig).build();
    }

    /**
     * Set average rule
     * @param {IAverageHighlightCell['operator']} operator
     * @memberof ConditionalFormatHighlightRuleBuilder
     */
    setAverage(operator: IAverageHighlightCell['operator']) {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).setAverage(operator);
    }

    /**
     * Set uniqueValues rule
     * @memberof ConditionalFormatHighlightRuleBuilder
     */
    setUniqueValues() {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).setUniqueValues();
    }

    /**
     * Set duplicateValues rule
     * @memberof ConditionalFormatHighlightRuleBuilder
     */
    setDuplicateValues() {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).setDuplicateValues();
    }

    /**
     * Set rank rule
     * @param {{ isBottom: boolean, isPercent: boolean, value: number }} config
     * @param config.isBottom
     * @param config.isPercent
     * @param config.value
     * @memberof ConditionalFormatHighlightRuleBuilder
     */
    setRank(config: { isBottom: boolean; isPercent: boolean; value: number }) {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).setRank(config);
    }

    /**
     *
     * Set iconSet rule
     * @param {{ iconConfigs: IIconSet['config'], isShowValue: boolean }} config
     * @param config.iconConfigs
     * @param config.isShowValue
     * @memberof ConditionalFormatRuleBuilder
     */
    setIconSet(config: { iconConfigs: IIconSet['config']; isShowValue: boolean }) {
        return new ConditionalFormatIconSetRuleBuilder(this._initConfig).setIconSet(config);
    }

    /**
     * Set colorScale rule
     * @param {{ index: number; color: string; value: IValueConfig }[]} config
     * @memberof ConditionalFormatRuleBuilder
     */
    setColorScale(config: IColorScale['config']) {
        return new ConditionalFormatColorScaleRuleBuilder(this._initConfig).setColorScale(config);
    }

    /**
     * Set dataBar rule
     * @param {{
     *         min: IValueConfig;
     *         max: IValueConfig;
     *         isGradient?: boolean;
     *         positiveColor: string;
     *         nativeColor: string;
     *         isShowValue?: boolean;
     *     }} config
     * @param config.min
     * @param config.max
     * @param config.isGradient
     * @param config.positiveColor
     * @param config.nativeColor
     * @param config.isShowValue
     * @memberof ConditionalFormatRuleBuilder
     */
    setDataBar(config: {
        min: IValueConfig;
        max: IValueConfig;
        isGradient?: boolean;
        positiveColor: string;
        nativeColor: string;
        isShowValue?: boolean;
    }) {
        return new ConditionalFormatDataBarRuleBuilder(this._initConfig).setDataBar(config);
    }

    /**
     * Sets the background color
     * @param {string} [color]
     * @returns {*}
     * @memberof ConditionalFormatRuleBuilder
     */
    setBackground(color?: string) {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).setBackground(color);
    }

    /**
     * Set Bold
     * @param {boolean} isBold
     * @returns {*}
     * @memberof ConditionalFormatRuleBuilder
     */
    setBold(isBold: boolean) {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).setBold(isBold);
    }

    /**
     * Sets the font color
     * @param {string} [color]
     * @returns {*}
     * @memberof ConditionalFormatRuleBuilder
     */
    setFontColor(color?: string) {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).setFontColor(color);
    }

    /**
     * Set the text to italic
     * @param {boolean} isItalic
     * @returns {*}
     * @memberof ConditionalFormatRuleBuilder
     */
    setItalic(isItalic: boolean) {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).setItalic(isItalic);
    }

    /**
     * Set the strikethrough
     * @param {boolean} isStrikethrough
     * @returns {*}
     * @memberof ConditionalFormatRuleBuilder
     */
    setStrikethrough(isStrikethrough: boolean) {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).setStrikethrough(isStrikethrough);
    }

    /**
     * Set the underscore
     * @param {boolean} isUnderline
     * @returns {*}
     * @memberof ConditionalFormatRuleBuilder
     */
    setUnderline(isUnderline: boolean) {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).setUnderline(isUnderline);
    }

    /**
     * Sets the conditional formatting rule to fire when the cell is empty.
     */
    whenCellEmpty() {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenCellEmpty();
    }

    /**
     * Sets the conditional formatting rule to fire when the cell is not empty
     * @returns {*}
     * @memberof ConditionalFormatRuleBuilder
     */
    whenCellNotEmpty() {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenCellNotEmpty();
    }

    /**
     * Highlight when the date is in a time period, custom time is not supported.
     * @param {CFTimePeriodOperator} date
     * @returns {*}
     * @memberof ConditionalFormatRuleBuilder
     */
    whenDate(date: CFTimePeriodOperator) {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenDate(date);
    }

    /**
     * Sets a conditional formatting rule to fire when a given formula evaluates to true.
     * @param {string} formulaString  formulaString start with' = '
     * @memberof ConditionalFormatRuleBuilder
     */
    whenFormulaSatisfied(formulaString: string) {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenFormulaSatisfied(formulaString);
    }

    /**
     * Sets the conditional formatting rule to fire when a number is between two specified values or equal to one of them.
     * @param {number} start
     * @param {number} end
     * @memberof ConditionalFormatRuleBuilder
     */
    whenNumberBetween(start: number, end: number) {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenNumberBetween(start, end);
    }

    /**
     * Sets the conditional formatting rule to fire when the number equals the given value
     * @param {number} value
     * @memberof ConditionalFormatRuleBuilder
     */
    whenNumberEqualTo(value: number) {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenNumberEqualTo(value);
    }

    /**
     * Sets the conditional formatting rule to fire when the number is greater than the given value
     * @param {number} value
     * @memberof ConditionalFormatRuleBuilder
     */
    whenNumberGreaterThan(value: number) {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenNumberGreaterThan(value);
    }

    /**
     * Sets a conditional formatting rule to fire when a number is greater than or equal to a given value.
     * @param {number} value
     * @memberof ConditionalFormatRuleBuilder
     */
    whenNumberGreaterThanOrEqualTo(value: number) {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenNumberGreaterThanOrEqualTo(value);
    }

    /**
     * Sets a conditional formatting rule to fire when the number is less than the given value.
     * @param {number} value
     * @memberof ConditionalFormatRuleBuilder
     */
    whenNumberLessThan(value: number) {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenNumberLessThan(value);
    }

    /**
     * Sets the conditional formatting rule to fire when the value is less than or equal to the given value.
     * @param {number} value
     * @memberof ConditionalFormatRuleBuilder
     */
    whenNumberLessThanOrEqualTo(value: number) {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenNumberLessThanOrEqualTo(value);
    }

    /**
     * Sets a conditional formatting rule to fire when a number is not between two specified values and is not equal to them.
     * @param {number} start
     * @param {number} end
     * @memberof ConditionalFormatRuleBuilder
     */
    whenNumberNotBetween(start: number, end: number) {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenNumberNotBetween(start, end);
    }

    /**
     * Sets the conditional formatting rule to fire when a number does not equal a given value.
     * @param value
     * @memberof ConditionalFormatRuleBuilder
     */
    whenNumberNotEqualTo(value: number) {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenNumberNotEqualTo(value);
    }

    /**
     * Sets the conditional formatting rule to fire when the input contains the given value.
     * @param {string} text
     * @memberof ConditionalFormatRuleBuilder
     */
    whenTextContains(text: string) {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenTextContains(text);
    }

    /**
     * Sets a conditional formatting rule to fire when the input does not contain the given value.
     * @param {string} text
     * @memberof ConditionalFormatRuleBuilder
     */
    whenTextDoesNotContain(text: string) {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenTextDoesNotContain(text);
    }

    /**
     * Sets a conditional formatting rule to fire when input ends with a specified value.
     * @param {string} text
     * @memberof ConditionalFormatRuleBuilder
     */
    whenTextEndsWith(text: string) {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenTextEndsWith(text);
    }

    /**
     * Sets the conditional formatting rule to fire when the input equals the given value.
     * @param {string} text
     * @memberof ConditionalFormatRuleBuilder
     */
    whenTextEqualTo(text: string) {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenTextEqualTo(text);
    }

    /**
     * Sets the conditional formatting rule to fire when the input value begins with the given value.
     * @param {string} text
     * @memberof ConditionalFormatRuleBuilder
     */
    whenTextStartsWith(text: string) {
        return new ConditionalFormatHighlightRuleBuilder(this._initConfig).whenTextStartsWith(text);
    }
}
