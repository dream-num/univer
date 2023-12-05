import { IDisposable, createIdentifier } from '@wendellhu/redi';
import { ChannelClient, ChannelServer, IChannel, IMessageProtocol } from './rpc.service';

export interface IRPChannelService {
    requestChannel(name: string): IChannel;
    registerChannel(name: string, channel: IChannel): void;
}

export const IRPChannelService = createIdentifier<IRPChannelService>('IRPChannelService');

/**
 * This service is responsible for managing the RPC channels.
 */
export class ChannelService {
    private readonly _client: ChannelClient;
    private readonly _server: ChannelServer;

    constructor(_messageProtocol: IMessageProtocol) {
        this._client = new ChannelClient(_messageProtocol);
        this._server = new ChannelServer(_messageProtocol);
    }

    requestChannel(name: string): IChannel {
        return this._client.getChannel(name);
    }

    registerChannel(name: string, channel: IChannel): void {
        this._server.registerChannel(name, channel);
    }
}
