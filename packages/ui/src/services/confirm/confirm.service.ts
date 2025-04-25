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

import type { IDisposable } from '@univerjs/core';
import type { IConfirmPartMethodOptions } from '../../views/components/confirm-part/interface';
import { createIdentifier } from '@univerjs/core';
import { Subject } from 'rxjs';

export const IConfirmService = createIdentifier<IConfirmService>('univer.confirm-service');
export interface IConfirmService {
    readonly confirmOptions$: Subject<IConfirmPartMethodOptions[]>;

    open(params: IConfirmPartMethodOptions): IDisposable;
    confirm(params: IConfirmPartMethodOptions): Promise<boolean>;
    close(id: string): void;
}

/**
 * This is a mock service for testing purposes.
 */
export class TestConfirmService implements IConfirmService, IDisposable {
    readonly confirmOptions$ = new Subject<IConfirmPartMethodOptions[]>();

    dispose(): void {
        this.confirmOptions$.complete();
    }

    open(_params: IConfirmPartMethodOptions): IDisposable {
        throw new Error('This is not implemented in the test service!');
    }

    confirm(_params: IConfirmPartMethodOptions): Promise<boolean> {
        return Promise.resolve(true);
    }

    close(_id: string): IDisposable {
        throw new Error('This is not implemented in the test service!');
    }
}
