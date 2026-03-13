import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionManager {
  private clients = new Map<string, any>();

  has(session: string) {
    return this.clients.has(session);
  }

  get(session: string) {
    return this.clients.get(session);
  }

  set(session: string, client: any) {
    this.clients.set(session, client);
  }

  remove(session: string) {
    let r = this.clients.delete(session);
    console.log('ELIMINANDO SESSION: ', r);
  }

  getAll() {
    return this.clients;
  }
}
