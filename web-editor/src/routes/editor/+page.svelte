<script>
    import { loadWasmModule } from "../../services/wasm/sanity_check";
	let sourceCode = 'output("Hello")';

    const testWasm = () => {
        loadWasmModule().then((exports) => {
            const result = exports.addNumbers(1,2);
            console.log(result);
});

    }
</script>

<div class="editor-stack">
    <div style="editor">
        <input bind:value={sourceCode}>
    </div>
    <div style="output">
        <pre>{sourceCode}</pre>
    </div>
    <div style="wasm">
        <button on:click={testWasm}>Load Wasm Module</button>
    </div>
</div>
