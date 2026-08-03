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

import {
    AbsoluteRefType,
    AutoFillSeries,
    BaselineOffset,
    BooleanNumber,
    BorderStyleTypes,
    BorderType,
    ColorType,
    CommandType,
    CommonHideTypes,
    CopyPasteType,
    DataValidationErrorStyle,
    DataValidationOperator,
    DataValidationRenderMode,
    DataValidationStatus,
    DataValidationType,
    DeleteDirection,
    DeveloperMetadataVisibility,
    Dimension,
    Direction,
    HorizontalAlign,
    ImageSourceType,
    InterpolationPointType,
    LifecycleStages,
    LocaleType,
    MentionType,
    NumberUnitType,
    PresetListType,
    ProtectionType,
    RelativeDate,
    SheetTypes,
    SpacingRule,
    TextDecoration,
    TextDirection,
    ThemeColorType,
    UniverInstanceType,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';

/**
 * @hideconstructor
 */
export class FEnum {
    /**
     * @ignore
     */
    static _instance: FEnum | null;

    static get(): FEnum {
        if (this._instance) {
            return this._instance;
        }

        const instance = new FEnum();
        this._instance = instance;
        return instance;
    }

    /**
     * @ignore
     */
    static extend(source: any): void {
        Object.getOwnPropertyNames(source.prototype).forEach((name) => {
            if (name !== 'constructor') {
                // @ts-ignore
                this.prototype[name] = source.prototype[name];
            }
        });

        Object.getOwnPropertyNames(source).forEach((name) => {
            if (name !== 'prototype' && name !== 'name' && name !== 'length') {
                // @ts-ignore
                this[name] = source[name];
            }
        });
    }

    constructor() {
        for (const key in FEnum.prototype) {
            // @ts-ignore
            this[key] = FEnum.prototype[key];
        }
    }

    /**
     * Defines different types of absolute references
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.AbsoluteRefType);
     * ```
     */
    get AbsoluteRefType(): typeof AbsoluteRefType {
        return AbsoluteRefType;
    }

    /**
     * Defines different types of Univer instances
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.UniverInstanceType.UNIVER_SHEET);
     * ```
     */
    get UniverInstanceType(): typeof UniverInstanceType {
        return UniverInstanceType;
    }

    /**
     * Represents different stages in the lifecycle
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.LifecycleStages.Rendered);
     * ```
     */
    get LifecycleStages(): typeof LifecycleStages {
        return LifecycleStages;
    }

    /**
     * Different types of data validation
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.DataValidationType.LIST);
     * ```
     */
    get DataValidationType(): typeof DataValidationType {
        return DataValidationType;
    }

    /**
     * Different error display styles
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.DataValidationErrorStyle.WARNING);
     * ```
     */
    get DataValidationErrorStyle(): typeof DataValidationErrorStyle {
        return DataValidationErrorStyle;
    }

    /**
     * Different validation rendering modes
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.DataValidationRenderMode.TEXT);
     * ```
     */
    get DataValidationRenderMode(): typeof DataValidationRenderMode {
        return DataValidationRenderMode;
    }

    /**
     * Different validation operators
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.DataValidationOperator.BETWEEN);
     * ```
     */
    get DataValidationOperator(): typeof DataValidationOperator {
        return DataValidationOperator;
    }

    /**
     * Different validation states
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.DataValidationStatus.VALID);
     * ```
     */
    get DataValidationStatus(): typeof DataValidationStatus {
        return DataValidationStatus;
    }

    /**
     * Different types of commands
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.CommandType.COMMAND);
     * ```
     */
    get CommandType(): typeof CommandType {
        return CommandType;
    }

    /**
     * Different baseline offsets for text baseline positioning
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.BaselineOffset.SUPERSCRIPT);
     * ```
     */
    get BaselineOffset(): typeof BaselineOffset {
        return BaselineOffset;
    }

    /**
     * Boolean number representations
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.BooleanNumber.TRUE);
     * ```
     */
    get BooleanNumber(): typeof BooleanNumber {
        return BooleanNumber;
    }

    /**
     * Different horizontal text alignment options
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.HorizontalAlign.CENTER);
     * ```
     */
    get HorizontalAlign(): typeof HorizontalAlign {
        return HorizontalAlign;
    }

    /**
     * Paragraph line-height interpretation modes
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.SpacingRule.EXACT);
     * ```
     */
    get SpacingRule(): typeof SpacingRule {
        return SpacingRule;
    }

    /**
     * Units accepted by document lengths such as paragraph indentation and spacing
     *
     * Agent-facing rich-text helpers accept plain numbers as document points, so this enum is only needed when an
     * explicit alternative unit is required.
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.NumberUnitType.POINT);
     * ```
     */
    get NumberUnitType(): typeof NumberUnitType {
        return NumberUnitType;
    }

    /**
     * Preset ordered, unordered, and checklist styles used by rich-text list items
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.PresetListType.BULLET_LIST);
     * ```
     */
    get PresetListType(): typeof PresetListType {
        return PresetListType;
    }

    /**
     * Different text decoration styles
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.TextDecoration.DOUBLE);
     * ```
     */
    get TextDecoration(): typeof TextDecoration {
        return TextDecoration;
    }

    /**
     * Different text direction options
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.TextDirection.LEFT_TO_RIGHT);
     * ```
     */
    get TextDirection(): typeof TextDirection {
        return TextDirection;
    }

    /**
     * Different vertical text alignment options
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.VerticalAlign.MIDDLE);
     * ```
     */
    get VerticalAlign(): typeof VerticalAlign {
        return VerticalAlign;
    }

    /**
     * Different wrap strategy options
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.WrapStrategy.WRAP);
     * ```
     */
    get WrapStrategy(): typeof WrapStrategy {
        return WrapStrategy;
    }

    /**
     * Different border types
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.BorderType.OUTSIDE);
     * ```
     */
    get BorderType(): typeof BorderType {
        return BorderType;
    }

    /**
     * Different border style types
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.BorderStyleTypes.NONE);
     * ```
     */
    get BorderStyleTypes(): typeof BorderStyleTypes {
        return BorderStyleTypes;
    }

    /**
     * Auto fill series types
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.AutoFillSeries.ALTERNATE_SERIES);
     * ```
     */
    get AutoFillSeries(): typeof AutoFillSeries {
        return AutoFillSeries;
    }

    /**
     * Color types
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.ColorType.RGB);
     * ```
     */
    get ColorType(): typeof ColorType {
        return ColorType;
    }

    /**
     * Common hide types
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.CommonHideTypes.ON);
     * ```
     */
    get CommonHideTypes(): typeof CommonHideTypes {
        return CommonHideTypes;
    }

    /**
     * Copy paste types
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.CopyPasteType.PASTE_VALUES);
     * ```
     */
    get CopyPasteType(): typeof CopyPasteType {
        return CopyPasteType;
    }

    /**
     * Delete direction types
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.DeleteDirection.LEFT);
     * ```
     */
    get DeleteDirection(): typeof DeleteDirection {
        return DeleteDirection;
    }

    /**
     * Developer metadata visibility types
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.DeveloperMetadataVisibility.DOCUMENT);
     * ```
     */
    get DeveloperMetadataVisibility(): typeof DeveloperMetadataVisibility {
        return DeveloperMetadataVisibility;
    }

    /**
     * Dimension types
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.Dimension.ROWS);
     * ```
     */
    get Dimension(): typeof Dimension {
        return Dimension;
    }

    /**
     * Direction types
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.Direction.UP);
     * ```
     */
    get Direction(): typeof Direction {
        return Direction;
    }

    /**
     * Interpolation point types
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.InterpolationPointType.NUMBER);
     * ```
     */
    get InterpolationPointType(): typeof InterpolationPointType {
        return InterpolationPointType;
    }

    /**
     * Locale types
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.LocaleType.EN_US);
     * ```
     */
    get LocaleType(): typeof LocaleType {
        return LocaleType;
    }

    /**
     * Mention types
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.MentionType.PERSON);
     * ```
     */
    get MentionType(): typeof MentionType {
        return MentionType;
    }

    /**
     * Protection types
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.ProtectionType.RANGE);
     * ```
     */
    get ProtectionType(): typeof ProtectionType {
        return ProtectionType;
    }

    /**
     * Relative date types
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.RelativeDate.TODAY);
     * ```
     */
    get RelativeDate(): typeof RelativeDate {
        return RelativeDate;
    }

    /**
     * Sheet types
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.SheetTypes.GRID);
     * ```
     */
    get SheetTypes(): typeof SheetTypes {
        return SheetTypes;
    }

    /**
     * Theme color types
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.ThemeColorType.ACCENT1);
     * ```
     */
    get ThemeColorType(): typeof ThemeColorType {
        return ThemeColorType;
    }

    /**
     * Image source types
     *
     * @example
     * ```ts
     * console.log(univerAPI.Enum.ImageSourceType.URL);
     * ```
     */
    get ImageSourceType(): typeof ImageSourceType {
        return ImageSourceType;
    }
}
