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

import { useDependency } from '@wendellhu/redi/react-bindings';
import { useEffect } from 'react';
import { ITelemetryService } from './services/telemetry-service';
// React hook to track page view
export function useTrackPageView(service: ITelemetryService) {
    const href = typeof window !== 'undefined' ? window.location.href : '';

    useEffect(() => {
        if (href) {
            service.onPageView(href);
        }
    }, [href, service]);
}

export function useTrackPageViewWithService() {
    const telemetryService = useDependency(ITelemetryService);
    useTrackPageView(telemetryService);
}
