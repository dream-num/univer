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

import { FUniver } from '@univerjs/core';
import { FNetwork } from './f-network';

interface IFUniverNetworkMixin {
    /**
     * Get the network API of Univer, with the help of which you can send HTTP requests.
     */
    getNetwork(): FNetwork;
}

export class FUniverNetworkMixin extends FUniver implements IFUniverNetworkMixin {
    override getNetwork(): FNetwork {
        return this._injector.createInstance(FNetwork);
    }
}

FUniver.extend(FUniverNetworkMixin);
declare module '@univerjs/core' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverNetworkMixin { }
}
