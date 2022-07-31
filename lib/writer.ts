import { Writable } from './bufferable';

export class BufferWriter {
  buffer: Buffer;
  private writeOffset: number;

  constructor() {
    this.buffer = Buffer.alloc(0);
    this.writeOffset = 0;
  }

  write(writable: Writable): this {
    const valueBuffer = (() => {
      switch (writable.type) {
        case 'UInt8': {
          const buffer = Buffer.alloc(1);
          buffer.writeUInt8(writable.value);
          return buffer;
        }
        case 'UInt16LE': {
          const buffer = Buffer.alloc(2);
          buffer.writeUInt16LE(writable.value);
          return buffer;
        }
        case 'UInt32LE': {
          const buffer = Buffer.alloc(4);
          buffer.writeUInt32LE(writable.value);
          return buffer;
        }
        case 'String': {
          return Buffer.from(writable.value, writable.encoding);
        }
        case 'StringNT': {
          return Buffer.from(writable.value + '\0', writable.encoding);
        }
        case 'Buffer': {
          return writable.value;
        }
      }
    })();

    this.buffer = Buffer.concat([
      this.buffer.subarray(0, this.writeOffset),
      valueBuffer,
      this.buffer.subarray(this.writeOffset + valueBuffer.length),
    ]);
    this.writeOffset += valueBuffer.length;

    return this;
  }

  writeMap<T>(
    items: T[],
    mapper: (writer: this, item: T, index: number) => void
  ): this {
    items.forEach((item, index) => {
      mapper(this, item, index);
    });

    return this;
  }

  offset(offset: number, absolute?: boolean): this {
    const absoluteOffset = absolute
      ? offset >= 0
        ? offset
        : this.buffer.length + offset
      : this.writeOffset + offset;

    if (absoluteOffset < 0) {
      this.buffer = Buffer.concat([
        Buffer.alloc(Math.abs(absoluteOffset)),
        this.buffer,
      ]);
      this.writeOffset = 0;
    } else if (absoluteOffset > this.buffer.length) {
      this.buffer = Buffer.concat([
        this.buffer,
        Buffer.alloc(absoluteOffset - this.buffer.length),
      ]);
      this.writeOffset = this.buffer.length;
    } else {
      this.writeOffset = absoluteOffset;
    }

    return this;
  }
}
