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

import { Avedev } from './avedev';
import { Average } from './average';
import { AverageWeighted } from './average-weighted';
import { Averagea } from './averagea';
import { Averageif } from './averageif';
import { Averageifs } from './averageifs';
import { BetaDist } from './beta-dist';
import { BetaInv } from './beta-inv';
import { BinomDist } from './binom-dist';
import { BinomDistRange } from './binom-dist-range';
import { BinomInv } from './binom-inv';
import { ChisqDist } from './chisq-dist';
import { ChisqDistRt } from './chisq-dist-rt';
import { ChisqInv } from './chisq-inv';
import { ChisqInvRt } from './chisq-inv-rt';
import { ChisqTest } from './chisq-test';
import { ConfidenceNorm } from './confidence-norm';
import { ConfidenceT } from './confidence-t';
import { Correl } from './correl';
import { Count } from './count';
import { Counta } from './counta';
import { Countblank } from './countblank';
import { Countif } from './countif';
import { Countifs } from './countifs';
import { CovarianceP } from './covariance-p';
import { CovarianceS } from './covariance-s';
import { Devsq } from './devsq';
import { ExponDist } from './expon-dist';
import { FDist } from './f-dist';
import { FDistRt } from './f-dist-rt';
import { FInv } from './f-inv';
import { FInvRt } from './f-inv-rt';
import { FTest } from './f-test';
import { Fisher } from './fisher';
import { Fisherinv } from './fisherinv';
import { Forecast } from './forecast';
import { Frequency } from './frequency';
import { FUNCTION_NAMES_STATISTICAL } from './function-names';
import { Gamma } from './gamma';
import { GammaDist } from './gamma-dist';
import { GammaInv } from './gamma-inv';
import { Gammaln } from './gammaln';
import { Gauss } from './gauss';
import { Geomean } from './geomean';
import { Growth } from './growth';
import { Harmean } from './harmean';
import { HypgeomDist } from './hypgeom-dist';
import { Intercept } from './intercept';
import { Kurt } from './kurt';
import { Large } from './large';
import { Linest } from './linest';
import { Logest } from './logest';
import { LognormDist } from './lognorm-dist';
import { LognormInv } from './lognorm-inv';
import { Marginoferror } from './marginoferror';
import { Max } from './max';
import { Maxa } from './maxa';
import { Maxifs } from './maxifs';
import { Median } from './median';
import { Min } from './min';
import { Mina } from './mina';
import { Minifs } from './minifs';
import { ModeMult } from './mode-mult';
import { ModeSngl } from './mode-sngl';
import { NegbinomDist } from './negbinom-dist';
import { NormDist } from './norm-dist';
import { NormInv } from './norm-inv';
import { NormSDist } from './norm-s-dist';
import { NormSInv } from './norm-s-inv';
import { Pearson } from './pearson';
import { PercentileExc } from './percentile-exc';
import { PercentileInc } from './percentile-inc';
import { PercentrankExc } from './percentrank-exc';
import { PercentrankInc } from './percentrank-inc';
import { Permut } from './permut';
import { Permutationa } from './permutationa';
import { Phi } from './phi';
import { PoissonDist } from './poisson-dist';
import { Prob } from './prob';
import { QuartileExc } from './quartile-exc';
import { QuartileInc } from './quartile-inc';
import { RankAvg } from './rank-avg';
import { RankEq } from './rank-eq';
import { Rsq } from './rsq';
import { Skew } from './skew';
import { SkewP } from './skew-p';
import { Slope } from './slope';
import { Small } from './small';
import { Standardize } from './standardize';
import { StdevP } from './stdev-p';
import { StdevS } from './stdev-s';
import { Stdeva } from './stdeva';
import { Stdevpa } from './stdevpa';
import { Steyx } from './steyx';
import { TDist } from './t-dist';
import { TDist2t } from './t-dist-2t';
import { TDistRt } from './t-dist-rt';
import { TInv } from './t-inv';
import { TInv2t } from './t-inv-2t';
import { TTest } from './t-test';
import { Trend } from './trend';
import { Trimmean } from './trimmean';
import { VarP } from './var-p';
import { VarS } from './var-s';
import { Vara } from './vara';
import { Varpa } from './varpa';
import { WeibullDist } from './weibull-dist';
import { ZTest } from './z-test';

