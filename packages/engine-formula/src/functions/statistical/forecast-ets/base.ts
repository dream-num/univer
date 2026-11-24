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

import type { DateSystem } from '@univerjs/core';
import type { IEtsModel } from '../../../basics/ets-model';
import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { excelDateSerial, excelSerialToDate } from '@univerjs/core';
import { getDaysInMonth } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import { detectEtsPeriod, MAX_ETS_PERIOD, trainEts } from '../../../basics/ets-model';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

type Mode = 'forecast' | 'confidence' | 'seasonality' | 'statistic';
type Samples = Map<number, number[]>;

const ZERO = NumberValueObject.create(0);
const MAX_POINTS = 1_000_000;
const MAX_DATE_SERIAL = 2_958_465;

interface ITimeline {
    groups: Samples;
    first: number;
    last: number;
    step: number;
    monthStep: number;
    calendarDay: number;
}

interface ISeries {
    first: number;
    values: number[];
}

export abstract class EtsFunction extends BaseFunction {
    override needsReferenceObject = true;

    protected abstract readonly mode: Mode;

    override calculate(...input: FunctionVariantType[]): BaseValueObject {
        const dateSystem = this.getDateSystem();
        const auto = this.mode === 'seasonality';
        const confidenceMode = this.mode === 'confidence';
        const statisticMode = this.mode === 'statistic';
        const dataIndex = auto || statisticMode ? 0 : 1;
        const optionIndex = auto ? 2 : confidenceMode ? 4 : 3;
        const completionIndex = optionIndex + (auto ? 0 : 1);
        const args = input.map((arg, i) => {
            if (!arg.isReferenceObject()) {
                return arg as BaseValueObject;
            }
            const array = (arg as BaseReferenceObject).toArrayValueObject();
            if (i === dataIndex || i === dataIndex + 1 || array.getRowCount() !== 1 || array.getColumnCount() !== 1) {
                return array;
            }
            const cell = array.getFirstCell();
            // A blank completion cell selects the default. Other blank option cells supply zero.
            return i >= Math.min(optionIndex, 3) && i !== completionIndex && cell.isNull() ? ZERO : cell;
        });
        const history = readTimeline(args[dataIndex], args[dataIndex + 1], dateSystem);
        const season = auto ? 1 : readInteger(args[optionIndex], 1, 0, 0x7FFFFFFF);
        const completion = readInteger(args[completionIndex], 1, 0, 1);
        const aggregation = readInteger(args[completionIndex + 1], 1, 1, 7);
        let observedCount = 0;
        if (!(history instanceof ErrorValueObject)) {
            for (const samples of history.groups.values()) {
                if (samples.length > 0) {
                    observedCount++;
                }
            }
        }
        let prepared: ISeries | ErrorType | undefined;
        let period = 0;
        let model: IEtsModel | undefined;

        const run = (targetCell: BaseValueObject, confidenceCell: BaseValueObject): BaseValueObject => {
            const target = readScalar(targetCell, 0);
            const confidence = readScalar(confidenceCell, 0.95);
            if (typeof target !== 'number') return target;
            if (typeof confidence !== 'number') return confidence;
            if (!(confidence >= 0 && confidence < 1) || (statisticMode && (!Number.isInteger(target) || target < 1 || target > 8))) {
                return ErrorValueObject.create(ErrorType.NUM);
            }
            if (typeof season !== 'number') return season;
            if (typeof completion !== 'number') return completion;
            if (typeof aggregation !== 'number') return aggregation;
            if (history instanceof ErrorValueObject) return history;
            if (completion === 1 && observedCount < 2) {
                return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
            }

            if (dataIndex === 1 && (!Number.isFinite(target) || target < history.first || (confidenceMode && target <= history.last))) {
                return ErrorValueObject.create(ErrorType.NUM);
            }
            if (confidenceMode && confidence === 0) return ZERO;
            if (statisticMode && target === 8) return NumberValueObject.create(history.step);

            if (prepared === undefined) {
                prepared = fillTimeline(history, completion === 1, aggregation, dateSystem);
                if (typeof prepared !== 'string') {
                    period = season === 1
                        ? detectEtsPeriod(prepared.values)
                        : season <= MAX_ETS_PERIOD && season < Math.floor(prepared.values.length * 7 / 10) ? season : 0;
                }
            }
            if (typeof prepared === 'string') return ErrorValueObject.create(prepared);
            if (auto) return NumberValueObject.create(period);

            const { values, first } = prepared;
            model ??= trainEts(values, period);
            if (statisticMode) return finiteNumber(model.statistic(target));
            const position = targetPosition(target, first, history, dateSystem);
            return finiteNumber(projectAt(model, position, values.length, confidenceMode ? confidence : undefined));
        };

        const target = auto ? ZERO : args[statisticMode ? 2 : 0];
        const confidence = confidenceMode ? args[3] ?? NumberValueObject.create(0.95) : ZERO;
        return mapOutputs(target, confidence, run);
    }
}

