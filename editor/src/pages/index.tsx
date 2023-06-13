import { useState, useEffect } from "react";
import Editor from "react-simple-code-editor";

export default function Home() {
  const [code, setCode] = useState("");
  const [wasm, setWasm] = useState<any>(null);
  const [textBuffers, setTextBuffers] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const runWebAssembly = async () => {
      const { default: ibpci } = await import("@app/wrapper.js");
      const ibpciInstance = await ibpci();
      console.log(ibpci);

      const textBuffersInstance = new ibpciInstance.TextBuffers();
      setTextBuffers(textBuffersInstance);
      setWasm(ibpciInstance);
    };

    runWebAssembly();
  }, []);

  const handleCodeChange = (code: string) => {
    setCode(code);

    if (textBuffers && wasm) {
      const strArray = textBuffers.getSuggestions(code);
      const suggestionsArray: string[] = [];
      for (let i = 0; i < strArray.size(); i++) {
        suggestionsArray.push(strArray.get(i));
      }
      setSuggestions(suggestionsArray);
    }
  };

  return (
    <div>
      <Editor
        value={code}
        onValueChange={(code) => handleCodeChange(code)}
        highlight={(code) => code}
        padding={10}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 12,
        }}
      />

      <div id="suggestions">
        {suggestions.map((suggestion, index) => (
          <div key={index}>{suggestion}</div>
        ))}
      </div>
    </div>
  );
}
