<script>
	let sourceCode = 'output("Hello")';
</script>

<div class="editor-stack">
    <div style="editor">
        <input bind:value={sourceCode}>
    </div>
    <div style="output">
        <pre>{sourceCode}</pre>
    </div>
</div>
