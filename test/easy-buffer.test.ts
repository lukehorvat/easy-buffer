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
});
