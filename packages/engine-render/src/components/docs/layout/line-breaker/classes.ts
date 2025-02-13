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

export const OP = 0; // Opening punctuation
export const CL = 1; // Closing punctuation
export const CP = 2; // Closing parenthesis
export const QU = 3; // Ambiguous quotation
export const GL = 4; // Glue
export const NS = 5; // Non-starters
export const EX = 6; // Exclamation/Interrogation
export const SY = 7; // Symbols allowing break after
export const IS = 8; // Infix separator
export const PR = 9; // Prefix
export const PO = 10; // Postfix
export const NU = 11; // Numeric
export const AL = 12; // Alphabetic
export const HL = 13; // Hebrew Letter
export const ID = 14; // Ideographic
export const IN = 15; // Inseparable characters
export const HY = 16; // Hyphen
export const BA = 17; // Break after
export const BB = 18; // Break before
export const B2 = 19; // Break on either side (but not pair)
export const ZW = 20; // Zero-width space
export const CM = 21; // Combining marks
export const WJ = 22; // Word joiner
export const H2 = 23; // Hangul LV
export const H3 = 24; // Hangul LVT
export const JL = 25; // Hangul L Jamo
export const JV = 26; // Hangul V Jamo
export const JT = 27; // Hangul T Jamo
export const RI = 28; // Regional Indicator
export const EB = 29; // Emoji Base
export const EM = 30; // Emoji Modifier
export const ZWJ = 31; // Zero Width Joiner
export const CB = 32; // Contingent break

// The following break classes are not handled by the pair table
export const AI = 33; // Ambiguous (Alphabetic or Ideograph)
export const BK = 34; // Break (mandatory)
export const CJ = 35; // Conditional Japanese Starter
export const CR = 36; // Carriage return
export const LF = 37; // Line feed
export const NL = 38; // Next line
export const SA = 39; // South-East Asian
export const SG = 40; // Surrogates
export const SP = 41; // Space
export const XX = 42; // Unknown
