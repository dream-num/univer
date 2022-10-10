import { CommandManager, UndoManager } from '../Command';
import { Workbook1, Worksheet1 } from '../Sheets/Domain';
import { IOCContainer } from '../IOC';
import { Environment } from './Environment';
import { UniverSheet } from './UniverSheet';
import { PluginManager } from '../Plugin';
import { ServerHttp, ServerSocket } from '../Server';
import { Locale } from '../Shared';
import { Context } from './Context';
import { HooksManager } from '../Observer/HooksManager';
import { ObserverManager } from '../Observer/ObserverManager';

/**
 * Adding a mapping class to a IOCContainer
 *
 * @param container Target container
 * @returns IOCContainer for chaining.
 */
export function Bootstrap(container: IOCContainer): IOCContainer {
    container.addMapping('UniverSheet', UniverSheet);
    container.addSingletonMapping('Environment', Environment);
    container.addSingletonMapping('Server', ServerSocket);
    container.addSingletonMapping('ServerSocket', ServerSocket);
    container.addSingletonMapping('ServerHttp', ServerHttp);
    container.addSingletonMapping('WorkBook', Workbook1);
    container.addSingletonMapping('Locale', Locale);
    container.addSingletonMapping('Context', Context);
    container.addSingletonMapping('UndoManager', UndoManager);
    container.addSingletonMapping('CommandManager', CommandManager);
    container.addSingletonMapping('WorkSheet', Worksheet1);
    container.addSingletonMapping('PluginManager', PluginManager);
    container.addSingletonMapping('ObserverManager', ObserverManager);
    container.addSingletonMapping('ObservableHooksManager', HooksManager);
    return container;
}
