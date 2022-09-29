import { CommandManager } from '@univer/core';
import { AddBandingAction } from './Action/AddBandingAction';
import { DeleteBandingAction } from './Action/DeleteBandingAction';
import { SetBandingAction } from './Action/SetBandingAction';
import { ACTION_NAMES } from './ACTION_NAMES';

CommandManager.register(ACTION_NAMES.DELETE_BANDING_ACTION, DeleteBandingAction);
CommandManager.register(ACTION_NAMES.SET_BANDING_ACTION, SetBandingAction);
CommandManager.register(ACTION_NAMES.ADD_BANDING_ACTION, AddBandingAction);
