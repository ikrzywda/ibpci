
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
  wasmBinaryFile = 'data:application/octet-stream;base64,AGFzbQEAAAABooGAgAAVYAF/AX9gAn9/AX9gAAF/YAJ/fwBgAX8AYAN/f38Bf2ADf39/AGAAAGAEf39/fwBgBX9/f39/AGAGf39/f39/AGAEf39/fwF/YAN/fn8BfmAFf39/f38Bf2AHf39/f39/fwBgDX9/f39/f39/f39/f38AYAl/f39/f39/f38AYAh/f39/f39/fwBgBH9/fn8BfmAFf39/fn4AYAR/fn9/AX8ClIWAgAAXA2VudhZfZW1iaW5kX3JlZ2lzdGVyX2NsYXNzAA8DZW52C19fY3hhX3Rocm93AAYDZW52Il9lbWJpbmRfcmVnaXN0ZXJfY2xhc3NfY29uc3RydWN0b3IACgNlbnYfX2VtYmluZF9yZWdpc3Rlcl9jbGFzc19mdW5jdGlvbgAQA2Vudg1fZW12YWxfaW5jcmVmAAQDZW52DV9lbXZhbF9kZWNyZWYABANlbnYRX2VtdmFsX3Rha2VfdmFsdWUAAQNlbnYNX19hc3NlcnRfZmFpbAAIA2VudhVfZW1iaW5kX3JlZ2lzdGVyX3ZvaWQAAwNlbnYVX2VtYmluZF9yZWdpc3Rlcl9ib29sAAkDZW52GF9lbWJpbmRfcmVnaXN0ZXJfaW50ZWdlcgAJA2VudhZfZW1iaW5kX3JlZ2lzdGVyX2Zsb2F0AAYDZW52G19lbWJpbmRfcmVnaXN0ZXJfc3RkX3N0cmluZwADA2VudhxfZW1iaW5kX3JlZ2lzdGVyX3N0ZF93c3RyaW5nAAYDZW52Fl9lbWJpbmRfcmVnaXN0ZXJfZW12YWwAAwNlbnYcX2VtYmluZF9yZWdpc3Rlcl9tZW1vcnlfdmlldwAGA2VudhVlbXNjcmlwdGVuX21lbWNweV9iaWcABgNlbnYWZW1zY3JpcHRlbl9yZXNpemVfaGVhcAAAA2VudgVhYm9ydAAHFndhc2lfc25hcHNob3RfcHJldmlldzEIZmRfY2xvc2UAABZ3YXNpX3NuYXBzaG90X3ByZXZpZXcxCGZkX3dyaXRlAAsDZW52F19lbWJpbmRfcmVnaXN0ZXJfYmlnaW50AA4Wd2FzaV9zbmFwc2hvdF9wcmV2aWV3MQdmZF9zZWVrAA0D54SAgADlBAcHAAcBBwAHBAMGAAcAAgIEAgICAgICAgIEAwMDBgMFAwADAwYDAQEEAQEABQAABgAB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NgJEQQYhIiACICI2AkAgAikCQCFLIAIgSzcDsAEgAigCsAEhIyACKAK0ASEkIAIgHzYCzAFBkIEEISUgAiAlNgLIASACICQ2AsQBIAIgIzYCwAEgAigCzAEhJiACKALIASEnIAIoAsABISggAigCxAEhKSACICk2ArwBIAIgKDYCuAEgAikCuAEhTCACIEw3AxhBGCEqIAIgKmohKyAnICsQjAIgAiAhNgI8QQchLCACICw2AjggAikCOCFNIAIgTTcDkAEgAigCkAEhLSACKAKUASEuIAIgJjYCrAFBn4EEIS8gAiAvNgKoASACIC42AqQBIAIgLTYCoAEgAigCrAEhMCACKAKoASExIAIoAqABITIgAigCpAEhMyACIDM2ApwBIAIgMjYCmAEgAikCmAEhTiACIE43AxBBECE0IAIgNGohNSAxIDUQjAIgAiAhNgI0QQghNiACIDY2AjAgAikCMCFPIAIgTzcDcCACKAJwITcgAigCdCE4IAIgMDYCjAFB4oAEITkgAiA5NgKIASACIDg2AoQBIAIgNzYCgAEgAigCjAEhOiACKAKIASE7IAIoAoABITwgAigChAEhPSACID02AnwgAiA8NgJ4IAIpAnghUCACIFA3AwhBCCE+IAIgPmohPyA7ID8QjAIgAiAhNgIsQQkhQCACIEA2AiggAikCKCFRIAIgUTcD0AEgAigC0AEhQSACKALUASFCIAIgOjYC7AFBv4AEIUMgAiBDNgLoASACIEI2AuQBIAIgQTYC4AEgAigC6AEhRCACKALgASFFIAIoAuQBIUYgAiBGNgLcASACIEU2AtgBIAIpAtgBIVIgAiBSNwMgQSAhRyACIEdqIUggRCBIEI0CQYACIUkgAiBJaiFKIEokAA8LkAgCT38GfiMAIQFBgAIhAiABIAJrIQMgAyQAIAMgADYCUEEAIQQgAyAENgJMQQohBSADIAU2AkggAyAENgJEQQshBiADIAY2AkAgAyAENgI8QQwhByADIAc2AjggAygCUCEIQTchCSADIAlqIQogAyAKNgJoIAMgCDYCZBAjQQ0hCyADIAs2AmAQJSEMIAMgDDYCXBAmIQ0gAyANNgJYQQ4hDiADIA42AlQQKCEPECkhEBAqIREQKyESIAMoAmAhEyADIBM2AugBECwhFCADKAJgIRUgAygCXCEWIAMgFjYC8AEQ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CwQAIAALgAEBAn8jAEEQayIDJAACQAJAIAAQhAQiBCACTQ0AIAAQlQMhBCAAIAIQkQQgBBCABCABIAIQjQQaIANBADoADyAEIAJqIANBD2oQhgQgACACEIUEDAELIAAgBEF/aiACIARrQQFqIAAQWCIEQQAgBCACIAEQgQQLIANBEGokACAAC3YBAn8jAEEQayIDJAACQAJAIAJBCksNACAAEJYDIQQgACACEJQEIAQQgAQgASACEI0EGiADQQA6AA8gBCACaiADQQ9qEIYEIAAgAhCFBAwBCyAAQQogAkF2aiAAEPYBIgRBACAEIAIgARCBBAsgA0EQaiQAIAALwAEBA38jAEEQayICJAAgAiABOgAPAkACQCAAEFMiAw0AQQohBCAAEPYBIQEMAQsgABCEBEF/aiEEIAAQWCEBCwJAAkACQCABIARHDQAgACAEQQEgBCAEQQBBABCeBCAAEIUDGgwBCyAAEIUDGiADDQAgABCWAyEEIAAgAUEBahCUBAwBCyAAEJUDIQQgACABQQFqEJEECyAEIAFqIgAgAkEPahCGBCACQQA6AA4gAEEBaiACQQ5qEIYEIAJBEGokAAubAQEBfyMAQRBrIgUkACAFIAQ2AgggBSACNgIMAkAgABD0ASICIAFJDQAgBEF/Rg0AIAUgAiABazYCACAFIAVBDGogBRB2KAIANgIEAkAgABDzASABaiADIAVBBGogBUEIahB2KAIAEKgEIgENAEF/IQEgBSgCBCIAIAUoAggiBEkNACAAIARLIQELIAVBEGokACABDwsgABCCBAALFQACQCACDQBBAA8LIAAgASACEPIDCwQAQX8LBAAgAAsrAQF/IwBBEGsiAyQAIANBCGogACABIAIQrAQgAygCDCECIANBEGokACACC2QBAX8jAEEgayIEJAAgBEEYaiABIAIQrQQgBEEQaiAEKAIYIAQoAhwgAxCuBBCvBCAEIAEgBCgCEBCwBDYCDCAEIAMgBCgCFBCxBDYCCCAAIARBDGogBEEIahCyBCAEQSBqJAALCwAgACABIAIQswQLBwAgABC0BAtSAQJ/IwBBEGsiBCQAIAIgAWshBQJAIAIgAUYNACADIAEgBRD5AxoLIAQgASAFajYCDCAEIAMgBWo2AgggACAEQQxqIARBCGoQsgQgBEEQaiQACwkAIAAgARC2BAsJACAA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dABmbG9hdAB1aW50NjRfdABUZXh0QnVmZmVycwBnZXRTdWdnZXN0aW9ucwB2ZWN0b3IAU3RyaW5nVmVjdG9yAHVwZGF0ZVRleHRCdWZmZXIAdW5zaWduZWQgY2hhcgBzdGQ6OmV4Y2VwdGlvbgBpbnNlcnROZXdUb2tlbgBkZWxldGVUb2tlbgBib29sAGVtc2NyaXB0ZW46OnZhbABwdXNoX2JhY2sAYmFkX2FycmF5X25ld19sZW5ndGgAL1VzZXJzL2lnb3Jrcnp5d2RhL2Vtc2RrL3Vwc3RyZWFtL2Vtc2NyaXB0ZW4vY2FjaGUvc3lzcm9vdC9pbmNsdWRlL2Vtc2NyaXB0ZW4vdmFsLmgAdW5zaWduZWQgbG9uZwBzdGQ6OndzdHJpbmcAYmFzaWNfc3RyaW5nAHN0ZDo6c3RyaW5nAHN0ZDo6dTE2c3RyaW5nAHN0ZDo6dTMyc3RyaW5nAHJlc2l6ZQB3cml0ZUdlbmVyaWNXaXJlVHlwZQBkb3VibGUAdm9pZABzdGQ6OmJhZF9hbGxvYwBzaG9ydF9wdHIgPD0gVUlOVDMyX01BWABlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxzaG9ydD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgc2hvcnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgaW50PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxmbG9hdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDhfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50OF90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1aW50MTZfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50MTZfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDY0X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludDY0X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVpbnQzMl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQzMl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxjaGFyPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1bnNpZ25lZCBjaGFyPgBzdGQ6OmJhc2ljX3N0cmluZzx1bnNpZ25lZCBjaGFyPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxzaWduZWQgY2hhcj4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8bG9uZz4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgbG9uZz4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8ZG91YmxlPgBOU3QzX18yNnZlY3RvcklOU18xMmJhc2ljX3N0cmluZ0ljTlNfMTFjaGFyX3RyYWl0c0ljRUVOU185YWxsb2NhdG9ySWNFRUVFTlM0X0lTNl9FRUVFAAAAAHAMAQB3BAEAUE5TdDNfXzI2dmVjdG9ySU5TXzEyYmFzaWNfc3RyaW5nSWNOU18xMWNoYXJfdHJhaXRzSWNFRU5TXzlhbGxvY2F0b3JJY0VFRUVOUzRfSVM2X0VFRUUAAPQMAQDYBAEAAAAAANAEAQBQS05TdDNfXzI2dmVjdG9ySU5TXzEyYmFzaWNfc3RyaW5nSWNOU18xMWNoYXJfdHJhaXRzSWNFRU5TXzlhbGxvY2F0b3JJY0VFRUVOUzRfSVM2X0VFRUUA9AwBAEAFAQABAAAA0AQBAGlpAHYAdmkAMAUBAKwLAQAwBQEAAAYBAE5TdDNfXzIxMmJhc2ljX3N0cmluZ0ljTlNfMTFjaGFyX3RyYWl0c0ljRUVOU185YWxsb2NhdG9ySWNFRUVFAABwDAEAwAUBAHZpaWkAAAAArAsBADAFAQAwDAEAAAYBAHZpaWlpAAAAMAwBAJgFAQBpaWkAVAYBANAEAQAwDAEATjEwZW1zY3JpcHRlbjN2YWxFAABwDAEAQAYBAGlpaWkAAAAAAAAAAAAAAAAAAAAAxAsBANAEAQAwDAEAAAYBAGlpaWlpADExVGV4dEJ1ZmZlcnMAcAwBAIYGAQBQMTFUZXh0QnVmZmVycwAA9AwBAJwGAQAAAAAAlAYBAFBLMTFUZXh0QnVmZmVycwD0DAEAvAYBAAEAAACUBgEArAYBAMQLAQCsBgEAAAYBANAEAQCsBgEAAAYBAABOU3QzX18yMTJiYXNpY19zdHJpbmdJaE5TXzExY2hhcl90cmFpdHNJaEVFTlNfOWFsbG9jYXRvckloRUVFRQBwDAEA+QYBAE5TdDNfXzIxMmJhc2ljX3N0cmluZ0l3TlNfMTFjaGFyX3RyYWl0c0l3RUVOU185YWxsb2NhdG9ySXdFRUVFAABwDAEAQAcBAE5TdDNfXzIxMmJhc2ljX3N0cmluZ0lEc05TXzExY2hhcl90cmFpdHNJRHNFRU5TXzlhbGxvY2F0b3JJRHNFRUVFAAAAcAwBAIgHAQBOU3QzX18yMTJiYXNpY19zdHJpbmdJRGlOU18xMWNoYXJfdHJhaXRzSURpRUVOU185YWxsb2NhdG9ySURpRUVFRQAAAHAMAQDUBwEATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJY0VFAABwDAEAIAgBAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWFFRQAAcAwBAEgIAQBOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0loRUUAAHAMAQBwCAEATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJc0VFAABwDAEAmAgBAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SXRFRQAAcAwBAMAIAQBOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lpRUUAAHAMAQDoCAEATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJakVFAABwDAEAEAkBAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWxFRQAAcAwBADgJAQBOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0ltRUUAAHAMAQBgCQEATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJeEVFAABwDAEAiAkBAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SXlFRQAAcAwBALAJAQBOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lmRUUAAHAMAQDYCQEATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJZEVFAABwDAEAAAoBAE4xMF9fY3h4YWJpdjExNl9fc2hpbV90eXBlX2luZm9FAAAAAJgMAQAoCgEAFA4BAE4xMF9fY3h4YWJpdjExN19fY2xhc3NfdHlwZV9pbmZvRQAAAJgMAQBYCgEATAoBAE4xMF9fY3h4YWJpdjExN19fcGJhc2VfdHlwZV9pbmZvRQAAAJgMAQCICgEATAoBAE4xMF9fY3h4YWJpdjExOV9fcG9pbnRlcl90eXBlX2luZm9FAJgMAQC4CgEArAoBAE4xMF9fY3h4YWJpdjEyMF9fZnVuY3Rpb25fdHlwZV9pbmZvRQAAAACYDAEA6AoBAEwKAQBOMTBfX2N4eGFiaXYxMjlfX3BvaW50ZXJfdG9fbWVtYmVyX3R5cGVfaW5mb0UAAACYDAEAHAsBAKwKAQAAAAAAnAsBACEAAAAiAAAAIwAAACQAAAAlAAAATjEwX19jeHhhYml2MTIzX19mdW5kYW1lbnRhbF90eXBlX2luZm9FAJgMAQB0CwEATAoBAHYAAABgCwEAqAsBAERuAABgCwEAtAsBAGIAAABgCwEAwAsBAGMAAABgCwEAzAsBAGgAAABgCwEA2AsBAGEAAABgCwEA5AsBAHMAAABgCwEA8AsBAHQAAABgCwEA/AsBAGkAAABgCwEACAwBAGoAAABgCwEAFAwBAGwAAABgCwEAIAwBAG0AAABgCwEALAwBAHgAAABgCwEAOAwBAHkAAABgCwEARAwBAGYAAABgCwEAUAwBAGQAAABgCwEAXAwBAAAAAAB8CgEAIQAAACYAAAAjAAAAJAAAACcAAAAoAAAAKQAAACoAAAAAAAAA4AwBACEAAAArAAAAIwAAACQAAAAnAAAALAAAAC0AAAAuAAAATjEwX19jeHhhYml2MTIwX19zaV9jbGFzc190eXBlX2luZm9FAAAAAJgMAQC4DAEAfAoBAAAAAADcCgEAIQAAAC8AAAAjAAAAJAAAADAAAAAAAAAAbA0BABkAAAAxAAAAMgAAAAAAAACUDQEAGQAAADMAAAA0AAAAAAAAAFQNAQAZAAAANQAAADYAAABTdDlleGNlcHRpb24AAAAAcAwBAEQNAQBTdDliYWRfYWxsb2MAAAAAmAwBAFwNAQBUDQEAU3QyMGJhZF9hcnJheV9uZXdfbGVuZ3RoAAAAAJgMAQB4DQEAbA0BAAAAAADEDQEAGAAAADcAAAA4AAAAU3QxMWxvZ2ljX2Vycm9yAJgMAQC0DQEAVA0BAAAAAAD4DQEAGAAAADkAAAA4AAAAU3QxMmxlbmd0aF9lcnJvcgAAAACYDAEA5A0BAMQNAQBTdDl0eXBlX2luZm8AAAAAcAwBAAQOAQAAQaCcBAucAfAQAQAAAAAABQAAAAAAAAAAAAAAHgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHwAAACAAAADgEAEAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAP//////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKA4BAA==';
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
