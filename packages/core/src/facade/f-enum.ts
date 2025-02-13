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

import { AutoFillSeries, BaselineOffset, BooleanNumber, BorderStyleTypes, BorderType, ColorType, CommandType, CommonHideTypes, CopyPasteType, DataValidationErrorStyle, DataValidationOperator, DataValidationRenderMode, DataValidationStatus, DataValidationType, DeleteDirection, DeveloperMetadataVisibility, Dimension, Direction, HorizontalAlign, InterpolationPointType, LifecycleStages, LocaleType, MentionType, ProtectionType, RelativeDate, SheetTypes, TextDecoration, TextDirection, ThemeColorType, UniverInstanceType, VerticalAlign } from '@univerjs/core';

/**
 * @hideconstructor
 */
export class FEnum {
    /**
     * @ignore
     */
    static _instance: FEnum | null;

    static get() {
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
     *  Defines different types of Univer instances
     */
    get UniverInstanceType() {
        return UniverInstanceType;
    }

    /**
     * Represents different stages in the lifecycle
     */
    get LifecycleStages() {
        return LifecycleStages;
    }

    /**
     * Different types of data validation
     */
    get DataValidationType() {
        return DataValidationType;
    }

    /**
     * Different error display styles
     */
    get DataValidationErrorStyle() {
        return DataValidationErrorStyle;
    }

    /**
     * Different validation rendering modes
     */
    get DataValidationRenderMode() {
        return DataValidationRenderMode;
    }

    /**
     * Different validation operators
     */
    get DataValidationOperator() {
        return DataValidationOperator;
    }

    /**
     * Different validation states
     */
    get DataValidationStatus() {
        return DataValidationStatus;
    }

    /**
     * Different types of commands
     */
    get CommandType() {
        return CommandType;
    }

    /**
     * Different baseline offsets for text baseline positioning
     */
    get BaselineOffset() {
        return BaselineOffset;
    }

    /**
     * Boolean number representations
     */
    get BooleanNumber() {
        return BooleanNumber;
    }

    /**
     * Different horizontal text alignment options
     */
    get HorizontalAlign() {
        return HorizontalAlign;
    }

    /**
     * Different text decoration styles
     */
    get TextDecoration() {
        return TextDecoration;
    }

    /**
     * Different text direction options
     */
    get TextDirection() {
        return TextDirection;
    }

    /**
     * Different vertical text alignment options
     */
    get VerticalAlign() {
        return VerticalAlign;
    }

    /**
     * Different border types
     */
    get BorderType() {
        return BorderType;
    }

    /**
     * Different border style types
     */
    get BorderStyleTypes() {
        return BorderStyleTypes;
    }

    /**
     * Auto fill series types
     */
    get AutoFillSeries() {
        return AutoFillSeries;
    }

    /**
     * Color types
     */
    get ColorType() {
        return ColorType;
    }

    /**
     * Common hide types
     */
    get CommonHideTypes() {
        return CommonHideTypes;
    }

    /**
     * Copy paste types
     */
    get CopyPasteType() {
        return CopyPasteType;
    }

    /**
     * Delete direction types
     */
    get DeleteDirection() {
        return DeleteDirection;
    }

    /**
     * Developer metadata visibility types
     */
    get DeveloperMetadataVisibility() {
        return DeveloperMetadataVisibility;
    }

    /**
     * Dimension types
     */
    get Dimension() {
        return Dimension;
    }

    /**
     * Direction types
     */
    get Direction() {
        return Direction;
    }

    /**
     * Interpolation point types
     */
    get InterpolationPointType() {
        return InterpolationPointType;
    }

    /**
     * Locale types
     */
    get LocaleType() {
        return LocaleType;
    }

    /**
     * Mention types
     */
    get MentionType() {
        return MentionType;
    }

    /**
     * Protection types
     */
    get ProtectionType() {
        return ProtectionType;
    }

    /**
     * Relative date types
     */
    get RelativeDate() {
        return RelativeDate;
    }

    /**
     * Sheet types
     */
    get SheetTypes() {
        return SheetTypes;
    }

    /**
     * Theme color types
     */
    get ThemeColorType() {
        return ThemeColorType;
    }
}
