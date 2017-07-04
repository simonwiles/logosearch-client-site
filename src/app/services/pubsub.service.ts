import { Emitter }                    from '../utils/emitter';

export class PubSubService {
  public emitter: Emitter;

  constructor() {
    this.emitter = new Emitter();
  }

  public error(summary: string, detail: string) {
    this.emitter.emit(
      'message', {
        severity: 'error',
        summary: summary,
        detail: detail
      }
    );
  }

  public info(summary: string, detail: string) {
    this.emitter.emit(
      'message', {
        severity: 'info',
        summary: summary,
        detail: detail
      }
    );
  }

  public warn(summary: string, detail: string) {
    this.emitter.emit(
      'message', {
        severity: 'warn',
        summary: summary,
        detail: detail
      }
    );
  }

}
