
var ibpci = (() => {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  
  return (
function(ibpci = {})  {

// include: shell.js
// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = typeof ibpci != 'undefined' ? ibpci : {};

// Set up the promise that indicates the Module is initialized
var readyPromiseResolve, readyPromiseReject;
Module['ready'] = new Promise((resolve, reject) => {
  readyPromiseResolve = resolve;
  readyPromiseReject = reject;
});
["_malloc","_free","__embind_initialize_bindings","_fflush","onRuntimeInitialized"].forEach((prop) => {
  if (!Object.getOwnPropertyDescriptor(Module['ready'], prop)) {
    Object.defineProperty(Module['ready'], prop, {
      get: () => abort('You are getting ' + prop + ' on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'),
      set: () => abort('You are setting ' + prop + ' on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'),
    });
  }
});

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)


// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = Object.assign({}, Module);

var arguments_ = [];
var thisProgram = './this.program';
var quit_ = (status, toThrow) => {
  throw toThrow;
};

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).

var ENVIRONMENT_IS_WEB = true;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;

if (Module['ENVIRONMENT']) {
  throw new Error('Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)');
}

// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = '';
function locateFile(path) {
  if (Module['locateFile']) {
    return Module['locateFile'](path, scriptDirectory);
  }
  return scriptDirectory + path;
}

// Hooks that are implemented differently in different runtime environments.
var read_,
    readAsync,
    readBinary,
    setWindowTitle;

if (ENVIRONMENT_IS_SHELL) {

  if ((typeof process == 'object' && typeof require === 'function') || typeof window == 'object' || typeof importScripts == 'function') throw new Error('not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)');

  if (typeof read != 'undefined') {
    read_ = (f) => {
      const data = tryParseAsDataURI(f);
      if (data) {
        return intArrayToString(data);
      }
      return read(f);
    };
  }

  readBinary = (f) => {
    let data;
    data = tryParseAsDataURI(f);
    if (data) {
      return data;
    }
    if (typeof readbuffer == 'function') {
      return new Uint8Array(readbuffer(f));
    }
    data = read(f, 'binary');
    assert(typeof data == 'object');
    return data;
  };

  readAsync = (f, onload, onerror) => {
    setTimeout(() => onload(readBinary(f)), 0);
  };

  if (typeof clearTimeout == 'undefined') {
    globalThis.clearTimeout = (id) => {};
  }

  if (typeof scriptArgs != 'undefined') {
    arguments_ = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    arguments_ = arguments;
  }

  if (typeof quit == 'function') {
    quit_ = (status, toThrow) => {
      // Unlike node which has process.exitCode, d8 has no such mechanism. So we
      // have no way to set the exit code and then let the program exit with
      // that code when it naturally stops running (say, when all setTimeouts
      // have completed). For that reason, we must call `quit` - the only way to
      // set the exit code - but quit also halts immediately.  To increase
      // consistency with node (and the web) we schedule the actual quit call
      // using a setTimeout to give the current stack and any exception handlers
      // a chance to run.  This enables features such as addOnPostRun (which
      // expected to be able to run code after main returns).
      setTimeout(() => {
        if (!(toThrow instanceof ExitStatus)) {
          let toLog = toThrow;
          if (toThrow && typeof toThrow == 'object' && toThrow.stack) {
            toLog = [toThrow, toThrow.stack];
          }
          err(`exiting due to exception: ${toLog}`);
        }
        quit(status);
      });
      throw toThrow;
    };
  }

  if (typeof print != 'undefined') {
    // Prefer to use print/printErr where they exist, as they usually work better.
    if (typeof console == 'undefined') console = /** @type{!Console} */({});
    console.log = /** @type{!function(this:Console, ...*): undefined} */ (print);
    console.warn = console.error = /** @type{!function(this:Console, ...*): undefined} */ (typeof printErr != 'undefined' ? printErr : print);
  }

} else

// Note that this includes Node.js workers when relevant (pthreads is enabled).
// Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
// ENVIRONMENT_IS_NODE.
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) { // Check worker, not web, since window could be polyfilled
    scriptDirectory = self.location.href;
  } else if (typeof document != 'undefined' && document.currentScript) { // web
    scriptDirectory = document.currentScript.src;
  }
  // When MODULARIZE, this JS may be executed later, after document.currentScript
  // is gone, so we saved it, and we use it here instead of any other info.
  if (_scriptDir) {
    scriptDirectory = _scriptDir;
  }
  // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
  // otherwise, slice off the final part of the url to find the script directory.
  // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
  // and scriptDirectory will correctly be replaced with an empty string.
  // If scriptDirectory contains a query (starting with ?) or a fragment (starting with #),
  // they are removed because they could contain a slash.
  if (scriptDirectory.indexOf('blob:') !== 0) {
    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf('/')+1);
  } else {
    scriptDirectory = '';
  }

  if (!(typeof window == 'object' || typeof importScripts == 'function')) throw new Error('not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)');

  // Differentiate the Web Worker from the Node Worker case, as reading must
  // be done differently.
  {
// include: web_or_worker_shell_read.js
read_ = (url) => {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send(null);
      return xhr.responseText;
    } catch (err) {
      var data = tryParseAsDataURI(url);
      if (data) {
        return intArrayToString(data);
      }
      throw err;
    }
  }

  if (ENVIRONMENT_IS_WORKER) {
    readBinary = (url) => {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.responseType = 'arraybuffer';
        xhr.send(null);
        return new Uint8Array(/** @type{!ArrayBuffer} */(xhr.response));
      } catch (err) {
        var data = tryParseAsDataURI(url);
        if (data) {
          return data;
        }
        throw err;
      }
    };
  }

  readAsync = (url, onload, onerror) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = () => {
      if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
        onload(xhr.response);
        return;
      }
      var data = tryParseAsDataURI(url);
      if (data) {
        onload(data.buffer);
        return;
      }
      onerror();
    };
    xhr.onerror = onerror;
    xhr.send(null);
  }

// end include: web_or_worker_shell_read.js
  }

  setWindowTitle = (title) => document.title = title;
} else
{
  throw new Error('environment detection error');
}

var out = Module['print'] || console.log.bind(console);
var err = Module['printErr'] || console.error.bind(console);

// Merge back in the overrides
Object.assign(Module, moduleOverrides);
// Free the object hierarchy contained in the overrides, this lets the GC
// reclaim data used e.g. in memoryInitializerRequest, which is a large typed array.
moduleOverrides = null;
checkIncomingModuleAPI();

// Emit code to handle expected values on the Module object. This applies Module.x
// to the proper local x. This has two benefits: first, we only emit it if it is
// expected to arrive, and second, by using a local everywhere else that can be
// minified.

if (Module['arguments']) arguments_ = Module['arguments'];legacyModuleProp('arguments', 'arguments_');

if (Module['thisProgram']) thisProgram = Module['thisProgram'];legacyModuleProp('thisProgram', 'thisProgram');

if (Module['quit']) quit_ = Module['quit'];legacyModuleProp('quit', 'quit_');

// perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message
// Assertions on removed incoming Module JS APIs.
assert(typeof Module['memoryInitializerPrefixURL'] == 'undefined', 'Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['pthreadMainPrefixURL'] == 'undefined', 'Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['cdInitializerPrefixURL'] == 'undefined', 'Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['filePackagePrefixURL'] == 'undefined', 'Module.filePackagePrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['read'] == 'undefined', 'Module.read option was removed (modify read_ in JS)');
assert(typeof Module['readAsync'] == 'undefined', 'Module.readAsync option was removed (modify readAsync in JS)');
assert(typeof Module['readBinary'] == 'undefined', 'Module.readBinary option was removed (modify readBinary in JS)');
assert(typeof Module['setWindowTitle'] == 'undefined', 'Module.setWindowTitle option was removed (modify setWindowTitle in JS)');
assert(typeof Module['TOTAL_MEMORY'] == 'undefined', 'Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY');
legacyModuleProp('read', 'read_');
legacyModuleProp('readAsync', 'readAsync');
legacyModuleProp('readBinary', 'readBinary');
legacyModuleProp('setWindowTitle', 'setWindowTitle');
var IDBFS = 'IDBFS is no longer included by default; build with -lidbfs.js';
var PROXYFS = 'PROXYFS is no longer included by default; build with -lproxyfs.js';
var WORKERFS = 'WORKERFS is no longer included by default; build with -lworkerfs.js';
var NODEFS = 'NODEFS is no longer included by default; build with -lnodefs.js';

assert(!ENVIRONMENT_IS_WORKER, "worker environment detected but not enabled at build time.  Add 'worker' to `-sENVIRONMENT` to enable.");

assert(!ENVIRONMENT_IS_NODE, "node environment detected but not enabled at build time.  Add 'node' to `-sENVIRONMENT` to enable.");

assert(!ENVIRONMENT_IS_SHELL, "shell environment detected but not enabled at build time.  Add 'shell' to `-sENVIRONMENT` to enable.");


// end include: shell.js
// include: preamble.js
// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

var wasmBinary;
if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];legacyModuleProp('wasmBinary', 'wasmBinary');
var noExitRuntime = Module['noExitRuntime'] || true;legacyModuleProp('noExitRuntime', 'noExitRuntime');

if (typeof WebAssembly != 'object') {
  abort('no native wasm support detected');
}

// Wasm globals

var wasmMemory;

//========================================
// Runtime essentials
//========================================

// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS;

/** @type {function(*, string=)} */
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed' + (text ? ': ' + text : ''));
  }
}

// We used to include malloc/free by default in the past. Show a helpful error in
// builds with assertions.

// Memory management

var HEAP,
/** @type {!Int8Array} */
  HEAP8,
/** @type {!Uint8Array} */
  HEAPU8,
/** @type {!Int16Array} */
  HEAP16,
/** @type {!Uint16Array} */
  HEAPU16,
/** @type {!Int32Array} */
  HEAP32,
/** @type {!Uint32Array} */
  HEAPU32,
/** @type {!Float32Array} */
  HEAPF32,
/** @type {!Float64Array} */
  HEAPF64;

function updateMemoryViews() {
  var b = wasmMemory.buffer;
  Module['HEAP8'] = HEAP8 = new Int8Array(b);
  Module['HEAP16'] = HEAP16 = new Int16Array(b);
  Module['HEAP32'] = HEAP32 = new Int32Array(b);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(b);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(b);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(b);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(b);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(b);
}

assert(!Module['STACK_SIZE'], 'STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time')

assert(typeof Int32Array != 'undefined' && typeof Float64Array !== 'undefined' && Int32Array.prototype.subarray != undefined && Int32Array.prototype.set != undefined,
       'JS engine does not provide full typed array support');

// If memory is defined in wasm, the user can't provide it, or set INITIAL_MEMORY
assert(!Module['wasmMemory'], 'Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally');
assert(!Module['INITIAL_MEMORY'], 'Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically');

// include: runtime_init_table.js
// In regular non-RELOCATABLE mode the table is exported
// from the wasm module and this will be assigned once
// the exports are available.
var wasmTable;

// end include: runtime_init_table.js
// include: runtime_stack_check.js
// Initializes the stack cookie. Called at the startup of main and at the startup of each thread in pthreads mode.
function writeStackCookie() {
  var max = _emscripten_stack_get_end();
  assert((max & 3) == 0);
  // If the stack ends at address zero we write our cookies 4 bytes into the
  // stack.  This prevents interference with the (separate) address-zero check
  // below.
  if (max == 0) {
    max += 4;
  }
  // The stack grow downwards towards _emscripten_stack_get_end.
  // We write cookies to the final two words in the stack and detect if they are
  // ever overwritten.
  HEAPU32[((max)>>2)] = 0x02135467;
  HEAPU32[(((max)+(4))>>2)] = 0x89BACDFE;
  // Also test the global address 0 for integrity.
  HEAPU32[0] = 0x63736d65; /* 'emsc' */
}

function checkStackCookie() {
  if (ABORT) return;
  var max = _emscripten_stack_get_end();
  // See writeStackCookie().
  if (max == 0) {
    max += 4;
  }
  var cookie1 = HEAPU32[((max)>>2)];
  var cookie2 = HEAPU32[(((max)+(4))>>2)];
  if (cookie1 != 0x02135467 || cookie2 != 0x89BACDFE) {
    abort('Stack overflow! Stack cookie has been overwritten at ' + ptrToString(max) + ', expected hex dwords 0x89BACDFE and 0x2135467, but received ' + ptrToString(cookie2) + ' ' + ptrToString(cookie1));
  }
  // Also test the global address 0 for integrity.
  if (HEAPU32[0] !== 0x63736d65 /* 'emsc' */) {
    abort('Runtime error: The application has corrupted its heap memory area (address zero)!');
  }
}

// end include: runtime_stack_check.js
// include: runtime_assertions.js
// Endianness check
(function() {
  var h16 = new Int16Array(1);
  var h8 = new Int8Array(h16.buffer);
  h16[0] = 0x6373;
  if (h8[0] !== 0x73 || h8[1] !== 0x63) throw 'Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)';
})();

// end include: runtime_assertions.js
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the main() is called

var runtimeInitialized = false;

var runtimeKeepaliveCounter = 0;

function keepRuntimeAlive() {
  return noExitRuntime || runtimeKeepaliveCounter > 0;
}

function preRun() {
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
  assert(!runtimeInitialized);
  runtimeInitialized = true;

  checkStackCookie();

  
  callRuntimeCallbacks(__ATINIT__);
}

function postRun() {
  checkStackCookie();

  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }

  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}

function addOnExit(cb) {
}

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}

// include: runtime_math.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc

assert(Math.imul, 'This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.fround, 'This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.clz32, 'This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.trunc, 'This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');

// end include: runtime_math.js
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// Module.preRun (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};

function getUniqueRunDependency(id) {
  var orig = id;
  while (1) {
    if (!runDependencyTracking[id]) return id;
    id = orig + Math.random();
  }
}

function addRunDependency(id) {
  runDependencies++;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval != 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(() => {
        if (ABORT) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
          return;
        }
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            err('still waiting on run dependencies:');
          }
          err('dependency: ' + dep);
        }
        if (shown) {
          err('(end of list)');
        }
      }, 10000);
    }
  } else {
    err('warning: run dependency added without ID');
  }
}

