import { BufferReader, BufferWriter } from '../lib';

describe('BufferReader', () => {
  test('read / write', () => {
    const writer = new BufferWriter();
    expect(writer.buffer.length).toBe(0);
    writer.write({ type: 'UInt8', value: 13 });
    expect(writer.buffer.length).toBe(1);
    writer.write({ type: 'UInt16LE', value: 215 });
    expect(writer.buffer.length).toBe(3);
    writer.write({ type: 'UInt32LE', value: 1782 });
    expect(writer.buffer.length).toBe(7);
    writer.write({ type: 'Buffer', value: Buffer.from([0x01, 0x02, 0x03]) });
    expect(writer.buffer.length).toBe(10);
    writer.write({ type: 'StringNT', value: 'hello' });
    expect(writer.buffer.length).toBe(16);
    writer.write({ type: 'String', value: 'world' });
    expect(writer.buffer.length).toBe(21);

    const reader = new BufferReader(writer.buffer);
    expect(reader.remainingBuffer.length).toBe(21);
    expect(reader.read({ type: 'UInt8' })).toBe(13);
    expect(reader.remainingBuffer.length).toBe(20);
    expect(reader.read({ type: 'UInt16LE' })).toBe(215);
    expect(reader.remainingBuffer.length).toBe(18);
    expect(reader.read({ type: 'UInt32LE' })).toBe(1782);
    expect(reader.remainingBuffer.length).toBe(14);
    expect(reader.read({ type: 'Buffer', length: 3 })).toEqual(
      Buffer.from([0x01, 0x02, 0x03])
    );
    expect(reader.remainingBuffer.length).toBe(11);
    expect(reader.read({ type: 'StringNT' })).toBe('hello');
    expect(reader.remainingBuffer.length).toBe(5);
    expect(reader.read({ type: 'String', length: 2 })).toBe('wo');
    expect(reader.remainingBuffer.length).toBe(3);
    expect(reader.read({ type: 'String' })).toBe('rld');
    expect(reader.remainingBuffer.length).toBe(0);
  });

  test('read offset', () => {
    const buffer = new BufferWriter().write({
      type: 'String',
      value: 'abcdefghijklmnopqrstuvwxyz',
    }).buffer;
    const reader = new BufferReader(buffer);
    expect(reader.remainingBuffer.length).toBe(26);
    reader.offset(10);
    expect(reader.remainingBuffer.length).toBe(16);
    reader.offset(5);
    expect(reader.remainingBuffer.length).toBe(11);
    reader.offset(-2);
    expect(reader.remainingBuffer.length).toBe(13);
    reader.offset(6, true);
    expect(reader.remainingBuffer.length).toBe(20);
    reader.offset(0);
    expect(reader.remainingBuffer.length).toBe(20);
    reader.offset(0, true);
    expect(reader.remainingBuffer.length).toBe(26);
    reader.offset(-2, true);
    expect(reader.remainingBuffer.length).toBe(2);

    expect(() => reader.offset(-100)).toThrowError('Offset out of bounds.');
    expect(() => reader.offset(-100, true)).toThrowError(
      'Offset out of bounds.'
    );
    expect(() => reader.offset(100)).toThrowError('Offset out of bounds.');
    expect(() => reader.offset(100, true)).toThrowError(
      'Offset out of bounds.'
    );
  });

  test('write offset', () => {
    const writer = new BufferWriter(); // offset = 0
    writer.write({ type: 'StringNT', value: 'cool' }); // offset = 5
    writer.offset(5); // offset = 10
    writer.write({ type: 'UInt8', value: 18 }); // offset = 11
    writer.offset(2); // offset = 13
    writer.offset(-5); // offset = 8
    writer.write({ type: 'UInt8', value: 56 }); // offset = 9
    writer.offset(6, true); // offset = 6
    writer.write({ type: 'UInt8', value: 9 }); // offset = 7
    writer.offset(0); // offset = 7
    writer.write({ type: 'UInt8', value: 40 }); // offset = 8
    writer.offset(0, true); // offset = 0
    writer.write({ type: 'UInt8', value: 35 }); // offset = 1
    writer.offset(-1, true); // offset = 12
    writer.write({ type: 'UInt8', value: 88 }); // offset = 13
    writer.offset(-20, true); // offset = 0
    writer.write({ type: 'UInt16LE', value: 123 }); // offset = 1
    writer.offset(2); // offset = 3
    writer.write({ type: 'UInt16LE', value: 321 }); // offset = 5
    expect(writer.buffer.length).toBe(20);

    const reader = new BufferReader(writer.buffer);
    expect(reader.read({ type: 'UInt16LE' })).toBe(123);
    expect(reader.read({ type: 'Buffer', length: 2 })).toEqual(Buffer.alloc(2));
    expect(reader.read({ type: 'UInt16LE' })).toBe(321);
    expect(reader.read({ type: 'Buffer', length: 1 })).toEqual(Buffer.alloc(1));
    expect(reader.read({ type: 'UInt8' })).toBe(35);
    expect(reader.read({ type: 'StringNT' })).toBe('ool');
    expect(reader.read({ type: 'Buffer', length: 1 })).toEqual(Buffer.alloc(1));
    expect(reader.read({ type: 'UInt8' })).toBe(9);
    expect(reader.read({ type: 'UInt8' })).toBe(40);
    expect(reader.read({ type: 'UInt8' })).toBe(56);
    expect(reader.read({ type: 'Buffer', length: 1 })).toEqual(Buffer.alloc(1));
    expect(reader.read({ type: 'UInt8' })).toBe(18);
    expect(reader.read({ type: 'Buffer', length: 1 })).toEqual(Buffer.alloc(1));
    expect(reader.read({ type: 'UInt8' })).toBe(88);
    expect(reader.remainingBuffer.length).toBe(0);
  });
});
