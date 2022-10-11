import { CommandManager } from '@univer/core';
import { ACTION_NAMES } from '../Basic/Enum/ACTION_NAMES';
import { AddAllowedAction } from './AddAllowedAction';
import { AddUnlockAction } from './AddUnlockAction';
import { SetProtectionAction } from './SetProtectionAction';

CommandManager.register(ACTION_NAMES.ADD_ALLOWED_ACTION, AddAllowedAction);
CommandManager.register(ACTION_NAMES.ADD_UNLOCK_ACTION, AddUnlockAction);
CommandManager.register(ACTION_NAMES.SET_PROTECTION_ACTION, SetProtectionAction);
