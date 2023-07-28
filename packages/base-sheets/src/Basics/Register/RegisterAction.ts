import { CommandManager } from '@univerjs/core';
import { SetSelectionValueAction } from '../../Model/Action/SetSelectionValueAction';
import { ACTION_NAMES } from '../Enum';

CommandManager.register(ACTION_NAMES.SET_SELECTION_VALUE_ACTION, SetSelectionValueAction);
