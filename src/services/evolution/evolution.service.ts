import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@utils/prisma/prisma.service';

@Injectable()
export class EvolutionApiService implements OnModuleInit {
  private readonly logger = new Logger(EvolutionApiService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly webhookBase: string;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.baseUrl = this.config.getOrThrow('EVOLUTION_API_URL'); // e.g. http://localhost:8080
    this.apiKey = this.config.getOrThrow('EVOLUTION_API_KEY');
    this.webhookBase = this.config.getOrThrow('APP_WEBHOOK_BASE_URL'); // e.g. https://tusaas.com
  }

  // Al arrancar el servidor reconecta todas las sesiones activas en BD
  async onModuleInit() {
    const sessions = await this.prisma.whatsappSession.findMany({
      where: { status: true },
    });

    for (const s of sessions) {
      this.ensureInstance(s.session_name, s.identification).catch((err) =>
        this.logger.error(`Bootstrap error ${s.session_name}`, err),
      );
    }
  }

  // ─── HTTP helpers ────────────────────────────────────────────────────────────

  private headers() {
    return {
      apikey: this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  private async request<T = any>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: this.headers(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `Evolution API ${method} ${path} → ${res.status}: ${text}`,
      );
    }

    return res.json() as Promise<T>;
  }

  // ─── Instance management ─────────────────────────────────────────────────────
  async ensureInstance(
    session_name: string,
    identification: number,
  ): Promise<void> {
    const webhookUrl = `${this.webhookBase}/messaging/webhook`;

    try {
      await this.request('POST', '/instance/create', {
        instanceName: session_name,
        integration: 'WHATSAPP-BAILEYS',
        webhook: {
          url: webhookUrl,
          byEvents: true,
          base64: true,
          // ✅ Nombres correctos en Evolution v2
          events: ['QRCODE_UPDATED', 'CONNECTION_UPDATE', 'STATUS_INSTANCE'],
        },
      });
      this.logger.log(`Instancia creada: ${session_name}`);
    } catch (err) {
      const alreadyExists =
        err?.message?.toLowerCase().includes('already exist') ||
        err?.message?.toLowerCase().includes('already in use');
      if (!alreadyExists) throw err;
      this.logger.debug(`Instancia ya existe: ${session_name}`);
    }
  }

  // async connectInstance(
  //   session_name: string,
  //   identification: number,
  // ): Promise<void> {
  //   await this.ensureInstance(session_name, identification);

  //   // Logout silencioso para limpiar sesión vieja
  //   try {
  //     await this.request('DELETE', `/instance/logout/${session_name}`);
  //     this.logger.log(`Logout: ${session_name}`);
  //     await new Promise((r) => setTimeout(r, 1000));
  //   } catch {
  //     this.logger.debug(`Sin sesión previa: ${session_name}`);
  //   }

  //   // Actualizar webhook de la instancia existente (por si cambió la URL)
  //   const webhookUrl = `${this.webhookBase}/messaging/webhook`;
  //   try {
  //     await this.request('POST', `/webhook/set/${session_name}`, {
  //       url: webhookUrl,
  //       byEvents: true,
  //       base64: true,
  //       enabled: true,
  //       events: ['QRCODE_UPDATED', 'CONNECTION_UPDATE', 'STATUS_INSTANCE'],
  //     });
  //     this.logger.log(`Webhook actualizado: ${session_name}`);
  //   } catch (err) {
  //     this.logger.warn(`No se pudo actualizar webhook: ${err.message}`);
  //   }

  //   await this.request('GET', `/instance/connect/${session_name}`);
  //   this.logger.log(`Connect disparado: ${session_name}`);
  // }
  // async connectInstance(
  //   session_name: string,
  //   identification: number,
  // ): Promise<void> {
  //   // 1. Borrar instancia completa
  //   try {
  //     await this.request('DELETE', `/instance/delete/${session_name}`);
  //     this.logger.log(`Instancia eliminada: ${session_name}`);
  //     await new Promise((r) => setTimeout(r, 1000));
  //   } catch {
  //     this.logger.debug(`Instancia no existía: ${session_name}`);
  //   }

  //   // 2. Crear instancia fresca con webhook ya configurado
  //   await this.ensureInstance(session_name, identification);

  //   await new Promise((r) => setTimeout(r, 500));

  //   // 3. Conectar
  //   await this.request('GET', `/instance/connect/${session_name}`);
  //   this.logger.log(`Connect disparado: ${session_name}`);
  // }
  async connectInstance(
    session_name: string,
    identification: number,
  ): Promise<void> {
    const webhookUrl = `${this.webhookBase}/messaging/webhook`;

    // 1. Borrar instancia
    try {
      await this.request('DELETE', `/instance/delete/${session_name}`);
      this.logger.log(`Instancia eliminada: ${session_name}`);
      await new Promise((r) => setTimeout(r, 2000)); // ← 2s para que Evolution limpie internamente
    } catch {
      this.logger.debug(`Instancia no existía: ${session_name}`);
    }

    // 2. Crear fresca — directo, sin pasar por ensureInstance
    await this.request('POST', '/instance/create', {
      instanceName: session_name,
      integration: 'WHATSAPP-BAILEYS',
      webhook: {
        url: webhookUrl,
        byEvents: true,
        base64: true,
        events: ['QRCODE_UPDATED', 'CONNECTION_UPDATE', 'STATUS_INSTANCE'],
      },
    });
    this.logger.log(`Instancia creada: ${session_name}`);

    await new Promise((r) => setTimeout(r, 500));

    // 3. Conectar
    await this.request('GET', `/instance/connect/${session_name}`);
    this.logger.log(`Connect disparado: ${session_name}`);
  }
  /**
   * Envía un mensaje de texto.
   */
  async sendText(
    session_name: string,
    to: string,
    message: string,
  ): Promise<any> {
    // Evolution espera número sin símbolos, con código de país
    const number = to.replace(/\D/g, '');

    return this.request('POST', `/message/sendText/${session_name}`, {
      number,
      text: message,
    });
  }

  /**
   * Obtiene el estado actual de la instancia directamente desde Evolution API.
   */
  async fetchInstanceState(session_name: string): Promise<string | null> {
    try {
      const data = await this.request<any>(
        'GET',
        `/instance/fetchInstances?instanceName=${session_name}`,
      );
      return data?.[0]?.instance?.state ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Elimina la instancia (logout completo).
   */
  async deleteInstance(session_name: string): Promise<void> {
    await this.request('DELETE', `/instance/delete/${session_name}`);
  }
}
