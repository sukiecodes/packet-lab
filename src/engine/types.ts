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
}

export interface NodeState {
  id: "client" | "server";
  state: TCPState;
  nextSeqNum: number;
  expectedSeqNum: number;
  expectedAckNum: number;
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
