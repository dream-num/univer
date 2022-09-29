import { CommandManager } from '@univer/core';
import { ACTION_NAMES } from '../Enum/ACTION_NAMES';
import { DescSortAction, AscSortAction } from '.';

CommandManager.register(ACTION_NAMES.DESC_SORT_ACTION, DescSortAction);
CommandManager.register(ACTION_NAMES.ASC_SORT_ACTION, AscSortAction);
