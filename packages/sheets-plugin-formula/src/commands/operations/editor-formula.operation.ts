// This file provide operations to change selection of sheets.

import { DeviceInputEventType } from '@univerjs/base-render';
import { KeyCode } from '@univerjs/base-ui';
import { CommandType, Direction, IOperation } from '@univerjs/core';

import { IFormulaPromptService } from '../../services/prompt.service';

export interface ISetEditorFormulaArrowOperationParam {
    eventType: DeviceInputEventType;
    keycode?: KeyCode;
}

export const SetEditorFormulaArrowOperation: IOperation<ISetEditorFormulaArrowOperationParam> = {
    id: 'formula.operation.set-editor-formula-arrow',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        const { keycode } = params;
        const formulaPromptService = accessor.get(IFormulaPromptService);

        switch (keycode) {
            case KeyCode.ARROW_DOWN:
                formulaPromptService.setNavigate({ direction: Direction.DOWN });
                break;
            case KeyCode.ARROW_UP:
                formulaPromptService.setNavigate({ direction: Direction.UP });
                break;
            case KeyCode.TAB:
                formulaPromptService.setAccept(true);
                break;
            default:
                break;
        }

        return true;
    },
};
