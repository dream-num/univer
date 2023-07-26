import { ISheetActionData } from '../Command';
import { ICreatable, createIdentifier } from '@wendellhu/redi';
import { IWorksheetConfig } from '../Types/Interfaces';
import { IOSocket, IOSocketListenType } from '../Shared';
import { MessageQueue } from './MessageQueue';
import { IOServerMessage, IOServerReceive, ServerBase } from './ServerBase';

/**
 * Status of message queue
 */
export enum MessageQueueStatus {
    WAIT = 'wait',
    WORK = 'work',
}

export const IServerSocketWorkbookConfig = createIdentifier<IWorksheetConfig>('univer.server.workbook-config');

/**
 * Manage messageQueue
 */
export class ServerSocket extends ServerBase implements ICreatable {
    private globalSendResolve: Function;

    private socket: IOSocket;

    private status: MessageQueueStatus;

    private messageQueue: MessageQueue<IOServerMessage>;

    constructor(@IServerSocketWorkbookConfig private readonly config: ISpreadsheetConfig) {
        super();
    }

    onCreate() {
        this.messageQueue = new MessageQueue<IOServerMessage>();
        this.status = MessageQueueStatus.WAIT;
        this.globalSendResolve = () => {};
        if (this.config.socketEnable) {
            this.socket = new IOSocket({ url: this.config.socketUrl });
            this.socket.on(IOSocketListenType.MESSAGE, (event: MessageEvent) => {
                this.checkupReceiveMessage(event.data);
            });
            this.socket.on(IOSocketListenType.ERROR, () => {});
            this.socket.on(IOSocketListenType.OPEN, () => {});
            this.socket.on(IOSocketListenType.CLOSE, () => {});
            this.socket.on(IOSocketListenType.RETRY, () => {});
            this.socket.on(IOSocketListenType.DESTROY, () => {});
            this.socket.link();
        }
    }

    /**
     * zh: 消息添加到发送队列中
     * @param data
     */
    pushMessageQueue(changed: ISheetActionData[]): void {
        if (this.config.socketEnable) {
            this.messageQueue.push(this.packMessage(changed));
            this.sendMessageQueue();
        }
    }

    /**
     * get first message
     *
     * @privateRemarks
     * zh: 获取第一条消息
     * @returns
     */
    private getTopMessage(): IOServerMessage {
        return this.messageQueue.first();
    }

    /**
     * zh: 弹出第一条消息
     * @returns
     */
    private popTopMessage(): void {
        this.messageQueue.pop();
    }

    /**
     * zh: 序列化第一条消息
     * @returns
     */
    private serializeTopMessage(): string {
        const data = this.getTopMessage();
        return JSON.stringify(data) ?? '';
    }

    /**
     * zh: 检查接收的消息
     * @param event
     * @returns
     */
    private checkupReceiveMessage(receive: IOServerReceive<unknown>) {
        if (ServerSocket.isMessageResponseReceive(receive)) {
            if (this.getTopMessage().version === receive.message.version) {
                this.popTopMessage();
                this.globalSendResolve();
            }
        }
    }

    /**
     * zh: 发送第一条消息
     * @returns
     */
    private async sendTopMessage(): Promise<IOServerMessage> {
        const message = this.serializeTopMessage();
        this.socket.send(message);
        return new Promise<IOServerMessage>(
            // TODO
            // eslint-disable-next-line no-promise-executor-return
            (resolve) => (this.globalSendResolve = resolve)
        );
    }

    /**
     * zh: 发送消息队列
     * @returns
     */
    private async sendMessageQueue(): Promise<MessageQueueStatus> {
        const { messageQueue, status } = this;
        if (status === MessageQueueStatus.WAIT) {
            this.status = MessageQueueStatus.WORK;
            while (messageQueue.hasMessage()) {
                await this.sendTopMessage();
            }
            this.status = MessageQueueStatus.WAIT;
        }
        return this.status;
    }
}