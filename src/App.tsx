import { useState } from "react";
import "./App.css";

function App() {
  const [currentText, setCurrentText] = useState(``);

  let test = document.getElementById("text-holder")?.innerHTML;
  window.ipcRenderer.on("test", (event, data) => {
    console.log(event);
    setCurrentText(data);
  });
  setInterval(() => {
    if (!!test) {
      setCurrentText(test);
      test = "";
    }
  }, 1000);
  return (
    <>
      <textarea
        name="main-text"
        id="main-text"
        value={currentText}
        onChange={(e) => {
          setCurrentText(e.target.value);
          console.log(currentText);
          window.ipcRenderer.send("test2", e.target.value);
        }}
      ></textarea>
    </>
  );
}

export default App;
