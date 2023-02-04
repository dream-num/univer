import { BaseComponentRender } from '@univerjs/base-component';
import { SheetPlugin } from '@univerjs/base-sheets';
import { ACTION_NAMES, CommandManager, HEART_BEAT_MESSAGE, IOSocket, IOSocketListenType, ISheetActionData, PLUGIN_NAMES, SheetActionBase, SheetContext } from '@univerjs/core';
import { CollaborationPlugin } from '../CollaborationPlugin';

export class CollaborationController {
    protected _plugin: CollaborationPlugin;

    protected _render: BaseComponentRender;

    socket: IOSocket;

    previousMessage: string;

    constructor(plugin: CollaborationPlugin) {
        this._plugin = plugin;
        this._initialize();
    }

    private _initialize() {
        const config = this._plugin.getConfig();
        const { url } = config;

        if (url === '') {
            console.warn('url must be input');
            return;
        }

        this._initSocket(url);
        this._initObserver();
    }

    private _initSocket(url: string) {
        this.socket = new IOSocket({ url });
        this.socket.on(IOSocketListenType.MESSAGE, (event: MessageEvent) => {
            this.onMessage(event && event.data);
        });
        this.socket.on(IOSocketListenType.ERROR, (event: MessageEvent) => {
            this.onError(event && event.data);
        });
        this.socket.on(IOSocketListenType.OPEN, (event: MessageEvent) => {
            this.onOpen(event && event.data);
        });
        this.socket.on(IOSocketListenType.CLOSE, (event: MessageEvent) => {
            this.onClose(event && event.data);
        });
        this.socket.on(IOSocketListenType.RETRY, (event: MessageEvent) => {
            this.onRetry(event && event.data);
        });
        this.socket.on(IOSocketListenType.DESTROY, (event: MessageEvent) => {
            this.onDestroy(event && event.data);
        });
        this.socket.link();
    }

    private _initObserver() {
        let timer: NodeJS.Timeout | null = null;
        CommandManager.getCommandObservers().add(({ actions }) => {
            const plugin: CollaborationPlugin = this._plugin;

            if (!plugin) return;
            if (!actions || actions.length === 0) return;
            const action = actions[0] as SheetActionBase<ISheetActionData, ISheetActionData, void>;
            const actionName = action.getDoActionData().actionName;

            if (actionName !== ACTION_NAMES.SET_RANGE_DATA_ACTION) return;

            const context = plugin.context as SheetContext;

            const currentUnitId = context.getWorkBook().getUnitId();
            const actionUnitId = action.getWorkBook().getUnitId();

            if (currentUnitId !== actionUnitId) return;

            // Only the currently active worksheet needs to be refreshed
            const worksheet = action.getWorkBook().getActiveSheet();
            if (worksheet) {
                try {
                    if (timer) {
                        clearTimeout(timer);
                        timer = null;
                    }

                    timer = setTimeout(() => {
                        const config = context.getWorkBook().getConfig();
                        const message = {
                            type: 'workbookData',
                            config,
                        };

                        const stringMessage = JSON.stringify(message);
                        this.previousMessage = stringMessage;
                        this.socket.send(stringMessage);
                    }, 100);
                } catch (error) {
                    console.info(error);
                }
            }
        });
    }

    onMessage(data) {
        const json = JSON.parse(data);
        const content = json.content;
        if (content === HEART_BEAT_MESSAGE || this.previousMessage === content) {
            return;
        }

        this.previousMessage = content;

        try {
            const message = JSON.parse(content);

            if (message && message.type === 'workbookData') {
                console.log('refresh');
                this.refresh(message.config);
            }
        } catch (error) {
            console.error(content);
        }
    }
    onError(data) {
        console.log('onError====', data);
    }
    onOpen(data) {
        console.log('onOpen====', data);
    }
    onClose(data) {
        console.log('onClose====', data);
    }
    onRetry(data) {
        console.log('onRetry====', data);
    }
    onDestroy(data) {
        console.log('onDestroy====', data);
    }

    close() {
        this.socket.close();
    }

    refresh(config) {
        // console.log('onMessage===config====', config);
        const context = this._plugin.getContext() as SheetContext;
        context.refreshWorkbook(config);

        const worksheet = context.getWorkBook().getActiveSheet();
        if (worksheet) {
            try {
                const sheetPlugin = context.getPluginManager().getRequirePluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET);
                const canvasView = sheetPlugin.getCanvasView();
                if (canvasView) {
                    canvasView.updateToSheet(worksheet);
                    sheetPlugin.getMainComponent().makeDirty(true);
                }
            } catch (error) {
                console.info(error);
            }
        }
    }
}
