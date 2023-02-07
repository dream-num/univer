import { CommandManager } from '@univerjs/core';
import { SetSelectionValueAction } from '../Model/Action/SetSelectionValueAction';

CommandManager.register(SetSelectionValueAction.NAME, SetSelectionValueAction);
