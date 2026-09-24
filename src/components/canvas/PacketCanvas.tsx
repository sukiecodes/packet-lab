import React from 'react';
import type { NodeState, Packet } from '../../engine/types';
import { XCircle } from 'lucide-react';

interface PacketCanvasProps {
  client: NodeState;
  server: NodeState;
  packets: Packet[];
  onDropPacket: (id: string) => void;
}

export const PacketCanvas: React.FC<PacketCanvasProps> = ({
  client,
  server,
  packets,
  onDropPacket,
}) => {
  // Fixed canvas dimensions for percentage-based math
  const canvasWidth = 800;
  const canvasHeight = 220;

  const clientX = 120;
  const serverX = 680;
  const linkY = 110;

  return (
    <div className="w-full bg-slate-900 rounded-xl p-6 shadow-inner border border-slate-800">
      <svg
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        className="w-full h-auto overflow-visible select-none"
      >
        {/* Background Network Channel Wire */}
        <line
          x1={clientX}
          y1={linkY}
          x2={serverX}
          y2={linkY}
          stroke="#334155"
          strokeWidth="6"
          strokeDasharray="8 8"
        />

        {/* Client Node */}
        <g transform={`translate(${clientX}, ${linkY})`}>
          <circle r="42" fill="#1e293b" stroke="#3b82f6" strokeWidth="4" />
          <text
            y="-5"
            textAnchor="middle"
            fill="#f8fafc"
            fontWeight="700"
            fontSize="14"
          >
            CLIENT
          </text>
          <rect
            x="-45"
            y="12"
            width="90"
            height="20"
            rx="10"
            fill="#1d4ed8"
          />
          <text
            y="26"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="10"
            fontWeight="600"
          >
            {client.state}
          </text>
        </g>

        {/* Server Node */}
        <g transform={`translate(${serverX}, ${linkY})`}>
          <circle r="42" fill="#1e293b" stroke="#10b981" strokeWidth="4" />
          <text
            y="-5"
            textAnchor="middle"
            fill="#f8fafc"
            fontWeight="700"
            fontSize="14"
          >
            SERVER
          </text>
          <rect
            x="-45"
            y="12"
            width="90"
            height="20"
            rx="10"
            fill="#047857"
          />
          <text
            y="26"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="10"
            fontWeight="600"
          >
            {server.state}
          </text>
        </g>

        {/* In-Transit & Dropped Packets */}
        {packets.map(packet => {
          // Calculate current X position based on progress percentage and direction
          const isClientToFirst = packet.source === 'client';
          const startX = isClientToFirst ? clientX : serverX;
          const endX = isClientToFirst ? serverX : clientX;

          const currentX =
            startX + (endX - startX) * (packet.progress / 100);

          return (
            <g
              key={packet.id}
              transform={`translate(${currentX}, ${linkY})`}
              className="transition-all duration-75 ease-linear"
            >
              {/* Packet Body */}
              <rect
                x="-36"
                y="-20"
                width="72"
                height="40"
                rx="8"
                fill={packet.status === 'dropped' ? '#ef4444' : '#38bdf8'}
                stroke="#ffffff"
                strokeWidth="2"
                className="shadow-lg"
              />

              {/* TCP Flag Badge */}
              <text
                y="-2"
                textAnchor="middle"
                fill="#0f172a"
                fontWeight="800"
                fontSize="12"
              >
                {packet.type.join('/')}
              </text>

              {/* Sequence Number Subtitle */}
              <text
                y="12"
                textAnchor="middle"
                fill="#1e293b"
                fontWeight="500"
                fontSize="9"
              >
                Seq={packet.seqNum}
              </text>

              {/* Click-to-Drop Action Button */}
              {packet.status === 'in-transit' && (
                <g
                  transform="translate(28, -16)"
                  className="cursor-pointer hover:scale-125 transition-transform"
                  onClick={() => onDropPacket(packet.id)}
                >
                  <circle r="10" fill="#dc2626" />
                  <XCircle size={14} color="#ffffff" x="-7" y="-7" />
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};