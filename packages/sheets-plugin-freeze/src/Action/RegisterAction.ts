import { CommandManager } from '@univerjs/core';
import { ACTION_NAMES } from '../Basic/Enum/ACTION_NAMES';
import { SetFrozenColumnsAction } from './SetFrozenColumnsAction';
import { SetFrozenRowsAction } from './SetFrozenRowsAction';

CommandManager.register(ACTION_NAMES.SET_FROZEN_COLUMNS_ACTION, SetFrozenColumnsAction);
CommandManager.register(ACTION_NAMES.SET_FROZEN_ROWS_ACTION, SetFrozenRowsAction);
