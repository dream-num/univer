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

import { ICommandService } from '@univerjs/core';
import { SetFormulaCalculationStopMutation } from '@univerjs/engine-formula';
import { TriggerCalculationController } from '@univerjs/sheets-formula';
import { ProgressBar, useDependency, useObservable } from '@univerjs/ui';
import React, { useCallback } from 'react';

export function FormulaProgressBar() {
    const triggerCalculationController = useDependency(TriggerCalculationController);
    const commandService = useDependency(ICommandService);
    const progress = useObservable(triggerCalculationController.progress$)!;

    const terminateCalculation = useCallback(() => {
        commandService.executeCommand(SetFormulaCalculationStopMutation.id);
    }, [commandService]);

    const clearProgress = useCallback(() => {
        triggerCalculationController.clearProgress();
    }, [triggerCalculationController]);

    return <ProgressBar progress={progress} onTerminate={terminateCalculation} onClearProgress={clearProgress} />;
}
