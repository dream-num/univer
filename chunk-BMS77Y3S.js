import {
  Disposable,
  DisposableCollection,
  IConfigService,
  ILogService,
  Inject,
  Injector,
  LookUp,
  Observable,
  Plugin,
  Quantity,
  concatMap,
  createIdentifier,
  firstValueFrom,
  mergeOverrideWithDependencies,
  merge_default,
  of,
  registerDependencies,
  remove,
  share,
  toDisposable
} from "./chunk-EJSPXROI.js";
import {
  __decorateClass,
  __decorateParam,
  __publicField
} from "./chunk-24OICD5T.js";

// ../packages/network/package.json
var package_default = {
  name: "@univerjs/network",
  version: "0.25.2",
  private: false,
  description: "Network service abstractions for Univer runtime integrations.",
  author: "DreamNum Co., Ltd. <developer@univer.ai>",
  license: "Apache-2.0",
  funding: {
    type: "opencollective",
    url: "https://opencollective.com/univer"
  },
  homepage: "https://univer.ai",
  repository: {
    type: "git",
    url: "https://github.com/dream-num/univer"
  },
  bugs: {
    url: "https://github.com/dream-num/univer/issues"
  },
  keywords: [
    "univer",
    "network",
    "http",
    "collaboration",
    "plugin"
  ],
  exports: {
    ".": "./src/index.ts",
    "./*": "./src/*",
    "./facade": "./src/facade/index.ts"
  },
  main: "./src/index.ts",
  types: "./lib/types/index.d.ts",
  publishConfig: {
    access: "public",
    main: "./lib/es/index.js",
    module: "./lib/es/index.js",
    exports: {
      ".": {
        import: "./lib/es/index.js",
        require: "./lib/cjs/index.js",
        types: "./lib/types/index.d.ts"
      },
      "./*": {
        import: "./lib/es/*",
        require: "./lib/cjs/*",
        types: "./lib/types/index.d.ts"
      },
      "./facade": {
        import: "./lib/es/facade.js",
        require: "./lib/cjs/facade.js",
        types: "./lib/types/facade/index.d.ts"
      },
      "./lib/facade": {
        import: "./lib/es/facade.js",
        require: "./lib/cjs/facade.js",
        types: "./lib/types/facade/index.d.ts"
      },
      "./lib/*": "./lib/*"
    }
  },
  directories: {
    lib: "lib"
  },
  files: [
    "lib"
  ],
  scripts: {
    test: "vitest run",
    "test:watch": "vitest",
    coverage: "vitest run --coverage",
    typecheck: "tsc --noEmit",
    "build:bundle": "univer-cli build",
    "build:types": "tsc -p tsconfig.node.json",
    build: "pnpm run build:bundle && pnpm run build:types"
  },
  peerDependencies: {
    rxjs: ">=7.0.0"
  },
  dependencies: {
    "@univerjs/core": "workspace:*"
  },
  devDependencies: {
    "@univerjs-infra/shared": "workspace:*",
    rxjs: "^7.8.2",
    typescript: "^6.0.3",
    vitest: "^4.1.7"
  }
};

// ../packages/network/src/config/config.ts
var NETWORK_PLUGIN_CONFIG_KEY = "network.config";
var configSymbol = Symbol(NETWORK_PLUGIN_CONFIG_KEY);
var defaultPluginConfig = {};

