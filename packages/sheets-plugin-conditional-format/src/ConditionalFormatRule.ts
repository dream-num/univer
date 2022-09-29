import { IRangeData, Nullable } from '@univer/core';
import { ConditionalFormatRuleBuilder } from './ConditionalFormatRuleBuilder';
import { BooleanRule, GradientRule } from './IData/IConditionalFormatRule';

export class ConditionalFormatRule {
    private _ranges: IRangeData[];

    private _rule: BooleanRule | GradientRule;

    constructor(ranges: IRangeData[], rule: BooleanRule | GradientRule) {
        this._ranges = ranges;
        this._rule = rule;
    }

    /**
     * Returns a rule builder preset with this rule's settings.
     */
    copy(): ConditionalFormatRuleBuilder {
        return new ConditionalFormatRuleBuilder(this._ranges, this._rule);
    }

    /**
     * Retrieves the rule's BooleanCondition information if this rule uses boolean condition criteria. Otherwise returns null.
     */
    getBooleanCondition(): Nullable<BooleanRule> {
        if ('minpoint' in this._rule) return null;
        return this._rule;
    }

    /**
     * Retrieves the rule's GradientCondition information, if this rule uses gradient condition criteria. Otherwise returns null.
     */
    getGradientCondition(): Nullable<GradientRule> {
        if ('condition' in this._rule) return null;
        return this._rule;
    }

    /**
     * Retrieves the ranges to which this conditional format rule is applied.
     */
    getRanges(): IRangeData[] {
        return this._ranges;
    }
}
