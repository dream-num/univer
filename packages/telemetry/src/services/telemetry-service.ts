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

/**
 * Univer telemetry service interface. You should implement this interface to track telemetry data.
 */
export interface ITelemetryService {
    identify: (id: string, params?: Record<string, any>) => void;
    capture: (eventName: string, params?: Record<string, any>) => void;
    startTime: (functionName: string) => void;
    endTime: (functionName: string) => void;
    trackPerformance: (params: {
        duration: number;
        functionName: string;
        [prop: string]: any;
    }) => void;
    onPageView: (url: string) => void;
};

/**
 * Univer telemetry service identifier.
 */
export const ITelemetryService = createIdentifier<ITelemetryService>('telemetry.service');
