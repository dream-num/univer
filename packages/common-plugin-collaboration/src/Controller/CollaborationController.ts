import { SheetPlugin, SetSelectionValueAction } from '@univerjs/base-sheets';
import {
    ActionOperation,
    ACTION_NAMES,
    Command,
    CommandManager,
    HEART_BEAT_MESSAGE,
    IKeyValue,
    IOSocket,
    IOSocketListenType,
    ISetRangeDataActionData,
    ISheetActionData,
    PLUGIN_NAMES,
    SheetActionBase,
    SheetContext,
    IActionData,
} from '@univerjs/core';
import { CollaborationPlugin } from '../CollaborationPlugin';

interface MessageConfigType {
    univerId: string;
    actionData: IActionData;
}

export class CollaborationController {
    socket: IOSocket;

    previousMessage: string;

    private _plugin: CollaborationPlugin;

    private _sheetPlugin: SheetPlugin;

    private _collaborationActionList: string[];

    constructor(plugin: CollaborationPlugin) {
        this._plugin = plugin;
        this._sheetPlugin = plugin.getUniver().getCurrentUniverSheetInstance().context.getPluginManager().getRequirePluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET);
        this._initialize();
    }

    onMessage(data: string) {
        const json = JSON.parse(data);
        const stringData = json.data;
        if (json.type !== 'data' || stringData === HEART_BEAT_MESSAGE || this.previousMessage === stringData) {
            return;
        }

        this.previousMessage = stringData;

        try {
            const message: MessageConfigType = JSON.parse(stringData);

            const context = this._sheetPlugin.getContext();

            const currentUnitId = context.getWorkBook().getUnitId();
            const actionUnitId = message.univerId;

            if (currentUnitId !== actionUnitId) return;

            if (message) {
                const { actionName } = message.actionData;

                switch (actionName) {
                    case ACTION_NAMES.SET_RANGE_DATA_ACTION:
                        this.refreshRange(message);
                        break;
                    case SetSelectionValueAction.NAME:
                        this.highlightCell(message);
                        break;

                    default:
                        break;
                }
            }
        } catch (error) {
            console.error(error, stringData);
        }

        console.info('onmessage json: ', json);
    }

    onMessage_back(data: string) {
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

    onError(data: IKeyValue) {
        console.log('Collaboration Error: ', data);
    }

    onOpen(data: IKeyValue) {
        console.log('Collaboration Open: ', data);
    }

    onClose(data: IKeyValue) {
        console.log('Collaboration Close: ', data);
    }

    onRetry(data: IKeyValue) {
        console.log('Collaboration Retry: ', data);
    }

    onDestroy(data: IKeyValue) {
        console.log('Collaboration Destroy: ', data);
    }

    close() {
        this.socket.close();
    }

    refreshRange(config: MessageConfigType) {
        const { actionData } = config;
        const { sheetId, cellValue } = actionData as ISetRangeDataActionData;

        const context = this._sheetPlugin.getContext();
        const _commandManager = context.getCommandManager();
        const worksheet = this._sheetPlugin.getWorkbook().getSheetBySheetId(sheetId);

        if (!worksheet) return;

        console.log('收到协同更新==范围：', '数据:', cellValue);

        let setValue: ISetRangeDataActionData = {
            sheetId: worksheet.getSheetId(),
            actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
            cellValue,
        };
        setValue = ActionOperation.make<ISetRangeDataActionData>(setValue).removeCollaboration().getAction();
        const command = new Command(
            {
                WorkBookUnit: context.getWorkBook(),
            },
            setValue
        );
        _commandManager.invoke(command);
    }

    highlightCell(config: MessageConfigType) {
        console.info('收到高亮消息===')
        // const { actionData } = config;
        // const { sheetId, cellValue } = actionData as ISetRangeDataActionData;

        // const context = this._sheetPlugin.getContext();
        // const _commandManager = context.getCommandManager();
        // const worksheet = this._sheetPlugin.getWorkbook().getSheetBySheetId(sheetId);

        // if (!worksheet) return;

        // console.log('收到协同更新==范围：', '数据:', cellValue);

        // let setValue: ISetRangeDataActionData = {
        //     sheetId: worksheet.getSheetId(),
        //     actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
        //     cellValue,
        // };
        // setValue = ActionOperation.make<ISetRangeDataActionData>(setValue).removeCollaboration().getAction();
        // const command = new Command(
        //     {
        //         WorkBookUnit: context.getWorkBook(),
        //     },
        //     setValue
        // );
        // _commandManager.invoke(command);
    }

    refresh(config: IKeyValue) {
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

    private _initialize() {
        const config = this._plugin.getConfig();
        const { url } = config;

        if (url === '') {
            console.warn('url must be input');
            return;
        }

        this._collaborationActionList = [ACTION_NAMES.SET_RANGE_DATA_ACTION, SetSelectionValueAction.NAME];

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

            const actionData = action.getDoActionData();
            if (!ActionOperation.hasCollaboration(actionData)) return;

            const actionName = actionData.actionName;
            if (!this._collaborationActionList.includes(actionName)) return;

            const context = this._sheetPlugin.getContext();

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
                        // const currentEditRangeValue = this._sheetPlugin.getCellEditorController().getCurrentEditRangeData();
                        const data: MessageConfigType = {
                            univerId: currentUnitId,
                            actionData: action.getDoActionData(),
                        };

                        let stringData = JSON.stringify(data);
                        const message = {
                            type: 'data',
                            data: stringData,
                        };

                        const stringMessage = JSON.stringify(message);
                        this.previousMessage = stringData;
                        this.socket.send(stringMessage);
                    }, 100);
                } catch (error) {
                    console.info(error);
                }
            }
        });
    }

    private _initObserver_back() {
        let timer: NodeJS.Timeout | null = null;
        CommandManager.getCommandObservers().add(({ actions }) => {
            const plugin: CollaborationPlugin = this._plugin;

            if (!plugin) return;
            if (!actions || actions.length === 0) return;
            const action = actions[0] as SheetActionBase<ISheetActionData, ISheetActionData, void>;
            const actionName = action.getDoActionData().actionName;

            if (actionName !== ACTION_NAMES.SET_RANGE_DATA_ACTION) return;

            const context = plugin.getUniver().getCurrentUniverSheetInstance().context;

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
}
