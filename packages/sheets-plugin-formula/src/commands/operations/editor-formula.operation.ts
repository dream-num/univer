// This file provides operations to change formula selection of sheets.

import { DeviceInputEventType } from '@univerjs/base-render';
import { KeyCode } from '@univerjs/base-ui';
import { CommandType, Direction, IOperation } from '@univerjs/core';

import { IFormulaPromptService } from '../../services/prompt.service';

export interface ISetEditorFormulaOperationParam {
    eventType: DeviceInputEventType;
    keycode?: KeyCode;
}

export const SetEditorFormulaOperation: IOperation<ISetEditorFormulaOperationParam> = {
    id: 'formula.operation.set-editor-formula-arrow',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        const { keycode } = params;
        const formulaPromptService = accessor.get(IFormulaPromptService);

        switch (keycode) {
            case KeyCode.ARROW_DOWN:
                formulaPromptService.navigate({ direction: Direction.DOWN });
                break;
            case KeyCode.ARROW_UP:
                formulaPromptService.navigate({ direction: Direction.UP });
                break;
            case KeyCode.ENTER:
            case KeyCode.TAB:
                formulaPromptService.accept(true);
                break;
            default:
                break;
        }

        return true;
    },
};
