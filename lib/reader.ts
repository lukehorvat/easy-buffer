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
    const { value, bytesRead } = (() => {
      switch (readable.type) {
        case 'UInt8': {
          return {
            value: this.remainingBuffer.readUInt8(),
            bytesRead: 1,
          };
        }
        case 'UInt16LE': {
          return {
            value: this.remainingBuffer.readUInt16LE(),
            bytesRead: 2,
          };
        }
        case 'UInt32LE': {
          return {
            value: this.remainingBuffer.readUInt32LE(),
            bytesRead: 4,
          };
        }
        case 'String': {
          return {
            value: this.remainingBuffer
              .subarray(0, readable.length)
              .toString(readable.encoding),
            bytesRead: readable.length ?? this.remainingBuffer.length,
          };
        }
        case 'StringNT': {
          let bytesRead = 0;

          while (bytesRead < this.remainingBuffer.length) {
            if (this.remainingBuffer[bytesRead] === 0x00) {
              return {
                value: this.remainingBuffer
                  .subarray(0, bytesRead)
                  .toString(readable.encoding),
                bytesRead: ++bytesRead,
              };
            }
            bytesRead++;
          }

          throw new Error('Null-terminator not found.');
        }
        case 'Buffer': {
          return {
            value: this.remainingBuffer.subarray(0, readable.length),
            bytesRead: readable.length ?? this.remainingBuffer.length,
          };
        }
      }
    })();

    this.readOffset += bytesRead;

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
