import { NetworkChannel } from './NetworkChannel';
import { handleTCPEvent } from './TCPStateMachine';
import type { NodeState, Packet, PacketType, TCPEvent } from './types';

export interface SimulatorSnapshot {
  client: NodeState;
  server: NodeState;
  packets: Packet[];
  tickCount: number;
  logs: string[];
}

export class Simulator {
  private client: NodeState;
  private server: NodeState;
  private channel: NetworkChannel;
  private tickCount: number = 0;
  private logs: string[] = [];

  constructor() {
    this.channel = new NetworkChannel();
    this.client = {
      id: 'client',
      state: 'CLOSED',
      nextSeqNum: 1000,
      expectedSeqNum: 0,
      expectedAckNum: 0,
    };
    this.server = {
      id: 'server',
      state: 'LISTEN',
      nextSeqNum: 5000,
      expectedSeqNum: 0,
      expectedAckNum: 0,
    };
  }

  public getSnapshot(): SimulatorSnapshot {
    return {
      client: { ...this.client },
      server: { ...this.server },
      packets: this.channel.getPackets(),
      tickCount: this.tickCount,
      logs: [...this.logs],
    };
  }

  public log(msg: string): void {
    this.logs.unshift(`[Tick ${this.tickCount}] ${msg}`);
  }

  // Manual: User clicks "Connect" / "Open" on Client
  public appOpenClient(): void {
    this.processEvent('client', { type: 'APP_OPEN' });
  }

  // Manual: User clicks "Close" on Client
  public appCloseClient(): void {
    this.processEvent('client', { type: 'APP_CLOSE' });
  }

  // Manual: User drops an in-flight packet by ID
  public dropPacket(id: string): void {
    this.channel.dropPacketById(id);
    this.log(`Packet ${id} manually dropped by user.`);
  }

  // Discrete Simulation Step (called per interval frame)
  public tick(): SimulatorSnapshot {
    this.tickCount++;

    // 1. Move packets across the channel
    const { delivered } = this.channel.tick(5);

    // 2. Process delivered packets
    delivered.forEach(packet => {
      const targetNodeId = packet.dest;
      this.log(`Node ${targetNodeId.toUpperCase()} received ${packet.type.join('/')} packet (Seq=${packet.seqNum}).`);

      this.processEvent(targetNodeId, {
        type: 'PACKET_RECEIVED',
        packet,
      });
    });

    return this.getSnapshot();
  }

  private processEvent(nodeId: 'client' | 'server', event: TCPEvent): void {
    const node = nodeId === 'client' ? this.client : this.server;
    const transition = handleTCPEvent(node.state, event);

    if (transition.nextState !== node.state) {
      this.log(`Node ${nodeId.toUpperCase()} state changed: ${node.state} ➔ ${transition.nextState}`);
      node.state = transition.nextState;
    }

    // Handle automated response packet creation
    if (transition.responseType && transition.responseType.length > 0) {
      this.sendPacket(nodeId, transition.responseType);
    }
  }

  private sendPacket(from: 'client' | 'server', flags: PacketType[]): void {
    const sender = from === 'client' ? this.client : this.server;
    const dest = from === 'client' ? 'server' : 'client';

    const packet: Packet = {
      id: Math.random().toString(36).substring(2, 8),
      type: flags,
      source: from,
      dest,
      seqNum: sender.nextSeqNum,
      ackNum: sender.expectedSeqNum,
      progress: 0,
      status: 'in-transit',
    };

    // Increment sequence number for SYN / FIN / DATA
    if (flags.includes('SYN') || flags.includes('FIN') || flags.includes('PSH')) {
      sender.nextSeqNum += 1;
    }

    this.channel.addPacket(packet);
    this.log(`Node ${from.toUpperCase()} sent ${flags.join('/')} packet (Seq=${packet.seqNum}) to ${dest.toUpperCase()}.`);
  }
}