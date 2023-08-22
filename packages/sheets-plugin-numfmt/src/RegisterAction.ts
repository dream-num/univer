import { CommandManager } from '@univerjs/core';
import { ACTION_NAMES } from './Basics/Enum';
import { SetNumfmtRangeDataAction } from './Model/Action/SetNumfmtRangeDataAction';

CommandManager.register(ACTION_NAMES.SET_NUMFMT_RANGE_DATA_ACTION, SetNumfmtRangeDataAction);