// ../packages/network/src/services/http/headers.ts
var ApplicationJSONType = "application/json";
function isApplicationJSONType(contentType) {
  if (Array.isArray(contentType)) {
    return contentType.some((type) => type.includes(ApplicationJSONType));
  }
  return contentType.includes(ApplicationJSONType);
}
var HTTPHeaders = class {
  constructor(headers) {
    __publicField(this, "_headers", /* @__PURE__ */ new Map());
    if (typeof headers === "string") {
      this._handleHeadersString(headers);
    } else if (headers instanceof Headers) {
      this._handleHeaders(headers);
    } else if (headers) {
      this._handleHeadersConstructorProps(headers);
    }
  }
  forEach(callback) {
    this._headers.forEach((v, key) => callback(key, v));
  }
  has(key) {
    return !!this._headers.has(key.toLowerCase());
  }
  get(key) {
    const k = key.toLowerCase();
    return this._headers.has(k) ? this._headers.get(k) : null;
  }
  set(key, value) {
    this._setHeader(key, value);
  }
  toHeadersInit(body) {
    var _a, _b;
    const headers = {};
    this._headers.forEach((values, key) => {
      headers[key] = values.join(",");
    });
    (_a = headers.accept) != null ? _a : headers.accept = "application/json, text/plain, */*";
    if (!(body instanceof FormData)) {
      (_b = headers["content-type"]) != null ? _b : headers["content-type"] = "application/json;charset=UTF-8";
    }
    return headers;
  }
  _setHeader(name, value) {
    const lowerCase = name.toLowerCase();
    if (this._headers.has(lowerCase)) {
      this._headers.get(lowerCase).push(value.toString());
    } else {
      this._headers.set(lowerCase, [value.toString()]);
    }
  }
  _handleHeadersString(headers) {
    headers.split("\n").forEach((header) => {
      const [name, value] = header.split(":");
      if (name && value) {
        this._setHeader(name, value);
      }
    });
  }
  _handleHeadersConstructorProps(headers) {
    Object.entries(headers).forEach(([name, value]) => this._setHeader(name, value));
  }
  _handleHeaders(headers) {
    headers.forEach((value, name) => this._setHeader(name, value));
  }
};

// ../packages/network/src/services/http/implementations/implementation.ts
var IHTTPImplementation = createIdentifier("network.http-implementation");

// ../packages/network/src/services/http/params.ts
var HTTPParams = class {
  constructor(params) {
    __publicField(this, "params", params);
  }
  toString() {
    if (!this.params) {
      return "";
    }
    return Object.keys(this.params).map((key) => {
      const value = this.params[key];
      if (Array.isArray(value)) {
        return value.map((v) => `${key}=${v}`).join("&");
      }
      return `${key}=${value}`;
    }).join("&");
  }
};

// ../packages/network/src/services/http/request.ts
var HTTPRequestUID = 0;
var HTTPRequest = class {
  constructor(method, url, requestParams) {
    __publicField(this, "method", method);
    __publicField(this, "url", url);
    __publicField(this, "requestParams", requestParams);
    __publicField(this, "uid", HTTPRequestUID++);
  }
  get headers() {
    return this.requestParams.headers;
  }
  get withCredentials() {
    return this.requestParams.withCredentials;
  }
  get responseType() {
    return this.requestParams.responseType;
  }
  getUrlWithParams() {
    var _a, _b;
    const params = (_b = (_a = this.requestParams) == null ? void 0 : _a.params) == null ? void 0 : _b.toString();
    if (!params) {
      return this.url;
    }
    return `${this.url}${this.url.includes("?") ? "&" : "?"}${params}`;
  }
  getBody() {
    var _a, _b;
    const contentType = (_a = this.headers.get("Content-Type")) != null ? _a : ApplicationJSONType;
    const body = (_b = this.requestParams) == null ? void 0 : _b.body;
    if (body instanceof FormData) {
      return body;
    }
    if (isApplicationJSONType(contentType) && body && typeof body === "object") {
      return JSON.stringify(body);
    }
    return body ? `${body}` : null;
  }
  getHeadersInit() {
    var _a;
    const headersInit = this.headers.toHeadersInit((_a = this.requestParams) == null ? void 0 : _a.body);
    return headersInit;
  }
};

