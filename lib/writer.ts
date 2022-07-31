import { Writable } from './bufferable';

export class BufferWriter {
  private _buffer: Buffer;
  private _offset: number;

  constructor() {
    this._buffer = Buffer.alloc(0);
    this._offset = 0;
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

    this._buffer = Buffer.concat([
      this._buffer.subarray(0, this._offset),
      valueBuffer,
      this._buffer.subarray(this._offset + valueBuffer.length),
    ]);
    this._offset += valueBuffer.length;

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
    offset = absolute
      ? offset >= 0
        ? offset
        : this._buffer.length + offset
      : this._offset + offset;

    if (offset < 0) {
      this._buffer = Buffer.concat([
        Buffer.alloc(Math.abs(offset)),
        this._buffer,
      ]);
      this._offset = 0;
    } else if (offset > this._buffer.length) {
      this._buffer = Buffer.concat([
        this._buffer,
        Buffer.alloc(offset - this._buffer.length),
      ]);
      this._offset = this._buffer.length;
    } else {
      this._offset = offset;
    }

    return this;
  }

  buffer(): Buffer {
    return Buffer.concat([this._buffer]);
  }
}