function removeRunDependency(id) {
  runDependencies--;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    err('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}

/** @param {string|number=} what */
function abort(what) {
  if (Module['onAbort']) {
    Module['onAbort'](what);
  }

  what = 'Aborted(' + what + ')';
  // TODO(sbc): Should we remove printing and leave it up to whoever
  // catches the exception?
  err(what);

  ABORT = true;
  EXITSTATUS = 1;

  // Use a wasm runtime error, because a JS error might be seen as a foreign
  // exception, which means we'd run destructors on it. We need the error to
  // simply make the program stop.
  // FIXME This approach does not work in Wasm EH because it currently does not assume
  // all RuntimeErrors are from traps; it decides whether a RuntimeError is from
  // a trap or not based on a hidden field within the object. So at the moment
  // we don't have a way of throwing a wasm trap from JS. TODO Make a JS API that
  // allows this in the wasm spec.

  // Suppress closure compiler warning here. Closure compiler's builtin extern
  // defintion for WebAssembly.RuntimeError claims it takes no arguments even
  // though it can.
  // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure gets fixed.
  /** @suppress {checkTypes} */
  var e = new WebAssembly.RuntimeError(what);

  readyPromiseReject(e);
  // Throw the error whether or not MODULARIZE is set because abort is used
  // in code paths apart from instantiation where an exception is expected
  // to be thrown when abort is called.
  throw e;
}

// include: memoryprofiler.js
// end include: memoryprofiler.js
// show errors on likely calls to FS when it was not included
var FS = {
  error: function() {
    abort('Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with -sFORCE_FILESYSTEM');
  },
  init: function() { FS.error() },
  createDataFile: function() { FS.error() },
  createPreloadedFile: function() { FS.error() },
  createLazyFile: function() { FS.error() },
  open: function() { FS.error() },
  mkdev: function() { FS.error() },
  registerDevice: function() { FS.error() },
  analyzePath: function() { FS.error() },

  ErrnoError: function ErrnoError() { FS.error() },
};
Module['FS_createDataFile'] = FS.createDataFile;
Module['FS_createPreloadedFile'] = FS.createPreloadedFile;

// include: URIUtils.js
// Prefix of data URIs emitted by SINGLE_FILE and related options.
var dataURIPrefix = 'data:application/octet-stream;base64,';

// Indicates whether filename is a base64 data URI.
function isDataURI(filename) {
  // Prefix of data URIs emitted by SINGLE_FILE and related options.
  return filename.startsWith(dataURIPrefix);
}

// Indicates whether filename is delivered via file protocol (as opposed to http/https)
function isFileURI(filename) {
  return filename.startsWith('file://');
}

// end include: URIUtils.js
/** @param {boolean=} fixedasm */
function createExportWrapper(name, fixedasm) {
  return function() {
    var displayName = name;
    var asm = fixedasm;
    if (!fixedasm) {
      asm = Module['asm'];
    }
    assert(runtimeInitialized, 'native function `' + displayName + '` called before runtime initialization');
    if (!asm[name]) {
      assert(asm[name], 'exported native function `' + displayName + '` not found');
    }
    return asm[name].apply(null, arguments);
  };
}

// include: runtime_exceptions.js
// end include: runtime_exceptions.js
var wasmBinaryFile;
  wasmBinaryFile = 'data:application/octet-stream;base64,AGFzbQEAAAABooGAgAAVYAF/AX9gAn9/AX9gA39/fwF/YAJ/fwBgAAF/YAF/AGADf39/AGAAAGAEf39/fwBgBX9/f39/AGAGf39/f39/AGAEf39/fwF/YAV/f39/fwF/YAN/fn8BfmAHf39/f39/fwBgDX9/f39/f39/f39/f38AYAl/f39/f39/f38AYAh/f39/f39/fwBgBH9/fn8BfmAFf39/fn4AYAR/fn9/AX8ClIWAgAAXA2VudhZfZW1iaW5kX3JlZ2lzdGVyX2NsYXNzAA8DZW52C19fY3hhX3Rocm93AAYDZW52Il9lbWJpbmRfcmVnaXN0ZXJfY2xhc3NfY29uc3RydWN0b3IACgNlbnYfX2VtYmluZF9yZWdpc3Rlcl9jbGFzc19mdW5jdGlvbgAQA2Vudg1fZW12YWxfaW5jcmVmAAUDZW52DV9lbXZhbF9kZWNyZWYABQNlbnYRX2VtdmFsX3Rha2VfdmFsdWUAAQNlbnYNX19hc3NlcnRfZmFpbAAIA2VudhVfZW1iaW5kX3JlZ2lzdGVyX3ZvaWQAAwNlbnYVX2VtYmluZF9yZWdpc3Rlcl9ib29sAAkDZW52GF9lbWJpbmRfcmVnaXN0ZXJfaW50ZWdlcgAJA2VudhZfZW1iaW5kX3JlZ2lzdGVyX2Zsb2F0AAYDZW52G19lbWJpbmRfcmVnaXN0ZXJfc3RkX3N0cmluZwADA2VudhxfZW1iaW5kX3JlZ2lzdGVyX3N0ZF93c3RyaW5nAAYDZW52Fl9lbWJpbmRfcmVnaXN0ZXJfZW12YWwAAwNlbnYcX2VtYmluZF9yZWdpc3Rlcl9tZW1vcnlfdmlldwAGA2VudhVlbXNjcmlwdGVuX21lbWNweV9iaWcABgNlbnYWZW1zY3JpcHRlbl9yZXNpemVfaGVhcAAAA2VudgVhYm9ydAAHFndhc2lfc25hcHNob3RfcHJldmlldzEIZmRfY2xvc2UAABZ3YXNpX3NuYXBzaG90X3ByZXZpZXcxCGZkX3dyaXRlAAsDZW52F19lbWJpbmRfcmVnaXN0ZXJfYmlnaW50AA4Wd2FzaV9zbmFwc2hvdF9wcmV2aWV3MQdmZF9zZWVrAAwD6IWAgADmBQcHAgICAgICAgAFAQABAAAGAAAHAAcBBwAHAgAFAAAAAAUDBgAHAAQEBQQEBAQEBAQE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AUEwIZQBIAIglAFqIZUBIJUBIZYBIJEBIJMBIJYBEBwaQRAhlwEgkQEglwFqIZgBIAIgmAE2AoQBQS4hmQEgAiCZATYCLEGwgQQhmgFBLCGbASACIJsBaiGcASCcASGdASCYASCaASCdARAZGkEQIZ4BIJgBIJ4BaiGfASACIJ8BNgKEAUEyIaABIAIgoAE2AihB7IMEIaEBQSghogEgAiCiAWohowEgowEhpAEgnwEgoQEgpAEQHhpBECGlASCfASClAWohpgEgAiCmATYChAFBLyGnASACIKcBNgIkQfSDBCGoAUEkIakBIAIgqQFqIaoBIKoBIasBIKYBIKgBIKsBEB4aQRAhrAEgpgEgrAFqIa0BIAIgrQE2AoQBQTMhrgEgAiCuATYCIEGAgAQhrwFBICGwASACILABaiGxASCxASGyASCtASCvASCyARAeGkEQIbMBIK0BILMBaiG0ASACILQBNgKEAUEpIbUBIAIgtQE2AhxBiIAEIbYBQRwhtwEgAiC3AWohuAEguAEhuQEgtAEgtgEguQEQHRpBECG6ASC0ASC6AWohuwEgAiC7ATYChAFBKyG8ASACILwBNgIYQZKCBCG9AUEYIb4BIAIgvgFqIb8BIL8BIcABILsBIL0BIMABEB0aQRAhwQEguwEgwQFqIcIBIAIgwgE2AoQBQSohwwEgAiDDATYCFEH8gwQhxAFBFCHFASACIMUBaiHGASDGASHHASDCASDEASDHARAdGkGIASHIASACIMgBaiHJASDJASHKASACIMoBNgLIBEEcIcsBIAIgywE2AswEQfieBBogAikCyAQh5AEgAiDkATcDCEH4ngQhzAFBCCHNASACIM0BaiHOAUETIc8BIAIgzwFqIdABIMwBIM4BINABEB8aQYgBIdEBIAIg0QFqIdIBINIBIdMBQcADIdQBINMBINQBaiHVASDVASHWAQNAINYBIdcBQXAh2AEg1wEg2AFqIdkBINkBECAaINkBIdoBINMBIdsBINoBINsBRiHcAUEBId0BINwBIN0BcSHeASDZASHWASDeAUUNAAtBHiHfAUEAIeABQYCABCHhASDfASDgASDhARDcBBpB0AQh4gEgAiDiAWoh4wEg4wEkAA8LOQEGfyMAIQFBECECIAEgAmshAyADJAAgAyAANgIMQfieBCEEIAQQKBpBECEFIAMg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BCAEQQBBABCgBSAAEIwEGgwBCyAAEIwEGiADDQAgABCcBCEEIAAgAUEBahCWBQwBCyAAEJsEIQQgACABQQFqEJMFCyAEIAFqIgAgAkEPahCIBSACQQA6AA4gAEEBaiACQQ5qEIgFIAJBEGokAAudAQEBfyMAQRBrIgUkACAFIAQ2AgggBSACNgIMAkAgABCHAiICIAFJDQAgBEF/Rg0AIAUgAiABazYCACAFIAVBDGogBRCNASgCADYCBAJAIAAQhgIgAWogAyAFQQRqIAVBCGoQjQEoAgAQtQMiAQ0AQX8hASAFKAIEIgAgBSgCCCIESQ0AIAAgBEshAQsgBUEQaiQAIAEPCyAAEIQFAAsEAEF/CwQAIAALKwEBfyMAQRBrIgMkACADQQhqIAAgASACEK0FIAMoAgwhAiADQRBqJAAgAgtkAQF/IwBBIGsiBCQAIARBGGogASACEK4FIARBEGogBCgCGCAEKAIcIAMQrwUQsAUgBCABIAQoAhAQsQU2AgwgBCADIAQoAhQQsgU2AgggACAEQQxqIARBCGoQswUgBEEgaiQACwsAIAAgASACELQFCwcAIAAQtQULUgECfyMAQRBrIgQkACACIAFrIQUCQCACIAFGDQAgAyABIAUQ+wQaCyAEIAEgBWo2AgwgBCADIAVqNgIIIAAgBEEMaiAEQQhqELMFIARBEGokAAsJACAAIAEQtwULCQAgACABELgFCwwAIAAgASACELYFGgs4AQF/IwBBEGsiAyQAIAMgARC5BTYCDCADIAIQuQU2AgggACADQQxqIANBCGoQugUaIANBEGokAAsHACAAEIIFCxgAIAAgASgCADYCACAAIAIoAgA2AgQgAAsJACAAIAEQvAULDQAgACABIAAQggVragsHACAAELsFCxgAIAAgASgCADYCACAAIAIoAgA2AgQgAAsGACAAEHALCQAgACABEL0FCwwAIAAgASAAEHBragsHACAAKAIACwkAQZijBBC+BQsPACAAQdAAahDlBEHQAGoLWQECfyABLQAAIQICQCAALQAAIgNFDQAgAyACQf8BcUcNAANAIAEtAAEhAiAALQABIgNFDQEgAUEBaiEBIABBAWohACADIAJB/wFxRg0ACwsgAyACQf8BcWsLBwAgABDtBQsCAAsCAAsKACAAEMIFEOsECwoAIAAQwgUQ6wQLCgAg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L3ZhbC5oAHVuc2lnbmVkIGxvbmcAc3RkOjp3c3RyaW5nAGJhc2ljX3N0cmluZwBzdGQ6OnN0cmluZwBzdGQ6OnUxNnN0cmluZwBzdGQ6OnUzMnN0cmluZwBpZgByZXNpemUAZW5xdWV1ZQBkZXF1ZXVlAFF1ZXVlAGVsc2UAd3JpdGVHZW5lcmljV2lyZVR5cGUAd2hpbGUAZG91YmxlAG1vZABtZXRob2QAZW5kAHZvaWQAc3RkOjpiYWRfYWxsb2MAc2hvcnRfcHRyIDw9IFVJTlQzMl9NQVgAT1IAQU5EAGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHNob3J0PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1bnNpZ25lZCBzaG9ydD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1bnNpZ25lZCBpbnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGZsb2F0PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1aW50OF90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQ4X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVpbnQxNl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQxNl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1aW50NjRfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50NjRfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDMyX3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludDMyX3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGNoYXI+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIGNoYXI+AHN0ZDo6YmFzaWNfc3RyaW5nPHVuc2lnbmVkIGNoYXI+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHNpZ25lZCBjaGFyPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxsb25nPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1bnNpZ25lZCBsb25nPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxkb3VibGU+AE5TdDNfXzI2dmVjdG9ySU5TXzEyYmFzaWNfc3RyaW5nSWNOU18xMWNoYXJfdHJhaXRzSWNFRU5TXzlhbGxvY2F0b3JJY0VFRUVOUzRfSVM2X0VFRUUAEA0BAA4FAQBQTlN0M19fMjZ2ZWN0b3JJTlNfMTJiYXNpY19zdHJpbmdJY05TXzExY2hhcl90cmFpdHNJY0VFTlNfOWFsbG9jYXRvckljRUVFRU5TNF9JUzZfRUVFRQAAlA0BAGwFAQAAAAAAZAUBAFBLTlN0M19fMjZ2ZWN0b3JJTlNfMTJiYXNpY19zdHJpbmdJY05TXzExY2hhcl90cmFpdHNJY0VFTlNfOWFsbG9jYXRvckljRUVFRU5TNF9JUzZfRUVFRQCUDQEA1AUBAAEAAABkBQEAaWkAdgB2aQDEBQEATAwBAMQFAQCUBgEATlN0M19fMjEyYmFzaWNfc3RyaW5nSWNOU18xMWNoYXJfdHJhaXRzSWNFRU5TXzlhbGxvY2F0b3JJY0VFRUUAABANAQBUBgEAdmlpaQAAAAAAAAAAAAAAAAAAAABMDAEAxAUBANAMAQCUBgEAdmlpaWkAAADQDAEALAYBAGlpaQD0BgEAZAUBANAMAQBOMTBlbXNjcmlwdGVuM3ZhbEUAABANAQDgBgEAaWlpaQAAAAAAAAAAAAAAAAAAAABkDAEAZAUBANAMAQCUBgEAaWlpaWkAMTFUZXh0QnVmZmVycwAQDQEAJgcBAFAxMVRleHRCdWZmZXJzAACUDQEAPAcBAAAAAAA0BwEAUEsxMVRleHRCdWZmZXJzAJQNAQBcBwEAAQAAADQHAQBMBwEAZAwBAEwHAQCUBgEAZAUBAEwHAQCUBgEAAE5TdDNfXzIxMmJhc2ljX3N0cmluZ0loTlNfMTFjaGFyX3RyYWl0c0loRUVOU185YWxsb2NhdG9ySWhFRUVFABANAQCZBwEATlN0M19fMjEyYmFzaWNfc3RyaW5nSXdOU18xMWNoYXJfdHJhaXRzSXdFRU5TXzlhbGxvY2F0b3JJd0VFRUUAABANAQDgBwEATlN0M19fMjEyYmFzaWNfc3RyaW5nSURzTlNfMTFjaGFyX3RyYWl0c0lEc0VFTlNfOWFsbG9jYXRvcklEc0VFRUUAAAAQDQEAKAgBAE5TdDNfXzIxMmJhc2ljX3N0cmluZ0lEaU5TXzExY2hhcl90cmFpdHNJRGlFRU5TXzlhbGxvY2F0b3JJRGlFRUVFAAAAEA0BAHQIAQBOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0ljRUUAABANAQDACAEATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJYUVFAAAQDQEA6AgBAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWhFRQAAEA0BABAJAQBOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lzRUUAABANAQA4CQEATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJdEVFAAAQDQEAYAkBAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWlFRQAAEA0BAIgJAQBOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lqRUUAABANAQCwCQEATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJbEVFAAAQDQEA2AkBAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SW1FRQAAEA0BAAAKAQBOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0l4RUUAABANAQAoCgEATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJeUVFAAAQDQEAUAoBAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWZFRQAAEA0BAHgKAQBOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lkRUUAABANAQCgCgEATjEwX19jeHhhYml2MTE2X19zaGltX3R5cGVfaW5mb0UAAAAAOA0BAMgKAQC0DgEATjEwX19jeHhhYml2MTE3X19jbGFzc190eXBlX2luZm9FAAAAOA0BAPgKAQDsCgEATjEwX19jeHhhYml2MTE3X19wYmFzZV90eXBlX2luZm9FAAAAOA0BACgLAQDsCgEATjEwX19jeHhhYml2MTE5X19wb2ludGVyX3R5cGVfaW5mb0UAOA0BAFgLAQBMCwEATjEwX19jeHhhYml2MTIwX19mdW5jdGlvbl90eXBlX2luZm9FAAAAADgNAQCICwEA7AoBAE4xMF9fY3h4YWJpdjEyOV9fcG9pbnRlcl90b19tZW1iZXJfdHlwZV9pbmZvRQAAADgNAQC8CwEATAsBAAAAAAA8DAEAIwAAACQAAAAlAAAAJgAAACcAAABOMTBfX2N4eGFiaXYxMjNfX2Z1bmRhbWVudGFsX3R5cGVfaW5mb0UAOA0BABQMAQDsCgEAdgAAAAAMAQBIDAEARG4AAAAMAQBUDAEAYgAAAAAMAQBgDAEAYwAAAAAMAQBsDAEAaAAAAAAMAQB4DAEAYQAAAAAMAQCEDAEAcwAAAAAMAQCQDAEAdAAAAAAMAQCcDAEAaQAAAAAMAQCoDAEAagAAAAAMAQC0DAEAbAAAAAAMAQDADAEAbQAAAAAMAQDMDAEAeAAAAAAMAQDYDAEAeQAAAAAMAQDkDAEAZgAAAAAMAQDwDAEAZAAAAAAMAQD8DAEAAAAAABwLAQAjAAAAKAAAACUAAAAmAAAAKQAAACoAAAArAAAALAAAAAAAAACADQEAIwAAAC0AAAAlAAAAJgAAACkAAAAuAAAALwAAADAAAABOMTBfX2N4eGFiaXYxMjBfX3NpX2NsYXNzX3R5cGVfaW5mb0UAAAAAOA0BAFgNAQAcCwEAAAAAAHwLAQAjAAAAMQAAACUAAAAmAAAAMgAAAAAAAAAMDgEAGgAAADMAAAA0AAAAAAAAADQOAQAaAAAANQAAADYAAAAAAAAA9A0BABoAAAA3AAAAOAAAAFN0OWV4Y2VwdGlvbgAAAAAQDQEA5A0BAFN0OWJhZF9hbGxvYwAAAAA4DQEA/A0BAPQNAQBTdDIwYmFkX2FycmF5X25ld19sZW5ndGgAAAAAOA0BABgOAQAMDgEAAAAAAGQOAQAZAAAAOQAAADoAAABTdDExbG9naWNfZXJyb3IAOA0BAFQOAQD0DQEAAAAAAJgOAQAZAAAAOwAAADoAAABTdDEybGVuZ3RoX2Vycm9yAAAAADgNAQCEDgEAZA4BAFN0OXR5cGVfaW5mbwAAAAAQDQEApA4BAABBwJ0EC5wBoBEBAAAAAAAFAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAhAAAAIgAAAJgRAQAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAA//////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADIDgEA';
  if (!isDataURI(wasmBinaryFile)) {
    wasmBinaryFile = locateFile(wasmBinaryFile);
  }

function getBinary(file) {
  try {
    if (file == wasmBinaryFile && wasmBinary) {
      return new Uint8Array(wasmBinary);
    }
    var binary = tryParseAsDataURI(file);
    if (binary) {
      return binary;
    }
    if (readBinary) {
      return readBinary(file);
    }
    throw "both async and sync fetching of the wasm failed";
  }
  catch (err) {
    abort(err);
  }
}

function getBinaryPromise(binaryFile) {
  // If we don't have the binary yet, try to load it asynchronously.
  // Fetch has some additional restrictions over XHR, like it can't be used on a file:// url.
  // See https://github.com/github/fetch/pull/92#issuecomment-140665932
  // Cordova or Electron apps are typically loaded from a file:// url.
  // So use fetch if it is available and the url is not a file, otherwise fall back to XHR.
  if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
    if (typeof fetch == 'function'
    ) {
      return fetch(binaryFile, { credentials: 'same-origin' }).then((response) => {
        if (!response['ok']) {
          throw "failed to load wasm binary file at '" + binaryFile + "'";
        }
        return response['arrayBuffer']();
      }).catch(() => getBinary(binaryFile));
    }
  }

  // Otherwise, getBinary should be able to get it synchronously
  return Promise.resolve().then(() => getBinary(binaryFile));
}

function instantiateArrayBuffer(binaryFile, imports, receiver) {
  return getBinaryPromise(binaryFile).then((binary) => {
    return WebAssembly.instantiate(binary, imports);
  }).then((instance) => {
    return instance;
  }).then(receiver, (reason) => {
    err('failed to asynchronously prepare wasm: ' + reason);

    // Warn on some common problems.
    if (isFileURI(wasmBinaryFile)) {
      err('warning: Loading from a file URI (' + wasmBinaryFile + ') is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing');
    }
    abort(reason);
  });
}

function instantiateAsync(binary, binaryFile, imports, callback) {
  if (!binary &&
      typeof WebAssembly.instantiateStreaming == 'function' &&
      !isDataURI(binaryFile) &&
      typeof fetch == 'function') {
    return fetch(binaryFile, { credentials: 'same-origin' }).then((response) => {
      // Suppress closure warning here since the upstream definition for
      // instantiateStreaming only allows Promise<Repsponse> rather than
      // an actual Response.
      // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure is fixed.
      /** @suppress {checkTypes} */
      var result = WebAssembly.instantiateStreaming(response, imports);

      return result.then(
        callback,
        function(reason) {
          // We expect the most common failure cause to be a bad MIME type for the binary,
          // in which case falling back to ArrayBuffer instantiation should work.
          err('wasm streaming compile failed: ' + reason);
          err('falling back to ArrayBuffer instantiation');
          return instantiateArrayBuffer(binaryFile, imports, callback);
        });
    });
  } else {
    return instantiateArrayBuffer(binaryFile, imports, callback);
  }
}

// Create the wasm instance.
// Receives the wasm imports, returns the exports.
function createWasm() {
  // prepare imports
  var info = {
    'env': wasmImports,
    'wasi_snapshot_preview1': wasmImports,
  };
  // Load the wasm module and create an instance of using native support in the JS engine.
  // handle a generated wasm instance, receiving its exports and
  // performing other necessary setup
  /** @param {WebAssembly.Module=} module*/
  function receiveInstance(instance, module) {
    var exports = instance.exports;

    Module['asm'] = exports;

    wasmMemory = Module['asm']['memory'];
    assert(wasmMemory, "memory not found in wasm exports");
    // This assertion doesn't hold when emscripten is run in --post-link
    // mode.
    // TODO(sbc): Read INITIAL_MEMORY out of the wasm file in post-link mode.
    //assert(wasmMemory.buffer.byteLength === 16777216);
    updateMemoryViews();

    wasmTable = Module['asm']['__indirect_function_table'];
    assert(wasmTable, "table not found in wasm exports");

    addOnInit(Module['asm']['__wasm_call_ctors']);

    removeRunDependency('wasm-instantiate');

    return exports;
  }
  // wait for the pthread pool (if any)
  addRunDependency('wasm-instantiate');

  // Prefer streaming instantiation if available.
  // Async compilation can be confusing when an error on the page overwrites Module
  // (for example, if the order of elements is wrong, and the one defining Module is
  // later), so we save Module and check it later.
  var trueModule = Module;
  function receiveInstantiationResult(result) {
    // 'result' is a ResultObject object which has both the module and instance.
    // receiveInstance() will swap in the exports (to Module.asm) so they can be called
    assert(Module === trueModule, 'the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?');
    trueModule = null;
    // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
    // When the regression is fixed, can restore the above PTHREADS-enabled path.
    receiveInstance(result['instance']);
  }

  // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
  // to manually instantiate the Wasm module themselves. This allows pages to
  // run the instantiation parallel to any other async startup actions they are
  // performing.
  // Also pthreads and wasm workers initialize the wasm instance through this
  // path.
  if (Module['instantiateWasm']) {

    try {
      return Module['instantiateWasm'](info, receiveInstance);
    } catch(e) {
      err('Module.instantiateWasm callback failed with error: ' + e);
        // If instantiation fails, reject the module ready promise.
        readyPromiseReject(e);
    }
  }

  // If instantiation fails, reject the module ready promise.
  instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult).catch(readyPromiseReject);
  return {}; // no exports yet; we'll fill them in later
}

