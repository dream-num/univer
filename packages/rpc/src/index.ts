/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

export {
    UniverRPCMainThreadPlugin,
    UniverRPCWorkerThreadPlugin,
} from './plugin';
export { DataSyncReplicaController } from './controllers/data-sync/data-sync-replica.controller';
export { DataSyncPrimaryController } from './controllers/data-sync/data-sync-primary.controller';
export {
    IRemoteInstanceService,
    RemoteInstanceServiceName,
    RemoteSyncPrimaryService,
    RemoteSyncServiceName,
    WebWorkerRemoteInstanceService,
} from './services/remote-instance/remote-instance.service';
export { ChannelService, IRPCChannelService } from './services/rpc/channel.service';
export { ChannelClient, ChannelServer, fromModule, type IMessageProtocol, toModule } from './services/rpc/rpc.service';
export { IRemoteSyncService } from './services/remote-instance/remote-instance.service';

export type { IUniverRPCMainThreadConfig, IUniverRPCWorkerThreadConfig } from './controllers/config.schema';
