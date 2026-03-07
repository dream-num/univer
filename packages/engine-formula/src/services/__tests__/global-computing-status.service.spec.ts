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

import { BehaviorSubject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { GlobalComputingStatusService } from '../global-computing-status.service';

describe('GlobalComputingStatusService', () => {
    it('should aggregate computing status from all registered subjects', () => {
        const service = new GlobalComputingStatusService();
        const subjectA = new BehaviorSubject(false);
        const subjectB = new BehaviorSubject(true);

        const disposableA = service.pushComputingStatusSubject(subjectA);
        const disposableB = service.pushComputingStatusSubject(subjectB);

        expect(service.computingStatus).toBe(false);

        subjectA.next(true);
        expect(service.computingStatus).toBe(true);

        subjectB.next(false);
        expect(service.computingStatus).toBe(false);

        disposableB.dispose();
        expect(service.computingStatus).toBe(true);

        disposableA.dispose();
        expect(service.computingStatus).toBe(true);
    });

    it('should expose computingStatus$ and cleanup on dispose', () => {
        const service = new GlobalComputingStatusService();
        const subject = new BehaviorSubject(true);
        const observed: boolean[] = [];
        service.computingStatus$.subscribe((value) => observed.push(value));

        service.pushComputingStatusSubject(subject);
        subject.next(false);
        subject.next(true);

        expect(observed).toContain(false);
        expect(observed[0]).toBe(true);

        service.dispose();
        expect(subject.isStopped).toBe(true);
    });
});
