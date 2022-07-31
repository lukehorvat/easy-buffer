# easy-buffer [![npm version](http://img.shields.io/npm/v/easy-buffer.svg?style=flat-square)](https://www.npmjs.org/package/easy-buffer) [![build status](https://img.shields.io/github/workflow/status/lukehorvat/easy-buffer/Build?style=flat-square)](https://github.com/lukehorvat/easy-buffer/actions/workflows/build.yml)

Easily read and write Node.js buffers. TypeScript and JavaScript supported!

Yes, yet another [Buffer](https://nodejs.org/api/buffer.html) wrapper library. Unique selling points of this one compared to other libraries I've seen:

- All reads go through a single `read` method (i.e. no `readInt8`, `readUInt32LE`, etc) and all writes through a single `write` method.
- When reading, portions of the buffer can be skipped via an `offset` method and then followed up with a chained `read` call.
- When writing, portions of the buffer can be automatically zero-padded via an `offset` method.

## Installation

Install the package via npm:

```sh
$ npm install easy-buffer
```

## Usage

A quick example:

```js
import { BufferReader, BufferWriter } from 'easy-buffer';

const writer = new BufferWriter();
const buffer = writer
  .write({ type: 'UInt32LE', value: 37 })
  .write({ type: 'StringNT', value: 'easy', encoding: 'ascii' })
  .offset(5)
  .write({ type: 'Buffer', value: Buffer.from([0x01, 0x02, 0x03]) })
  .buffer();

const reader = new BufferReader(buffer);
const a = reader.read({ type: 'UInt32LE' });
const b = reader.read({ type: 'StringNT', encoding: 'ascii' });
const c = reader.offset(5).read({ type: 'Buffer', length: 3 });

console.log(a, b, c); // = 37 'easy' <Buffer 01 02 03>
```

See the [API section](#api) below for more.

## API

### BufferReader

A class that facilitates easy reading of buffers.

#### constructor(buffer: [Buffer](https://nodejs.org/api/buffer.html)): [BufferReader](#bufferreader)

Create a new `BufferReader` instance from the specified `buffer`.

The current read offset will automatically default to 0 (i.e. the position of the first byte in the buffer).

Example:

```js
const reader = new BufferReader(buffer);
```

#### read(readable: [Readable](#readable)): number | string | [Buffer](https://nodejs.org/api/buffer.html)

Read a value from the buffer at the current read offset, with the format of the value being determined by the specified `readable` configuration.

The current read offset will be auto-incremented by the byte length of the value that was read.

Example:

```js
const a = reader.read({ type: 'UInt16LE' });
const b = reader.read({ type: 'StringNT', encoding: 'ascii' });
const c = reader.read({ type: 'Buffer', length: 3 });
```

#### offset(offset: number, absolute?: boolean): [BufferReader](#bufferreader)

Increment/decrement the current read offset by the relative amount specified by `offset`. If `absolute` is `true`, `offset` will be treated as an exact byte position (i.e. not relative).

If the specified `offset` extends beyond the bounds of the buffer (either the start or the end), an error will be thrown.

Returns the `BufferReader` instance so you can chain further calls.

Example:

```js
// move 2 bytes ahead and read
const a = reader.offset(2).read({ type: 'Int32BE' });

// move 2 bytes back and read
const b = reader.offset(-2).read({ type: 'String' });

// move directly to byte 3 and read
const c = reader.offset(3, true).read({ type: 'Buffer' });

// move directly to the last byte (i.e. buffer.length - 1) and read
const d = reader.offset(-1, true).read({ type: 'UInt8' });
```

#### bufferRemaining(): [Buffer](https://nodejs.org/api/buffer.html)

Get the remaining portion of the buffer that hasn't been read yet (i.e. beyond the current read offset).

### BufferWriter

A class that facilitates easy writing of buffers.

#### constructor(): [BufferWriter](#bufferwriter)

Create a new `BufferWriter` instance.

The current write offset will automatically default to 0, since no data has been written to the buffer yet.

Example:

```js
const writer = new BufferWriter();
```

#### write(writable: [Writable](#writable)): [BufferWriter](#bufferwriter)

Write a value to the buffer at the current write offset, with the format of the value being determined by the specified `writable` configuration.

The current write offset will be auto-incremented by the byte length of the value that was written.

Returns the `BufferWriter` instance so you can chain further calls.

Example:

```js
writer.write({ type: 'Int16BE', value: -45 });
writer.write({ type: 'StringNT', value: 'hello', encoding: 'base64' });
writer.write({ type: 'Buffer', value: Buffer.from([0x01, 0x02, 0x03]) });
writer.write({ type: 'Int8', value: 7 }).write({ type: 'String', value: 'hi' });
```

#### offset(offset: number, absolute?: boolean): [BufferWriter](#bufferwriter)

Increment/decrement the current write offset by the relative amount specified by `offset`. If `absolute` is `true`, `offset` will be treated as an exact byte position (i.e. not relative).

If the specified `offset` extends beyond the current bounds of the buffer (either the start or the end), the buffer will be automatically zero-padded from the boundary of the buffer to the new offset. This is by design, but might not be to everyone's taste, so **be careful**!

Returns the `BufferWriter` instance so you can chain further calls.

Example:

```js
// move 2 bytes ahead and write
writer.offset(2).write({ type: 'UInt32LE', value: 123 });

// move 2 bytes back and write
writer.offset(-2).write({ type: 'StringNT', value: 'cool', encoding: 'hex' });

// move directly to byte 3 and write
writer.offset(3, true).write({ type: 'Buffer', value: Buffer.from([0x01]) });

// move directly to the last byte (i.e. buffer.length - 1) and write
writer.offset(-1, true).write({ type: 'UInt16BE' });
```

#### buffer(): [Buffer](https://nodejs.org/api/buffer.html)

Get the buffer that has been written so far.

### Readable

An object literal representing a value to be read from a buffer. Essentially, a [Bufferable](#bufferable) without a `value` property.

### Writable

An object literal representing a value to be written to a buffer. Essentially, a [Bufferable](#bufferable) without a `length` property.

### Bufferable

An object literal representing a value to be read from or written to a buffer.

The structure of the object differs depending on what the `type` property has been set to.

#### { type: 'Int8', value: number }

A signed 8-bit integer.

#### { type: 'UInt8', value: number }

An unsigned 8-bit integer.

#### { type: 'Int16LE', value: number }

A signed, little-endian 16-bit integer.

#### { type: 'UInt16LE', value: number }

An unsigned, little-endian 16-bit integer.

#### { type: 'Int16BE', value: number }

A signed, big-endian 16-bit integer.

#### { type: 'UInt16BE', value: number }

An unsigned, big-endian 16-bit integer.

#### { type: 'Int32LE', value: number }

A signed, little-endian 32-bit integer.

#### { type: 'UInt32LE', value: number }

An unsigned, little-endian 32-bit integer.

#### { type: 'Int32BE', value: number }

A signed, big-endian 32-bit integer.

#### { type: 'UInt32BE', value: number }

An unsigned, big-endian 32-bit integer.

#### { type: 'String', value: string, encoding?: [BufferEncoding](https://nodejs.org/api/buffer.html#buffers-and-character-encodings), length?: number }

A string.

#### { type: 'StringNT', value: string, encoding?: [BufferEncoding](https://nodejs.org/api/buffer.html#buffers-and-character-encodings) }

A [null-terminated](https://en.wikipedia.org/wiki/Null-terminated_string) string.

#### { type: 'Buffer', value: [Buffer](https://nodejs.org/api/buffer.html), length?: number }

A buffer.
