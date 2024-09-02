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

import { createIdentifier } from '@univerjs/core';

// Enum for telemetry event names
export enum TelemetryEventNames {
    /** space */
    space_sheet_create = 'space_sheet_create',
    space_sheet_upload = 'space_sheet_upload',
    /** unit */
    unit_header_sheet_upload = 'unit_header_sheet_upload',
    unit_header_sheet_create = 'unit_header_sheet_create',
    unit_header_sheet_print = 'unit_header_sheet_print',
    unit_header_sheet_download = 'unit_header_sheet_download',
    unit_header_sheet_share_click = 'unit_header_sheet_share_click',
    /** sheet */
    sheet_ai_completion_config = 'ai_completion_config',
    sheet_ai_completion_requesting = 'ai_completion_requesting',

    sheet_render_cost = 'sheet_render_timecost',
};

// Base interface for telemetry service
export interface ITelemetryService {
    identify: (id: string, params?: Record<string, any>) => void;
    capture: (eventName: TelemetryEventNames, params?: Record<string, any>) => void;
    onPageView: (url: string) => void;
};

export const ITelemetryService = createIdentifier<ITelemetryService>('telemetry.service');
