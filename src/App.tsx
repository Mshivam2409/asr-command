import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import aquaASR from "./inference";
import useOnlineAnswering from "./hook";

function App() {
  (navigator as any).permissions
    .query({ name: "microphone" })
    .then(function (permissionStatus: any) {
      setMic(permissionStatus.state);
    });

  const [ready, setReady] = useState(false);
  const [buzzin, setBuzzin] = useState(false);
  const [finalanswer, setAnswer] = useState("");
  const [mic, setMic] = useState("");
  const [src, setSrc] = useState("");
  const [
    answer,
    listening,
    SpeechRecognition,
    status,
    timeLeft,
    commandRecognizer,
  ] = useOnlineAnswering({
    audio: {
      buzzin:
        "https://assets.mixkit.co/sfx/download/mixkit-game-show-wrong-answer-buzz-950.wav",
      buzzout:
        "https://assets.mixkit.co/sfx/download/mixkit-game-show-wrong-answer-buzz-950.wav",
    },
    onAudioData: () => {},
    timeout: 10000,
    isReady: ready,
    onComplete: async (answer, blob) => {
      setAnswer(answer);
      setBuzzin(false);
      setSrc(URL.createObjectURL(blob));
      console.log(answer, blob);
    },
    onBuzzin: () => {
      setBuzzin(true);
      console.log("Buzzed In");
    },
  });

  return (
    <div className="App">
      <header className="App-header">
        <p>{`ASR is ${ready ? "ready" : "not ready"} to use.`}</p>
        <p>
          Press Enable to enable ASR. <br /> Press listen to start listening,
          speak go, then you will buzz in, speak your answer, then speak stop.
          <br />
          You must wait around 3-4s after saying stop to allow time for
          processing.
          <br /> Press stop to turn off ASR.
          <br />
          You can listen to recorded audio after processing ends.
        </p>
        <p>{`Mic permission is ${mic}`}</p>
        <button
          onClick={async () => {
            await commandRecognizer.intialize();

            setReady(true);
          }}
        >
          ENABLE
        </button>
        <button
          onClick={() => {
            commandRecognizer.listen();
            SpeechRecognition.startListening();
          }}
        >
          LISTEN
        </button>
        <button
          onClick={() => {
            commandRecognizer.stop();
            SpeechRecognition.stopListening();
          }}
        >
          STOP
        </button>

        <p>{` ${buzzin ? "Buzzed In" : "Not Buzzed In"}.`}</p>
        <p>{`Answer is ${finalanswer}.`}</p>
        {src !== "" && <audio controls src={src} />}
      </header>
    </div>
  );
}

export default App;
