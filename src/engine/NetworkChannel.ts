import type { Packet } from './types';

export class NetworkChannel {
    private packets: Packet[] = [];

    public getPackets(): Packet[] {
        return [...this.packets];
    }

    public addPacket(packet: Packet): void {
        this.packets.push(packet);
    }

    // Intercept and drop an in-transit packet by ID
    public dropPacketById(id: string): void {
        const packet = this.packets.find(p => p.id === id);
        if (packet && packet.status === 'in-transit') {
            // checking that this is a valid pkt to drop
            packet.status = 'dropped';
        }
    }

    // Advance packet positions by a specific increment percent 
    public tick(stepPercentage: number = 5): { delivered: Packet[]; droppedExpired: Packet[] } {
    const delivered: Packet[] = [];
    const droppedExpired: Packet[] = [];

    this.packets.forEach(packet => {
      if (packet.status === 'in-transit') {
        packet.progress += stepPercentage;

        if (packet.progress >= 100) {
          packet.progress = 100;
          packet.status = 'delivered';
          delivered.push(packet);
        }
      }
    });

    // Remove delivered packets and dropped packets that completed their visual fade out
    this.packets = this.packets.filter(packet => {
      if (packet.status === 'delivered') return false;
      if (packet.status === 'dropped') {
        droppedExpired.push(packet);
        return false;
      }
      return true;
    });

    return { delivered, droppedExpired };
  }

  public clear(): void {
    this.packets = [];
  }
}