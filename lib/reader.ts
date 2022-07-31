import { Readable, ReadableValue } from './bufferable';

export class BufferReader {
  private _buffer: Buffer;
  private _offset: number;

  constructor(buffer: Buffer) {
    this._buffer = buffer;
    this._offset = 0;
  }

  read<R extends Readable, Type extends R['type']>(
    readable: R
  ): ReadableValue<Type> {
    const { value, length } = (() => {
      switch (readable.type) {
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

  readMap<T>(mapper: (reader: this, index: number) => T): T[] {
    const items = [];
    let index = 0;
    while (this.bufferRemaining().length > 0) {
      items.push(mapper(this, index++));
    }
    return items;
  }

  offset(offset: number, absolute?: boolean): this {
    offset = absolute
      ? offset >= 0
        ? offset
        : this._buffer.length + offset
      : this._offset + offset;

    if (offset < 0 || offset >= this._buffer.length) {
      throw new Error('Offset out of bounds.');
    }

    this._offset = offset;
    return this;
  }

  bufferRemaining(): Buffer {
    return Buffer.concat([this._buffer.subarray(this._offset)]);
  }
}
