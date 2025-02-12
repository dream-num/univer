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

export enum OperatorOrder {
    FIRST,
    SECOND,
}

/**
 * Extended custom filter operators.
 *
 * These operators are not defined in OOXML,
 * so when exporting these operators we need to fallback to `CustomFilterOperator` and
 * other possible filter types.
 */
export enum ExtendCustomFilterOperator {
    NONE = 'none',

    /** Fallback to `<customFilter val="123*" />` */
    STARTS_WITH = 'startsWith',
    /** Fallback to `<customFilter operator="notEqual" val="123*" />` */
    DOES_NOT_START_WITH = 'doesNotStartWith',

    /** Fallback to `<customFilter val="*123" />` */
    ENDS_WITH = 'endsWith',
    /** Fallback to `<customFilter operator="notEqual" val="*123" />` */
    DOES_NOT_END_WITH = 'doesNotEndWith',

    /** Fallback to `<customFilter val="*123*" />` */
    CONTAINS = 'contains',
    /** Fallback to `<customFilter operator="notEqual" val="*123*" />` */
    DOES_NOT_CONTAIN = 'doesNotContain',

    /**
     * Text equals. It is not same as CustomFilterOperator.EQUAL.
     *
     * When equals empty, it will be mapped to.
     *
     * <autoFilter>
     *   <filterColumn colId="0">
     *     <filters blank="1"/>
     *   </filterColumn>
     * </autoFilter>
     */
    EQUALS = 'equals',

    /** Fallback to `<customFilter operator="notEqual" val="" />` */
    NOT_EQUALS = 'notEquals',

    /**
     * Fallback to `<filter blank="1" />`.
     *
     * It can also fallback to `<customFilter val="" />`, when with another custom filter.
     */
    EMPTY = 'empty',

    /** Fallback to `<customFilter operator="notEqual" val=" " />` */
    NOT_EMPTY = 'notEmpty',

    /**
     * Falls back to the following XML:
     *
     * ```xml
     * <customFilters and="1">
     *     <customFilter operator="greaterThanOrEqual" val="123"/>
     *     <customFilter operator="lessThanOrEqual" val="456"/>
     * </customFilters>
     * ```
     *
     * Actually in Microsoft Excel, `NOT_BETWEEN` is still `BETWEEN`, as long as the two operators
     * are `greaterThanOrEqual` and `lessThanOrEqual`.
     */
    BETWEEN = 'between',

    /**
     * Falls back to the following XML:
     *
     * ```xml
     * <customFilters> <!-- no `and="1"` means `OR` -->
     *     <customFilter operator="lessThan" val="456"/>
     *     <customFilter operator="greaterThan" val="123"/>
     * </customFilters>
     * ```
     */
    NOT_BETWEEN = 'notBetween',

    CUSTOM = 'custom',
}