function projectAt(model: IEtsModel, position: number, length: number, confidence?: number): number {
    if (!Number.isFinite(position) || Math.abs(position) >= 2 ** 53) return NaN;
    const index = Math.floor(position);
    const fraction = position - index;
    const calculate = confidence === undefined
        ? (step: number) => model.project(step)
        : (step: number) => model.confidenceWidth(step - length + 1, confidence);
    const left = calculate(index);
    if (fraction === 0) return left;
    const right = calculate(index + 1);
    return confidence === undefined
        ? (1 - fraction) * left + fraction * right
        : Math.sqrt((1 - fraction) * left * left + fraction * right * right);
}

function finiteNumber(value: number): BaseValueObject {
    return Number.isFinite(value) ? NumberValueObject.create(value) : ErrorValueObject.create(ErrorType.NUM);
}

function mapOutputs(target: BaseValueObject, confidence: BaseValueObject, run: (target: BaseValueObject, confidence: BaseValueObject) => BaseValueObject): BaseValueObject {
    const arrays = [target, confidence].filter((value): value is ArrayValueObject => value.isArray());
    const rows = Math.max(1, ...arrays.map((array) => array.getRowCount()));
    const columns = Math.max(1, ...arrays.map((array) => array.getColumnCount()));
    if (rows === 1 && columns === 1) return run(target, confidence);
    const missing = ErrorValueObject.create(ErrorType.NA);
    const targets = expandArrayValueObject(rows, columns, target, missing);
    const confidenceLevels = expandArrayValueObject(rows, columns, confidence, missing);
    return targets.map((cell, row, column) => run(cell, confidenceLevels.get(row, column) ?? missing));
}

function readScalar(arg: BaseValueObject | undefined, defaultValue: number): number | BaseValueObject {
    const value = arg?.isArray() ? (arg as ArrayValueObject).getFirstCell() : arg;
    if (!value || value.isNull()) return defaultValue;
    const numeric = value.isString() ? value.convertToNumberObjectValue() : value;
    return numeric.isError() ? numeric : Number(numeric.getValue());
}

function readInteger(arg: BaseValueObject | undefined, fallback: number, minimum: number, maximum: number): number | BaseValueObject {
    if (arg?.isArray()) {
        const array = arg as ArrayValueObject;
        if (array.getRowCount() * array.getColumnCount() > 1) return ErrorValueObject.create(ErrorType.VALUE);
    }
    const value = readScalar(arg, fallback);
    if (typeof value !== 'number') return value;
    if (!Number.isInteger(value) || value < minimum || value > maximum) return ErrorValueObject.create(ErrorType.NUM);
    return value;
}

function readSamples(values: BaseValueObject, timeline: BaseValueObject): Samples | ErrorValueObject {
    if (values.isError()) return values as ErrorValueObject;
    if (timeline.isError()) return timeline as ErrorValueObject;
    if (values.isArray() !== timeline.isArray()) return ErrorValueObject.create(ErrorType.NA);
    if (!values.isArray()) return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);

    const samples = (values as ArrayValueObject).getArrayValue().flat();
    const times = (timeline as ArrayValueObject).getArrayValue().flat();
    if (samples.length !== times.length) return ErrorValueObject.create(ErrorType.NA);
    if (times.length > MAX_POINTS) return ErrorValueObject.create(ErrorType.NUM);

    const groups: Samples = new Map();
    for (let i = 0; i < times.length; i++) {
        const time = times[i];
        const value = samples[i];
        if (time?.isError()) return time as ErrorValueObject;
        if (value?.isError()) return value as ErrorValueObject;
        if (!time?.isNumber()) continue;
        if (value != null && !value.isNumber() && !value.isNull()) continue;
        const when = Number(time.getValue());
        if (!Number.isFinite(when)) return ErrorValueObject.create(ErrorType.NUM);
        const existing = groups.get(when) ?? [];
        if (value?.isNumber()) existing.push(Number(value.getValue()));
        groups.set(when, existing);
    }
    return groups;
}

