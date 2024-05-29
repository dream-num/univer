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

export { UniverSheetsConditionalFormattingUIPlugin } from './plugin';
export { AddCfCommand } from './commands/commands/add-cf.command';
export type { IAddCfCommandParams } from './commands/commands/add-cf.command';
export { ConditionalFormattingClearController } from './controllers/cf.clear.controller';
export * as enUS from './locale/en-US';
export * as zhCN from './locale/zh-CN';
export * as ruRU from './locale/ru-RU';

