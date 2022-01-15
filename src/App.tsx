import "./App.css";
import Game from "./Game";
import { useState } from "react";
import { Row, RowState } from "./Row";
import { Clue } from "./clue";

function App() {
  const [about, setAbout] = useState(false);
  const [started, setStarted] = useState(false);
  const [initialTime, setInitialTime] = useState(0);

  const maxGuesses = 6;

  const startGame = () => {
    setStarted(true);
    setInitialTime(Date.now());
  };

  return (
    <div className="App-container">
      <h1>seven wordles</h1>
      {!about && <button
          style={{ flex: "0", display: (started ? 'none' : 'block'), fontSize: 20 }}
          onClick={startGame}
        >
          Click to Start! (or press Enter)
        </button>}
      <div style={{ position: "absolute", right: 5, top: 5 }}>
        <a href="#" onClick={() => setAbout((a) => !a)}>
          {about ? "Close" : "About"}
        </a>
      </div>
      {about && (
        <div className="App-about">
          <p>
            <i>seven wordles</i> is a remake of the word game{" "}
            <a href="https://www.powerlanguage.co.uk/wordle/">
              <i>Wordle</i>
            </a>
            , testing how quickly you can guess seven different words. There is a 3 second penalty for each wrong guess.
          </p>
          <p>
            This project is a fork of{" "}
            <a href="https://github.com/lynn/hello-wordl">
              <i>hello-wordl</i>
            </a>.
          </p>
          <p>
            You get {maxGuesses} tries to guess a target word.
            <br />
            After each guess, you get Mastermind-style feedback:
          </p>
          <p>
            <Row
              rowState={RowState.LockedIn}
              wordLength={4}
              cluedLetters={[
                { clue: Clue.Absent, letter: "w" },
                { clue: Clue.Absent, letter: "o" },
                { clue: Clue.Correct, letter: "r" },
                { clue: Clue.Elsewhere, letter: "d" },
              ]}
            />
          </p>
          <p>
            <b>W</b> and <b>O</b> aren't in the target word at all.
            <br />
            <b>R</b> is correct! The third letter is <b>R</b>
            .<br />
            <b>D</b> occurs <em>elsewhere</em> in the target word.
          </p>
          <p>
            Let's move the <b>D</b> in our next guess:
            <Row
              rowState={RowState.LockedIn}
              wordLength={4}
              cluedLetters={[
                { clue: Clue.Correct, letter: "d" },
                { clue: Clue.Correct, letter: "a" },
                { clue: Clue.Correct, letter: "r" },
                { clue: Clue.Absent, letter: "k" },
              ]}
            />
            So close!
            <Row
              rowState={RowState.LockedIn}
              wordLength={4}
              cluedLetters={[
                { clue: Clue.Correct, letter: "d" },
                { clue: Clue.Correct, letter: "a" },
                { clue: Clue.Correct, letter: "r" },
                { clue: Clue.Correct, letter: "t" },
              ]}
            />
            Got it!
          </p>
          Report issues{" "}
          <a href="https://github.com/wooferzfg/seven-wordles/issues">here</a>, or
          tweet <a href="https://twitter.com/wooferzfg">@wooferzfg</a>.
        </div>
      )}
      <Game
        maxGuesses={maxGuesses}
        initialTime={initialTime}
        startGame={startGame}
        started={started}
        about={about}
      />
    </div>
  );
}

export default App;
