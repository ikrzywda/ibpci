import { useState, useEffect, useRef, ChangeEvent } from "react";

export default function Home() {
  const editorRef = useRef<any>(null);
  const [code, setCode] = useState("no i chuj");
  const [wasm, setWasm] = useState<any>(null);
  const [textBuffers, setTextBuffers] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

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

  const handleCodeChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setCode(event.target.value.toString());
    console.log(event.target.value.toString());

    if (textBuffers && wasm) {
      const cursorPosition = event.target.selectionStart;

      let startIndex = code.lastIndexOf(" ", cursorPosition) + 1;
      let endIndex = code.indexOf(" ", cursorPosition);
      if (endIndex === -1) {
        endIndex = code.length;
      }

      const currentToken = code.substring(startIndex, endIndex);

      console.log(currentToken);

      const strArray = textBuffers.getSuggestions(currentToken.toString());
      const suggestionsArray: string[] = [];
      for (let i = 0; i < strArray.size(); i++) {
        suggestionsArray.push(strArray.get(i));
      }
      setSuggestions(suggestionsArray);
      try {
        textBuffers.updateTextBuffer(code.toString());
        const error = textBuffers.runParser();
        setError(error);
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
        onChange={(e) => handleCodeChange(e)}
        style={{ fontFamily: "monospace" }}
      />

      <div id="suggestions">
        {suggestions.map((suggestion, index) => (
          <div key={index}>{suggestion}</div>
        ))}
      </div>
      <div id="error">{error}</div>
    </div>
  );
}
