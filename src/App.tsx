// src/App.tsx
import { useSimulator } from './hooks/useSimulator';
import { PacketCanvas } from './components/canvas/PacketCanvas';
import { Play, Pause, RotateCcw, StepForward, Plug, Unplug } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Packet Lab</h1>
            <p className="text-sm text-slate-400">Interactive TCP State Machine & Protocol Visualizer</p>
          </div>
          
          {/* Playback & Action Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={appOpenClient}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold transition"
            >
              <Plug size={16} /> Active Open (SYN)
            </button>
            <button
              onClick={appCloseClient}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 rounded-lg text-sm font-semibold transition"
            >
              <Unplug size={16} /> Active Close (FIN)
            </button>
            <div className="h-6 w-px bg-slate-800 mx-1" />
            <button
              onClick={isRunning ? pause : start}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button
              onClick={step}
              disabled={isRunning}
              className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-lg transition"
            >
              <StepForward size={18} />
            </button>
            <button
              onClick={reset}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </header>

        {/* SVG Visualizer Canvas */}
        <PacketCanvas
          client={snapshot.client}
          server={snapshot.server}
          packets={snapshot.packets}
          onDropPacket={dropPacket}
        />

        {/* Event Logs Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-48 overflow-y-auto font-mono text-xs text-slate-300">
          <div className="font-semibold text-slate-500 uppercase tracking-wider mb-2">Protocol Event Logs</div>
          {snapshot.logs.length === 0 ? (
            <div className="text-slate-600 italic">No events recorded. Click "Active Open" to start a handshake.</div>
          ) : (
            snapshot.logs.map((log, idx) => (
              <div key={idx} className="py-0.5 border-b border-slate-800/50">{log}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
