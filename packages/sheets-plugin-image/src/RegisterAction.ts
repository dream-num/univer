import { CommandManager } from '@univerjs/core';
import { AddOverGridImageAction, RemoveOverGridImageAction, SetImageTypeAction } from './Model';

CommandManager.register(SetImageTypeAction.NAME, SetImageTypeAction);
CommandManager.register(AddOverGridImageAction.NAME, AddOverGridImageAction);
CommandManager.register(RemoveOverGridImageAction.NAME, RemoveOverGridImageAction);
