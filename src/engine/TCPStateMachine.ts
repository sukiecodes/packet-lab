import type { TCPState, TCPEvent, Packet, PacketType } from './types';

export interface TCPTransition {
  nextState: TCPState;
  responseType?: PacketType[];
}

function hasFlag(packet: Packet, flag: PacketType): boolean {
  return packet.type.includes(flag);
}

function hasExactFlags(packet: Packet, flags: PacketType[]): boolean {
  if (packet.type.length !== flags.length) return false;
  return flags.every(f => packet.type.includes(f));
}

export function handleTCPEvent(
  currentState: TCPState,
  event: TCPEvent
): TCPTransition {
  switch (event.type) {
    case 'APP_OPEN':
      if (currentState === 'CLOSED') {
        // Active open (client initiates 3-way handshake)
        return { nextState: 'SYN_SENT', responseType: ['SYN'] };
      }
      break;

    case 'APP_CLOSE':
      if (currentState === 'ESTABLISHED') {
        // Initiating connection closing
        return { nextState: 'FIN_WAIT_1', responseType: ['FIN'] };
      }
      if (currentState === 'CLOSE_WAIT') {
        // Passive Closer finishes sending data and closes
        return { nextState: 'LAST_ACK', responseType: ['FIN'] };
      }
      if (currentState === 'LISTEN' || currentState === 'SYN_SENT') {
        return { nextState: 'CLOSED' };
      }
      break;

    case 'TIMEOUT':
      if (currentState === 'TIME_WAIT') {
        return { nextState: 'CLOSED' };
      }
      break;

    case 'PACKET_RECEIVED': {
      const { packet } = event;

      // Global reset handler
      if (hasFlag(packet, 'RST')) {
        return { nextState: 'CLOSED' };
      }

      switch (currentState) {
        case 'LISTEN':
          if (hasFlag(packet, 'SYN')) {
            return { nextState: 'SYN_RECV', responseType: ['SYN', 'ACK'] };
          }
          break;

        case 'SYN_SENT':
          if (hasFlag(packet, 'SYN') && hasFlag(packet, 'ACK')) {
            // Standard 3-way handshake completion on client
            return { nextState: 'ESTABLISHED', responseType: ['ACK'] };
          }
          if (hasExactFlags(packet, ['SYN'])) {
            // Simultaneous open edge case
            return { nextState: 'SYN_RECV', responseType: ['ACK'] };
          }
          break;

        case 'SYN_RECV':
          if (hasFlag(packet, 'ACK')) {
            return { nextState: 'ESTABLISHED' };
          }
          break;

        case 'ESTABLISHED':
          if (hasFlag(packet, 'FIN')) {
            return { nextState: 'CLOSE_WAIT', responseType: ['ACK'] };
          }
          break;

        case 'FIN_WAIT_1':
          if (hasFlag(packet, 'FIN') && hasFlag(packet, 'ACK')) {
            return { nextState: 'TIME_WAIT', responseType: ['ACK'] };
          }
          if (hasFlag(packet, 'ACK')) {
            return { nextState: 'FIN_WAIT_2' };
          }
          if (hasFlag(packet, 'FIN')) {
            return { nextState: 'CLOSING', responseType: ['ACK'] };
          }
          break;

        case 'FIN_WAIT_2':
          if (hasFlag(packet, 'FIN')) {
            return { nextState: 'TIME_WAIT', responseType: ['ACK'] };
          }
          break;

        case 'CLOSING':
          if (hasFlag(packet, 'ACK')) {
            return { nextState: 'TIME_WAIT' };
          }
          break;

        case 'LAST_ACK':
          if (hasFlag(packet, 'ACK')) {
            return { nextState: 'CLOSED' };
          }
          break;

        case 'TIME_WAIT':
          // Re-send ACK if peer retransmitted its FIN during TIME_WAIT
          if (hasFlag(packet, 'FIN')) {
            return { nextState: 'TIME_WAIT', responseType: ['ACK'] };
          }
          break;
      }
      break;
    }
  }

  // state remains unchanged if event doesn't match a transition
  return { nextState: currentState };
}