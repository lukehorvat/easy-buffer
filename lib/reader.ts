import { Readable, ReadableValue } from './bufferable';

/**
 * A class that facilitates easy reading of buffers.
 */
export class BufferReader {
  private _buffer: Buffer;
  private _offset: number;

  /**
   * Create a new `BufferReader` instance from the specified `buffer`.
   *
   * The current read offset will automatically default to 0 (i.e. the
   * position of the first byte in the buffer).
   */
  constructor(buffer: Buffer) {
    this._buffer = buffer;
    this._offset = 0;
  }

  /**
   * Read a value from the buffer at the current read offset, with the format
   * of the value being determined by the specified `readable` configuration.
   *
   * The current read offset will be auto-incremented by the byte length of the
   * value that was read.
   */
  read<R extends Readable, Type extends R['type']>(
    readable: R
  ): ReadableValue<Type> {
    const { value, length } = (() => {
      switch (readable.type) {
        case 'Int8': {
          const length = 1;
          if (length > this.bufferRemaining().length) {
            throw new Error('Length out of bounds.');
          }

          return {
            value: this.bufferRemaining().readInt8(),
            length,
          };
        }
        case 'UInt8': {
          const length = 1;
          if (length > this.bufferRemaining().length) {
            throw new Error('Length out of bounds.');
          }

          return {
            value: this.bufferRemaining().readUInt8(),
            length,
          };
        }
        case 'Int16LE': {
          const length = 2;
          if (length > this.bufferRemaining().length) {
            throw new Error('Length out of bounds.');
          }

          return {
            value: this.bufferRemaining().readInt16LE(),
            length,
          };
        }
        case 'UInt16LE': {
          const length = 2;
          if (length > this.bufferRemaining().length) {
            throw new Error('Length out of bounds.');
          }

          return {
            value: this.bufferRemaining().readUInt16LE(),
            length,
          };
        }
        case 'Int16BE': {
          const length = 2;
          if (length > this.bufferRemaining().length) {
            throw new Error('Length out of bounds.');
          }

          return {
            value: this.bufferRemaining().readInt16BE(),
            length,
          };
        }
        case 'UInt16BE': {
          const length = 2;
          if (length > this.bufferRemaining().length) {
            throw new Error('Length out of bounds.');
          }

          return {
            value: this.bufferRemaining().readUInt16BE(),
            length,
          };
        }
        case 'Int32LE': {
          const length = 4;
          if (length > this.bufferRemaining().length) {
            throw new Error('Length out of bounds.');
          }

          return {
            value: this.bufferRemaining().readInt32LE(),
            length,
          };
        }
        case 'UInt32LE': {
          const length = 4;
          if (length > this.bufferRemaining().length) {
            throw new Error('Length out of bounds.');
          }

          return {
            value: this.bufferRemaining().readUInt32LE(),
            length,
          };
        }
        case 'Int32BE': {
          const length = 4;
          if (length > this.bufferRemaining().length) {
            throw new Error('Length out of bounds.');
          }

          return {
            value: this.bufferRemaining().readInt32BE(),
            length,
          };
        }
        case 'UInt32BE': {
          const length = 4;
          if (length > this.bufferRemaining().length) {
            throw new Error('Length out of bounds.');
          }

          return {
            value: this.bufferRemaining().readUInt32BE(),
            length,
          };
        }
        case 'FloatLE': {
          const length = 4;
          if (length > this.bufferRemaining().length) {
            throw new Error('Length out of bounds.');
          }

          return {
            value: this.bufferRemaining().readFloatLE(),
            length,
          };
        }
        case 'FloatBE': {
          const length = 4;
          if (length > this.bufferRemaining().length) {
            throw new Error('Length out of bounds.');
          }

          return {
            value: this.bufferRemaining().readFloatBE(),
            length,
          };
        }
        case 'DoubleLE': {
          const length = 8;
          if (length > this.bufferRemaining().length) {
            throw new Error('Length out of bounds.');
          }

          return {
            value: this.bufferRemaining().readDoubleLE(),
            length,
          };
        }
        case 'DoubleBE': {
          const length = 8;
          if (length > this.bufferRemaining().length) {
            throw new Error('Length out of bounds.');
          }

          return {
            value: this.bufferRemaining().readDoubleBE(),
            length,
          };
        }
        case 'String': {
          if ((readable.length ?? 0) > this.bufferRemaining().length) {
            throw new Error('Length out of bounds.');
          }

          return {
            value: this.bufferRemaining()
              .subarray(0, readable.length)
              .toString(readable.encoding),
            length: readable.length ?? this.bufferRemaining().length,
          };
        }
        case 'StringNT': {
          let length = 0;

          while (length < this.bufferRemaining().length) {
            if (this.bufferRemaining()[length] === 0x00) {
              return {
                value: this.bufferRemaining()
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
          if ((readable.length ?? 0) > this.bufferRemaining().length) {
            throw new Error('Length out of bounds.');
          }

          return {
            value: this.bufferRemaining().subarray(0, readable.length),
            length: readable.length ?? this.bufferRemaining().length,
          };
        }
      }
    })();

    this._offset += length;

    return value as ReadableValue<Type>;
  }

  /**
   * Read multiple values from the buffer, starting at the current read offset.
   *
   * The specified `callbackFn` function will be called continuously until the
   * end of the buffer is reached. Therefore, please ensure that it reads one
   * or more values from the buffer to avoid it being called infinitely. The
   * function can return a value of your choosing.
   *
   * Returns all of the return values of `callbackFn` as an array.
   */
  readArray<T>(callbackFn: (reader: this, index: number) => T): T[] {
    const items = [];
    let index = 0;
    while (this.bufferRemaining().length > 0) {
      items.push(callbackFn(this, index++));
    }
    return items;
  }

  /**
   * Increment/decrement the current read offset by the relative amount specified
   * by `offset`. If `absolute` is `true`, `offset` will be treated as an exact
   * byte position (i.e. not relative).
   *
   * If the specified `offset` extends beyond the bounds of the buffer (either
   * the start or the end), an error will be thrown.
   *
   * Returns the `BufferReader` instance so you can chain further calls.
   */
  offset(offset: number, absolute?: boolean): this {
    offset = absolute
      ? offset >= 0
        ? offset
        : this._buffer.length + offset
      : this._offset + offset;

    if (offset < 0 || offset > this._buffer.length) {
      throw new Error('Offset out of bounds.');
    }

    this._offset = offset;
    return this;
  }

  /**
   * Get the remaining portion of the buffer that hasn't been read yet (i.e.
   * beyond the current read offset).
   */
  bufferRemaining(): Buffer {
    return Buffer.concat([this._buffer.subarray(this._offset)]);
  }
}
