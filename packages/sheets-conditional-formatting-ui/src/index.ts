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

import './global.css';

export { UniverSheetsConditionalFormattingMobileUIPlugin } from './mobile-plugin';
export { UniverSheetsConditionalFormattingUIPlugin } from './plugin';
export { ConditionalFormattingClearController } from './controllers/cf.clear.controller';

// #region - all commands

export { AddAverageCfCommand } from './commands/commands/add-average-cf.command';
export { AddColorScaleConditionalRuleCommand } from './commands/commands/add-color-scale-cf.command';
export { AddDataBarConditionalRuleCommand } from './commands/commands/add-data-bar-cf.command';
export { AddDuplicateValuesCfCommand } from './commands/commands/add-duplicate-values-cf.command';
export { AddNumberCfCommand } from './commands/commands/add-number-cf.command';
export { AddRankCfCommand } from './commands/commands/add-rank-cf.command';
export { AddTextCfCommand } from './commands/commands/add-text-cf.command';
export { AddTimePeriodCfCommand } from './commands/commands/add-time-period-cf.command';
export { AddUniqueValuesCfCommand } from './commands/commands/add-unique-values-cf.command';

export { OpenConditionalFormattingOperator } from './commands/operations/open-conditional-formatting-panel';

// #endregion
