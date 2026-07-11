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
import { describe, expect, it } from 'vitest';
import { FEnum } from '../f-enum';

describe('FEnum', () => {
    it('should expose the enum values used by facade commands, units, styles and validations', () => {
        FEnum._instance = null;

        const facadeEnum = FEnum.get();

        expect(facadeEnum).toBe(FEnum.get());

        expect(facadeEnum.AbsoluteRefType).toBe(AbsoluteRefType);
        expect(facadeEnum.UniverInstanceType).toBe(UniverInstanceType);
        expect(facadeEnum.LifecycleStages).toBe(LifecycleStages);
        expect(facadeEnum.DataValidationType).toBe(DataValidationType);
        expect(facadeEnum.DataValidationErrorStyle).toBe(DataValidationErrorStyle);
        expect(facadeEnum.DataValidationRenderMode).toBe(DataValidationRenderMode);
        expect(facadeEnum.DataValidationOperator).toBe(DataValidationOperator);
        expect(facadeEnum.DataValidationStatus).toBe(DataValidationStatus);
        expect(facadeEnum.CommandType).toBe(CommandType);
        expect(facadeEnum.BaselineOffset).toBe(BaselineOffset);
        expect(facadeEnum.BooleanNumber).toBe(BooleanNumber);
        expect(facadeEnum.HorizontalAlign).toBe(HorizontalAlign);
        expect(facadeEnum.SpacingRule).toBe(SpacingRule);
        expect(facadeEnum.NumberUnitType).toBe(NumberUnitType);
        expect(facadeEnum.PresetListType).toBe(PresetListType);
        expect(facadeEnum.TextDecoration).toBe(TextDecoration);
        expect(facadeEnum.TextDirection).toBe(TextDirection);
        expect(facadeEnum.VerticalAlign).toBe(VerticalAlign);
        expect(facadeEnum.WrapStrategy).toBe(WrapStrategy);
        expect(facadeEnum.BorderType).toBe(BorderType);
        expect(facadeEnum.BorderStyleTypes).toBe(BorderStyleTypes);
        expect(facadeEnum.AutoFillSeries).toBe(AutoFillSeries);
        expect(facadeEnum.ColorType).toBe(ColorType);
        expect(facadeEnum.CommonHideTypes).toBe(CommonHideTypes);
        expect(facadeEnum.CopyPasteType).toBe(CopyPasteType);
        expect(facadeEnum.DeleteDirection).toBe(DeleteDirection);
        expect(facadeEnum.DeveloperMetadataVisibility).toBe(DeveloperMetadataVisibility);
        expect(facadeEnum.Dimension).toBe(Dimension);
        expect(facadeEnum.Direction).toBe(Direction);
        expect(facadeEnum.InterpolationPointType).toBe(InterpolationPointType);
        expect(facadeEnum.LocaleType).toBe(LocaleType);
        expect(facadeEnum.MentionType).toBe(MentionType);
        expect(facadeEnum.ProtectionType).toBe(ProtectionType);
        expect(facadeEnum.RelativeDate).toBe(RelativeDate);
        expect(facadeEnum.SheetTypes).toBe(SheetTypes);
        expect(facadeEnum.ThemeColorType).toBe(ThemeColorType);
    });

    it('should let plugins extend enum facade instances and static metadata', () => {
        class EnumSource {
            static label = 'enum-source';

            extraEnum(this: { marker: string }) {
                return `${this.marker}:enum`;
            }
        }

        class ExtendedEnum extends FEnum {
            marker = 'extended';
        }

        ExtendedEnum.extend(EnumSource);

        const extendedEnum = new ExtendedEnum() as ExtendedEnum & { extraEnum(): string };

        expect(extendedEnum.extraEnum()).toBe('extended:enum');
        expect((ExtendedEnum as typeof ExtendedEnum & { label: string }).label).toBe('enum-source');
    });
});
