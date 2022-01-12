import { useEffect, useState } from "react";
import { Row, RowState } from "./Row";
import dictionary from "./dictionary.json";
import { Clue, clue } from "./clue";
import { Keyboard } from "./Keyboard";
import common from "./common.json";
import { pick, resetRng, seed } from "./util";

enum GameState {
  Playing,
  Won,
  Lost,
}

interface GameProps {
  maxGuesses: number;
  initialTime: number;
  startGame: () => void;
  started: boolean;
  about: boolean;
}

function randomTarget() {
  return pick(common);
}

function Game(props: GameProps) {
  const wordLength = 5;
  const totalWords = 7;
  const penaltyPerGuess = 3000; // 3 seconds

  const [gameState, setGameState] = useState(GameState.Playing);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [time, setTime] = useState<number>(0);
  const [penaltyTime, setPenaltyTime] = useState<number>(0);
  
  const [hint, setHint] = useState<string>(`Make your first guess!`);
  const [target, setTarget] = useState(() => {
    resetRng();
    return randomTarget();
  });
  const [gamesWon, setGamesWon] = useState(0);

  const startNextGame = () => {
    setTarget(randomTarget());
    setGuesses([]);
    setCurrentGuess("");
    setHint("");
    setGameState(GameState.Playing);
  };

  const onKey = (key: string, started: boolean, about: boolean) => {
    if (about) {
      return;
    }

    if (!started) {
      if (key === "Enter") {
        props.startGame();
      }
      return;
    }

    if (gameState !== GameState.Playing) {
      if (key === "Enter" && gamesWon < totalWords) {
        startNextGame();
      }
      return;
    }
    if (guesses.length === props.maxGuesses) return;
    if (/^[a-z]$/.test(key)) {
      setCurrentGuess((guess) => (guess + key).slice(0, wordLength));
      setHint("");
    } else if (key === "Backspace") {
      setCurrentGuess((guess) => guess.slice(0, -1));
      setHint("");
    } else if (key === "Enter") {
      if (currentGuess.length !== wordLength) {
        setHint("Too short");
        return;
      }
      if (!dictionary.includes(currentGuess)) {
        setHint("Not a valid word");
        return;
      }
      setGuesses((guesses) => guesses.concat([currentGuess]));
      setCurrentGuess(() => "");
      if (currentGuess === target) {
        if (gamesWon < totalWords - 1) {
          setHint("You won! (Enter to play next word)");
        } else {
          setHint("You won!");
        }
        setGameState(GameState.Won);
        setGamesWon(gamesWon + 1);
      } else {
        setPenaltyTime(penaltyTime + penaltyPerGuess);

        if (guesses.length + 1 === props.maxGuesses) {
          setHint(
            `You lost! The answer was ${target.toUpperCase()}. (Enter to play next word)`
          );
          setGameState(GameState.Lost);
        } else {
          setHint("");
        }
      } 
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timer | null = null;

    if (gamesWon < totalWords) {
      interval = setInterval(() => {
        setTime(Date.now());
      });
    } else if (interval) {
      clearInterval(interval);
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        onKey(e.key, props.started, props.about);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [currentGuess, gameState, gamesWon, props.started, props.about]);

  let letterInfo = new Map<string, Clue>();
  const rowDivs = Array(props.maxGuesses)
    .fill(undefined)
    .map((_, i) => {
      const guess = [...guesses, currentGuess][i] ?? "";
      const cluedLetters = clue(guess, target);
      const lockedIn = i < guesses.length;
      if (lockedIn) {
        for (const { clue, letter } of cluedLetters) {
          if (clue === undefined) break;
          const old = letterInfo.get(letter);
          if (old === undefined || clue > old) {
            letterInfo.set(letter, clue);
          }
        }
      }
      return (
        <Row
          key={i}
          wordLength={wordLength}
          rowState={lockedIn ? RowState.LockedIn : RowState.Pending}
          cluedLetters={cluedLetters}
        />
      );
    });

  const secondsElapsed = (time > props.initialTime) ? ((time - props.initialTime + penaltyTime) / 1000) : 0;

  return (
    <div className="Game" style={{ display: props.about || !props.started ? "none" : "block" }}>
      <div style={{ marginBottom: 20 }}>{gamesWon}/{totalWords} wordles</div>
      <div style={{ marginBottom: 20, fontSize: 40 }}>{secondsElapsed.toFixed(2)}</div>
      <div className="Game-options">
        <button
          style={{ flex: "0" }}
          disabled={gameState !== GameState.Playing || guesses.length === 0}
          onClick={() => {
            setHint(
              `The answer was ${target.toUpperCase()}. (Enter to play again)`
            );
            setGameState(GameState.Lost);
            (document.activeElement as HTMLElement)?.blur();
          }}
        >
          Give up
        </button>
      </div>
      {rowDivs}
      <p>{hint || `\u00a0`}</p>
      <Keyboard letterInfo={letterInfo} onKey={onKey} />
      {seed ? (
        <div className="Game-seed-info">
          seed {seed}
        </div>
      ) : undefined}
    </div>
  );
}

export default Game;
