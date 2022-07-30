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
      nullTerminated?: boolean;
    };

export type BufferableWithoutValue = DistributiveOmit<Bufferable, 'value'>;

export type BufferableValue<Type extends Bufferable['type']> = Extract<
  Bufferable,
  { type: Type }
>['value'];
