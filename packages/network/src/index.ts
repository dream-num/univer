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

export { type IUniverNetworkPluginConfig, UniverNetworkPlugin } from './plugin';
export { HTTPHeaders } from './services/http/headers';
export { HTTPService } from './services/http/http.service';
export { IHTTPImplementation } from './services/http/implementations/implementation';
export { FetchHTTPImplementation } from './services/http/implementations/fetch';
export { XHRHTTPImplementation } from './services/http/implementations/xhr';
export { HTTPRequest, type HTTPRequestMethod } from './services/http/request';
export { type HTTPResponseType, HTTPStatusCode } from './services/http/http';
export {
    type HTTPEvent,
    HTTPEventType,
    HTTPProgress,
    HTTPResponse,
    type HTTPResponseBody,
    HTTPResponseError,
    ResponseHeader,
} from './services/http/response';
export {
    type ISocket,
    ISocketService,
    type SocketBodyType,
    WebSocketService,
} from './services/web-socket/web-socket.service';
export type { IPostRequestParams, IRequestParams } from './services/http/http.service';
export type { HTTPHandlerFn, HTTPInterceptorFn, HTTPInterceptorFnFactory } from './services/http/interceptor';
export { type IRetryInterceptorFactoryParams, RetryInterceptorFactory } from './services/http/interceptors/retry-interceptor';
export { ThresholdInterceptorFactory } from './services/http/interceptors/threshold-interceptor';
export { AuthInterceptorFactory, type IAuthInterceptorParams } from './services/http/interceptors/auth-interceptor';
export { MergeInterceptorFactory } from './services/http/interceptors/merge-interceptor';
