import { Readable, ReadableValue } from './bufferable';

export class BufferReader {
  private buffer: Buffer;
  private readOffset: number;

  constructor(buffer: Buffer) {
    this.buffer = buffer;
    this.readOffset = 0;
  }

  read<R extends Readable, Type extends R['type']>(
    readable: R
  ): ReadableValue<Type> {
    const { value, length } = (() => {
      switch (readable.type) {
        case 'UInt8': {
          const length = 1;
          if (length > this.remainingBuffer.length) {
            throw new Error('Length out of bounds.');
          }

          return {
            value: this.remainingBuffer.readUInt8(),
            length,
          };
        }
        case 'UInt16LE': {
          const length = 2;
          if (length > this.remainingBuffer.length) {
            throw new Error('Length out of bounds.');
          }

          return {
            value: this.remainingBuffer.readUInt16LE(),
            length,
          };
        }
        case 'UInt32LE': {
          const length = 4;
          if (length > this.remainingBuffer.length) {
            throw new Error('Length out of bounds.');
          }

          return {
            value: this.remainingBuffer.readUInt32LE(),
            length,
          };
        }
        case 'String': {
          if ((readable.length ?? 0) > this.remainingBuffer.length) {
            throw new Error('Length out of bounds.');
          }

          return {
            value: this.remainingBuffer
              .subarray(0, readable.length)
              .toString(readable.encoding),
            length: readable.length ?? this.remainingBuffer.length,
          };
        }
        case 'StringNT': {
          let length = 0;

          while (length < this.remainingBuffer.length) {
            if (this.remainingBuffer[length] === 0x00) {
              return {
                value: this.remainingBuffer
                  .subarray(0, length)
                  .toString(readable.encoding),
                length: ++length,
              };
            }
            length++;
          }

          throw new Error('Length out of bounds (null-terminator not found).');
        }
        case 'Buffer': {
          if ((readable.length ?? 0) > this.remainingBuffer.length) {
            throw new Error('Length out of bounds.');
          }

          return {
            value: this.remainingBuffer.subarray(0, readable.length),
            length: readable.length ?? this.remainingBuffer.length,
          };
        }
      }
    })();

    this.readOffset += length;

    return value as ReadableValue<Type>;
  }

  readMap<T>(mapper: (reader: this, index: number) => T): T[] {
    const items = [];
    let index = 0;
    while (this.remainingBuffer.length > 0) {
      items.push(mapper(this, index++));
    }
    return items;
  }

  offset(offset: number, absolute?: boolean): this {
    const absoluteOffset = absolute
      ? offset >= 0
        ? offset
        : this.buffer.length + offset
      : this.readOffset + offset;

    if (absoluteOffset < 0 || absoluteOffset >= this.buffer.length) {
      throw new Error('Offset out of bounds.');
    }

    this.readOffset = absoluteOffset;
    return this;
  }

  get remainingBuffer() {
    return this.buffer.subarray(this.readOffset);
  }
}
