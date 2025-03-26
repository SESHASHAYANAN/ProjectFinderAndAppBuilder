import {
  FaPlayCircle,
  FaCopy,
  FaCode,
  FaMagic,
  FaSpinner,
  FaCheck,
  FaSyncAlt,
} from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { Editor } from "@monaco-editor/react";
import "./CopilotRunner.css";
import React, { useState, useEffect, useRef } from "react";

const CopilotRunner = () => {
  const [prompt, setPrompt] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [pyodide, setPyodide] = useState(null);
  const editorRef = useRef(null);
  const outputRef = useRef(null);

  // Default code templates
  const codeTemplates = {
    javascript:
      '// Write your JavaScript code here\nconsole.log("Hello, world!");',
    python: '# Write your Python code here\nprint("Hello, world!")',
    html: "<!DOCTYPE html>\n<html>\n<head>\n  <title>Copilot Runner</title>\n</head>\n<body>\n  <h1>Hello, world!</h1>\n</body>\n</html>",
  };

  // Load Pyodide for Python execution
  useEffect(() => {
    const loadPyodide = async () => {
      if (language === "python" && !pyodide) {
        try {
          // Load pyodide script dynamically
          const script = document.createElement("script");
          script.src =
            "https://cdn.jsdelivr.net/pyodide/v0.22.1/full/pyodide.js";
          script.async = true;
          document.body.appendChild(script);

          script.onload = async () => {
            // Initialize Pyodide
            const pyodideInstance = await window.loadPyodide({
              indexURL: "https://cdn.jsdelivr.net/pyodide/v0.22.1/full/",
            });
            setPyodide(pyodideInstance);
            console.log("Pyodide loaded successfully");
          };
        } catch (err) {
          console.error("Failed to load Pyodide:", err);
          setError(
            "Failed to load Python runtime. Please try JavaScript instead."
          );
        }
      }
    };

    loadPyodide();
  }, [language, pyodide]);

  // Handle editor mounting
  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const generateCode = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      // In a real implementation, you would call an API that interfaces with GitHub Copilot or similar
      // This is a mock implementation
      setTimeout(() => {
        let generatedCode = "";

        if (language === "javascript") {
          if (prompt.includes("sort array")) {
            generatedCode = `// Function to sort an array of numbers
function sortArray(arr) {
  return arr.sort((a, b) => a - b);
}

// Example usage
const unsortedArray = [5, 3, 8, 1, 2, 7];
console.log("Original array:", unsortedArray);
const sortedArray = sortArray(unsortedArray);
console.log("Sorted array:", sortedArray);`;
          } else if (prompt.includes("fetch data")) {
            generatedCode = `// Function to fetch data from an API
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(\`HTTP error: \${response.status}\`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

// Example usage
console.log("Fetching data...");
fetchData('https://jsonplaceholder.typicode.com/todos/1')
  .then(data => console.log("Fetched data:", data))
  .catch(error => console.error("Error:", error));`;
          } else {
            generatedCode = `// ${prompt}
function processData(input) {
  // Parse the input if it's a string
  const data = typeof input === 'string' ? JSON.parse(input) : input;
  
  // Process the data
  const result = {
    processed: true,
    count: Array.isArray(data) ? data.length : 1,
    timestamp: new Date().toISOString()
  };
  
  console.log("Input received:", input);
  console.log("Processing complete:", result);
  return result;
}

// Example usage
const sampleData = [1, 2, 3, 4, 5];
const result = processData(sampleData);
console.log("Final result:", result);`;
          }
        } else if (language === "python") {
          if (prompt.includes("sort array") || prompt.includes("sort list")) {
            generatedCode = `# Function to sort a list of numbers
def sort_list(arr):
    return sorted(arr)

# Example usage
unsorted_list = [5, 3, 8, 1, 2, 7]
print("Original list:", unsorted_list)
sorted_list = sort_list(unsorted_list)
print("Sorted list:", sorted_list)`;
          } else if (prompt.includes("fetch data")) {
            generatedCode = `# Function to fetch data from an API
import json
from js import fetch

async def fetch_data(url):
    try:
        response = await fetch(url)
        data = await response.json()
        return data
    except Exception as e:
        print(f"Error fetching data: {e}")
        return None

# Example usage
print("This is a mock for fetch in Pyodide")
print("In a real Python environment, you would use:")
print("import requests")
print("response = requests.get(url)")
print("data = response.json()")`;
          } else {
            generatedCode = `# ${prompt}
def process_data(input_data):
    """
    Process the provided data and return a result
    """
    # Convert input to list if it's not already
    if not isinstance(input_data, list):
        input_data = [input_data]
    
    # Process the data
    result = {
        "processed": True,
        "count": len(input_data),
        "first_item": input_data[0] if input_data else None,
        "last_item": input_data[-1] if input_data else None
    }
    
    print("Input received:", input_data)
    print("Processing complete:", result)
    return result

# Example usage
sample_data = [1, 2, 3, 4, 5]
result = process_data(sample_data)
print("Final result:", result)`;
          }
        } else if (language === "html") {
          generatedCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${prompt}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
        }
        .info {
            background-color: #e7f3fe;
            border-left: 3px solid #2196F3;
            padding: 15px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${prompt}</h1>
        <div class="info">
            <p>This is a sample HTML page generated by Copilot Runner.</p>
            <p>You can edit this HTML and see the results in real-time.</p>
        </div>
        <p>Current time: <span id="time"></span></p>
    </div>
    
    <script>
        // Update the time every second
        function updateTime() {
            document.getElementById('time').textContent = new Date().toLocaleTimeString();
        }
        
        // Update immediately and then every second
        updateTime();
        setInterval(updateTime, 1000);
    </script>
</body>
</html>`;
        }

        setCode(generatedCode);
        setIsGenerating(false);
        setShowPrompt(false);
      }, 1500);
    } catch (error) {
      console.error("Error generating code:", error);
      setIsGenerating(false);
      setError("Failed to generate code. Please try again.");
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput("");
    setError(null);

    try {
      const codeToRun = editorRef.current ? editorRef.current.getValue() : code;

      if (language === "javascript") {
        // Run JavaScript code
        const originalConsoleLog = console.log;
        const originalConsoleError = console.error;
        const originalConsoleWarn = console.warn;
        const originalConsoleInfo = console.info;

        let output = "";

        // Override console methods to capture output
        console.log = (...args) => {
          output +=
            args
              .map((arg) =>
                typeof arg === "object" ? JSON.stringify(arg, null, 2) : arg
              )
              .join(" ") + "\n";
          originalConsoleLog(...args);
        };

        console.error = (...args) => {
          output +=
            "ERROR: " +
            args
              .map((arg) =>
                typeof arg === "object" ? JSON.stringify(arg, null, 2) : arg
              )
              .join(" ") +
            "\n";
          originalConsoleError(...args);
        };

        console.warn = (...args) => {
          output +=
            "WARNING: " +
            args
              .map((arg) =>
                typeof arg === "object" ? JSON.stringify(arg, null, 2) : arg
              )
              .join(" ") +
            "\n";
          originalConsoleWarn(...args);
        };

        console.info = (...args) => {
          output +=
            "INFO: " +
            args
              .map((arg) =>
                typeof arg === "object" ? JSON.stringify(arg, null, 2) : arg
              )
              .join(" ") +
            "\n";
          originalConsoleInfo(...args);
        };

        try {
          // Execute the code in a safer way with timeout
          const AsyncFunction = Object.getPrototypeOf(
            async function () {}
          ).constructor;
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(
              () => reject(new Error("Execution timed out (10s)")),
              10000
            );
          });

          const execPromise = new Promise(async (resolve) => {
            try {
              const asyncFn = new AsyncFunction(codeToRun);
              await asyncFn();
              resolve();
            } catch (e) {
              output += "Runtime Error: " + e.message + "\n";
              resolve();
            }
          });

          await Promise.race([execPromise, timeoutPromise]);
          setOutput(output || "Code executed successfully with no output.");
        } catch (error) {
          setOutput(output + "\nExecution Error: " + error.message);
        } finally {
          // Restore console methods
          console.log = originalConsoleLog;
          console.error = originalConsoleError;
          console.warn = originalConsoleWarn;
          console.info = originalConsoleInfo;
        }
      } else if (language === "python") {
        // Run Python code
        if (!pyodide) {
          setError(
            "Python runtime is not loaded yet. Please wait or try JavaScript."
          );
          setIsRunning(false);
          return;
        }

        try {
          // Clear previous Python stdout
          pyodide.runPython("import io, sys; sys.stdout = io.StringIO()");

          // Run the user code
          pyodide.runPython(codeToRun);

          // Get stdout content
          const stdout = pyodide.runPython("sys.stdout.getvalue()");
          setOutput(stdout || "Code executed successfully with no output.");
        } catch (err) {
          setOutput("Python Error: " + err.message);
        }
      } else if (language === "html") {
        // Create a sandboxed iframe to run HTML
        const iframe = document.createElement("iframe");
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "none";
        iframe.sandbox = "allow-scripts";

        // Clear previous output and append iframe
        if (outputRef.current) {
          outputRef.current.innerHTML = "";
          outputRef.current.appendChild(iframe);
        }

        // Write the HTML content to the iframe
        iframe.contentDocument.open();
        iframe.contentDocument.write(codeToRun);
        iframe.contentDocument.close();

        setOutput("HTML rendering in the output pane.");
      }
    } catch (error) {
      console.error("Error running code:", error);
      setError("Failed to run code: " + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    const codeToCopy = editorRef.current ? editorRef.current.getValue() : code;
    navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(codeTemplates[lang] || "");
    setOutput("");
    setError(null);
  };

  const resetCode = () => {
    setCode(codeTemplates[language] || "");
    setOutput("");
    setError(null);
  };

  return (
    <div className="copilot-runner-container">
      <div className="copilot-runner-header">
        <div className="header-logo">
          <FaCode className="logo-icon" />
          <h2>GitHub Copilot Runner</h2>
        </div>

        <div className="language-selector">
          <button
            className={`language-button ${
              language === "javascript" ? "active" : ""
            }`}
            onClick={() => handleLanguageChange("javascript")}
          >
            JavaScript
          </button>
          <button
            className={`language-button ${
              language === "python" ? "active" : ""
            }`}
            onClick={() => handleLanguageChange("python")}
          >
            Python
          </button>
          <button
            className={`language-button ${language === "html" ? "active" : ""}`}
            onClick={() => handleLanguageChange("html")}
          >
            HTML
          </button>
        </div>
      </div>

      {showPrompt && (
        <div className="prompt-overlay">
          <div className="prompt-container">
            <div className="prompt-header">
              <h3>What code would you like to generate?</h3>
              <button
                className="close-button"
                onClick={() => setShowPrompt(false)}
              >
                <IoMdClose />
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Describe the ${language} code you want to generate...`}
              rows={5}
            />
            <div className="prompt-actions">
              <button
                className="generate-button"
                onClick={generateCode}
                disabled={isGenerating || !prompt.trim()}
              >
                {isGenerating ? (
                  <>
                    <FaSpinner className="spinner" /> Generating...
                  </>
                ) : (
                  <>
                    <FaMagic /> Generate Code
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Split
        className="split-container"
        sizes={[60, 40]}
        minSize={100}
        gutterSize={10}
        gutterAlign="center"
        direction="horizontal"
      >
        <div className="editor-container">
          <div className="editor-header">
            <div className="editor-title">Code Editor</div>
            <div className="editor-actions">
              <button
                className="action-button"
                onClick={() => setShowPrompt(true)}
                title="Generate new code"
              >
                <FaMagic />
              </button>
              <button
                className="action-button"
                onClick={resetCode}
                title="Reset code"
              >
                <FaSyncAlt />
              </button>
              <button
                className="action-button"
                onClick={handleCopy}
                title="Copy code"
                disabled={copied}
              >
                {copied ? <FaCheck /> : <FaCopy />}
              </button>
              <button
                className="action-button run"
                onClick={runCode}
                disabled={isRunning}
                title="Run code"
              >
                {isRunning ? (
                  <FaSpinner className="spinner" />
                ) : (
                  <FaPlayCircle />
                )}
              </button>
            </div>
          </div>
          <div className="editor-wrapper">
            <Editor
              height="100%"
              defaultLanguage={language}
              language={language}
              theme="vs-dark"
              value={code}
              onChange={setCode}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on",
                fontFamily: "'Fira Code', Consolas, 'Courier New', monospace",
                fontLigatures: true,
              }}
            />
          </div>
        </div>

        <div className="output-container">
          <div className="output-header">
            <div className="output-title">Output</div>
            {language === "html" && (
              <div className="output-note">HTML is rendered below</div>
            )}
          </div>
          <div
            className={`output-content ${
              language === "html" ? "html-output" : ""
            }`}
            ref={outputRef}
          >
            {error ? (
              <div className="error-message">{error}</div>
            ) : output ? (
              <pre>{language !== "html" && output}</pre>
            ) : (
              <div className="empty-output">
                <FaPlayCircle className="empty-icon" />
                <p>Run your code to see the output here</p>
              </div>
            )}
          </div>
        </div>
      </Split>

      <div className="status-bar">
        <div className="status-language">
          {language.charAt(0).toUpperCase() + language.slice(1)}
        </div>
        <div className="status-message">
          {isRunning ? "Running..." : isGenerating ? "Generating..." : "Ready"}
        </div>
      </div>
    </div>
  );
};

export default CopilotRunner;
