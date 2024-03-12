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

import type { IOperation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import type { DeviceInputEventType } from '@univerjs/engine-render';
import type { KeyCode, MetaKeys } from '@univerjs/ui';

import type { META_KEY_CTRL_AND_SHIFT } from '../../common/prompt';

export interface ISelectEditorFormulaOperationParam {
    eventType: DeviceInputEventType;
    keycode?: KeyCode;
    metaKey?: MetaKeys | typeof META_KEY_CTRL_AND_SHIFT;
    isSingleEditor?: boolean;
}

export const SelectEditorFormulaOperation: IOperation<ISelectEditorFormulaOperationParam> = {
    id: 'formula-ui.operation.select-editor-formula',
    type: CommandType.OPERATION,
    handler: (accessor, params) =>
        // const { eventType, keycode } = params;
        // const formulaPromptService = accessor.get(IFormulaPromptService);
        // const editorBridgeService = accessor.get(IEditorBridgeService);

        // switch (keycode) {
        //     case KeyCode.ARROW_DOWN:
        //         formulaPromptService.navigate({ direction: Direction.DOWN });
        //         break;
        //     case KeyCode.ARROW_UP:
        //         formulaPromptService.navigate({ direction: Direction.UP });
        //         break;
        //     // case KeyCode.ENTER:
        //     // case KeyCode.TAB:
        //     //     if (formulaPromptService.isSearching()) {
        //     //         formulaPromptService.accept(true);
        //     //     } else {
        //     //         const editorBridgeParameters = {
        //     //             visible: false,
        //     //             eventType,
        //     //             keycode,
        //     //         };

        //     //         editorBridgeService.changeVisible(editorBridgeParameters);
        //     //     }
        //     //     break;
        //     default:
        //         break;
        // }

        true,
};
