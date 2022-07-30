import { BufferableWithoutValue, BufferableValue } from './bufferable';

export class BufferReader {
  private buffer: Buffer;
  private readOffset: number;

  constructor(buffer: Buffer) {
    this.buffer = buffer;
    this.readOffset = 0;
  }

  read<B extends BufferableWithoutValue, Type extends B['type']>(
    bufferable: B
  ): BufferableValue<Type> {
    const { value, bytesRead } = (() => {
      switch (bufferable.type) {
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
          if (bufferable.nullTerminated) {
            let bytesRead = 0;

            while (bytesRead < this.remainingBuffer.length) {
              if (this.remainingBuffer[bytesRead] === 0x00) {
                return {
                  value: this.remainingBuffer
                    .slice(0, bytesRead)
                    .toString(bufferable.encoding),
                  bytesRead: ++bytesRead,
                };
              }
              bytesRead++;
            }

            throw new Error('Null-terminator not found.');
          } else {
            return {
              value: this.remainingBuffer.toString(bufferable.encoding),
              bytesRead: this.remainingBuffer.length,
            };
          }
        }
      }
    })();

    this.readOffset += bytesRead;

    return value as BufferableValue<Type>;
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
    this.readOffset = absolute ? offset : this.readOffset + offset;
    return this;
  }

  get remainingBuffer() {
    return this.buffer.subarray(this.readOffset);
  }
}
