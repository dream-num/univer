import { CommandManager } from '@univerjs/core';
import { ACTION_NAMES } from '../Basics/Enum/ACTION_NAMES';
import { SetFormulaRangeDataAction } from './Action/SetFormulaRangeDataAction';

CommandManager.register(ACTION_NAMES.SET_FORMULA_RANGE_DATA_ACTION, SetFormulaRangeDataAction);
