import { QueryEncoder } from '@angular/http';

// note: URLSearchParams won't encode "+", ":", but the django backend will 'decode' them, so...
export class DjangoQueryEncoder extends QueryEncoder {
  encodeKey(k: string): string {
    return super.encodeKey(k);
  }
  encodeValue(v: string): string {
    return super.encodeValue(v).replace(/\+/g, '%2B').replace(/:/g, '%3A');
  }
}