// ../packages/network/src/services/http/http.service.ts
var HTTPService = class extends Disposable {
  constructor(_http) {
    super();
    __publicField(this, "_http", _http);
    __publicField(this, "_interceptors", []);
    // eslint-disable-next-line ts/no-explicit-any
    __publicField(this, "_pipe");
  }
  /**
   * Register an HTTP interceptor.
   *
   * @param interceptor the http interceptor
   * @returns a disposable handler to remove the interceptor
   */
  registerHTTPInterceptor(interceptor) {
    if (this._interceptors.indexOf(interceptor) !== -1) {
      throw new Error("[HTTPService]: The interceptor has already been registered!");
    }
    this._interceptors.push(interceptor);
    this._interceptors = this._interceptors.sort((a, b) => {
      var _a, _b;
      return ((_a = a.priority) != null ? _a : 0) - ((_b = b.priority) != null ? _b : 0);
    });
    this._pipe = null;
    return toDisposable(() => remove(this._interceptors, interceptor));
  }
  get(url, params) {
    return this.request("GET", url, params);
  }
  post(url, params) {
    return this.request("POST", url, params);
  }
  put(url, params) {
    return this.request("PUT", url, params);
  }
  delete(url, params) {
    return this.request("DELETE", url, params);
  }
  patch(url, params) {
    return this.request("PATCH", url, params);
  }
  /**
   * The HTTP request implementations. Normally you should use the `get`, `post`, `put`, `delete`,
   * `patch` methods instead.
   * @param method HTTP request method, e.g. GET, POST, PUT, DELETE, etc.
   * @param url The URL to send the request to.
   * @param options Optional parameters for the request.
   * @returns A promise that resolves to the HTTP response.
   */
  async request(method, url, options) {
    var _a, _b;
    const headers = new HTTPHeaders(options == null ? void 0 : options.headers);
    const params = new HTTPParams(options == null ? void 0 : options.params);
    const request = new HTTPRequest(method, url, {
      headers,
      params,
      withCredentials: (_a = options == null ? void 0 : options.withCredentials) != null ? _a : false,
      // default value for withCredentials is false by MDN
      responseType: (_b = options == null ? void 0 : options.responseType) != null ? _b : "json",
      body: ["GET", "DELETE"].includes(method) ? void 0 : options == null ? void 0 : options.body
    });
    const events$ = of(request).pipe(
      concatMap((request2) => this._runInterceptorsAndImplementation(request2))
    );
    const result = await firstValueFrom(events$);
    return result;
  }
  /**
   * Send an HTTP request. It returns an observable that emits HTTP events. For example, it can be used to
   * send Server-Sent Events (SSE) requests.
   * @deprecated Please use `stream` method instead.
   * @param method HTTP request method, e.g. GET, POST, PUT, DELETE, etc.
   * @param url The URL to send the request to.
   * @param _params Optional parameters for the request.
   * @returns An observable of the HTTP event.
   */
  stream(method, url, _params) {
    return this.getSSE(method, url, _params);
  }
  /**
   * Send a Server-Sent Events (SSE) request. It returns an observable that emits HTTP events. It is the observable
   * pair of the `request` method.
   * @deprecated Please use `stream` method instead.
   * @param method HTTP request method, e.g. GET, POST, PUT, DELETE, etc.
   * @param url The URL to send the request to.
   * @param _params Optional parameters for the request.
   * @returns An observable of the HTTP event.
   */
  getSSE(method, url, _params) {
    var _a, _b;
    const headers = new HTTPHeaders(_params == null ? void 0 : _params.headers);
    const params = new HTTPParams(_params == null ? void 0 : _params.params);
    const request = new HTTPRequest(method, url, {
      headers,
      params,
      withCredentials: (_a = _params == null ? void 0 : _params.withCredentials) != null ? _a : false,
      reportProgress: true,
      responseType: (_b = _params == null ? void 0 : _params.responseType) != null ? _b : "json",
      body: ["GET", "DELETE"].includes(method) ? void 0 : _params == null ? void 0 : _params.body
    });
    return of(request).pipe(concatMap((request2) => this._runInterceptorsAndImplementation(request2)));
  }
  // eslint-disable-next-line ts/no-explicit-any
  _runInterceptorsAndImplementation(request) {
    if (!this._pipe) {
      this._pipe = this._interceptors.map((handler) => handler.interceptor).reduceRight(
        (nextHandlerFunction, interceptorFunction) => chainInterceptorFn(nextHandlerFunction, interceptorFunction),
        (requestFromPrevInterceptor, finalHandler) => finalHandler(requestFromPrevInterceptor)
      );
    }
    return this._pipe(
      request,
      (requestToNext) => this._http.send(requestToNext)
      /* final handler */
    );
  }
};
HTTPService = __decorateClass([
  __decorateParam(0, IHTTPImplementation)
], HTTPService);
function chainInterceptorFn(afterInterceptorChain, currentInterceptorFn) {
  return (prevRequest, nextHandlerFn) => currentInterceptorFn(prevRequest, (nextRequest) => afterInterceptorChain(nextRequest, nextHandlerFn));
}

