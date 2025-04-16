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

import type { IOperation } from '@univerjs/core';
import type { DeviceInputEventType } from '@univerjs/engine-render';
import type { KeyCode, MetaKeys } from '@univerjs/ui';
import type { META_KEY_CTRL_AND_SHIFT } from '../../common/prompt';

import { CommandType } from '@univerjs/core';

export interface ISelectEditorFormulaOperationParam {
    eventType: DeviceInputEventType;
    keycode?: KeyCode;
    metaKey?: MetaKeys | typeof META_KEY_CTRL_AND_SHIFT;
    isSingleEditor?: boolean;
}

// FIXME: this is an anti-pattern, using operation as an event

export const SelectEditorFormulaOperation: IOperation<ISelectEditorFormulaOperationParam> = {
    id: 'formula-ui.operation.select-editor-formula',
    type: CommandType.OPERATION,
    handler: (accessor, params) => true,
};
