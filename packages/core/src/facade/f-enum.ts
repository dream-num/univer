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
import { LifecycleStages } from '../services/lifecycle/lifecycle';
import { DataValidationErrorStyle } from '../types/enum/data-validation-error-style';
import { DataValidationOperator } from '../types/enum/data-validation-operator';
import { DataValidationRenderMode } from '../types/enum/data-validation-render-mode';
import { DataValidationStatus } from '../types/enum/data-validation-status';
import { DataValidationType } from '../types/enum/data-validation-type';

export class FEnum {
    static _instance: FEnum | null;
    static get() {
        if (this._instance) {
            return this._instance;
        }

        const instance = new FEnum();
        this._instance = instance;
        return instance;
    }

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
}