// ../packages/network/src/services/http/http.ts
var SuccessStatusCodeLowerBound = 200;
var ErrorStatusCodeLowerBound = 300;

// ../packages/network/src/services/http/response.ts
var HTTPResponse = class {
  constructor({
    body,
    headers,
    status,
    statusText
  }) {
    __publicField(this, "type", 1 /* Response */);
    __publicField(this, "body");
    __publicField(this, "headers");
    __publicField(this, "status");
    __publicField(this, "statusText");
    this.body = body;
    this.headers = headers;
    this.status = status;
    this.statusText = statusText;
  }
};
var HTTPProgress = class {
  constructor(total, loaded, partialText) {
    __publicField(this, "total", total);
    __publicField(this, "loaded", loaded);
    __publicField(this, "partialText", partialText);
    __publicField(this, "type", 0 /* DownloadProgress */);
  }
};
var ResponseHeader = class {
  constructor(headers, status, statusText) {
    __publicField(this, "headers", headers);
    __publicField(this, "status", status);
    __publicField(this, "statusText", statusText);
  }
};
var HTTPResponseError = class {
  constructor({
    request,
    headers,
    status,
    statusText,
    error
  }) {
    __publicField(this, "request");
    __publicField(this, "headers");
    __publicField(this, "status");
    __publicField(this, "statusText");
    __publicField(this, "error");
    this.request = request;
    this.headers = headers;
    this.status = status;
    this.statusText = statusText;
    this.error = error;
  }
};

// ../packages/network/src/services/http/implementations/util.ts
function parseFetchParamsFromRequest(request) {
  const fetchParams = {
    method: request.method,
    headers: request.getHeadersInit(),
    body: request.getBody(),
    credentials: request.withCredentials ? "include" : void 0
  };
  return fetchParams;
}

// ../packages/network/src/services/http/implementations/fetch.ts
var FetchHTTPImplementation = class {
  constructor(_logService) {
    __publicField(this, "_logService", _logService);
  }
  send(request) {
    return new Observable((subscriber) => {
      const abortController = new AbortController();
      this._send(request, subscriber, abortController).catch((error) => {
        subscriber.error(new HTTPResponseError({
          error,
          request
        }));
      });
      return () => abortController.abort();
    });
  }
  async _send(request, subscriber, abortController) {
    var _a, _b;
    let response;
    try {
      const fetchParams = parseFetchParamsFromRequest(request);
      const urlWithParams = request.getUrlWithParams();
      const fetchPromise = fetch(urlWithParams, {
        signal: abortController.signal,
        ...fetchParams
      });
      this._logService.debug(`[FetchHTTPImplementation]: sending request to url ${urlWithParams} with params ${fetchParams}`);
      response = await fetchPromise;
    } catch (error) {
      const e = new HTTPResponseError({
        request,
        error,
        status: (_a = error.status) != null ? _a : 0,
        statusText: (_b = error.statusText) != null ? _b : "Unknown Error",
        headers: error.headers
      });
      this._logService.error("[FetchHTTPImplementation]: network error", e);
      subscriber.error(e);
      return;
    }
    const responseHeaders = new HTTPHeaders(response.headers);
    const status = response.status;
    const statusText = response.statusText;
    let body = null;
    if (response.body) {
      body = await this._readBody(request, response, subscriber);
    }
    const ok = status >= 200 /* Ok */ && status < 300 /* MultipleChoices */;
    if (ok) {
      subscriber.next(new HTTPResponse({
        body,
        headers: responseHeaders,
        status,
        statusText
      }));
    } else {
      const e = new HTTPResponseError({
        request,
        error: body,
        status,
        statusText,
        headers: responseHeaders
      });
      this._logService.error("[FetchHTTPImplementation]: network error", e);
      subscriber.error(e);
    }
    subscriber.complete();
  }
  async _readBody(request, response, subscriber) {
    var _a, _b;
    const chunks = [];
    const reader = response.body.getReader();
    const contentLength = response.headers.get("content-length");
    let receivedLength = 0;
    const reportProgress = (_a = request.requestParams) == null ? void 0 : _a.reportProgress;
    const responseType = request.responseType;
    let partialText;
    let decoder;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      receivedLength += value.length;
      if (reportProgress && responseType === "text") {
        partialText = (partialText != null ? partialText : "") + (decoder != null ? decoder : decoder = new TextDecoder()).decode(value, { stream: true });
        subscriber.next(new HTTPProgress(
          contentLength ? Number.parseInt(contentLength, 10) : void 0,
          receivedLength,
          partialText
        ));
      }
    }
    const all = mergeChunks(chunks, receivedLength);
    try {
      const contentType = (_b = response.headers.get("content-type")) != null ? _b : "";
      const body = deserialize(request, all, contentType);
      return body;
    } catch (error) {
      const e = new HTTPResponseError({
        request,
        error,
        status: response.status,
        statusText: response.statusText,
        headers: new HTTPHeaders(response.headers)
      });
      this._logService.error("[FetchHTTPImplementation]: network error", e);
      subscriber.error(e);
      return null;
    }
  }
};
FetchHTTPImplementation = __decorateClass([
  __decorateParam(0, ILogService)
], FetchHTTPImplementation);
function mergeChunks(chunks, totalLength) {
  const all = new Uint8Array(totalLength);
  let position = 0;
  for (const chunk of chunks) {
    all.set(chunk, position);
    position += chunk.length;
  }
  return all;
}
var XSSI_PREFIX = /^\)\]\}',?\n/;
function deserialize(request, bin, contentType) {
  switch (request.responseType) {
    case "json":
      const text = new TextDecoder().decode(bin).replace(XSSI_PREFIX, "");
      return text === "" ? null : JSON.parse(text);
    case "text":
      return new TextDecoder().decode(bin);
    case "blob":
      return new Blob([bin.buffer], { type: contentType });
    case "arraybuffer":
      return bin.buffer;
    default:
      throw new Error(`[FetchHTTPImplementation]: unknown response type: ${request.responseType}.`);
  }
}

