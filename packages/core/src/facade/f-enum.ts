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

import { UniverInstanceType } from '../common/unit';
import { CommandType } from '../services/command/command.service';
import { LifecycleStages } from '../services/lifecycle/lifecycle';
import { BaselineOffset, BooleanNumber, HorizontalAlign, TextDecoration, TextDirection, VerticalAlign } from '../types/enum';
import { DataValidationErrorStyle } from '../types/enum/data-validation-error-style';
import { DataValidationOperator } from '../types/enum/data-validation-operator';
import { DataValidationRenderMode } from '../types/enum/data-validation-render-mode';
import { DataValidationStatus } from '../types/enum/data-validation-status';
import { DataValidationType } from '../types/enum/data-validation-type';
import { FBase } from './f-base';

export class FEnum extends FBase {
    static _intance: FEnum | null;

    constructor() {
        super();
    }

    static get() {
        if (this._intance) {
            return this._intance;
        }

        const instance = new FEnum();
        this._intance = instance;
        return instance;
    }

    get UniverInstanceType() {
        return UniverInstanceType;
    }

    get LifecycleStages() {
        return LifecycleStages;
    }

    get DataValidationType() {
        return DataValidationType;
    }

    get DataValidationErrorStyle() {
        return DataValidationErrorStyle;
    }

    get DataValidationRenderMode() {
        return DataValidationRenderMode;
    }

    get DataValidationOperator() {
        return DataValidationOperator;
    }

    get DataValidationStatus() {
        return DataValidationStatus;
    }

    get CommandType() {
        return CommandType;
    }

    get BaselineOffset() {
        return BaselineOffset;
    }

    get BooleanNumber() {
        return BooleanNumber;
    }

    get HorizontalAlign() {
        return HorizontalAlign;
    }

    get TextDecoration() {
        return TextDecoration;
    }

    get TextDirection() {
        return TextDirection;
    }

    get VerticalAlign() {
        return VerticalAlign;
    }
}
