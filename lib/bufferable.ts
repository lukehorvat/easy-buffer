import { DistributiveOmit } from './util';

export type Bufferable =
  | {
      type: 'UInt8';
      value: number;
    }
  | {
      type: 'UInt16LE';
      value: number;
    }
  | {
      type: 'UInt32LE';
      value: number;
    }
  | {
      type: 'String';
      value: string;
      encoding?: BufferEncoding;
      length?: number;
    }
  | {
      type: 'StringNT';
      value: string;
      encoding?: BufferEncoding;
    }
  | {
      type: 'Buffer';
      value: Buffer;
      length?: number;
    };

export type Writable = DistributiveOmit<Bufferable, 'length'>;
export type Readable = DistributiveOmit<Bufferable, 'value'>;
export type ReadableValue<Type extends Bufferable['type']> = Extract<
  Bufferable,
  { type: Type }
>['value'];