// Globals used by JS i64 conversions (see makeSetValue)
var tempDouble;
var tempI64;

// include: runtime_debug.js
function legacyModuleProp(prop, newName) {
  if (!Object.getOwnPropertyDescriptor(Module, prop)) {
    Object.defineProperty(Module, prop, {
      configurable: true,
      get: function() {
        abort('Module.' + prop + ' has been replaced with plain ' + newName + ' (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)');
      }
    });
  }
}

function ignoredModuleProp(prop) {
  if (Object.getOwnPropertyDescriptor(Module, prop)) {
    abort('`Module.' + prop + '` was supplied but `' + prop + '` not included in INCOMING_MODULE_JS_API');
  }
}

// forcing the filesystem exports a few things by default
function isExportedByForceFilesystem(name) {
  return name === 'FS_createPath' ||
         name === 'FS_createDataFile' ||
         name === 'FS_createPreloadedFile' ||
         name === 'FS_unlink' ||
         name === 'addRunDependency' ||
         // The old FS has some functionality that WasmFS lacks.
         name === 'FS_createLazyFile' ||
         name === 'FS_createDevice' ||
         name === 'removeRunDependency';
}

function missingGlobal(sym, msg) {
  if (typeof globalThis !== 'undefined') {
    Object.defineProperty(globalThis, sym, {
      configurable: true,
      get: function() {
        warnOnce('`' + sym + '` is not longer defined by emscripten. ' + msg);
        return undefined;
      }
    });
  }
}

missingGlobal('buffer', 'Please use HEAP8.buffer or wasmMemory.buffer');

function missingLibrarySymbol(sym) {
  if (typeof globalThis !== 'undefined' && !Object.getOwnPropertyDescriptor(globalThis, sym)) {
    Object.defineProperty(globalThis, sym, {
      configurable: true,
      get: function() {
        // Can't `abort()` here because it would break code that does runtime
        // checks.  e.g. `if (typeof SDL === 'undefined')`.
        var msg = '`' + sym + '` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line';
        // DEFAULT_LIBRARY_FUNCS_TO_INCLUDE requires the name as it appears in
        // library.js, which means $name for a JS name with no prefix, or name
        // for a JS name like _name.
        var librarySymbol = sym;
        if (!librarySymbol.startsWith('_')) {
          librarySymbol = '$' + sym;
        }
        msg += " (e.g. -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE=" + librarySymbol + ")";
        if (isExportedByForceFilesystem(sym)) {
          msg += '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you';
        }
        warnOnce(msg);
        return undefined;
      }
    });
  }
  // Any symbol that is not included from the JS libary is also (by definition)
  // not exported on the Module object.
  unexportedRuntimeSymbol(sym);
}

function unexportedRuntimeSymbol(sym) {
  if (!Object.getOwnPropertyDescriptor(Module, sym)) {
    Object.defineProperty(Module, sym, {
      configurable: true,
      get: function() {
        var msg = "'" + sym + "' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)";
        if (isExportedByForceFilesystem(sym)) {
          msg += '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you';
        }
        abort(msg);
      }
    });
  }
}

// Used by XXXXX_DEBUG settings to output debug messages.
function dbg(text) {
  // TODO(sbc): Make this configurable somehow.  Its not always convenient for
  // logging to show up as warnings.
  console.warn.apply(console, arguments);
}

// end include: runtime_debug.js
// === Body ===


