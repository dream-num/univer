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

export enum ErrorCode {
    /** UNDEFINED - general codes */
    UNDEFINED = 0,
    OK = 1,
    INTERNAL_ERROR = 2,
    PERMISSION_DENIED = 3,
    NOT_FOUND = 4,
    UNAUTHENTICATED = 5,
    ALREADY_EXISTS = 6,
    INVALID_ARGUMENT = 7,
    TOO_MANY_REQUESTS = 8,
    COMPLETION_FINISHED = 9,
    /** LOGIN_FAILED - login */
    LOGIN_FAILED = 10,
    MOBILE_VERIFY_CODE_MISMATCH = 11,
    MOBILE_VERIFY_CODE_NOT_FOUND_OR_EXPIRED = 12,
    EMAIL_VERIFY_CODE_MISMATCH = 13,
    EMAIL_VERIFY_CODE_NOT_FOUND_OR_EXPIRED = 14,
    AUTHORIZE_CODE_ILLEGAL = 15,
    LOGIN_TOKEN_PROCESSING_FAILED = 16,
    /** CURRENT_STATUS_CANNOT_OPERATE - biz cmn codes with 100 shift */
    CURRENT_STATUS_CANNOT_OPERATE = 100,
    ERROR_AGAIN = 101,
    /** USER_NOT_FOUND - user codes with 200 shift */
    USER_NOT_FOUND = 201,
    USER_IS_ANONYMOUS = 202,
    /** CHANGESET_REVISION_CONFILICT - changeset codes with 5000 shift */
    CHANGESET_REVISION_CONFILICT = 5001,
    /** SNAPSHOT_INVALID_SNAPSHOT - snapshotError codes with 6000 shift */
    SNAPSHOT_INVALID_SNAPSHOT = 6001,
    SNAPSHOT_HAS_BEEN_REMOVED = 6002,
    ENSURE_SNAPSHOT_EXECUTION = 6003,
    /** APPLY_REJECT - apply service codes with 7000 shift */
    APPLY_REJECT = 7001,
    /** APPLY_NON_SEQUENTIAL_REVISION - apply service expects sequential revisions, otherwise return this code */
    APPLY_NON_SEQUENTIAL_REVISION = 7002,
    /** APPLY_REVISION_CONFILICT - save changeset failed because of revision exists */
    APPLY_REVISION_CONFILICT = 7003,
    /** APPLY_PERMISSION_DENIED - apply failed because of the user permission denied */
    APPLY_PERMISSION_DENIED = 7004,
    /** APPLY_DUPLICATED - if the changeset has been applied before, return this code */
    APPLY_DUPLICATED = 7005,
    /** CONNECTOR_DATA_TOO_LARGE - connector codes with 8000 shift */
    CONNECTOR_DATA_TOO_LARGE = 8001,
    /** LICENSE_MAX_UNITS_EXCEEDED - license code with 9000 shift */
    LICENSE_MAX_UNITS_EXCEEDED = 9001,
    LICENSE_MAX_MEMBERS_PER_UNIT_EXCEEDED = 9002,
    LICENSE_IMPORT_SIZE_EXCEEDED = 9003,
    LICENSE_EXPORT_SIZE_EXCEEDED = 9004,
    /** LICENSE_DISTRO_REJECTED - the feature not allowed for the distro */
    LICENSE_DISTRO_REJECTED = 9005,
    /** YUUMI_UNABLE_LOAD_URL - yuumi */
    YUUMI_UNABLE_LOAD_URL = 10001,
    YUUMI_URL_COL_OUT_OF_RANGE = 10002,
    YUUMI_RATE_OVER_LIMIT = 10003,
    YUUMI_SUBSCRIPTION_NOT_FOUND = 10004,
    /** YUUMI_NO_CUBOID_FOR_QUESTION - yuumi AI */
    YUUMI_NO_CUBOID_FOR_QUESTION = 10010,
    YUUMI_ASYNCIO_CANCELLED = 10011,
    YUUMI_TABLE_NOT_FOUND_IN_UNIT = 10012,
    YUUMI_ALL_TABLES_IS_INVALID = 10013,
    YUUMI_PROMPT_MAX_TOKENS_EXCEEDED = 10014,
    YUUMI_AI_RUN_FAILED = 10015,
    YUUMI_CONNECTOR_URL_NOT_FOUND = 10016,
    /** PY_RUNTIME_SCRIPT_ERROR - py-runtime */
    PY_RUNTIME_SCRIPT_ERROR = 11001,
    /** INVITE_CODE_HAS_BEEN_UES - invite-code */
    INVITE_CODE_HAS_BEEN_UES = 12001,
    INVALID_INVITE_CODE = 12002,
    INVITE_CODE_REQUIRED = 12003,
    USER_NOT_INVITED_CODE = 12004,
    INVITE_CODE_ALREADY_BOUND = 12005,
    /** WECHAT_HAS_BEEN_BOUND - user profile */
    WECHAT_HAS_BEEN_BOUND = 13001,
    MOBILE_HAS_BEEN_BOUND = 13002,
    EMAIL_HAS_BEEN_BOUND = 13003,
    /** ENTITLE_CAN_NOT_BUY_LOWER_OTP - entitlement domain errors */
    ENTITLE_CAN_NOT_BUY_LOWER_OTP = 14001,
    /** ENTITLE_UPDOWN_GRADE_NOT_SUPPORT - subscription upgrade/downgrade is not supported */
    ENTITLE_UPDOWN_GRADE_NOT_SUPPORT = 14002,
    /** ENTITLE_DUP_SUBSCRIPTION - duplicate subscription */
    ENTITLE_DUP_SUBSCRIPTION = 14003,
    /** PAYMENT_CHANNEL_NOT_SUPPORT - payment channel is not supported */
    PAYMENT_CHANNEL_NOT_SUPPORT = 14004,
    /** ENTITLE_INVALID_COUPON_CODE - invalid coupon code */
    ENTITLE_INVALID_COUPON_CODE = 14005,
    /** ENTITLE_COUPON_EXPIRED - coupon expired */
    ENTITLE_COUPON_EXPIRED = 14006,
    /** ENTITLE_COUPON_USED_UP - coupon used up */
    ENTITLE_COUPON_USED_UP = 14007,
    /** ENTITLE_USE_COUPON_NOT_1ST_TRADE - not the first purchase, cannot use coupon */
    ENTITLE_USE_COUPON_NOT_1ST_TRADE = 14008,
    /** ENTITLE_CHAT_LIMIT_EXCEED - chat rate limit exceeded */
    ENTITLE_CHAT_LIMIT_EXCEED = 14101,
    /** ENTITLE_REPORT_LIMIT_EXCEED - report rate limit exceeded */
    ENTITLE_REPORT_LIMIT_EXCEED = 14102,
    /** ENTITLE_INSUFFICIENT_QUOTA - insufficient quota */
    ENTITLE_INSUFFICIENT_QUOTA = 14103,
    /** ENTITLE_NEED_BILLING_ADDRESS - billing address required */
    ENTITLE_NEED_BILLING_ADDRESS = 14301,
    /** REDEMPTION_INVALID_CODE - redemption code domain errors */
    REDEMPTION_INVALID_CODE = 15001,
    /** REDEMPTION_CODE_INACTIVE - code inactive */
    REDEMPTION_CODE_INACTIVE = 15002,
    /** REDEMPTION_CODE_FULLY_REDEEMED - fully redeemed */
    REDEMPTION_CODE_FULLY_REDEEMED = 15003,
    /** REDEMPTION_CODE_NOT_STARTED - not started yet */
    REDEMPTION_CODE_NOT_STARTED = 15004,
    /** REDEMPTION_USER_NOT_ELIGIBLE - user not eligible */
    REDEMPTION_USER_NOT_ELIGIBLE = 15005,
    /** REDEMPTION_USER_REDEEM_TIMES_EXCEED - user redemption limit exceeded */
    REDEMPTION_USER_REDEEM_TIMES_EXCEED = 15006,
    /** REDEMPTION_CODE_HAS_BEEN_CREATED - redemption code already exists */
    REDEMPTION_CODE_HAS_BEEN_CREATED = 15007,
    /** DATA_SOURCE_TOO_LARGE - data source errors */
    DATA_SOURCE_TOO_LARGE = 16001,
    UNRECOGNIZED = -1,
}

export interface IError {
    code: ErrorCode;
    message: string;
}
