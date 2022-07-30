import { Bufferable } from './bufferable';

export class BufferWriter {
  buffer: Buffer;
  private writeOffset: number;

  constructor() {
    this.buffer = Buffer.alloc(0);
    this.writeOffset = 0;
  }

  write(bufferable: Bufferable): this {
    const valueBuffer = (() => {
      switch (bufferable.type) {
        case 'UInt8': {
          const buffer = Buffer.alloc(1);
          buffer.writeUInt8(bufferable.value);
          return buffer;
        }
        case 'UInt16LE': {
          const buffer = Buffer.alloc(2);
          buffer.writeUInt16LE(bufferable.value);
          return buffer;
        }
        case 'UInt32LE': {
          const buffer = Buffer.alloc(4);
          buffer.writeUInt32LE(bufferable.value);
          return buffer;
        }
        case 'String': {
          return Buffer.from(
            bufferable.value + (bufferable.nullTerminated ? '\0' : ''),
            bufferable.encoding
          );
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
    this.writeOffset = absolute ? offset : this.writeOffset + offset;

    // TODO: what to do if < 0?
    if (this.writeOffset > this.buffer.length)
      this.buffer = Buffer.concat([
        this.buffer,
        Buffer.alloc(this.writeOffset - this.buffer.length),
      ]);

    return this;
  }
}
