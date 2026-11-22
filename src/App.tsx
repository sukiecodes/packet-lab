// src/App.tsx
import { useSimulator } from './hooks/useSimulator';
import { PacketCanvas } from './components/canvas/PacketCanvas';
import { Activity, ChevronRight, Pause, Play, Plug, RotateCcw, StepForward, Trash2, Unplug } from 'lucide-react';

export default function App() {
  const {
    snapshot,
    isRunning,
    start,
    pause,
    step,
    reset,
    appOpenClient,
    appCloseClient,
    dropPacket,
  } = useSimulator(50); // 50ms tick rate
  const inFlightPackets = snapshot.packets.filter(packet => packet.status === 'in-transit');

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><Activity size={19} /></div>
          <div>
            <h1>Packet Lab</h1>
            <p>TCP STATE VISUALIZER</p>
          </div>
        </div>

        <div className="header-actions">
          <button className="button button-primary" onClick={appOpenClient}>
            <Plug size={16} /> Active open
          </button>
          <button className="button button-danger-soft" onClick={appCloseClient}>
            <Unplug size={16} /> Active close
          </button>
        </div>
      </header>

      <section className="workspace">
        <div className="transport-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">NETWORK CHANNEL</span>
              <h2>Connection overview</h2>
            </div>
            <div className="live-status">
              <span className={isRunning ? 'status-dot running' : 'status-dot'} />
              {isRunning ? 'Simulation running' : 'Simulation paused'}
            </div>
          </div>

          <PacketCanvas
            client={snapshot.client}
            server={snapshot.server}
            packets={snapshot.packets}
            onDropPacket={dropPacket}
          />

          <div className="playback">
            <div className="playback-main">
              <button
                className="icon-button primary"
                onClick={isRunning ? pause : start}
                aria-label={isRunning ? 'Pause simulation' : 'Run simulation'}
              >
                {isRunning ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
              </button>
              <button
                className="icon-button"
                onClick={step}
                disabled={isRunning}
                aria-label="Advance one step"
              >
                <StepForward size={18} />
              </button>
              <button className="icon-button" onClick={reset} aria-label="Reset simulation">
                <RotateCcw size={18} />
              </button>
            </div>
            <div className="tick-counter">
              <span>TICK</span>
              <strong>{String(snapshot.tickCount).padStart(4, '0')}</strong>
            </div>
          </div>
        </div>

        <aside className="side-panel">
          <section className="packet-panel">
            <div className="side-heading">
              <div>
                <span className="eyebrow">LOSS CONTROL</span>
                <h2>In-flight packets</h2>
              </div>
              <span className="packet-count">{inFlightPackets.length}</span>
            </div>

            <div className="packet-list">
              {inFlightPackets.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><Activity size={20} /></div>
                  <p>No packets in transit</p>
                  <span>Open a connection to send traffic.</span>
                </div>
              ) : (
                inFlightPackets.map(packet => (
                  <article className="packet-card" key={packet.id}>
                    <div className="packet-card-top">
                      <div className="packet-route">
                        <span>{packet.source}</span>
                        <ChevronRight size={14} />
                        <span>{packet.dest}</span>
                      </div>
                      <span className="progress-label">{packet.progress}%</span>
                    </div>
                    <div className="packet-details">
                      <span className="packet-flags">{packet.type.join(' · ')}</span>
                      <span>SEQ {packet.seqNum}</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${packet.progress}%` }} />
                    </div>
                    <button className="drop-button" onClick={() => dropPacket(packet.id)}>
                      <Trash2 size={15} /> Drop packet
                    </button>
                  </article>
                ))
              )}
            </div>
          </section>
        </aside>
      </section>

      <section className="log-panel">
        <div className="side-heading log-heading">
          <div>
            <span className="eyebrow">DEBUG CONSOLE</span>
            <h2>Protocol events</h2>
          </div>
          <span className="event-count">{snapshot.logs.length} events</span>
        </div>
        <div className="event-log">
          {snapshot.logs.length === 0 ? (
            <div className="log-empty">Waiting for protocol activity...</div>
          ) : (
            snapshot.logs.map((log, idx) => (
              <div className="log-line" key={`${idx}-${log}`}><span>{String(snapshot.logs.length - idx).padStart(3, '0')}</span>{log}</div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