function readTimeline(values: BaseValueObject, timeline: BaseValueObject, dateSystem: DateSystem): ITimeline | ErrorValueObject {
    const groups = readSamples(values, timeline);
    if (groups instanceof ErrorValueObject) return groups;
    const sorted = [...groups.keys()].sort((a, b) => a - b);
    if (sorted.length < 2) return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);

    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const tolerance = timestampTolerance(first, last);
    let step = findTimelineStep(sorted, tolerance);
    if (!Number.isFinite(step) || step <= 0) return ErrorValueObject.create(ErrorType.NUM);
    const [monthStep, calendarDay] = step >= 28 && first >= 61 && last <= MAX_DATE_SERIAL
        ? findCalendarMonthStep(sorted, dateSystem)
        : [0, 0];
    if (monthStep === 0) {
        // Estimate the grid step over the full span so rounding in individual gaps cannot accumulate.
        const span = last - first;
        const calibrated = span / Math.round(span / step);
        if (Math.abs(calibrated - step) <= Math.min(tolerance, step * 1e-6)) {
            step = calibrated;
        }
    }
    return { groups: new Map(sorted.map((time) => [time, groups.get(time)!])), step, first, last, monthStep, calendarDay };
}

function findCalendarMonthStep(times: readonly number[], dateSystem: DateSystem): [number, number] {
    const first = times[0];
    let sameDay = true;
    let monthEnd = shiftMonth(first, 0, dateSystem, true) === first;
    let step = 0;
    for (let i = 1; i < times.length; i++) {
        const months = calendarMonthDistance(first, times[i], dateSystem);
        if (months <= 0) return [0, 0];
        sameDay &&= shiftMonth(first, months, dateSystem) === times[i];
        monthEnd &&= shiftMonth(first, months, dateSystem, true) === times[i];
        if (!sameDay && !monthEnd) return [0, 0];
        let remainder = months;
        while (remainder !== 0) {
            [step, remainder] = [remainder, step % remainder];
        }
    }
    return [step, monthEnd ? 31 : excelSerialToDate(first, dateSystem).getUTCDate()];
}

function timestampTolerance(first: number, last: number): number {
    return 4 * Number.EPSILON * Math.max(Math.abs(first), Math.abs(last), 1);
}

function findTimelineStep(sorted: readonly number[], tolerance: number): number {
    const steps = new Map<number, number>();
    for (let i = 1; i < sorted.length; i++) {
        const distance = sorted[i] - sorted[i - 1];
        steps.set(distance, (steps.get(distance) ?? 0) + 1);
    }
    let step = Infinity;
    let frequency = 0;
    let sum = 0;
    let count = 0;
    for (const [distance, occurrences] of [...steps].sort(([left], [right]) => left - right)) {
        const mean = sum / count;
        if (count > 0 && distance - mean > Math.min(tolerance, mean * 1e-6)) {
            if (count > frequency) {
                step = mean;
                frequency = count;
            }
            sum = 0;
            count = 0;
        }
        sum += distance * occurrences;
        count += occurrences;
    }
    return count > frequency ? sum / count : step;
}

