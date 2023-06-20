import { Writable } from './bufferable';

/**
 * A class that facilitates easy writing of buffers.
 */
export class BufferWriter {
  private _buffer: Buffer;
  private _offset: number;

  /**
   * Create a new `BufferWriter` instance.
   *
   * The current write offset will automatically default to 0, since no data
   * has been written to the buffer yet.
   */
  constructor() {
    this._buffer = Buffer.alloc(0);
    this._offset = 0;
  }

  /**
   * Write a value to the buffer at the current write offset, with the format
   * of the value being determined by the specified `writable` configuration.
   *
   * The current write offset will be auto-incremented by the byte length of
   * the value that was written.
   *
   * Returns the `BufferWriter` instance so you can chain further calls.
   */
  write(writable: Writable): this {
    const valueBuffer = (() => {
      switch (writable.type) {
        case 'Int8': {
          const buffer = Buffer.alloc(1);
          buffer.writeInt8(writable.value);
          return buffer;
        }
        case 'UInt8': {
          const buffer = Buffer.alloc(1);
          buffer.writeUInt8(writable.value);
          return buffer;
        }
        case 'Int16LE': {
          const buffer = Buffer.alloc(2);
          buffer.writeInt16LE(writable.value);
          return buffer;
        }
        case 'UInt16LE': {
          const buffer = Buffer.alloc(2);
          buffer.writeUInt16LE(writable.value);
          return buffer;
        }
        case 'Int16BE': {
          const buffer = Buffer.alloc(2);
          buffer.writeInt16BE(writable.value);
          return buffer;
        }
        case 'UInt16BE': {
          const buffer = Buffer.alloc(2);
          buffer.writeUInt16BE(writable.value);
          return buffer;
        }
        case 'Int32LE': {
          const buffer = Buffer.alloc(4);
          buffer.writeInt32LE(writable.value);
          return buffer;
        }
        case 'UInt32LE': {
          const buffer = Buffer.alloc(4);
          buffer.writeUInt32LE(writable.value);
          return buffer;
        }
        case 'Int32BE': {
          const buffer = Buffer.alloc(4);
          buffer.writeInt32BE(writable.value);
          return buffer;
        }
        case 'UInt32BE': {
          const buffer = Buffer.alloc(4);
          buffer.writeUInt32BE(writable.value);
          return buffer;
        }
        case 'FloatLE': {
          const buffer = Buffer.alloc(4);
          buffer.writeFloatLE(writable.value);
          return buffer;
        }
        case 'FloatBE': {
          const buffer = Buffer.alloc(4);
          buffer.writeFloatBE(writable.value);
          return buffer;
        }
        case 'DoubleLE': {
          const buffer = Buffer.alloc(8);
          buffer.writeDoubleLE(writable.value);
          return buffer;
        }
        case 'DoubleBE': {
          const buffer = Buffer.alloc(8);
          buffer.writeDoubleBE(writable.value);
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

  /**
   * Write multiple values to the buffer, starting at the current write offset.
   *
   * The specified `callbackFn` function will be called for each item in `array`,
   * allowing you to write items to the buffer sequentially.
   *
   * Returns the `BufferWriter` instance so you can chain further calls.
   */
  writeArray<T>(
    array: T[],
    callbackFn: (writer: this, item: T, index: number) => void
  ): this {
    array.forEach((item, index) => callbackFn(this, item, index));
    return this;
  }

  /**
   * Increment/decrement the current write offset by the relative amount
   * specified by `offset`. If `absolute` is `true`, `offset` will be treated
   * as an exact byte position (i.e. not relative).
   *
   * If the specified `offset` extends beyond the current bounds of the buffer
   * (either the start or the end), the buffer will be automatically zero-padded
   * from the boundary of the buffer to the new offset. This is by design, but
   * might not be to everyone's taste, so **be careful**!
   *
   * Returns the `BufferWriter` instance so you can chain further calls.
   */
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

  /**
   * Get the buffer that has been written so far.
   */
  buffer(): Buffer {
    return Buffer.concat([this._buffer]);
  }
}
