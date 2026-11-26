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

import type { IUniverEngineFormulaConfig } from '../../config/config';
import type { FunctionVariantType } from '../../engine/reference-object/base-reference-object';
import type { BaseValueObject } from '../../engine/value-object/base-value-object';
import { getFinancialNumberByObject } from '../../basics/date';
import { ErrorType } from '../../basics/error-type';
import { calculateCompoundingTerm } from '../../basics/financial';
import { ErrorValueObject } from '../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';
import { ExcelRate } from './excel-rate';
import { FUNCTION_NAMES_FINANCIAL } from './function-names';
import { Fv } from './fv';
import { Ipmt } from './ipmt';
import { Ispmt } from './ispmt';
import { Nper } from './nper';
import { Pmt } from './pmt';
import { Ppmt } from './ppmt';
import { Pv } from './pv';
import { mapFinancialScalars, resolveSingleCellArgument } from './scalar-arguments';

const MIN_NORMAL = 2 ** -1022;
const LOG_MIN_NORMAL = Math.log(MIN_NORMAL);

function calculatePayment(rate: number, periods: number, pv: number, fv: number, type: number): number {
    if (rate === 0) return -(pv + fv) / periods;
    const term = periods * Math.log1p(rate);
    if (term < LOG_MIN_NORMAL) return NaN;
    return -((fv * rate) / Math.expm1(term) - (pv * rate) / Math.expm1(-term)) / (1 + rate * type);
}

class ExcelPv extends Pv {
    protected override _domainError(rate: number, periods: number, term: number): ErrorType | undefined {
        if (rate === -1) return periods === 0 ? ErrorType.NUM : ErrorType.DIV_BY_ZERO;
        return Math.abs(term) < MIN_NORMAL ? ErrorType.DIV_BY_ZERO : undefined;
    }
}

class ExcelFv extends Fv {
    protected override _domainError(rate: number, periods: number): ErrorType | undefined {
        if (rate !== -1) return undefined;
        if (periods === 0) return ErrorType.NUM;
        return periods < 0 ? ErrorType.DIV_BY_ZERO : undefined;
    }

    protected override _calculateValue(rate: number, periods: number, payment: number, pv: number, type: number): number {
        if (rate === 0) return -pv - payment * periods;
        const term = calculateCompoundingTerm(rate, periods);
        return -pv * term - payment * (1 + rate * type) * (term - 1) / rate;
    }
}

class ExcelPmt extends Pmt {
    protected override _calculateValue(...args: Parameters<typeof calculatePayment>): number {
        return calculatePayment(...args);
    }
}

class ExcelNper extends Nper {
    protected override _isZeroDivisor(rate: number, payment: number): boolean {
        return super._isZeroDivisor(rate, payment) || (rate !== 0 && 1 + rate === 1);
    }

    protected override _supportsRate(rate: number): boolean {
        return rate > -1;
    }
}

class ExcelIpmt extends Ipmt {
    protected override _isPaymentDomainValid(rate: number, period: number, periods: number, type: number): boolean {
        return period >= 1 && period - periods < 1 && (rate > -1 || (period === 1 && type !== 0));
    }

    protected override _calculateValue(rate: number, period: number, periods: number, pv: number, fv: number, type: number): number {
        if (rate === 0 || (period === 1 && type === 1)) return 0;
        const growth = Math.log1p(rate);
        const term = periods * growth;
        if (term < LOG_MIN_NORMAL) return NaN;
        if (period === 1) return -pv * rate;
        const elapsed = (period - 1) * growth;
        const remaining = (periods - (period - 1)) * growth;
        const balance = rate > 0
            ? (pv * -Math.expm1(-remaining) + fv * Math.exp(-remaining) * Math.expm1(-elapsed)) / -Math.expm1(-term)
            : (pv * Math.exp(elapsed) * Math.expm1(remaining) - fv * Math.expm1(elapsed)) / Math.expm1(term);
        return -balance * rate / (1 + rate * type);
    }
}

