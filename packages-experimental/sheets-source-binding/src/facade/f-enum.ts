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

import { FEnum } from '@univerjs/core';
import { BindModeEnum, DataBindingNodeTypeEnum } from '@univerjs/sheets-source-binding';

export interface ISourceBindingEnumMixin {
    /**
     * Represents the type of data binding node.{@link DataBindingNodeTypeEnum}
     */
    DataBindingNodeTypeEnum: typeof DataBindingNodeTypeEnum;
    /**
     * Represents the type of data binding node. {@link BindModeEnum}
     */
    BindModeEnum: typeof BindModeEnum;
}
class FSourceBindingEnum extends FEnum implements ISourceBindingEnumMixin {
    override get DataBindingNodeTypeEnum(): typeof DataBindingNodeTypeEnum {
        return DataBindingNodeTypeEnum;
    }

    override get BindModeEnum(): typeof BindModeEnum {
        return BindModeEnum;
    }
}

FEnum.extend(FSourceBindingEnum);

declare module '@univerjs/core' {
    // eslint-disable-next-line ts/naming-convention
    interface FEnum extends ISourceBindingEnumMixin { }
}
