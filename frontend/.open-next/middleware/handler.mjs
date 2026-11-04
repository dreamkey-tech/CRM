
import {Buffer} from "node:buffer";
globalThis.Buffer = Buffer;

import {AsyncLocalStorage} from "node:async_hooks";
globalThis.AsyncLocalStorage = AsyncLocalStorage;


const defaultDefineProperty = Object.defineProperty;
Object.defineProperty = function(o, p, a) {
  if(p=== '__import_unsupported' && Boolean(globalThis.__import_unsupported)) {
    return;
  }
  return defaultDefineProperty(o, p, a);
};

  
  
  globalThis.openNextDebug = false;globalThis.openNextVersion = "4.1.15";globalThis.nextVersion = "16.4.5";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require2() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/@opennextjs/aws/dist/utils/error.js
function isOpenNextError(e) {
  try {
    return "__openNextInternal" in e;
  } catch {
    return false;
  }
}
var init_error = __esm({
  "node_modules/@opennextjs/aws/dist/utils/error.js"() {
  }
});

// node_modules/@opennextjs/aws/dist/adapters/logger.js
function debug(...args) {
  if (globalThis.openNextDebug) {
    console.log(...args);
  }
}
function warn(...args) {
  console.warn(...args);
}
function error(...args) {
  if (args.some((arg) => isDownplayedErrorLog(arg))) {
    return debug(...args);
  }
  if (args.some((arg) => isOpenNextError(arg))) {
    const error2 = args.find((arg) => isOpenNextError(arg));
    if (error2.logLevel < getOpenNextErrorLogLevel()) {
      return;
    }
    if (error2.logLevel === 0) {
      return console.log(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    if (error2.logLevel === 1) {
      return warn(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    return console.error(...args);
  }
  console.error(...args);
}
function getOpenNextErrorLogLevel() {
  const strLevel = process.env.OPEN_NEXT_ERROR_LOG_LEVEL ?? "1";
  switch (strLevel.toLowerCase()) {
    case "debug":
    case "0":
      return 0;
    case "error":
    case "2":
      return 2;
    default:
      return 1;
  }
}
var DOWNPLAYED_ERROR_LOGS, isDownplayedErrorLog;
var init_logger = __esm({
  "node_modules/@opennextjs/aws/dist/adapters/logger.js"() {
    init_error();
    DOWNPLAYED_ERROR_LOGS = [
      {
        clientName: "S3Client",
        commandName: "GetObjectCommand",
        errorName: "NoSuchKey"
      }
    ];
    isDownplayedErrorLog = (errorLog) => DOWNPLAYED_ERROR_LOGS.some((downplayedInput) => downplayedInput.clientName === errorLog?.clientName && downplayedInput.commandName === errorLog?.commandName && (downplayedInput.errorName === errorLog?.error?.name || downplayedInput.errorName === errorLog?.error?.Code));
  }
});

// node_modules/cookie/dist/index.js
var require_dist = __commonJS({
  "node_modules/cookie/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseCookie = parseCookie;
    exports.parse = parseCookie;
    exports.stringifyCookie = stringifyCookie;
    exports.stringifySetCookie = stringifySetCookie;
    exports.serialize = stringifySetCookie;
    exports.parseSetCookie = parseSetCookie;
    exports.stringifySetCookie = stringifySetCookie;
    exports.serialize = stringifySetCookie;
    var cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
    var cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
    var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
    var maxAgeRegExp = /^-?\d+$/;
    var __toString = Object.prototype.toString;
    var NullObject = /* @__PURE__ */ (() => {
      const C = function() {
      };
      C.prototype = /* @__PURE__ */ Object.create(null);
      return C;
    })();
    function parseCookie(str, options) {
      const obj = new NullObject();
      const len = str.length;
      if (len < 2)
        return obj;
      const dec = options?.decode || decode;
      let index = 0;
      do {
        const eqIdx = eqIndex(str, index, len);
        if (eqIdx === -1)
          break;
        const endIdx = endIndex(str, index, len);
        if (eqIdx > endIdx) {
          index = str.lastIndexOf(";", eqIdx - 1) + 1;
          continue;
        }
        const key = valueSlice(str, index, eqIdx);
        if (obj[key] === void 0) {
          obj[key] = dec(valueSlice(str, eqIdx + 1, endIdx));
        }
        index = endIdx + 1;
      } while (index < len);
      return obj;
    }
    function stringifyCookie(cookie, options) {
      const enc = options?.encode || encodeURIComponent;
      const cookieStrings = [];
      for (const name of Object.keys(cookie)) {
        const val = cookie[name];
        if (val === void 0)
          continue;
        if (!cookieNameRegExp.test(name)) {
          throw new TypeError(`cookie name is invalid: ${name}`);
        }
        const value = enc(val);
        if (!cookieValueRegExp.test(value)) {
          throw new TypeError(`cookie val is invalid: ${val}`);
        }
        cookieStrings.push(`${name}=${value}`);
      }
      return cookieStrings.join("; ");
    }
    function stringifySetCookie(_name, _val, _opts) {
      const cookie = typeof _name === "object" ? _name : { ..._opts, name: _name, value: String(_val) };
      const options = typeof _val === "object" ? _val : _opts;
      const enc = options?.encode || encodeURIComponent;
      if (!cookieNameRegExp.test(cookie.name)) {
        throw new TypeError(`argument name is invalid: ${cookie.name}`);
      }
      const value = cookie.value ? enc(cookie.value) : "";
      if (!cookieValueRegExp.test(value)) {
        throw new TypeError(`argument val is invalid: ${cookie.value}`);
      }
      let str = cookie.name + "=" + value;
      if (cookie.maxAge !== void 0) {
        if (!Number.isInteger(cookie.maxAge)) {
          throw new TypeError(`option maxAge is invalid: ${cookie.maxAge}`);
        }
        str += "; Max-Age=" + cookie.maxAge;
      }
      if (cookie.domain) {
        if (!domainValueRegExp.test(cookie.domain)) {
          throw new TypeError(`option domain is invalid: ${cookie.domain}`);
        }
        str += "; Domain=" + cookie.domain;
      }
      if (cookie.path) {
        if (!pathValueRegExp.test(cookie.path)) {
          throw new TypeError(`option path is invalid: ${cookie.path}`);
        }
        str += "; Path=" + cookie.path;
      }
      if (cookie.expires) {
        if (!isDate(cookie.expires) || !Number.isFinite(cookie.expires.valueOf())) {
          throw new TypeError(`option expires is invalid: ${cookie.expires}`);
        }
        str += "; Expires=" + cookie.expires.toUTCString();
      }
      if (cookie.httpOnly) {
        str += "; HttpOnly";
      }
      if (cookie.secure) {
        str += "; Secure";
      }
      if (cookie.partitioned) {
        str += "; Partitioned";
      }
      if (cookie.priority) {
        const priority = typeof cookie.priority === "string" ? cookie.priority.toLowerCase() : void 0;
        switch (priority) {
          case "low":
            str += "; Priority=Low";
            break;
          case "medium":
            str += "; Priority=Medium";
            break;
          case "high":
            str += "; Priority=High";
            break;
          default:
            throw new TypeError(`option priority is invalid: ${cookie.priority}`);
        }
      }
      if (cookie.sameSite) {
        const sameSite = typeof cookie.sameSite === "string" ? cookie.sameSite.toLowerCase() : cookie.sameSite;
        switch (sameSite) {
          case true:
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError(`option sameSite is invalid: ${cookie.sameSite}`);
        }
      }
      return str;
    }
    function parseSetCookie(str, options) {
      const dec = options?.decode || decode;
      const len = str.length;
      const endIdx = endIndex(str, 0, len);
      const eqIdx = eqIndex(str, 0, endIdx);
      const setCookie = eqIdx === -1 ? { name: "", value: dec(valueSlice(str, 0, endIdx)) } : {
        name: valueSlice(str, 0, eqIdx),
        value: dec(valueSlice(str, eqIdx + 1, endIdx))
      };
      let index = endIdx + 1;
      while (index < len) {
        const endIdx2 = endIndex(str, index, len);
        const eqIdx2 = eqIndex(str, index, endIdx2);
        const attr = eqIdx2 === -1 ? valueSlice(str, index, endIdx2) : valueSlice(str, index, eqIdx2);
        const val = eqIdx2 === -1 ? void 0 : valueSlice(str, eqIdx2 + 1, endIdx2);
        switch (attr.toLowerCase()) {
          case "httponly":
            setCookie.httpOnly = true;
            break;
          case "secure":
            setCookie.secure = true;
            break;
          case "partitioned":
            setCookie.partitioned = true;
            break;
          case "domain":
            setCookie.domain = val;
            break;
          case "path":
            setCookie.path = val;
            break;
          case "max-age":
            if (val && maxAgeRegExp.test(val))
              setCookie.maxAge = Number(val);
            break;
          case "expires":
            if (!val)
              break;
            const date = new Date(val);
            if (Number.isFinite(date.valueOf()))
              setCookie.expires = date;
            break;
          case "priority":
            if (!val)
              break;
            const priority = val.toLowerCase();
            if (priority === "low" || priority === "medium" || priority === "high") {
              setCookie.priority = priority;
            }
            break;
          case "samesite":
            if (!val)
              break;
            const sameSite = val.toLowerCase();
            if (sameSite === "lax" || sameSite === "strict" || sameSite === "none") {
              setCookie.sameSite = sameSite;
            }
            break;
        }
        index = endIdx2 + 1;
      }
      return setCookie;
    }
    function endIndex(str, min, len) {
      const index = str.indexOf(";", min);
      return index === -1 ? len : index;
    }
    function eqIndex(str, min, max) {
      const index = str.indexOf("=", min);
      return index < max ? index : -1;
    }
    function valueSlice(str, min, max) {
      let start = min;
      let end = max;
      do {
        const code = str.charCodeAt(start);
        if (code !== 32 && code !== 9)
          break;
      } while (++start < end);
      while (end > start) {
        const code = str.charCodeAt(end - 1);
        if (code !== 32 && code !== 9)
          break;
        end--;
      }
      return str.slice(start, end);
    }
    function decode(str) {
      if (str.indexOf("%") === -1)
        return str;
      try {
        return decodeURIComponent(str);
      } catch (e) {
        return str;
      }
    }
    function isDate(val) {
      return __toString.call(val) === "[object Date]";
    }
  }
});

// node_modules/@opennextjs/aws/dist/http/util.js
function parseSetCookieHeader(cookies) {
  if (!cookies) {
    return [];
  }
  if (typeof cookies === "string") {
    return cookies.split(/(?<!Expires=\w+),/i).map((c) => c.trim());
  }
  return cookies;
}
function getQueryFromIterator(it) {
  const query = {};
  for (const [key, value] of it) {
    if (key in query) {
      if (Array.isArray(query[key])) {
        query[key].push(value);
      } else {
        query[key] = [query[key], value];
      }
    } else {
      query[key] = value;
    }
  }
  return query;
}
var init_util = __esm({
  "node_modules/@opennextjs/aws/dist/http/util.js"() {
    init_logger();
  }
});

// node_modules/@opennextjs/aws/dist/overrides/converters/utils.js
function getQueryFromSearchParams(searchParams) {
  return getQueryFromIterator(searchParams.entries());
}
var init_utils = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/converters/utils.js"() {
    init_util();
  }
});

// node_modules/@opennextjs/aws/dist/overrides/converters/edge.js
var edge_exports = {};
__export(edge_exports, {
  default: () => edge_default
});
import { Buffer as Buffer2 } from "node:buffer";
var import_cookie, NULL_BODY_STATUSES, converter, edge_default;
var init_edge = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/converters/edge.js"() {
    import_cookie = __toESM(require_dist(), 1);
    init_util();
    init_utils();
    NULL_BODY_STATUSES = /* @__PURE__ */ new Set([101, 103, 204, 205, 304]);
    converter = {
      convertFrom: async (event) => {
        const url = new URL(event.url);
        const searchParams = url.searchParams;
        const query = getQueryFromSearchParams(searchParams);
        const headers = {};
        event.headers.forEach((value, key) => {
          headers[key] = value;
        });
        const rawPath = url.pathname;
        const method = event.method;
        const shouldHaveBody = method !== "GET" && method !== "HEAD";
        const body = shouldHaveBody ? Buffer2.from(await event.arrayBuffer()) : void 0;
        const cookieHeader = event.headers.get("cookie");
        const cookies = cookieHeader ? import_cookie.default.parse(cookieHeader) : {};
        return {
          type: "core",
          method,
          rawPath,
          url: event.url,
          body,
          headers,
          remoteAddress: event.headers.get("x-forwarded-for") ?? "::1",
          query,
          cookies
        };
      },
      convertTo: async (result) => {
        if ("internalEvent" in result) {
          const request = new Request(result.internalEvent.url, {
            body: result.internalEvent.body,
            method: result.internalEvent.method,
            headers: {
              ...result.internalEvent.headers,
              "x-forwarded-host": result.internalEvent.headers.host
            }
          });
          if (globalThis.__dangerous_ON_edge_converter_returns_request === true) {
            return request;
          }
          const cfCache = (result.isISR || result.internalEvent.rawPath.startsWith("/_next/image")) && process.env.DISABLE_CACHE !== "true" ? { cacheEverything: true } : {};
          return fetch(request, {
            // This is a hack to make sure that the response is cached by Cloudflare
            // See https://developers.cloudflare.com/workers/examples/cache-using-fetch/#caching-html-resources
            // @ts-expect-error - This is a Cloudflare specific option
            cf: cfCache
          });
        }
        const headers = new Headers();
        for (const [key, value] of Object.entries(result.headers)) {
          if (key === "set-cookie" && typeof value === "string") {
            const cookies = parseSetCookieHeader(value);
            for (const cookie of cookies) {
              headers.append(key, cookie);
            }
            continue;
          }
          if (Array.isArray(value)) {
            for (const v of value) {
              headers.append(key, v);
            }
          } else {
            headers.set(key, value);
          }
        }
        const body = NULL_BODY_STATUSES.has(result.statusCode) ? null : result.body;
        return new Response(body, {
          status: result.statusCode,
          headers
        });
      },
      name: "edge"
    };
    edge_default = converter;
  }
});

// node_modules/@opennextjs/aws/dist/overrides/wrappers/cloudflare-edge.js
var cloudflare_edge_exports = {};
__export(cloudflare_edge_exports, {
  default: () => cloudflare_edge_default
});
var cfPropNameMapping, handler, cloudflare_edge_default;
var init_cloudflare_edge = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/wrappers/cloudflare-edge.js"() {
    cfPropNameMapping = {
      // The city name is percent-encoded.
      // See https://github.com/vercel/vercel/blob/4cb6143/packages/functions/src/headers.ts#L94C19-L94C37
      city: [encodeURIComponent, "x-open-next-city"],
      country: "x-open-next-country",
      regionCode: "x-open-next-region",
      latitude: "x-open-next-latitude",
      longitude: "x-open-next-longitude"
    };
    handler = async (handler3, converter2) => async (request, env, ctx) => {
      globalThis.process = process;
      for (const [key, value] of Object.entries(env)) {
        if (typeof value === "string") {
          process.env[key] = value;
        }
      }
      const internalEvent = await converter2.convertFrom(request);
      const cfProperties = request.cf;
      for (const [propName, mapping] of Object.entries(cfPropNameMapping)) {
        const propValue = cfProperties?.[propName];
        if (propValue != null) {
          const [encode, headerName] = Array.isArray(mapping) ? mapping : [null, mapping];
          internalEvent.headers[headerName] = encode ? encode(propValue) : propValue;
        }
      }
      const response = await handler3(internalEvent, {
        waitUntil: ctx.waitUntil.bind(ctx)
      });
      const result = await converter2.convertTo(response);
      return result;
    };
    cloudflare_edge_default = {
      wrapper: handler,
      name: "cloudflare-edge",
      supportStreaming: true,
      edgeRuntime: true
    };
  }
});

// node_modules/@opennextjs/aws/dist/overrides/originResolver/pattern-env.js
var pattern_env_exports = {};
__export(pattern_env_exports, {
  default: () => pattern_env_default
});
function initializeOnce() {
  if (initialized)
    return;
  cachedOrigins = JSON.parse(process.env.OPEN_NEXT_ORIGIN ?? "{}");
  const functions = globalThis.openNextConfig.functions ?? {};
  for (const key in functions) {
    if (key !== "default") {
      const value = functions[key];
      const regexes = [];
      for (const pattern of value.patterns) {
        const regexPattern = `/${pattern.replace(/\*\*/g, "(.*)").replace(/\*/g, "([^/]*)").replace(/\//g, "\\/").replace(/\?/g, ".")}`;
        regexes.push(new RegExp(regexPattern));
      }
      cachedPatterns.push({
        key,
        patterns: value.patterns,
        regexes
      });
    }
  }
  initialized = true;
}
var cachedOrigins, cachedPatterns, initialized, envLoader, pattern_env_default;
var init_pattern_env = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/originResolver/pattern-env.js"() {
    init_logger();
    cachedPatterns = [];
    initialized = false;
    envLoader = {
      name: "env",
      resolve: async (_path) => {
        try {
          initializeOnce();
          for (const { key, patterns, regexes } of cachedPatterns) {
            for (const regex of regexes) {
              if (regex.test(_path)) {
                debug("Using origin", key, patterns);
                return cachedOrigins[key];
              }
            }
          }
          if (_path.startsWith("/_next/image") && cachedOrigins.imageOptimizer) {
            debug("Using origin", "imageOptimizer", _path);
            return cachedOrigins.imageOptimizer;
          }
          if (cachedOrigins.default) {
            debug("Using default origin", cachedOrigins.default, _path);
            return cachedOrigins.default;
          }
          return false;
        } catch (e) {
          error("Error while resolving origin", e);
          return false;
        }
      }
    };
    pattern_env_default = envLoader;
  }
});

// node_modules/@opennextjs/aws/dist/overrides/assetResolver/dummy.js
var dummy_exports = {};
__export(dummy_exports, {
  default: () => dummy_default
});
var resolver, dummy_default;
var init_dummy = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/assetResolver/dummy.js"() {
    resolver = {
      name: "dummy"
    };
    dummy_default = resolver;
  }
});

// node_modules/@opennextjs/aws/dist/utils/stream.js
import { ReadableStream as ReadableStream2 } from "node:stream/web";
function toReadableStream(value, isBase64) {
  return new ReadableStream2({
    pull(controller) {
      controller.enqueue(Buffer.from(value, isBase64 ? "base64" : "utf8"));
      controller.close();
    }
  }, { highWaterMark: 0 });
}
function emptyReadableStream() {
  if (process.env.OPEN_NEXT_FORCE_NON_EMPTY_RESPONSE === "true") {
    return new ReadableStream2({
      pull(controller) {
        maybeSomethingBuffer ??= Buffer.from("SOMETHING");
        controller.enqueue(maybeSomethingBuffer);
        controller.close();
      }
    }, { highWaterMark: 0 });
  }
  return new ReadableStream2({
    start(controller) {
      controller.close();
    }
  });
}
var maybeSomethingBuffer;
var init_stream = __esm({
  "node_modules/@opennextjs/aws/dist/utils/stream.js"() {
  }
});

// node_modules/@opennextjs/aws/dist/overrides/proxyExternalRequest/fetch.js
var fetch_exports = {};
__export(fetch_exports, {
  default: () => fetch_default
});
var fetchProxy, fetch_default;
var init_fetch = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/proxyExternalRequest/fetch.js"() {
    init_stream();
    fetchProxy = {
      name: "fetch-proxy",
      // @ts-ignore
      proxy: async (internalEvent) => {
        const { url, headers: eventHeaders, method, body } = internalEvent;
        const headers = Object.fromEntries(Object.entries(eventHeaders).filter(([key]) => !["cf-connecting-ip", "x-forwarded-host"].includes(key.toLowerCase())));
        if (eventHeaders.host) {
          headers["x-forwarded-host"] = eventHeaders.host;
        }
        const response = await fetch(url, {
          method,
          headers,
          body
        });
        const responseHeaders = {};
        response.headers.forEach((value, key) => {
          const cur = responseHeaders[key];
          if (cur === void 0) {
            responseHeaders[key] = value;
          } else if (Array.isArray(cur)) {
            cur.push(value);
          } else {
            responseHeaders[key] = [cur, value];
          }
        });
        return {
          type: "core",
          headers: responseHeaders,
          statusCode: response.status,
          isBase64Encoded: true,
          body: response.body ?? emptyReadableStream()
        };
      }
    };
    fetch_default = fetchProxy;
  }
});

// .next/server/edge/chunks/node_modules_next_dist_esm_build_templates_edge-wrapper_0h-u1c1sve-7_.js
var require_node_modules_next_dist_esm_build_templates_edge_wrapper_0h_u1c1sve_7 = __commonJS({
  ".next/server/edge/chunks/node_modules_next_dist_esm_build_templates_edge-wrapper_0h-u1c1sve-7_.js"() {
    "use strict";
    (globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/node_modules_next_dist_esm_build_templates_edge-wrapper_0h-u1c1sve-7_.js", 38022, (e, t, l) => {
      self._ENTRIES ||= {};
      let s = Promise.resolve().then(() => e.i(42738));
      s.catch(() => {
      }), self._ENTRIES.middleware_middleware = new Proxy(s, { get(e2, t2) {
        if ("then" === t2) return (t3, l3) => e2.then(t3, l3);
        let l2 = (...l3) => e2.then((e3) => (0, e3[t2])(...l3));
        return l2.then = (l3, s2) => e2.then((e3) => e3[t2]).then(l3, s2), l2;
      } });
    }]);
  }
});

// node-built-in-modules:node:async_hooks
var node_async_hooks_exports = {};
import * as node_async_hooks_star from "node:async_hooks";
var init_node_async_hooks = __esm({
  "node-built-in-modules:node:async_hooks"() {
    __reExport(node_async_hooks_exports, node_async_hooks_star);
  }
});

// node-built-in-modules:node:buffer
var node_buffer_exports = {};
import * as node_buffer_star from "node:buffer";
var init_node_buffer = __esm({
  "node-built-in-modules:node:buffer"() {
    __reExport(node_buffer_exports, node_buffer_star);
  }
});

// .next/server/edge/chunks/[root-of-the-server]__0ns4mr-xgqen9._.js
var require_root_of_the_server_0ns4mr_xgqen9 = __commonJS({
  ".next/server/edge/chunks/[root-of-the-server]__0ns4mr-xgqen9._.js"() {
    "use strict";
    (globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__0ns4mr-xgqen9._.js", 78500, (e, t, r) => {
      t.exports = e.x("node:async_hooks", () => (init_node_async_hooks(), __toCommonJS(node_async_hooks_exports)));
    }, 51615, (e, t, r) => {
      t.exports = e.x("node:buffer", () => (init_node_buffer(), __toCommonJS(node_buffer_exports)));
    }, 28042, (e, t, r) => {
      "use strict";
      var n = Object.defineProperty, i = Object.getOwnPropertyDescriptor, a = Object.getOwnPropertyNames, o = Object.prototype.hasOwnProperty, s = {}, l = { RequestCookies: () => g, ResponseCookies: () => m, parseCookie: () => d, parseSetCookie: () => h, stringifyCookie: () => u };
      for (var c in l) n(s, c, { get: l[c], enumerable: true });
      function u(e2) {
        var t2;
        let r2 = ["path" in e2 && e2.path && `Path=${e2.path}`, "expires" in e2 && (e2.expires || 0 === e2.expires) && `Expires=${("number" == typeof e2.expires ? new Date(e2.expires) : e2.expires).toUTCString()}`, "maxAge" in e2 && "number" == typeof e2.maxAge && `Max-Age=${e2.maxAge}`, "domain" in e2 && e2.domain && `Domain=${e2.domain}`, "secure" in e2 && e2.secure && "Secure", "httpOnly" in e2 && e2.httpOnly && "HttpOnly", "sameSite" in e2 && e2.sameSite && `SameSite=${e2.sameSite}`, "partitioned" in e2 && e2.partitioned && "Partitioned", "priority" in e2 && e2.priority && `Priority=${e2.priority}`].filter(Boolean), n2 = `${e2.name}=${encodeURIComponent(null != (t2 = e2.value) ? t2 : "")}`;
        return 0 === r2.length ? n2 : `${n2}; ${r2.join("; ")}`;
      }
      function d(e2) {
        let t2 = /* @__PURE__ */ new Map();
        for (let r2 of e2.split(/; */)) {
          if (!r2) continue;
          let e3 = r2.indexOf("=");
          if (-1 === e3) {
            t2.set(r2, "true");
            continue;
          }
          let [n2, i2] = [r2.slice(0, e3), r2.slice(e3 + 1)];
          try {
            t2.set(n2, decodeURIComponent(null != i2 ? i2 : "true"));
          } catch {
          }
        }
        return t2;
      }
      function h(e2) {
        if (!e2) return;
        let [[t2, r2], ...n2] = d(e2), { domain: i2, expires: a2, httponly: o2, maxage: s2, path: l2, samesite: c2, secure: u2, partitioned: h2, priority: g2 } = Object.fromEntries(n2.map(([e3, t3]) => [e3.toLowerCase().replace(/-/g, ""), t3]));
        {
          var m2, v, b = { name: t2, value: decodeURIComponent(r2), domain: i2, ...a2 && { expires: new Date(a2) }, ...o2 && { httpOnly: true }, ..."string" == typeof s2 && { maxAge: Number(s2) }, path: l2, ...c2 && { sameSite: p.includes(m2 = (m2 = c2).toLowerCase()) ? m2 : void 0 }, ...u2 && { secure: true }, ...g2 && { priority: f.includes(v = (v = g2).toLowerCase()) ? v : void 0 }, ...h2 && { partitioned: true } };
          let e3 = {};
          for (let t3 in b) b[t3] && (e3[t3] = b[t3]);
          return e3;
        }
      }
      t.exports = ((e2, t2, r2) => {
        if (t2 && "object" == typeof t2 || "function" == typeof t2) for (let s2 of a(t2)) o.call(e2, s2) || void 0 === s2 || n(e2, s2, { get: () => t2[s2], enumerable: !(r2 = i(t2, s2)) || r2.enumerable });
        return e2;
      })(n({}, "__esModule", { value: true }), s);
      var p = ["strict", "lax", "none"], f = ["low", "medium", "high"], g = class {
        constructor(e2) {
          this._parsed = /* @__PURE__ */ new Map(), this._headers = e2;
          let t2 = e2.get("cookie");
          if (t2) for (let [e3, r2] of d(t2)) this._parsed.set(e3, { name: e3, value: r2 });
        }
        [Symbol.iterator]() {
          return this._parsed[Symbol.iterator]();
        }
        get size() {
          return this._parsed.size;
        }
        get(...e2) {
          let t2 = "string" == typeof e2[0] ? e2[0] : e2[0].name;
          return this._parsed.get(t2);
        }
        getAll(...e2) {
          var t2;
          let r2 = Array.from(this._parsed);
          if (!e2.length) return r2.map(([e3, t3]) => t3);
          let n2 = "string" == typeof e2[0] ? e2[0] : null == (t2 = e2[0]) ? void 0 : t2.name;
          return r2.filter(([e3]) => e3 === n2).map(([e3, t3]) => t3);
        }
        has(e2) {
          return this._parsed.has(e2);
        }
        set(...e2) {
          let [t2, r2] = 1 === e2.length ? [e2[0].name, e2[0].value] : e2, n2 = this._parsed;
          return n2.set(t2, { name: t2, value: r2 }), this._headers.set("cookie", Array.from(n2).map(([e3, t3]) => u(t3)).join("; ")), this;
        }
        delete(e2) {
          let t2 = this._parsed, r2 = Array.isArray(e2) ? e2.map((e3) => t2.delete(e3)) : t2.delete(e2);
          return this._headers.set("cookie", Array.from(t2).map(([e3, t3]) => u(t3)).join("; ")), r2;
        }
        clear() {
          return this.delete(Array.from(this._parsed.keys())), this;
        }
        [/* @__PURE__ */ Symbol.for("edge-runtime.inspect.custom")]() {
          return `RequestCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`;
        }
        toString() {
          return [...this._parsed.values()].map((e2) => `${e2.name}=${encodeURIComponent(e2.value)}`).join("; ");
        }
      }, m = class {
        constructor(e2) {
          var t2, r2, n2;
          this._parsed = /* @__PURE__ */ new Map(), this._headers = e2;
          let i2 = null != (n2 = null != (r2 = null == (t2 = e2.getSetCookie) ? void 0 : t2.call(e2)) ? r2 : e2.get("set-cookie")) ? n2 : [];
          for (let e3 of Array.isArray(i2) ? i2 : (function(e4) {
            if (!e4) return [];
            var t3, r3, n3, i3, a2, o2 = [], s2 = 0;
            function l2() {
              for (; s2 < e4.length && /\s/.test(e4.charAt(s2)); ) s2 += 1;
              return s2 < e4.length;
            }
            for (; s2 < e4.length; ) {
              for (t3 = s2, a2 = false; l2(); ) if ("," === (r3 = e4.charAt(s2))) {
                for (n3 = s2, s2 += 1, l2(), i3 = s2; s2 < e4.length && "=" !== (r3 = e4.charAt(s2)) && ";" !== r3 && "," !== r3; ) s2 += 1;
                s2 < e4.length && "=" === e4.charAt(s2) ? (a2 = true, s2 = i3, o2.push(e4.substring(t3, n3)), t3 = s2) : s2 = n3 + 1;
              } else s2 += 1;
              (!a2 || s2 >= e4.length) && o2.push(e4.substring(t3, e4.length));
            }
            return o2;
          })(i2)) {
            let t3 = h(e3);
            t3 && this._parsed.set(t3.name, t3);
          }
        }
        get(...e2) {
          let t2 = "string" == typeof e2[0] ? e2[0] : e2[0].name;
          return this._parsed.get(t2);
        }
        getAll(...e2) {
          var t2;
          let r2 = Array.from(this._parsed.values());
          if (!e2.length) return r2;
          let n2 = "string" == typeof e2[0] ? e2[0] : null == (t2 = e2[0]) ? void 0 : t2.name;
          return r2.filter((e3) => e3.name === n2);
        }
        has(e2) {
          return this._parsed.has(e2);
        }
        set(...e2) {
          let [t2, r2, n2] = 1 === e2.length ? [e2[0].name, e2[0].value, e2[0]] : e2, i2 = this._parsed;
          return i2.set(t2, (function(e3 = { name: "", value: "" }) {
            return "number" == typeof e3.expires && (e3.expires = new Date(e3.expires)), e3.maxAge && (e3.expires = new Date(Date.now() + 1e3 * e3.maxAge)), (null === e3.path || void 0 === e3.path) && (e3.path = "/"), e3;
          })({ name: t2, value: r2, ...n2 })), (function(e3, t3) {
            for (let [, r3] of (t3.delete("set-cookie"), e3)) {
              let e4 = u(r3);
              t3.append("set-cookie", e4);
            }
          })(i2, this._headers), this;
        }
        delete(...e2) {
          let [t2, r2] = "string" == typeof e2[0] ? [e2[0]] : [e2[0].name, e2[0]];
          return this.set({ ...r2, name: t2, value: "", expires: /* @__PURE__ */ new Date(0) });
        }
        [/* @__PURE__ */ Symbol.for("edge-runtime.inspect.custom")]() {
          return `ResponseCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`;
        }
        toString() {
          return [...this._parsed.values()].map(u).join("; ");
        }
      };
    }, 59110, (e, t, r) => {
      (() => {
        "use strict";
        let r2, n, i, a, o;
        var s, l, c, u, d, h, p, f, g, m, v, b, w, y, x, _, S = { 912: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.ContextAPI = void 0;
          let n2 = r3(108), i2 = r3(221), a2 = r3(44), o2 = "context", s2 = new n2.NoopContextManager();
          t2.ContextAPI = class e3 {
            static getInstance() {
              return this._instance || (this._instance = new e3()), this._instance;
            }
            setGlobalContextManager(e4) {
              return (0, i2.registerGlobal)(o2, e4, a2.DiagAPI.instance());
            }
            active() {
              return this._getContextManager().active();
            }
            with(e4, t3, r4, ...n3) {
              return this._getContextManager().with(e4, t3, r4, ...n3);
            }
            bind(e4, t3) {
              return this._getContextManager().bind(e4, t3);
            }
            _getContextManager() {
              return (0, i2.getGlobal)(o2) || s2;
            }
            disable() {
              this._getContextManager().disable(), (0, i2.unregisterGlobal)(o2, a2.DiagAPI.instance());
            }
          };
        }, 44: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.DiagAPI = void 0;
          let n2 = r3(757), i2 = r3(412), a2 = r3(711), o2 = r3(221);
          t2.DiagAPI = class e3 {
            constructor() {
              function e4(e5) {
                return function(...t4) {
                  let r4 = (0, o2.getGlobal)("diag");
                  if (r4) return r4[e5](...t4);
                };
              }
              let t3 = this;
              t3.setLogger = (e5, r4 = { logLevel: a2.DiagLogLevel.INFO }) => {
                var n3, s2, l2;
                if (e5 === t3) {
                  let e6 = Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation");
                  return t3.error(null != (n3 = e6.stack) ? n3 : e6.message), false;
                }
                "number" == typeof r4 && (r4 = { logLevel: r4 });
                let c2 = (0, o2.getGlobal)("diag"), u2 = (0, i2.createLogLevelDiagLogger)(null != (s2 = r4.logLevel) ? s2 : a2.DiagLogLevel.INFO, e5);
                if (c2 && !r4.suppressOverrideMessage) {
                  let e6 = null != (l2 = Error().stack) ? l2 : "<failed to generate stacktrace>";
                  c2.warn(`Current logger will be overwritten from ${e6}`), u2.warn(`Current logger will overwrite one already registered from ${e6}`);
                }
                return (0, o2.registerGlobal)("diag", u2, t3, true);
              }, t3.disable = () => {
                (0, o2.unregisterGlobal)("diag", t3);
              }, t3.createComponentLogger = (e5) => new n2.DiagComponentLogger(e5), t3.verbose = e4("verbose"), t3.debug = e4("debug"), t3.info = e4("info"), t3.warn = e4("warn"), t3.error = e4("error");
            }
            static instance() {
              return this._instance || (this._instance = new e3()), this._instance;
            }
          };
        }, 262: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.MetricsAPI = void 0;
          let n2 = r3(586), i2 = r3(221), a2 = r3(44), o2 = "metrics";
          t2.MetricsAPI = class e3 {
            static getInstance() {
              return this._instance || (this._instance = new e3()), this._instance;
            }
            setGlobalMeterProvider(e4) {
              return (0, i2.registerGlobal)(o2, e4, a2.DiagAPI.instance());
            }
            getMeterProvider() {
              return (0, i2.getGlobal)(o2) || n2.NOOP_METER_PROVIDER;
            }
            getMeter(e4, t3, r4) {
              return this.getMeterProvider().getMeter(e4, t3, r4);
            }
            disable() {
              (0, i2.unregisterGlobal)(o2, a2.DiagAPI.instance());
            }
          };
        }, 25: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.PropagationAPI = void 0;
          let n2 = r3(221), i2 = r3(19), a2 = r3(92), o2 = r3(398), s2 = r3(504), l2 = r3(44), c2 = "propagation", u2 = new i2.NoopTextMapPropagator();
          t2.PropagationAPI = class e3 {
            constructor() {
              this.createBaggage = s2.createBaggage, this.getBaggage = o2.getBaggage, this.getActiveBaggage = o2.getActiveBaggage, this.setBaggage = o2.setBaggage, this.deleteBaggage = o2.deleteBaggage;
            }
            static getInstance() {
              return this._instance || (this._instance = new e3()), this._instance;
            }
            setGlobalPropagator(e4) {
              return (0, n2.registerGlobal)(c2, e4, l2.DiagAPI.instance());
            }
            inject(e4, t3, r4 = a2.defaultTextMapSetter) {
              return this._getGlobalPropagator().inject(e4, t3, r4);
            }
            extract(e4, t3, r4 = a2.defaultTextMapGetter) {
              return this._getGlobalPropagator().extract(e4, t3, r4);
            }
            fields() {
              return this._getGlobalPropagator().fields();
            }
            disable() {
              (0, n2.unregisterGlobal)(c2, l2.DiagAPI.instance());
            }
            _getGlobalPropagator() {
              return (0, n2.getGlobal)(c2) || u2;
            }
          };
        }, 397: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.TraceAPI = void 0;
          let n2 = r3(221), i2 = r3(498), a2 = r3(477), o2 = r3(793), s2 = r3(44), l2 = "trace";
          t2.TraceAPI = class e3 {
            constructor() {
              this._proxyTracerProvider = new i2.ProxyTracerProvider(), this.wrapSpanContext = a2.wrapSpanContext, this.isSpanContextValid = a2.isSpanContextValid, this.deleteSpan = o2.deleteSpan, this.getSpan = o2.getSpan, this.getActiveSpan = o2.getActiveSpan, this.getSpanContext = o2.getSpanContext, this.setSpan = o2.setSpan, this.setSpanContext = o2.setSpanContext;
            }
            static getInstance() {
              return this._instance || (this._instance = new e3()), this._instance;
            }
            setGlobalTracerProvider(e4) {
              let t3 = (0, n2.registerGlobal)(l2, this._proxyTracerProvider, s2.DiagAPI.instance());
              return t3 && this._proxyTracerProvider.setDelegate(e4), t3;
            }
            getTracerProvider() {
              return (0, n2.getGlobal)(l2) || this._proxyTracerProvider;
            }
            getTracer(e4, t3) {
              return this.getTracerProvider().getTracer(e4, t3);
            }
            disable() {
              (0, n2.unregisterGlobal)(l2, s2.DiagAPI.instance()), this._proxyTracerProvider = new i2.ProxyTracerProvider();
            }
          };
        }, 398: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.deleteBaggage = t2.setBaggage = t2.getActiveBaggage = t2.getBaggage = void 0;
          let n2 = r3(912), i2 = (0, r3(23).createContextKey)("OpenTelemetry Baggage Key");
          function a2(e3) {
            return e3.getValue(i2) || void 0;
          }
          t2.getBaggage = a2, t2.getActiveBaggage = function() {
            return a2(n2.ContextAPI.getInstance().active());
          }, t2.setBaggage = function(e3, t3) {
            return e3.setValue(i2, t3);
          }, t2.deleteBaggage = function(e3) {
            return e3.deleteValue(i2);
          };
        }, 152: (e2, t2) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.BaggageImpl = void 0, t2.BaggageImpl = class e3 {
            constructor(e4) {
              this._entries = e4 ? new Map(e4) : /* @__PURE__ */ new Map();
            }
            getEntry(e4) {
              let t3 = this._entries.get(e4);
              if (t3) return Object.assign({}, t3);
            }
            getAllEntries() {
              return Array.from(this._entries.entries()).map(([e4, t3]) => [e4, t3]);
            }
            setEntry(t3, r3) {
              let n2 = new e3(this._entries);
              return n2._entries.set(t3, r3), n2;
            }
            removeEntry(t3) {
              let r3 = new e3(this._entries);
              return r3._entries.delete(t3), r3;
            }
            removeEntries(...t3) {
              let r3 = new e3(this._entries);
              for (let e4 of t3) r3._entries.delete(e4);
              return r3;
            }
            clear() {
              return new e3();
            }
          };
        }, 647: (e2, t2) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.baggageEntryMetadataSymbol = void 0, t2.baggageEntryMetadataSymbol = /* @__PURE__ */ Symbol("BaggageEntryMetadata");
        }, 504: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.baggageEntryMetadataFromString = t2.createBaggage = void 0;
          let n2 = r3(44), i2 = r3(152), a2 = r3(647), o2 = n2.DiagAPI.instance();
          t2.createBaggage = function(e3 = {}) {
            return new i2.BaggageImpl(new Map(Object.entries(e3)));
          }, t2.baggageEntryMetadataFromString = function(e3) {
            return "string" != typeof e3 && (o2.error(`Cannot create baggage metadata from unknown type: ${typeof e3}`), e3 = ""), { __TYPE__: a2.baggageEntryMetadataSymbol, toString: () => e3 };
          };
        }, 778: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.context = void 0, t2.context = r3(912).ContextAPI.getInstance();
        }, 108: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.NoopContextManager = void 0;
          let n2 = r3(23);
          t2.NoopContextManager = class {
            active() {
              return n2.ROOT_CONTEXT;
            }
            with(e3, t3, r4, ...n3) {
              return t3.call(r4, ...n3);
            }
            bind(e3, t3) {
              return t3;
            }
            enable() {
              return this;
            }
            disable() {
              return this;
            }
          };
        }, 23: (e2, t2) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.ROOT_CONTEXT = t2.createContextKey = void 0, t2.createContextKey = function(e3) {
            return Symbol.for(e3);
          }, t2.ROOT_CONTEXT = new class e3 {
            constructor(t3) {
              let r3 = this;
              r3._currentContext = t3 ? new Map(t3) : /* @__PURE__ */ new Map(), r3.getValue = (e4) => r3._currentContext.get(e4), r3.setValue = (t4, n2) => {
                let i2 = new e3(r3._currentContext);
                return i2._currentContext.set(t4, n2), i2;
              }, r3.deleteValue = (t4) => {
                let n2 = new e3(r3._currentContext);
                return n2._currentContext.delete(t4), n2;
              };
            }
          }();
        }, 304: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.diag = void 0, t2.diag = r3(44).DiagAPI.instance();
        }, 757: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.DiagComponentLogger = void 0;
          let n2 = r3(221);
          function i2(e3, t3, r4) {
            let i3 = (0, n2.getGlobal)("diag");
            if (i3) return r4.unshift(t3), i3[e3](...r4);
          }
          t2.DiagComponentLogger = class {
            constructor(e3) {
              this._namespace = e3.namespace || "DiagComponentLogger";
            }
            debug(...e3) {
              return i2("debug", this._namespace, e3);
            }
            error(...e3) {
              return i2("error", this._namespace, e3);
            }
            info(...e3) {
              return i2("info", this._namespace, e3);
            }
            warn(...e3) {
              return i2("warn", this._namespace, e3);
            }
            verbose(...e3) {
              return i2("verbose", this._namespace, e3);
            }
          };
        }, 83: (e2, t2) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.DiagConsoleLogger = void 0;
          let r3 = [{ n: "error", c: "error" }, { n: "warn", c: "warn" }, { n: "info", c: "info" }, { n: "debug", c: "debug" }, { n: "verbose", c: "trace" }];
          t2.DiagConsoleLogger = class {
            constructor() {
              for (let e3 = 0; e3 < r3.length; e3++) this[r3[e3].n] = /* @__PURE__ */ (function(e4) {
                return function(...t3) {
                  if (console) {
                    let r4 = console[e4];
                    if ("function" != typeof r4 && (r4 = console.log), "function" == typeof r4) return r4.apply(console, t3);
                  }
                };
              })(r3[e3].c);
            }
          };
        }, 412: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.createLogLevelDiagLogger = void 0;
          let n2 = r3(711);
          t2.createLogLevelDiagLogger = function(e3, t3) {
            function r4(r5, n3) {
              let i2 = t3[r5];
              return "function" == typeof i2 && e3 >= n3 ? i2.bind(t3) : function() {
              };
            }
            return e3 < n2.DiagLogLevel.NONE ? e3 = n2.DiagLogLevel.NONE : e3 > n2.DiagLogLevel.ALL && (e3 = n2.DiagLogLevel.ALL), t3 = t3 || {}, { error: r4("error", n2.DiagLogLevel.ERROR), warn: r4("warn", n2.DiagLogLevel.WARN), info: r4("info", n2.DiagLogLevel.INFO), debug: r4("debug", n2.DiagLogLevel.DEBUG), verbose: r4("verbose", n2.DiagLogLevel.VERBOSE) };
          };
        }, 711: (e2, t2) => {
          var r3;
          Object.defineProperty(t2, "__esModule", { value: true }), t2.DiagLogLevel = void 0, (r3 = t2.DiagLogLevel || (t2.DiagLogLevel = {}))[r3.NONE = 0] = "NONE", r3[r3.ERROR = 30] = "ERROR", r3[r3.WARN = 50] = "WARN", r3[r3.INFO = 60] = "INFO", r3[r3.DEBUG = 70] = "DEBUG", r3[r3.VERBOSE = 80] = "VERBOSE", r3[r3.ALL = 9999] = "ALL";
        }, 221: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.unregisterGlobal = t2.getGlobal = t2.registerGlobal = void 0;
          let n2 = r3(678), i2 = r3(652), a2 = r3(662), o2 = i2.VERSION.split(".")[0], s2 = /* @__PURE__ */ Symbol.for(`opentelemetry.js.api.${o2}`), l2 = n2._globalThis;
          t2.registerGlobal = function(e3, t3, r4, n3 = false) {
            var a3;
            let o3 = l2[s2] = null != (a3 = l2[s2]) ? a3 : { version: i2.VERSION };
            if (!n3 && o3[e3]) {
              let t4 = Error(`@opentelemetry/api: Attempted duplicate registration of API: ${e3}`);
              return r4.error(t4.stack || t4.message), false;
            }
            if (o3.version !== i2.VERSION) {
              let t4 = Error(`@opentelemetry/api: Registration of version v${o3.version} for ${e3} does not match previously registered API v${i2.VERSION}`);
              return r4.error(t4.stack || t4.message), false;
            }
            return o3[e3] = t3, r4.debug(`@opentelemetry/api: Registered a global for ${e3} v${i2.VERSION}.`), true;
          }, t2.getGlobal = function(e3) {
            var t3, r4;
            let n3 = null == (t3 = l2[s2]) ? void 0 : t3.version;
            if (n3 && (0, a2.isCompatible)(n3)) return null == (r4 = l2[s2]) ? void 0 : r4[e3];
          }, t2.unregisterGlobal = function(e3, t3) {
            t3.debug(`@opentelemetry/api: Unregistering a global for ${e3} v${i2.VERSION}.`);
            let r4 = l2[s2];
            r4 && delete r4[e3];
          };
        }, 662: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.isCompatible = t2._makeCompatibilityCheck = void 0;
          let n2 = r3(652), i2 = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
          function a2(e3) {
            let t3 = /* @__PURE__ */ new Set([e3]), r4 = /* @__PURE__ */ new Set(), n3 = e3.match(i2);
            if (!n3) return () => false;
            let a3 = { major: +n3[1], minor: +n3[2], patch: +n3[3], prerelease: n3[4] };
            if (null != a3.prerelease) return function(t4) {
              return t4 === e3;
            };
            function o2(e4) {
              return r4.add(e4), false;
            }
            return function(e4) {
              if (t3.has(e4)) return true;
              if (r4.has(e4)) return false;
              let n4 = e4.match(i2);
              if (!n4) return o2(e4);
              let s2 = { major: +n4[1], minor: +n4[2], patch: +n4[3], prerelease: n4[4] };
              if (null != s2.prerelease || a3.major !== s2.major) return o2(e4);
              if (0 === a3.major) return a3.minor === s2.minor && a3.patch <= s2.patch ? (t3.add(e4), true) : o2(e4);
              return a3.minor <= s2.minor ? (t3.add(e4), true) : o2(e4);
            };
          }
          t2._makeCompatibilityCheck = a2, t2.isCompatible = a2(n2.VERSION);
        }, 120: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.metrics = void 0, t2.metrics = r3(262).MetricsAPI.getInstance();
        }, 532: (e2, t2) => {
          var r3;
          Object.defineProperty(t2, "__esModule", { value: true }), t2.ValueType = void 0, (r3 = t2.ValueType || (t2.ValueType = {}))[r3.INT = 0] = "INT", r3[r3.DOUBLE = 1] = "DOUBLE";
        }, 440: (e2, t2) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.createNoopMeter = t2.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = t2.NOOP_OBSERVABLE_GAUGE_METRIC = t2.NOOP_OBSERVABLE_COUNTER_METRIC = t2.NOOP_UP_DOWN_COUNTER_METRIC = t2.NOOP_HISTOGRAM_METRIC = t2.NOOP_COUNTER_METRIC = t2.NOOP_METER = t2.NoopObservableUpDownCounterMetric = t2.NoopObservableGaugeMetric = t2.NoopObservableCounterMetric = t2.NoopObservableMetric = t2.NoopHistogramMetric = t2.NoopUpDownCounterMetric = t2.NoopCounterMetric = t2.NoopMetric = t2.NoopMeter = void 0;
          class r3 {
            createHistogram(e3, r4) {
              return t2.NOOP_HISTOGRAM_METRIC;
            }
            createCounter(e3, r4) {
              return t2.NOOP_COUNTER_METRIC;
            }
            createUpDownCounter(e3, r4) {
              return t2.NOOP_UP_DOWN_COUNTER_METRIC;
            }
            createObservableGauge(e3, r4) {
              return t2.NOOP_OBSERVABLE_GAUGE_METRIC;
            }
            createObservableCounter(e3, r4) {
              return t2.NOOP_OBSERVABLE_COUNTER_METRIC;
            }
            createObservableUpDownCounter(e3, r4) {
              return t2.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
            }
            addBatchObservableCallback(e3, t3) {
            }
            removeBatchObservableCallback(e3) {
            }
          }
          t2.NoopMeter = r3;
          class n2 {
          }
          t2.NoopMetric = n2;
          class i2 extends n2 {
            add(e3, t3) {
            }
          }
          t2.NoopCounterMetric = i2;
          class a2 extends n2 {
            add(e3, t3) {
            }
          }
          t2.NoopUpDownCounterMetric = a2;
          class o2 extends n2 {
            record(e3, t3) {
            }
          }
          t2.NoopHistogramMetric = o2;
          class s2 {
            addCallback(e3) {
            }
            removeCallback(e3) {
            }
          }
          t2.NoopObservableMetric = s2;
          class l2 extends s2 {
          }
          t2.NoopObservableCounterMetric = l2;
          class c2 extends s2 {
          }
          t2.NoopObservableGaugeMetric = c2;
          class u2 extends s2 {
          }
          t2.NoopObservableUpDownCounterMetric = u2, t2.NOOP_METER = new r3(), t2.NOOP_COUNTER_METRIC = new i2(), t2.NOOP_HISTOGRAM_METRIC = new o2(), t2.NOOP_UP_DOWN_COUNTER_METRIC = new a2(), t2.NOOP_OBSERVABLE_COUNTER_METRIC = new l2(), t2.NOOP_OBSERVABLE_GAUGE_METRIC = new c2(), t2.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = new u2(), t2.createNoopMeter = function() {
            return t2.NOOP_METER;
          };
        }, 586: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.NOOP_METER_PROVIDER = t2.NoopMeterProvider = void 0;
          let n2 = r3(440);
          class i2 {
            getMeter(e3, t3, r4) {
              return n2.NOOP_METER;
            }
          }
          t2.NoopMeterProvider = i2, t2.NOOP_METER_PROVIDER = new i2();
        }, 678: function(e2, t2, r3) {
          var n2 = this && this.__createBinding || (Object.create ? function(e3, t3, r4, n3) {
            void 0 === n3 && (n3 = r4), Object.defineProperty(e3, n3, { enumerable: true, get: function() {
              return t3[r4];
            } });
          } : function(e3, t3, r4, n3) {
            void 0 === n3 && (n3 = r4), e3[n3] = t3[r4];
          }), i2 = this && this.__exportStar || function(e3, t3) {
            for (var r4 in e3) "default" === r4 || Object.prototype.hasOwnProperty.call(t3, r4) || n2(t3, e3, r4);
          };
          Object.defineProperty(t2, "__esModule", { value: true }), i2(r3(59), t2);
        }, 460: (t2, r3) => {
          Object.defineProperty(r3, "__esModule", { value: true }), r3._globalThis = void 0, r3._globalThis = "object" == typeof globalThis ? globalThis : e.g;
        }, 59: function(e2, t2, r3) {
          var n2 = this && this.__createBinding || (Object.create ? function(e3, t3, r4, n3) {
            void 0 === n3 && (n3 = r4), Object.defineProperty(e3, n3, { enumerable: true, get: function() {
              return t3[r4];
            } });
          } : function(e3, t3, r4, n3) {
            void 0 === n3 && (n3 = r4), e3[n3] = t3[r4];
          }), i2 = this && this.__exportStar || function(e3, t3) {
            for (var r4 in e3) "default" === r4 || Object.prototype.hasOwnProperty.call(t3, r4) || n2(t3, e3, r4);
          };
          Object.defineProperty(t2, "__esModule", { value: true }), i2(r3(460), t2);
        }, 27: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.propagation = void 0, t2.propagation = r3(25).PropagationAPI.getInstance();
        }, 19: (e2, t2) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.NoopTextMapPropagator = void 0, t2.NoopTextMapPropagator = class {
            inject(e3, t3) {
            }
            extract(e3, t3) {
              return e3;
            }
            fields() {
              return [];
            }
          };
        }, 92: (e2, t2) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.defaultTextMapSetter = t2.defaultTextMapGetter = void 0, t2.defaultTextMapGetter = { get(e3, t3) {
            if (null != e3) return e3[t3];
          }, keys: (e3) => null == e3 ? [] : Object.keys(e3) }, t2.defaultTextMapSetter = { set(e3, t3, r3) {
            null != e3 && (e3[t3] = r3);
          } };
        }, 816: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.trace = void 0, t2.trace = r3(397).TraceAPI.getInstance();
        }, 374: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.NonRecordingSpan = void 0;
          let n2 = r3(546);
          t2.NonRecordingSpan = class {
            constructor(e3 = n2.INVALID_SPAN_CONTEXT) {
              this._spanContext = e3;
            }
            spanContext() {
              return this._spanContext;
            }
            setAttribute(e3, t3) {
              return this;
            }
            setAttributes(e3) {
              return this;
            }
            addEvent(e3, t3) {
              return this;
            }
            setStatus(e3) {
              return this;
            }
            updateName(e3) {
              return this;
            }
            end(e3) {
            }
            isRecording() {
              return false;
            }
            recordException(e3, t3) {
            }
          };
        }, 637: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.NoopTracer = void 0;
          let n2 = r3(912), i2 = r3(793), a2 = r3(374), o2 = r3(477), s2 = n2.ContextAPI.getInstance();
          t2.NoopTracer = class {
            startSpan(e3, t3, r4 = s2.active()) {
              var n3;
              if (null == t3 ? void 0 : t3.root) return new a2.NonRecordingSpan();
              let l2 = r4 && (0, i2.getSpanContext)(r4);
              return "object" == typeof (n3 = l2) && "string" == typeof n3.spanId && "string" == typeof n3.traceId && "number" == typeof n3.traceFlags && (0, o2.isSpanContextValid)(l2) ? new a2.NonRecordingSpan(l2) : new a2.NonRecordingSpan();
            }
            startActiveSpan(e3, t3, r4, n3) {
              let a3, o3, l2;
              if (arguments.length < 2) return;
              2 == arguments.length ? l2 = t3 : 3 == arguments.length ? (a3 = t3, l2 = r4) : (a3 = t3, o3 = r4, l2 = n3);
              let c2 = null != o3 ? o3 : s2.active(), u2 = this.startSpan(e3, a3, c2), d2 = (0, i2.setSpan)(c2, u2);
              return s2.with(d2, l2, void 0, u2);
            }
          };
        }, 76: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.NoopTracerProvider = void 0;
          let n2 = r3(637);
          t2.NoopTracerProvider = class {
            getTracer(e3, t3, r4) {
              return new n2.NoopTracer();
            }
          };
        }, 779: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.ProxyTracer = void 0;
          let n2 = new (r3(637)).NoopTracer();
          t2.ProxyTracer = class {
            constructor(e3, t3, r4, n3) {
              this._provider = e3, this.name = t3, this.version = r4, this.options = n3;
            }
            startSpan(e3, t3, r4) {
              return this._getTracer().startSpan(e3, t3, r4);
            }
            startActiveSpan(e3, t3, r4, n3) {
              let i2 = this._getTracer();
              return Reflect.apply(i2.startActiveSpan, i2, arguments);
            }
            _getTracer() {
              if (this._delegate) return this._delegate;
              let e3 = this._provider.getDelegateTracer(this.name, this.version, this.options);
              return e3 ? (this._delegate = e3, this._delegate) : n2;
            }
          };
        }, 498: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.ProxyTracerProvider = void 0;
          let n2 = r3(779), i2 = new (r3(76)).NoopTracerProvider();
          t2.ProxyTracerProvider = class {
            getTracer(e3, t3, r4) {
              var i3;
              return null != (i3 = this.getDelegateTracer(e3, t3, r4)) ? i3 : new n2.ProxyTracer(this, e3, t3, r4);
            }
            getDelegate() {
              var e3;
              return null != (e3 = this._delegate) ? e3 : i2;
            }
            setDelegate(e3) {
              this._delegate = e3;
            }
            getDelegateTracer(e3, t3, r4) {
              var n3;
              return null == (n3 = this._delegate) ? void 0 : n3.getTracer(e3, t3, r4);
            }
          };
        }, 312: (e2, t2) => {
          var r3;
          Object.defineProperty(t2, "__esModule", { value: true }), t2.SamplingDecision = void 0, (r3 = t2.SamplingDecision || (t2.SamplingDecision = {}))[r3.NOT_RECORD = 0] = "NOT_RECORD", r3[r3.RECORD = 1] = "RECORD", r3[r3.RECORD_AND_SAMPLED = 2] = "RECORD_AND_SAMPLED";
        }, 793: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.getSpanContext = t2.setSpanContext = t2.deleteSpan = t2.setSpan = t2.getActiveSpan = t2.getSpan = void 0;
          let n2 = r3(23), i2 = r3(374), a2 = r3(912), o2 = (0, n2.createContextKey)("OpenTelemetry Context Key SPAN");
          function s2(e3) {
            return e3.getValue(o2) || void 0;
          }
          function l2(e3, t3) {
            return e3.setValue(o2, t3);
          }
          t2.getSpan = s2, t2.getActiveSpan = function() {
            return s2(a2.ContextAPI.getInstance().active());
          }, t2.setSpan = l2, t2.deleteSpan = function(e3) {
            return e3.deleteValue(o2);
          }, t2.setSpanContext = function(e3, t3) {
            return l2(e3, new i2.NonRecordingSpan(t3));
          }, t2.getSpanContext = function(e3) {
            var t3;
            return null == (t3 = s2(e3)) ? void 0 : t3.spanContext();
          };
        }, 285: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.TraceStateImpl = void 0;
          let n2 = r3(240);
          t2.TraceStateImpl = class e3 {
            constructor(e4) {
              this._internalState = /* @__PURE__ */ new Map(), e4 && this._parse(e4);
            }
            set(e4, t3) {
              let r4 = this._clone();
              return r4._internalState.has(e4) && r4._internalState.delete(e4), r4._internalState.set(e4, t3), r4;
            }
            unset(e4) {
              let t3 = this._clone();
              return t3._internalState.delete(e4), t3;
            }
            get(e4) {
              return this._internalState.get(e4);
            }
            serialize() {
              return this._keys().reduce((e4, t3) => (e4.push(t3 + "=" + this.get(t3)), e4), []).join(",");
            }
            _parse(e4) {
              !(e4.length > 512) && (this._internalState = e4.split(",").reverse().reduce((e5, t3) => {
                let r4 = t3.trim(), i2 = r4.indexOf("=");
                if (-1 !== i2) {
                  let a2 = r4.slice(0, i2), o2 = r4.slice(i2 + 1, t3.length);
                  (0, n2.validateKey)(a2) && (0, n2.validateValue)(o2) && e5.set(a2, o2);
                }
                return e5;
              }, /* @__PURE__ */ new Map()), this._internalState.size > 32 && (this._internalState = new Map(Array.from(this._internalState.entries()).reverse().slice(0, 32))));
            }
            _keys() {
              return Array.from(this._internalState.keys()).reverse();
            }
            _clone() {
              let t3 = new e3();
              return t3._internalState = new Map(this._internalState), t3;
            }
          };
        }, 240: (e2, t2) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.validateValue = t2.validateKey = void 0;
          let r3 = "[_0-9a-z-*/]", n2 = `[a-z]${r3}{0,255}`, i2 = `[a-z0-9]${r3}{0,240}@[a-z]${r3}{0,13}`, a2 = RegExp(`^(?:${n2}|${i2})$`), o2 = /^[ -~]{0,255}[!-~]$/, s2 = /,|=/;
          t2.validateKey = function(e3) {
            return a2.test(e3);
          }, t2.validateValue = function(e3) {
            return o2.test(e3) && !s2.test(e3);
          };
        }, 87: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.createTraceState = void 0;
          let n2 = r3(285);
          t2.createTraceState = function(e3) {
            return new n2.TraceStateImpl(e3);
          };
        }, 546: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.INVALID_SPAN_CONTEXT = t2.INVALID_TRACEID = t2.INVALID_SPANID = void 0;
          let n2 = r3(731);
          t2.INVALID_SPANID = "0000000000000000", t2.INVALID_TRACEID = "00000000000000000000000000000000", t2.INVALID_SPAN_CONTEXT = { traceId: t2.INVALID_TRACEID, spanId: t2.INVALID_SPANID, traceFlags: n2.TraceFlags.NONE };
        }, 613: (e2, t2) => {
          var r3;
          Object.defineProperty(t2, "__esModule", { value: true }), t2.SpanKind = void 0, (r3 = t2.SpanKind || (t2.SpanKind = {}))[r3.INTERNAL = 0] = "INTERNAL", r3[r3.SERVER = 1] = "SERVER", r3[r3.CLIENT = 2] = "CLIENT", r3[r3.PRODUCER = 3] = "PRODUCER", r3[r3.CONSUMER = 4] = "CONSUMER";
        }, 477: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.wrapSpanContext = t2.isSpanContextValid = t2.isValidSpanId = t2.isValidTraceId = void 0;
          let n2 = r3(546), i2 = r3(374), a2 = /^([0-9a-f]{32})$/i, o2 = /^[0-9a-f]{16}$/i;
          function s2(e3) {
            return a2.test(e3) && e3 !== n2.INVALID_TRACEID;
          }
          function l2(e3) {
            return o2.test(e3) && e3 !== n2.INVALID_SPANID;
          }
          t2.isValidTraceId = s2, t2.isValidSpanId = l2, t2.isSpanContextValid = function(e3) {
            return s2(e3.traceId) && l2(e3.spanId);
          }, t2.wrapSpanContext = function(e3) {
            return new i2.NonRecordingSpan(e3);
          };
        }, 854: (e2, t2) => {
          var r3;
          Object.defineProperty(t2, "__esModule", { value: true }), t2.SpanStatusCode = void 0, (r3 = t2.SpanStatusCode || (t2.SpanStatusCode = {}))[r3.UNSET = 0] = "UNSET", r3[r3.OK = 1] = "OK", r3[r3.ERROR = 2] = "ERROR";
        }, 731: (e2, t2) => {
          var r3;
          Object.defineProperty(t2, "__esModule", { value: true }), t2.TraceFlags = void 0, (r3 = t2.TraceFlags || (t2.TraceFlags = {}))[r3.NONE = 0] = "NONE", r3[r3.SAMPLED = 1] = "SAMPLED";
        }, 652: (e2, t2) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.VERSION = void 0, t2.VERSION = "1.6.0";
        } }, C = {};
        function P(e2) {
          var t2 = C[e2];
          if (void 0 !== t2) return t2.exports;
          var r3 = C[e2] = { exports: {} }, n2 = true;
          try {
            S[e2].call(r3.exports, r3, r3.exports, P), n2 = false;
          } finally {
            n2 && delete C[e2];
          }
          return r3.exports;
        }
        P.ab = "/ROOT/node_modules/next/dist/compiled/@opentelemetry/api/";
        var T = {};
        Object.defineProperty(T, "__esModule", { value: true }), T.trace = T.propagation = T.metrics = T.diag = T.context = T.INVALID_SPAN_CONTEXT = T.INVALID_TRACEID = T.INVALID_SPANID = T.isValidSpanId = T.isValidTraceId = T.isSpanContextValid = T.createTraceState = T.TraceFlags = T.SpanStatusCode = T.SpanKind = T.SamplingDecision = T.ProxyTracerProvider = T.ProxyTracer = T.defaultTextMapSetter = T.defaultTextMapGetter = T.ValueType = T.createNoopMeter = T.DiagLogLevel = T.DiagConsoleLogger = T.ROOT_CONTEXT = T.createContextKey = T.baggageEntryMetadataFromString = void 0, s = P(504), Object.defineProperty(T, "baggageEntryMetadataFromString", { enumerable: true, get: function() {
          return s.baggageEntryMetadataFromString;
        } }), l = P(23), Object.defineProperty(T, "createContextKey", { enumerable: true, get: function() {
          return l.createContextKey;
        } }), Object.defineProperty(T, "ROOT_CONTEXT", { enumerable: true, get: function() {
          return l.ROOT_CONTEXT;
        } }), c = P(83), Object.defineProperty(T, "DiagConsoleLogger", { enumerable: true, get: function() {
          return c.DiagConsoleLogger;
        } }), u = P(711), Object.defineProperty(T, "DiagLogLevel", { enumerable: true, get: function() {
          return u.DiagLogLevel;
        } }), d = P(440), Object.defineProperty(T, "createNoopMeter", { enumerable: true, get: function() {
          return d.createNoopMeter;
        } }), h = P(532), Object.defineProperty(T, "ValueType", { enumerable: true, get: function() {
          return h.ValueType;
        } }), p = P(92), Object.defineProperty(T, "defaultTextMapGetter", { enumerable: true, get: function() {
          return p.defaultTextMapGetter;
        } }), Object.defineProperty(T, "defaultTextMapSetter", { enumerable: true, get: function() {
          return p.defaultTextMapSetter;
        } }), f = P(779), Object.defineProperty(T, "ProxyTracer", { enumerable: true, get: function() {
          return f.ProxyTracer;
        } }), g = P(498), Object.defineProperty(T, "ProxyTracerProvider", { enumerable: true, get: function() {
          return g.ProxyTracerProvider;
        } }), m = P(312), Object.defineProperty(T, "SamplingDecision", { enumerable: true, get: function() {
          return m.SamplingDecision;
        } }), v = P(613), Object.defineProperty(T, "SpanKind", { enumerable: true, get: function() {
          return v.SpanKind;
        } }), b = P(854), Object.defineProperty(T, "SpanStatusCode", { enumerable: true, get: function() {
          return b.SpanStatusCode;
        } }), w = P(731), Object.defineProperty(T, "TraceFlags", { enumerable: true, get: function() {
          return w.TraceFlags;
        } }), y = P(87), Object.defineProperty(T, "createTraceState", { enumerable: true, get: function() {
          return y.createTraceState;
        } }), x = P(477), Object.defineProperty(T, "isSpanContextValid", { enumerable: true, get: function() {
          return x.isSpanContextValid;
        } }), Object.defineProperty(T, "isValidTraceId", { enumerable: true, get: function() {
          return x.isValidTraceId;
        } }), Object.defineProperty(T, "isValidSpanId", { enumerable: true, get: function() {
          return x.isValidSpanId;
        } }), _ = P(546), Object.defineProperty(T, "INVALID_SPANID", { enumerable: true, get: function() {
          return _.INVALID_SPANID;
        } }), Object.defineProperty(T, "INVALID_TRACEID", { enumerable: true, get: function() {
          return _.INVALID_TRACEID;
        } }), Object.defineProperty(T, "INVALID_SPAN_CONTEXT", { enumerable: true, get: function() {
          return _.INVALID_SPAN_CONTEXT;
        } }), r2 = P(778), Object.defineProperty(T, "context", { enumerable: true, get: function() {
          return r2.context;
        } }), n = P(304), Object.defineProperty(T, "diag", { enumerable: true, get: function() {
          return n.diag;
        } }), i = P(120), Object.defineProperty(T, "metrics", { enumerable: true, get: function() {
          return i.metrics;
        } }), a = P(27), Object.defineProperty(T, "propagation", { enumerable: true, get: function() {
          return a.propagation;
        } }), o = P(816), Object.defineProperty(T, "trace", { enumerable: true, get: function() {
          return o.trace;
        } }), T.default = { context: r2.context, diag: n.diag, metrics: i.metrics, propagation: a.propagation, trace: o.trace }, t.exports = T;
      })();
    }, 71498, (e, t, r) => {
      (() => {
        "use strict";
        "u" > typeof __nccwpck_require__ && (__nccwpck_require__.ab = "/ROOT/node_modules/next/dist/compiled/cookie/");
        var e2, r2, n, i, a = {};
        a.parse = function(t2, r3) {
          if ("string" != typeof t2) throw TypeError("argument str must be a string");
          for (var i2 = {}, a2 = t2.split(n), o = (r3 || {}).decode || e2, s = 0; s < a2.length; s++) {
            var l = a2[s], c = l.indexOf("=");
            if (!(c < 0)) {
              var u = l.substr(0, c).trim(), d = l.substr(++c, l.length).trim();
              '"' == d[0] && (d = d.slice(1, -1)), void 0 == i2[u] && (i2[u] = (function(e3, t3) {
                try {
                  return t3(e3);
                } catch (t4) {
                  return e3;
                }
              })(d, o));
            }
          }
          return i2;
        }, a.serialize = function(e3, t2, n2) {
          var a2 = n2 || {}, o = a2.encode || r2;
          if ("function" != typeof o) throw TypeError("option encode is invalid");
          if (!i.test(e3)) throw TypeError("argument name is invalid");
          var s = o(t2);
          if (s && !i.test(s)) throw TypeError("argument val is invalid");
          var l = e3 + "=" + s;
          if (null != a2.maxAge) {
            var c = a2.maxAge - 0;
            if (isNaN(c) || !isFinite(c)) throw TypeError("option maxAge is invalid");
            l += "; Max-Age=" + Math.floor(c);
          }
          if (a2.domain) {
            if (!i.test(a2.domain)) throw TypeError("option domain is invalid");
            l += "; Domain=" + a2.domain;
          }
          if (a2.path) {
            if (!i.test(a2.path)) throw TypeError("option path is invalid");
            l += "; Path=" + a2.path;
          }
          if (a2.expires) {
            if ("function" != typeof a2.expires.toUTCString) throw TypeError("option expires is invalid");
            l += "; Expires=" + a2.expires.toUTCString();
          }
          if (a2.httpOnly && (l += "; HttpOnly"), a2.secure && (l += "; Secure"), a2.sameSite) switch ("string" == typeof a2.sameSite ? a2.sameSite.toLowerCase() : a2.sameSite) {
            case true:
            case "strict":
              l += "; SameSite=Strict";
              break;
            case "lax":
              l += "; SameSite=Lax";
              break;
            case "none":
              l += "; SameSite=None";
              break;
            default:
              throw TypeError("option sameSite is invalid");
          }
          return l;
        }, e2 = decodeURIComponent, r2 = encodeURIComponent, n = /; */, i = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/, t.exports = a;
      })();
    }, 63398, (e, t, r) => {
      var n = { 226: (e2, t2, r2) => {
        "use strict";
        var n2 = r2(302), i2 = r2(551);
        function a2() {
          this.pending = null, this.pendingTotal = 0, this.blockSize = this.constructor.blockSize, this.outSize = this.constructor.outSize, this.hmacStrength = this.constructor.hmacStrength, this.padLength = this.constructor.padLength / 8, this.endian = "big", this._delta8 = this.blockSize / 8, this._delta32 = this.blockSize / 32;
        }
        t2.BlockHash = a2, a2.prototype.update = function(e3, t3) {
          if (e3 = n2.toArray(e3, t3), this.pending ? this.pending = this.pending.concat(e3) : this.pending = e3, this.pendingTotal += e3.length, this.pending.length >= this._delta8) {
            var r3 = (e3 = this.pending).length % this._delta8;
            this.pending = e3.slice(e3.length - r3, e3.length), 0 === this.pending.length && (this.pending = null), e3 = n2.join32(e3, 0, e3.length - r3, this.endian);
            for (var i3 = 0; i3 < e3.length; i3 += this._delta32) this._update(e3, i3, i3 + this._delta32);
          }
          return this;
        }, a2.prototype.digest = function(e3) {
          return this.update(this._pad()), i2(null === this.pending), this._digest(e3);
        }, a2.prototype._pad = function() {
          var e3 = this.pendingTotal, t3 = this._delta8, r3 = t3 - (e3 + this.padLength) % t3, n3 = Array(r3 + this.padLength);
          n3[0] = 128;
          for (var i3 = 1; i3 < r3; i3++) n3[i3] = 0;
          if (e3 <<= 3, "big" === this.endian) {
            for (var a3 = 8; a3 < this.padLength; a3++) n3[i3++] = 0;
            n3[i3++] = 0, n3[i3++] = 0, n3[i3++] = 0, n3[i3++] = 0, n3[i3++] = e3 >>> 24 & 255, n3[i3++] = e3 >>> 16 & 255, n3[i3++] = e3 >>> 8 & 255, n3[i3++] = 255 & e3;
          } else for (n3[i3++] = 255 & e3, n3[i3++] = e3 >>> 8 & 255, n3[i3++] = e3 >>> 16 & 255, n3[i3++] = e3 >>> 24 & 255, n3[i3++] = 0, n3[i3++] = 0, n3[i3++] = 0, n3[i3++] = 0, a3 = 8; a3 < this.padLength; a3++) n3[i3++] = 0;
          return n3;
        };
      }, 563: (e2, t2, r2) => {
        "use strict";
        var n2 = r2(302), i2 = r2(226), a2 = r2(101), o = r2(551), s = n2.sum32, l = n2.sum32_4, c = n2.sum32_5, u = a2.ch32, d = a2.maj32, h = a2.s0_256, p = a2.s1_256, f = a2.g0_256, g = a2.g1_256, m = i2.BlockHash, v = [1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298];
        function b() {
          if (!(this instanceof b)) return new b();
          m.call(this), this.h = [1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225], this.k = v, this.W = Array(64);
        }
        n2.inherits(b, m), e2.exports = b, b.blockSize = 512, b.outSize = 256, b.hmacStrength = 192, b.padLength = 64, b.prototype._update = function(e3, t3) {
          for (var r3 = this.W, n3 = 0; n3 < 16; n3++) r3[n3] = e3[t3 + n3];
          for (; n3 < r3.length; n3++) r3[n3] = l(g(r3[n3 - 2]), r3[n3 - 7], f(r3[n3 - 15]), r3[n3 - 16]);
          var i3 = this.h[0], a3 = this.h[1], m2 = this.h[2], v2 = this.h[3], b2 = this.h[4], w = this.h[5], y = this.h[6], x = this.h[7];
          for (o(this.k.length === r3.length), n3 = 0; n3 < r3.length; n3++) {
            var _ = c(x, p(b2), u(b2, w, y), this.k[n3], r3[n3]), S = s(h(i3), d(i3, a3, m2));
            x = y, y = w, w = b2, b2 = s(v2, _), v2 = m2, m2 = a3, a3 = i3, i3 = s(_, S);
          }
          this.h[0] = s(this.h[0], i3), this.h[1] = s(this.h[1], a3), this.h[2] = s(this.h[2], m2), this.h[3] = s(this.h[3], v2), this.h[4] = s(this.h[4], b2), this.h[5] = s(this.h[5], w), this.h[6] = s(this.h[6], y), this.h[7] = s(this.h[7], x);
        }, b.prototype._digest = function(e3) {
          return "hex" === e3 ? n2.toHex32(this.h, "big") : n2.split32(this.h, "big");
        };
      }, 101: (e2, t2, r2) => {
        "use strict";
        var n2 = r2(302).rotr32;
        function i2(e3, t3, r3) {
          return e3 & t3 ^ e3 & r3 ^ t3 & r3;
        }
        t2.ft_1 = function(e3, t3, r3, n3) {
          var a2;
          return 0 === e3 ? (a2 = t3) & r3 ^ ~a2 & n3 : 1 === e3 || 3 === e3 ? t3 ^ r3 ^ n3 : 2 === e3 ? i2(t3, r3, n3) : void 0;
        }, t2.ch32 = function(e3, t3, r3) {
          return e3 & t3 ^ ~e3 & r3;
        }, t2.maj32 = i2, t2.p32 = function(e3, t3, r3) {
          return e3 ^ t3 ^ r3;
        }, t2.s0_256 = function(e3) {
          return n2(e3, 2) ^ n2(e3, 13) ^ n2(e3, 22);
        }, t2.s1_256 = function(e3) {
          return n2(e3, 6) ^ n2(e3, 11) ^ n2(e3, 25);
        }, t2.g0_256 = function(e3) {
          return n2(e3, 7) ^ n2(e3, 18) ^ e3 >>> 3;
        }, t2.g1_256 = function(e3) {
          return n2(e3, 17) ^ n2(e3, 19) ^ e3 >>> 10;
        };
      }, 302: (e2, t2, r2) => {
        "use strict";
        var n2 = r2(551);
        function i2(e3) {
          return (e3 >>> 24 | e3 >>> 8 & 65280 | e3 << 8 & 16711680 | (255 & e3) << 24) >>> 0;
        }
        function a2(e3) {
          return 1 === e3.length ? "0" + e3 : e3;
        }
        function o(e3) {
          if (7 === e3.length) return "0" + e3;
          if (6 === e3.length) return "00" + e3;
          if (5 === e3.length) return "000" + e3;
          if (4 === e3.length) return "0000" + e3;
          if (3 === e3.length) return "00000" + e3;
          else if (2 === e3.length) return "000000" + e3;
          else if (1 === e3.length) return "0000000" + e3;
          else return e3;
        }
        t2.inherits = r2(638), t2.toArray = function(e3, t3) {
          if (Array.isArray(e3)) return e3.slice();
          if (!e3) return [];
          var r3 = [];
          if ("string" == typeof e3) if (t3) {
            if ("hex" === t3) for ((e3 = e3.replace(/[^a-z0-9]+/gi, "")).length % 2 != 0 && (e3 = "0" + e3), i3 = 0; i3 < e3.length; i3 += 2) r3.push(parseInt(e3[i3] + e3[i3 + 1], 16));
          } else for (var n3 = 0, i3 = 0; i3 < e3.length; i3++) {
            var a3, o2, s = e3.charCodeAt(i3);
            s < 128 ? r3[n3++] = s : (s < 2048 ? r3[n3++] = s >> 6 | 192 : ((a3 = e3, o2 = i3, (64512 & a3.charCodeAt(o2)) != 55296 || o2 < 0 || o2 + 1 >= a3.length ? 1 : (64512 & a3.charCodeAt(o2 + 1)) != 56320) ? r3[n3++] = s >> 12 | 224 : (s = 65536 + ((1023 & s) << 10) + (1023 & e3.charCodeAt(++i3)), r3[n3++] = s >> 18 | 240, r3[n3++] = s >> 12 & 63 | 128), r3[n3++] = s >> 6 & 63 | 128), r3[n3++] = 63 & s | 128);
          }
          else for (i3 = 0; i3 < e3.length; i3++) r3[i3] = 0 | e3[i3];
          return r3;
        }, t2.toHex = function(e3) {
          for (var t3 = "", r3 = 0; r3 < e3.length; r3++) t3 += a2(e3[r3].toString(16));
          return t3;
        }, t2.htonl = i2, t2.toHex32 = function(e3, t3) {
          for (var r3 = "", n3 = 0; n3 < e3.length; n3++) {
            var a3 = e3[n3];
            "little" === t3 && (a3 = i2(a3)), r3 += o(a3.toString(16));
          }
          return r3;
        }, t2.zero2 = a2, t2.zero8 = o, t2.join32 = function(e3, t3, r3, i3) {
          var a3, o2 = r3 - t3;
          n2(o2 % 4 == 0);
          for (var s = Array(o2 / 4), l = 0, c = t3; l < s.length; l++, c += 4) a3 = "big" === i3 ? e3[c] << 24 | e3[c + 1] << 16 | e3[c + 2] << 8 | e3[c + 3] : e3[c + 3] << 24 | e3[c + 2] << 16 | e3[c + 1] << 8 | e3[c], s[l] = a3 >>> 0;
          return s;
        }, t2.split32 = function(e3, t3) {
          for (var r3 = Array(4 * e3.length), n3 = 0, i3 = 0; n3 < e3.length; n3++, i3 += 4) {
            var a3 = e3[n3];
            "big" === t3 ? (r3[i3] = a3 >>> 24, r3[i3 + 1] = a3 >>> 16 & 255, r3[i3 + 2] = a3 >>> 8 & 255, r3[i3 + 3] = 255 & a3) : (r3[i3 + 3] = a3 >>> 24, r3[i3 + 2] = a3 >>> 16 & 255, r3[i3 + 1] = a3 >>> 8 & 255, r3[i3] = 255 & a3);
          }
          return r3;
        }, t2.rotr32 = function(e3, t3) {
          return e3 >>> t3 | e3 << 32 - t3;
        }, t2.rotl32 = function(e3, t3) {
          return e3 << t3 | e3 >>> 32 - t3;
        }, t2.sum32 = function(e3, t3) {
          return e3 + t3 >>> 0;
        }, t2.sum32_3 = function(e3, t3, r3) {
          return e3 + t3 + r3 >>> 0;
        }, t2.sum32_4 = function(e3, t3, r3, n3) {
          return e3 + t3 + r3 + n3 >>> 0;
        }, t2.sum32_5 = function(e3, t3, r3, n3, i3) {
          return e3 + t3 + r3 + n3 + i3 >>> 0;
        }, t2.sum64 = function(e3, t3, r3, n3) {
          var i3 = e3[t3], a3 = n3 + e3[t3 + 1] >>> 0;
          e3[t3] = +(a3 < n3) + r3 + i3 >>> 0, e3[t3 + 1] = a3;
        }, t2.sum64_hi = function(e3, t3, r3, n3) {
          return +(t3 + n3 >>> 0 < t3) + e3 + r3 >>> 0;
        }, t2.sum64_lo = function(e3, t3, r3, n3) {
          return t3 + n3 >>> 0;
        }, t2.sum64_4_hi = function(e3, t3, r3, n3, i3, a3, o2, s) {
          var l, c = t3;
          return e3 + r3 + i3 + o2 + (l = 0 + +((c = c + n3 >>> 0) < t3) + +((c = c + a3 >>> 0) < a3) + +((c = c + s >>> 0) < s)) >>> 0;
        }, t2.sum64_4_lo = function(e3, t3, r3, n3, i3, a3, o2, s) {
          return t3 + n3 + a3 + s >>> 0;
        }, t2.sum64_5_hi = function(e3, t3, r3, n3, i3, a3, o2, s, l, c) {
          var u, d = t3;
          return e3 + r3 + i3 + o2 + l + (u = 0 + +((d = d + n3 >>> 0) < t3) + +((d = d + a3 >>> 0) < a3) + +((d = d + s >>> 0) < s) + +((d = d + c >>> 0) < c)) >>> 0;
        }, t2.sum64_5_lo = function(e3, t3, r3, n3, i3, a3, o2, s, l, c) {
          return t3 + n3 + a3 + s + c >>> 0;
        }, t2.rotr64_hi = function(e3, t3, r3) {
          return (t3 << 32 - r3 | e3 >>> r3) >>> 0;
        }, t2.rotr64_lo = function(e3, t3, r3) {
          return (e3 << 32 - r3 | t3 >>> r3) >>> 0;
        }, t2.shr64_hi = function(e3, t3, r3) {
          return e3 >>> r3;
        }, t2.shr64_lo = function(e3, t3, r3) {
          return (e3 << 32 - r3 | t3 >>> r3) >>> 0;
        };
      }, 638: (e2) => {
        "function" == typeof Object.create ? e2.exports = function(e3, t2) {
          t2 && (e3.super_ = t2, e3.prototype = Object.create(t2.prototype, { constructor: { value: e3, enumerable: false, writable: true, configurable: true } }));
        } : e2.exports = function(e3, t2) {
          if (t2) {
            e3.super_ = t2;
            var r2 = function() {
            };
            r2.prototype = t2.prototype, e3.prototype = new r2(), e3.prototype.constructor = e3;
          }
        };
      }, 551: (e2) => {
        function t2(e3, t3) {
          if (!e3) throw Error(t3 || "Assertion failed");
        }
        e2.exports = t2, t2.equal = function(e3, t3, r2) {
          if (e3 != t3) throw Error(r2 || "Assertion failed: " + e3 + " != " + t3);
        };
      } }, i = {};
      function a(e2) {
        var t2 = i[e2];
        if (void 0 !== t2) return t2.exports;
        var r2 = i[e2] = { exports: {} }, o = true;
        try {
          n[e2](r2, r2.exports, a), o = false;
        } finally {
          o && delete i[e2];
        }
        return r2.exports;
      }
      a.ab = "/ROOT/node_modules/next/dist/compiled/hash.js/sha256/", t.exports = a(563);
    }, 99734, (e, t, r) => {
      (() => {
        "use strict";
        let e2, r2, n, i, a;
        var o = { 234: (e3) => {
          var t2 = Object.prototype.hasOwnProperty, r3 = "~";
          function n2() {
          }
          function i2(e4, t3, r4) {
            this.fn = e4, this.context = t3, this.once = r4 || false;
          }
          function a2(e4, t3, n3, a3, o3) {
            if ("function" != typeof n3) throw TypeError("The listener must be a function");
            var s3 = new i2(n3, a3 || e4, o3), l2 = r3 ? r3 + t3 : t3;
            return e4._events[l2] ? e4._events[l2].fn ? e4._events[l2] = [e4._events[l2], s3] : e4._events[l2].push(s3) : (e4._events[l2] = s3, e4._eventsCount++), e4;
          }
          function o2(e4, t3) {
            0 == --e4._eventsCount ? e4._events = new n2() : delete e4._events[t3];
          }
          function s2() {
            this._events = new n2(), this._eventsCount = 0;
          }
          Object.create && (n2.prototype = /* @__PURE__ */ Object.create(null), new n2().__proto__ || (r3 = false)), s2.prototype.eventNames = function() {
            var e4, n3, i3 = [];
            if (0 === this._eventsCount) return i3;
            for (n3 in e4 = this._events) t2.call(e4, n3) && i3.push(r3 ? n3.slice(1) : n3);
            return Object.getOwnPropertySymbols ? i3.concat(Object.getOwnPropertySymbols(e4)) : i3;
          }, s2.prototype.listeners = function(e4) {
            var t3 = r3 ? r3 + e4 : e4, n3 = this._events[t3];
            if (!n3) return [];
            if (n3.fn) return [n3.fn];
            for (var i3 = 0, a3 = n3.length, o3 = Array(a3); i3 < a3; i3++) o3[i3] = n3[i3].fn;
            return o3;
          }, s2.prototype.listenerCount = function(e4) {
            var t3 = r3 ? r3 + e4 : e4, n3 = this._events[t3];
            return n3 ? n3.fn ? 1 : n3.length : 0;
          }, s2.prototype.emit = function(e4, t3, n3, i3, a3, o3) {
            var s3 = r3 ? r3 + e4 : e4;
            if (!this._events[s3]) return false;
            var l2, c2, u = this._events[s3], d = arguments.length;
            if (u.fn) {
              switch (u.once && this.removeListener(e4, u.fn, void 0, true), d) {
                case 1:
                  return u.fn.call(u.context), true;
                case 2:
                  return u.fn.call(u.context, t3), true;
                case 3:
                  return u.fn.call(u.context, t3, n3), true;
                case 4:
                  return u.fn.call(u.context, t3, n3, i3), true;
                case 5:
                  return u.fn.call(u.context, t3, n3, i3, a3), true;
                case 6:
                  return u.fn.call(u.context, t3, n3, i3, a3, o3), true;
              }
              for (c2 = 1, l2 = Array(d - 1); c2 < d; c2++) l2[c2 - 1] = arguments[c2];
              u.fn.apply(u.context, l2);
            } else {
              var h, p = u.length;
              for (c2 = 0; c2 < p; c2++) switch (u[c2].once && this.removeListener(e4, u[c2].fn, void 0, true), d) {
                case 1:
                  u[c2].fn.call(u[c2].context);
                  break;
                case 2:
                  u[c2].fn.call(u[c2].context, t3);
                  break;
                case 3:
                  u[c2].fn.call(u[c2].context, t3, n3);
                  break;
                case 4:
                  u[c2].fn.call(u[c2].context, t3, n3, i3);
                  break;
                default:
                  if (!l2) for (h = 1, l2 = Array(d - 1); h < d; h++) l2[h - 1] = arguments[h];
                  u[c2].fn.apply(u[c2].context, l2);
              }
            }
            return true;
          }, s2.prototype.on = function(e4, t3, r4) {
            return a2(this, e4, t3, r4, false);
          }, s2.prototype.once = function(e4, t3, r4) {
            return a2(this, e4, t3, r4, true);
          }, s2.prototype.removeListener = function(e4, t3, n3, i3) {
            var a3 = r3 ? r3 + e4 : e4;
            if (!this._events[a3]) return this;
            if (!t3) return o2(this, a3), this;
            var s3 = this._events[a3];
            if (s3.fn) s3.fn !== t3 || i3 && !s3.once || n3 && s3.context !== n3 || o2(this, a3);
            else {
              for (var l2 = 0, c2 = [], u = s3.length; l2 < u; l2++) (s3[l2].fn !== t3 || i3 && !s3[l2].once || n3 && s3[l2].context !== n3) && c2.push(s3[l2]);
              c2.length ? this._events[a3] = 1 === c2.length ? c2[0] : c2 : o2(this, a3);
            }
            return this;
          }, s2.prototype.removeAllListeners = function(e4) {
            var t3;
            return e4 ? (t3 = r3 ? r3 + e4 : e4, this._events[t3] && o2(this, t3)) : (this._events = new n2(), this._eventsCount = 0), this;
          }, s2.prototype.off = s2.prototype.removeListener, s2.prototype.addListener = s2.prototype.on, s2.prefixed = r3, s2.EventEmitter = s2, e3.exports = s2;
        }, 274: (e3) => {
          e3.exports = (e4, t2) => (t2 = t2 || (() => {
          }), e4.then((e5) => new Promise((e6) => {
            e6(t2());
          }).then(() => e5), (e5) => new Promise((e6) => {
            e6(t2());
          }).then(() => {
            throw e5;
          })));
        }, 294: (e3, t2) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.default = function(e4, t3, r3) {
            let n2 = 0, i2 = e4.length;
            for (; i2 > 0; ) {
              let a2 = i2 / 2 | 0, o2 = n2 + a2;
              0 >= r3(e4[o2], t3) ? (n2 = ++o2, i2 -= a2 + 1) : i2 = a2;
            }
            return n2;
          };
        }, 838: (e3, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true });
          let n2 = r3(294);
          t2.default = class {
            constructor() {
              this._queue = [];
            }
            enqueue(e4, t3) {
              let r4 = { priority: (t3 = Object.assign({ priority: 0 }, t3)).priority, run: e4 };
              if (this.size && this._queue[this.size - 1].priority >= t3.priority) return void this._queue.push(r4);
              let i2 = n2.default(this._queue, r4, (e5, t4) => t4.priority - e5.priority);
              this._queue.splice(i2, 0, r4);
            }
            dequeue() {
              let e4 = this._queue.shift();
              return null == e4 ? void 0 : e4.run;
            }
            filter(e4) {
              return this._queue.filter((t3) => t3.priority === e4.priority).map((e5) => e5.run);
            }
            get size() {
              return this._queue.length;
            }
          };
        }, 138: (e3, t2, r3) => {
          let n2 = r3(274);
          class i2 extends Error {
            constructor(e4) {
              super(e4), this.name = "TimeoutError";
            }
          }
          let a2 = (e4, t3, r4) => new Promise((a3, o2) => {
            if ("number" != typeof t3 || t3 < 0) throw TypeError("Expected `milliseconds` to be a positive number");
            if (1 / 0 === t3) return void a3(e4);
            let s2 = setTimeout(() => {
              if ("function" == typeof r4) {
                try {
                  a3(r4());
                } catch (e5) {
                  o2(e5);
                }
                return;
              }
              let n3 = "string" == typeof r4 ? r4 : `Promise timed out after ${t3} milliseconds`, s3 = r4 instanceof Error ? r4 : new i2(n3);
              "function" == typeof e4.cancel && e4.cancel(), o2(s3);
            }, t3);
            n2(e4.then(a3, o2), () => {
              clearTimeout(s2);
            });
          });
          e3.exports = a2, e3.exports.default = a2, e3.exports.TimeoutError = i2;
        } }, s = {};
        function l(e3) {
          var t2 = s[e3];
          if (void 0 !== t2) return t2.exports;
          var r3 = s[e3] = { exports: {} }, n2 = true;
          try {
            o[e3](r3, r3.exports, l), n2 = false;
          } finally {
            n2 && delete s[e3];
          }
          return r3.exports;
        }
        l.ab = "/ROOT/node_modules/next/dist/compiled/p-queue/";
        var c = {};
        Object.defineProperty(c, "__esModule", { value: true }), e2 = l(234), r2 = l(138), n = l(838), i = () => {
        }, a = new r2.TimeoutError(), c.default = class extends e2 {
          constructor(e3) {
            var t2, r3, a2, o2;
            if (super(), this._intervalCount = 0, this._intervalEnd = 0, this._pendingCount = 0, this._resolveEmpty = i, this._resolveIdle = i, !("number" == typeof (e3 = Object.assign({ carryoverConcurrencyCount: false, intervalCap: 1 / 0, interval: 0, concurrency: 1 / 0, autoStart: true, queueClass: n.default }, e3)).intervalCap && e3.intervalCap >= 1)) throw TypeError(`Expected \`intervalCap\` to be a number from 1 and up, got \`${null != (r3 = null == (t2 = e3.intervalCap) ? void 0 : t2.toString()) ? r3 : ""}\` (${typeof e3.intervalCap})`);
            if (void 0 === e3.interval || !(Number.isFinite(e3.interval) && e3.interval >= 0)) throw TypeError(`Expected \`interval\` to be a finite number >= 0, got \`${null != (o2 = null == (a2 = e3.interval) ? void 0 : a2.toString()) ? o2 : ""}\` (${typeof e3.interval})`);
            this._carryoverConcurrencyCount = e3.carryoverConcurrencyCount, this._isIntervalIgnored = 1 / 0 === e3.intervalCap || 0 === e3.interval, this._intervalCap = e3.intervalCap, this._interval = e3.interval, this._queue = new e3.queueClass(), this._queueClass = e3.queueClass, this.concurrency = e3.concurrency, this._timeout = e3.timeout, this._throwOnTimeout = true === e3.throwOnTimeout, this._isPaused = false === e3.autoStart;
          }
          get _doesIntervalAllowAnother() {
            return this._isIntervalIgnored || this._intervalCount < this._intervalCap;
          }
          get _doesConcurrentAllowAnother() {
            return this._pendingCount < this._concurrency;
          }
          _next() {
            this._pendingCount--, this._tryToStartAnother(), this.emit("next");
          }
          _resolvePromises() {
            this._resolveEmpty(), this._resolveEmpty = i, 0 === this._pendingCount && (this._resolveIdle(), this._resolveIdle = i, this.emit("idle"));
          }
          _onResumeInterval() {
            this._onInterval(), this._initializeIntervalIfNeeded(), this._timeoutId = void 0;
          }
          _isIntervalPaused() {
            let e3 = Date.now();
            if (void 0 === this._intervalId) {
              let t2 = this._intervalEnd - e3;
              if (!(t2 < 0)) return void 0 === this._timeoutId && (this._timeoutId = setTimeout(() => {
                this._onResumeInterval();
              }, t2)), true;
              this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0;
            }
            return false;
          }
          _tryToStartAnother() {
            if (0 === this._queue.size) return this._intervalId && clearInterval(this._intervalId), this._intervalId = void 0, this._resolvePromises(), false;
            if (!this._isPaused) {
              let e3 = !this._isIntervalPaused();
              if (this._doesIntervalAllowAnother && this._doesConcurrentAllowAnother) {
                let t2 = this._queue.dequeue();
                return !!t2 && (this.emit("active"), t2(), e3 && this._initializeIntervalIfNeeded(), true);
              }
            }
            return false;
          }
          _initializeIntervalIfNeeded() {
            this._isIntervalIgnored || void 0 !== this._intervalId || (this._intervalId = setInterval(() => {
              this._onInterval();
            }, this._interval), this._intervalEnd = Date.now() + this._interval);
          }
          _onInterval() {
            0 === this._intervalCount && 0 === this._pendingCount && this._intervalId && (clearInterval(this._intervalId), this._intervalId = void 0), this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0, this._processQueue();
          }
          _processQueue() {
            for (; this._tryToStartAnother(); ) ;
          }
          get concurrency() {
            return this._concurrency;
          }
          set concurrency(e3) {
            if (!("number" == typeof e3 && e3 >= 1)) throw TypeError(`Expected \`concurrency\` to be a number from 1 and up, got \`${e3}\` (${typeof e3})`);
            this._concurrency = e3, this._processQueue();
          }
          async add(e3, t2 = {}) {
            return new Promise((n2, i2) => {
              let o2 = async () => {
                this._pendingCount++, this._intervalCount++;
                try {
                  let o3 = void 0 === this._timeout && void 0 === t2.timeout ? e3() : r2.default(Promise.resolve(e3()), void 0 === t2.timeout ? this._timeout : t2.timeout, () => {
                    (void 0 === t2.throwOnTimeout ? this._throwOnTimeout : t2.throwOnTimeout) && i2(a);
                  });
                  n2(await o3);
                } catch (e4) {
                  i2(e4);
                }
                this._next();
              };
              this._queue.enqueue(o2, t2), this._tryToStartAnother(), this.emit("add");
            });
          }
          async addAll(e3, t2) {
            return Promise.all(e3.map(async (e4) => this.add(e4, t2)));
          }
          start() {
            return this._isPaused && (this._isPaused = false, this._processQueue()), this;
          }
          pause() {
            this._isPaused = true;
          }
          clear() {
            this._queue = new this._queueClass();
          }
          async onEmpty() {
            if (0 !== this._queue.size) return new Promise((e3) => {
              let t2 = this._resolveEmpty;
              this._resolveEmpty = () => {
                t2(), e3();
              };
            });
          }
          async onIdle() {
            if (0 !== this._pendingCount || 0 !== this._queue.size) return new Promise((e3) => {
              let t2 = this._resolveIdle;
              this._resolveIdle = () => {
                t2(), e3();
              };
            });
          }
          get size() {
            return this._queue.size;
          }
          sizeBy(e3) {
            return this._queue.filter(e3).length;
          }
          get pending() {
            return this._pendingCount;
          }
          get isPaused() {
            return this._isPaused;
          }
          get timeout() {
            return this._timeout;
          }
          set timeout(e3) {
            this._timeout = e3;
          }
        }, t.exports = c;
      })();
    }, 54846, (e, t, r) => {
      !(function() {
        "use strict";
        var e2 = { 431: function(e3) {
          function t2(e4) {
            if ("string" != typeof e4) throw TypeError("Path must be a string. Received " + JSON.stringify(e4));
          }
          function r3(e4, t3) {
            for (var r4, n3 = "", i = 0, a = -1, o = 0, s = 0; s <= e4.length; ++s) {
              if (s < e4.length) r4 = e4.charCodeAt(s);
              else if (47 === r4) break;
              else r4 = 47;
              if (47 === r4) {
                if (a === s - 1 || 1 === o) ;
                else if (a !== s - 1 && 2 === o) {
                  if (n3.length < 2 || 2 !== i || 46 !== n3.charCodeAt(n3.length - 1) || 46 !== n3.charCodeAt(n3.length - 2)) {
                    if (n3.length > 2) {
                      var l = n3.lastIndexOf("/");
                      if (l !== n3.length - 1) {
                        -1 === l ? (n3 = "", i = 0) : i = (n3 = n3.slice(0, l)).length - 1 - n3.lastIndexOf("/"), a = s, o = 0;
                        continue;
                      }
                    } else if (2 === n3.length || 1 === n3.length) {
                      n3 = "", i = 0, a = s, o = 0;
                      continue;
                    }
                  }
                  t3 && (n3.length > 0 ? n3 += "/.." : n3 = "..", i = 2);
                } else n3.length > 0 ? n3 += "/" + e4.slice(a + 1, s) : n3 = e4.slice(a + 1, s), i = s - a - 1;
                a = s, o = 0;
              } else 46 === r4 && -1 !== o ? ++o : o = -1;
            }
            return n3;
          }
          var n2 = { resolve: function() {
            for (var e4, n3, i = "", a = false, o = arguments.length - 1; o >= -1 && !a; o--) o >= 0 ? n3 = arguments[o] : (void 0 === e4 && (e4 = ""), n3 = e4), t2(n3), 0 !== n3.length && (i = n3 + "/" + i, a = 47 === n3.charCodeAt(0));
            if (i = r3(i, !a), a) if (i.length > 0) return "/" + i;
            else return "/";
            return i.length > 0 ? i : ".";
          }, normalize: function(e4) {
            if (t2(e4), 0 === e4.length) return ".";
            var n3 = 47 === e4.charCodeAt(0), i = 47 === e4.charCodeAt(e4.length - 1);
            return (0 !== (e4 = r3(e4, !n3)).length || n3 || (e4 = "."), e4.length > 0 && i && (e4 += "/"), n3) ? "/" + e4 : e4;
          }, isAbsolute: function(e4) {
            return t2(e4), e4.length > 0 && 47 === e4.charCodeAt(0);
          }, join: function() {
            if (0 == arguments.length) return ".";
            for (var e4, r4 = 0; r4 < arguments.length; ++r4) {
              var i = arguments[r4];
              t2(i), i.length > 0 && (void 0 === e4 ? e4 = i : e4 += "/" + i);
            }
            return void 0 === e4 ? "." : n2.normalize(e4);
          }, relative: function(e4, r4) {
            if (t2(e4), t2(r4), e4 === r4 || (e4 = n2.resolve(e4)) === (r4 = n2.resolve(r4))) return "";
            for (var i = 1; i < e4.length && 47 === e4.charCodeAt(i); ++i) ;
            for (var a = e4.length, o = a - i, s = 1; s < r4.length && 47 === r4.charCodeAt(s); ++s) ;
            for (var l = r4.length - s, c = o < l ? o : l, u = -1, d = 0; d <= c; ++d) {
              if (d === c) {
                if (l > c) {
                  if (47 === r4.charCodeAt(s + d)) return r4.slice(s + d + 1);
                  else if (0 === d) return r4.slice(s + d);
                } else o > c && (47 === e4.charCodeAt(i + d) ? u = d : 0 === d && (u = 0));
                break;
              }
              var h = e4.charCodeAt(i + d);
              if (h !== r4.charCodeAt(s + d)) break;
              47 === h && (u = d);
            }
            var p = "";
            for (d = i + u + 1; d <= a; ++d) (d === a || 47 === e4.charCodeAt(d)) && (0 === p.length ? p += ".." : p += "/..");
            return p.length > 0 ? p + r4.slice(s + u) : (s += u, 47 === r4.charCodeAt(s) && ++s, r4.slice(s));
          }, _makeLong: function(e4) {
            return e4;
          }, dirname: function(e4) {
            if (t2(e4), 0 === e4.length) return ".";
            for (var r4 = e4.charCodeAt(0), n3 = 47 === r4, i = -1, a = true, o = e4.length - 1; o >= 1; --o) if (47 === (r4 = e4.charCodeAt(o))) {
              if (!a) {
                i = o;
                break;
              }
            } else a = false;
            return -1 === i ? n3 ? "/" : "." : n3 && 1 === i ? "//" : e4.slice(0, i);
          }, basename: function(e4, r4) {
            if (void 0 !== r4 && "string" != typeof r4) throw TypeError('"ext" argument must be a string');
            t2(e4);
            var n3, i = 0, a = -1, o = true;
            if (void 0 !== r4 && r4.length > 0 && r4.length <= e4.length) {
              if (r4.length === e4.length && r4 === e4) return "";
              var s = r4.length - 1, l = -1;
              for (n3 = e4.length - 1; n3 >= 0; --n3) {
                var c = e4.charCodeAt(n3);
                if (47 === c) {
                  if (!o) {
                    i = n3 + 1;
                    break;
                  }
                } else -1 === l && (o = false, l = n3 + 1), s >= 0 && (c === r4.charCodeAt(s) ? -1 == --s && (a = n3) : (s = -1, a = l));
              }
              return i === a ? a = l : -1 === a && (a = e4.length), e4.slice(i, a);
            }
            for (n3 = e4.length - 1; n3 >= 0; --n3) if (47 === e4.charCodeAt(n3)) {
              if (!o) {
                i = n3 + 1;
                break;
              }
            } else -1 === a && (o = false, a = n3 + 1);
            return -1 === a ? "" : e4.slice(i, a);
          }, extname: function(e4) {
            t2(e4);
            for (var r4 = -1, n3 = 0, i = -1, a = true, o = 0, s = e4.length - 1; s >= 0; --s) {
              var l = e4.charCodeAt(s);
              if (47 === l) {
                if (!a) {
                  n3 = s + 1;
                  break;
                }
                continue;
              }
              -1 === i && (a = false, i = s + 1), 46 === l ? -1 === r4 ? r4 = s : 1 !== o && (o = 1) : -1 !== r4 && (o = -1);
            }
            return -1 === r4 || -1 === i || 0 === o || 1 === o && r4 === i - 1 && r4 === n3 + 1 ? "" : e4.slice(r4, i);
          }, format: function(e4) {
            var t3, r4;
            if (null === e4 || "object" != typeof e4) throw TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof e4);
            return t3 = e4.dir || e4.root, r4 = e4.base || (e4.name || "") + (e4.ext || ""), t3 ? t3 === e4.root ? t3 + r4 : t3 + "/" + r4 : r4;
          }, parse: function(e4) {
            t2(e4);
            var r4, n3 = { root: "", dir: "", base: "", ext: "", name: "" };
            if (0 === e4.length) return n3;
            var i = e4.charCodeAt(0), a = 47 === i;
            a ? (n3.root = "/", r4 = 1) : r4 = 0;
            for (var o = -1, s = 0, l = -1, c = true, u = e4.length - 1, d = 0; u >= r4; --u) {
              if (47 === (i = e4.charCodeAt(u))) {
                if (!c) {
                  s = u + 1;
                  break;
                }
                continue;
              }
              -1 === l && (c = false, l = u + 1), 46 === i ? -1 === o ? o = u : 1 !== d && (d = 1) : -1 !== o && (d = -1);
            }
            return -1 === o || -1 === l || 0 === d || 1 === d && o === l - 1 && o === s + 1 ? -1 !== l && (0 === s && a ? n3.base = n3.name = e4.slice(1, l) : n3.base = n3.name = e4.slice(s, l)) : (0 === s && a ? (n3.name = e4.slice(1, o), n3.base = e4.slice(1, l)) : (n3.name = e4.slice(s, o), n3.base = e4.slice(s, l)), n3.ext = e4.slice(o, l)), s > 0 ? n3.dir = e4.slice(0, s - 1) : a && (n3.dir = "/"), n3;
          }, sep: "/", delimiter: ":", win32: null, posix: null };
          n2.posix = n2, e3.exports = n2;
        } }, r2 = {};
        function n(t2) {
          var i = r2[t2];
          if (void 0 !== i) return i.exports;
          var a = r2[t2] = { exports: {} }, o = true;
          try {
            e2[t2](a, a.exports, n), o = false;
          } finally {
            o && delete r2[t2];
          }
          return a.exports;
        }
        n.ab = "/ROOT/node_modules/next/dist/compiled/path-browserify/", t.exports = n(431);
      })();
    }, 67914, (e, t, r) => {
      (() => {
        "use strict";
        "u" > typeof __nccwpck_require__ && (__nccwpck_require__.ab = "/ROOT/node_modules/next/dist/compiled/path-to-regexp/");
        var e2 = {};
        (() => {
          function t2(e3, t3) {
            void 0 === t3 && (t3 = {});
            for (var r3 = (function(e4) {
              for (var t4 = [], r4 = 0; r4 < e4.length; ) {
                var n3 = e4[r4];
                if ("*" === n3 || "+" === n3 || "?" === n3) {
                  t4.push({ type: "MODIFIER", index: r4, value: e4[r4++] });
                  continue;
                }
                if ("\\" === n3) {
                  t4.push({ type: "ESCAPED_CHAR", index: r4++, value: e4[r4++] });
                  continue;
                }
                if ("{" === n3) {
                  t4.push({ type: "OPEN", index: r4, value: e4[r4++] });
                  continue;
                }
                if ("}" === n3) {
                  t4.push({ type: "CLOSE", index: r4, value: e4[r4++] });
                  continue;
                }
                if (":" === n3) {
                  for (var i2 = "", a3 = r4 + 1; a3 < e4.length; ) {
                    var o3 = e4.charCodeAt(a3);
                    if (o3 >= 48 && o3 <= 57 || o3 >= 65 && o3 <= 90 || o3 >= 97 && o3 <= 122 || 95 === o3) {
                      i2 += e4[a3++];
                      continue;
                    }
                    break;
                  }
                  if (!i2) throw TypeError("Missing parameter name at ".concat(r4));
                  t4.push({ type: "NAME", index: r4, value: i2 }), r4 = a3;
                  continue;
                }
                if ("(" === n3) {
                  var s3 = 1, l2 = "", a3 = r4 + 1;
                  if ("?" === e4[a3]) throw TypeError('Pattern cannot start with "?" at '.concat(a3));
                  for (; a3 < e4.length; ) {
                    if ("\\" === e4[a3]) {
                      l2 += e4[a3++] + e4[a3++];
                      continue;
                    }
                    if (")" === e4[a3]) {
                      if (0 == --s3) {
                        a3++;
                        break;
                      }
                    } else if ("(" === e4[a3] && (s3++, "?" !== e4[a3 + 1])) throw TypeError("Capturing groups are not allowed at ".concat(a3));
                    l2 += e4[a3++];
                  }
                  if (s3) throw TypeError("Unbalanced pattern at ".concat(r4));
                  if (!l2) throw TypeError("Missing pattern at ".concat(r4));
                  t4.push({ type: "PATTERN", index: r4, value: l2 }), r4 = a3;
                  continue;
                }
                t4.push({ type: "CHAR", index: r4, value: e4[r4++] });
              }
              return t4.push({ type: "END", index: r4, value: "" }), t4;
            })(e3), n2 = t3.prefixes, a2 = void 0 === n2 ? "./" : n2, o2 = t3.delimiter, s2 = void 0 === o2 ? "/#?" : o2, l = [], c = 0, u = 0, d = "", h = function(e4) {
              if (u < r3.length && r3[u].type === e4) return r3[u++].value;
            }, p = function(e4) {
              var t4 = h(e4);
              if (void 0 !== t4) return t4;
              var n3 = r3[u], i2 = n3.type, a3 = n3.index;
              throw TypeError("Unexpected ".concat(i2, " at ").concat(a3, ", expected ").concat(e4));
            }, f = function() {
              for (var e4, t4 = ""; e4 = h("CHAR") || h("ESCAPED_CHAR"); ) t4 += e4;
              return t4;
            }, g = function(e4) {
              for (var t4 = 0; t4 < s2.length; t4++) {
                var r4 = s2[t4];
                if (e4.indexOf(r4) > -1) return true;
              }
              return false;
            }, m = function(e4) {
              var t4 = l[l.length - 1], r4 = e4 || (t4 && "string" == typeof t4 ? t4 : "");
              if (t4 && !r4) throw TypeError('Must have text between two parameters, missing text after "'.concat(t4.name, '"'));
              return !r4 || g(r4) ? "[^".concat(i(s2), "]+?") : "(?:(?!".concat(i(r4), ")[^").concat(i(s2), "])+?");
            }; u < r3.length; ) {
              var v = h("CHAR"), b = h("NAME"), w = h("PATTERN");
              if (b || w) {
                var y = v || "";
                -1 === a2.indexOf(y) && (d += y, y = ""), d && (l.push(d), d = ""), l.push({ name: b || c++, prefix: y, suffix: "", pattern: w || m(y), modifier: h("MODIFIER") || "" });
                continue;
              }
              var x = v || h("ESCAPED_CHAR");
              if (x) {
                d += x;
                continue;
              }
              if (d && (l.push(d), d = ""), h("OPEN")) {
                var y = f(), _ = h("NAME") || "", S = h("PATTERN") || "", C = f();
                p("CLOSE"), l.push({ name: _ || (S ? c++ : ""), pattern: _ && !S ? m(y) : S, prefix: y, suffix: C, modifier: h("MODIFIER") || "" });
                continue;
              }
              p("END");
            }
            return l;
          }
          function r2(e3, t3) {
            void 0 === t3 && (t3 = {});
            var r3 = a(t3), n2 = t3.encode, i2 = void 0 === n2 ? function(e4) {
              return e4;
            } : n2, o2 = t3.validate, s2 = void 0 === o2 || o2, l = e3.map(function(e4) {
              if ("object" == typeof e4) return new RegExp("^(?:".concat(e4.pattern, ")$"), r3);
            });
            return function(t4) {
              for (var r4 = "", n3 = 0; n3 < e3.length; n3++) {
                var a2 = e3[n3];
                if ("string" == typeof a2) {
                  r4 += a2;
                  continue;
                }
                var o3 = t4 ? t4[a2.name] : void 0, c = "?" === a2.modifier || "*" === a2.modifier, u = "*" === a2.modifier || "+" === a2.modifier;
                if (Array.isArray(o3)) {
                  if (!u) throw TypeError('Expected "'.concat(a2.name, '" to not repeat, but got an array'));
                  if (0 === o3.length) {
                    if (c) continue;
                    throw TypeError('Expected "'.concat(a2.name, '" to not be empty'));
                  }
                  for (var d = 0; d < o3.length; d++) {
                    var h = i2(o3[d], a2);
                    if (s2 && !l[n3].test(h)) throw TypeError('Expected all "'.concat(a2.name, '" to match "').concat(a2.pattern, '", but got "').concat(h, '"'));
                    r4 += a2.prefix + h + a2.suffix;
                  }
                  continue;
                }
                if ("string" == typeof o3 || "number" == typeof o3) {
                  var h = i2(String(o3), a2);
                  if (s2 && !l[n3].test(h)) throw TypeError('Expected "'.concat(a2.name, '" to match "').concat(a2.pattern, '", but got "').concat(h, '"'));
                  r4 += a2.prefix + h + a2.suffix;
                  continue;
                }
                if (!c) {
                  var p = u ? "an array" : "a string";
                  throw TypeError('Expected "'.concat(a2.name, '" to be ').concat(p));
                }
              }
              return r4;
            };
          }
          function n(e3, t3, r3) {
            void 0 === r3 && (r3 = {});
            var n2 = r3.decode, i2 = void 0 === n2 ? function(e4) {
              return e4;
            } : n2;
            return function(r4) {
              var n3 = e3.exec(r4);
              if (!n3) return false;
              for (var a2 = n3[0], o2 = n3.index, s2 = /* @__PURE__ */ Object.create(null), l = 1; l < n3.length; l++) !(function(e4) {
                if (void 0 !== n3[e4]) {
                  var r5 = t3[e4 - 1];
                  "*" === r5.modifier || "+" === r5.modifier ? s2[r5.name] = n3[e4].split(r5.prefix + r5.suffix).map(function(e5) {
                    return i2(e5, r5);
                  }) : s2[r5.name] = i2(n3[e4], r5);
                }
              })(l);
              return { path: a2, index: o2, params: s2 };
            };
          }
          function i(e3) {
            return e3.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
          }
          function a(e3) {
            return e3 && e3.sensitive ? "" : "i";
          }
          function o(e3, t3, r3) {
            void 0 === r3 && (r3 = {});
            for (var n2 = r3.strict, o2 = void 0 !== n2 && n2, s2 = r3.start, l = r3.end, c = r3.encode, u = void 0 === c ? function(e4) {
              return e4;
            } : c, d = r3.delimiter, h = r3.endsWith, p = "[".concat(i(void 0 === h ? "" : h), "]|$"), f = "[".concat(i(void 0 === d ? "/#?" : d), "]"), g = void 0 === s2 || s2 ? "^" : "", m = 0; m < e3.length; m++) {
              var v = e3[m];
              if ("string" == typeof v) g += i(u(v));
              else {
                var b = i(u(v.prefix)), w = i(u(v.suffix));
                if (v.pattern) if (t3 && t3.push(v), b || w) if ("+" === v.modifier || "*" === v.modifier) {
                  var y = "*" === v.modifier ? "?" : "";
                  g += "(?:".concat(b, "((?:").concat(v.pattern, ")(?:").concat(w).concat(b, "(?:").concat(v.pattern, "))*)").concat(w, ")").concat(y);
                } else g += "(?:".concat(b, "(").concat(v.pattern, ")").concat(w, ")").concat(v.modifier);
                else {
                  if ("+" === v.modifier || "*" === v.modifier) throw TypeError('Can not repeat "'.concat(v.name, '" without a prefix and suffix'));
                  g += "(".concat(v.pattern, ")").concat(v.modifier);
                }
                else g += "(?:".concat(b).concat(w, ")").concat(v.modifier);
              }
            }
            if (void 0 === l || l) o2 || (g += "".concat(f, "?")), g += r3.endsWith ? "(?=".concat(p, ")") : "$";
            else {
              var x = e3[e3.length - 1], _ = "string" == typeof x ? f.indexOf(x[x.length - 1]) > -1 : void 0 === x;
              o2 || (g += "(?:".concat(f, "(?=").concat(p, "))?")), _ || (g += "(?=".concat(f, "|").concat(p, ")"));
            }
            return new RegExp(g, a(r3));
          }
          function s(e3, r3, n2) {
            if (e3 instanceof RegExp) {
              var i2;
              if (!r3) return e3;
              for (var l = /\((?:\?<(.*?)>)?(?!\?)/g, c = 0, u = l.exec(e3.source); u; ) r3.push({ name: u[1] || c++, prefix: "", suffix: "", modifier: "", pattern: "" }), u = l.exec(e3.source);
              return e3;
            }
            return Array.isArray(e3) ? (i2 = e3.map(function(e4) {
              return s(e4, r3, n2).source;
            }), new RegExp("(?:".concat(i2.join("|"), ")"), a(n2))) : o(t2(e3, n2), r3, n2);
          }
          Object.defineProperty(e2, "__esModule", { value: true }), e2.pathToRegexp = e2.tokensToRegexp = e2.regexpToFunction = e2.match = e2.tokensToFunction = e2.compile = e2.parse = void 0, e2.parse = t2, e2.compile = function(e3, n2) {
            return r2(t2(e3, n2), n2);
          }, e2.tokensToFunction = r2, e2.match = function(e3, t3) {
            var r3 = [];
            return n(s(e3, r3, t3), r3, t3);
          }, e2.regexpToFunction = n, e2.tokensToRegexp = o, e2.pathToRegexp = s;
        })(), t.exports = e2;
      })();
    }, 64445, (e, t, r) => {
      var n = { 943: function(t2, r2) {
        !(function(n2) {
          "use strict";
          var i2 = "function", a2 = "undefined", o = "object", s = "string", l = "major", c = "model", u = "name", d = "type", h = "vendor", p = "version", f = "architecture", g = "console", m = "mobile", v = "tablet", b = "smarttv", w = "wearable", y = "embedded", x = "Amazon", _ = "Apple", S = "ASUS", C = "BlackBerry", P = "Browser", T = "Chrome", E = "Firefox", R = "Google", O = "Huawei", A = "Microsoft", N = "Motorola", k = "Opera", I = "Samsung", M = "Sharp", L = "Sony", j = "Xiaomi", D = "Zebra", U = "Facebook", $ = "Chromium OS", q = "Mac OS", B = function(e2, t3) {
            var r3 = {};
            for (var n3 in e2) t3[n3] && t3[n3].length % 2 == 0 ? r3[n3] = t3[n3].concat(e2[n3]) : r3[n3] = e2[n3];
            return r3;
          }, F = function(e2) {
            for (var t3 = {}, r3 = 0; r3 < e2.length; r3++) t3[e2[r3].toUpperCase()] = e2[r3];
            return t3;
          }, H = function(e2, t3) {
            return typeof e2 === s && -1 !== G(t3).indexOf(G(e2));
          }, G = function(e2) {
            return e2.toLowerCase();
          }, V = function(e2, t3) {
            if (typeof e2 === s) return e2 = e2.replace(/^\s\s*/, ""), typeof t3 === a2 ? e2 : e2.substring(0, 350);
          }, z = function(e2, t3) {
            for (var r3, n3, a3, s2, l2, c2, u2 = 0; u2 < t3.length && !l2; ) {
              var d2 = t3[u2], h2 = t3[u2 + 1];
              for (r3 = n3 = 0; r3 < d2.length && !l2 && d2[r3]; ) if (l2 = d2[r3++].exec(e2)) for (a3 = 0; a3 < h2.length; a3++) c2 = l2[++n3], typeof (s2 = h2[a3]) === o && s2.length > 0 ? 2 === s2.length ? typeof s2[1] == i2 ? this[s2[0]] = s2[1].call(this, c2) : this[s2[0]] = s2[1] : 3 === s2.length ? typeof s2[1] !== i2 || s2[1].exec && s2[1].test ? this[s2[0]] = c2 ? c2.replace(s2[1], s2[2]) : void 0 : this[s2[0]] = c2 ? s2[1].call(this, c2, s2[2]) : void 0 : 4 === s2.length && (this[s2[0]] = c2 ? s2[3].call(this, c2.replace(s2[1], s2[2])) : void 0) : this[s2] = c2 || void 0;
              u2 += 2;
            }
          }, W = function(e2, t3) {
            for (var r3 in t3) if (typeof t3[r3] === o && t3[r3].length > 0) {
              for (var n3 = 0; n3 < t3[r3].length; n3++) if (H(t3[r3][n3], e2)) return "?" === r3 ? void 0 : r3;
            } else if (H(t3[r3], e2)) return "?" === r3 ? void 0 : r3;
            return e2;
          }, X = { ME: "4.90", "NT 3.11": "NT3.51", "NT 4.0": "NT4.0", 2e3: "NT 5.0", XP: ["NT 5.1", "NT 5.2"], Vista: "NT 6.0", 7: "NT 6.1", 8: "NT 6.2", 8.1: "NT 6.3", 10: ["NT 6.4", "NT 10.0"], RT: "ARM" }, K = { browser: [[/\b(?:crmo|crios)\/([\w\.]+)/i], [p, [u, "Chrome"]], [/edg(?:e|ios|a)?\/([\w\.]+)/i], [p, [u, "Edge"]], [/(opera mini)\/([-\w\.]+)/i, /(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i, /(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i], [u, p], [/opios[\/ ]+([\w\.]+)/i], [p, [u, k + " Mini"]], [/\bopr\/([\w\.]+)/i], [p, [u, k]], [/(kindle)\/([\w\.]+)/i, /(lunascape|maxthon|netfront|jasmine|blazer)[\/ ]?([\w\.]*)/i, /(avant |iemobile|slim)(?:browser)?[\/ ]?([\w\.]*)/i, /(ba?idubrowser)[\/ ]?([\w\.]+)/i, /(?:ms|\()(ie) ([\w\.]+)/i, /(flock|rockmelt|midori|epiphany|silk|skyfire|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|qq|duckduckgo)\/([-\w\.]+)/i, /(heytap|ovi)browser\/([\d\.]+)/i, /(weibo)__([\d\.]+)/i], [u, p], [/(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i], [p, [u, "UC" + P]], [/microm.+\bqbcore\/([\w\.]+)/i, /\bqbcore\/([\w\.]+).+microm/i], [p, [u, "WeChat(Win) Desktop"]], [/micromessenger\/([\w\.]+)/i], [p, [u, "WeChat"]], [/konqueror\/([\w\.]+)/i], [p, [u, "Konqueror"]], [/trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i], [p, [u, "IE"]], [/ya(?:search)?browser\/([\w\.]+)/i], [p, [u, "Yandex"]], [/(avast|avg)\/([\w\.]+)/i], [[u, /(.+)/, "$1 Secure " + P], p], [/\bfocus\/([\w\.]+)/i], [p, [u, E + " Focus"]], [/\bopt\/([\w\.]+)/i], [p, [u, k + " Touch"]], [/coc_coc\w+\/([\w\.]+)/i], [p, [u, "Coc Coc"]], [/dolfin\/([\w\.]+)/i], [p, [u, "Dolphin"]], [/coast\/([\w\.]+)/i], [p, [u, k + " Coast"]], [/miuibrowser\/([\w\.]+)/i], [p, [u, "MIUI " + P]], [/fxios\/([-\w\.]+)/i], [p, [u, E]], [/\bqihu|(qi?ho?o?|360)browser/i], [[u, "360 " + P]], [/(oculus|samsung|sailfish|huawei)browser\/([\w\.]+)/i], [[u, /(.+)/, "$1 " + P], p], [/(comodo_dragon)\/([\w\.]+)/i], [[u, /_/g, " "], p], [/(electron)\/([\w\.]+) safari/i, /(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i, /m?(qqbrowser|baiduboxapp|2345Explorer)[\/ ]?([\w\.]+)/i], [u, p], [/(metasr)[\/ ]?([\w\.]+)/i, /(lbbrowser)/i, /\[(linkedin)app\]/i], [u], [/((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i], [[u, U], p], [/(kakao(?:talk|story))[\/ ]([\w\.]+)/i, /(naver)\(.*?(\d+\.[\w\.]+).*\)/i, /safari (line)\/([\w\.]+)/i, /\b(line)\/([\w\.]+)\/iab/i, /(chromium|instagram)[\/ ]([-\w\.]+)/i], [u, p], [/\bgsa\/([\w\.]+) .*safari\//i], [p, [u, "GSA"]], [/musical_ly(?:.+app_?version\/|_)([\w\.]+)/i], [p, [u, "TikTok"]], [/headlesschrome(?:\/([\w\.]+)| )/i], [p, [u, T + " Headless"]], [/ wv\).+(chrome)\/([\w\.]+)/i], [[u, T + " WebView"], p], [/droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i], [p, [u, "Android " + P]], [/(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i], [u, p], [/version\/([\w\.\,]+) .*mobile\/\w+ (safari)/i], [p, [u, "Mobile Safari"]], [/version\/([\w(\.|\,)]+) .*(mobile ?safari|safari)/i], [p, u], [/webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i], [u, [p, W, { "1.0": "/8", 1.2: "/1", 1.3: "/3", "2.0": "/412", "2.0.2": "/416", "2.0.3": "/417", "2.0.4": "/419", "?": "/" }]], [/(webkit|khtml)\/([\w\.]+)/i], [u, p], [/(navigator|netscape\d?)\/([-\w\.]+)/i], [[u, "Netscape"], p], [/mobile vr; rv:([\w\.]+)\).+firefox/i], [p, [u, E + " Reality"]], [/ekiohf.+(flow)\/([\w\.]+)/i, /(swiftfox)/i, /(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror|klar)[\/ ]?([\w\.\+]+)/i, /(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i, /(firefox)\/([\w\.]+)/i, /(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i, /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i, /(links) \(([\w\.]+)/i, /panasonic;(viera)/i], [u, p], [/(cobalt)\/([\w\.]+)/i], [u, [p, /master.|lts./, ""]]], cpu: [[/(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i], [[f, "amd64"]], [/(ia32(?=;))/i], [[f, G]], [/((?:i[346]|x)86)[;\)]/i], [[f, "ia32"]], [/\b(aarch64|arm(v?8e?l?|_?64))\b/i], [[f, "arm64"]], [/\b(arm(?:v[67])?ht?n?[fl]p?)\b/i], [[f, "armhf"]], [/windows (ce|mobile); ppc;/i], [[f, "arm"]], [/((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i], [[f, /ower/, "", G]], [/(sun4\w)[;\)]/i], [[f, "sparc"]], [/((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i], [[f, G]]], device: [[/\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i], [c, [h, I], [d, v]], [/\b((?:s[cgp]h|gt|sm)-\w+|sc[g-]?[\d]+a?|galaxy nexus)/i, /samsung[- ]([-\w]+)/i, /sec-(sgh\w+)/i], [c, [h, I], [d, m]], [/(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i], [c, [h, _], [d, m]], [/\((ipad);[-\w\),; ]+apple/i, /applecoremedia\/[\w\.]+ \((ipad)/i, /\b(ipad)\d\d?,\d\d?[;\]].+ios/i], [c, [h, _], [d, v]], [/(macintosh);/i], [c, [h, _]], [/\b(sh-?[altvz]?\d\d[a-ekm]?)/i], [c, [h, M], [d, m]], [/\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i], [c, [h, O], [d, v]], [/(?:huawei|honor)([-\w ]+)[;\)]/i, /\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i], [c, [h, O], [d, m]], [/\b(poco[\w ]+)(?: bui|\))/i, /\b; (\w+) build\/hm\1/i, /\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i, /\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i, /\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite)?)(?: bui|\))/i], [[c, /_/g, " "], [h, j], [d, m]], [/\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i], [[c, /_/g, " "], [h, j], [d, v]], [/; (\w+) bui.+ oppo/i, /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i], [c, [h, "OPPO"], [d, m]], [/vivo (\w+)(?: bui|\))/i, /\b(v[12]\d{3}\w?[at])(?: bui|;)/i], [c, [h, "Vivo"], [d, m]], [/\b(rmx[12]\d{3})(?: bui|;|\))/i], [c, [h, "Realme"], [d, m]], [/\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i, /\bmot(?:orola)?[- ](\w*)/i, /((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i], [c, [h, N], [d, m]], [/\b(mz60\d|xoom[2 ]{0,2}) build\//i], [c, [h, N], [d, v]], [/((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i], [c, [h, "LG"], [d, v]], [/(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i, /\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i, /\blg-?([\d\w]+) bui/i], [c, [h, "LG"], [d, m]], [/(ideatab[-\w ]+)/i, /lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i], [c, [h, "Lenovo"], [d, v]], [/(?:maemo|nokia).*(n900|lumia \d+)/i, /nokia[-_ ]?([-\w\.]*)/i], [[c, /_/g, " "], [h, "Nokia"], [d, m]], [/(pixel c)\b/i], [c, [h, R], [d, v]], [/droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i], [c, [h, R], [d, m]], [/droid.+ (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i], [c, [h, L], [d, m]], [/sony tablet [ps]/i, /\b(?:sony)?sgp\w+(?: bui|\))/i], [[c, "Xperia Tablet"], [h, L], [d, v]], [/ (kb2005|in20[12]5|be20[12][59])\b/i, /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i], [c, [h, "OnePlus"], [d, m]], [/(alexa)webm/i, /(kf[a-z]{2}wi|aeo[c-r]{2})( bui|\))/i, /(kf[a-z]+)( bui|\)).+silk\//i], [c, [h, x], [d, v]], [/((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i], [[c, /(.+)/g, "Fire Phone $1"], [h, x], [d, m]], [/(playbook);[-\w\),; ]+(rim)/i], [c, h, [d, v]], [/\b((?:bb[a-f]|st[hv])100-\d)/i, /\(bb10; (\w+)/i], [c, [h, C], [d, m]], [/(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i], [c, [h, S], [d, v]], [/ (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i], [c, [h, S], [d, m]], [/(nexus 9)/i], [c, [h, "HTC"], [d, v]], [/(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i, /(zte)[- ]([\w ]+?)(?: bui|\/|\))/i, /(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i], [h, [c, /_/g, " "], [d, m]], [/droid.+; ([ab][1-7]-?[0178a]\d\d?)/i], [c, [h, "Acer"], [d, v]], [/droid.+; (m[1-5] note) bui/i, /\bmz-([-\w]{2,})/i], [c, [h, "Meizu"], [d, m]], [/(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[-_ ]?([-\w]*)/i, /(hp) ([\w ]+\w)/i, /(asus)-?(\w+)/i, /(microsoft); (lumia[\w ]+)/i, /(lenovo)[-_ ]?([-\w]+)/i, /(jolla)/i, /(oppo) ?([\w ]+) bui/i], [h, c, [d, m]], [/(kobo)\s(ereader|touch)/i, /(archos) (gamepad2?)/i, /(hp).+(touchpad(?!.+tablet)|tablet)/i, /(kindle)\/([\w\.]+)/i, /(nook)[\w ]+build\/(\w+)/i, /(dell) (strea[kpr\d ]*[\dko])/i, /(le[- ]+pan)[- ]+(\w{1,9}) bui/i, /(trinity)[- ]*(t\d{3}) bui/i, /(gigaset)[- ]+(q\w{1,9}) bui/i, /(vodafone) ([\w ]+)(?:\)| bui)/i], [h, c, [d, v]], [/(surface duo)/i], [c, [h, A], [d, v]], [/droid [\d\.]+; (fp\du?)(?: b|\))/i], [c, [h, "Fairphone"], [d, m]], [/(u304aa)/i], [c, [h, "AT&T"], [d, m]], [/\bsie-(\w*)/i], [c, [h, "Siemens"], [d, m]], [/\b(rct\w+) b/i], [c, [h, "RCA"], [d, v]], [/\b(venue[\d ]{2,7}) b/i], [c, [h, "Dell"], [d, v]], [/\b(q(?:mv|ta)\w+) b/i], [c, [h, "Verizon"], [d, v]], [/\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i], [c, [h, "Barnes & Noble"], [d, v]], [/\b(tm\d{3}\w+) b/i], [c, [h, "NuVision"], [d, v]], [/\b(k88) b/i], [c, [h, "ZTE"], [d, v]], [/\b(nx\d{3}j) b/i], [c, [h, "ZTE"], [d, m]], [/\b(gen\d{3}) b.+49h/i], [c, [h, "Swiss"], [d, m]], [/\b(zur\d{3}) b/i], [c, [h, "Swiss"], [d, v]], [/\b((zeki)?tb.*\b) b/i], [c, [h, "Zeki"], [d, v]], [/\b([yr]\d{2}) b/i, /\b(dragon[- ]+touch |dt)(\w{5}) b/i], [[h, "Dragon Touch"], c, [d, v]], [/\b(ns-?\w{0,9}) b/i], [c, [h, "Insignia"], [d, v]], [/\b((nxa|next)-?\w{0,9}) b/i], [c, [h, "NextBook"], [d, v]], [/\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i], [[h, "Voice"], c, [d, m]], [/\b(lvtel\-)?(v1[12]) b/i], [[h, "LvTel"], c, [d, m]], [/\b(ph-1) /i], [c, [h, "Essential"], [d, m]], [/\b(v(100md|700na|7011|917g).*\b) b/i], [c, [h, "Envizen"], [d, v]], [/\b(trio[-\w\. ]+) b/i], [c, [h, "MachSpeed"], [d, v]], [/\btu_(1491) b/i], [c, [h, "Rotor"], [d, v]], [/(shield[\w ]+) b/i], [c, [h, "Nvidia"], [d, v]], [/(sprint) (\w+)/i], [h, c, [d, m]], [/(kin\.[onetw]{3})/i], [[c, /\./g, " "], [h, A], [d, m]], [/droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i], [c, [h, D], [d, v]], [/droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i], [c, [h, D], [d, m]], [/smart-tv.+(samsung)/i], [h, [d, b]], [/hbbtv.+maple;(\d+)/i], [[c, /^/, "SmartTV"], [h, I], [d, b]], [/(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i], [[h, "LG"], [d, b]], [/(apple) ?tv/i], [h, [c, _ + " TV"], [d, b]], [/crkey/i], [[c, T + "cast"], [h, R], [d, b]], [/droid.+aft(\w)( bui|\))/i], [c, [h, x], [d, b]], [/\(dtv[\);].+(aquos)/i, /(aquos-tv[\w ]+)\)/i], [c, [h, M], [d, b]], [/(bravia[\w ]+)( bui|\))/i], [c, [h, L], [d, b]], [/(mitv-\w{5}) bui/i], [c, [h, j], [d, b]], [/Hbbtv.*(technisat) (.*);/i], [h, c, [d, b]], [/\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i, /hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i], [[h, V], [c, V], [d, b]], [/\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i], [[d, b]], [/(ouya)/i, /(nintendo) ([wids3utch]+)/i], [h, c, [d, g]], [/droid.+; (shield) bui/i], [c, [h, "Nvidia"], [d, g]], [/(playstation [345portablevi]+)/i], [c, [h, L], [d, g]], [/\b(xbox(?: one)?(?!; xbox))[\); ]/i], [c, [h, A], [d, g]], [/((pebble))app/i], [h, c, [d, w]], [/(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i], [c, [h, _], [d, w]], [/droid.+; (glass) \d/i], [c, [h, R], [d, w]], [/droid.+; (wt63?0{2,3})\)/i], [c, [h, D], [d, w]], [/(quest( 2| pro)?)/i], [c, [h, U], [d, w]], [/(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i], [h, [d, y]], [/(aeobc)\b/i], [c, [h, x], [d, y]], [/droid .+?; ([^;]+?)(?: bui|\) applew).+? mobile safari/i], [c, [d, m]], [/droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i], [c, [d, v]], [/\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i], [[d, v]], [/(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i], [[d, m]], [/(android[-\w\. ]{0,9});.+buil/i], [c, [h, "Generic"]]], engine: [[/windows.+ edge\/([\w\.]+)/i], [p, [u, "EdgeHTML"]], [/webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i], [p, [u, "Blink"]], [/(presto)\/([\w\.]+)/i, /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i, /ekioh(flow)\/([\w\.]+)/i, /(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i, /(icab)[\/ ]([23]\.[\d\.]+)/i, /\b(libweb)/i], [u, p], [/rv\:([\w\.]{1,9})\b.+(gecko)/i], [p, u]], os: [[/microsoft (windows) (vista|xp)/i], [u, p], [/(windows) nt 6\.2; (arm)/i, /(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i, /(windows)[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i], [u, [p, W, X]], [/(win(?=3|9|n)|win 9x )([nt\d\.]+)/i], [[u, "Windows"], [p, W, X]], [/ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i, /ios;fbsv\/([\d\.]+)/i, /cfnetwork\/.+darwin/i], [[p, /_/g, "."], [u, "iOS"]], [/(mac os x) ?([\w\. ]*)/i, /(macintosh|mac_powerpc\b)(?!.+haiku)/i], [[u, q], [p, /_/g, "."]], [/droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i], [p, u], [/(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-\/ ]?([\w\.]*)/i, /(blackberry)\w*\/([\w\.]*)/i, /(tizen|kaios)[\/ ]([\w\.]+)/i, /\((series40);/i], [u, p], [/\(bb(10);/i], [p, [u, C]], [/(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i], [p, [u, "Symbian"]], [/mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i], [p, [u, E + " OS"]], [/web0s;.+rt(tv)/i, /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i], [p, [u, "webOS"]], [/watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i], [p, [u, "watchOS"]], [/crkey\/([\d\.]+)/i], [p, [u, T + "cast"]], [/(cros) [\w]+(?:\)| ([\w\.]+)\b)/i], [[u, $], p], [/panasonic;(viera)/i, /(netrange)mmh/i, /(nettv)\/(\d+\.[\w\.]+)/i, /(nintendo|playstation) ([wids345portablevuch]+)/i, /(xbox); +xbox ([^\);]+)/i, /\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i, /(mint)[\/\(\) ]?(\w*)/i, /(mageia|vectorlinux)[; ]/i, /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i, /(hurd|linux) ?([\w\.]*)/i, /(gnu) ?([\w\.]*)/i, /\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i, /(haiku) (\w+)/i], [u, p], [/(sunos) ?([\w\.\d]*)/i], [[u, "Solaris"], p], [/((?:open)?solaris)[-\/ ]?([\w\.]*)/i, /(aix) ((\d)(?=\.|\)| )[\w\.])*/i, /\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i, /(unix) ?([\w\.]*)/i], [u, p]] }, J = function(e2, t3) {
            if (typeof e2 === o && (t3 = e2, e2 = void 0), !(this instanceof J)) return new J(e2, t3).getResult();
            var r3 = typeof n2 !== a2 && n2.navigator ? n2.navigator : void 0, g2 = e2 || (r3 && r3.userAgent ? r3.userAgent : ""), b2 = r3 && r3.userAgentData ? r3.userAgentData : void 0, w2 = t3 ? B(K, t3) : K, y2 = r3 && r3.userAgent == g2;
            return this.getBrowser = function() {
              var e3, t4 = {};
              return t4[u] = void 0, t4[p] = void 0, z.call(t4, g2, w2.browser), t4[l] = typeof (e3 = t4[p]) === s ? e3.replace(/[^\d\.]/g, "").split(".")[0] : void 0, y2 && r3 && r3.brave && typeof r3.brave.isBrave == i2 && (t4[u] = "Brave"), t4;
            }, this.getCPU = function() {
              var e3 = {};
              return e3[f] = void 0, z.call(e3, g2, w2.cpu), e3;
            }, this.getDevice = function() {
              var e3 = {};
              return e3[h] = void 0, e3[c] = void 0, e3[d] = void 0, z.call(e3, g2, w2.device), y2 && !e3[d] && b2 && b2.mobile && (e3[d] = m), y2 && "Macintosh" == e3[c] && r3 && typeof r3.standalone !== a2 && r3.maxTouchPoints && r3.maxTouchPoints > 2 && (e3[c] = "iPad", e3[d] = v), e3;
            }, this.getEngine = function() {
              var e3 = {};
              return e3[u] = void 0, e3[p] = void 0, z.call(e3, g2, w2.engine), e3;
            }, this.getOS = function() {
              var e3 = {};
              return e3[u] = void 0, e3[p] = void 0, z.call(e3, g2, w2.os), y2 && !e3[u] && b2 && "Unknown" != b2.platform && (e3[u] = b2.platform.replace(/chrome os/i, $).replace(/macos/i, q)), e3;
            }, this.getResult = function() {
              return { ua: this.getUA(), browser: this.getBrowser(), engine: this.getEngine(), os: this.getOS(), device: this.getDevice(), cpu: this.getCPU() };
            }, this.getUA = function() {
              return g2;
            }, this.setUA = function(e3) {
              return g2 = typeof e3 === s && e3.length > 350 ? V(e3, 350) : e3, this;
            }, this.setUA(g2), this;
          };
          if (J.VERSION = "1.0.35", J.BROWSER = F([u, p, l]), J.CPU = F([f]), J.DEVICE = F([c, h, d, g, m, b, v, w, y]), J.ENGINE = J.OS = F([u, p]), typeof r2 !== a2) t2.exports && (r2 = t2.exports = J), r2.UAParser = J;
          else if (typeof define === i2 && define.amd) e.r, void 0 !== J && e.v(J);
          else typeof n2 !== a2 && (n2.UAParser = J);
          var Q = typeof n2 !== a2 && (n2.jQuery || n2.Zepto);
          if (Q && !Q.ua) {
            var Y = new J();
            Q.ua = Y.getResult(), Q.ua.get = function() {
              return Y.getUA();
            }, Q.ua.set = function(e2) {
              Y.setUA(e2);
              var t3 = Y.getResult();
              for (var r3 in t3) Q.ua[r3] = t3[r3];
            };
          }
        })(this);
      } }, i = {};
      function a(e2) {
        var t2 = i[e2];
        if (void 0 !== t2) return t2.exports;
        var r2 = i[e2] = { exports: {} }, o = true;
        try {
          n[e2].call(r2.exports, r2, r2.exports, a), o = false;
        } finally {
          o && delete i[e2];
        }
        return r2.exports;
      }
      a.ab = "/ROOT/node_modules/next/dist/compiled/ua-parser-js/", t.exports = a(943);
    }, 74398, (e, t, r) => {
    }, 42738, (e) => {
      "use strict";
      let t, r, n;
      async function i() {
        return "_ENTRIES" in globalThis && _ENTRIES.middleware_instrumentation && await _ENTRIES.middleware_instrumentation;
      }
      e.i(74398);
      let a = null;
      async function o() {
        if ("phase-production-build" === process.env.NEXT_PHASE) return;
        a || (a = i());
        let e10 = await a;
        if (null == e10 ? void 0 : e10.register) try {
          await e10.register();
        } catch (e11) {
          throw e11.message = `An error occurred while loading instrumentation hook: ${e11.message}`, e11;
        }
      }
      async function s(...e10) {
        let t10 = await i();
        try {
          var r2;
          await (null == t10 || null == (r2 = t10.onRequestError) ? void 0 : r2.call(t10, ...e10));
        } catch (e11) {
          console.error("Error in instrumentation.onRequestError:", e11);
        }
      }
      let l = null;
      function c() {
        return l || (l = o()), l;
      }
      function u(e10) {
        return `The edge runtime does not support Node.js '${e10}' module.
Learn More: https://nextjs.org/docs/messages/node-module-in-edge-runtime`;
      }
      process !== e.g.process && (process.env = e.g.process.env, e.g.process = process);
      try {
        Object.defineProperty(globalThis, "__import_unsupported", { value: function(e10) {
          let t10 = new Proxy(function() {
          }, { get(t11, r2) {
            if ("then" === r2) return {};
            throw Error(u(e10));
          }, construct() {
            throw Error(u(e10));
          }, apply(r2, n2, i2) {
            if ("function" == typeof i2[0]) return i2[0](t10);
            throw Error(u(e10));
          } });
          return new Proxy({}, { get: () => t10 });
        }, enumerable: false, configurable: false });
      } catch {
      }
      c();
      class d extends Error {
        constructor({ page: e10 }) {
          super(`The middleware "${e10}" accepts an async API directly with the form:
  
  export function middleware(request, event) {
    return NextResponse.redirect('/new-location')
  }
  
  Read more: https://nextjs.org/docs/messages/middleware-new-signature
  `);
        }
      }
      class h extends Error {
        constructor() {
          super("The request.page has been deprecated in favour of `URLPattern`.\n  Read more: https://nextjs.org/docs/messages/middleware-request-page\n  ");
        }
      }
      class p extends Error {
        constructor() {
          super("The request.ua has been removed in favour of `userAgent` function.\n  Read more: https://nextjs.org/docs/messages/middleware-parse-user-agent\n  ");
        }
      }
      let f = "x-prerender-revalidate", g = "x-prerender-revalidate-if-generated", m = ".segments", v = ".segment.rsc", b = ".rsc", w = ".json", y = ".meta", x = "x-next-cache-tags", _ = "x-next-revalidated-tags", S = "_N_T_", C = { shared: "shared", reactServerComponents: "rsc", serverSideRendering: "ssr", actionBrowser: "action-browser", apiNode: "api-node", apiEdge: "api-edge", middleware: "middleware", instrument: "instrument", edgeAsset: "edge-asset", appPagesBrowser: "app-pages-browser", pagesDirBrowser: "pages-dir-browser", pagesDirEdge: "pages-dir-edge", pagesDirNode: "pages-dir-node" };
      function P(e10) {
        var t10, r2, n2, i2, a2, o2 = [], s2 = 0;
        function l2() {
          for (; s2 < e10.length && /\s/.test(e10.charAt(s2)); ) s2 += 1;
          return s2 < e10.length;
        }
        for (; s2 < e10.length; ) {
          for (t10 = s2, a2 = false; l2(); ) if ("," === (r2 = e10.charAt(s2))) {
            for (n2 = s2, s2 += 1, l2(), i2 = s2; s2 < e10.length && "=" !== (r2 = e10.charAt(s2)) && ";" !== r2 && "," !== r2; ) s2 += 1;
            s2 < e10.length && "=" === e10.charAt(s2) ? (a2 = true, s2 = i2, o2.push(e10.substring(t10, n2)), t10 = s2) : s2 = n2 + 1;
          } else s2 += 1;
          (!a2 || s2 >= e10.length) && o2.push(e10.substring(t10, e10.length));
        }
        return o2;
      }
      function T(e10) {
        let t10 = {}, r2 = [];
        if (e10) for (let [n2, i2] of e10.entries()) "set-cookie" === n2.toLowerCase() ? (r2.push(...P(i2)), t10[n2] = 1 === r2.length ? r2[0] : r2) : t10[n2] = i2;
        return t10;
      }
      function E(e10) {
        try {
          return String(new URL(String(e10)));
        } catch (t10) {
          throw Error(`URL is malformed "${String(e10)}". Please use only absolute URLs - https://nextjs.org/docs/messages/middleware-relative-urls`, { cause: t10 });
        }
      }
      ({ ...C, GROUP: { builtinReact: [C.reactServerComponents, C.actionBrowser], serverOnly: [C.reactServerComponents, C.actionBrowser, C.instrument, C.middleware], neutralTarget: [C.apiNode, C.apiEdge], clientOnly: [C.serverSideRendering, C.appPagesBrowser], bundled: [C.reactServerComponents, C.actionBrowser, C.serverSideRendering, C.appPagesBrowser, C.shared, C.instrument, C.middleware], appPages: [C.reactServerComponents, C.serverSideRendering, C.appPagesBrowser, C.actionBrowser] } });
      let R = /* @__PURE__ */ Symbol("response"), O = /* @__PURE__ */ Symbol("passThrough"), A = /* @__PURE__ */ Symbol("waitUntil");
      class N {
        constructor(e10, t10) {
          this[O] = false, this[A] = t10 ? { kind: "external", function: t10 } : { kind: "internal", promises: [] };
        }
        respondWith(e10) {
          this[R] || (this[R] = Promise.resolve(e10));
        }
        passThroughOnException() {
          this[O] = true;
        }
        waitUntil(e10) {
          if ("external" === this[A].kind) return (0, this[A].function)(e10);
          this[A].promises.push(e10);
        }
      }
      class k extends N {
        constructor(e10) {
          var t10;
          super(e10.request, null == (t10 = e10.context) ? void 0 : t10.waitUntil), this.sourcePage = e10.page;
        }
        get request() {
          throw new d({ page: this.sourcePage });
        }
        respondWith() {
          throw new d({ page: this.sourcePage });
        }
      }
      function I(e10) {
        return 47 === e10.charCodeAt(e10.length - 1) && e10.length > 1 ? e10.slice(0, -1) : e10;
      }
      function M(e10) {
        let t10 = e10.indexOf("#"), r2 = e10.indexOf("?"), n2 = r2 > -1 && (t10 < 0 || r2 < t10);
        return n2 || t10 > -1 ? { pathname: e10.substring(0, n2 ? r2 : t10), query: n2 ? e10.substring(r2, t10 > -1 ? t10 : void 0) : "", hash: t10 > -1 ? e10.slice(t10) : "" } : { pathname: e10, query: "", hash: "" };
      }
      function L(e10, t10) {
        if (!e10.startsWith("/") || !t10) return e10;
        let { pathname: r2, query: n2, hash: i2 } = M(e10);
        return `${t10}${r2}${n2}${i2}`;
      }
      function j(e10, t10) {
        if (!e10.startsWith("/") || !t10) return e10;
        let { pathname: r2, query: n2, hash: i2 } = M(e10);
        return `${r2}${t10}${n2}${i2}`;
      }
      function D(e10, t10) {
        if ("string" != typeof e10) return false;
        let { pathname: r2 } = M(e10);
        return r2 === t10 || r2.startsWith(t10 + "/");
      }
      let U = /* @__PURE__ */ new WeakMap();
      function $(e10, t10) {
        let r2;
        if (!t10) return { pathname: e10 };
        let n2 = U.get(t10);
        n2 || (n2 = t10.map((e11) => e11.toLowerCase()), U.set(t10, n2));
        let i2 = e10.split("/", 2);
        if (!i2[1]) return { pathname: e10 };
        let a2 = i2[1].toLowerCase(), o2 = n2.indexOf(a2);
        return o2 < 0 ? { pathname: e10 } : (r2 = t10[o2], { pathname: e10 = e10.slice(r2.length + 1) || "/", detectedLocale: r2 });
      }
      let q = /^(?:127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}|\[::1\]|localhost)$/;
      function B(e10, t10) {
        let r2 = new URL(String(e10), t10 && String(t10));
        return q.test(r2.hostname) && (r2.hostname = "localhost"), r2;
      }
      let F = /* @__PURE__ */ Symbol("NextURLInternal");
      class H {
        constructor(e10, t10, r2) {
          let n2, i2;
          "object" == typeof t10 && "pathname" in t10 || "string" == typeof t10 ? (n2 = t10, i2 = r2 || {}) : i2 = r2 || t10 || {}, this[F] = { url: B(e10, n2 ?? i2.base), options: i2, basePath: "" }, this.analyze();
        }
        analyze() {
          var e10, t10, r2, n2, i2;
          let a2 = (function(e11, t11) {
            let { basePath: r3, i18n: n3, trailingSlash: i3 } = t11.nextConfig ?? {}, a3 = { pathname: e11, trailingSlash: "/" !== e11 ? e11.endsWith("/") : i3 };
            r3 && D(a3.pathname, r3) && (a3.pathname = (function(e12, t12) {
              if (!D(e12, t12)) return e12;
              let r4 = e12.slice(t12.length);
              return r4.startsWith("/") ? r4 : `/${r4}`;
            })(a3.pathname, r3), a3.basePath = r3);
            let o3 = a3.pathname;
            if (a3.pathname.startsWith("/_next/data/") && a3.pathname.endsWith(".json")) {
              let e12 = a3.pathname.replace(/^\/_next\/data\//, "").replace(/\.json$/, "").split("/");
              a3.buildId = e12[0], o3 = "index" !== e12[1] ? `/${e12.slice(1).join("/")}` : "/", true === t11.parseData && (a3.pathname = o3);
            }
            if (n3) {
              let e12 = t11.i18nProvider ? t11.i18nProvider.analyze(a3.pathname) : $(a3.pathname, n3.locales);
              a3.locale = e12.detectedLocale, a3.pathname = e12.pathname ?? a3.pathname, !e12.detectedLocale && a3.buildId && (e12 = t11.i18nProvider ? t11.i18nProvider.analyze(o3) : $(o3, n3.locales)).detectedLocale && (a3.locale = e12.detectedLocale);
            }
            return a3;
          })(this[F].url.pathname, { nextConfig: this[F].options.nextConfig, parseData: true, i18nProvider: this[F].options.i18nProvider }), o2 = (function(e11, t11) {
            let r3;
            if (t11?.host && !Array.isArray(t11.host)) r3 = t11.host.toString().split(":", 1)[0];
            else {
              if (!e11.hostname) return;
              r3 = e11.hostname;
            }
            return r3.toLowerCase();
          })(this[F].url, this[F].options.headers);
          this[F].domainLocale = this[F].options.i18nProvider ? this[F].options.i18nProvider.detectDomainLocale(o2) : (function(e11, t11, r3) {
            if (e11) {
              for (let n3 of (r3 && (r3 = r3.toLowerCase()), e11)) if (t11 === n3.domain?.split(":", 1)[0].toLowerCase() || r3 === n3.defaultLocale.toLowerCase() || n3.locales?.some((e12) => e12.toLowerCase() === r3)) return n3;
            }
          })(null == (t10 = this[F].options.nextConfig) || null == (e10 = t10.i18n) ? void 0 : e10.domains, o2);
          let s2 = (null == (r2 = this[F].domainLocale) ? void 0 : r2.defaultLocale) || (null == (i2 = this[F].options.nextConfig) || null == (n2 = i2.i18n) ? void 0 : n2.defaultLocale);
          this[F].url.pathname = a2.pathname, this[F].defaultLocale = s2, this[F].basePath = a2.basePath ?? "", this[F].buildId = a2.buildId, this[F].locale = a2.locale ?? s2, this[F].trailingSlash = a2.trailingSlash;
        }
        formatPathname() {
          var e10;
          let t10;
          return t10 = (function(e11, t11, r2, n2) {
            if (!t11 || t11 === r2) return e11;
            let i2 = e11.toLowerCase();
            return !n2 && (D(i2, "/api") || D(i2, `/${t11.toLowerCase()}`)) ? e11 : L(e11, `/${t11}`);
          })((e10 = { basePath: this[F].basePath, buildId: this[F].buildId, defaultLocale: this[F].options.forceLocale ? void 0 : this[F].defaultLocale, locale: this[F].locale, pathname: this[F].url.pathname, trailingSlash: this[F].trailingSlash }).pathname, e10.locale, e10.buildId ? void 0 : e10.defaultLocale, e10.ignorePrefix), (e10.buildId || !e10.trailingSlash) && (t10 = I(t10)), e10.buildId && (t10 = j(L(t10, `/_next/data/${e10.buildId}`), "/" === e10.pathname ? "index.json" : ".json")), t10 = L(t10, e10.basePath), !e10.buildId && e10.trailingSlash ? t10.endsWith("/") ? t10 : j(t10, "/") : I(t10);
        }
        formatSearch() {
          return this[F].url.search;
        }
        get buildId() {
          return this[F].buildId;
        }
        set buildId(e10) {
          this[F].buildId = e10;
        }
        get locale() {
          return this[F].locale ?? "";
        }
        set locale(e10) {
          var t10, r2;
          if (!this[F].locale || !(null == (r2 = this[F].options.nextConfig) || null == (t10 = r2.i18n) ? void 0 : t10.locales.includes(e10))) throw TypeError(`The NextURL configuration includes no locale "${e10}"`);
          this[F].locale = e10;
        }
        get defaultLocale() {
          return this[F].defaultLocale;
        }
        get domainLocale() {
          return this[F].domainLocale;
        }
        get searchParams() {
          return this[F].url.searchParams;
        }
        get host() {
          return this[F].url.host;
        }
        set host(e10) {
          this[F].url.host = e10;
        }
        get hostname() {
          return this[F].url.hostname;
        }
        set hostname(e10) {
          this[F].url.hostname = e10;
        }
        get port() {
          return this[F].url.port;
        }
        set port(e10) {
          this[F].url.port = e10;
        }
        get protocol() {
          return this[F].url.protocol;
        }
        set protocol(e10) {
          this[F].url.protocol = e10;
        }
        get href() {
          let e10 = this.formatPathname(), t10 = this.formatSearch();
          return `${this.protocol}//${this.host}${e10}${t10}${this.hash}`;
        }
        set href(e10) {
          this[F].url = B(e10), this.analyze();
        }
        get origin() {
          return this[F].url.origin;
        }
        get pathname() {
          return this[F].url.pathname;
        }
        set pathname(e10) {
          this[F].url.pathname = e10;
        }
        get hash() {
          return this[F].url.hash;
        }
        set hash(e10) {
          this[F].url.hash = e10;
        }
        get search() {
          return this[F].url.search;
        }
        set search(e10) {
          this[F].url.search = e10;
        }
        get password() {
          return this[F].url.password;
        }
        set password(e10) {
          this[F].url.password = e10;
        }
        get username() {
          return this[F].url.username;
        }
        set username(e10) {
          this[F].url.username = e10;
        }
        get basePath() {
          return this[F].basePath;
        }
        set basePath(e10) {
          this[F].basePath = e10.startsWith("/") ? e10 : `/${e10}`;
        }
        toString() {
          return this.href;
        }
        toJSON() {
          return this.href;
        }
        [/* @__PURE__ */ Symbol.for("edge-runtime.inspect.custom")]() {
          return { href: this.href, origin: this.origin, protocol: this.protocol, username: this.username, password: this.password, host: this.host, hostname: this.hostname, port: this.port, pathname: this.pathname, search: this.search, searchParams: this.searchParams, hash: this.hash };
        }
        clone() {
          return new H(String(this), this[F].options);
        }
      }
      var G, V, z, W, X, K, J, Q, Y, Z, ee, et, er, en, ei, ea, eo, es, el, ec, eu, ed, eh = e.i(28042);
      let ep = /* @__PURE__ */ Symbol("internal request");
      class ef extends Request {
        constructor(e10, t10 = {}) {
          let r2 = "string" != typeof e10 && "url" in e10 ? e10.url : String(e10);
          E(r2), e10 instanceof Request ? super(e10, t10) : super(r2, t10);
          let n2 = new H(r2, { headers: T(this.headers), nextConfig: t10.nextConfig });
          this[ep] = { cookies: new eh.RequestCookies(this.headers), nextUrl: n2, url: n2.toString() };
        }
        [/* @__PURE__ */ Symbol.for("edge-runtime.inspect.custom")]() {
          return { cookies: this.cookies, nextUrl: this.nextUrl, url: this.url, bodyUsed: this.bodyUsed, cache: this.cache, credentials: this.credentials, destination: this.destination, headers: Object.fromEntries(this.headers), integrity: this.integrity, keepalive: this.keepalive, method: this.method, mode: this.mode, redirect: this.redirect, referrer: this.referrer, referrerPolicy: this.referrerPolicy, signal: this.signal };
        }
        get cookies() {
          return this[ep].cookies;
        }
        get nextUrl() {
          return this[ep].nextUrl;
        }
        get page() {
          throw new h();
        }
        get ua() {
          throw new p();
        }
        get url() {
          return this[ep].url;
        }
      }
      class eg {
        static get(e10, t10, r2) {
          let n2 = Reflect.get(e10, t10, r2);
          return "function" == typeof n2 ? n2.bind(e10) : n2;
        }
        static set(e10, t10, r2, n2) {
          return Reflect.set(e10, t10, r2, n2);
        }
        static has(e10, t10) {
          return Reflect.has(e10, t10);
        }
        static deleteProperty(e10, t10) {
          return Reflect.deleteProperty(e10, t10);
        }
      }
      let em = /* @__PURE__ */ Symbol("internal response"), ev = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
      function eb(e10, t10) {
        var r2;
        if (null == e10 || null == (r2 = e10.request) ? void 0 : r2.headers) {
          if (!(e10.request.headers instanceof Headers)) throw Error("request.headers must be an instance of Headers");
          let r3 = [];
          for (let [n2, i2] of e10.request.headers) t10.set("x-middleware-request-" + n2, i2), r3.push(n2);
          t10.set("x-middleware-override-headers", r3.join(","));
        }
      }
      class ew extends Response {
        constructor(e10, t10 = {}) {
          super(e10, t10);
          let r2 = this.headers, n2 = new Proxy(new eh.ResponseCookies(r2), { get(e11, n3, i2) {
            switch (n3) {
              case "delete":
              case "set":
                return (...i3) => {
                  let a2 = Reflect.apply(e11[n3], e11, i3), o2 = new Headers(r2);
                  return a2 instanceof eh.ResponseCookies && r2.set("x-middleware-set-cookie", a2.getAll().map((e12) => (0, eh.stringifyCookie)(e12)).join(",")), eb(t10, o2), a2;
                };
              default:
                return eg.get(e11, n3, i2);
            }
          } });
          this[em] = { cookies: n2, url: t10.url ? new H(t10.url, { headers: T(r2), nextConfig: t10.nextConfig }) : void 0 };
        }
        [/* @__PURE__ */ Symbol.for("edge-runtime.inspect.custom")]() {
          return { cookies: this.cookies, url: this.url, body: this.body, bodyUsed: this.bodyUsed, headers: Object.fromEntries(this.headers), ok: this.ok, redirected: this.redirected, status: this.status, statusText: this.statusText, type: this.type };
        }
        get cookies() {
          return this[em].cookies;
        }
        static json(e10, t10) {
          let r2 = Response.json(e10, t10);
          return new ew(r2.body, r2);
        }
        static redirect(e10, t10) {
          let r2 = "number" == typeof t10 ? t10 : (null == t10 ? void 0 : t10.status) ?? 307;
          if (!ev.has(r2)) throw RangeError('Failed to execute "redirect" on "response": Invalid status code');
          let n2 = "object" == typeof t10 ? t10 : {}, i2 = new Headers(null == n2 ? void 0 : n2.headers);
          return i2.set("Location", E(e10)), new ew(null, { ...n2, headers: i2, status: r2 });
        }
        static rewrite(e10, t10) {
          let r2 = new Headers(null == t10 ? void 0 : t10.headers);
          return r2.set("x-middleware-rewrite", E(e10)), eb(t10, r2), new ew(null, { ...t10, headers: r2 });
        }
        static next(e10) {
          let t10 = new Headers(null == e10 ? void 0 : e10.headers);
          return t10.set("x-middleware-next", "1"), eb(e10, t10), new ew(null, { ...e10, headers: t10 });
        }
      }
      function ey(e10, t10) {
        let r2 = "string" == typeof t10 ? new URL(t10) : t10, n2 = new URL(e10, t10), i2 = n2.origin === r2.origin;
        return { url: i2 ? n2.toString().slice(r2.origin.length) : n2.toString(), isRelative: i2 };
      }
      let ex = "next-router-prefetch", e_ = ["rsc", "next-router-state-tree", ex, "next-hmr-refresh", "next-router-segment-prefetch"], eS = "_rsc";
      function eC(e10) {
        return e10.startsWith("/") ? e10 : `/${e10}`;
      }
      function eP(e10) {
        return eC(e10.split("/").reduce((e11, t10, r2, n2) => t10 ? "(" === t10[0] && t10.endsWith(")") || "@" === t10[0] || ("page" === t10 || "route" === t10) && r2 === n2.length - 1 ? e11 : `${e11}/${t10}` : e11, ""));
      }
      class eT extends Error {
        constructor() {
          super("Headers cannot be modified. Read more: https://nextjs.org/docs/app/api-reference/functions/headers");
        }
        static callable() {
          throw new eT();
        }
      }
      class eE extends Headers {
        constructor(e10) {
          super(), this.headers = new Proxy(e10, { get(t10, r2, n2) {
            if ("symbol" == typeof r2) return eg.get(t10, r2, n2);
            let i2 = r2.toLowerCase(), a2 = Object.keys(e10).find((e11) => e11.toLowerCase() === i2);
            if (void 0 !== a2) return eg.get(t10, a2, n2);
          }, set(t10, r2, n2, i2) {
            if ("symbol" == typeof r2) return eg.set(t10, r2, n2, i2);
            let a2 = r2.toLowerCase(), o2 = Object.keys(e10).find((e11) => e11.toLowerCase() === a2);
            return eg.set(t10, o2 ?? r2, n2, i2);
          }, has(t10, r2) {
            if ("symbol" == typeof r2) return eg.has(t10, r2);
            let n2 = r2.toLowerCase(), i2 = Object.keys(e10).find((e11) => e11.toLowerCase() === n2);
            return void 0 !== i2 && eg.has(t10, i2);
          }, deleteProperty(t10, r2) {
            if ("symbol" == typeof r2) return eg.deleteProperty(t10, r2);
            let n2 = r2.toLowerCase(), i2 = Object.keys(e10).find((e11) => e11.toLowerCase() === n2);
            return void 0 === i2 || eg.deleteProperty(t10, i2);
          } });
        }
        static seal(e10, t10) {
          let r2, n2 = t10 && t10.size > 0 ? (e11) => t10.has(e11.toLowerCase()) : null, i2 = new Proxy(e10, { get(e11, t11, n3) {
            switch (t11) {
              case "append":
              case "delete":
              case "set":
                return eT.callable;
              case Symbol.iterator:
                return r2[Symbol.iterator];
              case "get":
              case "has":
              case "getSetCookie":
              case "keys":
              case "values":
              case "entries":
              case "forEach":
                return r2[t11];
              default:
                return eg.get(e11, t11, n3);
            }
          } });
          return r2 = n2 ? /* @__PURE__ */ (function(e11, t11, r3) {
            function* n3() {
              for (let t12 of e11.entries()) r3(t12[0]) || (yield t12);
            }
            return { entries: n3, [Symbol.iterator]: n3, get: (t12) => r3(t12) ? null : e11.get(t12), has: (t12) => !r3(t12) && e11.has(t12), getSetCookie: () => r3("set-cookie") ? [] : e11.getSetCookie(), *keys() {
              for (let t12 of e11.keys()) r3(t12) || (yield t12);
            }, *values() {
              for (let [, e12] of n3()) yield e12;
            }, forEach(e12, r4) {
              for (let [i3, a2] of n3()) e12.call(r4, a2, i3, t11);
            } };
          })(e10, i2, n2) : { get: e10.get.bind(e10), has: e10.has.bind(e10), getSetCookie: e10.getSetCookie.bind(e10), keys: e10.keys.bind(e10), values: e10.values.bind(e10), entries: e10.entries.bind(e10), [Symbol.iterator]: e10[Symbol.iterator].bind(e10), forEach(t11, r3) {
            for (let [n3, a2] of e10.entries()) t11.call(r3, a2, n3, i2);
          } }, i2;
        }
        static fresh(e10) {
          return new Proxy(e10, { get: (e11, t10, r2) => eg.get(e11, t10, r2) });
        }
        merge(e10) {
          return Array.isArray(e10) ? e10.join(", ") : e10;
        }
        static from(e10) {
          return e10 instanceof Headers ? e10 : new eE(e10);
        }
        append(e10, t10) {
          let r2 = this.headers[e10];
          "string" == typeof r2 ? this.headers[e10] = [r2, t10] : Array.isArray(r2) ? r2.push(t10) : this.headers[e10] = t10;
        }
        delete(e10) {
          delete this.headers[e10];
        }
        get(e10) {
          let t10 = this.headers[e10];
          return void 0 !== t10 ? this.merge(t10) : null;
        }
        has(e10) {
          return void 0 !== this.headers[e10];
        }
        set(e10, t10) {
          this.headers[e10] = t10;
        }
        forEach(e10, t10) {
          for (let [r2, n2] of this.entries()) e10.call(t10, n2, r2, this);
        }
        *entries() {
          for (let e10 of Object.keys(this.headers)) {
            let t10 = e10.toLowerCase(), r2 = this.get(t10);
            yield [t10, r2];
          }
        }
        *keys() {
          for (let e10 of Object.keys(this.headers)) {
            let t10 = e10.toLowerCase();
            yield t10;
          }
        }
        *values() {
          for (let e10 of Object.keys(this.headers)) {
            let t10 = this.get(e10);
            yield t10;
          }
        }
        [Symbol.iterator]() {
          return this.entries();
        }
      }
      let eR = Error("Invariant: AsyncLocalStorage accessed in runtime where it is not available");
      class eO {
        disable() {
          throw eR;
        }
        getStore() {
        }
        run() {
          throw eR;
        }
        exit() {
          throw eR;
        }
        enterWith() {
          throw eR;
        }
        static bind(e10) {
          return e10;
        }
      }
      let eA = "u" > typeof globalThis && globalThis.AsyncLocalStorage;
      function eN(e10) {
        let t10 = /* @__PURE__ */ Symbol.for(`@next/${e10}@16.4.5`), r2 = globalThis;
        return r2[t10] ??= eA ? new eA() : new eO();
      }
      let ek = eN("work-async-storage");
      class eI extends Error {
        constructor() {
          super("Cookies can only be modified in a Server Action or Route Handler. Read more: https://nextjs.org/docs/app/api-reference/functions/cookies#options");
        }
        static callable() {
          throw new eI();
        }
      }
      class eM {
        static seal(e10) {
          return new Proxy(e10, { get(e11, t10, r2) {
            switch (t10) {
              case "clear":
              case "delete":
              case "set":
                return eI.callable;
              default:
                return eg.get(e11, t10, r2);
            }
          } });
        }
        static fresh(e10) {
          return new Proxy(e10, { get: (e11, t10, r2) => eg.get(e11, t10, r2) });
        }
      }
      let eL = /* @__PURE__ */ Symbol.for("next.mutated.cookies");
      class ej {
        static wrap(e10, t10) {
          let r2 = new eh.ResponseCookies(new Headers());
          for (let t11 of e10.getAll()) r2.set(t11);
          let n2 = [], i2 = /* @__PURE__ */ new Set(), a2 = () => {
            let e11 = ek.getStore();
            if (e11 && (e11.pathWasRevalidated = 1), n2 = r2.getAll().filter((e12) => i2.has(e12.name)), t10) {
              let e12 = [];
              for (let t11 of n2) {
                let r3 = new eh.ResponseCookies(new Headers());
                r3.set(t11), e12.push(r3.toString());
              }
              t10(e12);
            }
          }, o2 = new Proxy(r2, { get(e11, t11, r3) {
            switch (t11) {
              case eL:
                return n2;
              case "delete":
                return function(...t12) {
                  i2.add("string" == typeof t12[0] ? t12[0] : t12[0].name);
                  try {
                    return e11.delete(...t12), o2;
                  } finally {
                    a2();
                  }
                };
              case "set":
                return function(...t12) {
                  i2.add("string" == typeof t12[0] ? t12[0] : t12[0].name);
                  try {
                    return e11.set(...t12), o2;
                  } finally {
                    a2();
                  }
                };
              default:
                return eg.get(e11, t11, r3);
            }
          } });
          return o2;
        }
      }
      function eD(e10, t10) {
        if ("action" !== e10.phase) throw new eI();
      }
      var eU = ((G = eU || {}).handleRequest = "BaseServer.handleRequest", G.run = "BaseServer.run", G.pipe = "BaseServer.pipe", G.getStaticHTML = "BaseServer.getStaticHTML", G.render = "BaseServer.render", G.renderToResponseWithComponents = "BaseServer.renderToResponseWithComponents", G.renderToResponse = "BaseServer.renderToResponse", G.renderToHTML = "BaseServer.renderToHTML", G.renderError = "BaseServer.renderError", G.renderErrorToResponse = "BaseServer.renderErrorToResponse", G.renderErrorToHTML = "BaseServer.renderErrorToHTML", G.render404 = "BaseServer.render404", G), e$ = ((V = e$ || {}).loadDefaultErrorComponents = "LoadComponents.loadDefaultErrorComponents", V.loadComponents = "LoadComponents.loadComponents", V.loadRouteModule = "LoadComponents.loadRouteModule", V), eq = ((z = eq || {}).loadModule = "Instrumentation.loadModule", z.register = "Instrumentation.register", z), eB = ((W = eB || {}).getRequestHandler = "NextServer.getRequestHandler", W.getRequestHandlerWithMetadata = "NextServer.getRequestHandlerWithMetadata", W.getServer = "NextServer.getServer", W.getServerRequestHandler = "NextServer.getServerRequestHandler", W.createServer = "createServer.createServer", W), eF = ((X = eF || {}).compression = "NextNodeServer.compression", X.getBuildId = "NextNodeServer.getBuildId", X.createComponentTree = "NextNodeServer.createComponentTree", X.clientComponentLoading = "NextNodeServer.clientComponentLoading", X.getLayoutOrPageModule = "NextNodeServer.getLayoutOrPageModule", X.generateStaticRoutes = "NextNodeServer.generateStaticRoutes", X.generateFsStaticRoutes = "NextNodeServer.generateFsStaticRoutes", X.generatePublicRoutes = "NextNodeServer.generatePublicRoutes", X.generateImageRoutes = "NextNodeServer.generateImageRoutes.route", X.sendRenderResult = "NextNodeServer.sendRenderResult", X.proxyRequest = "NextNodeServer.proxyRequest", X.runApi = "NextNodeServer.runApi", X.render = "NextNodeServer.render", X.renderHTML = "NextNodeServer.renderHTML", X.imageOptimizer = "NextNodeServer.imageOptimizer", X.getPagePath = "NextNodeServer.getPagePath", X.getRoutesManifest = "NextNodeServer.getRoutesManifest", X.findPageComponents = "NextNodeServer.findPageComponents", X.getFontManifest = "NextNodeServer.getFontManifest", X.getServerComponentManifest = "NextNodeServer.getServerComponentManifest", X.getRequestHandler = "NextNodeServer.getRequestHandler", X.renderToHTML = "NextNodeServer.renderToHTML", X.renderError = "NextNodeServer.renderError", X.renderErrorToHTML = "NextNodeServer.renderErrorToHTML", X.render404 = "NextNodeServer.render404", X.startResponse = "NextNodeServer.startResponse", X.route = "route", X.onProxyReq = "onProxyReq", X.apiResolver = "apiResolver", X.internalFetch = "internalFetch", X), eH = ((K = eH || {}).startServer = "startServer.startServer", K), eG = ((J = eG || {}).getServerSideProps = "Render.getServerSideProps", J.getStaticProps = "Render.getStaticProps", J.renderToString = "Render.renderToString", J.renderDocument = "Render.renderDocument", J.createBodyResult = "Render.createBodyResult", J), eV = ((Q = eV || {}).renderToString = "AppRender.renderToString", Q.renderToReadableStream = "AppRender.renderToReadableStream", Q.getBodyResult = "AppRender.getBodyResult", Q.fetch = "AppRender.fetch", Q.waitShellReady = "AppRender.waitShellReady", Q.renderToNodeFizzStream = "AppRender.renderToNodeFizzStream", Q.instantInsights = "AppRender.instantInsights", Q.instantInsightsPrepareValidation = "AppRender.instantInsights.prepareValidation", Q.instantInsightsRunValidation = "AppRender.instantInsights.runValidation", Q), ez = ((Y = ez || {}).ensurePage = "DevBundlerService.ensurePage", Y), eW = ((Z = eW || {}).executeRoute = "Router.executeRoute", Z), eX = ((ee = eX || {}).runHandler = "Node.runHandler", ee), eK = ((et = eK || {}).runHandler = "AppRouteRouteHandlers.runHandler", et), eJ = ((er = eJ || {}).loadUserland = "AppRouteRouteModule.loadUserland", er), eQ = ((en = eQ || {}).prepare = "RouteModule.prepare", en.loadManifests = "RouteModule.loadManifests", en), eY = ((ei = eY || {}).generateMetadata = "ResolveMetadata.generateMetadata", ei.generateViewport = "ResolveMetadata.generateViewport", ei), eZ = ((ea = eZ || {}).execute = "Middleware.execute", ea), e0 = ((eo = e0 || {}).request = "Next.request", eo);
      let e1 = /* @__PURE__ */ new Set(["Middleware.execute", "Next.request", "BaseServer.handleRequest", "Render.getServerSideProps", "Render.getStaticProps", "AppRender.fetch", "AppRender.getBodyResult", "LoadComponents.loadRouteModule", "Render.renderDocument", "Node.runHandler", "AppRouteRouteHandlers.runHandler", "AppRouteRouteModule.loadUserland", "RouteModule.prepare", "Instrumentation.loadModule", "Instrumentation.register", "ResolveMetadata.generateMetadata", "ResolveMetadata.generateViewport", "NextNodeServer.createComponentTree", "NextNodeServer.findPageComponents", "NextNodeServer.getLayoutOrPageModule", "NextNodeServer.startResponse", "NextNodeServer.clientComponentLoading"]), e2 = /* @__PURE__ */ new Set(["NextNodeServer.findPageComponents", "NextNodeServer.createComponentTree", "NextNodeServer.clientComponentLoading"]);
      function e4(e10) {
        return null !== e10 && "object" == typeof e10 && "then" in e10 && "function" == typeof e10.then;
      }
      let e3 = process.env.NEXT_OTEL_PERFORMANCE_PREFIX;
      function e6() {
      }
      /* @__PURE__ */ Symbol.for("@next/local-span-recorder");
      let { context: e5, propagation: e8, trace: e7, SpanStatusCode: e9, SpanKind: te, ROOT_CONTEXT: tt } = t = e.r(59110);
      class tr extends Error {
        constructor(e10, t10) {
          super(), this.bubble = e10, this.result = t10;
        }
      }
      let tn = (e10, t10, r2) => {
        "object" == typeof t10 && null !== t10 && t10 instanceof tr && t10.bubble ? e10.setAttribute("next.bubble", true) : (t10 && (e10.recordException(t10), e10.setAttribute("error.type", t10.name)), e10.setStatus({ code: e9.ERROR, message: null == t10 ? void 0 : t10.message })), e10.end(r2);
      }, ti = /* @__PURE__ */ new Map(), ta = t.createContextKey("next.rootSpanId"), to = 0, ts = { set(e10, t10, r2) {
        e10.push({ key: t10, value: r2 });
      } }, tl = (n = new class e {
        getTracerInstance() {
          return e7.getTracer("next.js", "16.4.5");
        }
        isOpenTelemetryEnabled() {
          var e10, t10;
          let r2 = e7.getSpan(e5.active());
          if (null == r2 ? void 0 : r2.isRecording()) return true;
          let n2 = e7.getTracerProvider();
          return !("getDelegate" in n2) || (null == n2.getDelegate || null == (t10 = n2.getDelegate.call(n2)) || null == (e10 = t10.constructor) ? void 0 : e10.name) !== "NoopTracerProvider";
        }
        getContext() {
          return e5;
        }
        getTracePropagationData() {
          let e10 = e5.active(), t10 = [];
          return e8.inject(e10, t10, ts), t10;
        }
        getTraceContextHeaders() {
          let e10 = e5.active();
          if (!e7.getSpanContext(e10) || !this.isOpenTelemetryEnabled()) return;
          let t10 = {};
          e8.inject(e10, t10);
          let { traceparent: r2, tracestate: n2 } = t10;
          if (r2) return { traceparent: r2, tracestate: n2 };
        }
        hasActiveSpanContext() {
          let e10 = e7.getSpanContext(e5.active());
          return !!(e10 && e7.isSpanContextValid(e10));
        }
        getActiveScopeSpan() {
          let e10 = e6(), t10 = null == e10 ? void 0 : e10.getActiveLocalSpan();
          return t10 && (null == e10 ? void 0 : e10.isOpenTelemetryIsolatedSpan(t10)) ? t10 : e7.getSpan(e5.active());
        }
        withPropagatedContext(e10, t10, r2, n2 = false) {
          let i2 = e5.active();
          if (!e3 && !this.isOpenTelemetryEnabled() && !e7.getSpanContext(i2)) return t10();
          if (n2) {
            let n3 = e8.extract(tt, e10, r2);
            if (e7.getSpanContext(n3)) return e5.with(n3, t10);
            let a3 = e8.extract(i2, e10, r2);
            return e5.with(a3, t10);
          }
          if (e7.getSpanContext(i2)) return t10();
          let a2 = e8.extract(i2, e10, r2);
          return e5.with(a2, t10);
        }
        trace(...e10) {
          let [t10, r2, n2] = e10, i2 = !!e3 || this.isOpenTelemetryEnabled(), a2 = e6(), o2 = (null == a2 ? void 0 : a2.isLocalSpanRecordingEnabled()) ?? false;
          if (!i2 && !o2) return "function" == typeof r2 ? r2() : n2();
          let { fn: s2, options: l2 } = "function" == typeof r2 ? { fn: r2, options: {} } : { fn: n2, options: { ...r2 } }, c2 = l2.spanName ?? t10, u2 = l2.parentSpan ?? this.getActiveScopeSpan(), d2 = u2 && (null == a2 ? void 0 : a2.isOpenTelemetryIsolatedSpan(u2)) ? u2 : void 0, h2 = !d2 && (e1.has(t10) || "1" === process.env.NEXT_OTEL_VERBOSE);
          if (!(h2 || (null == a2 ? void 0 : a2.isRequestInsightsEnabled())) || l2.hideSpan) return s2();
          let p2 = d2 ? e5.active() : this.getSpanContext(u2);
          p2 || (p2 = (null == e5 ? void 0 : e5.active()) ?? tt);
          let f2 = p2.getValue(ta), g2 = "number" != typeof f2 || !ti.has(f2), m2 = to++;
          return l2.attributes = { "next.span_category": "nextjs", "next.span_name": c2, "next.span_type": t10, ...l2.attributes }, e5.with(p2.setValue(ta, m2), () => this.runWithActiveSpan(c2, l2, p2, i2 && h2, o2, d2, (e11) => {
            let r3;
            e3 && t10 && e2.has(t10) && (r3 = "performance" in globalThis && "measure" in performance ? globalThis.performance.now() : void 0);
            let n3 = false, i3 = () => {
              !n3 && (n3 = true, ti.delete(m2), r3 && performance.measure(`${e3}:next-${(t10.split(".").pop() || "").replace(/[A-Z]/g, (e12) => "-" + e12.toLowerCase())}`, { start: r3, end: performance.now() }));
            };
            if (g2 && ti.set(m2, new Map(Object.entries(l2.attributes ?? {}))), s2.length > 1) try {
              return s2(e11, (t11) => {
                t11 ? tn(e11, t11, l2.endTime) : e11.end(l2.endTime);
              });
            } catch (t11) {
              throw tn(e11, t11, l2.endTime), t11;
            } finally {
              i3();
            }
            try {
              let t11 = s2(e11);
              if (e4(t11)) return t11.then((t12) => (e11.end(l2.endTime), t12)).catch((t12) => {
                throw tn(e11, t12, l2.endTime), t12;
              }).finally(i3);
              return e11.end(l2.endTime), i3(), t11;
            } catch (t11) {
              throw tn(e11, t11, l2.endTime), i3(), t11;
            }
          }));
        }
        runWithActiveSpan(e10, t10, r2, n2, i2, a2, o2) {
          if (n2) return this.getTracerInstance().startActiveSpan(e10, t10, (n3) => o2(i2 ? this.createLocalRecordingSpan(e10, t10, r2, n3, a2) : n3));
          let s2 = this.createLocalRecordingSpan(e10, t10, r2, void 0, a2), l2 = e6();
          return l2.withLocalSpan(s2, () => l2.isOpenTelemetryIsolatedSpan(s2) ? o2(s2) : e5.with(e7.setSpan(e5.active(), s2), o2, void 0, s2));
        }
        createLocalRecordingSpan(e10, t10, r2, n2, i2) {
          let a2 = (null == i2 ? void 0 : i2.spanContext()) ?? e7.getSpanContext(r2), o2 = null == n2 ? void 0 : n2.spanContext();
          return e6().createLocalSpan({ name: e10, attributes: t10.attributes, links: t10.links, startTime: t10.startTime, delegateSpan: n2, traceId: (null == o2 ? void 0 : o2.traceId) ?? (null == a2 ? void 0 : a2.traceId), spanId: null == o2 ? void 0 : o2.spanId, parentSpanId: null == a2 ? void 0 : a2.spanId, isolateOpenTelemetry: void 0 !== i2 });
        }
        wrap(...e10) {
          let t10 = this, [r2, n2, i2] = 3 === e10.length ? e10 : [e10[0], {}, e10[1]];
          return e1.has(r2) || "1" === process.env.NEXT_OTEL_VERBOSE ? function() {
            let e11 = n2;
            "function" == typeof e11 && "function" == typeof i2 && (e11 = e11.apply(this, arguments));
            let a2 = arguments.length - 1, o2 = arguments[a2];
            if ("function" != typeof o2) return t10.trace(r2, e11, () => i2.apply(this, arguments));
            {
              let n3 = t10.getContext().bind(e5.active(), o2);
              return t10.trace(r2, e11, (e12, t11) => (arguments[a2] = function(e13) {
                return null == t11 || t11(e13), n3.apply(this, arguments);
              }, i2.apply(this, arguments)));
            }
          } : i2;
        }
        startSpan(...e10) {
          let [t10, r2] = e10, n2 = r2 ? { ...r2, attributes: { "next.span_category": "nextjs", ...r2.attributes } } : { attributes: { "next.span_category": "nextjs" } }, i2 = e6(), a2 = n2.parentSpan ?? this.getActiveScopeSpan(), o2 = a2 && (null == i2 ? void 0 : i2.isOpenTelemetryIsolatedSpan(a2)) ? a2 : void 0, s2 = (o2 ? void 0 : this.getSpanContext(a2)) ?? e5.active();
          if (!(null == i2 ? void 0 : i2.isLocalSpanRecordingEnabled())) return this.getTracerInstance().startSpan(t10, n2, s2);
          let l2 = !o2 && this.isOpenTelemetryEnabled() ? this.getTracerInstance().startSpan(t10, n2, s2) : void 0;
          return this.createLocalRecordingSpan(t10, n2, s2, l2, o2);
        }
        getSpanContext(e10) {
          return e10 ? e7.setSpan(e5.active(), e10) : void 0;
        }
        getRootSpanAttributes() {
          let e10 = e5.active().getValue(ta);
          return ti.get(e10);
        }
        setRootSpanAttribute(e10, t10) {
          let r2 = e5.active().getValue(ta), n2 = ti.get(r2);
          n2 && !n2.has(e10) && n2.set(e10, t10);
        }
        withSpan(e10, t10) {
          let r2 = e6();
          return (null == r2 ? void 0 : r2.isLocalRecordingSpan(e10)) ? r2.withLocalSpan(e10, () => r2.isOpenTelemetryIsolatedSpan(e10) ? t10() : e5.with(e7.setSpan(e5.active(), e10), t10)) : e5.with(e7.setSpan(e5.active(), e10), t10);
        }
      }(), () => n), tc = "__prerender_bypass";
      /* @__PURE__ */ Symbol("__next_preview_data"), Symbol(tc);
      class tu {
        constructor(e10, t10, r2, n2) {
          var i2;
          let a2 = e10 && (function(e11, t11) {
            if ("function" == typeof e11.get) {
              let r3 = eE.from(e11);
              return { isOnDemandRevalidate: r3.get(f) === t11.previewModeId, revalidateOnlyGenerated: r3.has(g) };
            }
            return { isOnDemandRevalidate: e11[f] === t11.previewModeId, revalidateOnlyGenerated: e11.hasOwnProperty(g) };
          })(t10, e10).isOnDemandRevalidate, o2 = null == (i2 = r2.get(tc)) ? void 0 : i2.value;
          this._isEnabled = !!(!a2 && o2 && e10 && o2 === e10.previewModeId), this._previewModeId = null == e10 ? void 0 : e10.previewModeId, this._mutableCookies = n2;
        }
        get isEnabled() {
          return this._isEnabled;
        }
        enable() {
          if (!this._previewModeId) throw Error("Invariant: previewProps missing previewModeId this should never happen");
          this._mutableCookies.set({ name: tc, value: this._previewModeId, httpOnly: true, sameSite: "none", secure: true, path: "/" }), this._isEnabled = true;
        }
        disable() {
          this._mutableCookies.set({ name: tc, value: "", httpOnly: true, sameSite: "none", secure: true, path: "/", expires: /* @__PURE__ */ new Date(0) }), this._isEnabled = false;
        }
      }
      let td = new Set([...e_, "x-nextjs-request-id", "x-nextjs-html-request-id"].map((e10) => e10.toLowerCase()));
      function th(e10, t10) {
        if ("x-middleware-set-cookie" in e10 && "string" == typeof e10["x-middleware-set-cookie"]) {
          let r2 = e10["x-middleware-set-cookie"], n2 = new Headers();
          for (let e11 of P(r2)) n2.append("set-cookie", e11);
          for (let e11 of new eh.ResponseCookies(n2).getAll()) t10.set(e11);
        }
      }
      let tp = eN("work-unit-async-storage");
      function tf(e10) {
        switch (e10.type) {
          case "request":
          case "prerender":
          case "prerender-runtime":
          case "prerender-client":
          case "validation-client":
            return e10.resumeDataCache;
          case "cache":
          case "private-cache":
          case "unstable-cache":
          case "prerender-legacy":
          case "build-time-generator":
            return null;
          default:
            return e10;
        }
      }
      var tg = e.i(99734);
      class tm extends Error {
        constructor(e10, t10) {
          super(`Invariant: ${e10.endsWith(".") ? e10 : e10 + "."} This is a bug in Next.js.`, t10), this.name = "InvariantError";
        }
      }
      var tv = e.i(51615);
      function tb() {
      }
      new TextEncoder();
      let tw = new TextEncoder();
      function ty(e10) {
        return new ReadableStream({ start(t10) {
          t10.enqueue(tw.encode(e10)), t10.close();
        } });
      }
      function tx(e10) {
        return new ReadableStream({ start(t10) {
          t10.enqueue(e10), t10.close();
        } });
      }
      async function t_(e10, t10) {
        let r2 = new TextDecoder("utf-8", { fatal: true }), n2 = "";
        for await (let i2 of e10) {
          if (null == t10 ? void 0 : t10.aborted) return n2;
          n2 += r2.decode(i2, { stream: true });
        }
        return n2 + r2.decode();
      }
      process.env.NEXT_PRIVATE_DEBUG_CACHE, /* @__PURE__ */ Symbol.for("@next/cache-handlers");
      let tS = /* @__PURE__ */ Symbol.for("@next/cache-handlers-map"), tC = /* @__PURE__ */ Symbol.for("@next/cache-handlers-set");
      /* @__PURE__ */ Symbol.for("@next/custom-cache-handlers-registration"), /* @__PURE__ */ Symbol.for("@next/cache-handlers-private"), /* @__PURE__ */ Symbol.for("@next/cache-handlers-built-in"), /* @__PURE__ */ Symbol.for("@next/cache-handlers-dev-fronts"), /* @__PURE__ */ Symbol.for("@next/cache-handlers-dev-tiered"), /* @__PURE__ */ Symbol.for("@next/cache-handlers-memory-disabled");
      let tP = globalThis;
      function tT() {
        let e10 = tP[tS];
        if (e10) return e10.entries();
      }
      async function tE(e10, t10) {
        if (!e10) return t10();
        let r2 = tR(e10);
        try {
          return await t10();
        } finally {
          var n2, i2, a2, o2;
          let t11, s2, l2, c2, u2 = (n2 = r2, i2 = tR(e10), t11 = new Map(n2.pendingRevalidatedTags.map((e11) => {
            let t12 = "object" == typeof e11.profile ? JSON.stringify(e11.profile) : e11.profile || "";
            return [`${e11.tag}:${t12}`, e11.revalidatedAt];
          })), s2 = new Set(n2.pendingRevalidateWrites), { pendingRevalidatedTags: i2.pendingRevalidatedTags.filter((e11) => {
            let r3 = "object" == typeof e11.profile ? JSON.stringify(e11.profile) : e11.profile || "", n3 = t11.get(`${e11.tag}:${r3}`);
            return void 0 === n3 || e11.revalidatedAt > n3;
          }), pendingRevalidates: Object.fromEntries(Object.entries(i2.pendingRevalidates).filter(([e11]) => !(e11 in n2.pendingRevalidates))), pendingRevalidateWrites: i2.pendingRevalidateWrites.filter((e11) => !s2.has(e11)) });
          await (a2 = e10, l2 = [], (c2 = (null == (o2 = u2) ? void 0 : o2.pendingRevalidatedTags) ?? a2.pendingRevalidatedTags ?? []).length > 0 && l2.push(tO(c2, a2.incrementalCache, a2)), l2.push(...Object.values((null == o2 ? void 0 : o2.pendingRevalidates) ?? a2.pendingRevalidates ?? {})), l2.push(...(null == o2 ? void 0 : o2.pendingRevalidateWrites) ?? a2.pendingRevalidateWrites ?? []), 0 !== l2.length && Promise.all(l2).then(() => void 0));
        }
      }
      function tR(e10) {
        return { pendingRevalidatedTags: e10.pendingRevalidatedTags ? e10.pendingRevalidatedTags.map((e11) => ({ ...e11 })) : [], pendingRevalidates: { ...e10.pendingRevalidates }, pendingRevalidateWrites: e10.pendingRevalidateWrites ? [...e10.pendingRevalidateWrites] : [] };
      }
      async function tO(e10, t10, r2) {
        if (0 === e10.length) return;
        let n2 = (function() {
          let e11 = tP[tC];
          if (e11) return Array.from(e11);
        })() ?? [], i2 = [], a2 = /* @__PURE__ */ new Map();
        for (let t11 of e10) {
          let e11, r3 = t11.profile;
          for (let [t12] of a2) if ("string" == typeof t12 && "string" == typeof r3 && t12 === r3 || "object" == typeof t12 && "object" == typeof r3 && JSON.stringify(t12) === JSON.stringify(r3) || t12 === r3) {
            e11 = t12;
            break;
          }
          let n3 = e11 || r3;
          a2.has(n3) || a2.set(n3, []), a2.get(n3).push(t11.tag);
        }
        for (let [e11, o2] of a2) {
          let a3;
          if (e11) {
            let t11;
            if ("object" == typeof e11) t11 = e11;
            else if ("string" == typeof e11 && !(t11 = null == r2 ? void 0 : r2.cacheLifeProfiles[e11])) throw Error(`Invalid profile provided "${e11}" must be configured under cacheLife in next.config or be "max"`);
            t11 && (a3 = { expire: t11.expire });
          }
          for (let t11 of n2) e11 ? i2.push(null == t11.updateTags ? void 0 : t11.updateTags.call(t11, o2, a3)) : i2.push(null == t11.updateTags ? void 0 : t11.updateTags.call(t11, o2));
          t10 && i2.push(t10.revalidateTag(o2, a3));
        }
        await Promise.all(i2);
      }
      let tA = eN("after-task-async-storage");
      class tN {
        constructor({ waitUntil: e10, onClose: t10, onTaskError: r2 }) {
          this.isRequestClosed = false, this.initialOnCloseError = null, this.workUnitStores = /* @__PURE__ */ new Set(), this.waitUntil = e10, this.onClose = t10, this.onTaskError = r2, this.callbackQueue = new tg.default(), this.callbackQueue.pause();
          try {
            t10(() => {
              for (let e11 of (this.isRequestClosed = true, this.workUnitStores)) e11.phase = "after";
            });
          } catch (e11) {
            this.initialOnCloseError = { error: e11 };
          }
        }
        after(e10, t10) {
          if (this.initialOnCloseError) throw new tm("An onClose call failed, which means after() can't work correctly.", { cause: this.initialOnCloseError.error });
          if (this.workUnitStores.add(t10), e4(e10)) this.addThenable(e10);
          else if ("function" == typeof e10) this.addCallback(e10, t10);
          else throw Error("`after()`: Argument must be a promise or a function");
        }
        addThenable(e10) {
          this.waitUntil || tk(), this.waitUntil(new Promise((t10) => {
            e10.then(() => {
              t10();
            }, (e11) => {
              t10(), this.reportTaskError("promise", e11);
            });
          }));
        }
        addCallback(e10, t10) {
          var r2;
          this.waitUntil || tk();
          let n2 = tA.getStore(), i2 = n2 ? n2.rootTaskSpawnPhase : t10.phase;
          this.runCallbacksOnClosePromise || (this.runCallbacksOnClosePromise = this.runCallbacksOnClose(), this.waitUntil(this.runCallbacksOnClosePromise));
          let a2 = (r2 = async () => {
            try {
              await tA.run({ rootTaskSpawnPhase: i2 }, () => e10());
            } catch (e11) {
              this.reportTaskError("function", e11);
            }
          }, eA ? eA.bind(r2) : eO.bind(r2));
          this.callbackQueue.add(a2);
        }
        async runCallbacksOnClose() {
          return this.isRequestClosed ? await new Promise((e10) => {
            setTimeout(e10, 0);
          }) : await new Promise((e10) => this.onClose(e10)), this.runCallbacks();
        }
        async runCallbacks() {
          if (0 === this.callbackQueue.size) return;
          let e10 = ek.getStore();
          if (!e10) throw new tm("Missing workStore in AfterContext.runCallbacks");
          return tE(e10, () => (this.callbackQueue.start(), this.callbackQueue.onIdle()));
        }
        reportTaskError(e10, t10) {
          if (console.error("promise" === e10 ? "A promise passed to `after()` rejected:" : "An error occurred in a function passed to `after()`:", t10), this.onTaskError) try {
            null == this.onTaskError || this.onTaskError.call(this, t10);
          } catch (e11) {
            console.error(new tm("`onTaskError` threw while handling an error thrown from an `after` task", { cause: e11 }));
          }
        }
      }
      function tk() {
        throw Error("`after()` will not work correctly, because `waitUntil` is not available in the current environment.");
      }
      function tI(e10) {
        let t10, r2 = { then: (n2, i2) => (t10 || (t10 = Promise.resolve(e10())), t10.then((e11) => {
          r2.value = e11;
        }).catch(() => {
        }), t10.then(n2, i2)) };
        return r2;
      }
      class tM {
        onClose(e10) {
          if (this.isClosed) throw Error("Cannot subscribe to a closed CloseController");
          this.target.addEventListener("close", e10), this.listeners++;
        }
        dispatchClose() {
          if (this.isClosed) throw Error("Cannot close a CloseController multiple times");
          this.listeners > 0 && this.target.dispatchEvent(new Event("close")), this.isClosed = true;
        }
        constructor() {
          this.target = new EventTarget(), this.listeners = 0, this.isClosed = false;
        }
      }
      let tL = "x-middleware-override-headers", tj = "x-middleware-request-";
      function tD(e10) {
        let [, t10, r2] = (null == e10 ? void 0 : e10.toLowerCase().split("-")) ?? [];
        return t10 && r2 ? `${t10}-${r2}` : void 0;
      }
      function tU(e10) {
        return "traceparent" === e10 || "tracestate" === e10;
      }
      function t$(e10, t10, r2) {
        e10.set(tj + "traceparent", r2.traceparent), t10.push("traceparent"), r2.tracestate ? (e10.set(tj + "tracestate", r2.tracestate), t10.push("tracestate")) : e10.delete(tj + "tracestate"), e10.set(tL, t10.join(","));
      }
      function tq() {
        return { previewModeId: process.env.__NEXT_PREVIEW_MODE_ID || "", previewModeSigningKey: process.env.__NEXT_PREVIEW_MODE_SIGNING_KEY || "", previewModeEncryptionKey: process.env.__NEXT_PREVIEW_MODE_ENCRYPTION_KEY || "" };
      }
      let tB = /* @__PURE__ */ Symbol.for("@next/request-context"), tF = /[^\t\x20-\x7e]/, tH = /[^\t\x20-\x7e]+/g;
      function tG(e10) {
        return tF.test(e10) ? e10.replace(tH, (e11) => encodeURIComponent(e11)) : e10;
      }
      async function tV(e10, t10, r2) {
        let n2 = /* @__PURE__ */ new Set();
        for (let t11 of ((e11) => {
          let t12 = ["/layout"];
          if (e11.startsWith("/")) {
            let r3 = e11.indexOf("/", 1);
            for (; ; ) {
              -1 === r3 && (r3 = e11.length);
              let n3 = e11.slice(0, r3);
              if (n3 && (n3.endsWith("/page") || n3.endsWith("/route") || (n3 = `${n3}${!n3.endsWith("/") ? "/" : ""}layout`), t12.push(n3)), r3 === e11.length) break;
              r3 = e11.indexOf("/", r3 + 1);
            }
          }
          return t12;
        })(e10)) t11 = tG(`${S}${t11}`), n2.add(t11);
        if (t10 && (!r2 || 0 === r2.size)) {
          let e11 = tG(`${S}${t10}`);
          n2.add(e11);
        }
        n2.has(`${S}/`) && n2.add(`${S}/index`), n2.has(`${S}/index`) && n2.add(`${S}/`);
        let i2 = Array.from(n2);
        return { tags: i2, expirationsByCacheKind: (function(e11) {
          let t11 = /* @__PURE__ */ new Map(), r3 = tT();
          if (r3) for (let [n3, i3] of r3) "getExpiration" in i3 && t11.set(n3, tI(async () => i3.getExpiration(e11)));
          return t11;
        })(i2) };
      }
      let tz = /* @__PURE__ */ Symbol.for("NextInternalRequestMeta"), tW = { get default() {
        throw new tm("Proxy does not support `use cache`, so reading its `default` cacheLife profile is unexpected.");
      } };
      class tX extends ef {
        constructor(e10) {
          super(e10.input, e10.init), this.sourcePage = e10.page;
        }
        get request() {
          throw new d({ page: this.sourcePage });
        }
        respondWith() {
          throw new d({ page: this.sourcePage });
        }
        waitUntil() {
          throw new d({ page: this.sourcePage });
        }
      }
      let tK = { keys: (e10) => Array.from(e10.keys()), get: (e10, t10) => e10.get(t10) ?? void 0 }, tJ = (e10, t10) => tl().withPropagatedContext(e10.headers, t10, tK), tQ = false;
      async function tY(t10) {
        var r2, n2, i2, a2, o2, s2;
        let l2, u2, d2, h2, p2, f2, g2;
        !(function() {
          if (!tQ && (tQ = true, "true" === process.env.NEXT_PRIVATE_TEST_PROXY)) {
            let { interceptTestApis: t11, wrapRequestHandler: r3 } = e.r(94165);
            t11(), tJ = r3(tJ);
          }
        })(), await c();
        let m2 = void 0 !== globalThis.__BUILD_MANIFEST;
        t10.request.url = t10.request.url.replace(/\.rsc($|\?)/, "$1");
        let v2 = t10.bypassNextUrl ? new URL(t10.request.url) : new H(t10.request.url, { headers: t10.request.headers, nextConfig: t10.request.nextConfig });
        for (let e10 of [...v2.searchParams.keys()]) {
          let t11 = v2.searchParams.getAll(e10), r3 = (function(e11) {
            for (let t12 of ["nxtP", "nxtI"]) if (e11 !== t12 && e11.startsWith(t12)) return e11.substring(t12.length);
            return null;
          })(e10);
          if (r3) {
            for (let e11 of (v2.searchParams.delete(r3), t11)) v2.searchParams.append(r3, e11);
            v2.searchParams.delete(e10);
          }
        }
        let b2 = process.env.__NEXT_BUILD_ID || "";
        "buildId" in v2 && (b2 = v2.buildId || "", v2.buildId = "");
        let w2 = (function(e10) {
          let t11 = new Headers();
          for (let [r3, n3] of Object.entries(e10)) for (let e11 of Array.isArray(n3) ? n3 : [n3]) void 0 !== e11 && ("number" == typeof e11 && (e11 = e11.toString()), t11.append(r3, e11));
          return t11;
        })(t10.request.headers), y2 = w2.has("x-nextjs-data"), x2 = "1" === w2.get("rsc");
        y2 && "/index" === v2.pathname && (v2.pathname = "/");
        let _2 = /* @__PURE__ */ new Map();
        if (!m2) for (let e10 of e_) {
          let t11 = w2.get(e10);
          null !== t11 && (_2.set(e10, t11), w2.delete(e10));
        }
        let S2 = v2.searchParams.get(eS), C2 = new tX({ page: t10.page, input: ((f2 = (p2 = "string" == typeof v2) ? new URL(v2) : v2).searchParams.delete(eS), p2 ? f2.toString() : f2).toString(), init: { body: t10.request.body, headers: w2, method: t10.request.method, nextConfig: t10.request.nextConfig, signal: t10.request.signal } });
        t10.request.requestMeta && (o2 = t10.request.requestMeta, C2[tz] = o2), y2 && Object.defineProperty(C2, "__isData", { enumerable: false, value: true }), !globalThis.__incrementalCacheShared && t10.IncrementalCache && (globalThis.__incrementalCache = new t10.IncrementalCache({ CurCacheHandler: t10.incrementalCacheHandler, minimalMode: true, fetchCacheKeyPrefix: "", dev: false, requestHeaders: t10.request.headers, previewProps: tq(), prerenderManifest: { version: -1, routes: {}, dynamicRoutes: {}, notFoundRoutes: [], preview: tq() } }));
        let P2 = t10.request.waitUntil ?? (null == (r2 = null == (g2 = globalThis[tB]) ? void 0 : g2.get()) ? void 0 : r2.waitUntil), T2 = new k({ request: C2, page: t10.page, context: P2 ? { waitUntil: P2 } : void 0 }), E2 = "/middleware" === (s2 = t10.page) || "/src/middleware" === s2 || "/proxy" === s2 || "/src/proxy" === s2;
        if ((l2 = await tJ(C2, () => {
          if (E2) {
            let e10 = T2.waitUntil.bind(T2), r3 = new tM(), n3 = tl(), i3 = () => {
              let i4 = new Headers(C2.headers);
              return (d2 = (function(e11, t11) {
                if (!t11) return;
                let r4 = e11.get("traceparent"), n4 = tD(r4);
                if (r4 && n4 && n4 === tD(t11.traceparent)) {
                  let t12 = e11.get("tracestate");
                  return t12 ? { traceparent: r4, tracestate: t12 } : { traceparent: r4, tracestate: void 0 };
                }
                return t11;
              })(i4, n3.getTraceContextHeaders())) && (h2 = i4), n3.trace(eZ.execute, { spanName: `middleware ${C2.method}`, startTime: t10.emitInstrumentationSpans ? t10.requestStartTime : void 0, attributes: { "http.target": C2.nextUrl.pathname, "http.method": C2.method } }, async () => {
                null == t10.emitInstrumentationSpans || t10.emitInstrumentationSpans.call(t10);
                try {
                  var n4, i5, a3, o3, s3, l3;
                  let c2 = tq(), d3 = await tV("/", C2.nextUrl.pathname, null), h3 = (a3 = C2.nextUrl, o3 = (e11) => {
                    u2 = e11;
                  }, s3 = void 0, (function(e11) {
                    let { phase: t11, headers: r4, onUpdateCookies: n5, url: i6, rootParams: a4, implicitTags: o4, resumeDataCache: s4, previewProps: l4, isHmrRefresh: c3, serverComponentsHmrCache: u3, hmrRefreshHash: d4, stagedFallbackParams: h4 } = e11, p4 = {};
                    return { type: "request", phase: t11, implicitTags: o4, url: { pathname: i6.pathname, search: i6.search ?? "" }, rootParams: a4, get headers() {
                      return p4.headers || (p4.headers = eE.seal(eE.from(r4), td)), p4.headers;
                    }, get cookies() {
                      if (!p4.cookies) {
                        let e12 = new eh.RequestCookies(eE.from(r4));
                        th(r4, e12), p4.cookies = eM.seal(e12);
                      }
                      return p4.cookies;
                    }, set cookies(e12) {
                      p4.cookies = e12;
                    }, get mutableCookies() {
                      if (!p4.mutableCookies) {
                        let e12, t12 = (e12 = new eh.RequestCookies(eE.from(r4)), ej.wrap(e12, n5));
                        th(r4, t12), p4.mutableCookies = t12;
                      }
                      return p4.mutableCookies;
                    }, get userspaceMutableCookies() {
                      if (!p4.userspaceMutableCookies) {
                        var e12;
                        let t12;
                        e12 = this, p4.userspaceMutableCookies = t12 = new Proxy(e12.mutableCookies, { get(r5, n6, i7) {
                          switch (n6) {
                            case "delete":
                              return function(...n7) {
                                return eD(e12, "cookies().delete"), r5.delete(...n7), t12;
                              };
                            case "set":
                              return function(...n7) {
                                return eD(e12, "cookies().set"), r5.set(...n7), t12;
                              };
                            default:
                              return eg.get(r5, n6, i7);
                          }
                        } });
                      }
                      return p4.userspaceMutableCookies;
                    }, get draftMode() {
                      return p4.draftMode || (p4.draftMode = new tu(l4, r4, this.cookies, this.mutableCookies)), p4.draftMode;
                    }, resumeDataCache: s4 ?? null, isHmrRefresh: c3, serverComponentsHmrCache: u3 || globalThis.__serverComponentsHmrCache, hmrRefreshHash: d4, stagedFallbackParams: h4, usedDynamic: false };
                  })({ phase: "action", headers: C2.headers, onUpdateCookies: o3, url: a3, rootParams: {}, implicitTags: d3, resumeDataCache: null, previewProps: c2, isHmrRefresh: false, serverComponentsHmrCache: void 0, hmrRefreshHash: s3, stagedFallbackParams: null })), p3 = (l3 = { page: "/", renderOpts: { cacheLifeProfiles: tW, staticPageGenerationTimeout: 0, cacheComponents: false, validationLevel: "warning", experimental: { isRoutePPREnabled: false, authInterrupts: !!(null == (i5 = t10.request.nextConfig) || null == (n4 = i5.experimental) ? void 0 : n4.authInterrupts), useCacheTimeout: 0, durableUseCacheEntries: false }, waitUntil: e10, onClose: r3.onClose.bind(r3), onAfterTaskError: void 0 }, isPrefetchRequest: "1" === C2.headers.get(ex), buildId: b2 ?? "", deploymentId: false, previouslyRevalidatedTags: [] }, (function({ page: e11, renderOpts: t11, isPrefetchRequest: r4, buildId: n5, deploymentId: i6, previouslyRevalidatedTags: a4, nonce: o4 }, s4) {
                    let l4 = { page: e11, route: eP(e11), incrementalCache: t11.incrementalCache || globalThis.__incrementalCache, cacheLifeProfiles: t11.cacheLifeProfiles, useCacheTimeout: t11.experimental.useCacheTimeout, durableUseCacheEntries: t11.experimental.durableUseCacheEntries, staticPageGenerationTimeout: t11.staticPageGenerationTimeout, isBuildTimePrerendering: t11.isBuildTimePrerendering, fetchCache: t11.fetchCache, isOnDemandRevalidate: t11.isOnDemandRevalidate, requestId: void 0, htmlRequestId: void 0, isDraftMode: t11.isDraftMode, isPrefetchRequest: r4, buildId: n5, deploymentId: i6, reactLoadableManifest: (null == t11 ? void 0 : t11.reactLoadableManifest) || {}, assetPrefix: (null == t11 ? void 0 : t11.assetPrefix) || "", nonce: o4, afterContext: (function(e12) {
                      let { waitUntil: t12, onClose: r5, onAfterTaskError: n6 } = e12;
                      return new tN({ waitUntil: t12, onClose: r5, onTaskError: n6 });
                    })(t11), cacheComponentsEnabled: t11.cacheComponents, validationLevel: t11.validationLevel, previouslyRevalidatedTags: a4, requestStartTime: performance.timeOrigin + performance.now(), refreshTagsByCacheKind: (function() {
                      let e12 = /* @__PURE__ */ new Map(), t12 = tT();
                      if (t12) for (let [r5, n6] of t12) "refreshTags" in n6 && e12.set(r5, tI(async () => n6.refreshTags()));
                      return e12;
                    })(), runInCleanSnapshot: eA ? eA.snapshot() : function(e12, ...t12) {
                      return e12(...t12);
                    }, shouldTrackFetchMetrics: s4, clientComponentLoadTracker: void 0, reactServerErrorsByDigest: /* @__PURE__ */ new Map() };
                    return t11.store = l4, l4;
                  })(l3, false));
                  return await ek.run(p3, () => tp.run(h3, t10.handler, C2, T2));
                } finally {
                  setTimeout(() => {
                    r3.dispatchClose();
                  }, 0);
                }
              });
            };
            return n3.isOpenTelemetryEnabled() && !n3.hasActiveSpanContext() ? n3.trace(e0.request, { spanName: C2.method, kind: te.SERVER, startTime: t10.requestStartTime, attributes: { "http.target": C2.nextUrl.pathname, "http.method": C2.method } }, i3) : i3();
          }
          return t10.handler(C2, T2);
        })) && !(l2 instanceof Response)) throw TypeError("Expected an instance of Response to be returned");
        l2 && !E2 && l2.headers.has("x-middleware-set-cookie") && (l2 = new Response(l2.body, l2)).headers.delete("x-middleware-set-cookie"), l2 && u2 && l2.headers.set("set-cookie", u2);
        let R2 = null == l2 ? void 0 : l2.headers.get("x-middleware-rewrite");
        if (l2 && R2 && (x2 || !m2)) {
          let e10 = new H(R2, { forceLocale: true, headers: t10.request.headers, nextConfig: t10.request.nextConfig });
          m2 || e10.host !== C2.nextUrl.host || (e10.buildId = b2 || e10.buildId, l2.headers.set("x-middleware-rewrite", String(e10)));
          let { url: r3, isRelative: o3 } = ey(e10.toString(), v2.toString());
          !m2 && y2 && l2.headers.set("x-nextjs-rewrite", r3);
          let s3 = !o3 && (null == (a2 = t10.request.nextConfig) || null == (i2 = a2.experimental) || null == (n2 = i2.clientParamParsingOrigins) ? void 0 : n2.some((t11) => new RegExp(t11).test(e10.origin)));
          x2 && (o3 || s3) && (v2.pathname !== e10.pathname && l2.headers.set("x-nextjs-rewritten-path", e10.pathname), v2.search !== e10.search && l2.headers.set("x-nextjs-rewritten-query", e10.search.slice(1)));
        }
        if (l2 && R2 && x2 && S2) {
          let e10 = new URL(R2);
          e10.searchParams.has(eS) || (e10.searchParams.set(eS, S2), l2.headers.set("x-middleware-rewrite", e10.toString()));
        }
        let O2 = null == l2 ? void 0 : l2.headers.get("Location");
        if (l2 && O2 && !m2) {
          let e10 = new H(O2, { forceLocale: false, headers: t10.request.headers, nextConfig: t10.request.nextConfig });
          l2 = new Response(l2.body, l2), e10.host === v2.host && (e10.buildId = b2 || e10.buildId, l2.headers.set("Location", ey(e10, v2).url)), y2 && (l2.headers.delete("Location"), l2.headers.set("x-nextjs-redirect", ey(e10.toString(), v2.toString()).url));
        }
        let N2 = l2 || ew.next();
        h2 && (function(e10, t11, r3) {
          if (!r3 || !e10.has("x-middleware-next") && !e10.has("x-middleware-rewrite")) return;
          let n3 = e10.get(tL);
          if (!n3) {
            if (t11.get("traceparent") === r3.traceparent && t11.get("tracestate") === (r3.tracestate ?? null)) return;
            let n4 = [];
            for (let [r4, i4] of t11) tU(r4) || (e10.set(tj + r4, i4), n4.push(r4));
            t$(e10, n4, r3);
            return;
          }
          let i3 = n3.split(",").map((e11) => e11.trim()).filter(Boolean);
          i3.includes("traceparent") && e10.get(tj + "traceparent") !== t11.get("traceparent") || t$(e10, i3.filter((e11) => !tU(e11)), r3);
        })(N2.headers, h2, d2);
        let I2 = N2.headers.get("x-middleware-override-headers"), M2 = [];
        if (I2) {
          for (let [e10, t11] of _2) N2.headers.set(`x-middleware-request-${e10}`, t11), M2.push(e10);
          M2.length > 0 && N2.headers.set("x-middleware-override-headers", I2 + "," + M2.join(","));
        }
        return { response: N2, waitUntil: ("internal" === T2[A].kind ? Promise.all(T2[A].promises).then(() => {
        }) : void 0) ?? Promise.resolve(), fetchMetrics: C2.fetchMetrics };
      }
      let tZ = ["(..)(..)", "(.)", "(..)", "(...)"], t0 = /\/[^/]*\[[^/]+\][^/]*(?=\/|$)/, t1 = /\/\[[^/]+\](?=\/|$)/;
      class t2 {
        constructor(e10 = []) {
          this.normalizers = e10;
        }
        push(e10) {
          this.normalizers.push(e10);
        }
        normalize(e10) {
          return this.normalizers.reduce((e11, t10) => t10.normalize(e11), e10);
        }
      }
      class t4 {
        normalize(e10) {
          return e10.replace(/%5F/g, "_");
        }
      }
      var t3 = ((es = {}).PAGES = "PAGES", es.PAGES_API = "PAGES_API", es.APP_PAGE = "APP_PAGE", es.APP_ROUTE = "APP_ROUTE", es.IMAGE = "IMAGE", es);
      let t6 = "route-cache", t5 = new class extends t2 {
        constructor() {
          super([{ normalize: eP }, new t4()]);
        }
        normalize(e10) {
          return super.normalize(e10);
        }
      }();
      function t8(e10, t10, r2, n2) {
        if (!r2) return false;
        let i2 = null === r2.dataRoute ? t3.APP_ROUTE : r2.dataRoute.endsWith(".json") ? t3.PAGES : r2.dataRoute.endsWith(".rsc") ? t3.APP_PAGE : void 0;
        return i2 === t10.kind && (("srcRoute" in r2 ? r2.srcRoute : r2.fallbackSourceRoute) ?? (i2 === t3.PAGES ? $(e10, n2).pathname : e10)) === (i2 === t3.PAGES ? t10.sourceRoute : t5.normalize(t10.sourceRoute));
      }
      function t7(t10, r2) {
        let n2;
        if (!r2) throw new tm("Response cache requires a source route");
        let { sourceRoute: i2 } = r2;
        return n2 = e.r(63398)().update(new TextEncoder().encode(i2)).digest("hex"), `/${t6}/${r2.kind}/${n2}/$${/^\/index(\/|$)/.test(t10) && !(function(e10, t11 = true) {
          return (void 0 !== e10.split("/").find((e11) => tZ.find((t12) => e11.startsWith(t12))) && (e10 = (function(e11) {
            let t12, r3, n3;
            for (let i3 of e11.split("/")) if (r3 = tZ.find((e12) => i3.startsWith(e12))) {
              [t12, n3] = e11.split(r3, 2);
              break;
            }
            if (!t12 || !r3 || !n3) throw Error(`Invalid interception route: ${e11}. Must be in the format /<intercepting route>/(..|...|..)(..)/<intercepted route>`);
            switch (t12 = eP(t12), r3) {
              case "(.)":
                n3 = "/" === t12 ? `/${n3}` : t12 + "/" + n3;
                break;
              case "(..)":
                if ("/" === t12) throw Error(`Invalid interception route: ${e11}. Cannot use (..) marker at the root level, use (.) instead.`);
                n3 = t12.split("/").slice(0, -1).concat(n3).join("/");
                break;
              case "(...)":
                n3 = "/" + n3;
                break;
              case "(..)(..)":
                let i3 = t12.split("/");
                if (i3.length <= 2) throw Error(`Invalid interception route: ${e11}. Cannot use (..)(..) marker at the root level or one level up.`);
                n3 = i3.slice(0, -2).concat(n3).join("/");
                break;
              default:
                throw Error("Invariant: unexpected marker");
            }
            return { interceptingRoute: t12, interceptedRoute: n3 };
          })(e10).interceptedRoute), t11) ? t1.test(e10) : t0.test(e10);
        })(t10) ? `/index${t10}` : "/" === t10 ? "/index" : eC(t10)}`;
      }
      var t9 = ((el = {}).APP_PAGE = "APP_PAGE", el.APP_ROUTE = "APP_ROUTE", el.PAGES = "PAGES", el.FETCH = "FETCH", el.REDIRECT = "REDIRECT", el.IMAGE = "IMAGE", el), re = ((ec = {}).APP_PAGE = "APP_PAGE", ec.APP_ROUTE = "APP_ROUTE", ec.PAGES = "PAGES", ec.FETCH = "FETCH", ec.IMAGE = "IMAGE", ec);
      function rt() {
        let e10, t10, r2 = new Promise((r3, n2) => {
          e10 = r3, t10 = n2;
        });
        return { resolve: e10, reject: t10, promise: r2 };
      }
      class rr {
        constructor(e10, t10, r2) {
          this.prev = null, this.next = null, this.key = e10, this.data = t10, this.size = r2;
        }
      }
      class rn {
        constructor() {
          this.prev = null, this.next = null;
        }
      }
      class ri {
        constructor(e10, t10, r2) {
          this.cache = /* @__PURE__ */ new Map(), this.totalSize = 0, this.maxSize = e10, this.calculateSize = t10, this.onEvict = r2, this.head = new rn(), this.tail = new rn(), this.head.next = this.tail, this.tail.prev = this.head;
        }
        addToHead(e10) {
          e10.prev = this.head, e10.next = this.head.next, this.head.next.prev = e10, this.head.next = e10;
        }
        removeNode(e10) {
          e10.prev.next = e10.next, e10.next.prev = e10.prev;
        }
        moveToHead(e10) {
          this.removeNode(e10), this.addToHead(e10);
        }
        removeTail() {
          let e10 = this.tail.prev;
          return this.removeNode(e10), e10;
        }
        set(e10, t10) {
          let r2 = (null == this.calculateSize ? void 0 : this.calculateSize.call(this, t10, e10)) ?? 1;
          if (r2 <= 0) throw Error(`LRUCache: calculateSize returned ${r2}, but size must be > 0. Items with size 0 would never be evicted, causing unbounded cache growth.`);
          if (r2 > this.maxSize) return console.warn("Single item size exceeds maxSize"), false;
          let n2 = this.cache.get(e10);
          if (n2) n2.data = t10, this.totalSize = this.totalSize - n2.size + r2, n2.size = r2, this.moveToHead(n2);
          else {
            let n3 = new rr(e10, t10, r2);
            this.cache.set(e10, n3), this.addToHead(n3), this.totalSize += r2;
          }
          for (; this.totalSize > this.maxSize && this.cache.size > 0; ) {
            let e11 = this.removeTail();
            this.cache.delete(e11.key), this.totalSize -= e11.size, null == this.onEvict || this.onEvict.call(this, e11.key, e11.data);
          }
          return true;
        }
        has(e10) {
          return this.cache.has(e10);
        }
        get(e10) {
          let t10 = this.cache.get(e10);
          if (t10) return this.moveToHead(t10), t10.data;
        }
        *[Symbol.iterator]() {
          let e10 = this.head.next;
          for (; e10 && e10 !== this.tail; ) {
            let t10 = e10;
            yield [t10.key, t10.data], e10 = e10.next;
          }
        }
        remove(e10) {
          let t10 = this.cache.get(e10);
          t10 && (this.removeNode(t10), this.cache.delete(e10), this.totalSize -= t10.size);
        }
        get size() {
          return this.cache.size;
        }
        get currentSize() {
          return this.totalSize;
        }
      }
      let { env: ra, stdout: ro } = (null == (ed = globalThis) ? void 0 : ed.process) ?? {}, rs = ra && !ra.NO_COLOR && (ra.FORCE_COLOR || (null == ro ? void 0 : ro.isTTY) && !ra.CI && "dumb" !== ra.TERM);
      (null == ro ? void 0 : ro.isTTY) || ra.NEXT_PRIVATE_PROMPT_OUTPUT;
      let rl = (e10, t10, r2, n2) => {
        let i2 = e10.substring(0, n2) + r2, a2 = e10.substring(n2 + t10.length), o2 = a2.indexOf(t10);
        return ~o2 ? i2 + rl(a2, t10, r2, o2) : i2 + a2;
      }, rc = (e10, t10, r2 = e10) => rs ? (n2) => {
        let i2 = "" + n2, a2 = i2.indexOf(t10, e10.length);
        return ~a2 ? e10 + rl(i2, t10, r2, a2) + t10 : e10 + i2 + t10;
      } : String, ru = rc("\x1B[1m", "\x1B[22m", "\x1B[22m\x1B[1m");
      rc("\x1B[2m", "\x1B[22m", "\x1B[22m\x1B[2m"), rc("\x1B[3m", "\x1B[23m"), rc("\x1B[4m", "\x1B[24m"), rc("\x1B[7m", "\x1B[27m"), rc("\x1B[8m", "\x1B[28m"), rc("\x1B[9m", "\x1B[29m"), rc("\x1B[30m", "\x1B[39m");
      let rd = rc("\x1B[31m", "\x1B[39m"), rh = rc("\x1B[32m", "\x1B[39m"), rp = rc("\x1B[33m", "\x1B[39m");
      rc("\x1B[34m", "\x1B[39m");
      let rf = rc("\x1B[35m", "\x1B[39m");
      rc("\x1B[38;2;173;127;168m", "\x1B[39m"), rc("\x1B[36m", "\x1B[39m");
      let rg = rc("\x1B[37m", "\x1B[39m");
      rc("\x1B[90m", "\x1B[39m"), rc("\x1B[40m", "\x1B[49m"), rc("\x1B[41m", "\x1B[49m"), rc("\x1B[42m", "\x1B[49m"), rc("\x1B[43m", "\x1B[49m"), rc("\x1B[44m", "\x1B[49m"), rc("\x1B[45m", "\x1B[49m"), rc("\x1B[46m", "\x1B[49m"), rc("\x1B[47m", "\x1B[49m"), rg(ru("\u25CB")), rd(ru("\u2A2F")), rp(ru("\u26A0")), rg(ru(" ")), rh(ru("\u2713")), rf(ru("\xBB")), new ri(1e4, (e10) => e10.length), new ri(1e4, (e10) => e10.length);
      let rm = "ResponseAborted";
      class rv extends Error {
        constructor(...e10) {
          super(...e10), this.name = rm;
        }
      }
      function rb(e10) {
        return (null == e10 ? void 0 : e10.name) === "AbortError" || (null == e10 ? void 0 : e10.name) === rm;
      }
      let rw = "performance" in globalThis && process.env.NEXT_OTEL_PERFORMANCE_PREFIX;
      async function ry(e10, t10, r2, n2) {
        try {
          let i2, { errored: a2, destroyed: o2 } = t10;
          if (a2 || o2) return;
          let s2 = (i2 = new AbortController(), t10.once("close", () => {
            t10.writableFinished || i2.abort(new rv());
          }), i2), l2 = (function(e11, t11, r3) {
            let n3 = false, i3 = rt();
            function a3() {
              i3.resolve();
            }
            e11.on("drain", a3), e11.once("close", () => {
              e11.off("drain", a3), i3.resolve();
            });
            let o3 = rt();
            return e11.once("finish", () => {
              o3.resolve();
            }), new WritableStream({ write: async (t12) => {
              if (!n3) {
                if (n3 = true, rw) {
                  let e12 = null == r3 ? void 0 : r3.snapshot();
                  e12 && performance.measure(`${process.env.NEXT_OTEL_PERFORMANCE_PREFIX}:next-client-component-loading`, { start: e12.clientComponentLoadStart, end: e12.clientComponentLoadStart + e12.clientComponentLoadTimes });
                }
                e11.flushHeaders(), tl().trace(eF.startResponse, { spanName: "start response" }, () => void 0);
              }
              try {
                let r4 = e11.write(t12);
                "flush" in e11 && "function" == typeof e11.flush && e11.flush(), r4 || (await i3.promise, i3 = rt());
              } catch (t13) {
                throw e11.end(), Error("failed to write chunk to response", { cause: t13 });
              }
            }, abort: (t12) => {
              e11.writableFinished || e11.destroy(t12);
            }, close: async () => {
              if (t11 && await t11, !e11.writableFinished) return e11.end(), o3.promise;
            } });
          })(t10, r2, n2);
          await e10.pipeTo(l2, { signal: s2.signal });
        } catch (e11) {
          if (rb(e11)) return;
          throw Error("failed to pipe response", { cause: e11 });
        }
      }
      async function rx(e10, t10, r2, n2) {
        try {
          let { errored: i2, destroyed: a2 } = t10;
          if (i2 || a2) return;
          let o2 = false, s2 = rt(), l2 = false, c2 = () => {
            l2 && !e10.destroyed && (l2 = false, e10.resume());
          };
          t10.on("drain", c2), t10.once("close", () => {
            t10.off("drain", c2), e10.destroy(), s2.resolve();
          }), e10.on("data", (r3) => {
            if (!o2) {
              if (o2 = true, "performance" in globalThis && process.env.NEXT_OTEL_PERFORMANCE_PREFIX) {
                let e11 = null == n2 ? void 0 : n2.snapshot();
                e11 && performance.measure(`${process.env.NEXT_OTEL_PERFORMANCE_PREFIX}:next-client-component-loading`, { start: e11.clientComponentLoadStart, end: e11.clientComponentLoadStart + e11.clientComponentLoadTimes });
              }
              t10.flushHeaders(), tl().trace(eF.startResponse, { spanName: "start response" }, () => void 0);
            }
            let i3 = t10.write(r3);
            "flush" in t10 && "function" == typeof t10.flush && t10.flush(), i3 || (l2 = true, e10.pause());
          }), e10.on("end", async () => {
            r2 && await r2, t10.writableFinished || t10.end(), s2.resolve();
          }), e10.on("error", (e11) => {
            rb(e11) || t10.destroy(e11), s2.resolve();
          }), await s2.promise;
        } catch (e11) {
          if (rb(e11)) return;
          throw Error("failed to pipe response", { cause: e11 });
        }
      }
      function r_(e10) {
        return null !== e10 && "object" == typeof e10 && "function" == typeof e10.pipe && "function" == typeof e10.on && !(e10 instanceof ReadableStream);
      }
      class rS {
        static #e = this.EMPTY = new rS(null, { metadata: {}, contentType: null });
        static fromStatic(e10, t10) {
          return new rS(e10, { metadata: {}, contentType: t10 });
        }
        constructor(e10, { contentType: t10, waitUntil: r2, metadata: n2 }) {
          this.response = e10, this.contentType = t10, this.metadata = n2, this.waitUntil = r2;
        }
        assignMetadata(e10) {
          Object.assign(this.metadata, e10);
        }
        get isNull() {
          return null === this.response;
        }
        get isDynamic() {
          return "string" != typeof this.response;
        }
        toUnchunkedString(e10 = false) {
          if (null === this.response) return "";
          if ("string" != typeof this.response) {
            if (!e10) throw new tm("dynamic responses cannot be unchunked. This is a bug in Next.js");
            return t_(this.readable);
          }
          return this.response;
        }
        get readable() {
          if (null === this.response) return new ReadableStream({ start(e10) {
            e10.close();
          } });
          if ("string" == typeof this.response) return ty(this.response);
          if (tv.Buffer.isBuffer(this.response)) return tx(this.response);
          if (Array.isArray(this.response)) return (function(...e10) {
            if (0 === e10.length) return new ReadableStream({ start(e11) {
              e11.close();
            } });
            if (1 === e10.length) return e10[0];
            let { readable: t10, writable: r2 } = new TransformStream(), n2 = e10[0].pipeTo(r2, { preventClose: true }), i2 = 1;
            for (; i2 < e10.length - 1; i2++) {
              let t11 = e10[i2];
              n2 = n2.then(() => t11.pipeTo(r2, { preventClose: true }));
            }
            let a2 = e10[i2];
            return (n2 = n2.then(() => a2.pipeTo(r2))).catch(tb), t10;
          })(...this.response);
          if (r_(this.response)) throw new tm("Node.js Readable cannot be converted to a web stream in the edge runtime");
          return this.response;
        }
        coerce() {
          if (null === this.response) return [];
          if ("string" == typeof this.response) return [ty(this.response)];
          if (Array.isArray(this.response)) return this.response;
          if (tv.Buffer.isBuffer(this.response)) return [tx(this.response)];
          if (!r_(this.response)) return [this.response];
          throw new tm("Node.js Readable cannot be converted to a web stream in the edge runtime");
        }
        pipeThrough(e10) {
          this.response = this.readable.pipeThrough(e10);
        }
        unshift(e10) {
          this.response = this.coerce(), this.response.unshift(e10);
        }
        push(e10) {
          this.response = this.coerce(), this.response.push(e10);
        }
        async pipeTo(e10) {
          try {
            await this.readable.pipeTo(e10, { preventClose: true }), this.waitUntil && await this.waitUntil, await e10.close();
          } catch (t10) {
            if (rb(t10)) return void await e10.abort(t10);
            throw t10;
          }
        }
        async pipeToNodeResponse(e10) {
          null !== this.response && "string" != typeof this.response && !tv.Buffer.isBuffer(this.response) && !Array.isArray(this.response) && r_(this.response) ? await rx(this.response, e10, this.waitUntil, this.metadata.clientComponentLoadTracker) : await ry(this.readable, e10, this.waitUntil, this.metadata.clientComponentLoadTracker);
        }
      }
      function rC(e10, t10) {
        if (!e10) return t10;
        let r2 = parseInt(e10, 10);
        return Number.isFinite(r2) && r2 > 0 ? r2 : t10;
      }
      rC(process.env.NEXT_PRIVATE_RESPONSE_CACHE_TTL, 1e4), rC(process.env.NEXT_PRIVATE_RESPONSE_CACHE_MAX_SIZE, 150);
      var rP = e.i(68886);
      let rT = /* @__PURE__ */ new Map(), rE = (e10, t10) => {
        for (let r2 of e10) {
          let e11 = rT.get(r2), n2 = null == e11 ? void 0 : e11.expired;
          if ("number" == typeof n2 && n2 <= performance.timeOrigin + performance.now() && n2 > t10) return true;
        }
        return false;
      }, rR = (e10, t10) => {
        for (let r2 of e10) {
          let e11 = rT.get(r2), n2 = (null == e11 ? void 0 : e11.stale) ?? 0;
          if ("number" == typeof n2 && n2 > t10) return true;
        }
        return false;
      };
      class rO {
        constructor(e10) {
          this.fs = e10, this.tasks = [];
        }
        findOrCreateTask(e10) {
          for (let t11 of this.tasks) if (t11[0] === e10) return t11;
          let t10 = this.fs.mkdir(e10);
          t10.catch(() => {
          });
          let r2 = [e10, t10, []];
          return this.tasks.push(r2), r2;
        }
        append(e10, t10) {
          let r2 = this.findOrCreateTask(rP.default.dirname(e10)), n2 = r2[1].then(() => this.fs.writeFile(e10, t10));
          n2.catch(() => {
          }), r2[2].push(n2);
        }
        wait() {
          return Promise.all(this.tasks.flatMap((e10) => e10[2]));
        }
      }
      function rA(e10) {
        return (null == e10 ? void 0 : e10.length) || 0;
      }
      class rN {
        static #e = this.debug = !!process.env.NEXT_PRIVATE_DEBUG_CACHE;
        static #t = this.seedReads = /* @__PURE__ */ new Map();
        constructor(e10) {
          if (this.fs = e10.fs, this.flushToDisk = e10.flushToDisk, this.serverDistDir = e10.serverDistDir, this.revalidatedTags = e10.revalidatedTags, e10.maxMemoryCacheSize) if (rN.memoryCache) rN.debug && console.log("FileSystemCache: memory store already initialized");
          else {
            var t10;
            rN.debug && console.log("FileSystemCache: using memory store for fetch cache"), t10 = e10.maxMemoryCacheSize, r || (r = new ri(t10, function({ value: e11 }, t11) {
              var r2, n2;
              let i2;
              if (e11) if (e11.kind === t9.REDIRECT) i2 = JSON.stringify(e11.props).length;
              else if (e11.kind === t9.IMAGE) throw Error("invariant image should not be incremental-cache");
              else i2 = e11.kind === t9.FETCH ? JSON.stringify(e11.data || "").length : e11.kind === t9.APP_ROUTE ? e11.body.length : e11.kind === t9.APP_PAGE ? Math.max(1, e11.html.length + rA(e11.rscData) + ((null == (r2 = e11.postponed) ? void 0 : r2.length) || 0) + (function(e12) {
                if (!e12) return 0;
                let t12 = 0;
                for (let [r3, n3] of e12) t12 += r3.length + rA(n3);
                return t12;
              })(e11.segmentData)) : e11.html.length + ((null == (n2 = JSON.stringify(e11.pageData)) ? void 0 : n2.length) || 0);
              else i2 = 25;
              return t11.length + i2;
            })), rN.memoryCache = r;
          }
          else rN.debug && console.log("FileSystemCache: not using memory store for fetch cache");
        }
        resetRequestCache() {
        }
        getSeedReadState(e10) {
          return rN.seedReads.get(`${this.serverDistDir}:${e10}`);
        }
        beginSeedRead(e10) {
          let t10 = `${this.serverDistDir}:${e10}`, r2 = rN.seedReads.get(t10);
          return r2 || (r2 = { readers: 0, version: 0 }, rN.seedReads.set(t10, r2)), r2.readers++, { stateKey: t10, state: r2, version: r2.version };
        }
        finishSeedRead(e10, t10) {
          t10.readers--, 0 !== t10.readers || t10.promotion || rN.seedReads.delete(e10);
        }
        async revalidateTag(e10, t10) {
          if (e10 = "string" == typeof e10 ? [e10] : e10, rN.debug && console.log("FileSystemCache: revalidateTag", e10, t10), 0 === e10.length) return;
          let r2 = Date.now();
          for (let n2 of e10) {
            let e11 = rT.get(n2) || {};
            if (t10) {
              let i2 = { ...e11 };
              i2.stale = r2, void 0 !== t10.expire && (i2.expired = r2 + 1e3 * t10.expire), rT.set(n2, i2);
            } else rT.set(n2, { ...e11, expired: r2 });
          }
        }
        async get(...e10) {
          var t10, r2, n2, i2, a2, o2, s2, l2, c2, u2;
          let d2, [h2, p2] = e10, { kind: f2 } = p2, g2 = null == (t10 = rN.memoryCache) ? void 0 : t10.get(h2), m2 = null == (r2 = this.getSeedReadState(h2)) ? void 0 : r2.promotion;
          !g2 && m2 && (await m2, g2 = null == (s2 = rN.memoryCache) ? void 0 : s2.get(h2)), rN.debug && (f2 === re.FETCH ? console.log("FileSystemCache: get", h2, p2.tags, f2, !!g2) : console.log("FileSystemCache: get", h2, f2, !!g2));
          let v2 = f2 === re.PAGES || f2 === re.APP_PAGE || f2 === re.APP_ROUTE;
          if (!g2 && v2 && h2.startsWith(`/${t6}/`), (null == g2 || null == (n2 = g2.value) ? void 0 : n2.kind) === t9.APP_PAGE || (null == g2 || null == (i2 = g2.value) ? void 0 : i2.kind) === t9.APP_ROUTE || (null == g2 || null == (a2 = g2.value) ? void 0 : a2.kind) === t9.PAGES) {
            let e11 = null == (l2 = g2.value.headers) ? void 0 : l2[x];
            if ("string" == typeof e11) {
              let t11 = e11.split(",");
              if (t11.length > 0 && rE(t11, g2.lastModified)) return rN.debug && console.log("FileSystemCache: expired tags", t11), d2 && this.finishSeedRead(d2.stateKey, d2.state), null;
            }
          } else if ((null == g2 || null == (o2 = g2.value) ? void 0 : o2.kind) === t9.FETCH) {
            let e11 = p2.kind === re.FETCH ? [...p2.tags || [], ...p2.softTags || []] : [];
            if (e11.some((e12) => this.revalidatedTags.includes(e12))) return rN.debug && console.log("FileSystemCache: was revalidated", e11), null;
            if (rE(e11, g2.lastModified)) return rN.debug && console.log("FileSystemCache: expired tags", e11), null;
          }
          if (d2 && g2) {
            let { stateKey: e11, state: t11, version: r3 } = d2;
            try {
              t11.version === r3 && (await this.promoteSeed(h2, h2, g2, p2, e11, t11, r3), t11.version !== r3 || (null == (c2 = rN.memoryCache) ? void 0 : c2.get(h2)) || null == (u2 = rN.memoryCache) || u2.set(h2, g2));
            } finally {
              this.finishSeedRead(e11, t11);
            }
          }
          return g2 ?? null;
        }
        async promoteSeed(e10, t10, r2, n2, i2, a2, o2) {
          let s2 = this.fs.writeFileAtomic;
          if (!this.flushToDisk || !s2 || !r2.value) return;
          if (a2.promotion) return void await a2.promotion;
          let l2 = (async () => {
            let i3 = r2.value;
            if (!i3 || a2.version !== o2 || i3.kind !== t9.PAGES && i3.kind !== t9.APP_PAGE && i3.kind !== t9.APP_ROUTE) return;
            let l3 = n2.kind, c2 = this.getFilePath(i3.kind === t9.APP_ROUTE ? `${e10}.body` : `${e10}.html`, l3);
            if (this.fs.existsSync(c2)) return;
            let u2 = this.getFilePath(i3.kind === t9.APP_ROUTE ? `${t10}.body` : `${t10}.html`, l3), d2 = u2.replace(i3.kind === t9.APP_ROUTE ? /\.body$/ : /\.html$/, y), h2 = JSON.parse(await this.fs.readFile(d2, "utf8"));
            h2.routeCacheLastModified = r2.lastModified;
            let p2 = [];
            i3.kind !== t9.PAGES || n2.isFallback ? i3.kind === t9.APP_PAGE && (n2.isFallback || n2.isRoutePPREnabled && null != h2.postponed || p2.push({ path: this.getFilePath(`${e10}${b}`, l3), data: await this.fs.readFile(this.getFilePath(`${t10}${b}`, l3)) }), p2.push(...await Promise.all((h2.segmentPaths ?? []).map(async (r3) => ({ path: this.getFilePath(e10 + m + r3 + v, l3), data: await this.fs.readFile(this.getFilePath(t10 + m + r3 + v, l3)) }))))) : p2.push({ path: this.getFilePath(`${e10}${w}`, l3), data: await this.fs.readFile(this.getFilePath(`${t10}${w}`, l3)) });
            let f2 = new rO(this.fs);
            for (let e11 of p2) f2.append(e11.path, e11.data);
            if (await f2.wait(), a2.version !== o2) return;
            let g2 = c2.replace(i3.kind === t9.APP_ROUTE ? /\.body$/ : /\.html$/, y);
            await this.fs.mkdir(rP.default.dirname(g2)), await this.fs.writeFile(g2, JSON.stringify(h2)), a2.version !== o2 || this.fs.existsSync(c2) || await s2.call(this.fs, c2, await this.fs.readFile(u2));
          })();
          a2.promotion = l2.catch((e11) => {
            rN.debug && console.log("FileSystemCache: failed to promote build seed", e11);
          });
          try {
            await a2.promotion;
          } finally {
            a2.promotion && (a2.promotion = void 0), 0 === a2.readers && rN.seedReads.delete(i2);
          }
        }
        async set(e10, t10, r2) {
          var n2;
          let i2 = r2.fetchCache ? void 0 : r2.cacheControl, a2 = this.getSeedReadState(e10);
          if (a2 && a2.version++, null == (n2 = rN.memoryCache) || n2.set(e10, { value: t10, lastModified: Date.now(), cacheControl: i2 }), rN.debug && console.log("FileSystemCache: set", e10), !this.flushToDisk || !t10) return;
          await (null == a2 ? void 0 : a2.promotion);
          let o2 = new rO(this.fs);
          if (t10.kind === t9.APP_ROUTE) {
            let r3 = this.getFilePath(`${e10}.body`, re.APP_ROUTE);
            o2.append(r3, t10.body);
            let n3 = { headers: t10.headers, status: t10.status, postponed: void 0, segmentPaths: void 0, prefetchHints: void 0, cacheControl: i2 };
            o2.append(r3.replace(/\.body$/, y), JSON.stringify(n3, null, 2));
          } else if (t10.kind === t9.PAGES || t10.kind === t9.APP_PAGE) {
            let n3 = t10.kind === t9.APP_PAGE, a3 = this.getFilePath(`${e10}.html`, n3 ? re.APP_PAGE : re.PAGES);
            if (o2.append(a3, t10.html), r2.fetchCache || r2.isFallback || r2.isRoutePPREnabled || o2.append(this.getFilePath(`${e10}${n3 ? b : w}`, n3 ? re.APP_PAGE : re.PAGES), n3 ? t10.rscData : JSON.stringify(t10.pageData)), (null == t10 ? void 0 : t10.kind) === t9.APP_PAGE) {
              let e11;
              if (t10.segmentData) {
                e11 = [];
                let r4 = a3.replace(/\.html$/, m);
                for (let [n4, i3] of t10.segmentData) {
                  e11.push(n4);
                  let t11 = r4 + n4 + v;
                  o2.append(t11, i3);
                }
              }
              let r3 = { headers: t10.headers, status: t10.status, postponed: t10.postponed, segmentPaths: e11, prefetchHints: void 0, cacheControl: i2 };
              o2.append(a3.replace(/\.html$/, y), JSON.stringify(r3));
            } else {
              let e11 = { headers: t10.headers, status: t10.status, postponed: void 0, segmentPaths: void 0, prefetchHints: void 0 };
              o2.append(a3.replace(/\.html$/, y), JSON.stringify(e11));
            }
          } else if (t10.kind === t9.FETCH) {
            let n3 = this.getFilePath(e10, re.FETCH);
            o2.append(n3, JSON.stringify({ ...t10, tags: r2.fetchCache ? r2.tags : [] }));
          }
          await o2.wait();
        }
        getFilePath(e10, t10) {
          let r2;
          switch (t10) {
            case re.FETCH:
              r2 = rP.default.join(this.serverDistDir, "..", "cache", "fetch-cache");
              break;
            case re.PAGES:
              r2 = rP.default.join(this.serverDistDir, "pages");
              break;
            case re.IMAGE:
            case re.APP_PAGE:
            case re.APP_ROUTE:
              r2 = rP.default.join(this.serverDistDir, "app");
              break;
            default:
              throw Error(`Unexpected file path kind: ${t10}`);
          }
          (t10 === re.PAGES || t10 === re.APP_PAGE || t10 === re.APP_ROUTE) && e10.startsWith(`/${t6}/`) && (r2 = rP.default.join(this.serverDistDir, "."));
          let n2 = rP.default.join(r2, e10);
          if (!(n2.startsWith(r2 + rP.default.sep) || n2 === r2)) throw Error(`Invalid file path: ${n2}`);
          return n2;
        }
      }
      class rk {
        static #e = this.cacheControls = /* @__PURE__ */ new Map();
        constructor(e10, t10) {
          this.prerenderManifest = e10, this.locales = t10;
        }
        get(e10, t10) {
          let r2 = rk.cacheControls.get(t7(e10, t10));
          if (r2) return r2;
          let n2 = this.prerenderManifest.routes[e10];
          if (n2 && t8(e10, t10, n2, this.locales)) {
            let { initialRevalidateSeconds: e11, initialExpireSeconds: t11 } = n2;
            if (void 0 !== e11) return { revalidate: e11, expire: t11 };
          }
          let i2 = t10.kind === t3.PAGES ? $(e10, this.locales).pathname : e10, a2 = this.prerenderManifest.dynamicRoutes[i2];
          if (a2 && t8(e10, t10, a2, this.locales)) {
            let { fallbackRevalidate: e11, fallbackExpire: t11 } = a2;
            if (void 0 !== e11) return { revalidate: e11, expire: t11 };
          }
        }
        set(e10, t10) {
          rk.cacheControls.set(e10, t10);
        }
        clear() {
          rk.cacheControls.clear();
        }
      }
      function rI(e10) {
        let t10 = "buffer" in e10 ? new Uint8Array(e10.buffer, e10.byteOffset, e10.byteLength) : new Uint8Array(e10), r2 = "";
        for (let e11 of t10) r2 += e11.toString(16).padStart(2, "0");
        return r2;
      }
      async function rM(e10) {
        {
          let t10 = new TextEncoder().encode(e10);
          return rI(await crypto.subtle.digest("SHA-256", t10));
        }
      }
      e.i(67914);
      class rL {
        static #e = this.debug = !!process.env.NEXT_PRIVATE_DEBUG_CACHE;
        constructor({ fs: e10, dev: t10, flushToDisk: r2, minimalMode: n2, serverDistDir: i2, requestHeaders: a2, maxMemoryCacheSize: o2, previewProps: s2, prerenderManifest: l2, fetchCacheKeyPrefix: c2, CurCacheHandler: u2, allowedRevalidateHeaderKeys: d2, locales: h2 }) {
          var p2;
          this.locks = /* @__PURE__ */ new Map(), this.hasCustomCacheHandler = !!u2;
          let g2 = /* @__PURE__ */ Symbol.for("@next/cache-handlers"), m2 = globalThis;
          if (u2) rL.debug && console.log("IncrementalCache: using custom cache handler", u2.name);
          else {
            let t11 = m2[g2];
            (null == t11 ? void 0 : t11.FetchCache) ? (u2 = t11.FetchCache, rL.debug && console.log("IncrementalCache: using global FetchCache cache handler")) : e10 && i2 && (rL.debug && console.log("IncrementalCache: using filesystem cache handler"), u2 = rN);
          }
          process.env.__NEXT_TEST_MAX_ISR_CACHE && (o2 = parseInt(process.env.__NEXT_TEST_MAX_ISR_CACHE, 10)), this.dev = t10, this.disableForTestmode = "true" === process.env.NEXT_PRIVATE_TEST_PROXY, this.minimalMode = n2, this.requestHeaders = a2, this.allowedRevalidateHeaderKeys = d2, this.previewProps = s2, this.prerenderManifest = l2, this.locales = h2, this.cacheControls = new rk(this.prerenderManifest, h2), this.fetchCacheKeyPrefix = c2;
          let v2 = [];
          a2[f] === this.previewProps.previewModeId && (this.isOnDemandRevalidate = true), n2 && (v2 = this.revalidatedTags = (p2 = this.previewProps.previewModeId, "string" == typeof a2[_] && a2["x-next-revalidate-tag-token"] === p2 ? a2[_].split(",") : [])), u2 && (this.cacheHandler = new u2({ dev: t10, fs: e10, flushToDisk: r2, serverDistDir: i2, revalidatedTags: v2, maxMemoryCacheSize: o2, _requestHeaders: a2, fetchCacheKeyPrefix: c2 }));
        }
        calculateRevalidate(e10, t10, r2, n2) {
          if (r2) return Math.floor(performance.timeOrigin + performance.now() - 1e3);
          let i2 = e10 ? e10.revalidate : !n2 && 1;
          return "number" == typeof i2 ? 1e3 * i2 + t10 : i2;
        }
        resetRequestCache() {
          var e10, t10;
          null == (t10 = this.cacheHandler) || null == (e10 = t10.resetRequestCache) || e10.call(t10);
        }
        async lock(e10) {
          for (; ; ) {
            let t11 = this.locks.get(e10);
            if (rL.debug && console.log("IncrementalCache: lock get", e10, !!t11), !t11) break;
            await t11;
          }
          let { resolve: t10, promise: r2 } = rt();
          return rL.debug && console.log("IncrementalCache: successfully locked", e10), this.locks.set(e10, r2), () => {
            t10(), this.locks.delete(e10);
          };
        }
        async revalidateTag(e10, t10) {
          var r2;
          return null == (r2 = this.cacheHandler) ? void 0 : r2.revalidateTag(e10, t10);
        }
        async generateSimpleCacheKey(e10) {
          return rM(JSON.stringify(["v4", this.fetchCacheKeyPrefix || "", e10]));
        }
        async generateCacheKey(e10, t10 = {}) {
          let r2 = [], n2 = new TextEncoder(), i2 = null, a2 = t10.body;
          if (a2) if ("object" == typeof a2 && "byteLength" in a2) r2.push(`bytes:${rI(a2)}`), t10._ogBody = a2;
          else if ("function" == typeof a2.getReader) {
            let e11 = [];
            try {
              await a2.pipeTo(new WritableStream({ write(t11) {
                e11.push("string" == typeof t11 ? n2.encode(t11) : t11);
              } }));
              let i3 = e11.reduce((e12, t11) => e12 + t11.length, 0), o3 = new Uint8Array(i3), s2 = 0;
              for (let t11 of e11) o3.set(t11, s2), s2 += t11.length;
              r2.push(`bytes:${rI(o3)}`), t10._ogBody = o3;
            } catch (e12) {
              console.error("Problem reading body", e12);
            }
          } else if ("function" == typeof a2.keys) for (let [e11, n3] of (i2 = "[object FormData]" === String(a2) ? "multipart/form-data; boundary=" : "application/x-www-form-urlencoded;charset=UTF-8", t10._ogBody = a2, a2.entries())) r2.push(`key:${e11}`), "string" == typeof n3 ? r2.push(`str:${n3}`) : r2.push("file", n3.name, n3.type, `bytes:${rI(await n3.arrayBuffer())}`);
          else if ("function" == typeof a2.arrayBuffer) {
            let e11 = await a2.arrayBuffer();
            r2.push("blob", a2.type, `bytes:${rI(e11)}`), t10._ogBody = new Blob([e11], { type: a2.type }), i2 = a2.type;
          } else if ("string" == typeof a2) r2.push(`str:${a2}`), t10._ogBody = a2, i2 = "text/plain;charset=UTF-8";
          else throw Error(`Unsupported body type: ${typeof a2}`);
          let o2 = "function" == typeof (t10.headers || {}).keys ? Object.fromEntries(t10.headers) : Object.assign({}, t10.headers);
          return "traceparent" in o2 && delete o2.traceparent, "tracestate" in o2 && delete o2.tracestate, rM(JSON.stringify(["v4", this.fetchCacheKeyPrefix || "", e10, t10.method, i2, o2, t10.mode, t10.redirect, t10.credentials, t10.referrer, t10.referrerPolicy, t10.integrity, t10.cache, r2]));
        }
        async get(e10, t10) {
          var r2, n2, i2, a2, o2, s2, l2;
          let c2, u2;
          if (t10.kind === re.IMAGE) throw new tm("Images must use the image optimizer cache");
          if (t10.kind === re.FETCH) {
            let r3 = tp.getStore(), n3 = r3 ? tf(r3) : null;
            if (n3) {
              let r4 = n3.fetch.get(e10);
              if ((null == r4 ? void 0 : r4.kind) === t9.FETCH) {
                let n4 = ek.getStore();
                if (![...t10.tags || [], ...t10.softTags || []].some((e11) => {
                  var t11, r5;
                  return (null == (t11 = this.revalidatedTags) ? void 0 : t11.includes(e11)) || (null == n4 || null == (r5 = n4.pendingRevalidatedTags) ? void 0 : r5.some((t12) => t12.tag === e11));
                })) return rL.debug && console.log("IncrementalCache: rdc:hit", e10), { isStale: false, value: r4 };
                rL.debug && console.log("IncrementalCache: rdc:revalidated-tag", e10);
              } else rL.debug && console.log("IncrementalCache: rdc:miss", e10);
            } else rL.debug && console.log("IncrementalCache: rdc:no-resume-data");
          }
          if (this.disableForTestmode || this.dev && (t10.kind !== re.FETCH || "no-cache" === this.requestHeaders["cache-control"])) return null;
          let d2 = e10, h2 = t10;
          if (t10.kind !== re.FETCH) {
            let { route: r3, ...n3 } = t10;
            d2 = t7(e10, r3), h2 = n3;
          }
          let p2 = await (null == (r2 = this.cacheHandler) ? void 0 : r2.get(d2, h2));
          if (t10.kind === re.FETCH) {
            if (!p2) return null;
            if ((null == (i2 = p2.value) ? void 0 : i2.kind) !== t9.FETCH) throw new tm(`Expected cached value for cache key ${JSON.stringify(e10)} to be a "FETCH" kind, got ${JSON.stringify(null == (a2 = p2.value) ? void 0 : a2.kind)} instead.`);
            let r3 = ek.getStore(), n3 = [...t10.tags || [], ...t10.softTags || []];
            if (n3.some((e11) => {
              var t11, n4;
              return (null == (t11 = this.revalidatedTags) ? void 0 : t11.includes(e11)) || (null == r3 || null == (n4 = r3.pendingRevalidatedTags) ? void 0 : n4.some((t12) => t12.tag === e11));
            })) return rL.debug && console.log("IncrementalCache: expired tag", e10), null;
            let o3 = tp.getStore();
            if (o3) {
              let t11 = tf(o3);
              (null == t11 ? void 0 : t11.mutable) && (rL.debug && console.log("IncrementalCache: rdc:set", e10), t11.fetch.set(e10, p2.value));
            }
            let s3 = t10.revalidate || p2.value.revalidate, l3 = (performance.timeOrigin + performance.now() - (p2.lastModified || 0)) / 1e3 > s3, c3 = p2.value.data;
            return rE(n3, p2.lastModified) ? null : (rR(n3, p2.lastModified) && (l3 = true), { isStale: l3, value: { kind: t9.FETCH, data: c3, revalidate: s3 } });
          }
          if ((null == p2 || null == (n2 = p2.value) ? void 0 : n2.kind) === t9.FETCH) throw new tm(`Expected cached value for cache key ${JSON.stringify(e10)} not to be a ${JSON.stringify(t10.kind)} kind, got "FETCH" instead.`);
          let f2 = null, { isFallback: g2 } = t10, m2 = this.cacheControls.get(e10, t10.route);
          if ((null == p2 ? void 0 : p2.cacheControl) && (m2 = p2.cacheControl, this.cacheControls.set(d2, m2)), (null == p2 ? void 0 : p2.lastModified) === -1) c2 = -1, u2 = -31536e6;
          else {
            let e11 = performance.timeOrigin + performance.now(), r3 = (null == p2 ? void 0 : p2.lastModified) || e11;
            u2 = this.calculateRevalidate(m2, r3, this.dev ?? false, t10.isFallback);
            let n3 = "number" == typeof (null == m2 ? void 0 : m2.expire) ? 1e3 * m2.expire + r3 : void 0;
            if (void 0 !== n3 && n3 < e11) c2 = -1;
            else if (void 0 === (c2 = false !== u2 && u2 < e11 || void 0) && ((null == p2 || null == (o2 = p2.value) ? void 0 : o2.kind) === t9.APP_PAGE || (null == p2 || null == (s2 = p2.value) ? void 0 : s2.kind) === t9.APP_ROUTE)) {
              let e12 = null == (l2 = p2.value.headers) ? void 0 : l2[x];
              if ("string" == typeof e12) {
                let t11 = e12.split(",");
                t11.length > 0 && (rE(t11, r3) ? c2 = -1 : rR(t11, r3) && (c2 = true));
              }
            }
          }
          return p2 && (f2 = { isStale: c2, cacheControl: m2, revalidateAfter: u2, value: p2.value, isFallback: g2 }), !p2 && this.prerenderManifest.notFoundRoutes.includes(e10) && t8(e10, t10.route, this.prerenderManifest.routes[e10], this.locales) && (f2 = { isStale: c2, value: null, cacheControl: m2, revalidateAfter: u2, isFallback: g2 }, this.set(e10, f2.value, { ...t10, cacheControl: m2 })), f2;
        }
        async set(e10, t10, r2) {
          if ("kind" in r2 && r2.kind === re.IMAGE) throw new tm("Images must use the image optimizer cache");
          if ((null == t10 ? void 0 : t10.kind) === t9.FETCH) {
            let r3 = tp.getStore(), n3 = r3 ? tf(r3) : null;
            (null == n3 ? void 0 : n3.mutable) && (rL.debug && console.log("IncrementalCache: rdc:set", e10), n3.fetch.set(e10, t10));
          }
          if (this.disableForTestmode || this.dev && !r2.fetchCache) return;
          let n2 = e10, i2 = r2;
          if (!r2.fetchCache) {
            let { route: t11, ...a3 } = r2;
            if (!t11) throw new tm("Response cache requires a source route");
            n2 = t7(e10, t11), i2 = a3;
          }
          let a2 = JSON.stringify(t10).length;
          if (r2.fetchCache && a2 > 2097152 && !this.hasCustomCacheHandler && !r2.isImplicitBuildTimeCache) {
            let t11 = `Failed to set Next.js data cache for ${r2.fetchUrl || e10}, items over 2MB can not be cached (${a2} bytes)`;
            if (this.dev) throw Error(t11);
            console.warn(t11);
            return;
          }
          try {
            var o2;
            !r2.fetchCache && r2.cacheControl && this.cacheControls.set(n2, r2.cacheControl), await (null == (o2 = this.cacheHandler) ? void 0 : o2.set(n2, t10, i2));
          } catch (t11) {
            console.warn("Failed to update prerender cache for", e10, t11);
          }
        }
      }
      e.i(64445);
      var rj = ((eu = {})[eu.Before = 1] = "Before", eu[eu.ShellStatic = 10] = "ShellStatic", eu[eu.PrefetchStatic_prefetchApi = 11] = "PrefetchStatic_prefetchApi", eu[eu.PrefetchStatic = 12] = "PrefetchStatic", eu[eu.NavigationStatic = 13] = "NavigationStatic", eu[eu.Static = 14] = "Static", eu[eu.ShellRuntime = 20] = "ShellRuntime", eu[eu.PrefetchRuntime_prefetchApi = 21] = "PrefetchRuntime_prefetchApi", eu[eu.PrefetchRuntime = 22] = "PrefetchRuntime", eu[eu.NavigationRuntime = 23] = "NavigationRuntime", eu[eu.Dynamic = 30] = "Dynamic", eu[eu.Abandoned = 40] = "Abandoned", eu);
      function rD() {
      }
      /* @__PURE__ */ new WeakMap(), process.env.NEXT_PRIVATE_DEBUG_RUNTIME_DATA, process.env.NEXT_PRIVATE_DEBUG_RUNTIME_DATA;
      class rU extends Promise {
        #r;
        static get [Symbol.species]() {
          return Promise;
        }
        static from(e10, t10) {
          let r2 = new rU(e10.then.bind(e10));
          return r2.#r = t10, Promise.prototype.then.call(r2, void 0, rD), r2;
        }
        then(e10, t10) {
          let r2 = this.#r;
          if (r2) try {
            r2();
          } catch (e11) {
            console.error(e11);
          }
          return Promise.prototype.then.call(this, e10, t10);
        }
        constructor(...e10) {
          super(...e10), this.#r = null;
        }
      }
      rj.ShellRuntime, rj.PrefetchStatic_prefetchApi, rj.PrefetchRuntime_prefetchApi, rj.PrefetchStatic, rj.PrefetchRuntime, rj.PrefetchRuntime, eN("action-async-storage"), e.s(["config", 0, { matcher: ["/", "/dashboard/:path*", "/admin/:path*", "/login", "/register"] }, "middleware", 0, function(e10) {
        let t10 = e10.cookies.get("auth_session"), { pathname: r2 } = e10.nextUrl;
        if ("/" === r2) return t10 ? ew.redirect(new URL("/dashboard", e10.url)) : ew.redirect(new URL("/login", e10.url));
        let n2 = r2.startsWith("/dashboard") || r2.startsWith("/admin"), i2 = "/login" === r2 || "/register" === r2;
        if (n2 && !t10) {
          let t11 = new URL("/login", e10.url);
          return t11.searchParams.set("redirect", r2), ew.redirect(t11);
        }
        return i2 && t10 ? ew.redirect(new URL("/dashboard", e10.url)) : ew.next();
      }], 99446);
      let r$ = { ...e.i(99446) }, rq = "/middleware", rB = r$.middleware || r$.default;
      if ("function" != typeof rB) throw new class extends Error {
        constructor(e10) {
          super(e10), this.stack = "";
        }
      }(`The Middleware file "${rq}" must export a function named \`middleware\` or a default function.`);
      let rF = async (e10) => {
        let t10, r2;
        try {
          return await tY({ ...e10, IncrementalCache: rL, incrementalCacheHandler: null, page: rq, handler: async (...e11) => {
            try {
              return await rB(...e11);
            } catch (i2) {
              let t11 = e11[0], r3 = new URL(t11.url), n2 = r3.pathname + r3.search;
              throw await s(i2, { path: n2, method: t11.method, headers: Object.fromEntries(t11.headers.entries()) }, { routerKind: "Pages Router", routePath: "/proxy", routeType: "proxy", revalidateReason: void 0 }), i2;
            }
          }, emitInstrumentationSpans: t10, requestStartTime: r2 });
        } catch (e11) {
          try {
            null == t10 || t10();
          } catch {
          }
          throw e11;
        }
      };
      async function rH(e10, t10) {
        let r2 = await rF({ request: { url: e10.url, method: e10.method, headers: T(e10.headers), nextConfig: { basePath: "", i18n: "", trailingSlash: false, experimental: { cacheLife: { default: { stale: 300, revalidate: 900, expire: 4294967294 }, seconds: { stale: 30, revalidate: 1, expire: 60 }, minutes: { stale: 300, revalidate: 60, expire: 3600 }, hours: { stale: 300, revalidate: 3600, expire: 86400 }, days: { stale: 300, revalidate: 86400, expire: 604800 }, weeks: { stale: 300, revalidate: 604800, expire: 2592e3 }, max: { stale: 300, revalidate: 2592e3, expire: 31536e3 } }, authInterrupts: false, clientParamParsingOrigins: [] } }, page: { name: rq }, body: "GET" !== e10.method && "HEAD" !== e10.method ? e10.body ?? void 0 : void 0, waitUntil: t10.waitUntil, requestMeta: t10.requestMeta, signal: t10.signal || new AbortController().signal } });
        return null == t10.waitUntil || t10.waitUntil.call(t10, r2.waitUntil), r2.response;
      }
      e.s(["default", 0, rF, "handler", 0, rH], 42738);
    }, 68886, (e, t, r) => {
      t.exports = e.r(54846);
    }, 25085, (e, t, r) => {
      "use strict";
      Object.defineProperty(r, "__esModule", { value: true });
      var n = { getTestReqInfo: function() {
        return l;
      }, withRequest: function() {
        return s;
      } };
      for (var i in n) Object.defineProperty(r, i, { enumerable: true, get: n[i] });
      let a = new (e.r(78500)).AsyncLocalStorage();
      function o(e2, t2) {
        let r2 = t2.header(e2, "next-test-proxy-port");
        if (!r2) return;
        let n2 = t2.url(e2);
        return { url: n2, proxyPort: Number(r2), testData: t2.header(e2, "next-test-data") || "" };
      }
      function s(e2, t2, r2) {
        let n2 = o(e2, t2);
        return n2 ? a.run(n2, r2) : r2();
      }
      function l(e2, t2) {
        let r2 = a.getStore();
        return r2 || (e2 && t2 ? o(e2, t2) : void 0);
      }
    }, 28325, (e, t, r) => {
      "use strict";
      var n = e.i(51615);
      Object.defineProperty(r, "__esModule", { value: true });
      var i = { handleFetch: function() {
        return u;
      }, interceptFetch: function() {
        return d;
      }, reader: function() {
        return s;
      } };
      for (var a in i) Object.defineProperty(r, a, { enumerable: true, get: i[a] });
      let o = e.r(25085), s = { url: (e2) => e2.url, header: (e2, t2) => e2.headers.get(t2) };
      async function l(e2, t2) {
        let { url: r2, method: i2, headers: a2, body: o2, cache: s2, credentials: l2, integrity: c2, mode: u2, redirect: d2, referrer: h, referrerPolicy: p } = t2;
        return { testData: e2, api: "fetch", request: { url: r2, method: i2, headers: [...Array.from(a2), ["next-test-stack", (function() {
          let e3 = (Error().stack ?? "").split("\n");
          for (let t3 = 1; t3 < e3.length; t3++) if (e3[t3].length > 0) {
            e3 = e3.slice(t3);
            break;
          }
          return (e3 = (e3 = (e3 = e3.filter((e4) => !e4.includes("/next/dist/"))).slice(0, 5)).map((e4) => e4.replace("webpack-internal:///(rsc)/", "").trim())).join("    ");
        })()]], body: o2 ? n.Buffer.from(await t2.arrayBuffer()).toString("base64") : null, cache: s2, credentials: l2, integrity: c2, mode: u2, redirect: d2, referrer: h, referrerPolicy: p } };
      }
      function c(e2, t2) {
        return t2.headers.set("next-test-internal", "1"), e2(t2);
      }
      async function u(e2, t2) {
        let r2 = (0, o.getTestReqInfo)(t2, s);
        if (!r2) return c(e2, t2);
        let { testData: i2, proxyPort: a2 } = r2, u2 = await l(i2, t2), d2 = await e2(`http://localhost:${a2}`, { method: "POST", body: JSON.stringify(u2), headers: { "next-test-internal": "1" }, next: { internal: true } });
        if (!d2.ok) throw Error(`Proxy request failed: ${d2.status}`);
        let h = await d2.json(), { api: p } = h;
        switch (p) {
          case "continue":
            return c(e2, t2);
          case "abort":
          case "unhandled":
            throw Error(`Proxy request aborted [${t2.method} ${t2.url}]`);
          case "fetch":
            return (function(e3) {
              let { status: t3, headers: r3, body: i3 } = e3.response;
              return new Response(i3 ? n.Buffer.from(i3, "base64") : null, { status: t3, headers: new Headers(r3) });
            })(h);
          default:
            return p;
        }
      }
      function d(t2) {
        return e.g.fetch = function(e2, r2) {
          var n2;
          return (null == r2 || null == (n2 = r2.next) ? void 0 : n2.internal) ? t2(e2, r2) : u(t2, new Request(e2, r2));
        }, () => {
          e.g.fetch = t2;
        };
      }
    }, 94165, (e, t, r) => {
      "use strict";
      Object.defineProperty(r, "__esModule", { value: true });
      var n = { interceptTestApis: function() {
        return s;
      }, wrapRequestHandler: function() {
        return l;
      } };
      for (var i in n) Object.defineProperty(r, i, { enumerable: true, get: n[i] });
      let a = e.r(25085), o = e.r(28325);
      function s() {
        return (0, o.interceptFetch)(e.g.fetch);
      }
      function l(e2) {
        return (t2, r2) => (0, a.withRequest)(t2, o.reader, () => e2(t2, r2));
      }
    }]);
  }
});

// .next/server/edge/chunks/turbopack-node_modules_next_dist_esm_build_templates_edge-wrapper_1zwm8yfsvxzxn.js
var require_turbopack_node_modules_next_dist_esm_build_templates_edge_wrapper_1zwm8yfsvxzxn = __commonJS({
  ".next/server/edge/chunks/turbopack-node_modules_next_dist_esm_build_templates_edge-wrapper_1zwm8yfsvxzxn.js"() {
    "use strict";
    (globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/turbopack-node_modules_next_dist_esm_build_templates_edge-wrapper_1zwm8yfsvxzxn.js", { otherChunks: ["chunks/node_modules_next_dist_esm_build_templates_edge-wrapper_0h-u1c1sve-7_.js", "chunks/[root-of-the-server]__0ns4mr-xgqen9._.js"], runtimeModuleIds: [38022] }]), (() => {
      let e;
      var t, r = globalThis.TURBOPACK;
      if (void 0 === r) r = [];
      else if (!Array.isArray(r)) return;
      var n = ((t = n || {})[t.Runtime = 0] = "Runtime", t[t.Parent = 1] = "Parent", t[t.Update = 2] = "Update", t);
      let o = /* @__PURE__ */ new WeakMap();
      function l(e2, t2) {
        this.m = e2, this.e = t2;
      }
      let u = l.prototype, i = Object.prototype.hasOwnProperty, a = "u" > typeof Symbol && Symbol.toStringTag;
      function s(e2, t2, r2) {
        i.call(e2, t2) || Object.defineProperty(e2, t2, r2);
      }
      function f(e2, t2) {
        let r2 = e2.get(t2);
        return void 0 === r2 && (r2 = c(t2), e2.set(t2, r2)), r2;
      }
      function c(e2) {
        return { exports: {}, error: void 0, id: e2, namespaceObject: void 0 };
      }
      function d(e2, t2, r2) {
        s(e2, "__esModule", { value: true }), a && s(e2, a, { value: "Module" });
        let n2 = 0;
        for (; n2 < t2.length; ) {
          let r3 = t2[n2++], o2 = t2[n2++];
          if ("number" == typeof o2) if (0 === o2) s(e2, r3, { value: t2[n2++], enumerable: true, writable: false });
          else throw Error(`unexpected tag: ${o2}`);
          else "function" == typeof t2[n2] ? s(e2, r3, { get: o2, set: t2[n2++], enumerable: true }) : s(e2, r3, { get: o2, enumerable: true });
        }
        r2 || Object.seal(e2);
      }
      function p(e2, t2, r2) {
        let n2, o2;
        null != t2 ? o2 = (n2 = f(this.c, t2)).exports : (n2 = this.m, o2 = this.e), n2.namespaceObject = o2, d(o2, e2, r2);
      }
      function h(e2, t2, r2, n2) {
        let o2 = Reflect.getOwnPropertyDescriptor(r2, n2);
        if (o2) {
          if ("value" in o2) return void e2.push(t2, 0, o2.value);
          if (o2.get) return void e2.push(t2, o2.get);
        }
        e2.push(t2, () => r2[n2]);
      }
      function m(e2, t2) {
        (null != t2 ? f(this.c, t2) : this.m).exports = e2;
      }
      u.s = p, u.S = function(e2, t2) {
        let r2 = [], n2 = 0;
        for (; n2 < e2.length; ) {
          let t3 = e2[n2++], o2 = n2;
          for (; n2 < e2.length && 0 !== e2[n2]; ) n2++;
          let l2 = n2;
          n2++;
          let u2 = "string" == typeof t3 || "number" == typeof t3 ? w.call(this, t3) : t3;
          if (l2 - o2 == 1) {
            let t4 = e2[o2].split(",");
            for (let e3 = 0; e3 < t4.length; e3 += 2) h(r2, t4[e3], u2, t4[e3 + 1]);
          } else for (let t4 = o2; t4 < l2; t4 += 2) h(r2, e2[t4], u2, e2[t4 + 1]);
        }
        p.call(this, r2, t2);
      }, u.j = function(e2, t2) {
        let r2, n2;
        null != t2 ? n2 = (r2 = f(this.c, t2)).exports : (r2 = this.m, n2 = this.e);
        let l2 = (function(e3, t3) {
          let r3 = o.get(e3);
          if (!r3) {
            o.set(e3, r3 = []);
            let n3 = (e4) => {
              if ("default" !== e4) {
                for (let t4 of r3) if (i.call(t4, e4)) return t4;
              }
            };
            e3.exports = e3.namespaceObject = new Proxy(t3, { get(e4, t4) {
              if (i.call(e4, t4) || "default" === t4 || "__esModule" === t4) return Reflect.get(e4, t4);
              let r4 = n3(t4);
              return r4 && Reflect.get(r4, t4);
            }, set: () => false, defineProperty: () => false, deleteProperty: () => false, has: (e4, t4) => !!Reflect.has(e4, t4) || "default" !== t4 && "__esModule" !== t4 && void 0 !== n3(t4), ownKeys(e4) {
              let t4 = Reflect.ownKeys(e4);
              for (let e5 of r3) for (let r4 of Reflect.ownKeys(e5)) "default" === r4 || t4.includes(r4) || t4.push(r4);
              return t4;
            }, getOwnPropertyDescriptor(e4, t4) {
              let r4 = Reflect.getOwnPropertyDescriptor(e4, t4);
              if (r4 || "default" === t4 || "__esModule" === t4) return r4;
              let o2 = n3(t4);
              if (o2) return { enumerable: true, configurable: true, get: () => Reflect.get(o2, t4) };
            } });
          }
          return r3;
        })(r2, n2);
        "object" == typeof e2 && null !== e2 && l2.push(e2);
      }, u.v = m, u.n = function(e2, t2) {
        let r2;
        (r2 = null != t2 ? f(this.c, t2) : this.m).exports = r2.namespaceObject = e2;
      };
      let g = Object.getPrototypeOf ? (e2) => Object.getPrototypeOf(e2) : (e2) => e2.__proto__, y = [null, g({}), g([]), g(g)];
      function b(e2, t2, r2) {
        let n2 = [], o2 = -1;
        for (let t3 = e2; ("object" == typeof t3 || "function" == typeof t3) && !y.includes(t3); t3 = g(t3)) for (let r3 of Object.getOwnPropertyNames(t3)) n2.push(r3, /* @__PURE__ */ (function(e3, t4) {
          return () => e3[t4];
        })(e2, r3)), -1 === o2 && "default" === r3 && (o2 = n2.length - 1);
        return r2 && o2 >= 0 || (o2 >= 0 ? n2.splice(o2, 1, 0, e2) : n2.push("default", 0, e2)), d(t2, n2), t2;
      }
      function _(e2) {
        return "function" == typeof e2 ? function(...t2) {
          return e2.apply(this, t2);
        } : /* @__PURE__ */ Object.create(null);
      }
      function w(e2) {
        let t2 = q(e2, this.m);
        if (t2.namespaceObject) return t2.namespaceObject;
        let r2 = t2.exports;
        return t2.namespaceObject = b(r2, _(r2), r2 && r2.__esModule);
      }
      function O(e2) {
        let t2 = e2.indexOf("#");
        -1 !== t2 && (e2 = e2.substring(0, t2));
        let r2 = e2.indexOf("?");
        return -1 !== r2 && (e2 = e2.substring(0, r2)), e2;
      }
      function k(e2) {
        return "string" == typeof e2 ? e2 : e2.path;
      }
      u.i = w, u.A = function(e2) {
        return this.r(e2)(w.bind(this));
      }, u.t = "function" == typeof __require ? __require : function() {
        throw Error("Unexpected use of runtime require");
      }, u.r = function(e2) {
        return q(e2, this.m).exports;
      }, u.f = function(e2) {
        function t2(t3) {
          if (t3 = O(t3), i.call(e2, t3)) return e2[t3].module();
          let r2 = Error(`Cannot find module '${t3}'`);
          throw r2.code = "MODULE_NOT_FOUND", r2;
        }
        return t2.keys = () => Object.keys(e2), t2.resolve = (t3) => {
          if (t3 = O(t3), i.call(e2, t3)) return e2[t3].id();
          let r2 = Error(`Cannot find module '${t3}'`);
          throw r2.code = "MODULE_NOT_FOUND", r2;
        }, t2.import = async (e3) => await t2(e3), t2;
      };
      let v = function(e2) {
        let t2 = new URL(e2, "x:/"), r2 = {};
        for (let e3 in t2) r2[e3] = t2[e3];
        for (let t3 in r2.href = e2, r2.pathname = e2.replace(/[?#].*/, ""), r2.origin = r2.protocol = "", r2.toString = r2.toJSON = (...t4) => e2, r2) Object.defineProperty(this, t3, { enumerable: true, configurable: true, value: r2[t3] });
      };
      function P(e2, t2) {
        throw Error(`Invariant: ${t2(e2)}`);
      }
      v.prototype = URL.prototype, u.U = v, u.z = function(e2) {
        throw Error("dynamic usage of require is not supported");
      }, u.g = globalThis;
      let R = l.prototype, C = "string" == typeof TURBOPACK_CHUNK_BASE_PATH ? TURBOPACK_CHUNK_BASE_PATH : "", U = /* @__PURE__ */ new Map();
      u.M = U;
      let j = /* @__PURE__ */ new Map(), x = /* @__PURE__ */ new Map(), M = /* @__PURE__ */ new Map();
      async function $(e2, t2, r2) {
        let n2;
        if ("string" == typeof r2) return (function(e3, t3, r3) {
          return A(e3, t3, r3);
        })(e2, t2, S(r2));
        let o2 = r2.included || [], l2 = o2.map((e3) => !!U.has(e3) || j.get(e3));
        if (l2.length > 0 && l2.every((e3) => e3)) return void await Promise.all(l2);
        for (let l3 of (n2 = A(e2, t2, S(r2.path)), o2)) j.has(l3) || j.set(l3, n2);
        await n2;
      }
      R.l = function(e2) {
        return $(n.Parent, this.m.id, e2);
      };
      let E = Promise.resolve(void 0), T = /* @__PURE__ */ new WeakMap();
      function A(t2, r2, o2) {
        let l2 = e.loadChunkCached(t2, o2), u2 = T.get(l2);
        if (void 0 === u2) {
          let e2 = T.set.bind(T, l2, E);
          u2 = l2.then(e2).catch((e3) => {
            let l3;
            switch (t2) {
              case n.Runtime:
                l3 = `as a runtime dependency of chunk ${r2}`;
                break;
              case n.Parent:
                l3 = `from module ${r2}`;
                break;
              case n.Update:
                l3 = "from an HMR update";
                break;
              default:
                P(t2, (e4) => `Unknown source type: ${e4}`);
            }
            let u3 = Error(`Failed to load chunk ${o2} ${l3}${e3 ? `: ${e3}` : ""}`, e3 ? { cause: e3 } : void 0);
            throw u3.name = "ChunkLoadError", u3;
          }), T.set(l2, u2);
        }
        return u2;
      }
      R.L = function(e2) {
        var t2, r2;
        return t2 = n.Parent, r2 = this.m.id, A(t2, r2, e2);
      };
      R.R = function(e2) {
        let t2 = this.r(e2);
        return t2?.default ?? t2;
      }, R.P = function(e2) {
        return `/ROOT/${e2 ?? ""}`;
      }, R.F = function(e2, t2) {
        return `file:///${encodeURIComponent(t2 ?? "ROOT")}/${e2.split("/").map(encodeURIComponent).join("/")}`;
      }, R.q = function(e2, t2) {
        m.call(this, `${e2}`, t2);
      };
      let K = /[^A-Za-z0-9\-_.!~*'()/]/;
      function S(e2, t2 = C) {
        let r2 = K.test(e2) ? e2.split("/").map(encodeURIComponent).join("/") : e2;
        return `${t2}${r2}`;
      }
      R.b = C, R.X = "", R.h = S;
      let N = /* @__PURE__ */ new Map();
      u.c = N;
      let q = (e2, t2) => {
        let r2 = N.get(e2);
        if (r2) {
          if (r2.error) throw r2.error;
          return r2;
        }
        return B(e2, n.Parent, t2.id);
      };
      function B(e2, t2, r2) {
        let n2 = U.get(e2);
        if ("function" != typeof n2) throw Error((function(e3, t3, r3) {
          let n3;
          switch (t3) {
            case 0:
              n3 = `as a runtime entry of chunk ${r3}`;
              break;
            case 1:
              n3 = `because it was required from module ${r3}`;
              break;
            case 2:
              n3 = "because of an HMR update";
              break;
            default:
              P(t3, (e4) => `Unknown source type: ${e4}`);
          }
          return `Module ${e3} was instantiated ${n3}, but the module factory is not available.`;
        })(e2, t2, r2));
        let o2 = c(e2), u2 = o2.exports;
        N.set(e2, o2);
        let i2 = new l(o2, u2);
        try {
          n2(i2, o2, u2);
        } catch (e3) {
          throw o2.error = e3, e3;
        }
        return o2.namespaceObject && o2.exports !== o2.namespaceObject && b(o2.exports, o2.namespaceObject), o2;
      }
      function I(t2) {
        let r2;
        if (!Array.isArray(t2)) return e.registerChunk(void 0, t2);
        let n2 = (function(e2) {
          if ("string" == typeof e2) return e2;
          if (e2) return { src: e2.getAttribute("src") };
          if ("u" > typeof TURBOPACK_NEXT_CHUNK_URLS) return { src: TURBOPACK_NEXT_CHUNK_URLS.pop() };
          throw Error("chunk path empty but not in a worker");
        })(t2[0]);
        return 2 === t2.length ? r2 = t2[1] : (r2 = void 0, !(function(e2, t3) {
          let r3 = 1;
          for (; r3 < e2.length; ) {
            let n3, o2 = r3 + 1;
            for (; o2 < e2.length && "function" != typeof e2[o2]; ) o2++;
            if (o2 === e2.length) throw Error("malformed chunk format, expected a factory function");
            let l2 = e2[o2];
            for (let l3 = r3; l3 < o2; l3++) {
              let r4 = e2[l3], o3 = t3.get(r4);
              if (o3) {
                n3 = o3;
                break;
              }
            }
            let u2 = n3 ?? l2, i2 = false;
            for (let n4 = r3; n4 < o2; n4++) {
              let r4 = e2[n4];
              t3.has(r4) || (i2 || (u2 === l2 && Object.defineProperty(l2, "name", { value: "module evaluation" }), i2 = true), t3.set(r4, u2));
            }
            r3 = o2 + 1;
          }
        })(t2, U)), e.registerChunk(n2, r2);
      }
      function H(e2, t2, r2 = false) {
        let n2;
        try {
          n2 = t2();
        } catch (t3) {
          throw Error(`Failed to load external module ${e2}: ${t3}`);
        }
        return !r2 || n2.__esModule ? n2 : b(n2, _(n2), true);
      }
      u.y = async function(e2) {
        let t2;
        try {
          t2 = await import(e2);
        } catch (t3) {
          throw Error(`Failed to load external module ${e2}: ${t3}`);
        }
        return t2 && t2.__esModule && t2.default && "default" in t2.default ? b(t2.default, _(t2), true) : t2;
      }, H.resolve = (e2, t2) => __require.resolve(e2, t2), u.x = H, e = { registerChunk(e2, t2) {
        if (null == e2) throw Error("inline entry registration is not supported");
        let r2 = (function(e3) {
          if ("string" == typeof e3) return e3;
          let t3 = decodeURIComponent(e3.src.replace(/[?#].*$/, ""));
          return t3.startsWith(C) ? t3.slice(C.length) : t3;
        })(e2);
        L.add(r2), (function(e3) {
          let t3 = D.get(e3);
          if (null != t3) {
            for (let r3 of t3) r3.requiredChunks.delete(e3), 0 === r3.requiredChunks.size && z(r3.runtimeModuleIds, r3.chunkPath);
            D.delete(e3);
          }
        })(r2), null != t2 && (0 === t2.otherChunks.length ? z(t2.runtimeModuleIds, r2) : (function(e3, t3, r3) {
          let n2 = /* @__PURE__ */ new Set(), o2 = { runtimeModuleIds: r3, chunkPath: e3, requiredChunks: n2 };
          for (let e4 of t3) {
            let t4 = k(e4);
            if (L.has(t4)) continue;
            n2.add(t4);
            let r4 = D.get(t4);
            null == r4 && (r4 = /* @__PURE__ */ new Set(), D.set(t4, r4)), r4.add(o2);
          }
          0 === o2.requiredChunks.size && z(o2.runtimeModuleIds, o2.chunkPath);
        })(r2, t2.otherChunks.filter((e3) => (function(e4) {
          let t3, r3 = e4.indexOf("?");
          if (-1 !== r3) t3 = r3;
          else {
            let r4 = e4.indexOf("#");
            t3 = -1 !== r4 ? r4 : e4.length;
          }
          return t3 >= 3 && e4.startsWith(".js", t3 - 3);
        })(k(e3))), t2.runtimeModuleIds));
      }, loadChunkCached(e2, t2) {
        throw Error("chunk loading is not supported");
      } };
      let L = /* @__PURE__ */ new Set(), D = /* @__PURE__ */ new Map();
      function z(e2, t2) {
        for (let r2 of e2) !(function(e3, t3) {
          let r3 = N.get(t3);
          if (r3) {
            if (r3.error) throw r3.error;
            return;
          }
          B(t3, n.Runtime, e3);
        })(t2, r2);
      }
      globalThis.TURBOPACK = { push: I }, r.forEach(I);
    })();
  }
});

// node_modules/@opennextjs/aws/dist/core/edgeFunctionHandler.js
var edgeFunctionHandler_exports = {};
__export(edgeFunctionHandler_exports, {
  default: () => edgeFunctionHandler
});
async function edgeFunctionHandler(request) {
  const path3 = new URL(request.url).pathname;
  const routes = globalThis._ROUTES;
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(path3);
  } catch {
  }
  const correspondingRoute = routes.find((route) => route.regex.some((r) => {
    const regex = new RegExp(r);
    return regex.test(path3) || decodedPath !== void 0 && regex.test(decodedPath);
  }));
  if (!correspondingRoute) {
    throw new Error(`No route found for ${request.url}`);
  }
  const entry = await self._ENTRIES[`middleware_${correspondingRoute.name}`];
  const result = await entry.default({
    page: correspondingRoute.page,
    request: {
      ...request,
      page: {
        name: correspondingRoute.name
      }
    }
  });
  globalThis.__openNextAls.getStore()?.pendingPromiseRunner.add(result.waitUntil);
  const response = result.response;
  return response;
}
var init_edgeFunctionHandler = __esm({
  "node_modules/@opennextjs/aws/dist/core/edgeFunctionHandler.js"() {
    globalThis._ENTRIES = {};
    globalThis.self = globalThis;
    globalThis._ROUTES = [{ "name": "middleware", "page": "/", "regex": ["^(?:\\/(_next\\/data\\/[^/]{1,}))?(?:\\/(\\/?index|\\/?index\\.json|\\/?index(?:\\.rsc|\\.segments\\/.+\\.segment\\.rsc)))?[\\/#\\?]?$", "^(?:\\/(_next\\/data\\/[^/]{1,}))?\\/dashboard(?:\\/((?:[^\\/#\\?]+?)(?:\\/(?:[^\\/#\\?]+?))*))?(\\.json|\\.rsc|\\.segments\\/.+\\.segment\\.rsc)?[\\/#\\?]?$", "^(?:\\/(_next\\/data\\/[^/]{1,}))?\\/admin(?:\\/((?:[^\\/#\\?]+?)(?:\\/(?:[^\\/#\\?]+?))*))?(\\.json|\\.rsc|\\.segments\\/.+\\.segment\\.rsc)?[\\/#\\?]?$", "^(?:\\/(_next\\/data\\/[^/]{1,}))?\\/login(\\.json|\\.rsc|\\.segments\\/.+\\.segment\\.rsc)?[\\/#\\?]?$", "^(?:\\/(_next\\/data\\/[^/]{1,}))?\\/register(\\.json|\\.rsc|\\.segments\\/.+\\.segment\\.rsc)?[\\/#\\?]?$"] }];
    require_node_modules_next_dist_esm_build_templates_edge_wrapper_0h_u1c1sve_7();
    require_root_of_the_server_0ns4mr_xgqen9();
    require_turbopack_node_modules_next_dist_esm_build_templates_edge_wrapper_1zwm8yfsvxzxn();
  }
});

// node_modules/@opennextjs/aws/dist/utils/cacheHeaders.js
var CACHE_CONTROL_HEADER = "cache-control";
var OPEN_NEXT_CACHE_HEADER = "x-opennext-cache";
var CACHE_TAGS_HEADER = "x-next-cache-tags";
var ISR_HEADER = "x-isr";
var PRERENDER_REVALIDATE_HEADER = "x-prerender-revalidate";
var NO_STORE_CACHE_CONTROL = "private, no-cache, no-store, max-age=0, must-revalidate";
function fixCacheControlForError(headers, statusCode) {
  if (process.env.OPEN_NEXT_DANGEROUSLY_SET_ERROR_HEADERS === "true") {
    return;
  }
  if (statusCode === 404 || statusCode === 500) {
    headers[CACHE_CONTROL_HEADER] = NO_STORE_CACHE_CONTROL;
  }
}

// node_modules/@opennextjs/aws/dist/utils/promise.js
init_logger();

// node_modules/@opennextjs/aws/dist/utils/requestCache.js
var RequestCache = class {
  _caches = /* @__PURE__ */ new Map();
  /**
   * Returns the Map registered under `key`.
   * If no Map exists yet for that key, a new empty Map is created, stored, and returned.
   * Repeated calls with the same key always return the **same** Map instance.
   */
  getOrCreate(key) {
    let cache = this._caches.get(key);
    if (!cache) {
      cache = /* @__PURE__ */ new Map();
      this._caches.set(key, cache);
    }
    return cache;
  }
};

// node_modules/@opennextjs/aws/dist/utils/promise.js
var DetachedPromise = class {
  resolve;
  reject;
  promise;
  constructor() {
    let resolve;
    let reject;
    this.promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    this.resolve = resolve;
    this.reject = reject;
  }
};
var DetachedPromiseRunner = class {
  promises = [];
  /**
   * Create a deferred promise tracked by this runner.
   *
   * @returns The tracked promise and its resolve/reject functions.
   */
  withResolvers() {
    const detachedPromise = new DetachedPromise();
    this.add(detachedPromise.promise);
    return detachedPromise;
  }
  /**
   * Track background work and handle failures immediately.
   *
   * @param promise Work to await, including work registered during an active drain.
   * @returns Nothing; failures are logged rather than propagated.
   */
  add(promise) {
    this.promises.push(promise.then(() => {
    }, error));
  }
  /**
   * Drain tracked work, including additions made while earlier work is pending.
   *
   * Work started after the drain has settled still needs a new runtime waitUntil.
   * @returns Resolves when all work registered during this drain has settled.
   */
  async await() {
    debug(`Awaiting ${this.promises.length} detached promises`);
    let awaited = 0;
    while (awaited < this.promises.length) {
      const batch = this.promises.slice(awaited);
      awaited = this.promises.length;
      await Promise.all(batch);
    }
  }
};
async function awaitAllDetachedPromise() {
  const store = globalThis.__openNextAls.getStore();
  const promisesToAwait = store?.pendingPromiseRunner.await() ?? Promise.resolve();
  if (store?.waitUntil) {
    store.waitUntil(promisesToAwait);
    return;
  }
  await promisesToAwait;
}
function provideNextAfterProvider() {
  const NEXT_REQUEST_CONTEXT_SYMBOL = /* @__PURE__ */ Symbol.for("@next/request-context");
  const VERCEL_REQUEST_CONTEXT_SYMBOL = /* @__PURE__ */ Symbol.for("@vercel/request-context");
  const nextAfterContext = {
    get: () => {
      const store = globalThis.__openNextAls.getStore();
      return {
        waitUntil: store?.waitUntil ?? ((promise) => store?.pendingPromiseRunner.add(promise))
      };
    }
  };
  globalThis[NEXT_REQUEST_CONTEXT_SYMBOL] = nextAfterContext;
  if (process.env.EMULATE_VERCEL_REQUEST_CONTEXT) {
    globalThis[VERCEL_REQUEST_CONTEXT_SYMBOL] = nextAfterContext;
  }
}
function runWithOpenNextRequestContext({ isISRRevalidation, waitUntil, requestId = Math.random().toString(36) }, fn) {
  return globalThis.__openNextAls.run({
    requestId,
    pendingPromiseRunner: new DetachedPromiseRunner(),
    isISRRevalidation,
    waitUntil,
    writtenTags: /* @__PURE__ */ new Set(),
    requestCache: new RequestCache()
  }, async () => {
    provideNextAfterProvider();
    let result;
    try {
      result = await fn();
    } finally {
      await awaitAllDetachedPromise();
    }
    return result;
  });
}

// node_modules/@opennextjs/aws/dist/adapters/middleware.js
init_logger();

// node_modules/@opennextjs/aws/dist/core/createGenericHandler.js
init_logger();

// node_modules/@opennextjs/aws/dist/core/resolve.js
async function resolveConverter(converter2) {
  if (typeof converter2 === "function") {
    return converter2();
  }
  const m_1 = await Promise.resolve().then(() => (init_edge(), edge_exports));
  return m_1.default;
}
async function resolveWrapper(wrapper) {
  if (typeof wrapper === "function") {
    return wrapper();
  }
  const m_1 = await Promise.resolve().then(() => (init_cloudflare_edge(), cloudflare_edge_exports));
  return m_1.default;
}
async function resolveOriginResolver(originResolver) {
  if (typeof originResolver === "function") {
    return originResolver();
  }
  const m_1 = await Promise.resolve().then(() => (init_pattern_env(), pattern_env_exports));
  return m_1.default;
}
async function resolveAssetResolver(assetResolver) {
  if (typeof assetResolver === "function") {
    return assetResolver();
  }
  const m_1 = await Promise.resolve().then(() => (init_dummy(), dummy_exports));
  return m_1.default;
}
async function resolveProxyRequest(proxyRequest) {
  if (typeof proxyRequest === "function") {
    return proxyRequest();
  }
  const m_1 = await Promise.resolve().then(() => (init_fetch(), fetch_exports));
  return m_1.default;
}

// node_modules/@opennextjs/aws/dist/core/createGenericHandler.js
async function createGenericHandler(handler3) {
  const config = await import("./open-next.config.mjs").then((m) => m.default);
  globalThis.openNextConfig = config;
  const handlerConfig = config[handler3.type];
  const override = handlerConfig && "override" in handlerConfig ? handlerConfig.override : void 0;
  const converter2 = await resolveConverter(override?.converter);
  const { name, wrapper } = await resolveWrapper(override?.wrapper);
  debug("Using wrapper", name);
  return wrapper(handler3.handler, converter2);
}

// node_modules/@opennextjs/aws/dist/core/routing/util.js
import crypto2 from "node:crypto";
import { parse as parseQs, stringify as stringifyQs } from "node:querystring";

// node_modules/@opennextjs/aws/dist/adapters/config/index.js
init_logger();
import path from "node:path";
globalThis.__dirname ??= "";
var NEXT_DIR = path.join(__dirname, ".next");
var OPEN_NEXT_DIR = path.join(__dirname, ".open-next");
debug({ NEXT_DIR, OPEN_NEXT_DIR });
var NextConfig = { "env": {}, "webpack": null, "typescript": { "ignoreBuildErrors": false }, "typedRoutes": false, "distDir": ".next", "cleanDistDir": true, "assetPrefix": "", "cacheMaxMemorySize": 52428800, "configOrigin": "next.config.ts", "useFileSystemPublicRoutes": true, "generateEtags": true, "pageExtensions": ["tsx", "ts", "jsx", "js"], "instrumentationClientInject": [], "poweredByHeader": true, "compress": true, "images": { "deviceSizes": [640, 750, 828, 1080, 1200, 1920, 2048, 3840], "imageSizes": [32, 48, 64, 96, 128, 256, 384], "path": "/_next/image", "loader": "default", "loaderFile": "", "domains": [], "disableStaticImages": false, "minimumCacheTTL": 14400, "formats": ["image/webp"], "maximumRedirects": 3, "maximumResponseBody": 5e7, "dangerouslyAllowLocalIP": false, "dangerouslyAllowSVG": false, "contentSecurityPolicy": "script-src 'none'; frame-src 'none'; sandbox;", "contentDispositionType": "attachment", "localPatterns": [{ "pathname": "**", "search": "" }], "remotePatterns": [{ "protocol": "https", "hostname": "images.unsplash.com" }, { "protocol": "https", "hostname": "**.r2.cloudflarestorage.com" }, { "protocol": "https", "hostname": "**.r2.dev" }, { "protocol": "https", "hostname": "**.workers.dev" }, { "protocol": "https", "hostname": "**.pages.dev" }, { "protocol": "https", "hostname": "**.cloudflare.com" }], "qualities": [75], "unoptimized": false, "customCacheHandler": false }, "devIndicators": { "position": "bottom-left" }, "onDemandEntries": { "maxInactiveAge": 6e4, "pagesBufferLength": 5 }, "basePath": "", "sassOptions": {}, "trailingSlash": false, "i18n": null, "productionBrowserSourceMaps": false, "excludeDefaultMomentLocales": true, "reactProductionProfiling": false, "reactStrictMode": null, "reactMaxHeadersLength": 6e3, "httpAgentOptions": { "keepAlive": true }, "logging": { "serverFunctions": true, "browserToTerminal": "warn" }, "compiler": {}, "expireTime": 31536e3, "staticPageGenerationTimeout": 60, "output": "standalone", "modularizeImports": { "@mui/icons-material": { "transform": "@mui/icons-material/{{member}}" }, "lodash": { "transform": "lodash/{{member}}" } }, "outputFileTracingRoot": "/home/jeet/projects/freelancing/dreamkey-crm/frontend", "allowedDevOrigins": ["192.168.0.190", "192.168.0.190:3000", "192.168.*", "192.168.*:*", "10.*", "10.*:*", "172.16.*", "172.16.*:*", "localhost", "localhost:3000", "*.trycloudflare.com", "*.trycloudflare.com:*", "*.workers.dev", "*.workers.dev:*", "*.pages.dev", "*.pages.dev:*", "*.cloudflare.com", "*.cloudflare.com:*", "*.r2.cloudflarestorage.com", "*.r2.dev"], "enablePrerenderSourceMaps": true, "cacheComponents": false, "cacheLife": { "default": { "stale": 300, "revalidate": 900, "expire": 4294967294 }, "seconds": { "stale": 30, "revalidate": 1, "expire": 60 }, "minutes": { "stale": 300, "revalidate": 60, "expire": 3600 }, "hours": { "stale": 300, "revalidate": 3600, "expire": 86400 }, "days": { "stale": 300, "revalidate": 86400, "expire": 604800 }, "weeks": { "stale": 300, "revalidate": 604800, "expire": 2592e3 }, "max": { "stale": 300, "revalidate": 2592e3, "expire": 31536e3 } }, "cacheHandlers": {}, "deprecated": {}, "experimental": { "agentUpgrade": "security", "agentFeedback": false, "coldCacheBadge": false, "collapseAdapterRoutes": true, "devValidationWorker": true, "useSkewCookie": false, "cssChunking": true, "multiZoneDraftMode": false, "appNavFailHandling": false, "parallelRouteMetadata": false, "prerenderEarlyExit": true, "serverMinification": true, "linkNoTouchStart": false, "caseSensitiveRoutes": false, "cachedNavigations": false, "dynamicOnHover": false, "reactBrowserBailout": true, "useOffline": false, "varyParams": true, "optimisticRouting": true, "concurrentRouterQueue": false, "instrumentationClientRouterTransitionEvents": false, "prefetchInlining": { "maxSize": 2048, "maxBundleSize": 10240 }, "preloadEntriesOnStart": true, "clientRouterFilter": true, "clientRouterFilterRedirects": false, "fetchCacheKeyPrefix": "", "proxyPrefetch": "flexible", "optimisticClientCache": true, "manualClientBasePath": false, "cpus": 11, "memoryBasedWorkersCount": false, "imgOptConcurrency": null, "imgOptOperationCache": null, "imgOptTimeoutInSeconds": 7, "imgOptMaxInputPixels": 268402689, "imgOptSequentialRead": null, "imgOptMozjpeg": true, "isrFlushToDisk": true, "workerThreads": false, "optimizeCss": false, "nextScriptWorkers": false, "scrollRestoration": false, "externalDir": false, "devMemoryThresholdRestart": true, "disableOptimizedLoading": false, "gzipSize": true, "craCompat": false, "esmExternals": true, "fullySpecified": false, "swcTraceProfiling": false, "forceSwcTransforms": false, "requestInsights": false, "largePageDataBytes": 128e3, "typedEnv": false, "parallelServerCompiles": false, "parallelServerBuildTraces": false, "ppr": false, "authInterrupts": false, "webpackMemoryOptimizations": false, "optimizeServerReact": true, "strictRouteTypes": false, "useTypeScriptCli": true, "removeUncaughtErrorAndRejectionListeners": false, "validateRSCRequestHeaders": true, "staleTimes": { "dynamic": 0, "static": 300 }, "reactDebugChannel": true, "serverComponentsHmrCache": true, "serverComponentsHmrCancellation": false, "staticGenerationMaxConcurrency": 8, "staticGenerationMinPagesPerWorker": 25, "transitionIndicator": false, "gestureTransition": false, "inlineCss": false, "useCache": false, "useCacheStaticRootParamTracking": false, "globalNotFound": false, "explicitParallelRouteChildren": true, "strictRouteMatching": true, "browserDebugInfoInTerminal": "warn", "lockDistDir": true, "disableResumeDataCacheCompression": false, "proxyClientMaxBodySize": 10485760, "hideLogsAfterAbort": false, "mcpServer": true, "exposeRuntimeErrorsToHMR": false, "turbopackFileSystemCacheForDev": true, "turbopackFileSystemCacheForBuild": true, "turbopackStaleOutputMaxAge": 6048e5, "turbopackInferModuleSideEffects": true, "turbopackPluginRuntimeStrategy": "childProcesses", "turbopackSharedRuntime": true, "turbopackMemoryEvictionMode": "auto", "optimizePackageImports": ["lucide-react", "date-fns", "lodash-es", "ramda", "antd", "react-bootstrap", "ahooks", "@ant-design/icons", "@headlessui/react", "@headlessui-float/react", "@heroicons/react/20/solid", "@heroicons/react/24/solid", "@heroicons/react/24/outline", "@visx/visx", "@tremor/react", "rxjs", "@mui/material", "@mui/icons-material", "recharts", "react-use", "effect", "@effect/schema", "@effect/platform", "@effect/platform-node", "@effect/platform-browser", "@effect/platform-bun", "@effect/sql", "@effect/sql-mssql", "@effect/sql-mysql2", "@effect/sql-pg", "@effect/sql-sqlite-node", "@effect/sql-sqlite-bun", "@effect/sql-sqlite-wasm", "@effect/sql-sqlite-react-native", "@effect/rpc", "@effect/rpc-http", "@effect/typeclass", "@effect/experimental", "@effect/opentelemetry", "@material-ui/core", "@material-ui/icons", "@tabler/icons-react", "mui-core", "react-icons/ai", "react-icons/bi", "react-icons/bs", "react-icons/cg", "react-icons/ci", "react-icons/di", "react-icons/fa", "react-icons/fa6", "react-icons/fc", "react-icons/fi", "react-icons/gi", "react-icons/go", "react-icons/gr", "react-icons/hi", "react-icons/hi2", "react-icons/im", "react-icons/io", "react-icons/io5", "react-icons/lia", "react-icons/lib", "react-icons/lu", "react-icons/md", "react-icons/pi", "react-icons/ri", "react-icons/rx", "react-icons/si", "react-icons/sl", "react-icons/tb", "react-icons/tfi", "react-icons/ti", "react-icons/vsc", "react-icons/wi"], "useCacheTimeout": 54, "instantInsights": { "validationLevel": "warning" }, "trustHostHeader": false, "isExperimentalCompile": false }, "htmlLimitedBots": "[\\w-]+-Google|Google-[\\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight", "bundlePagesRouterDependencies": false, "configFileName": "next.config.ts", "repoRoot": "/home/jeet/projects/freelancing/dreamkey-crm/frontend", "turbopack": { "root": "/home/jeet/projects/freelancing/dreamkey-crm/frontend" }, "distDirRoot": ".next", "_originalRewrites": { "beforeFiles": [], "afterFiles": [{ "source": "/api/:path*", "destination": "https://backend.dreamkey-crm.workers.dev/:path*" }], "fallback": [] } };
var BuildId = "lY466RVQZmfztJln-k5Tu";
var RoutesManifest = { "basePath": "", "rewrites": { "beforeFiles": [], "afterFiles": [{ "source": "/api/:path*", "destination": "https://backend.dreamkey-crm.workers.dev/:path*", "regex": "^/api(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))?(?:/)?$" }], "fallback": [] }, "redirects": [{ "source": "/:path+/", "destination": "/:path+", "internal": true, "priority": true, "statusCode": 308, "regex": "^(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))/$" }], "routes": { "static": [{ "page": "/", "regex": "^/(?:/)?$", "routeKeys": {}, "namedRegex": "^/(?:/)?$" }, { "page": "/_global-error", "regex": "^/_global\\-error(?:/)?$", "routeKeys": {}, "namedRegex": "^/_global\\-error(?:/)?$" }, { "page": "/_not-found", "regex": "^/_not\\-found(?:/)?$", "routeKeys": {}, "namedRegex": "^/_not\\-found(?:/)?$" }, { "page": "/dashboard", "regex": "^/dashboard(?:/)?$", "routeKeys": {}, "namedRegex": "^/dashboard(?:/)?$" }, { "page": "/dashboard/brokers", "regex": "^/dashboard/brokers(?:/)?$", "routeKeys": {}, "namedRegex": "^/dashboard/brokers(?:/)?$" }, { "page": "/dashboard/clients", "regex": "^/dashboard/clients(?:/)?$", "routeKeys": {}, "namedRegex": "^/dashboard/clients(?:/)?$" }, { "page": "/dashboard/finance", "regex": "^/dashboard/finance(?:/)?$", "routeKeys": {}, "namedRegex": "^/dashboard/finance(?:/)?$" }, { "page": "/dashboard/organization", "regex": "^/dashboard/organization(?:/)?$", "routeKeys": {}, "namedRegex": "^/dashboard/organization(?:/)?$" }, { "page": "/dashboard/owners", "regex": "^/dashboard/owners(?:/)?$", "routeKeys": {}, "namedRegex": "^/dashboard/owners(?:/)?$" }, { "page": "/dashboard/properties", "regex": "^/dashboard/properties(?:/)?$", "routeKeys": {}, "namedRegex": "^/dashboard/properties(?:/)?$" }, { "page": "/dashboard/tasks", "regex": "^/dashboard/tasks(?:/)?$", "routeKeys": {}, "namedRegex": "^/dashboard/tasks(?:/)?$" }, { "page": "/dashboard/website-users", "regex": "^/dashboard/website\\-users(?:/)?$", "routeKeys": {}, "namedRegex": "^/dashboard/website\\-users(?:/)?$" }, { "page": "/icon.png", "regex": "^/icon\\.png(?:/)?$", "routeKeys": {}, "namedRegex": "^/icon\\.png(?:/)?$" }, { "page": "/login", "regex": "^/login(?:/)?$", "routeKeys": {}, "namedRegex": "^/login(?:/)?$" }], "dynamic": [{ "page": "/share/[token]", "regex": "^/share/([^/]+?)(?:/)?$", "routeKeys": { "nxtPtoken": "nxtPtoken" }, "namedRegex": "^/share/(?<nxtPtoken>[^/]+?)(?:/)?$" }], "data": { "static": [], "dynamic": [] } }, "locales": [] };
var ConfigHeaders = [];
var PrerenderManifest = { "version": 4, "routes": { "/_global-error": { "routeType": "page", "response": "complete", "compute": "static", "htmlSize": 8999, "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/_global-error", "dataRoute": "/_global-error.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/_not-found": { "initialStatus": 404, "routeType": "page", "response": "complete", "compute": "static", "htmlSize": 23425, "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/_not-found", "dataRoute": "/_not-found.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/dashboard": { "routeType": "page", "response": "complete", "compute": "static", "htmlSize": 61357, "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/dashboard", "dataRoute": "/dashboard.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/dashboard/brokers": { "routeType": "page", "response": "complete", "compute": "static", "htmlSize": 144241, "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/dashboard/brokers", "dataRoute": "/dashboard/brokers.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/dashboard/clients": { "routeType": "page", "response": "complete", "compute": "static", "htmlSize": 121188, "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/dashboard/clients", "dataRoute": "/dashboard/clients.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/dashboard/finance": { "routeType": "page", "response": "complete", "compute": "static", "htmlSize": 137110, "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/dashboard/finance", "dataRoute": "/dashboard/finance.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/dashboard/organization": { "routeType": "page", "response": "complete", "compute": "static", "htmlSize": 100211, "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/dashboard/organization", "dataRoute": "/dashboard/organization.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/dashboard/owners": { "routeType": "page", "response": "complete", "compute": "static", "htmlSize": 143683, "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/dashboard/owners", "dataRoute": "/dashboard/owners.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/dashboard/properties": { "routeType": "page", "response": "complete", "compute": "static", "htmlSize": 135124, "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/dashboard/properties", "dataRoute": "/dashboard/properties.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/dashboard/tasks": { "routeType": "page", "response": "complete", "compute": "static", "htmlSize": 89279, "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/dashboard/tasks", "dataRoute": "/dashboard/tasks.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/dashboard/website-users": { "routeType": "page", "response": "complete", "compute": "static", "htmlSize": 164818, "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/dashboard/website-users", "dataRoute": "/dashboard/website-users.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/icon.png": { "initialHeaders": { "cache-control": "public, max-age=0, must-revalidate", "content-type": "image/png", "x-next-cache-tags": "_N_T_/layout,_N_T_/icon.png/layout,_N_T_/icon.png/route,_N_T_/icon.png" }, "routeType": "route", "response": "complete", "compute": "static", "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/icon.png", "dataRoute": null, "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/login": { "routeType": "page", "response": "complete", "compute": "static", "htmlSize": 42818, "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/login", "dataRoute": "/login.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] } }, "dynamicRoutes": {}, "notFoundRoutes": [], "preview": { "previewModeId": "b08bc7080bb5ab185d199d495436bdd7", "previewModeSigningKey": "ab1c8c1b5f44342c33415db1466256734ec726eedad162b8b0ad503f8e180ab5", "previewModeEncryptionKey": "28ba192e5075f804760b3f675fa82797fe53d68fa9bf721cc179a384ec6096e7" } };
var MiddlewareManifest = { "version": 3, "middleware": { "/": { "files": ["server/edge/chunks/node_modules_next_dist_esm_build_templates_edge-wrapper_0h-u1c1sve-7_.js", "server/edge/chunks/[root-of-the-server]__0ns4mr-xgqen9._.js", "server/edge/chunks/turbopack-node_modules_next_dist_esm_build_templates_edge-wrapper_1zwm8yfsvxzxn.js"], "name": "middleware", "page": "/", "entrypoint": "server/edge/chunks/turbopack-node_modules_next_dist_esm_build_templates_edge-wrapper_1zwm8yfsvxzxn.js", "matchers": [{ "regexp": "^(?:\\/(_next\\/data\\/[^/]{1,}))?(?:\\/(\\/?index|\\/?index\\.json|\\/?index(?:\\.rsc|\\.segments\\/.+\\.segment\\.rsc)))?[\\/#\\?]?$", "originalSource": "/" }, { "regexp": "^(?:\\/(_next\\/data\\/[^/]{1,}))?\\/dashboard(?:\\/((?:[^\\/#\\?]+?)(?:\\/(?:[^\\/#\\?]+?))*))?(\\.json|\\.rsc|\\.segments\\/.+\\.segment\\.rsc)?[\\/#\\?]?$", "originalSource": "/dashboard/:path*" }, { "regexp": "^(?:\\/(_next\\/data\\/[^/]{1,}))?\\/admin(?:\\/((?:[^\\/#\\?]+?)(?:\\/(?:[^\\/#\\?]+?))*))?(\\.json|\\.rsc|\\.segments\\/.+\\.segment\\.rsc)?[\\/#\\?]?$", "originalSource": "/admin/:path*" }, { "regexp": "^(?:\\/(_next\\/data\\/[^/]{1,}))?\\/login(\\.json|\\.rsc|\\.segments\\/.+\\.segment\\.rsc)?[\\/#\\?]?$", "originalSource": "/login" }, { "regexp": "^(?:\\/(_next\\/data\\/[^/]{1,}))?\\/register(\\.json|\\.rsc|\\.segments\\/.+\\.segment\\.rsc)?[\\/#\\?]?$", "originalSource": "/register" }], "wasm": [], "assets": [], "env": { "__NEXT_BUILD_ID": "lY466RVQZmfztJln-k5Tu", "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY": "PLMSnKNjhKenln8A2IB/NY3iuhWgKrDvj5f7IVLdJAo=", "__NEXT_PREVIEW_MODE_ID": "b08bc7080bb5ab185d199d495436bdd7", "__NEXT_PREVIEW_MODE_ENCRYPTION_KEY": "28ba192e5075f804760b3f675fa82797fe53d68fa9bf721cc179a384ec6096e7", "__NEXT_PREVIEW_MODE_SIGNING_KEY": "ab1c8c1b5f44342c33415db1466256734ec726eedad162b8b0ad503f8e180ab5" } } }, "sortedMiddleware": ["/"], "functions": {} };
var AppPathsManifest = { "/_global-error/page": "app/_global-error/page.js", "/_not-found/page": "app/_not-found/page.js", "/dashboard/brokers/page": "app/dashboard/brokers/page.js", "/dashboard/clients/page": "app/dashboard/clients/page.js", "/dashboard/finance/page": "app/dashboard/finance/page.js", "/dashboard/organization/page": "app/dashboard/organization/page.js", "/dashboard/owners/page": "app/dashboard/owners/page.js", "/dashboard/page": "app/dashboard/page.js", "/dashboard/properties/page": "app/dashboard/properties/page.js", "/dashboard/tasks/page": "app/dashboard/tasks/page.js", "/dashboard/website-users/page": "app/dashboard/website-users/page.js", "/icon.png/route": "app/icon.png/route.js", "/login/page": "app/login/page.js", "/page": "app/page.js", "/share/[token]/page": "app/share/[token]/page.js" };
var AppPathRoutesManifest = { "/_global-error/page": "/_global-error", "/_not-found/page": "/_not-found", "/dashboard/brokers/page": "/dashboard/brokers", "/dashboard/clients/page": "/dashboard/clients", "/dashboard/finance/page": "/dashboard/finance", "/dashboard/organization/page": "/dashboard/organization", "/dashboard/owners/page": "/dashboard/owners", "/dashboard/page": "/dashboard", "/dashboard/properties/page": "/dashboard/properties", "/dashboard/tasks/page": "/dashboard/tasks", "/dashboard/website-users/page": "/dashboard/website-users", "/icon.png/route": "/icon.png", "/login/page": "/login", "/page": "/", "/share/[token]/page": "/share/[token]" };
var FunctionsConfigManifest = { "version": 1, "functions": {} };
var PagesManifest = { "/404": "pages/404.html", "/500": "pages/500.html" };
process.env.NEXT_BUILD_ID = BuildId;
process.env.OPEN_NEXT_BUILD_ID = "lY466RVQZmfztJln-k5Tu";
process.env.NEXT_PREVIEW_MODE_ID = PrerenderManifest?.preview?.previewModeId;

// node_modules/@opennextjs/aws/dist/http/openNextResponse.js
init_logger();
import { Transform } from "node:stream";
init_util();

// node_modules/@opennextjs/aws/dist/core/routing/util.js
init_util();
init_logger();
import { ReadableStream as ReadableStream3 } from "node:stream/web";

// node_modules/@opennextjs/aws/dist/utils/binary.js
var commonBinaryMimeTypes = /* @__PURE__ */ new Set([
  "application/octet-stream",
  // Docs
  "application/epub+zip",
  "application/msword",
  "application/pdf",
  "application/rtf",
  "application/vnd.amazon.ebook",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Fonts
  "font/otf",
  "font/woff",
  "font/woff2",
  // Images
  "image/bmp",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/vnd.microsoft.icon",
  "image/webp",
  // Audio
  "audio/3gpp",
  "audio/aac",
  "audio/basic",
  "audio/flac",
  "audio/mpeg",
  "audio/ogg",
  "audio/wavaudio/webm",
  "audio/x-aiff",
  "audio/x-midi",
  "audio/x-wav",
  // Video
  "video/3gpp",
  "video/mp2t",
  "video/mpeg",
  "video/ogg",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  // Archives
  "application/java-archive",
  "application/vnd.apple.installer+xml",
  "application/x-7z-compressed",
  "application/x-apple-diskimage",
  "application/x-bzip",
  "application/x-bzip2",
  "application/x-gzip",
  "application/x-java-archive",
  "application/x-rar-compressed",
  "application/x-tar",
  "application/x-zip",
  "application/zip",
  // Serialized data
  "application/x-protobuf"
]);
function isBinaryContentType(contentType) {
  if (!contentType)
    return false;
  const value = contentType.split(";")[0];
  return commonBinaryMimeTypes.has(value);
}

// node_modules/@opennextjs/aws/dist/core/routing/i18n/index.js
init_stream();
init_logger();

// node_modules/@opennextjs/aws/dist/core/routing/i18n/accept-header.js
function parse(raw, preferences, options) {
  const lowers = /* @__PURE__ */ new Map();
  const header = raw.replace(/[ \t]/g, "");
  if (preferences) {
    let pos = 0;
    for (const preference of preferences) {
      const lower = preference.toLowerCase();
      lowers.set(lower, { orig: preference, pos: pos++ });
      if (options.prefixMatch) {
        const parts2 = lower.split("-");
        while (parts2.pop(), parts2.length > 0) {
          const joined = parts2.join("-");
          if (!lowers.has(joined)) {
            lowers.set(joined, { orig: preference, pos: pos++ });
          }
        }
      }
    }
  }
  const parts = header.split(",");
  const selections = [];
  const map = /* @__PURE__ */ new Set();
  for (let i = 0; i < parts.length; ++i) {
    const part = parts[i];
    if (!part) {
      continue;
    }
    const params = part.split(";");
    if (params.length > 2) {
      throw new Error(`Invalid ${options.type} header`);
    }
    const token = params[0].toLowerCase();
    if (!token) {
      throw new Error(`Invalid ${options.type} header`);
    }
    const selection = { token, pos: i, q: 1 };
    if (preferences && lowers.has(token)) {
      selection.pref = lowers.get(token).pos;
    }
    map.add(selection.token);
    if (params.length === 2) {
      const q = params[1];
      const [key, value] = q.split("=");
      if (!value || key !== "q" && key !== "Q") {
        throw new Error(`Invalid ${options.type} header`);
      }
      const score = Number.parseFloat(value);
      if (score === 0) {
        continue;
      }
      if (Number.isFinite(score) && score <= 1 && score >= 1e-3) {
        selection.q = score;
      }
    }
    selections.push(selection);
  }
  selections.sort((a, b) => {
    if (b.q !== a.q) {
      return b.q - a.q;
    }
    if (b.pref !== a.pref) {
      if (a.pref === void 0) {
        return 1;
      }
      if (b.pref === void 0) {
        return -1;
      }
      return a.pref - b.pref;
    }
    return a.pos - b.pos;
  });
  const values = selections.map((selection) => selection.token);
  if (!preferences || !preferences.length) {
    return values;
  }
  const preferred = [];
  for (const selection of values) {
    if (selection === "*") {
      for (const [preference, value] of lowers) {
        if (!map.has(preference)) {
          preferred.push(value.orig);
        }
      }
    } else {
      const lower = selection.toLowerCase();
      if (lowers.has(lower)) {
        preferred.push(lowers.get(lower).orig);
      }
    }
  }
  return preferred;
}
function acceptLanguage(header = "", preferences) {
  return parse(header, preferences, {
    type: "accept-language",
    prefixMatch: true
  })[0] || void 0;
}

// node_modules/@opennextjs/aws/dist/core/routing/i18n/index.js
function isLocalizedPath(path3) {
  return NextConfig.i18n?.locales.includes(path3.split("/")[1].toLowerCase()) ?? false;
}
function getLocaleFromCookie(cookies) {
  const i18n = NextConfig.i18n;
  const nextLocale = cookies.NEXT_LOCALE?.toLowerCase();
  return nextLocale ? i18n?.locales.find((locale) => nextLocale === locale.toLowerCase()) : void 0;
}
function detectDomainLocale({ hostname, detectedLocale }) {
  const i18n = NextConfig.i18n;
  const domains = i18n?.domains;
  if (!domains) {
    return;
  }
  const lowercasedLocale = detectedLocale?.toLowerCase();
  for (const domain of domains) {
    const domainHostname = domain.domain.split(":", 1)[0].toLowerCase();
    if (hostname === domainHostname || lowercasedLocale === domain.defaultLocale.toLowerCase() || domain.locales?.some((locale) => lowercasedLocale === locale.toLowerCase())) {
      return domain;
    }
  }
}
function detectLocale(internalEvent, i18n) {
  const domainLocale = detectDomainLocale({
    hostname: internalEvent.headers.host
  });
  if (i18n.localeDetection === false) {
    return domainLocale?.defaultLocale ?? i18n.defaultLocale;
  }
  const cookiesLocale = getLocaleFromCookie(internalEvent.cookies);
  const preferredLocale = acceptLanguage(internalEvent.headers["accept-language"], i18n?.locales);
  debug({
    cookiesLocale,
    preferredLocale,
    defaultLocale: i18n.defaultLocale,
    domainLocale
  });
  return domainLocale?.defaultLocale ?? cookiesLocale ?? preferredLocale ?? i18n.defaultLocale;
}
function localizePath(internalEvent) {
  const i18n = NextConfig.i18n;
  if (!i18n) {
    return internalEvent.rawPath;
  }
  if (isLocalizedPath(internalEvent.rawPath)) {
    return internalEvent.rawPath;
  }
  const detectedLocale = detectLocale(internalEvent, i18n);
  return `/${detectedLocale}${internalEvent.rawPath}`;
}
function handleLocaleRedirect(internalEvent) {
  const i18n = NextConfig.i18n;
  if (!i18n || i18n.localeDetection === false || internalEvent.rawPath !== "/") {
    return false;
  }
  const preferredLocale = acceptLanguage(internalEvent.headers["accept-language"], i18n?.locales);
  const detectedLocale = detectLocale(internalEvent, i18n);
  const domainLocale = detectDomainLocale({
    hostname: internalEvent.headers.host
  });
  const preferredDomain = detectDomainLocale({
    detectedLocale: preferredLocale
  });
  if (domainLocale && preferredDomain) {
    const isPDomain = preferredDomain.domain === domainLocale.domain;
    const isPLocale = preferredDomain.defaultLocale === preferredLocale;
    if (!isPDomain || !isPLocale) {
      const scheme = `http${preferredDomain.http ? "" : "s"}`;
      const rlocale = isPLocale ? "" : preferredLocale;
      return {
        type: "core",
        statusCode: 307,
        headers: {
          Location: `${scheme}://${preferredDomain.domain}/${rlocale}`
        },
        body: emptyReadableStream(),
        isBase64Encoded: false
      };
    }
  }
  const defaultLocale = domainLocale?.defaultLocale ?? i18n.defaultLocale;
  if (detectedLocale.toLowerCase() !== defaultLocale.toLowerCase()) {
    const nextUrl = constructNextUrl(internalEvent.url, `/${detectedLocale}${NextConfig.trailingSlash ? "/" : ""}`);
    const queryString = convertToQueryString(internalEvent.query);
    return {
      type: "core",
      statusCode: 307,
      headers: {
        Location: `${nextUrl}${queryString}`
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
  return false;
}

// node_modules/@opennextjs/aws/dist/core/routing/queue.js
function generateShardId(rawPath, maxConcurrency, prefix) {
  let a = cyrb128(rawPath);
  let t = a += 1831565813;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  const randomFloat = ((t ^ t >>> 14) >>> 0) / 4294967296;
  const randomInt = Math.floor(randomFloat * maxConcurrency);
  return `${prefix}-${randomInt}`;
}
function generateMessageGroupId(rawPath) {
  const maxConcurrency = Number.parseInt(process.env.MAX_REVALIDATE_CONCURRENCY ?? "10");
  return generateShardId(rawPath, maxConcurrency, "revalidate");
}
function cyrb128(str) {
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ h1 >>> 18, 597399067);
  h2 = Math.imul(h4 ^ h2 >>> 22, 2869860233);
  h3 = Math.imul(h1 ^ h3 >>> 17, 951274213);
  h4 = Math.imul(h2 ^ h4 >>> 19, 2716044179);
  h1 ^= h2 ^ h3 ^ h4, h2 ^= h1, h3 ^= h1, h4 ^= h1;
  return h1 >>> 0;
}

// node_modules/@opennextjs/aws/dist/core/routing/util.js
function isExternal(url, host) {
  if (!url)
    return false;
  const pattern = /^https?:\/\//;
  if (!pattern.test(url))
    return false;
  if (host) {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.host !== host;
    } catch {
      return !url.includes(host);
    }
  }
  return true;
}
function convertFromQueryString(query) {
  if (query === "")
    return {};
  return getQueryFromIterator(new URLSearchParams(query).entries());
}
function getUrlParts(url, isExternal2) {
  const hashIndex = url.indexOf("#");
  const hash = hashIndex === -1 ? "" : url.slice(hashIndex);
  const urlWithoutHash = hashIndex === -1 ? url : url.slice(0, hashIndex);
  if (!isExternal2) {
    const regex2 = /\/([^?]*)\??(.*)/;
    const match3 = urlWithoutHash.match(regex2);
    return {
      hostname: "",
      pathname: urlWithoutHash.startsWith("/") ? `/${match3?.[1] ?? ""}` : "",
      protocol: "",
      queryString: match3?.[2] ?? "",
      hash
    };
  }
  const regex = /^(https?:)\/\/?([^\/\s?]+)(\/[^?]*)?(\?.*)?/;
  const match2 = urlWithoutHash.match(regex);
  if (!match2) {
    throw new Error(`Invalid external URL: ${url}`);
  }
  return {
    protocol: match2[1] ?? "https:",
    hostname: match2[2],
    pathname: match2[3] ?? "",
    queryString: match2[4]?.slice(1) ?? "",
    hash
  };
}
function constructNextUrl(baseUrl, path3) {
  const nextBasePath = NextConfig.basePath ?? "";
  const url = new URL(`${nextBasePath}${path3}`, baseUrl);
  return url.href;
}
function convertToQueryString(query) {
  const searchParams = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => searchParams.append(key, entry));
    } else {
      searchParams.append(key, value);
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}
function getMiddlewareMatch(middlewareManifest2, functionsManifest) {
  if (functionsManifest?.functions?.["/_middleware"]) {
    return functionsManifest.functions["/_middleware"].matchers?.map(({ regexp }) => new RegExp(regexp)) ?? [/.*/];
  }
  const rootMiddleware = middlewareManifest2.middleware["/"];
  if (!rootMiddleware?.matchers)
    return [];
  return rootMiddleware.matchers.map(({ regexp }) => new RegExp(regexp));
}
function escapeRegex(str, { isPath } = {}) {
  const result = str.replaceAll("(.)", "_\xB51_").replaceAll("(..)", "_\xB52_").replaceAll("(...)", "_\xB53_");
  return isPath ? result : result.replaceAll("+", "_\xB54_");
}
function unescapeRegex(str) {
  return str.replaceAll("_\xB51_", "(.)").replaceAll("_\xB52_", "(..)").replaceAll("_\xB53_", "(...)").replaceAll("_\xB54_", "+");
}
function convertBodyToReadableStream(method, body) {
  if (method === "GET" || method === "HEAD")
    return void 0;
  if (!body)
    return void 0;
  return new ReadableStream3({
    start(controller) {
      controller.enqueue(body);
      controller.close();
    }
  });
}
function normalizeLocationHeader(location, baseUrl, encodeQuery = false) {
  if (!URL.canParse(location)) {
    return location;
  }
  const locationURL = new URL(location);
  const origin = new URL(baseUrl).origin;
  let search = locationURL.search;
  if (encodeQuery && search) {
    search = `?${stringifyQs(parseQs(search.slice(1)))}`;
  }
  const href = `${locationURL.origin}${locationURL.pathname}${search}${locationURL.hash}`;
  if (locationURL.origin === origin) {
    return href.slice(origin.length);
  }
  return href;
}

// node_modules/@opennextjs/aws/dist/core/routingHandler.js
init_logger();

// node_modules/@opennextjs/aws/dist/core/routing/cacheInterceptor.js
import { createHash as createHash3 } from "node:crypto";
init_stream();

// node_modules/@opennextjs/aws/dist/utils/cache.js
init_logger();
import { Buffer as Buffer3 } from "node:buffer";
import { createHash } from "node:crypto";

// node_modules/@opennextjs/aws/dist/utils/semver.js
function compareSemver(v1, operator, v2) {
  let versionDiff = 0;
  if (v1 === "latest") {
    versionDiff = 1;
  } else {
    if (/^[^\d]/.test(v1)) {
      v1 = v1.substring(1);
    }
    if (/^[^\d]/.test(v2)) {
      v2 = v2.substring(1);
    }
    const [major1, minor1 = 0, patch1 = 0] = v1.split(".").map(Number);
    const [major2, minor2 = 0, patch2 = 0] = v2.split(".").map(Number);
    if (Number.isNaN(major1) || Number.isNaN(major2)) {
      throw new Error("The major version is required.");
    }
    if (major1 !== major2) {
      versionDiff = major1 - major2;
    } else if (minor1 !== minor2) {
      versionDiff = minor1 - minor2;
    } else if (patch1 !== patch2) {
      versionDiff = patch1 - patch2;
    }
  }
  switch (operator) {
    case "=":
      return versionDiff === 0;
    case ">=":
      return versionDiff >= 0;
    case "<=":
      return versionDiff <= 0;
    case ">":
      return versionDiff > 0;
    case "<":
      return versionDiff < 0;
    default:
      throw new Error(`Unsupported operator: ${operator}`);
  }
}

// node_modules/@opennextjs/aws/dist/utils/cache.js
async function isStale(key, tags, lastModified) {
  if (!compareSemver(globalThis.nextVersion, ">=", "16.0.0")) {
    return false;
  }
  if (globalThis.openNextConfig.dangerous?.disableTagCache) {
    return false;
  }
  if (globalThis.tagCache.mode === "nextMode") {
    return tags.length === 0 ? false : await globalThis.tagCache.isStale?.(tags, lastModified) ?? false;
  }
  return await globalThis.tagCache.isStale?.(key, lastModified) ?? false;
}
async function hasBeenRevalidated(key, tags, cacheEntry) {
  if (globalThis.openNextConfig.dangerous?.disableTagCache) {
    return false;
  }
  const value = cacheEntry.value;
  if (!value) {
    return true;
  }
  if ("type" in cacheEntry && cacheEntry.type === "page") {
    return false;
  }
  const lastModified = cacheEntry.lastModified ?? Date.now();
  if (globalThis.tagCache.mode === "nextMode") {
    return tags.length === 0 ? false : await globalThis.tagCache.hasBeenRevalidated(tags, lastModified);
  }
  const _lastModified = await globalThis.tagCache.getLastModified(key, lastModified);
  return _lastModified === -1;
}
function getTagsFromValue(value) {
  if (!value) {
    return [];
  }
  try {
    const cacheTags = value.meta?.headers?.[CACHE_TAGS_HEADER]?.split(",") ?? [];
    delete value.meta?.headers?.[CACHE_TAGS_HEADER];
    return cacheTags;
  } catch (e) {
    return [];
  }
}

// node_modules/@opennextjs/aws/dist/utils/routeCacheKey.js
import { createHash as createHash2 } from "node:crypto";
var ROUTE_CACHE_DIRECTORY = "route-cache";
var DYNAMIC_ROUTE_REGEX = /\/\[[^/]+?\](?=\/|$)/;
function useRouteCacheKeys(nextVersion) {
  return compareSemver(nextVersion, ">=", "15.5.27") && compareSemver(nextVersion, "<", "16.0.0") || compareSemver(nextVersion, ">=", "16.3.8");
}
function normalizePagePath(page) {
  if (/^\/index(\/|$)/.test(page) && !DYNAMIC_ROUTE_REGEX.test(page)) {
    return `/index${page}`;
  }
  if (page === "/") {
    return "/index";
  }
  return page.startsWith("/") ? page : `/${page}`;
}
function normalizeAppPath(entry) {
  const pathname = entry.split("/").reduce((acc, segment, index, segments) => {
    if (!segment)
      return acc;
    if (segment.startsWith("(") && segment.endsWith(")"))
      return acc;
    if (segment.startsWith("@"))
      return acc;
    if ((segment === "page" || segment === "route") && index === segments.length - 1) {
      return acc;
    }
    return `${acc}/${segment}`;
  }, "");
  return pathname === "" ? "/" : pathname;
}
function compareAppPaths(a, b) {
  const aHasSlot = a.includes("/@");
  const bHasSlot = b.includes("/@");
  if (aHasSlot && !bHasSlot)
    return -1;
  if (!aHasSlot && bHasSlot)
    return 1;
  return a.localeCompare(b);
}
function selectAppPageEntry(route, appPaths) {
  let entry;
  for (const appPath of appPaths) {
    if (normalizeAppPath(appPath).replace(/%5F/g, "_") !== route)
      continue;
    if (entry === void 0 || compareAppPaths(entry, appPath) < 0) {
      entry = appPath;
    }
  }
  return entry;
}
function getRouteCacheOwner(sourceRoute, { appPaths, pagesManifest }) {
  const appEntry = selectAppPageEntry(sourceRoute, appPaths);
  if (appEntry) {
    return {
      kind: appEntry.endsWith("/route") ? "APP_ROUTE" : "APP_PAGE",
      sourceRoute: appEntry
    };
  }
  if (Object.hasOwn(pagesManifest, sourceRoute)) {
    return { kind: "PAGES", sourceRoute };
  }
  return void 0;
}
function normalizeLocalePath(pathname, locales) {
  const segment = pathname.split("/", 2)[1]?.toLowerCase();
  const locale = locales?.find((l) => l.toLowerCase() === segment);
  if (!locale) {
    return pathname;
  }
  return pathname.slice(locale.length + 1) || "/";
}
function getDynamicRouteCachePathname(pathname, locales) {
  if (normalizeLocalePath(pathname, locales) !== "/index") {
    return pathname;
  }
  return pathname.slice(0, -"/index".length) || "/";
}
function getPrerenderRouteCacheKey(pathname, manifests) {
  const { routes, dynamicRoutes } = manifests.prerenderManifest;
  const prerender = Object.hasOwn(routes, pathname) ? routes[pathname] : void 0;
  const fallback = !prerender && Object.hasOwn(dynamicRoutes, pathname) ? dynamicRoutes[pathname] : void 0;
  if (!prerender && !fallback) {
    return void 0;
  }
  const sourceRoute = prerender ? prerender.srcRoute : fallback?.fallbackSourceRoute ?? pathname;
  let owner;
  if (sourceRoute) {
    owner = getRouteCacheOwner(sourceRoute, manifests);
  } else {
    owner = getRouteCacheOwner(pathname, manifests);
    if (!owner && manifests.locales?.length) {
      const pagesOwner = getRouteCacheOwner(normalizeLocalePath(pathname, manifests.locales), manifests);
      owner = pagesOwner?.kind === "PAGES" ? pagesOwner : void 0;
    }
  }
  return owner ? getRouteCacheKey(pathname, owner) : void 0;
}
function getRouteCacheKey(pathname, owner) {
  const source = createHash2("sha256").update(owner.sourceRoute).digest("hex");
  return `/${ROUTE_CACHE_DIRECTORY}/${owner.kind}/${source}/$${normalizePagePath(pathname)}`;
}

// node_modules/@opennextjs/aws/dist/core/routing/cacheInterceptor.js
init_logger();

// node_modules/@opennextjs/aws/dist/core/routing/routeMatcher.js
var optionalLocalePrefixRegex = `^/(?:${RoutesManifest.locales.map((locale) => `${locale}/?`).join("|")})?`;
var optionalBasepathPrefixRegex = RoutesManifest.basePath ? `^${RoutesManifest.basePath}/?` : "^/";
var optionalPrefix = optionalLocalePrefixRegex.replace("^/", optionalBasepathPrefixRegex);
function routeMatcher(routeDefinitions) {
  const regexp = routeDefinitions.map((route) => ({
    page: route.page,
    regexp: new RegExp(route.regex.replace("^/", optionalPrefix))
  }));
  const appPathsSet = /* @__PURE__ */ new Set();
  const routePathsSet = /* @__PURE__ */ new Set();
  for (const [k, v] of Object.entries(AppPathRoutesManifest)) {
    if (k.endsWith("page")) {
      appPathsSet.add(v);
    } else if (k.endsWith("route")) {
      routePathsSet.add(v);
    }
  }
  return function matchRoute(path3) {
    const foundRoutes = regexp.filter((route) => route.regexp.test(path3));
    return foundRoutes.map((foundRoute) => {
      let routeType = "page";
      if (appPathsSet.has(foundRoute.page)) {
        routeType = "app";
      } else if (routePathsSet.has(foundRoute.page)) {
        routeType = "route";
      }
      return {
        route: foundRoute.page,
        type: routeType
      };
    });
  };
}
var staticRouteMatcher = routeMatcher([
  ...RoutesManifest.routes.static,
  ...getStaticAPIRoutes()
]);
var dynamicRouteMatcher = routeMatcher(RoutesManifest.routes.dynamic);
function getStaticAPIRoutes() {
  const createRouteDefinition = (route) => ({
    page: route,
    regex: `^${route}(?:/)?$`
  });
  const dynamicRoutePages = new Set(RoutesManifest.routes.dynamic.map(({ page }) => page));
  const pagesStaticAPIRoutes = Object.keys(PagesManifest).filter((route) => route.startsWith("/api/") && !dynamicRoutePages.has(route)).map(createRouteDefinition);
  const appPathsStaticAPIRoutes = Object.values(AppPathRoutesManifest).filter((route) => (route.startsWith("/api/") || route === "/api") && !dynamicRoutePages.has(route)).map(createRouteDefinition);
  return [...pagesStaticAPIRoutes, ...appPathsStaticAPIRoutes];
}

// node_modules/@opennextjs/aws/dist/core/routing/cacheInterceptor.js
var CACHE_ONE_YEAR = 60 * 60 * 24 * 365;
var CACHE_ONE_MONTH = 60 * 60 * 24 * 30;
var VARY_HEADER = "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch, Next-Url";
var NEXT_SEGMENT_PREFETCH_HEADER = "next-router-segment-prefetch";
var NEXT_PRERENDER_HEADER = "x-nextjs-prerender";
var NEXT_POSTPONED_HEADER = "x-nextjs-postponed";
var MIDDLEWARE_SET_COOKIE_HEADER = "x-middleware-set-cookie";
function getCachedResponseHeaders(headers) {
  const result = {};
  for (const [key, value] of Object.entries(headers ?? {})) {
    if (value === void 0 || key.toLowerCase() === MIDDLEWARE_SET_COOKIE_HEADER) {
      continue;
    }
    result[key] = value;
  }
  return result;
}
async function computeCacheControl(path3, body, host, revalidate, lastModified, isStaleFromTagCache = false, revalidationPath = path3, revalidationKey = path3) {
  let finalRevalidate = CACHE_ONE_YEAR;
  const existingRoute = Object.entries(PrerenderManifest?.routes ?? {}).find((p) => p[0] === path3)?.[1];
  if (revalidate === void 0 && existingRoute) {
    finalRevalidate = existingRoute.initialRevalidateSeconds === false ? CACHE_ONE_YEAR : existingRoute.initialRevalidateSeconds;
  } else if (revalidate !== void 0) {
    finalRevalidate = revalidate === false ? CACHE_ONE_YEAR : revalidate;
  }
  const age = Math.round((Date.now() - (lastModified ?? 0)) / 1e3);
  const hash = (str) => createHash3("md5").update(str).digest("hex");
  const etag = `"${hash(body)}"`;
  if (revalidate === 0) {
    return {
      [CACHE_CONTROL_HEADER]: NO_STORE_CACHE_CONTROL,
      [OPEN_NEXT_CACHE_HEADER]: "ERROR",
      etag
    };
  }
  const isSSG = finalRevalidate === CACHE_ONE_YEAR;
  const remainingTtl = Math.max(finalRevalidate - age, 1);
  const isStaleFromTime = !isSSG && remainingTtl === 1;
  const isStale2 = isStaleFromTime || isStaleFromTagCache;
  if (!isSSG || isStaleFromTagCache) {
    const sMaxAge = isStaleFromTagCache ? 1 : remainingTtl;
    debug("sMaxAge", {
      finalRevalidate,
      age,
      lastModified,
      revalidate,
      isStaleFromTagCache
    });
    if (isStale2) {
      let url = NextConfig.trailingSlash && revalidationPath !== "/" ? `${revalidationPath}/` : revalidationPath;
      if (NextConfig.basePath) {
        url = `${NextConfig.basePath}${url}`;
      }
      await globalThis.queue.send({
        MessageBody: {
          host,
          url,
          eTag: etag,
          lastModified: lastModified ?? Date.now()
        },
        MessageDeduplicationId: hash(`${revalidationKey}-${lastModified}-${etag}`),
        MessageGroupId: generateMessageGroupId(revalidationKey)
      });
    }
    return {
      [CACHE_CONTROL_HEADER]: `s-maxage=${sMaxAge}, stale-while-revalidate=${CACHE_ONE_MONTH}`,
      [OPEN_NEXT_CACHE_HEADER]: isStale2 ? "STALE" : "HIT",
      etag
    };
  }
  return {
    [CACHE_CONTROL_HEADER]: `s-maxage=${CACHE_ONE_YEAR}, stale-while-revalidate=${CACHE_ONE_MONTH}`,
    [OPEN_NEXT_CACHE_HEADER]: "HIT",
    etag
  };
}
function getBodyForAppRouter(event, cachedValue) {
  if (cachedValue.type !== "app") {
    throw new Error("getBodyForAppRouter called with non-app cache value");
  }
  const segmentHeader = event.headers[NEXT_SEGMENT_PREFETCH_HEADER];
  if (typeof segmentHeader === "string" && cachedValue.segmentData) {
    if (Object.hasOwn(cachedValue.segmentData, segmentHeader)) {
      return {
        body: cachedValue.segmentData[segmentHeader],
        additionalHeaders: {
          [NEXT_PRERENDER_HEADER]: "1",
          [NEXT_POSTPONED_HEADER]: "2"
        }
      };
    }
    return void 0;
  }
  if (cachedValue.rsc === void 0) {
    return void 0;
  }
  return { body: cachedValue.rsc, additionalHeaders: {} };
}
async function generateResult(event, localizedPath, cachedValue, lastModified, isStaleFromTagCache = false, cacheKey = localizedPath, revalidationPath = localizedPath) {
  debug("Returning result from experimental cache");
  let body;
  let type = "application/octet-stream";
  let isDataRequest = false;
  let additionalHeaders = {};
  if (cachedValue.type === "app") {
    isDataRequest = event.headers.rsc === "1";
    if (isDataRequest) {
      const appRouterResult = getBodyForAppRouter(event, cachedValue);
      body = appRouterResult?.body;
      additionalHeaders = appRouterResult?.additionalHeaders ?? {};
    } else {
      body = cachedValue.html;
    }
    type = isDataRequest ? "text/x-component" : "text/html; charset=utf-8";
  } else if (cachedValue.type === "page") {
    isDataRequest = Boolean(event.query.__nextDataReq);
    body = isDataRequest ? JSON.stringify(cachedValue.json) : cachedValue.html;
    type = isDataRequest ? "application/json" : "text/html; charset=utf-8";
  } else {
    throw new Error("generateResult called with unsupported cache value type, only 'app' and 'page' are supported");
  }
  if (body === void 0) {
    debug("Missing body in the cache entry, falling back to the server");
    return void 0;
  }
  const cacheControl = await computeCacheControl(localizedPath, body, event.headers.host, cachedValue.revalidate, lastModified, isStaleFromTagCache, revalidationPath, cacheKey);
  const statusCode = computeStatusCode(event.rewriteStatusCode, cachedValue.meta?.status);
  const headers = {
    ...cacheControl,
    "content-type": type,
    ...getCachedResponseHeaders(cachedValue.meta?.headers),
    vary: VARY_HEADER,
    ...additionalHeaders
  };
  fixCacheControlForError(headers, statusCode);
  return {
    type: "core",
    statusCode,
    body: toReadableStream(body, false),
    isBase64Encoded: false,
    headers
  };
}
function computeStatusCode(rewriteStatusCode, cachedStatusCode) {
  if (cachedStatusCode !== void 0 && cachedStatusCode !== 200) {
    return cachedStatusCode;
  }
  return rewriteStatusCode ?? cachedStatusCode ?? 200;
}
function escapePathDelimiters(segment, escapeEncoded) {
  return segment.replace(new RegExp(`([/#?]${escapeEncoded ? "|%(2f|23|3f|5c)" : ""})`, "gi"), (char) => encodeURIComponent(char));
}
function decodePathParams(pathname) {
  return pathname.split("/").map((segment) => escapePathDelimiters(decodeURIComponent(segment), true)).join("/");
}
var routeCacheManifests;
function getRouteCacheManifests() {
  routeCacheManifests ??= {
    prerenderManifest: {
      routes: PrerenderManifest?.routes ?? {},
      dynamicRoutes: PrerenderManifest?.dynamicRoutes ?? {}
    },
    appPaths: Object.keys(AppPathsManifest ?? {}),
    pagesManifest: PagesManifest ?? {},
    locales: NextConfig.i18n?.locales
  };
  return routeCacheManifests;
}
function getCacheKey(event, localizedPath, resolvedRoutes) {
  if (!useRouteCacheKeys(globalThis.nextVersion)) {
    const isISR = Object.keys(PrerenderManifest?.routes ?? {}).includes(localizedPath) || Object.values(PrerenderManifest?.dynamicRoutes ?? {}).some((dr) => new RegExp(dr.routeRegex).test(localizedPath));
    if (!isISR)
      return void 0;
    return localizedPath === "/" ? "/index" : localizedPath;
  }
  const manifests = getRouteCacheManifests();
  if (Object.hasOwn(manifests.prerenderManifest.routes, localizedPath)) {
    const manifestKey = getPrerenderRouteCacheKey(localizedPath, manifests);
    const selectedRoute = resolvedRoutes?.[0];
    if (resolvedRoutes && !selectedRoute)
      return void 0;
    if (!selectedRoute)
      return manifestKey;
    const selectedOwner = getRouteCacheOwner(selectedRoute.route, manifests);
    if (!selectedOwner)
      return void 0;
    const selectedKey = getRouteCacheKey(localizedPath, selectedOwner);
    return selectedKey === manifestKey ? manifestKey : void 0;
  }
  const dynamicRoute = resolvedRoutes ? resolvedRoutes[0] : dynamicRouteMatcher(event.rawPath)[0];
  const dynamicPrerender = dynamicRoute ? manifests.prerenderManifest.dynamicRoutes[dynamicRoute.route] : void 0;
  if (!dynamicRoute || !dynamicPrerender || dynamicPrerender.fallback !== null) {
    return void 0;
  }
  const owner = getRouteCacheOwner(dynamicRoute.route, manifests);
  return owner ? getRouteCacheKey(getDynamicRouteCachePathname(localizedPath, manifests.locales), owner) : void 0;
}
async function cacheInterceptor(event, resolvedRoutes) {
  if (Boolean(event.headers["next-action"]) || Boolean(event.headers[PRERENDER_REVALIDATE_HEADER]))
    return event;
  if (event.method !== "GET" && event.method !== "HEAD")
    return event;
  const cookies = event.headers.cookie || "";
  const hasPreviewData = cookies.includes("__prerender_bypass") || cookies.includes("__next_preview_data");
  if (hasPreviewData) {
    debug("Preview mode detected, passing through to handler");
    return event;
  }
  const basePath = NextConfig.basePath;
  const pathWithoutBasePath = !basePath ? event.rawPath : event.rawPath === basePath ? "/" : event.rawPath.startsWith(`${basePath}/`) ? event.rawPath.slice(basePath.length) : event.rawPath;
  let localizedPath = localizePath({ ...event, rawPath: pathWithoutBasePath });
  localizedPath = localizedPath.replace(/\/$/, "");
  const revalidationPath = localizedPath || "/";
  try {
    localizedPath = decodePathParams(localizedPath) || "/";
  } catch {
    return event;
  }
  debug("Checking cache for", localizedPath, PrerenderManifest);
  const cacheKey = getCacheKey(event, localizedPath, resolvedRoutes);
  debug("cacheKey", cacheKey);
  if (cacheKey) {
    try {
      const cachedData = await globalThis.incrementalCache.get(cacheKey);
      debug("cached data in interceptor", cachedData);
      if (!cachedData?.value) {
        return event;
      }
      const tags = getTagsFromValue(cachedData.value);
      if (cachedData.value?.type === "app" || cachedData.value?.type === "route") {
        const _hasBeenRevalidated = cachedData.shouldBypassTagCache ? false : await hasBeenRevalidated(cacheKey, tags, cachedData);
        if (_hasBeenRevalidated) {
          return event;
        }
      }
      const _isStale = cachedData.shouldBypassTagCache ? false : await isStale(cacheKey, tags, cachedData.lastModified ?? Date.now());
      const host = event.headers.host;
      switch (cachedData?.value?.type) {
        case "app":
        case "page": {
          const result = await generateResult(event, localizedPath, cachedData.value, cachedData.lastModified, _isStale, cacheKey, revalidationPath);
          return result ?? event;
        }
        case "redirect": {
          const cacheControl = await computeCacheControl(localizedPath, "", host, cachedData.value.revalidate, cachedData.lastModified, _isStale, revalidationPath, cacheKey);
          return {
            type: "core",
            statusCode: cachedData.value.meta?.status ?? 307,
            body: emptyReadableStream(),
            headers: {
              ...getCachedResponseHeaders(cachedData.value.meta?.headers),
              ...cacheControl
            },
            isBase64Encoded: false
          };
        }
        case "route": {
          const cacheControl = await computeCacheControl(localizedPath, cachedData.value.body, host, cachedData.value.revalidate, cachedData.lastModified, _isStale, revalidationPath, cacheKey);
          const isBinary = isBinaryContentType(String(cachedData.value.meta?.headers?.["content-type"]));
          const statusCode = computeStatusCode(event.rewriteStatusCode, cachedData.value.meta?.status);
          const headers = {
            ...cacheControl,
            ...getCachedResponseHeaders(cachedData.value.meta?.headers),
            vary: VARY_HEADER
          };
          fixCacheControlForError(headers, statusCode);
          return {
            type: "core",
            statusCode,
            body: toReadableStream(cachedData.value.body, isBinary),
            headers,
            isBase64Encoded: isBinary
          };
        }
        default:
          return event;
      }
    } catch (e) {
      debug("Error while fetching cache", e);
      return event;
    }
  }
  return event;
}

// node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
function parse2(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path3 = "";
  var tryConsume = function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  };
  var mustConsume = function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  };
  var consumeText = function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  };
  var isSafe = function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  };
  var safePattern = function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  };
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path3 += prefix;
        prefix = "";
      }
      if (path3) {
        result.push(path3);
        path3 = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path3 += value;
      continue;
    }
    if (path3) {
      result.push(path3);
      path3 = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
function compile(str, options) {
  return tokensToFunction(parse2(str, options), options);
}
function tokensToFunction(tokens, options) {
  if (options === void 0) {
    options = {};
  }
  var reFlags = flags(options);
  var _a = options.encode, encode = _a === void 0 ? function(x) {
    return x;
  } : _a, _b = options.validate, validate = _b === void 0 ? true : _b;
  var matches = tokens.map(function(token) {
    if (typeof token === "object") {
      return new RegExp("^(?:".concat(token.pattern, ")$"), reFlags);
    }
  });
  return function(data) {
    var path3 = "";
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if (typeof token === "string") {
        path3 += token;
        continue;
      }
      var value = data ? data[token.name] : void 0;
      var optional = token.modifier === "?" || token.modifier === "*";
      var repeat = token.modifier === "*" || token.modifier === "+";
      if (Array.isArray(value)) {
        if (!repeat) {
          throw new TypeError('Expected "'.concat(token.name, '" to not repeat, but got an array'));
        }
        if (value.length === 0) {
          if (optional)
            continue;
          throw new TypeError('Expected "'.concat(token.name, '" to not be empty'));
        }
        for (var j = 0; j < value.length; j++) {
          var segment = encode(value[j], token);
          if (validate && !matches[i].test(segment)) {
            throw new TypeError('Expected all "'.concat(token.name, '" to match "').concat(token.pattern, '", but got "').concat(segment, '"'));
          }
          path3 += token.prefix + segment + token.suffix;
        }
        continue;
      }
      if (typeof value === "string" || typeof value === "number") {
        var segment = encode(String(value), token);
        if (validate && !matches[i].test(segment)) {
          throw new TypeError('Expected "'.concat(token.name, '" to match "').concat(token.pattern, '", but got "').concat(segment, '"'));
        }
        path3 += token.prefix + segment + token.suffix;
        continue;
      }
      if (optional)
        continue;
      var typeOfMessage = repeat ? "an array" : "a string";
      throw new TypeError('Expected "'.concat(token.name, '" to be ').concat(typeOfMessage));
    }
    return path3;
  };
}
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path3 = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    };
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path: path3, index, params };
  };
}
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
function regexpToRegexp(path3, keys) {
  if (!keys)
    return path3;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path3.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path3.source);
  }
  return path3;
}
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path3) {
    return pathToRegexp(path3, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
function stringToRegexp(path3, keys, options) {
  return tokensToRegexp(parse2(path3, options), keys, options);
}
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
function pathToRegexp(path3, keys, options) {
  if (path3 instanceof RegExp)
    return regexpToRegexp(path3, keys);
  if (Array.isArray(path3))
    return arrayToRegexp(path3, keys, options);
  return stringToRegexp(path3, keys, options);
}

// node_modules/@opennextjs/aws/dist/utils/normalize-path.js
import path2 from "node:path";
function normalizeRepeatedSlashes(url) {
  const urlNoQuery = url.host + url.pathname;
  return `${url.protocol}//${urlNoQuery.replace(/\\/g, "/").replace(/\/\/+/g, "/")}${url.search}`;
}

// node_modules/@opennextjs/aws/dist/core/routing/matcher.js
init_stream();
init_logger();
var compiledRegExps = /* @__PURE__ */ new Map();
function getCompiledRegExp(pattern, flags2 = "") {
  const key = `/${pattern}/${flags2}`;
  let regExp = compiledRegExps.get(key);
  if (!regExp) {
    regExp = new RegExp(pattern, flags2);
    compiledRegExps.set(key, regExp);
  }
  regExp.lastIndex = 0;
  return regExp;
}
function matchHasValue(value, pattern) {
  if (!value)
    return false;
  if (!pattern)
    return true;
  const candidate = Array.isArray(value) ? value.at(-1) : value;
  return candidate !== void 0 && getCompiledRegExp(`^${pattern}$`).test(candidate);
}
function getHostname(headers) {
  return headers.host?.split(":", 1)[0].toLowerCase();
}
function getSafeParamName(name) {
  return name.replaceAll(/[^a-zA-Z]/g, "");
}
var routeHasMatcher = (headers, cookies, query) => (redirect) => {
  switch (redirect.type) {
    case "header":
      return matchHasValue(headers[redirect.key.toLowerCase()], redirect.value);
    case "cookie":
      return matchHasValue(cookies[redirect.key], redirect.value);
    case "query":
      return matchHasValue(query[redirect.key], redirect.value);
    case "host":
      return matchHasValue(getHostname(headers), redirect.value);
    default:
      return false;
  }
};
function checkHas(matcher, has, inverted = false) {
  return has ? has.reduce((acc, cur) => {
    if (acc === false)
      return false;
    return inverted ? !matcher(cur) : matcher(cur);
  }, true) : true;
}
var getParamsFromSource = (source) => (value) => {
  debug("value", value);
  const _match = source(value);
  return _match ? _match.params : {};
};
var computeParamHas = (headers, cookies, query) => (has) => {
  if (!has.value) {
    let key;
    let value;
    switch (has.type) {
      case "header":
        key = has.key.toLowerCase();
        value = headers[key];
        break;
      case "cookie":
        key = has.key;
        value = cookies[key];
        break;
      case "query":
        key = has.key;
        value = query[key];
        break;
      case "host":
        return {};
    }
    return value ? { [getSafeParamName(key)]: value } : {};
  }
  const matcher = getCompiledRegExp(`^${has.value}$`);
  const fromSource = (value, implicitKey) => {
    const matches = value.match(matcher);
    if (matches?.groups)
      return matches.groups;
    return implicitKey && matches?.[0] ? { [implicitKey]: matches[0] } : {};
  };
  switch (has.type) {
    case "header":
      return fromSource(headers[has.key.toLowerCase()] ?? "");
    case "cookie":
      return fromSource(cookies[has.key] ?? "");
    case "query":
      return fromSource(Array.isArray(query[has.key]) ? query[has.key].at(-1) ?? "" : query[has.key] ?? "");
    case "host":
      return fromSource(getHostname(headers) ?? "", "host");
  }
};
function compileNonPath(value, params) {
  if (!value.includes(":"))
    return value;
  let compiledValue = value;
  for (const key of Object.keys(params)) {
    if (!compiledValue.includes(`:${key}`))
      continue;
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    compiledValue = compiledValue.replace(getCompiledRegExp(`:${escapedKey}\\*`, "g"), `:${key}--ESCAPED_PARAM_ASTERISKS`).replace(getCompiledRegExp(`:${escapedKey}\\?`, "g"), `:${key}--ESCAPED_PARAM_QUESTION`).replace(getCompiledRegExp(`:${escapedKey}\\+`, "g"), `:${key}--ESCAPED_PARAM_PLUS`).replace(getCompiledRegExp(`:${escapedKey}(?!\\w)`, "g"), `--ESCAPED_PARAM_COLON${key}`);
  }
  compiledValue = compiledValue.replace(/(:|\*|\?|\+|\(|\)|\{|\})/g, "\\$1").replaceAll("--ESCAPED_PARAM_PLUS", "+").replaceAll("--ESCAPED_PARAM_COLON", ":").replaceAll("--ESCAPED_PARAM_QUESTION", "?").replaceAll("--ESCAPED_PARAM_ASTERISKS", "*");
  return compile(`/${compiledValue}`, { validate: false })(params).slice(1);
}
function compileQueryString(queryString, params) {
  return queryString.split("&").map((part) => {
    const separator = part.indexOf("=");
    if (separator === -1)
      return part;
    const key = part.slice(0, separator + 1);
    return `${key}${compileNonPath(part.slice(separator + 1), params)}`;
  }).join("&");
}
function getNextConfigHeaders(event, configHeaders) {
  if (!configHeaders) {
    return {};
  }
  const matcher = routeHasMatcher(event.headers, event.cookies, event.query);
  const computeHas = computeParamHas(event.headers, event.cookies, event.query);
  const requestHeaders = {};
  const localizedRawPath = localizePath(event);
  for (const { headers, has, missing, regex, source, locale } of configHeaders) {
    const path3 = locale === false ? event.rawPath : localizedRawPath;
    if (getCompiledRegExp(regex).test(path3) && checkHas(matcher, has) && checkHas(matcher, missing, true)) {
      const fromSource = match(source);
      const _match = fromSource(path3);
      const params = {
        ..._match ? _match.params : {},
        ...has?.reduce((acc, cur) => {
          return Object.assign(acc, computeHas(cur));
        }, {})
      };
      const hasParams = Object.keys(params).length > 0;
      headers.forEach((h) => {
        try {
          const key = hasParams ? compileNonPath(h.key, params) : h.key;
          const value = hasParams ? compileNonPath(h.value, params) : h.value;
          requestHeaders[key] = value;
        } catch {
          debug(`Error matching header ${h.key} with value ${h.value}`);
          requestHeaders[h.key] = h.value;
        }
      });
    }
  }
  return requestHeaders;
}
function handleRewrites(event, rewrites, appendParamsToQuery = true) {
  const { rawPath, headers, query, cookies, url } = event;
  const localizedRawPath = localizePath(event);
  const matcher = routeHasMatcher(headers, cookies, query);
  const computeHas = computeParamHas(headers, cookies, query);
  const rewrite = rewrites.find((route) => {
    const path3 = route.locale === false ? rawPath : localizedRawPath;
    return getCompiledRegExp(route.regex).test(path3) && checkHas(matcher, route.has) && checkHas(matcher, route.missing, true);
  });
  let finalQuery = query;
  let rewrittenUrl = url;
  const isExternalRewrite = isExternal(rewrite?.destination);
  debug("isExternalRewrite", isExternalRewrite);
  if (rewrite) {
    const { pathname, protocol, hostname, queryString, hash } = getUrlParts(rewrite.destination, isExternalRewrite);
    const pathToUse = rewrite.locale === false ? rawPath : localizedRawPath;
    debug("urlParts", { pathname, protocol, hostname, queryString, hash });
    const compileOptions = { validate: false };
    const toDestinationPath = compile(escapeRegex(pathname, { isPath: true }), compileOptions);
    const toDestinationHost = compile(escapeRegex(hostname).replace(/:(\d+)$/, "\\:$1"), { ...compileOptions, encode: encodeURIComponent });
    const params = {
      // params for the source
      ...getParamsFromSource(match(escapeRegex(rewrite.source, { isPath: true })))(pathToUse),
      // params for the has
      ...rewrite.has?.reduce((acc, cur) => {
        return Object.assign(acc, computeHas(cur));
      }, {})
    };
    const isUsingParams = Object.keys(params).length > 0;
    const queryParams = Object.fromEntries(Object.entries(params).filter(([key]) => key !== "nextInternalLocale"));
    const destinationParams = [
      ...parse2(escapeRegex(`${pathname}${hash}`, { isPath: true })),
      ...hostname ? parse2(escapeRegex(hostname).replace(/:(\d+)$/, "\\:$1")) : []
    ].flatMap((token) => typeof token === "string" ? [] : [String(token.name)]);
    let rewrittenQuery = queryString;
    let rewrittenHost = hostname;
    let rewrittenHash = hash;
    let rewrittenPath = unescapeRegex(toDestinationPath(params));
    if (pathname.startsWith("/") && !rewrittenPath.startsWith("/")) {
      rewrittenPath = `/${rewrittenPath}`;
    }
    if (isUsingParams) {
      rewrittenHost = unescapeRegex(toDestinationHost(params));
      rewrittenQuery = compileQueryString(queryString, params);
      rewrittenHash = compileNonPath(hash, params);
    }
    if (NextConfig.i18n && !isExternalRewrite) {
      const strippedPathLocale = rewrittenPath.replace(getCompiledRegExp(`^/(${NextConfig.i18n.locales.join("|")})`), "");
      if (strippedPathLocale.startsWith("/api/")) {
        rewrittenPath = strippedPathLocale;
      }
    }
    rewrittenUrl = isExternalRewrite ? `${protocol}//${rewrittenHost}${rewrittenPath}` : new URL(rewrittenPath, event.url).href;
    const destinationQuery = convertFromQueryString(rewrittenQuery);
    finalQuery = {
      ...query,
      ...!appendParamsToQuery || Object.keys(queryParams).some((key) => destinationParams.includes(key)) ? {} : queryParams,
      ...destinationQuery
    };
    rewrittenUrl += convertToQueryString(finalQuery);
    rewrittenUrl += rewrittenHash;
    debug("rewrittenUrl", { rewrittenUrl, finalQuery, isUsingParams });
  }
  return {
    internalEvent: {
      ...event,
      query: finalQuery,
      rawPath: new URL(rewrittenUrl).pathname,
      url: rewrittenUrl
    },
    __rewrite: rewrite,
    isExternalRewrite
  };
}
function handleBeforeFilesRewrites(event, rewrites) {
  let result = {
    internalEvent: event,
    __rewrite: void 0,
    isExternalRewrite: false
  };
  for (const rewrite of rewrites) {
    const rewriteResult = handleRewrites(result.internalEvent, [rewrite]);
    if (!rewriteResult.__rewrite)
      continue;
    result = rewriteResult;
    if (result.isExternalRewrite)
      break;
  }
  return result;
}
function handleRepeatedSlashRedirect(event) {
  if (event.rawPath.match(/(\\|\/\/)/)) {
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: normalizeRepeatedSlashes(new URL(event.url))
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
  return false;
}
function handleTrailingSlashRedirect(event) {
  const url = new URL(event.rawPath, "http://localhost");
  if (
    // Someone is trying to redirect to a different origin, let's not do that
    url.host !== "localhost" || NextConfig.skipTrailingSlashRedirect
  ) {
    return false;
  }
  const emptyBody = emptyReadableStream();
  if (NextConfig.trailingSlash && // Data requests (`/_next/data/<buildId>/*.json`) are never redirected, as with Next.js.
  // The header is set by `fixDataPage`, a client supplied value is removed by the routing handler.
  // The `__nextDataReq` query parameter can not be used as it is set by the client.
  event.headers["x-nextjs-data"] !== "1" && !event.rawPath.endsWith("/") && !event.rawPath.match(/[\w-]+\.[\w]+$/g)) {
    const headersLocation = event.url.split("?");
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: `${headersLocation[0]}/${headersLocation[1] ? `?${headersLocation[1]}` : ""}`
      },
      body: emptyBody,
      isBase64Encoded: false
    };
  }
  if (!NextConfig.trailingSlash && event.rawPath.endsWith("/") && event.rawPath !== "/") {
    const headersLocation = event.url.split("?");
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: `${headersLocation[0].replace(/\/$/, "")}${headersLocation[1] ? `?${headersLocation[1]}` : ""}`
      },
      body: emptyBody,
      isBase64Encoded: false
    };
  }
  return false;
}
function handleRedirects(event, redirects) {
  const repeatedSlashRedirect = handleRepeatedSlashRedirect(event);
  if (repeatedSlashRedirect)
    return repeatedSlashRedirect;
  const trailingSlashRedirect = handleTrailingSlashRedirect(event);
  if (trailingSlashRedirect)
    return trailingSlashRedirect;
  const localeRedirect = handleLocaleRedirect(event);
  if (localeRedirect)
    return localeRedirect;
  const { internalEvent, __rewrite } = handleRewrites(event, redirects.filter((r) => !r.internal), false);
  if (__rewrite && !__rewrite.internal) {
    return {
      type: event.type,
      statusCode: __rewrite.statusCode ?? 308,
      headers: {
        Location: internalEvent.url
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
}
function fixDataPage(internalEvent, buildId) {
  const { rawPath, query } = internalEvent;
  const basePath = NextConfig.basePath ?? "";
  const dataPattern = `${basePath}/_next/data/${buildId}`;
  if (rawPath.startsWith("/_next/data") && !rawPath.startsWith(dataPattern)) {
    return {
      type: internalEvent.type,
      statusCode: 404,
      body: toReadableStream("{}"),
      headers: {
        "Content-Type": "application/json"
      },
      isBase64Encoded: false
    };
  }
  if (rawPath.startsWith(dataPattern) && rawPath.endsWith(".json")) {
    const newPath = `${basePath}${rawPath.slice(dataPattern.length, -".json".length).replace(/^\/index$/, "/")}`;
    query.__nextDataReq = "1";
    return {
      ...internalEvent,
      rawPath: newPath,
      query,
      headers: {
        ...internalEvent.headers,
        "x-nextjs-data": "1"
      },
      url: new URL(`${newPath}${convertToQueryString(query)}`, internalEvent.url).href
    };
  }
  return internalEvent;
}
function handleFallbackFalse(internalEvent, prerenderManifest) {
  const { rawPath } = internalEvent;
  const { dynamicRoutes = {}, routes = {} } = prerenderManifest ?? {};
  const prerenderedFallbackRoutes = Object.entries(dynamicRoutes).filter(([, { fallback }]) => fallback === false);
  const routeFallback = prerenderedFallbackRoutes.some(([, { routeRegex }]) => getCompiledRegExp(routeRegex).test(rawPath));
  const locales = NextConfig.i18n?.locales;
  const routesAlreadyHaveLocale = locales?.includes(rawPath.split("/")[1]) || // If we don't use locales, we don't need to add the default locale
  locales === void 0;
  let localizedPath = routesAlreadyHaveLocale ? rawPath : `/${NextConfig.i18n?.defaultLocale}${rawPath}`;
  if (
    // Not if localizedPath is "/" tho, because that would not make it find `isPregenerated` below since it would be try to match an empty string.
    localizedPath !== "/" && NextConfig.trailingSlash && localizedPath.endsWith("/")
  ) {
    localizedPath = localizedPath.slice(0, -1);
  }
  const matchedStaticRoute = staticRouteMatcher(localizedPath);
  const prerenderedFallbackRoutesName = prerenderedFallbackRoutes.map(([name]) => name);
  const matchedDynamicRoute = dynamicRouteMatcher(localizedPath).filter(({ route }) => !prerenderedFallbackRoutesName.includes(route));
  const isPregenerated = Object.keys(routes).includes(localizedPath);
  if (routeFallback && !isPregenerated && matchedStaticRoute.length === 0 && matchedDynamicRoute.length === 0) {
    return {
      event: {
        ...internalEvent,
        rawPath: "/404",
        url: constructNextUrl(internalEvent.url, "/404"),
        headers: {
          ...internalEvent.headers,
          "x-invoke-status": "404"
        }
      },
      isISR: false
    };
  }
  return {
    event: internalEvent,
    isISR: routeFallback || isPregenerated
  };
}

// node_modules/@opennextjs/aws/dist/core/routing/middleware.js
init_util();
init_stream();
init_utils();
var middlewareManifest = MiddlewareManifest;
var functionsConfigManifest = FunctionsConfigManifest;
var middleMatch = getMiddlewareMatch(middlewareManifest, functionsConfigManifest);
var REDIRECTS = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
var MIDDLEWARE_SET_COOKIE_HEADER2 = "x-middleware-set-cookie";
function defaultMiddlewareLoader() {
  return Promise.resolve().then(() => (init_edgeFunctionHandler(), edgeFunctionHandler_exports));
}
async function handleMiddleware(internalEvent, initialSearch, middlewareLoader = defaultMiddlewareLoader) {
  const headers = internalEvent.headers;
  if (headers[ISR_HEADER] && headers[PRERENDER_REVALIDATE_HEADER] === PrerenderManifest?.preview?.previewModeId)
    return internalEvent;
  const normalizedPath = localizePath(internalEvent);
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(normalizedPath);
  } catch {
  }
  const hasMatch = middleMatch.some((r) => r.test(normalizedPath) || decodedPath !== void 0 && r.test(decodedPath));
  if (!hasMatch)
    return internalEvent;
  const initialUrl = new URL(normalizedPath, internalEvent.url);
  initialUrl.search = initialSearch;
  const url = initialUrl.href;
  const middleware = await middlewareLoader();
  const result = await middleware.default({
    // `geo` is pre Next 15.
    geo: {
      // The city name is percent-encoded.
      // See https://github.com/vercel/vercel/blob/4cb6143/packages/functions/src/headers.ts#L94C19-L94C37
      city: decodeURIComponent(headers["x-open-next-city"]),
      country: headers["x-open-next-country"],
      region: headers["x-open-next-region"],
      latitude: headers["x-open-next-latitude"],
      longitude: headers["x-open-next-longitude"]
    },
    headers,
    method: internalEvent.method || "GET",
    nextConfig: {
      basePath: NextConfig.basePath,
      i18n: NextConfig.i18n,
      trailingSlash: NextConfig.trailingSlash
    },
    url,
    body: convertBodyToReadableStream(internalEvent.method, internalEvent.body)
  });
  const statusCode = result.status;
  const responseHeaders = result.headers;
  const reqHeaders = {};
  const resHeaders = {};
  let middlewareSetCookie;
  const filteredHeaders = [
    "x-middleware-override-headers",
    "x-middleware-next",
    "x-middleware-rewrite",
    // We need to drop `content-encoding` because it will be decoded
    "content-encoding"
  ];
  const xMiddlewareKey = "x-middleware-request-";
  responseHeaders.forEach((value, key) => {
    const normalizedKey = key.toLowerCase();
    if (normalizedKey.startsWith(xMiddlewareKey)) {
      const k = normalizedKey.substring(xMiddlewareKey.length);
      reqHeaders[k] = value;
    } else {
      if (filteredHeaders.includes(normalizedKey))
        return;
      if (normalizedKey === MIDDLEWARE_SET_COOKIE_HEADER2) {
        middlewareSetCookie = value;
        return;
      }
      if (normalizedKey === "set-cookie")
        return;
      if (REDIRECTS.has(statusCode) && normalizedKey === "location") {
        resHeaders[normalizedKey] = normalizeLocationHeader(value, internalEvent.url);
      } else {
        resHeaders[normalizedKey] = value;
      }
    }
  });
  const setCookies = responseHeaders.getSetCookie().flatMap((maybeCompoundCookie) => parseSetCookieHeader(maybeCompoundCookie));
  if (setCookies.length > 0) {
    resHeaders["set-cookie"] = setCookies;
  }
  const overrideHeaders = responseHeaders.get("x-middleware-override-headers");
  const overriddenHeaders = overrideHeaders === null ? void 0 : new Set(overrideHeaders.split(",").map((key) => key.trim().toLowerCase()));
  const newHeaders = Object.fromEntries([...Object.entries(internalEvent.headers), ...Object.entries(reqHeaders)].map(([key, value]) => [key.toLowerCase(), value]).filter(([key]) => !overriddenHeaders || overriddenHeaders.has(key)));
  if (middlewareSetCookie !== void 0) {
    newHeaders[MIDDLEWARE_SET_COOKIE_HEADER2] = middlewareSetCookie;
  }
  const rewriteUrl = responseHeaders.get("x-middleware-rewrite");
  let isExternalRewrite = false;
  let middlewareQuery = internalEvent.query;
  let newUrl = internalEvent.url;
  if (rewriteUrl) {
    newUrl = rewriteUrl;
    if (isExternal(newUrl, internalEvent.headers.host)) {
      isExternalRewrite = true;
    } else {
      const rewriteUrlObject = new URL(rewriteUrl);
      middlewareQuery = getQueryFromSearchParams(rewriteUrlObject.searchParams);
      if ("__nextDataReq" in internalEvent.query) {
        middlewareQuery.__nextDataReq = internalEvent.query.__nextDataReq;
      }
    }
  }
  if (!rewriteUrl && !responseHeaders.get("x-middleware-next")) {
    const body = result.body ?? emptyReadableStream();
    return {
      type: internalEvent.type,
      statusCode,
      headers: resHeaders,
      body,
      isBase64Encoded: false
    };
  }
  return {
    responseHeaders: resHeaders,
    url: newUrl,
    rawPath: new URL(newUrl).pathname,
    type: internalEvent.type,
    headers: newHeaders,
    body: internalEvent.body,
    method: internalEvent.method,
    query: middlewareQuery,
    cookies: internalEvent.cookies,
    remoteAddress: internalEvent.remoteAddress,
    isExternalRewrite,
    rewriteStatusCode: rewriteUrl && !isExternalRewrite ? statusCode : void 0
  };
}

// node_modules/@opennextjs/aws/dist/core/routing/routeParamPlaceholder.js
var PLACEHOLDER_REGEX = /\[\[\.\.\.[^\]]+\]\]|\[(?:\.\.\.)?[^\]]+\]/g;
var OPENING_BRACKET_REGEX = /\[|%5b/i;
function hasRouteParamPlaceholder(pathname) {
  if (!OPENING_BRACKET_REGEX.test(pathname)) {
    return false;
  }
  const placeholders = new Set(dynamicRouteMatcher(pathname).filter(({ type }) => type === "app").flatMap(({ route }) => route.match(PLACEHOLDER_REGEX) ?? []));
  return placeholders.size > 0 && pathname.split("/").some((segment) => placeholders.has(safeDecode(segment)));
}
function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return "";
  }
}

// node_modules/@opennextjs/aws/dist/core/routingHandler.js
var MIDDLEWARE_HEADER_PREFIX = "x-middleware-response-";
var MIDDLEWARE_HEADER_PREFIX_LEN = MIDDLEWARE_HEADER_PREFIX.length;
var INTERNAL_HEADER_PREFIX = "x-opennext-";
var INTERNAL_HEADER_INITIAL_URL = `${INTERNAL_HEADER_PREFIX}initial-url`;
var INTERNAL_HEADER_LOCALE = `${INTERNAL_HEADER_PREFIX}locale`;
var INTERNAL_HEADER_RESOLVED_ROUTES = `${INTERNAL_HEADER_PREFIX}resolved-routes`;
var INTERNAL_HEADER_REWRITE_STATUS_CODE = `${INTERNAL_HEADER_PREFIX}rewrite-status-code`;
var INTERNAL_EVENT_REQUEST_ID = `${INTERNAL_HEADER_PREFIX}request-id`;
var geoHeaderToNextHeader = {
  "x-open-next-city": "x-vercel-ip-city",
  "x-open-next-country": "x-vercel-ip-country",
  "x-open-next-region": "x-vercel-ip-country-region",
  "x-open-next-latitude": "x-vercel-ip-latitude",
  "x-open-next-longitude": "x-vercel-ip-longitude"
};
var NEXT_INTERNAL_HEADERS = [
  "x-middleware-rewrite",
  "x-middleware-redirect",
  "x-middleware-set-cookie",
  "x-middleware-skip",
  "x-middleware-override-headers",
  "x-middleware-next",
  "x-now-route-matches",
  "x-matched-path",
  "x-nextjs-data",
  "x-next-resume-state-length"
];
function applyMiddlewareHeaders(eventOrResult, middlewareHeaders) {
  const isResult = isInternalResult(eventOrResult);
  const headers = eventOrResult.headers;
  const keyPrefix = isResult ? "" : MIDDLEWARE_HEADER_PREFIX;
  Object.entries(middlewareHeaders).forEach(([key, value]) => {
    if (value) {
      headers[keyPrefix + key] = Array.isArray(value) ? value.join(",") : value;
    }
  });
}
async function routingHandler(event, { assetResolver }) {
  try {
    for (const [openNextGeoName, nextGeoName] of Object.entries(geoHeaderToNextHeader)) {
      const value = event.headers[openNextGeoName];
      if (value) {
        event.headers[nextGeoName] = value;
      }
    }
    for (const key of Object.keys(event.headers)) {
      const lowerCaseKey = key.toLowerCase();
      if (lowerCaseKey.startsWith(INTERNAL_HEADER_PREFIX) || lowerCaseKey.startsWith(MIDDLEWARE_HEADER_PREFIX) || NEXT_INTERNAL_HEADERS.includes(lowerCaseKey)) {
        delete event.headers[key];
      }
    }
    let headers = getNextConfigHeaders(event, ConfigHeaders);
    let eventOrResult = fixDataPage(event, BuildId);
    if (isInternalResult(eventOrResult)) {
      return eventOrResult;
    }
    const redirect = handleRedirects(eventOrResult, RoutesManifest.redirects);
    if (redirect) {
      redirect.headers.Location = normalizeLocationHeader(redirect.headers.Location, event.url, true);
      debug("redirect", redirect);
      return redirect;
    }
    const middlewareEventOrResult = await handleMiddleware(
      eventOrResult,
      // We need to pass the initial search without any decoding
      // TODO: we'd need to refactor InternalEvent to include the initial querystring directly
      // Should be done in another PR because it is a breaking change
      new URL(event.url).search
    );
    if (isInternalResult(middlewareEventOrResult)) {
      return middlewareEventOrResult;
    }
    const middlewareHeadersPrioritized = globalThis.openNextConfig.dangerous?.middlewareHeadersOverrideNextConfigHeaders ?? false;
    if (middlewareHeadersPrioritized) {
      headers = {
        ...headers,
        ...middlewareEventOrResult.responseHeaders
      };
    } else {
      headers = {
        ...middlewareEventOrResult.responseHeaders,
        ...headers
      };
    }
    let isExternalRewrite = middlewareEventOrResult.isExternalRewrite ?? false;
    eventOrResult = middlewareEventOrResult;
    if (!isExternalRewrite) {
      const beforeRewrite = handleBeforeFilesRewrites(eventOrResult, RoutesManifest.rewrites.beforeFiles);
      eventOrResult = beforeRewrite.internalEvent;
      isExternalRewrite = beforeRewrite.isExternalRewrite;
      if (!isExternalRewrite) {
        const assetResult = await assetResolver?.maybeGetAssetResult?.(eventOrResult);
        if (assetResult) {
          applyMiddlewareHeaders(assetResult, headers);
          return assetResult;
        }
      }
    }
    const foundStaticRoute = staticRouteMatcher(eventOrResult.rawPath);
    const isStaticRoute = !isExternalRewrite && foundStaticRoute.length > 0;
    if (!(isStaticRoute || isExternalRewrite)) {
      const afterRewrite = handleRewrites(eventOrResult, RoutesManifest.rewrites.afterFiles);
      eventOrResult = afterRewrite.internalEvent;
      isExternalRewrite = afterRewrite.isExternalRewrite;
    }
    let isISR = false;
    if (!isExternalRewrite) {
      const fallbackResult = handleFallbackFalse(eventOrResult, PrerenderManifest);
      eventOrResult = fallbackResult.event;
      isISR = fallbackResult.isISR;
    }
    const foundDynamicRoute = dynamicRouteMatcher(eventOrResult.rawPath);
    const isDynamicRoute = !isExternalRewrite && foundDynamicRoute.length > 0;
    if (!(isDynamicRoute || isStaticRoute || isExternalRewrite)) {
      const fallbackRewrites = handleRewrites(eventOrResult, RoutesManifest.rewrites.fallback);
      eventOrResult = fallbackRewrites.internalEvent;
      isExternalRewrite = fallbackRewrites.isExternalRewrite;
    }
    const isNextImageRoute = eventOrResult.rawPath.startsWith("/_next/image");
    const isRouteFoundBeforeAllRewrites = isStaticRoute || isDynamicRoute || isExternalRewrite;
    let resolvedRoutes = [
      ...staticRouteMatcher(eventOrResult.rawPath),
      ...dynamicRouteMatcher(eventOrResult.rawPath)
    ];
    if (!(isRouteFoundBeforeAllRewrites || isNextImageRoute || // We need to check again once all rewrites have been applied
    staticRouteMatcher(eventOrResult.rawPath).length > 0 || dynamicRouteMatcher(eventOrResult.rawPath).length > 0) || // Next.js versions before 16.4.5 treat a param whose value is its placeholder (e.g. `[slug]`) as unresolved.
    // Next.js receives both the rawPath and the URL pathname, which is normalized (e.g. dot segments).
    !isExternalRewrite && [eventOrResult.rawPath, new URL(eventOrResult.url).pathname].some(hasRouteParamPlaceholder)) {
      resolvedRoutes = [];
      eventOrResult = {
        ...eventOrResult,
        rawPath: "/404",
        url: constructNextUrl(eventOrResult.url, "/404"),
        headers: {
          ...eventOrResult.headers,
          "x-middleware-response-cache-control": NO_STORE_CACHE_CONTROL
        }
      };
    }
    if (globalThis.openNextConfig.dangerous?.enableCacheInterception && !isExternalRewrite && !isInternalResult(eventOrResult)) {
      debug("Cache interception enabled");
      eventOrResult = await cacheInterceptor(eventOrResult, resolvedRoutes);
      if (isInternalResult(eventOrResult)) {
        applyMiddlewareHeaders(eventOrResult, headers);
        return eventOrResult;
      }
    }
    applyMiddlewareHeaders(eventOrResult, headers);
    debug("resolvedRoutes", resolvedRoutes);
    return {
      internalEvent: eventOrResult,
      isExternalRewrite,
      origin: false,
      isISR,
      resolvedRoutes,
      initialURL: event.url,
      locale: NextConfig.i18n ? detectLocale(eventOrResult, NextConfig.i18n) : void 0,
      rewriteStatusCode: middlewareEventOrResult.rewriteStatusCode
    };
  } catch (e) {
    error("Error in routingHandler", e);
    return {
      internalEvent: {
        type: "core",
        method: "GET",
        rawPath: "/500",
        url: constructNextUrl(event.url, "/500"),
        headers: {
          ...event.headers
        },
        query: event.query,
        cookies: event.cookies,
        remoteAddress: event.remoteAddress
      },
      isExternalRewrite: false,
      origin: false,
      isISR: false,
      resolvedRoutes: [],
      initialURL: event.url,
      locale: NextConfig.i18n ? detectLocale(event, NextConfig.i18n) : void 0
    };
  }
}
function isInternalResult(eventOrResult) {
  return eventOrResult != null && "statusCode" in eventOrResult;
}

// node_modules/@opennextjs/aws/dist/adapters/middleware.js
globalThis.internalFetch = fetch;
globalThis.__openNextAls = new AsyncLocalStorage();
var defaultHandler = async (internalEvent, options) => {
  const middlewareConfig = globalThis.openNextConfig.middleware;
  const originResolver = await resolveOriginResolver(middlewareConfig?.originResolver);
  const externalRequestProxy = await resolveProxyRequest(middlewareConfig?.override?.proxyExternalRequest);
  const assetResolver = await resolveAssetResolver(middlewareConfig?.assetResolver);
  const requestId = Math.random().toString(36);
  return runWithOpenNextRequestContext({
    isISRRevalidation: internalEvent.headers[ISR_HEADER] === "1",
    waitUntil: options?.waitUntil,
    requestId
  }, async () => {
    const result = await routingHandler(internalEvent, { assetResolver });
    if ("internalEvent" in result) {
      debug("Middleware intercepted event", internalEvent);
      if (!result.isExternalRewrite) {
        const origin = await originResolver.resolve(result.internalEvent.rawPath);
        return {
          type: "middleware",
          internalEvent: {
            ...result.internalEvent,
            headers: {
              ...result.internalEvent.headers,
              [INTERNAL_HEADER_INITIAL_URL]: internalEvent.url,
              [INTERNAL_HEADER_RESOLVED_ROUTES]: JSON.stringify(result.resolvedRoutes),
              [INTERNAL_EVENT_REQUEST_ID]: requestId,
              [INTERNAL_HEADER_REWRITE_STATUS_CODE]: String(result.rewriteStatusCode)
            }
          },
          isExternalRewrite: result.isExternalRewrite,
          origin,
          isISR: result.isISR,
          initialURL: result.initialURL,
          resolvedRoutes: result.resolvedRoutes
        };
      }
      try {
        return externalRequestProxy.proxy(result.internalEvent);
      } catch (e) {
        error("External request failed.", e);
        return {
          type: "middleware",
          internalEvent: {
            ...result.internalEvent,
            headers: {
              ...result.internalEvent.headers,
              [INTERNAL_EVENT_REQUEST_ID]: requestId
            },
            rawPath: "/500",
            url: constructNextUrl(result.internalEvent.url, "/500"),
            method: "GET"
          },
          // On error we need to rewrite to the 500 page which is an internal rewrite
          isExternalRewrite: false,
          origin: false,
          isISR: result.isISR,
          initialURL: result.internalEvent.url,
          resolvedRoutes: [{ route: "/500", type: "page" }]
        };
      }
    }
    if (process.env.OPEN_NEXT_REQUEST_ID_HEADER || globalThis.openNextDebug) {
      result.headers[INTERNAL_EVENT_REQUEST_ID] = requestId;
    }
    debug("Middleware response", result);
    return result;
  });
};
var handler2 = await createGenericHandler({
  handler: defaultHandler,
  type: "middleware"
});
var middleware_default = {
  fetch: handler2
};
export {
  middleware_default as default,
  handler2 as handler
};