class ExcelIspmt extends Ispmt {
    protected override _calculateValue(rate: number, period: number, periods: number, presentValue: number): BaseValueObject {
        const result = (period - periods) * presentValue * rate / periods;
        return Number.isFinite(result) ? NumberValueObject.create(result) : ErrorValueObject.create(ErrorType.NUM);
    }
}

class ExcelPpmt extends Ppmt {
    protected override _isPaymentDomainValid(rate: number, period: number, periods: number): boolean {
        return rate > -1 && period >= 1 && period - periods < 1;
    }

    protected override _calculateValue(rate: number, period: number, periods: number, pv: number, fv: number, type: number): number {
        if (rate === 0 || (period === 1 && type === 1)) return calculatePayment(rate, periods, pv, fv, type);
        const growth = Math.log1p(rate);
        const term = periods * growth;
        if (term < LOG_MIN_NORMAL) return NaN;
        // Payment minus interest loses principal when the two nearly cancel.
        const elapsed = period - 1 - type;
        const discount = rate > 0
            ? Math.exp((elapsed - periods) * growth) / -Math.expm1(-term)
            : Math.exp(elapsed * growth) / Math.expm1(term);
        return -(pv + fv) * rate * discount;
    }
}

abstract class ExcelCumulativePayment extends BaseFunction {
    override minParams = 6;

    override maxParams = 6;

    override needsReferenceObject = true;

    protected abstract readonly principal: boolean;

    override calculate(...input: FunctionVariantType[]): BaseValueObject {
        return mapFinancialScalars(input.map(resolveSingleCellArgument), (args) => this._calculate(args));
    }

    private _calculate(args: BaseValueObject[]): BaseValueObject {
        const values: number[] = [];
        for (const arg of args) {
            const value = getFinancialNumberByObject(arg, this.getDateSystem());
            if (typeof value !== 'number') return value;
            values.push(value);
        }
        const [rate, periods, pv, startPeriod, endPeriod, type] = values;
        if (rate <= 0 || periods <= 0 || pv <= 0 || startPeriod < 1 || endPeriod < startPeriod || endPeriod > periods || (type !== 0 && type !== 1)) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const start = Math.ceil(startPeriod);
        const end = Math.floor(endPeriod);
        const firstPayment = type === 1 && start === 1;
        const count = Math.max(0, end - start + (firstPayment ? 0 : 1));
        const growth = Math.log1p(rate);
        const denominator = -Math.expm1(-periods * growth);
        const payment = -(pv * rate) / denominator / (1 + rate * type);
        // Sum the discounted principal installments as a geometric series.
        const groupedPrincipal = -pv * Math.exp((end - type - periods) * growth) * -Math.expm1(-count * growth) / denominator;
        const result = this.principal
            ? groupedPrincipal + (firstPayment ? payment : 0)
            : 1 + rate === 1 ? 0 : payment * count - groupedPrincipal;
        return Number.isFinite(result) ? NumberValueObject.create(result) : ErrorValueObject.create(ErrorType.NUM);
    }
}

class ExcelCumipmt extends ExcelCumulativePayment {
    protected readonly principal = false;
}

class ExcelCumprinc extends ExcelCumulativePayment {
    protected readonly principal = true;
}

export const excelAnnuityFunctions: NonNullable<IUniverEngineFormulaConfig['function']> = [
    [ExcelPv, FUNCTION_NAMES_FINANCIAL.PV],
    [ExcelFv, FUNCTION_NAMES_FINANCIAL.FV],
    [ExcelPmt, FUNCTION_NAMES_FINANCIAL.PMT],
    [ExcelNper, FUNCTION_NAMES_FINANCIAL.NPER],
    [ExcelRate, FUNCTION_NAMES_FINANCIAL.RATE],
    [ExcelIpmt, FUNCTION_NAMES_FINANCIAL.IPMT],
    [ExcelIspmt, FUNCTION_NAMES_FINANCIAL.ISPMT],
    [ExcelPpmt, FUNCTION_NAMES_FINANCIAL.PPMT],
    [ExcelCumipmt, FUNCTION_NAMES_FINANCIAL.CUMIPMT],
    [ExcelCumprinc, FUNCTION_NAMES_FINANCIAL.CUMPRINC],
];
