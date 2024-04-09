/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createIdentifier } from '@wendellhu/redi';

import type { IChannel, IMessageProtocol } from './rpc.service';
import { ChannelClient, ChannelServer } from './rpc.service';

export interface IRPCChannelService {
    requestChannel(name: string): IChannel;
    registerChannel(name: string, channel: IChannel): void;
}

export const IRPCChannelService = createIdentifier<IRPCChannelService>('IRPCChannelService');

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
