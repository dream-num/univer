import { CommandManager } from '@univer/core';
import { ACTION_NAMES } from '../Basic/Enum';
import { SetNumfmtRangeDataAction } from './Action/SetNumfmtRangeDataAction';

CommandManager.register(ACTION_NAMES.SET_NUMFMT_RANGE_DATA_ACTION, SetNumfmtRangeDataAction);
