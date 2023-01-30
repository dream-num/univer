import { CommandManager } from '@univerjs/core';
import { ACTION_NAMES } from '../Const';
import { SetImageTypeAction } from './Action';
import { AddImagePropertyAction } from './Action/AddImagePropertyAction';

CommandManager.register(ACTION_NAMES.SET_IMAGE_TYPE_ACTION, SetImageTypeAction);
CommandManager.register(ACTION_NAMES.ADD_IMAGE_PROPERTY_ACTION, AddImagePropertyAction);