// ../packages/network/src/services/http/implementations/xhr.ts
var XHRHTTPImplementation = class {
  constructor(_logService) {
    __publicField(this, "_logService", _logService);
  }
  send(request) {
    return new Observable((observer) => {
      const xhr = new XMLHttpRequest();
      const urlWithParams = request.getUrlWithParams();
      const fetchParams = parseFetchParamsFromRequest(request);
      const { responseType } = request;
      xhr.open(request.method, urlWithParams);
      if (request.withCredentials) {
        xhr.withCredentials = true;
      }
      if (fetchParams.headers) {
        Object.entries(fetchParams.headers).forEach(([key, value]) => xhr.setRequestHeader(key, value));
      }
      let responseHeader;
      const buildResponseHeader = () => {
        if (responseHeader) {
          return responseHeader;
        }
        const statusText = xhr.statusText || "OK";
        const headers = new HTTPHeaders(xhr.getAllResponseHeaders());
        return new ResponseHeader(headers, xhr.status, statusText);
      };
      const onLoadHandler = () => {
        const { headers, statusText, status } = buildResponseHeader();
        let body2 = null;
        let error = null;
        if (status !== 204 /* NoContent */) {
          body2 = typeof xhr.response === "undefined" ? xhr.responseText : xhr.response;
        }
        let success = status >= SuccessStatusCodeLowerBound && status < ErrorStatusCodeLowerBound;
        if (responseType === "json" && typeof body2 === "string") {
          const originalBody = body2;
          try {
            body2 = body2 ? JSON.parse(body2) : null;
          } catch (e) {
            success = false;
            body2 = originalBody;
            error = e;
          }
        }
        if (responseType === "blob" && !(body2 instanceof Blob)) {
          success = false;
          error = new Error("Response is not a Blob object");
        }
        if (success) {
          observer.next(
            new HTTPResponse({
              body: body2,
              headers,
              status,
              statusText
            })
          );
        } else {
          const e = new HTTPResponseError({
            request,
            error,
            headers,
            status,
            statusText
          });
          this._logService.error("[XHRHTTPImplementation]: network error", e);
          observer.error(e);
        }
      };
      const onErrorHandler = (error) => {
        const e = new HTTPResponseError({
          request,
          error,
          status: xhr.status || 0,
          statusText: xhr.statusText || "Unknown Error",
          headers: buildResponseHeader().headers
        });
        this._logService.error("[XHRHTTPImplementation]: network error", e);
        observer.error(e);
      };
      xhr.responseType = responseType || "";
      xhr.addEventListener("load", onLoadHandler);
      xhr.addEventListener("error", onErrorHandler);
      xhr.addEventListener("abort", onErrorHandler);
      xhr.addEventListener("timeout", onErrorHandler);
      const body = request.getBody();
      xhr.send(body);
      this._logService.debug("[XHRHTTPImplementation]", `sending request to url ${urlWithParams} with params ${fetchParams}`);
      return () => {
        if (xhr.readyState !== xhr.DONE) {
          xhr.abort();
        }
        xhr.removeEventListener("load", onLoadHandler);
        xhr.removeEventListener("error", onErrorHandler);
        xhr.removeEventListener("abort", onErrorHandler);
        xhr.removeEventListener("timeout", onErrorHandler);
      };
    });
  }
};
XHRHTTPImplementation = __decorateClass([
  __decorateParam(0, ILogService)
], XHRHTTPImplementation);