function fillTimeline(history: ITimeline, complete: boolean, aggregation: number, dateSystem: DateSystem): ISeries | ErrorType {
    let { groups, first, last } = history;
    if (complete) {
        const points = [...groups];
        let start = 0;
        let end = points.length;
        while (start < end && points[start][1].length === 0) start++;
        while (end > start && points[end - 1][1].length === 0) end--;
        if (end - start < 2) return ErrorType.DIV_BY_ZERO;
        groups = new Map(points.slice(start, end));
        first = points[start][0];
        last = points[end - 1][0];
    }
    let irregular = false;
    const { step, monthStep } = history;
    const tolerance = Math.max(1e-9, Math.min(1e-6, timestampTolerance(first, last) / step));
    if (monthStep === 0) {
        const phases = new Map<number, { anchor: number; count: number }>();
        for (const time of groups.keys()) {
            const position = (time - first) / step;
            if (!Number.isFinite(position) || position >= MAX_POINTS) return ErrorType.NUM;
            const fraction = position - Math.round(position);
            irregular ||= Math.abs(fraction) > tolerance;
            const key = Math.round(fraction * 1e8);
            phases.set(key, { anchor: phases.get(key)?.anchor ?? time, count: (phases.get(key)?.count ?? 0) + 1 });
        }
        if (irregular) {
            const candidates = [...phases].sort((a, b) => b[1].count - a[1].count || a[0] - b[0]);
            const phase = candidates[0][1];
            if (phase.count * 2 < groups.size) return ErrorType.NUM;
            // Use an observed timestamp to keep exact half-step ties stable.
            const origin = phase.anchor;
            const aligned: Samples = new Map();
            for (const [time, samples] of groups) {
                const timestamp = origin + Math.floor((time - origin) / step + 0.5) * step;
                const existing = aligned.get(timestamp) ?? [];
                for (const item of samples) existing.push(item);
                aligned.set(timestamp, existing);
                last = timestamp;
            }
            if (aligned.size < 2) return ErrorType.NUM;
            first = aligned.keys().next().value!;
            groups = aligned;
        }
    }
    const positionOf = monthStep > 0
        ? (time: number) => calendarMonthDistance(first, time, dateSystem) / monthStep
        : (time: number) => (time - first) / step;
    const size = Math.round(positionOf(last)) + 1;
    if (size > MAX_POINTS || groups.size < size * 0.7) return ErrorType.NUM;
    const values: number[] = new Array<number>(size).fill(NaN);
    for (const [time, samples] of groups) {
        const position = positionOf(time);
        const rounded = Math.round(position);
        if (Math.abs(position - rounded) > tolerance) return ErrorType.NUM;
        values[rounded] = aggregate(samples.length === 0 && !complete ? [0] : samples, aggregation);
    }
    if (Number.isNaN(values[0]) || Number.isNaN(values[size - 1])) return ErrorType.NUM;
    for (let i = 1; i < size; i++) {
        if (!Number.isNaN(values[i])) continue;
        const begin = i - 1;
        let end = i + 1;
        while (Number.isNaN(values[end])) end++;
        while (i < end) {
            const fraction = (i - begin) / (end - begin);
            values[i++] = complete ? (1 - fraction) * values[begin] + fraction * values[end] : 0;
        }
        i = end;
    }
    return { first, values };
}

function aggregate(values: number[], rule: number): number {
    if (values.length === 0) return NaN;
    if (rule === 2 || rule === 3) return values.length;
    if (rule === 4) return values.reduce((best, value) => Math.max(best, value), -Infinity);
    if (rule === 5) {
        const sorted = [...values].sort((a, b) => a - b);
        return (sorted[Math.floor((sorted.length - 1) / 2)] + sorted[Math.floor(sorted.length / 2)]) / 2;
    }
    if (rule === 6) return values.reduce((best, value) => Math.min(best, value), Infinity);
    const sum = values.reduce((total, value) => total + value, 0);
    return rule === 1 ? sum / values.length : sum;
}

function shiftMonth(serial: number, months: number, dateSystem: DateSystem, monthEnd = false): number {
    const date = excelSerialToDate(serial, dateSystem);
    const index = date.getUTCFullYear() * 12 + date.getUTCMonth() + months;
    const year = Math.floor(index / 12);
    const month = index - year * 12;
    const day = Math.min(monthEnd ? 31 : date.getUTCDate(), getDaysInMonth(year, month));
    return excelDateSerial(new Date(Date.UTC(year, month, day)), dateSystem);
}

function targetPosition(target: number, first: number, history: ITimeline, dateSystem: DateSystem): number {
    if (history.monthStep === 0) return (target - first) / history.step;
    if (target > MAX_DATE_SERIAL) return NaN;
    const { monthStep, calendarDay } = history;
    const origin = excelSerialToDate(history.first, dateSystem);
    const anchor = (period: number) => excelDateSerial(
        new Date(Date.UTC(origin.getUTCFullYear(), origin.getUTCMonth() + period * monthStep, calendarDay)),
        dateSystem
    );
    let period = Math.floor(calendarMonthDistance(history.first, target, dateSystem) / monthStep);
    // The forecast axis keeps the calendar day even when it rolls into the following month.
    while (target < anchor(period)) period--;
    const start = calendarMonthDistance(history.first, first, dateSystem) / monthStep;
    const previous = anchor(period);
    return period - start + (target - previous) / (anchor(period + 1) - previous);
}

function calendarMonthDistance(first: number, last: number, dateSystem: DateSystem): number {
    const start = excelSerialToDate(first, dateSystem);
    const end = excelSerialToDate(last, dateSystem);
    return 12 * (end.getUTCFullYear() - start.getUTCFullYear()) + end.getUTCMonth() - start.getUTCMonth();
}
