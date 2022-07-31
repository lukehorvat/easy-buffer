import { DistributiveOmit } from './util';

/**
 * An object literal representing a value to be read from or written to a buffer.
 *
 * The structure of the object differs depending on what the `type` property has
 * been set to.
 */
export type Bufferable =
  | {
      type: 'Int8';
      value: number;
    }
  | {
      type: 'UInt8';
      value: number;
    }
  | {
      type: 'Int16LE';
      value: number;
    }
  | {
      type: 'UInt16LE';
      value: number;
    }
  | {
      type: 'Int16BE';
      value: number;
    }
  | {
      type: 'UInt16BE';
      value: number;
    }
  | {
      type: 'Int32LE';
      value: number;
    }
  | {
      type: 'UInt32LE';
      value: number;
    }
  | {
      type: 'Int32BE';
      value: number;
    }
  | {
      type: 'UInt32BE';
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

/**
 * An object literal representing a value to be written to a buffer. Essentially,
 * a `Bufferable` without a `length` property.
 */
export type Writable = DistributiveOmit<Bufferable, 'length'>;

/**
 * An object literal representing a value to be read from a buffer. Essentially,
 * a `Bufferable` without a `value` property.
 */
export type Readable = DistributiveOmit<Bufferable, 'value'>;

export type ReadableValue<Type extends Bufferable['type']> = Extract<
  Bufferable,
  { type: Type }
>['value'];
