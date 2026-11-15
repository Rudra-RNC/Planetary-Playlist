import { useEffect, useMemo, useRef, useState } from "react";
import tracksJson from "./data/tracks.json";
import { analyseImage } from "./analysis/imageAnalysis";
import { mapNotes } from "./mapping/noteMapping";
import { AudioEngine } from "./audio/engine";
import * as Tone from "tone";
import type { Analysis, Track } from "./types";

const tracks = tracksJson as Track[];

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(62);
  const [muted, setMuted] = useState(false);
  const [narration, setNarration] = useState(true);
  const [about, setAbout] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [imageReady, setImageReady] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [audioHint, setAudioHint] = useState("");
  const engineRef = useRef<AudioEngine | null>(null);
  const selected = tracks.find((track) => track.id === selectedId) ?? null;
  const notes = useMemo(
    () => (selected && analysis ? mapNotes(analysis, selected) : []),
    [analysis, selected],
  );

  useEffect(() => () => engineRef.current?.dispose(), []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!selected) return;
      if (event.key === " ") {
        event.preventDefault();
        void togglePlayback();
      }
      if (event.key.toLowerCase() === "r") restart();
      if (event.key === "ArrowLeft")
        setPosition((value) => Math.max(0, value - (event.shiftKey ? 10 : 1)));
      if (event.key === "ArrowRight")
        setPosition((value) => Math.min(95, value + (event.shiftKey ? 10 : 1)));
      if (event.key.toLowerCase() === "m") setMuted((value) => !value);
      if (event.key === "ArrowUp") changeVolume(5);
      if (event.key === "ArrowDown") changeVolume(-5);
      if (event.key === "[") changeSpeed(-1);
      if (event.key === "]") changeSpeed(1);
      if (event.key === "Escape") goHome();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    if (!narration || !analysis || !selected) return;
    const quarter = Math.min(3, Math.floor(position / 24));
    const live = document.getElementById("narration");
    if (live) live.textContent = analysis.quarterSummary[quarter];
  }, [analysis, narration, position, selected]);
  useEffect(() => {
    engineRef.current?.setVolume(muted ? -60 : volume - 100);
  }, [muted, volume]);

  function selectTrack(track: Track) {
    setSelectedId(track.id);
    setPlaying(false);
    setPosition(0);
    setAnalysis(null);
    setImageReady(false);
    setImageError(false);
    setAudioHint("");
    engineRef.current?.dispose();
    engineRef.current = new AudioEngine(setPosition);
  }
  function onImageLoad(image: HTMLImageElement) {
    const nextAnalysis = analyseImage(image);
    engineRef.current?.setDroneLevel(nextAnalysis.meanLightness);
    setAnalysis(nextAnalysis);
    setImageReady(true);
  }
  async function togglePlayback() {
    if (!selected || !analysis || !engineRef.current) return;
    await engineRef.current.start();
    if (playing) engineRef.current.pause();
    else {
      engineRef.current.setEvents(notes, selected.bpm, selected.rootNote);
      engineRef.current.setVolume(muted ? -60 : volume - 100);
      engineRef.current.setSpeed(speed);
      engineRef.current.play();
    }
    if (Tone.getContext().state !== "running") {
      setAudioHint(
        "Audio is still suspended. Press Play again or check the device silent-mode setting.",
      );
    } else {
      setAudioHint("");
    }
    setPlaying((value) => !value);
  }
  function restart() {
    if (engineRef.current) {
      engineRef.current.restart();
      setPlaying(true);
      setPosition(0);
    }
  }
  function goHome() {
    engineRef.current?.pause();
    setPlaying(false);
    setSelectedId(null);
    setAnalysis(null);
  }
  function changeVolume(delta: number) {
    setVolume((value) => Math.max(0, Math.min(100, value + delta)));
  }
  function changeSpeed(delta: number) {
    setSpeed((value) => {
      const next = Math.max(0.5, Math.min(1.5, value + delta));
      engineRef.current?.setSpeed(next);
      return next;
    });
  }
  function setColumn(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setPosition(Math.round(((event.clientX - rect.left) / rect.width) * 95));
  }

  if (about)
    return (
      <main className="shell">
        <header className="topbar">
          <button className="text-button" onClick={() => setAbout(false)}>
            ← Back to records
          </button>
          <span className="eyebrow">EARTH INFORMATION JUKEBOX</span>
        </header>
        <section className="about-page">
          <p className="eyebrow">METHOD / ACCESS</p>
          <h1>Hear the picture. Keep the science visible.</h1>
          <p className="lede">
            The jukebox analyses each bundled still frame once, then maps its
            visible structure to a small set of notes. The image chooses when
            and how much sound appears; the author chooses the key, scale,
            instruments, and limits so the result stays musical.
          </p>
          <div className="about-grid">
            <article>
              <span className="step">01</span>
              <h2>Pixels to cells</h2>
              <p>
                Each frame becomes a 96 × 32 grid. Hue, brightness, saturation,
                and contrast are measured once in an offscreen canvas.
              </p>
            </article>
            <article>
              <span className="step">02</span>
              <h2>Cells to notes</h2>
              <p>
                Rows become scale-locked pitch, columns become time and pan,
                brightness becomes loudness, and salient colors become sparse
                note events.
              </p>
            </article>
            <article>
              <span className="step">03</span>
              <h2>Sound you can follow</h2>
              <p>
                Every track includes a plain-language description, a visual
                sound key, keyboard controls, and throttled live narration.
              </p>
            </article>
          </div>
          <p className="credit-note">
            NASA imagery and scientific descriptions remain credited on every
            record. The sound maps the picture’s colors; it does not replace the
            underlying measurements.
          </p>
          <p className="ai-note">
            SI disclosure: OpenAI Codex assisted with scaffolding, code, tests,
            UI iteration, and documentation. No SI-generated NASA imagery,
            logos, music files, or voice recordings are used.
          </p>
        </section>
      </main>
    );

  if (!selected)
    return (
      <main className="shell">
        <header className="topbar">
          <span className="eyebrow">NASA / EARTH SCIENCE / 01</span>
          <button className="text-button" onClick={() => setAbout(true)}>
            About the method ↗
          </button>
        </header>
        <section className="hero">
          <div>
            <p className="eyebrow">A sonic field guide to a changing planet</p>
            <h1>
              Earth
              <br />
              <em>Information</em>
              <br />
              Jukebox
            </h1>
            <p className="lede">
              Pick a NASA Earth Information Center visualization and hear its
              colors move through a live, scale-locked soundscape.
            </p>
          </div>
          <div className="hero-orbit" aria-hidden="true">
            <span className="orbit orbit-one" />
            <span className="orbit orbit-two" />
            <span className="planet" />
          </div>
        </section>
        <div className="section-label">
          <span>Choose a record</span>
          <span>
            {tracks.length} curated visualizations · no sign-up · audio starts
            on selection
          </span>
        </div>
        <section className="track-grid" aria-label="Visualization records">
          {tracks.map((track, index) => (
            <button
              className="track-card"
              key={track.id}
              onClick={() => selectTrack(track)}
              style={{ "--accent": track.accent } as React.CSSProperties}
            >
              <div className="card-number">0{index + 1}</div>
              <div className="card-art">
                <img src={track.imageFile} alt="" />
                <span className="play-mark">↗</span>
              </div>
              <div className="card-copy">
                <span className="eyebrow">{track.theme}</span>
                <h2>{track.title}</h2>
                <p>{track.description.slice(0, 86)}…</p>
              </div>
            </button>
          ))}
        </section>
        <footer className="footer">
          <span>Built for the Earth Information Jukebox challenge</span>
          <span>NASA data · live sound · accessible by design</span>
        </footer>
      </main>
    );

  const quarter = analysis ? Math.min(3, Math.floor(position / 24)) : 0;
  return (
    <main
      className="shell now-playing"
      style={{ "--accent": selected.accent } as React.CSSProperties}
    >
      <header className="topbar">
        <button className="text-button" onClick={goHome}>
          ← All records
        </button>
        <span className="eyebrow">
          NOW PLAYING / {selected.theme.toUpperCase()}
        </span>
        <button className="text-button" onClick={() => setAbout(true)}>
          About ↗
        </button>
      </header>
      <section className="playing-layout">
        <div className="visual-column">
          <div className="visual-label">
            <span>EARTH / {selected.id.toUpperCase()}</span>
            <span>{imageReady ? "ANALYSED · READY" : "TUNING IN…"}</span>
          </div>
          <div
            className="image-stage"
            onClick={setColumn}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft")
                setPosition((value) => Math.max(0, value - 1));
              if (event.key === "ArrowRight")
                setPosition((value) => Math.min(95, value + 1));
            }}
            role="slider"
            aria-label="Playhead position"
            aria-valuemin={0}
            aria-valuemax={95}
            aria-valuenow={position}
            aria-valuetext={`${position + 1} of 96 columns`}
            tabIndex={0}
          >
            {imageError ? (
              <div className="image-error">
                <strong>We lost the frame.</strong>
                <button
                  className="text-button"
                  onClick={() => {
                    setImageError(false);
                    setImageReady(false);
                  }}
                >
                  Retry loading
                </button>
              </div>
            ) : (
              <img
                onLoad={(event) => onImageLoad(event.currentTarget)}
                onError={() => setImageError(true)}
                src={selected.imageFile}
                alt={`${selected.title}: ${selected.description}`}
              />
            )}
            <div
              className="playhead"
              style={{ left: `${(position / 95) * 100}%` }}
              aria-hidden="true"
            >
              <span />
              <i />
            </div>
            <div className="image-scanline" aria-hidden="true" />
          </div>
          <p className="audio-hint" role="status">{audioHint}</p>
          <div className="transport">
            <button
              className="transport-button primary"
              onClick={() => void togglePlayback()}
              disabled={!analysis}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? "Ⅱ" : "▶"}
            </button>
            <button
              className="transport-button"
              onClick={restart}
              aria-label="Restart"
            >
              ↺
            </button>
            <div className="transport-meta">
              <span>{playing ? "PLAYING" : "PAUSED"}</span>
              <strong>
                {String(position + 1).padStart(2, "0")} <small>/ 96</small>
              </strong>
            </div>
            <div className="speed-control" aria-label="Playback speed">
              {[0.5, 1, 1.5].map((value) => (
                <button
                  className={speed === value ? "speed active" : "speed"}
                  key={value}
                  onClick={() => {
                    setSpeed(value);
                    engineRef.current?.setSpeed(value);
                  }}
                  aria-pressed={speed === value}
                >
                  {value}×
                </button>
              ))}
            </div>
            <div className="transport-range">
              <label htmlFor="volume">Volume</label>
              <input
                id="volume"
                type="range"
                min="0"
                max="100"
                value={muted ? 0 : volume}
                onChange={(event) => {
                  setVolume(Number(event.target.value));
                  setMuted(false);
                }}
              />
              <button
                className="mute-button"
                onClick={() => setMuted((value) => !value)}
                aria-pressed={muted}
              >
                {muted ? "MUTE" : "SOUND"}
              </button>
            </div>
          </div>
          <div className="shortcut-row">
            <span>
              <kbd>Space</kbd> play
            </span>
            <span>
              <kbd>R</kbd> restart
            </span>
            <span>
              <kbd>←</kbd>
              <kbd>→</kbd> move
            </span>
            <span>
              <kbd>M</kbd> mute
            </span>
            <span>
              <kbd>[</kbd>
              <kbd>]</kbd> speed
            </span>
          </div>
        </div>
        <aside className="info-column">
          <div className="track-heading">
            <p className="eyebrow">{selected.theme}</p>
            <h1>{selected.title}</h1>
            <p className="track-caption">
              A live reading of the image’s visible color, contrast, and
              position.
            </p>
          </div>
          <section className="panel hearing-panel">
            <div className="panel-heading">
              <span className="eyebrow">WHAT YOU ARE HEARING</span>
              <span className="signal-dot" />
            </div>
            <div className="legend">
              <div>
                <span className="legend-icon hue" />{" "}
                <span>
                  Color <small>instrument</small>
                </span>
              </div>
              <div>
                <span className="legend-icon height" />{" "}
                <span>
                  Height <small>pitch</small>
                </span>
              </div>
              <div>
                <span className="legend-icon light" />{" "}
                <span>
                  Brightness <small>loudness</small>
                </span>
              </div>
            </div>
          </section>
          <section className="panel description-panel">
            <p>{selected.description}</p>
            <div className="data-credit">
              <span>DATA CREDIT</span>
              <a href={selected.sourceUrl} target="_blank" rel="noreferrer">
                {selected.credit} ↗
              </a>
            </div>
          </section>
          <section className="panel narration-panel">
            <div>
              <span className="eyebrow">LIVE NARRATION</span>
              <button
                className="toggle"
                aria-pressed={narration}
                onClick={() => setNarration((value) => !value)}
              >
                {narration ? "ON" : "OFF"}
              </button>
            </div>
            <p>
              {analysis
                ? analysis.quarterSummary[quarter]
                : "The playhead will describe the active quarter here."}
            </p>
            <div id="narration" className="sr-only" aria-live="polite" />
          </section>
          <div className="meta-row">
            <span>
              KEY <strong>{selected.rootNote}</strong>
            </span>
            <span>
              SCALE <strong>{selected.scale}</strong>
            </span>
            <span>
              BPM <strong>{selected.bpm}</strong>
            </span>
          </div>
        </aside>
      </section>
    </main>
  );
}