export const functionStatistical = [
    [Avedev, FUNCTION_NAMES_STATISTICAL.AVEDEV],
    [Average, FUNCTION_NAMES_STATISTICAL.AVERAGE],
    [AverageWeighted, FUNCTION_NAMES_STATISTICAL.AVERAGE_WEIGHTED],
    [Averagea, FUNCTION_NAMES_STATISTICAL.AVERAGEA],
    [Averageif, FUNCTION_NAMES_STATISTICAL.AVERAGEIF],
    [Averageifs, FUNCTION_NAMES_STATISTICAL.AVERAGEIFS],
    [BetaDist, FUNCTION_NAMES_STATISTICAL.BETA_DIST],
    [BetaInv, FUNCTION_NAMES_STATISTICAL.BETA_INV],
    [BinomDist, FUNCTION_NAMES_STATISTICAL.BINOM_DIST],
    [BinomDistRange, FUNCTION_NAMES_STATISTICAL.BINOM_DIST_RANGE],
    [BinomInv, FUNCTION_NAMES_STATISTICAL.BINOM_INV],
    [ChisqDist, FUNCTION_NAMES_STATISTICAL.CHISQ_DIST],
    [ChisqDistRt, FUNCTION_NAMES_STATISTICAL.CHISQ_DIST_RT],
    [ChisqInv, FUNCTION_NAMES_STATISTICAL.CHISQ_INV],
    [ChisqInvRt, FUNCTION_NAMES_STATISTICAL.CHISQ_INV_RT],
    [ChisqTest, FUNCTION_NAMES_STATISTICAL.CHISQ_TEST],
    [ConfidenceNorm, FUNCTION_NAMES_STATISTICAL.CONFIDENCE_NORM],
    [ConfidenceT, FUNCTION_NAMES_STATISTICAL.CONFIDENCE_T],
    [Correl, FUNCTION_NAMES_STATISTICAL.CORREL],
    [Count, FUNCTION_NAMES_STATISTICAL.COUNT],
    [Counta, FUNCTION_NAMES_STATISTICAL.COUNTA],
    [Countblank, FUNCTION_NAMES_STATISTICAL.COUNTBLANK],
    [Countif, FUNCTION_NAMES_STATISTICAL.COUNTIF],
    [Countifs, FUNCTION_NAMES_STATISTICAL.COUNTIFS],
    [CovarianceP, FUNCTION_NAMES_STATISTICAL.COVARIANCE_P],
    [CovarianceS, FUNCTION_NAMES_STATISTICAL.COVARIANCE_S],
    [Devsq, FUNCTION_NAMES_STATISTICAL.DEVSQ],
    [ExponDist, FUNCTION_NAMES_STATISTICAL.EXPON_DIST],
    [FDist, FUNCTION_NAMES_STATISTICAL.F_DIST],
    [FDistRt, FUNCTION_NAMES_STATISTICAL.F_DIST_RT],
    [FInv, FUNCTION_NAMES_STATISTICAL.F_INV],
    [FInvRt, FUNCTION_NAMES_STATISTICAL.F_INV_RT],
    [FTest, FUNCTION_NAMES_STATISTICAL.F_TEST],
    [Fisher, FUNCTION_NAMES_STATISTICAL.FISHER],
    [Fisherinv, FUNCTION_NAMES_STATISTICAL.FISHERINV],
    [Forecast, FUNCTION_NAMES_STATISTICAL.FORECAST],
    [Forecast, FUNCTION_NAMES_STATISTICAL.FORECAST_LINEAR],
    [Frequency, FUNCTION_NAMES_STATISTICAL.FREQUENCY],
    [Gamma, FUNCTION_NAMES_STATISTICAL.GAMMA],
    [GammaDist, FUNCTION_NAMES_STATISTICAL.GAMMA_DIST],
    [GammaInv, FUNCTION_NAMES_STATISTICAL.GAMMA_INV],
    [Gammaln, FUNCTION_NAMES_STATISTICAL.GAMMALN],
    [Gammaln, FUNCTION_NAMES_STATISTICAL.GAMMALN_PRECISE],
    [Gauss, FUNCTION_NAMES_STATISTICAL.GAUSS],
    [Geomean, FUNCTION_NAMES_STATISTICAL.GEOMEAN],
    [Growth, FUNCTION_NAMES_STATISTICAL.GROWTH],
    [Harmean, FUNCTION_NAMES_STATISTICAL.HARMEAN],
    [HypgeomDist, FUNCTION_NAMES_STATISTICAL.HYPGEOM_DIST],
    [Intercept, FUNCTION_NAMES_STATISTICAL.INTERCEPT],
    [Kurt, FUNCTION_NAMES_STATISTICAL.KURT],
    [Large, FUNCTION_NAMES_STATISTICAL.LARGE],
    [Linest, FUNCTION_NAMES_STATISTICAL.LINEST],
    [Logest, FUNCTION_NAMES_STATISTICAL.LOGEST],
    [LognormDist, FUNCTION_NAMES_STATISTICAL.LOGNORM_DIST],
    [LognormInv, FUNCTION_NAMES_STATISTICAL.LOGNORM_INV],
    [Marginoferror, FUNCTION_NAMES_STATISTICAL.MARGINOFERROR],
    [Max, FUNCTION_NAMES_STATISTICAL.MAX],
    [Maxa, FUNCTION_NAMES_STATISTICAL.MAXA],
    [Maxifs, FUNCTION_NAMES_STATISTICAL.MAXIFS],
    [Median, FUNCTION_NAMES_STATISTICAL.MEDIAN],
    [Min, FUNCTION_NAMES_STATISTICAL.MIN],
    [Mina, FUNCTION_NAMES_STATISTICAL.MINA],
    [Minifs, FUNCTION_NAMES_STATISTICAL.MINIFS],
    [ModeMult, FUNCTION_NAMES_STATISTICAL.MODE_MULT],
    [ModeSngl, FUNCTION_NAMES_STATISTICAL.MODE_SNGL],
    [NegbinomDist, FUNCTION_NAMES_STATISTICAL.NEGBINOM_DIST],
    [NormDist, FUNCTION_NAMES_STATISTICAL.NORM_DIST],
    [NormInv, FUNCTION_NAMES_STATISTICAL.NORM_INV],
    [NormSDist, FUNCTION_NAMES_STATISTICAL.NORM_S_DIST],
    [NormSInv, FUNCTION_NAMES_STATISTICAL.NORM_S_INV],
    [Pearson, FUNCTION_NAMES_STATISTICAL.PEARSON],
    [PercentileExc, FUNCTION_NAMES_STATISTICAL.PERCENTILE_EXC],
    [PercentileInc, FUNCTION_NAMES_STATISTICAL.PERCENTILE_INC],
    [PercentrankExc, FUNCTION_NAMES_STATISTICAL.PERCENTRANK_EXC],
    [PercentrankInc, FUNCTION_NAMES_STATISTICAL.PERCENTRANK_INC],
    [Permut, FUNCTION_NAMES_STATISTICAL.PERMUT],
    [Permutationa, FUNCTION_NAMES_STATISTICAL.PERMUTATIONA],
    [Phi, FUNCTION_NAMES_STATISTICAL.PHI],
    [PoissonDist, FUNCTION_NAMES_STATISTICAL.POISSON_DIST],
    [Prob, FUNCTION_NAMES_STATISTICAL.PROB],
    [QuartileExc, FUNCTION_NAMES_STATISTICAL.QUARTILE_EXC],
    [QuartileInc, FUNCTION_NAMES_STATISTICAL.QUARTILE_INC],
    [RankAvg, FUNCTION_NAMES_STATISTICAL.RANK_AVG],
    [RankEq, FUNCTION_NAMES_STATISTICAL.RANK_EQ],
    [Rsq, FUNCTION_NAMES_STATISTICAL.RSQ],
    [Skew, FUNCTION_NAMES_STATISTICAL.SKEW],
    [SkewP, FUNCTION_NAMES_STATISTICAL.SKEW_P],
    [Slope, FUNCTION_NAMES_STATISTICAL.SLOPE],
    [Small, FUNCTION_NAMES_STATISTICAL.SMALL],
    [Standardize, FUNCTION_NAMES_STATISTICAL.STANDARDIZE],
    [StdevP, FUNCTION_NAMES_STATISTICAL.STDEV_P],
    [StdevS, FUNCTION_NAMES_STATISTICAL.STDEV_S],
    [Stdeva, FUNCTION_NAMES_STATISTICAL.STDEVA],
    [Stdevpa, FUNCTION_NAMES_STATISTICAL.STDEVPA],
    [Steyx, FUNCTION_NAMES_STATISTICAL.STEYX],
    [TDist, FUNCTION_NAMES_STATISTICAL.T_DIST],
    [TDist2t, FUNCTION_NAMES_STATISTICAL.T_DIST_2T],
    [TDistRt, FUNCTION_NAMES_STATISTICAL.T_DIST_RT],
    [TInv, FUNCTION_NAMES_STATISTICAL.T_INV],
    [TInv2t, FUNCTION_NAMES_STATISTICAL.T_INV_2T],
    [TTest, FUNCTION_NAMES_STATISTICAL.T_TEST],
    [Trend, FUNCTION_NAMES_STATISTICAL.TREND],
    [Trimmean, FUNCTION_NAMES_STATISTICAL.TRIMMEAN],
    [VarP, FUNCTION_NAMES_STATISTICAL.VAR_P],
    [VarS, FUNCTION_NAMES_STATISTICAL.VAR_S],
    [Vara, FUNCTION_NAMES_STATISTICAL.VARA],
    [Varpa, FUNCTION_NAMES_STATISTICAL.VARPA],
    [WeibullDist, FUNCTION_NAMES_STATISTICAL.WEIBULL_DIST],
    [ZTest, FUNCTION_NAMES_STATISTICAL.Z_TEST],
];
