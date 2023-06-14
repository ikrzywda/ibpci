import { useState, useEffect, useRef } from "react";

export default function Home() {
  const editorRef = useRef<any>(null);
  const [code, setCode] = useState("no i chuj");
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
    setCode(code.toString());

    if (textBuffers && wasm) {
      const cursorPosition = editorRef.current?.editor?.getPosition();
      console.log(cursorPosition);
      const strArray = textBuffers.getSuggestions(code.toString());
      const suggestionsArray: string[] = [];
      for (let i = 0; i < strArray.size(); i++) {
        suggestionsArray.push(strArray.get(i));
      }
      setSuggestions(suggestionsArray);
      try {
        textBuffers.updateTextBuffer(code.toString());
        const error = textBuffers.runParser();
        console.log(error);
      } catch (e) {
        console.log(e);
      }
    }
  };

  return (
    <div>
      <textarea
        value={code}
        onChange={(e) => handleCodeChange(e.target.value)}
        style={{ fontFamily: "monospace" }}
      />

      <div id="suggestions">
        {suggestions.map((suggestion, index) => (
          <div key={index}>{suggestion}</div>
        ))}
      </div>
    </div>
  );
}