// end include: preamble.js

  /** @constructor */
  function ExitStatus(status) {
      this.name = 'ExitStatus';
      this.message = 'Program terminated with exit(' + status + ')';
      this.status = status;
    }

  function callRuntimeCallbacks(callbacks) {
      while (callbacks.length > 0) {
        // Pass the module as the first argument.
        callbacks.shift()(Module);
      }
    }

  
    /**
     * @param {number} ptr
     * @param {string} type
     */
  function getValue(ptr, type = 'i8') {
    if (type.endsWith('*')) type = '*';
    switch (type) {
      case 'i1': return HEAP8[((ptr)>>0)];
      case 'i8': return HEAP8[((ptr)>>0)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      case '*': return HEAPU32[((ptr)>>2)];
      default: abort(`invalid type for getValue: ${type}`);
    }
  }

  function intArrayToString(array) {
    var ret = [];
    for (var i = 0; i < array.length; i++) {
      var chr = array[i];
      if (chr > 0xFF) {
        assert(false, `Character code ${chr} (${String.fromCharCode(chr)}) at offset ${i} not in 0x00-0xFF.`);
        chr &= 0xFF;
      }
      ret.push(String.fromCharCode(chr));
    }
    return ret.join('');
  }

  function ptrToString(ptr) {
      assert(typeof ptr === 'number');
      return '0x' + ptr.toString(16).padStart(8, '0');
    }

  
    /**
     * @param {number} ptr
     * @param {number} value
     * @param {string} type
     */
  function setValue(ptr, value, type = 'i8') {
    if (type.endsWith('*')) type = '*';
    switch (type) {
      case 'i1': HEAP8[((ptr)>>0)] = value; break;
      case 'i8': HEAP8[((ptr)>>0)] = value; break;
      case 'i16': HEAP16[((ptr)>>1)] = value; break;
      case 'i32': HEAP32[((ptr)>>2)] = value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? (+(Math.floor((tempDouble)/4294967296.0)))>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)], HEAP32[((ptr)>>2)] = tempI64[0],HEAP32[(((ptr)+(4))>>2)] = tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)] = value; break;
      case 'double': HEAPF64[((ptr)>>3)] = value; break;
      case '*': HEAPU32[((ptr)>>2)] = value; break;
      default: abort(`invalid type for setValue: ${type}`);
    }
  }

  function warnOnce(text) {
      if (!warnOnce.shown) warnOnce.shown = {};
      if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1;
        err(text);
      }
    }

  var UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf8') : undefined;
  
    /**
     * Given a pointer 'idx' to a null-terminated UTF8-encoded string in the given
     * array that contains uint8 values, returns a copy of that string as a
     * Javascript String object.
     * heapOrArray is either a regular array, or a JavaScript typed array view.
     * @param {number} idx
     * @param {number=} maxBytesToRead
     * @return {string}
     */
  function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead) {
      var endIdx = idx + maxBytesToRead;
      var endPtr = idx;
      // TextDecoder needs to know the byte length in advance, it doesn't stop on
      // null terminator by itself.  Also, use the length info to avoid running tiny
      // strings through TextDecoder, since .subarray() allocates garbage.
      // (As a tiny code save trick, compare endPtr against endIdx using a negation,
      // so that undefined means Infinity)
      while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
  
      if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
        return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
      }
      var str = '';
      // If building with TextDecoder, we have already computed the string length
      // above, so test loop end condition against that
      while (idx < endPtr) {
        // For UTF8 byte structure, see:
        // http://en.wikipedia.org/wiki/UTF-8#Description
        // https://www.ietf.org/rfc/rfc2279.txt
        // https://tools.ietf.org/html/rfc3629
        var u0 = heapOrArray[idx++];
        if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
        var u1 = heapOrArray[idx++] & 63;
        if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
        var u2 = heapOrArray[idx++] & 63;
        if ((u0 & 0xF0) == 0xE0) {
          u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
        } else {
          if ((u0 & 0xF8) != 0xF0) warnOnce('Invalid UTF-8 leading byte ' + ptrToString(u0) + ' encountered when deserializing a UTF-8 string in wasm memory to a JS string!');
          u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
        }
  
        if (u0 < 0x10000) {
          str += String.fromCharCode(u0);
        } else {
          var ch = u0 - 0x10000;
          str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
        }
      }
      return str;
    }
  
  
    /**
     * Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the
     * emscripten HEAP, returns a copy of that string as a Javascript String object.
     *
     * @param {number} ptr
     * @param {number=} maxBytesToRead - An optional length that specifies the
     *   maximum number of bytes to read. You can omit this parameter to scan the
     *   string until the first 0 byte. If maxBytesToRead is passed, and the string
     *   at [ptr, ptr+maxBytesToReadr[ contains a null byte in the middle, then the
     *   string will cut short at that byte index (i.e. maxBytesToRead will not
     *   produce a string of exact length [ptr, ptr+maxBytesToRead[) N.B. mixing
     *   frequent uses of UTF8ToString() with and without maxBytesToRead may throw
     *   JS JIT optimizations off, so it is worth to consider consistently using one
     * @return {string}
     */
  function UTF8ToString(ptr, maxBytesToRead) {
      assert(typeof ptr == 'number');
      return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
    }
  function ___assert_fail(condition, filename, line, func) {
      abort(`Assertion failed: ${UTF8ToString(condition)}, at: ` + [filename ? UTF8ToString(filename) : 'unknown filename', line, func ? UTF8ToString(func) : 'unknown function']);
    }

  /** @constructor */
  function ExceptionInfo(excPtr) {
      this.excPtr = excPtr;
      this.ptr = excPtr - 24;
  
      this.set_type = function(type) {
        HEAPU32[(((this.ptr)+(4))>>2)] = type;
      };
  
      this.get_type = function() {
        return HEAPU32[(((this.ptr)+(4))>>2)];
      };
  
      this.set_destructor = function(destructor) {
        HEAPU32[(((this.ptr)+(8))>>2)] = destructor;
      };
  
      this.get_destructor = function() {
        return HEAPU32[(((this.ptr)+(8))>>2)];
      };
  
      this.set_caught = function (caught) {
        caught = caught ? 1 : 0;
        HEAP8[(((this.ptr)+(12))>>0)] = caught;
      };
  
      this.get_caught = function () {
        return HEAP8[(((this.ptr)+(12))>>0)] != 0;
      };
  
      this.set_rethrown = function (rethrown) {
        rethrown = rethrown ? 1 : 0;
        HEAP8[(((this.ptr)+(13))>>0)] = rethrown;
      };
  
      this.get_rethrown = function () {
        return HEAP8[(((this.ptr)+(13))>>0)] != 0;
      };
  
      // Initialize native structure fields. Should be called once after allocated.
      this.init = function(type, destructor) {
        this.set_adjusted_ptr(0);
        this.set_type(type);
        this.set_destructor(destructor);
      }
  
      this.set_adjusted_ptr = function(adjustedPtr) {
        HEAPU32[(((this.ptr)+(16))>>2)] = adjustedPtr;
      };
  
      this.get_adjusted_ptr = function() {
        return HEAPU32[(((this.ptr)+(16))>>2)];
      };
  
      // Get pointer which is expected to be received by catch clause in C++ code. It may be adjusted
      // when the pointer is casted to some of the exception object base classes (e.g. when virtual
      // inheritance is used). When a pointer is thrown this method should return the thrown pointer
      // itself.
      this.get_exception_ptr = function() {
        // Work around a fastcomp bug, this code is still included for some reason in a build without
        // exceptions support.
        var isPointer = ___cxa_is_pointer_type(this.get_type());
        if (isPointer) {
          return HEAPU32[((this.excPtr)>>2)];
        }
        var adjusted = this.get_adjusted_ptr();
        if (adjusted !== 0) return adjusted;
        return this.excPtr;
      };
    }
  
  var exceptionLast = 0;
  
  var uncaughtExceptionCount = 0;
  function ___cxa_throw(ptr, type, destructor) {
      var info = new ExceptionInfo(ptr);
      // Initialize ExceptionInfo content after it was allocated in __cxa_allocate_exception.
      info.init(type, destructor);
      exceptionLast = ptr;
      uncaughtExceptionCount++;
      assert(false, 'Exception thrown, but exception catching is not enabled. Compile with -sNO_DISABLE_EXCEPTION_CATCHING or -sEXCEPTION_CATCHING_ALLOWED=[..] to catch.');
    }

  function __embind_register_bigint(primitiveType, name, size, minRange, maxRange) {}

  function getShiftFromSize(size) {
      switch (size) {
          case 1: return 0;
          case 2: return 1;
          case 4: return 2;
          case 8: return 3;
          default:
              throw new TypeError(`Unknown type size: ${size}`);
      }
    }
  
  function embind_init_charCodes() {
      var codes = new Array(256);
      for (var i = 0; i < 256; ++i) {
          codes[i] = String.fromCharCode(i);
      }
      embind_charCodes = codes;
    }
  var embind_charCodes = undefined;
  function readLatin1String(ptr) {
      var ret = "";
      var c = ptr;
      while (HEAPU8[c]) {
          ret += embind_charCodes[HEAPU8[c++]];
      }
      return ret;
    }
  
  var awaitingDependencies = {};
  
  var registeredTypes = {};
  
  var typeDependencies = {};
  
  var char_0 = 48;
  
  var char_9 = 57;
  function makeLegalFunctionName(name) {
      if (undefined === name) {
        return '_unknown';
      }
      name = name.replace(/[^a-zA-Z0-9_]/g, '$');
      var f = name.charCodeAt(0);
      if (f >= char_0 && f <= char_9) {
        return `_${name}`;
      }
      return name;
    }
  function createNamedFunction(name, body) {
      name = makeLegalFunctionName(name);
      // Use an abject with a computed property name to create a new function with
      // a name specified at runtime, but without using `new Function` or `eval`.
      return {
        [name]: function() {
          return body.apply(this, arguments);
        }
      }[name];
    }
  function extendError(baseErrorType, errorName) {
      var errorClass = createNamedFunction(errorName, function(message) {
        this.name = errorName;
        this.message = message;
  
        var stack = (new Error(message)).stack;
        if (stack !== undefined) {
          this.stack = this.toString() + '\n' +
              stack.replace(/^Error(:[^\n]*)?\n/, '');
        }
      });
      errorClass.prototype = Object.create(baseErrorType.prototype);
      errorClass.prototype.constructor = errorClass;
      errorClass.prototype.toString = function() {
        if (this.message === undefined) {
          return this.name;
        } else {
          return `${this.name}: ${this.message}`;
        }
      };
  
      return errorClass;
    }
  var BindingError = undefined;
  function throwBindingError(message) {
      throw new BindingError(message);
    }
  
  
  
  
  var InternalError = undefined;
  function throwInternalError(message) {
      throw new InternalError(message);
    }
  function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
      myTypes.forEach(function(type) {
          typeDependencies[type] = dependentTypes;
      });
  
      function onComplete(typeConverters) {
          var myTypeConverters = getTypeConverters(typeConverters);
          if (myTypeConverters.length !== myTypes.length) {
              throwInternalError('Mismatched type converter count');
          }
          for (var i = 0; i < myTypes.length; ++i) {
              registerType(myTypes[i], myTypeConverters[i]);
          }
      }
  
      var typeConverters = new Array(dependentTypes.length);
      var unregisteredTypes = [];
      var registered = 0;
      dependentTypes.forEach((dt, i) => {
        if (registeredTypes.hasOwnProperty(dt)) {
          typeConverters[i] = registeredTypes[dt];
        } else {
          unregisteredTypes.push(dt);
          if (!awaitingDependencies.hasOwnProperty(dt)) {
            awaitingDependencies[dt] = [];
          }
          awaitingDependencies[dt].push(() => {
            typeConverters[i] = registeredTypes[dt];
            ++registered;
            if (registered === unregisteredTypes.length) {
              onComplete(typeConverters);
            }
          });
        }
      });
      if (0 === unregisteredTypes.length) {
        onComplete(typeConverters);
      }
    }
  /** @param {Object=} options */
  function registerType(rawType, registeredInstance, options = {}) {
      if (!('argPackAdvance' in registeredInstance)) {
        throw new TypeError('registerType registeredInstance requires argPackAdvance');
      }
  
      var name = registeredInstance.name;
      if (!rawType) {
        throwBindingError(`type "${name}" must have a positive integer typeid pointer`);
      }
      if (registeredTypes.hasOwnProperty(rawType)) {
        if (options.ignoreDuplicateRegistrations) {
          return;
        } else {
          throwBindingError(`Cannot register type '${name}' twice`);
        }
      }
  
      registeredTypes[rawType] = registeredInstance;
      delete typeDependencies[rawType];
  
      if (awaitingDependencies.hasOwnProperty(rawType)) {
        var callbacks = awaitingDependencies[rawType];
        delete awaitingDependencies[rawType];
        callbacks.forEach((cb) => cb());
      }
    }
  function __embind_register_bool(rawType, name, size, trueValue, falseValue) {
      var shift = getShiftFromSize(size);
  
      name = readLatin1String(name);
      registerType(rawType, {
          name: name,
          'fromWireType': function(wt) {
              // ambiguous emscripten ABI: sometimes return values are
              // true or false, and sometimes integers (0 or 1)
              return !!wt;
          },
          'toWireType': function(destructors, o) {
              return o ? trueValue : falseValue;
          },
          'argPackAdvance': 8,
          'readValueFromPointer': function(pointer) {
              // TODO: if heap is fixed (like in asm.js) this could be executed outside
              var heap;
              if (size === 1) {
                  heap = HEAP8;
              } else if (size === 2) {
                  heap = HEAP16;
              } else if (size === 4) {
                  heap = HEAP32;
              } else {
                  throw new TypeError("Unknown boolean type size: " + name);
              }
              return this['fromWireType'](heap[pointer >> shift]);
          },
          destructorFunction: null, // This type does not need a destructor
      });
    }

  
  function ClassHandle_isAliasOf(other) {
      if (!(this instanceof ClassHandle)) {
        return false;
      }
      if (!(other instanceof ClassHandle)) {
        return false;
      }
  
      var leftClass = this.$$.ptrType.registeredClass;
      var left = this.$$.ptr;
      var rightClass = other.$$.ptrType.registeredClass;
      var right = other.$$.ptr;
  
      while (leftClass.baseClass) {
        left = leftClass.upcast(left);
        leftClass = leftClass.baseClass;
      }
  
      while (rightClass.baseClass) {
        right = rightClass.upcast(right);
        rightClass = rightClass.baseClass;
      }
  
      return leftClass === rightClass && left === right;
    }
  
  function shallowCopyInternalPointer(o) {
      return {
        count: o.count,
        deleteScheduled: o.deleteScheduled,
        preservePointerOnDelete: o.preservePointerOnDelete,
        ptr: o.ptr,
        ptrType: o.ptrType,
        smartPtr: o.smartPtr,
        smartPtrType: o.smartPtrType,
      };
    }
  
  function throwInstanceAlreadyDeleted(obj) {
      function getInstanceTypeName(handle) {
        return handle.$$.ptrType.registeredClass.name;
      }
      throwBindingError(getInstanceTypeName(obj) + ' instance already deleted');
    }
  
  var finalizationRegistry = false;
  
  function detachFinalizer(handle) {}
  
  function runDestructor($$) {
      if ($$.smartPtr) {
        $$.smartPtrType.rawDestructor($$.smartPtr);
      } else {
        $$.ptrType.registeredClass.rawDestructor($$.ptr);
      }
    }
  function releaseClassHandle($$) {
      $$.count.value -= 1;
      var toDelete = 0 === $$.count.value;
      if (toDelete) {
        runDestructor($$);
      }
    }
  
  function downcastPointer(ptr, ptrClass, desiredClass) {
      if (ptrClass === desiredClass) {
        return ptr;
      }
      if (undefined === desiredClass.baseClass) {
        return null; // no conversion
      }
  
      var rv = downcastPointer(ptr, ptrClass, desiredClass.baseClass);
      if (rv === null) {
        return null;
      }
      return desiredClass.downcast(rv);
    }
  
  var registeredPointers = {};
  
  function getInheritedInstanceCount() {
      return Object.keys(registeredInstances).length;
    }
  
  function getLiveInheritedInstances() {
      var rv = [];
      for (var k in registeredInstances) {
        if (registeredInstances.hasOwnProperty(k)) {
          rv.push(registeredInstances[k]);
        }
      }
      return rv;
    }
  
  var deletionQueue = [];
  function flushPendingDeletes() {
      while (deletionQueue.length) {
        var obj = deletionQueue.pop();
        obj.$$.deleteScheduled = false;
        obj['delete']();
      }
    }
  
  var delayFunction = undefined;
  
  
  function setDelayFunction(fn) {
      delayFunction = fn;
      if (deletionQueue.length && delayFunction) {
        delayFunction(flushPendingDeletes);
      }
    }
  function init_embind() {
      Module['getInheritedInstanceCount'] = getInheritedInstanceCount;
      Module['getLiveInheritedInstances'] = getLiveInheritedInstances;
      Module['flushPendingDeletes'] = flushPendingDeletes;
      Module['setDelayFunction'] = setDelayFunction;
    }
  var registeredInstances = {};
  
  function getBasestPointer(class_, ptr) {
      if (ptr === undefined) {
          throwBindingError('ptr should not be undefined');
      }
      while (class_.baseClass) {
          ptr = class_.upcast(ptr);
          class_ = class_.baseClass;
      }
      return ptr;
    }
  function getInheritedInstance(class_, ptr) {
      ptr = getBasestPointer(class_, ptr);
      return registeredInstances[ptr];
    }
  
  
  function makeClassHandle(prototype, record) {
      if (!record.ptrType || !record.ptr) {
        throwInternalError('makeClassHandle requires ptr and ptrType');
      }
      var hasSmartPtrType = !!record.smartPtrType;
      var hasSmartPtr = !!record.smartPtr;
      if (hasSmartPtrType !== hasSmartPtr) {
        throwInternalError('Both smartPtrType and smartPtr must be specified');
      }
      record.count = { value: 1 };
      return attachFinalizer(Object.create(prototype, {
        $$: {
            value: record,
        },
      }));
    }
  function RegisteredPointer_fromWireType(ptr) {
      // ptr is a raw pointer (or a raw smartpointer)
  
      // rawPointer is a maybe-null raw pointer
      var rawPointer = this.getPointee(ptr);
      if (!rawPointer) {
        this.destructor(ptr);
        return null;
      }
  
      var registeredInstance = getInheritedInstance(this.registeredClass, rawPointer);
      if (undefined !== registeredInstance) {
        // JS object has been neutered, time to repopulate it
        if (0 === registeredInstance.$$.count.value) {
          registeredInstance.$$.ptr = rawPointer;
          registeredInstance.$$.smartPtr = ptr;
          return registeredInstance['clone']();
        } else {
          // else, just increment reference count on existing object
          // it already has a reference to the smart pointer
          var rv = registeredInstance['clone']();
          this.destructor(ptr);
          return rv;
        }
      }
  
      function makeDefaultHandle() {
        if (this.isSmartPointer) {
          return makeClassHandle(this.registeredClass.instancePrototype, {
            ptrType: this.pointeeType,
            ptr: rawPointer,
            smartPtrType: this,
            smartPtr: ptr,
          });
        } else {
          return makeClassHandle(this.registeredClass.instancePrototype, {
            ptrType: this,
            ptr: ptr,
          });
        }
      }
  
      var actualType = this.registeredClass.getActualType(rawPointer);
      var registeredPointerRecord = registeredPointers[actualType];
      if (!registeredPointerRecord) {
        return makeDefaultHandle.call(this);
      }
  
      var toType;
      if (this.isConst) {
        toType = registeredPointerRecord.constPointerType;
      } else {
        toType = registeredPointerRecord.pointerType;
      }
      var dp = downcastPointer(
          rawPointer,
          this.registeredClass,
          toType.registeredClass);
      if (dp === null) {
        return makeDefaultHandle.call(this);
      }
      if (this.isSmartPointer) {
        return makeClassHandle(toType.registeredClass.instancePrototype, {
          ptrType: toType,
          ptr: dp,
          smartPtrType: this,
          smartPtr: ptr,
        });
      } else {
        return makeClassHandle(toType.registeredClass.instancePrototype, {
          ptrType: toType,
          ptr: dp,
        });
      }
    }
  function attachFinalizer(handle) {
      if ('undefined' === typeof FinalizationRegistry) {
        attachFinalizer = (handle) => handle;
        return handle;
      }
      // If the running environment has a FinalizationRegistry (see
      // https://github.com/tc39/proposal-weakrefs), then attach finalizers
      // for class handles.  We check for the presence of FinalizationRegistry
      // at run-time, not build-time.
      finalizationRegistry = new FinalizationRegistry((info) => {
        console.warn(info.leakWarning.stack.replace(/^Error: /, ''));
        releaseClassHandle(info.$$);
      });
      attachFinalizer = (handle) => {
        var $$ = handle.$$;
        var hasSmartPtr = !!$$.smartPtr;
        if (hasSmartPtr) {
          // We should not call the destructor on raw pointers in case other code expects the pointee to live
          var info = { $$: $$ };
          // Create a warning as an Error instance in advance so that we can store
          // the current stacktrace and point to it when / if a leak is detected.
          // This is more useful than the empty stacktrace of `FinalizationRegistry`
          // callback.
          var cls = $$.ptrType.registeredClass;
          info.leakWarning = new Error(`Embind found a leaked C++ instance ${cls.name} <${ptrToString($$.ptr)}>.\n` +
          "We'll free it automatically in this case, but this functionality is not reliable across various environments.\n" +
          "Make sure to invoke .delete() manually once you're done with the instance instead.\n" +
          "Originally allocated"); // `.stack` will add "at ..." after this sentence
          if ('captureStackTrace' in Error) {
            Error.captureStackTrace(info.leakWarning, RegisteredPointer_fromWireType);
          }
          finalizationRegistry.register(handle, info, handle);
        }
        return handle;
      };
      detachFinalizer = (handle) => finalizationRegistry.unregister(handle);
      return attachFinalizer(handle);
    }
  function ClassHandle_clone() {
      if (!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this);
      }
  
      if (this.$$.preservePointerOnDelete) {
        this.$$.count.value += 1;
        return this;
      } else {
        var clone = attachFinalizer(Object.create(Object.getPrototypeOf(this), {
          $$: {
            value: shallowCopyInternalPointer(this.$$),
          }
        }));
  
        clone.$$.count.value += 1;
        clone.$$.deleteScheduled = false;
        return clone;
      }
    }
  
  
  
  
  function ClassHandle_delete() {
      if (!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this);
      }
  
      if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
        throwBindingError('Object already scheduled for deletion');
      }
  
      detachFinalizer(this);
      releaseClassHandle(this.$$);
  
      if (!this.$$.preservePointerOnDelete) {
        this.$$.smartPtr = undefined;
        this.$$.ptr = undefined;
      }
    }
  
  function ClassHandle_isDeleted() {
      return !this.$$.ptr;
    }
  
  
  
  function ClassHandle_deleteLater() {
      if (!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this);
      }
      if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
        throwBindingError('Object already scheduled for deletion');
      }
      deletionQueue.push(this);
      if (deletionQueue.length === 1 && delayFunction) {
        delayFunction(flushPendingDeletes);
      }
      this.$$.deleteScheduled = true;
      return this;
    }
  function init_ClassHandle() {
      ClassHandle.prototype['isAliasOf'] = ClassHandle_isAliasOf;
      ClassHandle.prototype['clone'] = ClassHandle_clone;
      ClassHandle.prototype['delete'] = ClassHandle_delete;
      ClassHandle.prototype['isDeleted'] = ClassHandle_isDeleted;
      ClassHandle.prototype['deleteLater'] = ClassHandle_deleteLater;
    }
  function ClassHandle() {
    }
  
  
  
  function ensureOverloadTable(proto, methodName, humanName) {
      if (undefined === proto[methodName].overloadTable) {
        var prevFunc = proto[methodName];
        // Inject an overload resolver function that routes to the appropriate overload based on the number of arguments.
        proto[methodName] = function() {
          // TODO This check can be removed in -O3 level "unsafe" optimizations.
          if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
              throwBindingError(`Function '${humanName}' called with an invalid number of arguments (${arguments.length}) - expects one of (${proto[methodName].overloadTable})!`);
          }
          return proto[methodName].overloadTable[arguments.length].apply(this, arguments);
        };
        // Move the previous function into the overload table.
        proto[methodName].overloadTable = [];
        proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
      }
    }
  
  /** @param {number=} numArguments */
  function exposePublicSymbol(name, value, numArguments) {
      if (Module.hasOwnProperty(name)) {
        if (undefined === numArguments || (undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments])) {
          throwBindingError(`Cannot register public name '${name}' twice`);
        }
  
        // We are exposing a function with the same name as an existing function. Create an overload table and a function selector
        // that routes between the two.
        ensureOverloadTable(Module, name, name);
        if (Module.hasOwnProperty(numArguments)) {
          throwBindingError(`Cannot register multiple overloads of a function with the same number of arguments (${numArguments})!`);
        }
        // Add the new function into the overload table.
        Module[name].overloadTable[numArguments] = value;
      }
      else {
        Module[name] = value;
        if (undefined !== numArguments) {
          Module[name].numArguments = numArguments;
        }
      }
    }
  
  
  
  /** @constructor */
  function RegisteredClass(name,
                               constructor,
                               instancePrototype,
                               rawDestructor,
                               baseClass,
                               getActualType,
                               upcast,
                               downcast) {
      this.name = name;
      this.constructor = constructor;
      this.instancePrototype = instancePrototype;
      this.rawDestructor = rawDestructor;
      this.baseClass = baseClass;
      this.getActualType = getActualType;
      this.upcast = upcast;
      this.downcast = downcast;
      this.pureVirtualFunctions = [];
    }
  
  
  function upcastPointer(ptr, ptrClass, desiredClass) {
      while (ptrClass !== desiredClass) {
        if (!ptrClass.upcast) {
          throwBindingError(`Expected null or instance of ${desiredClass.name}, got an instance of ${ptrClass.name}`);
        }
        ptr = ptrClass.upcast(ptr);
        ptrClass = ptrClass.baseClass;
      }
      return ptr;
    }
  function constNoSmartPtrRawPointerToWireType(destructors, handle) {
      if (handle === null) {
        if (this.isReference) {
          throwBindingError(`null is not a valid ${this.name}`);
        }
        return 0;
      }
  
      if (!handle.$$) {
        throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);
      }
      if (!handle.$$.ptr) {
        throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);
      }
      var handleClass = handle.$$.ptrType.registeredClass;
      var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
      return ptr;
    }
  
  
  function genericPointerToWireType(destructors, handle) {
      var ptr;
      if (handle === null) {
        if (this.isReference) {
          throwBindingError(`null is not a valid ${this.name}`);
        }
  
        if (this.isSmartPointer) {
          ptr = this.rawConstructor();
          if (destructors !== null) {
            destructors.push(this.rawDestructor, ptr);
          }
          return ptr;
        } else {
          return 0;
        }
      }
  
      if (!handle.$$) {
        throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);
      }
      if (!handle.$$.ptr) {
        throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);
      }
      if (!this.isConst && handle.$$.ptrType.isConst) {
        throwBindingError(`Cannot convert argument of type ${(handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name)} to parameter type ${this.name}`);
      }
      var handleClass = handle.$$.ptrType.registeredClass;
      ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
  
      if (this.isSmartPointer) {
        // TODO: this is not strictly true
        // We could support BY_EMVAL conversions from raw pointers to smart pointers
        // because the smart pointer can hold a reference to the handle
        if (undefined === handle.$$.smartPtr) {
          throwBindingError('Passing raw pointer to smart pointer is illegal');
        }
  
        switch (this.sharingPolicy) {
          case 0: // NONE
            // no upcasting
            if (handle.$$.smartPtrType === this) {
              ptr = handle.$$.smartPtr;
            } else {
              throwBindingError(`Cannot convert argument of type ${(handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name)} to parameter type ${this.name}`);
            }
            break;
  
          case 1: // INTRUSIVE
            ptr = handle.$$.smartPtr;
            break;
  
          case 2: // BY_EMVAL
            if (handle.$$.smartPtrType === this) {
              ptr = handle.$$.smartPtr;
            } else {
              var clonedHandle = handle['clone']();
              ptr = this.rawShare(
                ptr,
                Emval.toHandle(function() {
                  clonedHandle['delete']();
                })
              );
              if (destructors !== null) {
                destructors.push(this.rawDestructor, ptr);
              }
            }
            break;
  
          default:
            throwBindingError('Unsupporting sharing policy');
        }
      }
      return ptr;
    }
  
  
  function nonConstNoSmartPtrRawPointerToWireType(destructors, handle) {
      if (handle === null) {
        if (this.isReference) {
          throwBindingError(`null is not a valid ${this.name}`);
        }
        return 0;
      }
  
      if (!handle.$$) {
        throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);
      }
      if (!handle.$$.ptr) {
        throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);
      }
      if (handle.$$.ptrType.isConst) {
          throwBindingError(`Cannot convert argument of type ${handle.$$.ptrType.name} to parameter type ${this.name}`);
      }
      var handleClass = handle.$$.ptrType.registeredClass;
      var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
      return ptr;
    }
  
  function simpleReadValueFromPointer(pointer) {
      return this['fromWireType'](HEAP32[((pointer)>>2)]);
    }
  
  function RegisteredPointer_getPointee(ptr) {
      if (this.rawGetPointee) {
        ptr = this.rawGetPointee(ptr);
      }
      return ptr;
    }
  
  function RegisteredPointer_destructor(ptr) {
      if (this.rawDestructor) {
        this.rawDestructor(ptr);
      }
    }
  
  function RegisteredPointer_deleteObject(handle) {
      if (handle !== null) {
        handle['delete']();
      }
    }
  
  function init_RegisteredPointer() {
      RegisteredPointer.prototype.getPointee = RegisteredPointer_getPointee;
      RegisteredPointer.prototype.destructor = RegisteredPointer_destructor;
      RegisteredPointer.prototype['argPackAdvance'] = 8;
      RegisteredPointer.prototype['readValueFromPointer'] = simpleReadValueFromPointer;
      RegisteredPointer.prototype['deleteObject'] = RegisteredPointer_deleteObject;
      RegisteredPointer.prototype['fromWireType'] = RegisteredPointer_fromWireType;
    }
  /** @constructor
      @param {*=} pointeeType,
      @param {*=} sharingPolicy,
      @param {*=} rawGetPointee,
      @param {*=} rawConstructor,
      @param {*=} rawShare,
      @param {*=} rawDestructor,
       */
  function RegisteredPointer(
      name,
      registeredClass,
      isReference,
      isConst,
  
      // smart pointer properties
      isSmartPointer,
      pointeeType,
      sharingPolicy,
      rawGetPointee,
      rawConstructor,
      rawShare,
      rawDestructor
    ) {
      this.name = name;
      this.registeredClass = registeredClass;
      this.isReference = isReference;
      this.isConst = isConst;
  
      // smart pointer properties
      this.isSmartPointer = isSmartPointer;
      this.pointeeType = pointeeType;
      this.sharingPolicy = sharingPolicy;
      this.rawGetPointee = rawGetPointee;
      this.rawConstructor = rawConstructor;
      this.rawShare = rawShare;
      this.rawDestructor = rawDestructor;
  
      if (!isSmartPointer && registeredClass.baseClass === undefined) {
        if (isConst) {
          this['toWireType'] = constNoSmartPtrRawPointerToWireType;
          this.destructorFunction = null;
        } else {
          this['toWireType'] = nonConstNoSmartPtrRawPointerToWireType;
          this.destructorFunction = null;
        }
      } else {
        this['toWireType'] = genericPointerToWireType;
        // Here we must leave this.destructorFunction undefined, since whether genericPointerToWireType returns
        // a pointer that needs to be freed up is runtime-dependent, and cannot be evaluated at registration time.
        // TODO: Create an alternative mechanism that allows removing the use of var destructors = []; array in
        //       craftInvokerFunction altogether.
      }
    }
  
  /** @param {number=} numArguments */
  function replacePublicSymbol(name, value, numArguments) {
      if (!Module.hasOwnProperty(name)) {
        throwInternalError('Replacing nonexistant public symbol');
      }
      // If there's an overload table for this symbol, replace the symbol in the overload table instead.
      if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
        Module[name].overloadTable[numArguments] = value;
      }
      else {
        Module[name] = value;
        Module[name].argCount = numArguments;
      }
    }
  
  
  
  function dynCallLegacy(sig, ptr, args) {
      assert(('dynCall_' + sig) in Module, `bad function pointer type - dynCall function not found for sig '${sig}'`);
      if (args && args.length) {
        // j (64-bit integer) must be passed in as two numbers [low 32, high 32].
        assert(args.length === sig.substring(1).replace(/j/g, '--').length);
      } else {
        assert(sig.length == 1);
      }
      var f = Module['dynCall_' + sig];
      return args && args.length ? f.apply(null, [ptr].concat(args)) : f.call(null, ptr);
    }
  
  var wasmTableMirror = [];
  
  function getWasmTableEntry(funcPtr) {
      var func = wasmTableMirror[funcPtr];
      if (!func) {
        if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
        wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
      }
      assert(wasmTable.get(funcPtr) == func, "JavaScript-side Wasm function table mirror is out of date!");
      return func;
    }
  
  /** @param {Object=} args */
  function dynCall(sig, ptr, args) {
      // Without WASM_BIGINT support we cannot directly call function with i64 as
      // part of thier signature, so we rely the dynCall functions generated by
      // wasm-emscripten-finalize
      if (sig.includes('j')) {
        return dynCallLegacy(sig, ptr, args);
      }
      assert(getWasmTableEntry(ptr), `missing table entry in dynCall: ${ptr}`);
      var rtn = getWasmTableEntry(ptr).apply(null, args);
      return rtn;
  
    }
  
  function getDynCaller(sig, ptr) {
      assert(sig.includes('j') || sig.includes('p'), 'getDynCaller should only be called with i64 sigs')
      var argCache = [];
      return function() {
        argCache.length = 0;
        Object.assign(argCache, arguments);
        return dynCall(sig, ptr, argCache);
      };
    }
  
  
  function embind__requireFunction(signature, rawFunction) {
      signature = readLatin1String(signature);
  
      function makeDynCaller() {
        if (signature.includes('j')) {
          return getDynCaller(signature, rawFunction);
        }
        return getWasmTableEntry(rawFunction);
      }
  
      var fp = makeDynCaller();
      if (typeof fp != "function") {
          throwBindingError(`unknown function pointer with signature ${signature}: ${rawFunction}`);
      }
      return fp;
    }
  
  
  
  var UnboundTypeError = undefined;
  
  
  
  function getTypeName(type) {
      var ptr = ___getTypeName(type);
      var rv = readLatin1String(ptr);
      _free(ptr);
      return rv;
    }
  function throwUnboundTypeError(message, types) {
      var unboundTypes = [];
      var seen = {};
      function visit(type) {
        if (seen[type]) {
          return;
        }
        if (registeredTypes[type]) {
          return;
        }
        if (typeDependencies[type]) {
          typeDependencies[type].forEach(visit);
          return;
        }
        unboundTypes.push(type);
        seen[type] = true;
      }
      types.forEach(visit);
  
      throw new UnboundTypeError(`${message}: ` + unboundTypes.map(getTypeName).join([', ']));
    }
  
  function __embind_register_class(rawType,
                                     rawPointerType,
                                     rawConstPointerType,
                                     baseClassRawType,
                                     getActualTypeSignature,
                                     getActualType,
                                     upcastSignature,
                                     upcast,
                                     downcastSignature,
                                     downcast,
                                     name,
                                     destructorSignature,
                                     rawDestructor) {
      name = readLatin1String(name);
      getActualType = embind__requireFunction(getActualTypeSignature, getActualType);
      if (upcast) {
        upcast = embind__requireFunction(upcastSignature, upcast);
      }
      if (downcast) {
        downcast = embind__requireFunction(downcastSignature, downcast);
      }
      rawDestructor = embind__requireFunction(destructorSignature, rawDestructor);
      var legalFunctionName = makeLegalFunctionName(name);
  
      exposePublicSymbol(legalFunctionName, function() {
        // this code cannot run if baseClassRawType is zero
        throwUnboundTypeError(`Cannot construct ${name} due to unbound types`, [baseClassRawType]);
      });
  
      whenDependentTypesAreResolved(
        [rawType, rawPointerType, rawConstPointerType],
        baseClassRawType ? [baseClassRawType] : [],
        function(base) {
          base = base[0];
  
          var baseClass;
          var basePrototype;
          if (baseClassRawType) {
            baseClass = base.registeredClass;
            basePrototype = baseClass.instancePrototype;
          } else {
            basePrototype = ClassHandle.prototype;
          }
  
          var constructor = createNamedFunction(legalFunctionName, function() {
            if (Object.getPrototypeOf(this) !== instancePrototype) {
              throw new BindingError("Use 'new' to construct " + name);
            }
            if (undefined === registeredClass.constructor_body) {
              throw new BindingError(name + " has no accessible constructor");
            }
            var body = registeredClass.constructor_body[arguments.length];
            if (undefined === body) {
              throw new BindingError(`Tried to invoke ctor of ${name} with invalid number of parameters (${arguments.length}) - expected (${Object.keys(registeredClass.constructor_body).toString()}) parameters instead!`);
            }
            return body.apply(this, arguments);
          });
  
          var instancePrototype = Object.create(basePrototype, {
            constructor: { value: constructor },
          });
  
          constructor.prototype = instancePrototype;
  
          var registeredClass = new RegisteredClass(name,
                                                    constructor,
                                                    instancePrototype,
                                                    rawDestructor,
                                                    baseClass,
                                                    getActualType,
                                                    upcast,
                                                    downcast);
  
          if (registeredClass.baseClass) {
            // Keep track of class hierarchy. Used to allow sub-classes to inherit class functions.
            if (registeredClass.baseClass.__derivedClasses === undefined) {
              registeredClass.baseClass.__derivedClasses = [];
            }
  
            registeredClass.baseClass.__derivedClasses.push(registeredClass);
          }
  
          var referenceConverter = new RegisteredPointer(name,
                                                         registeredClass,
                                                         true,
                                                         false,
                                                         false);
  
          var pointerConverter = new RegisteredPointer(name + '*',
                                                       registeredClass,
                                                       false,
                                                       false,
                                                       false);
  
          var constPointerConverter = new RegisteredPointer(name + ' const*',
                                                            registeredClass,
                                                            false,
                                                            true,
                                                            false);
  
          registeredPointers[rawType] = {
            pointerType: pointerConverter,
            constPointerType: constPointerConverter
          };
  
          replacePublicSymbol(legalFunctionName, constructor);
  
          return [referenceConverter, pointerConverter, constPointerConverter];
        }
      );
    }

  function heap32VectorToArray(count, firstElement) {
      var array = [];
      for (var i = 0; i < count; i++) {
          // TODO(https://github.com/emscripten-core/emscripten/issues/17310):
          // Find a way to hoist the `>> 2` or `>> 3` out of this loop.
          array.push(HEAPU32[(((firstElement)+(i * 4))>>2)]);
      }
      return array;
    }
  
  
  function runDestructors(destructors) {
      while (destructors.length) {
        var ptr = destructors.pop();
        var del = destructors.pop();
        del(ptr);
      }
    }
  
  
  
  
  
  
  
  function newFunc(constructor, argumentList) {
      if (!(constructor instanceof Function)) {
        throw new TypeError(`new_ called with constructor type ${typeof(constructor)} which is not a function`);
      }
      /*
       * Previously, the following line was just:
       *   function dummy() {};
       * Unfortunately, Chrome was preserving 'dummy' as the object's name, even
       * though at creation, the 'dummy' has the correct constructor name.  Thus,
       * objects created with IMVU.new would show up in the debugger as 'dummy',
       * which isn't very helpful.  Using IMVU.createNamedFunction addresses the
       * issue.  Doublely-unfortunately, there's no way to write a test for this
       * behavior.  -NRD 2013.02.22
       */
      var dummy = createNamedFunction(constructor.name || 'unknownFunctionName', function(){});
      dummy.prototype = constructor.prototype;
      var obj = new dummy;
  
      var r = constructor.apply(obj, argumentList);
      return (r instanceof Object) ? r : obj;
    }
  function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc, /** boolean= */ isAsync) {
      // humanName: a human-readable string name for the function to be generated.
      // argTypes: An array that contains the embind type objects for all types in the function signature.
      //    argTypes[0] is the type object for the function return value.
      //    argTypes[1] is the type object for function this object/class type, or null if not crafting an invoker for a class method.
      //    argTypes[2...] are the actual function parameters.
      // classType: The embind type object for the class to be bound, or null if this is not a method of a class.
      // cppInvokerFunc: JS Function object to the C++-side function that interops into C++ code.
      // cppTargetFunc: Function pointer (an integer to FUNCTION_TABLE) to the target C++ function the cppInvokerFunc will end up calling.
      // isAsync: Optional. If true, returns an async function. Async bindings are only supported with JSPI.
      var argCount = argTypes.length;
  
      if (argCount < 2) {
        throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
      }
  
      assert(!isAsync, 'Async bindings are only supported with JSPI.');
  
      var isClassMethodFunc = (argTypes[1] !== null && classType !== null);
  
      // Free functions with signature "void function()" do not need an invoker that marshalls between wire types.
  // TODO: This omits argument count check - enable only at -O3 or similar.
  //    if (ENABLE_UNSAFE_OPTS && argCount == 2 && argTypes[0].name == "void" && !isClassMethodFunc) {
  //       return FUNCTION_TABLE[fn];
  //    }
  
      // Determine if we need to use a dynamic stack to store the destructors for the function parameters.
      // TODO: Remove this completely once all function invokers are being dynamically generated.
      var needsDestructorStack = false;
  
      for (var i = 1; i < argTypes.length; ++i) { // Skip return value at index 0 - it's not deleted here.
        if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) { // The type does not define a destructor function - must use dynamic stack
          needsDestructorStack = true;
          break;
        }
      }
  
      var returns = (argTypes[0].name !== "void");
  
      var argsList = "";
      var argsListWired = "";
      for (var i = 0; i < argCount - 2; ++i) {
        argsList += (i!==0?", ":"")+"arg"+i;
        argsListWired += (i!==0?", ":"")+"arg"+i+"Wired";
      }
  
      var invokerFnBody = `
        return function ${makeLegalFunctionName(humanName)}(${argsList}) {
        if (arguments.length !== ${argCount - 2}) {
          throwBindingError('function ${humanName} called with ${arguments.length} arguments, expected ${argCount - 2} args!');
        }`;
  
      if (needsDestructorStack) {
        invokerFnBody += "var destructors = [];\n";
      }
  
      var dtorStack = needsDestructorStack ? "destructors" : "null";
      var args1 = ["throwBindingError", "invoker", "fn", "runDestructors", "retType", "classParam"];
      var args2 = [throwBindingError, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1]];
  
      if (isClassMethodFunc) {
        invokerFnBody += "var thisWired = classParam.toWireType("+dtorStack+", this);\n";
      }
  
      for (var i = 0; i < argCount - 2; ++i) {
        invokerFnBody += "var arg"+i+"Wired = argType"+i+".toWireType("+dtorStack+", arg"+i+"); // "+argTypes[i+2].name+"\n";
        args1.push("argType"+i);
        args2.push(argTypes[i+2]);
      }
  
      if (isClassMethodFunc) {
        argsListWired = "thisWired" + (argsListWired.length > 0 ? ", " : "") + argsListWired;
      }
  
      invokerFnBody +=
          (returns || isAsync ? "var rv = ":"") + "invoker(fn"+(argsListWired.length>0?", ":"")+argsListWired+");\n";
  
      if (needsDestructorStack) {
        invokerFnBody += "runDestructors(destructors);\n";
      } else {
        for (var i = isClassMethodFunc?1:2; i < argTypes.length; ++i) { // Skip return value at index 0 - it's not deleted here. Also skip class type if not a method.
          var paramName = (i === 1 ? "thisWired" : ("arg"+(i - 2)+"Wired"));
          if (argTypes[i].destructorFunction !== null) {
            invokerFnBody += paramName+"_dtor("+paramName+"); // "+argTypes[i].name+"\n";
            args1.push(paramName+"_dtor");
            args2.push(argTypes[i].destructorFunction);
          }
        }
      }
  
      if (returns) {
        invokerFnBody += "var ret = retType.fromWireType(rv);\n" +
                         "return ret;\n";
      } else {
      }
  
      invokerFnBody += "}\n";
  
      args1.push(invokerFnBody);
  
      return newFunc(Function, args1).apply(null, args2);
    }
  function __embind_register_class_constructor(
      rawClassType,
      argCount,
      rawArgTypesAddr,
      invokerSignature,
      invoker,
      rawConstructor
    ) {
      assert(argCount > 0);
      var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
      invoker = embind__requireFunction(invokerSignature, invoker);
      var args = [rawConstructor];
      var destructors = [];
  
      whenDependentTypesAreResolved([], [rawClassType], function(classType) {
        classType = classType[0];
        var humanName = `constructor ${classType.name}`;
  
        if (undefined === classType.registeredClass.constructor_body) {
          classType.registeredClass.constructor_body = [];
        }
        if (undefined !== classType.registeredClass.constructor_body[argCount - 1]) {
          throw new BindingError(`Cannot register multiple constructors with identical number of parameters (${argCount-1}) for class '${classType.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
        }
        classType.registeredClass.constructor_body[argCount - 1] = () => {
          throwUnboundTypeError(`Cannot construct ${classType.name} due to unbound types`, rawArgTypes);
        };
  
        whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
          // Insert empty slot for context type (argTypes[1]).
          argTypes.splice(1, 0, null);
          classType.registeredClass.constructor_body[argCount - 1] = craftInvokerFunction(humanName, argTypes, null, invoker, rawConstructor);
          return [];
        });
        return [];
      });
    }

  
  
  
  
  
  function __embind_register_class_function(rawClassType,
                                              methodName,
                                              argCount,
                                              rawArgTypesAddr, // [ReturnType, ThisType, Args...]
                                              invokerSignature,
                                              rawInvoker,
                                              context,
                                              isPureVirtual,
                                              isAsync) {
      var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
      methodName = readLatin1String(methodName);
      rawInvoker = embind__requireFunction(invokerSignature, rawInvoker);
  
      whenDependentTypesAreResolved([], [rawClassType], function(classType) {
        classType = classType[0];
        var humanName = `${classType.name}.${methodName}`;
  
        if (methodName.startsWith("@@")) {
          methodName = Symbol[methodName.substring(2)];
        }
  
        if (isPureVirtual) {
          classType.registeredClass.pureVirtualFunctions.push(methodName);
        }
  
        function unboundTypesHandler() {
          throwUnboundTypeError(`Cannot call ${humanName} due to unbound types`, rawArgTypes);
        }
  
        var proto = classType.registeredClass.instancePrototype;
        var method = proto[methodName];
        if (undefined === method || (undefined === method.overloadTable && method.className !== classType.name && method.argCount === argCount - 2)) {
          // This is the first overload to be registered, OR we are replacing a
          // function in the base class with a function in the derived class.
          unboundTypesHandler.argCount = argCount - 2;
          unboundTypesHandler.className = classType.name;
          proto[methodName] = unboundTypesHandler;
        } else {
          // There was an existing function with the same name registered. Set up
          // a function overload routing table.
          ensureOverloadTable(proto, methodName, humanName);
          proto[methodName].overloadTable[argCount - 2] = unboundTypesHandler;
        }
  
        whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
          var memberFunction = craftInvokerFunction(humanName, argTypes, classType, rawInvoker, context, isAsync);
  
          // Replace the initial unbound-handler-stub function with the appropriate member function, now that all types
          // are resolved. If multiple overloads are registered for this function, the function goes into an overload table.
          if (undefined === proto[methodName].overloadTable) {
            // Set argCount in case an overload is registered later
            memberFunction.argCount = argCount - 2;
            proto[methodName] = memberFunction;
          } else {
            proto[methodName].overloadTable[argCount - 2] = memberFunction;
          }
  
          return [];
        });
        return [];
      });
    }

  /** @constructor */
  function HandleAllocator() {
      // Reserve slot 0 so that 0 is always an invalid handle
      this.allocated = [undefined];
      this.freelist = [];
      this.get = function(id) {
        assert(this.allocated[id] !== undefined, `invalid handle: ${id}`);
        return this.allocated[id];
      };
      this.has = function(id) {
        return this.allocated[id] !== undefined;
      };
      this.allocate = function(handle) {
        var id = this.freelist.pop() || this.allocated.length;
        this.allocated[id] = handle;
        return id;
      };
      this.free = function(id) {
        assert(this.allocated[id] !== undefined);
        // Set the slot to `undefined` rather than using `delete` here since
        // apparently arrays with holes in them can be less efficient.
        this.allocated[id] = undefined;
        this.freelist.push(id);
      };
    }
  var emval_handles = new HandleAllocator();;
  function __emval_decref(handle) {
      if (handle >= emval_handles.reserved && 0 === --emval_handles.get(handle).refcount) {
        emval_handles.free(handle);
      }
    }
  
  
  
  function count_emval_handles() {
      var count = 0;
      for (var i = emval_handles.reserved; i < emval_handles.allocated.length; ++i) {
        if (emval_handles.allocated[i] !== undefined) {
          ++count;
        }
      }
      return count;
    }
  
  function init_emval() {
      // reserve some special values. These never get de-allocated.
      // The HandleAllocator takes care of reserving zero.
      emval_handles.allocated.push(
        {value: undefined},
        {value: null},
        {value: true},
        {value: false},
      );
      emval_handles.reserved = emval_handles.allocated.length
      Module['count_emval_handles'] = count_emval_handles;
    }
  var Emval = {toValue:(handle) => {
        if (!handle) {
            throwBindingError('Cannot use deleted val. handle = ' + handle);
        }
        return emval_handles.get(handle).value;
      },toHandle:(value) => {
        switch (value) {
          case undefined: return 1;
          case null: return 2;
          case true: return 3;
          case false: return 4;
          default:{
            return emval_handles.allocate({refcount: 1, value: value});
          }
        }
      }};
  
  
  
  function __embind_register_emval(rawType, name) {
      name = readLatin1String(name);
      registerType(rawType, {
        name: name,
        'fromWireType': function(handle) {
          var rv = Emval.toValue(handle);
          __emval_decref(handle);
          return rv;
        },
        'toWireType': function(destructors, value) {
          return Emval.toHandle(value);
        },
        'argPackAdvance': 8,
        'readValueFromPointer': simpleReadValueFromPointer,
        destructorFunction: null, // This type does not need a destructor
  
        // TODO: do we need a deleteObject here?  write a test where
        // emval is passed into JS via an interface
      });
    }

  function embindRepr(v) {
      if (v === null) {
          return 'null';
      }
      var t = typeof v;
      if (t === 'object' || t === 'array' || t === 'function') {
          return v.toString();
      } else {
          return '' + v;
      }
    }
  
  function floatReadValueFromPointer(name, shift) {
      switch (shift) {
          case 2: return function(pointer) {
              return this['fromWireType'](HEAPF32[pointer >> 2]);
          };
          case 3: return function(pointer) {
              return this['fromWireType'](HEAPF64[pointer >> 3]);
          };
          default:
              throw new TypeError("Unknown float type: " + name);
      }
    }
  
  
  
  function __embind_register_float(rawType, name, size) {
      var shift = getShiftFromSize(size);
      name = readLatin1String(name);
      registerType(rawType, {
        name: name,
        'fromWireType': function(value) {
           return value;
        },
        'toWireType': function(destructors, value) {
          if (typeof value != "number" && typeof value != "boolean") {
            throw new TypeError(`Cannot convert ${embindRepr(value)} to ${this.name}`);
          }
          // The VM will perform JS to Wasm value conversion, according to the spec:
          // https://www.w3.org/TR/wasm-js-api-1/#towebassemblyvalue
          return value;
        },
        'argPackAdvance': 8,
        'readValueFromPointer': floatReadValueFromPointer(name, shift),
        destructorFunction: null, // This type does not need a destructor
      });
    }

  
  
  function integerReadValueFromPointer(name, shift, signed) {
      // integers are quite common, so generate very specialized functions
      switch (shift) {
          case 0: return signed ?
              function readS8FromPointer(pointer) { return HEAP8[pointer]; } :
              function readU8FromPointer(pointer) { return HEAPU8[pointer]; };
          case 1: return signed ?
              function readS16FromPointer(pointer) { return HEAP16[pointer >> 1]; } :
              function readU16FromPointer(pointer) { return HEAPU16[pointer >> 1]; };
          case 2: return signed ?
              function readS32FromPointer(pointer) { return HEAP32[pointer >> 2]; } :
              function readU32FromPointer(pointer) { return HEAPU32[pointer >> 2]; };
          default:
              throw new TypeError("Unknown integer type: " + name);
      }
    }
  
  
  function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
      name = readLatin1String(name);
      // LLVM doesn't have signed and unsigned 32-bit types, so u32 literals come
      // out as 'i32 -1'. Always treat those as max u32.
      if (maxRange === -1) {
          maxRange = 4294967295;
      }
  
      var shift = getShiftFromSize(size);
  
      var fromWireType = (value) => value;
  
      if (minRange === 0) {
          var bitshift = 32 - 8*size;
          fromWireType = (value) => (value << bitshift) >>> bitshift;
      }
  
      var isUnsignedType = (name.includes('unsigned'));
      var checkAssertions = (value, toTypeName) => {
        if (typeof value != "number" && typeof value != "boolean") {
          throw new TypeError(`Cannot convert "${embindRepr(value)}" to ${toTypeName}`);
        }
        if (value < minRange || value > maxRange) {
          throw new TypeError(`Passing a number "${embindRepr(value)}" from JS side to C/C++ side to an argument of type "${name}", which is outside the valid range [${minRange}, ${maxRange}]!`);
        }
      }
      var toWireType;
      if (isUnsignedType) {
        toWireType = function(destructors, value) {
          checkAssertions(value, this.name);
          return value >>> 0;
        }
      } else {
        toWireType = function(destructors, value) {
          checkAssertions(value, this.name);
          // The VM will perform JS to Wasm value conversion, according to the spec:
          // https://www.w3.org/TR/wasm-js-api-1/#towebassemblyvalue
          return value;
        }
      }
      registerType(primitiveType, {
        name: name,
        'fromWireType': fromWireType,
        'toWireType': toWireType,
        'argPackAdvance': 8,
        'readValueFromPointer': integerReadValueFromPointer(name, shift, minRange !== 0),
        destructorFunction: null, // This type does not need a destructor
      });
    }

  
  function __embind_register_memory_view(rawType, dataTypeIndex, name) {
      var typeMapping = [
        Int8Array,
        Uint8Array,
        Int16Array,
        Uint16Array,
        Int32Array,
        Uint32Array,
        Float32Array,
        Float64Array,
      ];
  
      var TA = typeMapping[dataTypeIndex];
  
      function decodeMemoryView(handle) {
        handle = handle >> 2;
        var heap = HEAPU32;
        var size = heap[handle]; // in elements
        var data = heap[handle + 1]; // byte offset into emscripten heap
        return new TA(heap.buffer, data, size);
      }
  
      name = readLatin1String(name);
      registerType(rawType, {
        name: name,
        'fromWireType': decodeMemoryView,
        'argPackAdvance': 8,
        'readValueFromPointer': decodeMemoryView,
      }, {
        ignoreDuplicateRegistrations: true,
      });
    }

  
  
  
  
  function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
      assert(typeof str === 'string');
      // Parameter maxBytesToWrite is not optional. Negative values, 0, null,
      // undefined and false each don't write out any bytes.
      if (!(maxBytesToWrite > 0))
        return 0;
  
      var startIdx = outIdx;
      var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
      for (var i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
        // unit, not a Unicode code point of the character! So decode
        // UTF16->UTF32->UTF8.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description
        // and https://www.ietf.org/rfc/rfc2279.txt
        // and https://tools.ietf.org/html/rfc3629
        var u = str.charCodeAt(i); // possibly a lead surrogate
        if (u >= 0xD800 && u <= 0xDFFF) {
          var u1 = str.charCodeAt(++i);
          u = 0x10000 + ((u & 0x3FF) << 10) | (u1 & 0x3FF);
        }
        if (u <= 0x7F) {
          if (outIdx >= endIdx) break;
          heap[outIdx++] = u;
        } else if (u <= 0x7FF) {
          if (outIdx + 1 >= endIdx) break;
          heap[outIdx++] = 0xC0 | (u >> 6);
          heap[outIdx++] = 0x80 | (u & 63);
        } else if (u <= 0xFFFF) {
          if (outIdx + 2 >= endIdx) break;
          heap[outIdx++] = 0xE0 | (u >> 12);
          heap[outIdx++] = 0x80 | ((u >> 6) & 63);
          heap[outIdx++] = 0x80 | (u & 63);
        } else {
          if (outIdx + 3 >= endIdx) break;
          if (u > 0x10FFFF) warnOnce('Invalid Unicode code point ' + ptrToString(u) + ' encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).');
          heap[outIdx++] = 0xF0 | (u >> 18);
          heap[outIdx++] = 0x80 | ((u >> 12) & 63);
          heap[outIdx++] = 0x80 | ((u >> 6) & 63);
          heap[outIdx++] = 0x80 | (u & 63);
        }
      }
      // Null-terminate the pointer to the buffer.
      heap[outIdx] = 0;
      return outIdx - startIdx;
    }
  function stringToUTF8(str, outPtr, maxBytesToWrite) {
      assert(typeof maxBytesToWrite == 'number', 'stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
      return stringToUTF8Array(str, HEAPU8,outPtr, maxBytesToWrite);
    }
  
  function lengthBytesUTF8(str) {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
        // unit, not a Unicode code point of the character! So decode
        // UTF16->UTF32->UTF8.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        var c = str.charCodeAt(i); // possibly a lead surrogate
        if (c <= 0x7F) {
          len++;
        } else if (c <= 0x7FF) {
          len += 2;
        } else if (c >= 0xD800 && c <= 0xDFFF) {
          len += 4; ++i;
        } else {
          len += 3;
        }
      }
      return len;
    }
  
  
  
  function __embind_register_std_string(rawType, name) {
      name = readLatin1String(name);
      var stdStringIsUTF8
      //process only std::string bindings with UTF8 support, in contrast to e.g. std::basic_string<unsigned char>
      = (name === "std::string");
  
      registerType(rawType, {
        name: name,
        'fromWireType': function(value) {
          var length = HEAPU32[((value)>>2)];
          var payload = value + 4;
  
          var str;
          if (stdStringIsUTF8) {
            var decodeStartPtr = payload;
            // Looping here to support possible embedded '0' bytes
            for (var i = 0; i <= length; ++i) {
              var currentBytePtr = payload + i;
              if (i == length || HEAPU8[currentBytePtr] == 0) {
                var maxRead = currentBytePtr - decodeStartPtr;
                var stringSegment = UTF8ToString(decodeStartPtr, maxRead);
                if (str === undefined) {
                  str = stringSegment;
                } else {
                  str += String.fromCharCode(0);
                  str += stringSegment;
                }
                decodeStartPtr = currentBytePtr + 1;
              }
            }
          } else {
            var a = new Array(length);
            for (var i = 0; i < length; ++i) {
              a[i] = String.fromCharCode(HEAPU8[payload + i]);
            }
            str = a.join('');
          }
  
          _free(value);
  
          return str;
        },
        'toWireType': function(destructors, value) {
          if (value instanceof ArrayBuffer) {
            value = new Uint8Array(value);
          }
  
          var length;
          var valueIsOfTypeString = (typeof value == 'string');
  
          if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
            throwBindingError('Cannot pass non-string to std::string');
          }
          if (stdStringIsUTF8 && valueIsOfTypeString) {
            length = lengthBytesUTF8(value);
          } else {
            length = value.length;
          }
  
          // assumes 4-byte alignment
          var base = _malloc(4 + length + 1);
          var ptr = base + 4;
          HEAPU32[((base)>>2)] = length;
          if (stdStringIsUTF8 && valueIsOfTypeString) {
            stringToUTF8(value, ptr, length + 1);
          } else {
            if (valueIsOfTypeString) {
              for (var i = 0; i < length; ++i) {
                var charCode = value.charCodeAt(i);
                if (charCode > 255) {
                  _free(ptr);
                  throwBindingError('String has UTF-16 code units that do not fit in 8 bits');
                }
                HEAPU8[ptr + i] = charCode;
              }
            } else {
              for (var i = 0; i < length; ++i) {
                HEAPU8[ptr + i] = value[i];
              }
            }
          }
  
          if (destructors !== null) {
            destructors.push(_free, base);
          }
          return base;
        },
        'argPackAdvance': 8,
        'readValueFromPointer': simpleReadValueFromPointer,
        destructorFunction: function(ptr) { _free(ptr); },
      });
    }

  
  
  
  var UTF16Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf-16le') : undefined;;
  function UTF16ToString(ptr, maxBytesToRead) {
      assert(ptr % 2 == 0, 'Pointer passed to UTF16ToString must be aligned to two bytes!');
      var endPtr = ptr;
      // TextDecoder needs to know the byte length in advance, it doesn't stop on
      // null terminator by itself.
      // Also, use the length info to avoid running tiny strings through
      // TextDecoder, since .subarray() allocates garbage.
      var idx = endPtr >> 1;
      var maxIdx = idx + maxBytesToRead / 2;
      // If maxBytesToRead is not passed explicitly, it will be undefined, and this
      // will always evaluate to true. This saves on code size.
      while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;
      endPtr = idx << 1;
  
      if (endPtr - ptr > 32 && UTF16Decoder)
        return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
  
      // Fallback: decode without UTF16Decoder
      var str = '';
  
      // If maxBytesToRead is not passed explicitly, it will be undefined, and the
      // for-loop's condition will always evaluate to true. The loop is then
      // terminated on the first null char.
      for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
        var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
        if (codeUnit == 0) break;
        // fromCharCode constructs a character from a UTF-16 code unit, so we can
        // pass the UTF16 string right through.
        str += String.fromCharCode(codeUnit);
      }
  
      return str;
    }
  
  function stringToUTF16(str, outPtr, maxBytesToWrite) {
      assert(outPtr % 2 == 0, 'Pointer passed to stringToUTF16 must be aligned to two bytes!');
      assert(typeof maxBytesToWrite == 'number', 'stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
      // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
      if (maxBytesToWrite === undefined) {
        maxBytesToWrite = 0x7FFFFFFF;
      }
      if (maxBytesToWrite < 2) return 0;
      maxBytesToWrite -= 2; // Null terminator.
      var startPtr = outPtr;
      var numCharsToWrite = (maxBytesToWrite < str.length*2) ? (maxBytesToWrite / 2) : str.length;
      for (var i = 0; i < numCharsToWrite; ++i) {
        // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
        var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
        HEAP16[((outPtr)>>1)] = codeUnit;
        outPtr += 2;
      }
      // Null-terminate the pointer to the HEAP.
      HEAP16[((outPtr)>>1)] = 0;
      return outPtr - startPtr;
    }
  
  function lengthBytesUTF16(str) {
      return str.length*2;
    }
  
  function UTF32ToString(ptr, maxBytesToRead) {
      assert(ptr % 4 == 0, 'Pointer passed to UTF32ToString must be aligned to four bytes!');
      var i = 0;
  
      var str = '';
      // If maxBytesToRead is not passed explicitly, it will be undefined, and this
      // will always evaluate to true. This saves on code size.
      while (!(i >= maxBytesToRead / 4)) {
        var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
        if (utf32 == 0) break;
        ++i;
        // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        if (utf32 >= 0x10000) {
          var ch = utf32 - 0x10000;
          str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
        } else {
          str += String.fromCharCode(utf32);
        }
      }
      return str;
    }
  
  function stringToUTF32(str, outPtr, maxBytesToWrite) {
      assert(outPtr % 4 == 0, 'Pointer passed to stringToUTF32 must be aligned to four bytes!');
      assert(typeof maxBytesToWrite == 'number', 'stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
      // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
      if (maxBytesToWrite === undefined) {
        maxBytesToWrite = 0x7FFFFFFF;
      }
      if (maxBytesToWrite < 4) return 0;
      var startPtr = outPtr;
      var endPtr = startPtr + maxBytesToWrite - 4;
      for (var i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
        if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
          var trailSurrogate = str.charCodeAt(++i);
          codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
        }
        HEAP32[((outPtr)>>2)] = codeUnit;
        outPtr += 4;
        if (outPtr + 4 > endPtr) break;
      }
      // Null-terminate the pointer to the HEAP.
      HEAP32[((outPtr)>>2)] = 0;
      return outPtr - startPtr;
    }
  
  function lengthBytesUTF32(str) {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        var codeUnit = str.charCodeAt(i);
        if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) ++i; // possibly a lead surrogate, so skip over the tail surrogate.
        len += 4;
      }
  
      return len;
    }
  function __embind_register_std_wstring(rawType, charSize, name) {
      name = readLatin1String(name);
      var decodeString, encodeString, getHeap, lengthBytesUTF, shift;
      if (charSize === 2) {
        decodeString = UTF16ToString;
        encodeString = stringToUTF16;
        lengthBytesUTF = lengthBytesUTF16;
        getHeap = () => HEAPU16;
        shift = 1;
      } else if (charSize === 4) {
        decodeString = UTF32ToString;
        encodeString = stringToUTF32;
        lengthBytesUTF = lengthBytesUTF32;
        getHeap = () => HEAPU32;
        shift = 2;
      }
      registerType(rawType, {
        name: name,
        'fromWireType': function(value) {
          // Code mostly taken from _embind_register_std_string fromWireType
          var length = HEAPU32[value >> 2];
          var HEAP = getHeap();
          var str;
  
          var decodeStartPtr = value + 4;
          // Looping here to support possible embedded '0' bytes
          for (var i = 0; i <= length; ++i) {
            var currentBytePtr = value + 4 + i * charSize;
            if (i == length || HEAP[currentBytePtr >> shift] == 0) {
              var maxReadBytes = currentBytePtr - decodeStartPtr;
              var stringSegment = decodeString(decodeStartPtr, maxReadBytes);
              if (str === undefined) {
                str = stringSegment;
              } else {
                str += String.fromCharCode(0);
                str += stringSegment;
              }
              decodeStartPtr = currentBytePtr + charSize;
            }
          }
  
          _free(value);
  
          return str;
        },
        'toWireType': function(destructors, value) {
          if (!(typeof value == 'string')) {
            throwBindingError(`Cannot pass non-string to C++ string type ${name}`);
          }
  
          // assumes 4-byte alignment
          var length = lengthBytesUTF(value);
          var ptr = _malloc(4 + length + charSize);
          HEAPU32[ptr >> 2] = length >> shift;
  
          encodeString(value, ptr + 4, length + charSize);
  
          if (destructors !== null) {
            destructors.push(_free, ptr);
          }
          return ptr;
        },
        'argPackAdvance': 8,
        'readValueFromPointer': simpleReadValueFromPointer,
        destructorFunction: function(ptr) { _free(ptr); },
      });
    }

  
  function __embind_register_void(rawType, name) {
      name = readLatin1String(name);
      registerType(rawType, {
          isVoid: true, // void return values can be optimized out sometimes
          name: name,
          'argPackAdvance': 0,
          'fromWireType': function() {
              return undefined;
          },
          'toWireType': function(destructors, o) {
              // TODO: assert if anything else is given?
              return undefined;
          },
      });
    }


  function __emval_incref(handle) {
      if (handle > 4) {
        emval_handles.get(handle).refcount += 1;
      }
    }

  
  
  
  function requireRegisteredType(rawType, humanName) {
      var impl = registeredTypes[rawType];
      if (undefined === impl) {
          throwBindingError(humanName + " has unknown type " + getTypeName(rawType));
      }
      return impl;
    }
  function __emval_take_value(type, arg) {
      type = requireRegisteredType(type, '_emval_take_value');
      var v = type['readValueFromPointer'](arg);
      return Emval.toHandle(v);
    }

  function _abort() {
      abort('native code called abort()');
    }

  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.copyWithin(dest, src, src + num);
    }

  function getHeapMax() {
      return HEAPU8.length;
    }
  
  function abortOnCannotGrowMemory(requestedSize) {
      abort(`Cannot enlarge memory arrays to size ${requestedSize} bytes (OOM). Either (1) compile with -sINITIAL_MEMORY=X with X higher than the current value ${HEAP8.length}, (2) compile with -sALLOW_MEMORY_GROWTH which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with -sABORTING_MALLOC=0`);
    }
  function _emscripten_resize_heap(requestedSize) {
      var oldSize = HEAPU8.length;
      requestedSize = requestedSize >>> 0;
      abortOnCannotGrowMemory(requestedSize);
    }

  var SYSCALLS = {varargs:undefined,get:function() {
        assert(SYSCALLS.varargs != undefined);
        SYSCALLS.varargs += 4;
        var ret = HEAP32[(((SYSCALLS.varargs)-(4))>>2)];
        return ret;
      },getStr:function(ptr) {
        var ret = UTF8ToString(ptr);
        return ret;
      }};
  function _fd_close(fd) {
      abort('fd_close called without SYSCALLS_REQUIRE_FILESYSTEM');
    }

  function convertI32PairToI53Checked(lo, hi) {
      assert(lo == (lo >>> 0) || lo == (lo|0)); // lo should either be a i32 or a u32
      assert(hi === (hi|0));                    // hi should be a i32
      return ((hi + 0x200000) >>> 0 < 0x400001 - !!lo) ? (lo >>> 0) + hi * 4294967296 : NaN;
    }
  
  
  
  
  function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
      return 70;
    }

  var printCharBuffers = [null,[],[]];
  
  function printChar(stream, curr) {
      var buffer = printCharBuffers[stream];
      assert(buffer);
      if (curr === 0 || curr === 10) {
        (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
        buffer.length = 0;
      } else {
        buffer.push(curr);
      }
    }
  
  function flush_NO_FILESYSTEM() {
      // flush anything remaining in the buffers during shutdown
      _fflush(0);
      if (printCharBuffers[1].length) printChar(1, 10);
      if (printCharBuffers[2].length) printChar(2, 10);
    }
  
  
  function _fd_write(fd, iov, iovcnt, pnum) {
      // hack to support printf in SYSCALLS_REQUIRE_FILESYSTEM=0
      var num = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[((iov)>>2)];
        var len = HEAPU32[(((iov)+(4))>>2)];
        iov += 8;
        for (var j = 0; j < len; j++) {
          printChar(fd, HEAPU8[ptr+j]);
        }
        num += len;
      }
      HEAPU32[((pnum)>>2)] = num;
      return 0;
    }
embind_init_charCodes();
BindingError = Module['BindingError'] = extendError(Error, 'BindingError');;
InternalError = Module['InternalError'] = extendError(Error, 'InternalError');;
init_ClassHandle();
init_embind();;
init_RegisteredPointer();
UnboundTypeError = Module['UnboundTypeError'] = extendError(Error, 'UnboundTypeError');;
init_emval();;
// include: base64Utils.js
// Copied from https://github.com/strophe/strophejs/blob/e06d027/src/polyfills.js#L149

// This code was written by Tyler Akins and has been placed in the
// public domain.  It would be nice if you left this header intact.
// Base64 code from Tyler Akins -- http://rumkin.com

/**
 * Decodes a base64 string.
 * @param {string} input The string to decode.
 */
var decodeBase64 = typeof atob == 'function' ? atob : function (input) {
  var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  var output = '';
  var chr1, chr2, chr3;
  var enc1, enc2, enc3, enc4;
  var i = 0;
  // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
  do {
    enc1 = keyStr.indexOf(input.charAt(i++));
    enc2 = keyStr.indexOf(input.charAt(i++));
    enc3 = keyStr.indexOf(input.charAt(i++));
    enc4 = keyStr.indexOf(input.charAt(i++));

    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;

    output = output + String.fromCharCode(chr1);

    if (enc3 !== 64) {
      output = output + String.fromCharCode(chr2);
    }
    if (enc4 !== 64) {
      output = output + String.fromCharCode(chr3);
    }
  } while (i < input.length);
  return output;
};

// Converts a string of base64 into a byte array.
// Throws error on invalid input.
function intArrayFromBase64(s) {

  try {
    var decoded = decodeBase64(s);
    var bytes = new Uint8Array(decoded.length);
    for (var i = 0 ; i < decoded.length ; ++i) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return bytes;
  } catch (_) {
    throw new Error('Converting base64 string to bytes failed.');
  }
}

// If filename is a base64 data URI, parses and returns data (Buffer on node,
// Uint8Array otherwise). If filename is not a base64 data URI, returns undefined.
function tryParseAsDataURI(filename) {
  if (!isDataURI(filename)) {
    return;
  }

  return intArrayFromBase64(filename.slice(dataURIPrefix.length));
}


// end include: base64Utils.js
function checkIncomingModuleAPI() {
  ignoredModuleProp('fetchSettings');
}
var wasmImports = {
  "__assert_fail": ___assert_fail,
  "__cxa_throw": ___cxa_throw,
  "_embind_register_bigint": __embind_register_bigint,
  "_embind_register_bool": __embind_register_bool,
  "_embind_register_class": __embind_register_class,
  "_embind_register_class_constructor": __embind_register_class_constructor,
  "_embind_register_class_function": __embind_register_class_function,
  "_embind_register_emval": __embind_register_emval,
  "_embind_register_float": __embind_register_float,
  "_embind_register_integer": __embind_register_integer,
  "_embind_register_memory_view": __embind_register_memory_view,
  "_embind_register_std_string": __embind_register_std_string,
  "_embind_register_std_wstring": __embind_register_std_wstring,
  "_embind_register_void": __embind_register_void,
  "_emval_decref": __emval_decref,
  "_emval_incref": __emval_incref,
  "_emval_take_value": __emval_take_value,
  "abort": _abort,
  "emscripten_memcpy_big": _emscripten_memcpy_big,
  "emscripten_resize_heap": _emscripten_resize_heap,
  "fd_close": _fd_close,
  "fd_seek": _fd_seek,
  "fd_write": _fd_write
};
var asm = createWasm();
/** @type {function(...*):?} */
var ___wasm_call_ctors = createExportWrapper("__wasm_call_ctors");
/** @type {function(...*):?} */
var _malloc = Module["_malloc"] = createExportWrapper("malloc");
/** @type {function(...*):?} */
var ___getTypeName = createExportWrapper("__getTypeName");
/** @type {function(...*):?} */
var __embind_initialize_bindings = Module["__embind_initialize_bindings"] = createExportWrapper("_embind_initialize_bindings");
/** @type {function(...*):?} */
var ___errno_location = createExportWrapper("__errno_location");
/** @type {function(...*):?} */
var _fflush = Module["_fflush"] = createExportWrapper("fflush");
/** @type {function(...*):?} */
var _free = Module["_free"] = createExportWrapper("free");
/** @type {function(...*):?} */
var _emscripten_stack_init = function() {
  return (_emscripten_stack_init = Module["asm"]["emscripten_stack_init"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _emscripten_stack_get_free = function() {
  return (_emscripten_stack_get_free = Module["asm"]["emscripten_stack_get_free"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _emscripten_stack_get_base = function() {
  return (_emscripten_stack_get_base = Module["asm"]["emscripten_stack_get_base"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _emscripten_stack_get_end = function() {
  return (_emscripten_stack_get_end = Module["asm"]["emscripten_stack_get_end"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var stackSave = createExportWrapper("stackSave");
/** @type {function(...*):?} */
var stackRestore = createExportWrapper("stackRestore");
/** @type {function(...*):?} */
var stackAlloc = createExportWrapper("stackAlloc");
/** @type {function(...*):?} */
var _emscripten_stack_get_current = function() {
  return (_emscripten_stack_get_current = Module["asm"]["emscripten_stack_get_current"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var ___cxa_is_pointer_type = createExportWrapper("__cxa_is_pointer_type");
/** @type {function(...*):?} */
var dynCall_jiji = Module["dynCall_jiji"] = createExportWrapper("dynCall_jiji");


// include: postamble.js
// === Auto-generated postamble setup entry stuff ===

var missingLibrarySymbols = [
  'zeroMemory',
  'exitJS',
  'emscripten_realloc_buffer',
  'isLeapYear',
  'ydayFromDate',
  'arraySum',
  'addDays',
  'setErrNo',
  'inetPton4',
  'inetNtop4',
  'inetPton6',
  'inetNtop6',
  'readSockaddr',
  'writeSockaddr',
  'getHostByName',
  'initRandomFill',
  'randomFill',
  'traverseStack',
  'getCallstack',
  'emscriptenLog',
  'convertPCtoSourceLocation',
  'readEmAsmArgs',
  'jstoi_q',
  'jstoi_s',
  'getExecutableName',
  'listenOnce',
  'autoResumeAudioContext',
  'handleException',
  'runtimeKeepalivePush',
  'runtimeKeepalivePop',
  'callUserCallback',
  'maybeExit',
  'safeSetTimeout',
  'asmjsMangle',
  'asyncLoad',
  'alignMemory',
  'mmapAlloc',
  'getNativeTypeSize',
  'STACK_SIZE',
  'STACK_ALIGN',
  'POINTER_SIZE',
  'ASSERTIONS',
  'writeI53ToI64',
  'writeI53ToI64Clamped',
  'writeI53ToI64Signaling',
  'writeI53ToU64Clamped',
  'writeI53ToU64Signaling',
  'readI53FromI64',
  'readI53FromU64',
  'convertI32PairToI53',
  'convertU32PairToI53',
  'getCFunc',
  'ccall',
  'cwrap',
  'uleb128Encode',
  'sigToWasmTypes',
  'generateFuncType',
  'convertJsFunctionToWasm',
  'getEmptyTableSlot',
  'updateTableMap',
  'getFunctionAddress',
  'addFunction',
  'removeFunction',
  'reallyNegative',
  'unSign',
  'strLen',
  'reSign',
  'formatString',
  'intArrayFromString',
  'AsciiToString',
  'stringToAscii',
  'stringToNewUTF8',
  'stringToUTF8OnStack',
  'writeArrayToMemory',
  'getSocketFromFD',
  'getSocketAddress',
  'registerKeyEventCallback',
  'maybeCStringToJsString',
  'findEventTarget',
  'findCanvasEventTarget',
  'getBoundingClientRect',
  'fillMouseEventData',
  'registerMouseEventCallback',
  'registerWheelEventCallback',
  'registerUiEventCallback',
  'registerFocusEventCallback',
  'fillDeviceOrientationEventData',
  'registerDeviceOrientationEventCallback',
  'fillDeviceMotionEventData',
  'registerDeviceMotionEventCallback',
  'screenOrientation',
  'fillOrientationChangeEventData',
  'registerOrientationChangeEventCallback',
  'fillFullscreenChangeEventData',
  'registerFullscreenChangeEventCallback',
  'JSEvents_requestFullscreen',
  'JSEvents_resizeCanvasForFullscreen',
  'registerRestoreOldStyle',
  'hideEverythingExceptGivenElement',
  'restoreHiddenElements',
  'setLetterbox',
  'softFullscreenResizeWebGLRenderTarget',
  'doRequestFullscreen',
  'fillPointerlockChangeEventData',
  'registerPointerlockChangeEventCallback',
  'registerPointerlockErrorEventCallback',
  'requestPointerLock',
  'fillVisibilityChangeEventData',
  'registerVisibilityChangeEventCallback',
  'registerTouchEventCallback',
  'fillGamepadEventData',
  'registerGamepadEventCallback',
  'registerBeforeUnloadEventCallback',
  'fillBatteryEventData',
  'battery',
  'registerBatteryEventCallback',
  'setCanvasElementSize',
  'getCanvasElementSize',
  'demangle',
  'demangleAll',
  'jsStackTrace',
  'stackTrace',
  'getEnvStrings',
  'checkWasiClock',
  'wasiRightsToMuslOFlags',
  'wasiOFlagsToMuslOFlags',
  'createDyncallWrapper',
  'setImmediateWrapped',
  'clearImmediateWrapped',
  'polyfillSetImmediate',
  'getPromise',
  'makePromise',
  'idsToPromises',
  'makePromiseCallback',
  'setMainLoop',
  'FS_createPreloadedFile',
  'FS_modeStringToFlags',
  'FS_getMode',
  '_setNetworkCallback',
  'heapObjectForWebGLType',
  'heapAccessShiftForWebGLHeap',
  'webgl_enable_ANGLE_instanced_arrays',
  'webgl_enable_OES_vertex_array_object',
  'webgl_enable_WEBGL_draw_buffers',
  'webgl_enable_WEBGL_multi_draw',
  'emscriptenWebGLGet',
  'computeUnpackAlignedImageSize',
  'colorChannelsInGlTextureFormat',
  'emscriptenWebGLGetTexPixelData',
  '__glGenObject',
  'emscriptenWebGLGetUniform',
  'webglGetUniformLocation',
  'webglPrepareUniformLocationsBeforeFirstUse',
  'webglGetLeftBracePos',
  'emscriptenWebGLGetVertexAttrib',
  '__glGetActiveAttribOrUniform',
  'writeGLArray',
  'registerWebGlEventCallback',
  'runAndAbortIfError',
  'SDL_unicode',
  'SDL_ttfContext',
  'SDL_audio',
  'GLFW_Window',
  'ALLOC_NORMAL',
  'ALLOC_STACK',
  'allocate',
  'writeStringToMemory',
  'writeAsciiToMemory',
  'registerInheritedInstance',
  'unregisterInheritedInstance',
  'enumReadValueFromPointer',
  'validateThis',
  'getStringOrSymbol',
  'craftEmvalAllocator',
  'emval_get_global',
  'emval_lookupTypes',
  'emval_allocateDestructors',
  'emval_addMethodCaller',
];
missingLibrarySymbols.forEach(missingLibrarySymbol)

var unexportedSymbols = [
  'run',
  'addOnPreRun',
  'addOnInit',
  'addOnPreMain',
  'addOnExit',
  'addOnPostRun',
  'addRunDependency',
  'removeRunDependency',
  'FS_createFolder',
  'FS_createPath',
  'FS_createDataFile',
  'FS_createLazyFile',
  'FS_createLink',
  'FS_createDevice',
  'FS_unlink',
  'out',
  'err',
  'callMain',
  'abort',
  'keepRuntimeAlive',
  'wasmMemory',
  'stackAlloc',
  'stackSave',
  'stackRestore',
  'getTempRet0',
  'setTempRet0',
  'writeStackCookie',
  'checkStackCookie',
  'intArrayFromBase64',
  'tryParseAsDataURI',
  'ptrToString',
  'getHeapMax',
  'abortOnCannotGrowMemory',
  'ENV',
  'MONTH_DAYS_REGULAR',
  'MONTH_DAYS_LEAP',
  'MONTH_DAYS_REGULAR_CUMULATIVE',
  'MONTH_DAYS_LEAP_CUMULATIVE',
  'ERRNO_CODES',
  'ERRNO_MESSAGES',
  'DNS',
  'Protocols',
  'Sockets',
  'timers',
  'warnOnce',
  'UNWIND_CACHE',
  'readEmAsmArgsArray',
  'dynCallLegacy',
  'getDynCaller',
  'dynCall',
  'HandleAllocator',
  'convertI32PairToI53Checked',
  'freeTableIndexes',
  'functionsInTableMap',
  'setValue',
  'getValue',
  'PATH',
  'PATH_FS',
  'UTF8Decoder',
  'UTF8ArrayToString',
  'UTF8ToString',
  'stringToUTF8Array',
  'stringToUTF8',
  'lengthBytesUTF8',
  'intArrayToString',
  'UTF16Decoder',
  'UTF16ToString',
  'stringToUTF16',
  'lengthBytesUTF16',
  'UTF32ToString',
  'stringToUTF32',
  'lengthBytesUTF32',
  'SYSCALLS',
  'JSEvents',
  'specialHTMLTargets',
  'currentFullscreenStrategy',
  'restoreOldWindowedStyle',
  'ExitStatus',
  'flush_NO_FILESYSTEM',
  'dlopenMissingError',
  'promiseMap',
  'uncaughtExceptionCount',
  'exceptionLast',
  'exceptionCaught',
  'ExceptionInfo',
  'Browser',
  'wget',
  'preloadPlugins',
  'FS',
  'MEMFS',
  'TTY',
  'PIPEFS',
  'SOCKFS',
  'tempFixedLengthArray',
  'miniTempWebGLFloatBuffers',
  'miniTempWebGLIntBuffers',
  'GL',
  'emscripten_webgl_power_preferences',
  'AL',
  'GLUT',
  'EGL',
  'GLEW',
  'IDBStore',
  'SDL',
  'SDL_gfx',
  'GLFW',
  'allocateUTF8',
  'allocateUTF8OnStack',
  'InternalError',
  'BindingError',
  'UnboundTypeError',
  'PureVirtualError',
  'init_embind',
  'throwInternalError',
  'throwBindingError',
  'throwUnboundTypeError',
  'ensureOverloadTable',
  'exposePublicSymbol',
  'replacePublicSymbol',
  'extendError',
  'createNamedFunction',
  'embindRepr',
  'registeredInstances',
  'getBasestPointer',
  'getInheritedInstance',
  'getInheritedInstanceCount',
  'getLiveInheritedInstances',
  'registeredTypes',
  'awaitingDependencies',
  'typeDependencies',
  'registeredPointers',
  'registerType',
  'whenDependentTypesAreResolved',
  'embind_charCodes',
  'embind_init_charCodes',
  'readLatin1String',
  'getTypeName',
  'heap32VectorToArray',
  'requireRegisteredType',
  'getShiftFromSize',
  'integerReadValueFromPointer',
  'floatReadValueFromPointer',
  'simpleReadValueFromPointer',
  'runDestructors',
  'newFunc',
  'craftInvokerFunction',
  'embind__requireFunction',
  'tupleRegistrations',
  'structRegistrations',
  'genericPointerToWireType',
  'constNoSmartPtrRawPointerToWireType',
  'nonConstNoSmartPtrRawPointerToWireType',
  'init_RegisteredPointer',
  'RegisteredPointer',
  'RegisteredPointer_getPointee',
  'RegisteredPointer_destructor',
  'RegisteredPointer_deleteObject',
  'RegisteredPointer_fromWireType',
  'runDestructor',
  'releaseClassHandle',
  'finalizationRegistry',
  'detachFinalizer_deps',
  'detachFinalizer',
  'attachFinalizer',
  'makeClassHandle',
  'init_ClassHandle',
  'ClassHandle',
  'ClassHandle_isAliasOf',
  'throwInstanceAlreadyDeleted',
  'ClassHandle_clone',
  'ClassHandle_delete',
  'deletionQueue',
  'ClassHandle_isDeleted',
  'ClassHandle_deleteLater',
  'flushPendingDeletes',
  'delayFunction',
  'setDelayFunction',
  'RegisteredClass',
  'shallowCopyInternalPointer',
  'downcastPointer',
  'upcastPointer',
  'char_0',
  'char_9',
  'makeLegalFunctionName',
  'emval_handles',
  'emval_symbols',
  'init_emval',
  'count_emval_handles',
  'Emval',
  'emval_newers',
  'emval_methodCallers',
  'emval_registeredMethods',
];
unexportedSymbols.forEach(unexportedRuntimeSymbol);



var calledRun;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!calledRun) run();
  if (!calledRun) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
};

function stackCheckInit() {
  // This is normally called automatically during __wasm_call_ctors but need to
  // get these values before even running any of the ctors so we call it redundantly
  // here.
  _emscripten_stack_init();
  // TODO(sbc): Move writeStackCookie to native to to avoid this.
  writeStackCookie();
}

function run() {

  if (runDependencies > 0) {
    return;
  }

    stackCheckInit();

  preRun();

  // a preRun added a dependency, run will be called later
  if (runDependencies > 0) {
    return;
  }

  function doRun() {
    // run may have just been called through dependencies being fulfilled just in this very frame,
    // or while the async setStatus time below was happening
    if (calledRun) return;
    calledRun = true;
    Module['calledRun'] = true;

    if (ABORT) return;

    initRuntime();

    readyPromiseResolve(Module);
    if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();

    assert(!Module['_main'], 'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]');

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
  } else
  {
    doRun();
  }
  checkStackCookie();
}

function checkUnflushedContent() {
  // Compiler settings do not allow exiting the runtime, so flushing
  // the streams is not possible. but in ASSERTIONS mode we check
  // if there was something to flush, and if so tell the user they
  // should request that the runtime be exitable.
  // Normally we would not even include flush() at all, but in ASSERTIONS
  // builds we do so just for this check, and here we see if there is any
  // content to flush, that is, we check if there would have been
  // something a non-ASSERTIONS build would have not seen.
  // How we flush the streams depends on whether we are in SYSCALLS_REQUIRE_FILESYSTEM=0
  // mode (which has its own special function for this; otherwise, all
  // the code is inside libc)
  var oldOut = out;
  var oldErr = err;
  var has = false;
  out = err = (x) => {
    has = true;
  }
  try { // it doesn't matter if it fails
    flush_NO_FILESYSTEM();
  } catch(e) {}
  out = oldOut;
  err = oldErr;
  if (has) {
    warnOnce('stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the FAQ), or make sure to emit a newline when you printf etc.');
    warnOnce('(this may also be due to not including full filesystem support - try building with -sFORCE_FILESYSTEM)');
  }
}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

run();


// end include: postamble.js


  return ibpci.ready
}

);
})();
if (typeof exports === 'object' && typeof module === 'object')
  module.exports = ibpci;
else if (typeof define === 'function' && define['amd'])
  define([], function() { return ibpci; });
else if (typeof exports === 'object')
  exports["ibpci"] = ibpci;
