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
    <div className="canvas-frame">
      <svg
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        className="select-none"
        role="img"
        aria-label="TCP client and server network visualization"
      >
        {/* Background Network Channel Wire */}
        <line
          x1={clientX}
          y1={linkY}
          x2={serverX}
          y2={linkY}
          stroke="#343846"
          strokeWidth="3"
          strokeDasharray="8 8"
        />
        <line
          x1={clientX}
          y1={linkY}
          x2={serverX}
          y2={linkY}
          stroke="#171a22"
          strokeWidth="1"
        />

        {/* Client Node */}
        <g transform={`translate(${clientX}, ${linkY})`}>
          <circle r="42" fill="#171a24" stroke="#5869de" strokeWidth="3" />
          <circle r="32" fill="none" stroke="#5869de" strokeWidth="1" opacity="0.16" />
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
            fill="#4f5fc9"
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
          <circle r="42" fill="#171a24" stroke="#4d9c83" strokeWidth="3" />
          <circle r="32" fill="none" stroke="#4d9c83" strokeWidth="1" opacity="0.16" />
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
            fill="#397963"
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
                fill={packet.status === 'dropped' ? '#d95a69' : '#7786ef'}
                stroke={packet.status === 'dropped' ? '#ef9aa5' : '#bac2ff'}
                strokeWidth="1.5"
              />

              {/* TCP Flag Badge */}
              <text
                y="-2"
                textAnchor="middle"
                fill="#11131a"
                fontWeight="800"
                fontSize="12"
              >
                {packet.type.join('/')}
              </text>

              {/* Sequence Number Subtitle */}
              <text
                y="12"
                textAnchor="middle"
                fill="#1f2230"
                fontWeight="500"
                fontSize="9"
              >
                Seq={packet.seqNum}
              </text>

              {/* Click-to-Drop Action Button */}
              {packet.status === 'in-transit' && (
                <g
                  transform="translate(28, -16)"
                  className="packet-drop-target"
                  role="button"
                  tabIndex={0}
                  aria-label={`Drop ${packet.type.join('/')} packet`}
                  onClick={() => onDropPacket(packet.id)}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onDropPacket(packet.id);
                    }
                  }}
                >
                  <circle r="12" fill="#d95a69" stroke="#f5bac2" strokeWidth="1.5" />
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