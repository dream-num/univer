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

import { createIdentifier } from '@univerjs/core';

/**
 * Univer telemetry service interface. You should implement this interface to track telemetry data.
 */
export interface ITelemetryService {
    /**
     * Enable the debug mode.
     */
    debug: () => void;
    /**
     * Initialize the telemetry service.
     * @param token
     * @param options
     */
    init: (options?: Record<string, any>) => void;
    /**
     * Identify the user.
     * @param id
     * @param params
     * @returns
     */
    identify: (id: string, params?: Record<string, any>) => void;
    /**
     * Reset the user.
     */
    reset(): void;
    /**
     * Track the event.
     * @param eventName
     * @param params
     */
    capture: (eventName: string, params?: Record<string, any>) => void;
    /**
     * Start the timer.
     * @param functionName
     */
    startTime: (functionName: string) => void;
    /**
     * End the timer.
     * @param functionName
     */
    endTime: (functionName: string) => void;
    /**
     * Track the performance event.
     * @param params
     */
    trackPerformance: (params: {
        duration: number;
        functionName: string;
        [prop: string]: any;
    }) => void;
    /**
     * Track the page view.
     * @param url
     */
    onPageView: (url: string) => void;
};

/**
 * Univer telemetry service identifier.
 */
export const ITelemetryService = createIdentifier<ITelemetryService>('telemetry.service');
