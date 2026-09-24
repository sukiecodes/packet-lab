// Defines data models for TCP states, packets, and node states

export type TCPState =
  | "CLOSED"
  | "LISTEN"
  | "SYN_SENT"
  | "SYN_RECV"
  | "ESTABLISHED"
  | "FIN_WAIT_1"
  | "FIN_WAIT_2"
  | "CLOSE_WAIT"
  | "CLOSING"
  | "LAST_ACK"
  | "TIME_WAIT";

export type PacketType =
  | "SYN"
  | "ACK"
  | "FIN"
  | "RST"
  | "PSH"
  | "URG";

export interface Packet {
  id: string;
  /**
   * TCP flag(s) carried by this packet - example being SYNACK
   */
  type: PacketType[];
  source: "client" | "server";
  dest: "client" | "server";
  seqNum: number;
  ackNum?: number;
  payload?: string;
  progress: number; // 0 = source, 100 = destination
  status: "in-transit" | "delivered" | "dropped";
  isRetransmission?: boolean; // true if retransmitted pkt
}

export type TCPEvent =
  | {
      type: "PACKET_RECEIVED";
      packet: Packet;
    }
  | {
      type: "APP_OPEN";
    }
  | {
      type: "APP_CLOSE";
    }
  | {
      type: "TIMEOUT";
  };

export interface NodeState {
  id: "client" | "server";
  state: TCPState;
  nextSeqNum: number;
  expectedSeqNum: number;
  expectedAckNum: number;

  // windowing and seq management
  sendUna: number; // oldest unacked seq number
  sendNext: number; // next seq number to transmit
  sendWnd: number; // sender window size 
  rcvNext: number; // next expected seq number 
  rcvWnd: number; // receiver window size 

  // recovery and timers
  rtoTicks: number; // current ticks remaining before rto 
  maxRtoTicks: number; // base rto threshold
  duplicateAckCount: number; // consecutive duplicate acks received

  // buffers
  sendBuffer: BufferItem[]; // queued app data awaiting transmission/ack
  recvBuffer: BufferItem[]; // in-order and reassembled ready to be sent to app
  outOfOrderBuffer: Packet[]; // stash for out of order arrivals before gap filling
}

export interface BufferItem {
  seqNum: number; // sequence number of the buffered packet
  data: string; 
  status: 'queued' | 'in-transnit' | 'acknowledged'
}

export interface SimulatorSnapshot {
  tickCount: number;
  client: NodeState;
  server: NodeState;
  packets: Packet[];
  logs: string[];
  stats: {
    retransmissions: number;
    fastRetransmits: number;
    droppedPackets: number;
  };

}
