import { CommandManager } from '@univerjs/core';
import { SetImageTypeAction } from './Model/Action';
import { AddImagePropertyAction } from './Model/Action/AddImagePropertyAction';

CommandManager.register(SetImageTypeAction.NAME, SetImageTypeAction);
CommandManager.register(AddImagePropertyAction.NAME, AddImagePropertyAction);
