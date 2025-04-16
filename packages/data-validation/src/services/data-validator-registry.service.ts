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

import type { BaseDataValidator } from '../validators/base-data-validator';
import { toDisposable } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';

export enum DataValidatorRegistryScope {
    SHEET = 'sheet',
}

/**
 * Register data validator
 */
export class DataValidatorRegistryService {
    private _validatorByScopes = new Map<string, Array<BaseDataValidator>>();

    private _validatorMap = new Map<string, BaseDataValidator>();

    private _validatorsChange$ = new BehaviorSubject<void>(undefined);
    validatorsChange$ = this._validatorsChange$.asObservable();

    private _addValidatorToScope(validator: BaseDataValidator, scope: string) {
        if (!this._validatorByScopes.has(scope)) {
            this._validatorByScopes.set(scope, []);
        }

        const validators = this._validatorByScopes.get(scope)!;
        if (validators.findIndex((m) => m.id === validator.id) > -1) {
            throw new Error(`Validator item with the same id ${validator.id} has already been added!`);
        }
        validators.push(validator);
    }

    private _removeValidatorFromScope(validator: BaseDataValidator, scope: string) {
        const validators = this._validatorByScopes.get(scope);
        if (!validators) {
            return;
        }

        const index = validators.findIndex((v) => v.id === validator.id);
        if (index > -1) {
            validators.splice(index, 1);
        }
    }

    register(validator: BaseDataValidator) {
        this._validatorMap.set(validator.id, validator);

        if (Array.isArray(validator.scopes)) {
            validator.scopes.forEach((scope) => {
                this._addValidatorToScope(validator, scope);
            });
        } else {
            this._addValidatorToScope(validator, validator.scopes);
        }

        this._validatorsChange$.next();

        return toDisposable(() => {
            this._validatorMap.delete(validator.id);

            if (Array.isArray(validator.scopes)) {
                validator.scopes.forEach((scope) => {
                    this._removeValidatorFromScope(validator, scope);
                });
            } else {
                this._removeValidatorFromScope(validator, validator.scopes);
            }

            this._validatorsChange$.next();
        });
    }

    getValidatorItem(id: string) {
        return this._validatorMap.get(id);
    }

    getValidatorsByScope(scope: string) {
        return this._validatorByScopes.get(scope);
    }
}