// ../packages/network/src/plugin.ts
var UniverNetworkPlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig, _logger, _injector, _configService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_logger", _logger);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_configService", _configService);
    const { ...rest } = merge_default(
      {},
      defaultPluginConfig,
      this._config
    );
    this._configService.setConfig(NETWORK_PLUGIN_CONFIG_KEY, rest);
  }
  onStarting() {
    var _a, _b, _c;
    const parent = this._injector.get(HTTPService, Quantity.OPTIONAL, LookUp.SKIP_SELF);
    if (parent && !((_a = this._config) == null ? void 0 : _a.forceUseNewInstance)) {
      this._logger.warn(
        "[UniverNetworkPlugin]",
        'HTTPService is already registered in an ancestor interceptor. Skipping registration. If you want to force a new instance, set "forceUseNewInstance" to true in the plugin configuration.'
      );
      return;
    }
    const impl = ((_b = this._config) == null ? void 0 : _b.useFetchImpl) ? FetchHTTPImplementation : typeof window !== "undefined" ? XHRHTTPImplementation : FetchHTTPImplementation;
    registerDependencies(this._injector, mergeOverrideWithDependencies([
      [HTTPService],
      [IHTTPImplementation, { useClass: impl }]
    ], (_c = this._config) == null ? void 0 : _c.override));
  }
};
__publicField(UniverNetworkPlugin, "pluginName", "UNIVER_NETWORK_PLUGIN");
__publicField(UniverNetworkPlugin, "packageName", package_default.name);
__publicField(UniverNetworkPlugin, "version", package_default.version);
UniverNetworkPlugin = __decorateClass([
  __decorateParam(1, ILogService),
  __decorateParam(2, Inject(Injector)),
  __decorateParam(3, IConfigService)
], UniverNetworkPlugin);

// ../packages/network/src/services/web-socket/web-socket.service.ts
var ISocketService = createIdentifier("univer.network.socket.service");
var WebSocketService = class extends Disposable {
  createSocket(URL) {
    try {
      const connection = new WebSocket(URL);
      const disposables = new DisposableCollection();
      const webSocket = {
        URL,
        close: (code, reason) => {
          connection.close(code, reason);
          disposables.dispose();
        },
        send: (data) => {
          connection.send(data);
        },
        open$: new Observable((subscriber) => {
          const callback = (event) => subscriber.next(event);
          connection.addEventListener("open", callback);
          disposables.add(toDisposable(() => connection.removeEventListener("open", callback)));
        }).pipe(share()),
        close$: new Observable((subscriber) => {
          const callback = (event) => subscriber.next(event);
          connection.addEventListener("close", callback);
          disposables.add(toDisposable(() => connection.removeEventListener("close", callback)));
        }).pipe(share()),
        error$: new Observable((subscriber) => {
          const callback = (event) => subscriber.next(event);
          connection.addEventListener("error", callback);
          disposables.add(toDisposable(() => connection.removeEventListener("error", callback)));
        }).pipe(share()),
        message$: new Observable((subscriber) => {
          const callback = (event) => subscriber.next(event);
          connection.addEventListener("message", callback);
          disposables.add(toDisposable(() => connection.removeEventListener("message", callback)));
        }).pipe(share())
      };
      return webSocket;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
};

export {
  HTTPService,
  UniverNetworkPlugin,
  WebSocketService
};
