import { CommandManager } from '@univer/core';
import { ACTION_NAMES } from '../Basic/Enum/ACTION_NAMES';
import { SetFormulaRangeDataAction } from './Action/SetFormulaRangeDataAction';

CommandManager.register(ACTION_NAMES.SET_FORMULA_RANGE_DATA_ACTION, SetFormulaRangeDataAction);
