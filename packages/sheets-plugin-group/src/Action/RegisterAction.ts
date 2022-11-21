import { CommandManager } from '@univer/core';
import { ACTION_NAMES } from '../Basic/Enum/ACTION_NAMES';
import { SetCollapseAllColumnGroupsAction } from './SetCollapseAllColumnGroupsAction';
import { SetCollapseAllRowGroupsAction } from './SetCollapseAllRowGroupsAction';

CommandManager.register(ACTION_NAMES.SET_COLLAPSE_ALL_COLUMN_GROUPS_ACTION, SetCollapseAllColumnGroupsAction);
CommandManager.register(ACTION_NAMES.SET_COLLAPSE_ALL_ROW_GROUPS_ACTION, SetCollapseAllRowGroupsAction);
