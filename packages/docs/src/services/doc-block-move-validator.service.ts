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

import type { IDisposable, IDocumentData } from '@univerjs/core';
import { Disposable, remove, toDisposable } from '@univerjs/core';

export interface IDocBlockMoveValidationContext {
    unitId: string;
    sourceRange: {
        startOffset: number;
        endOffset: number;
    };
    targetOffset: number;
}

export type DocBlockMoveValidator = (context: IDocBlockMoveValidationContext) => boolean;

export interface IDocBlockMoveResult {
    nextDocumentData: IDocumentData;
    movedRange: {
        startOffset: number;
        endOffset: number;
    };
}

export interface IDocBlockMoveTransformContext extends IDocBlockMoveValidationContext {
    previousDocumentData: IDocumentData;
    result: IDocBlockMoveResult;
}

export type DocBlockMoveTransformer = (context: IDocBlockMoveTransformContext) => IDocBlockMoveResult;

export class DocBlockMoveValidatorService extends Disposable {
    private readonly _validators: DocBlockMoveValidator[] = [];
    private readonly _transformers: DocBlockMoveTransformer[] = [];

    registerValidator(validator: DocBlockMoveValidator): IDisposable {
        this._validators.push(validator);

        return this.disposeWithMe(toDisposable(() => remove(this._validators, validator)));
    }

    registerTransformer(transformer: DocBlockMoveTransformer): IDisposable {
        this._transformers.push(transformer);

        return this.disposeWithMe(toDisposable(() => remove(this._transformers, transformer)));
    }

    canMoveBlock(context: IDocBlockMoveValidationContext): boolean {
        return this._validators.every((validator) => validator(context));
    }

    transformMoveResult(context: IDocBlockMoveTransformContext): IDocBlockMoveResult {
        return this._transformers.reduce((result, transformer) => transformer({
            ...context,
            result,
        }), context.result);
    }
}
