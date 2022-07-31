import { BufferReader, BufferWriter } from '../lib';

describe('easy-buffer', () => {
  test('read / write', () => {
    const writer = new BufferWriter();
    expect(writer.buffer().length).toBe(0);
    writer.write({ type: 'Int8', value: -4 });
    expect(writer.buffer().length).toBe(1);
    writer.write({ type: 'UInt8', value: 13 });
    expect(writer.buffer().length).toBe(2);
    writer.write({ type: 'Int16LE', value: -123 });
    expect(writer.buffer().length).toBe(4);
    writer.write({ type: 'UInt16LE', value: 215 });
    expect(writer.buffer().length).toBe(6);
    writer.write({ type: 'Int16BE', value: -77 });
    expect(writer.buffer().length).toBe(8);
    writer.write({ type: 'UInt16BE', value: 99 });
    expect(writer.buffer().length).toBe(10);
    writer.write({ type: 'Int32LE', value: -2045 });
    expect(writer.buffer().length).toBe(14);
    writer.write({ type: 'UInt32LE', value: 1782 });
    expect(writer.buffer().length).toBe(18);
    writer.write({ type: 'Int32BE', value: -345 });
    expect(writer.buffer().length).toBe(22);
    writer.write({ type: 'UInt32BE', value: 579 });
    expect(writer.buffer().length).toBe(26);
    writer.write({ type: 'Buffer', value: Buffer.from([0x01, 0x02, 0x03]) });
    expect(writer.buffer().length).toBe(29);
    writer.write({ type: 'StringNT', value: 'hello' });
    expect(writer.buffer().length).toBe(35);
    writer.write({ type: 'String', value: 'world' });
    expect(writer.buffer().length).toBe(40);

    const reader = new BufferReader(writer.buffer());
    expect(reader.bufferRemaining().length).toBe(40);
    expect(reader.read({ type: 'Int8' })).toBe(-4);
    expect(reader.bufferRemaining().length).toBe(39);
    expect(reader.read({ type: 'UInt8' })).toBe(13);
    expect(reader.bufferRemaining().length).toBe(38);
    expect(reader.read({ type: 'Int16LE' })).toBe(-123);
    expect(reader.bufferRemaining().length).toBe(36);
    expect(reader.read({ type: 'UInt16LE' })).toBe(215);
    expect(reader.bufferRemaining().length).toBe(34);
    expect(reader.read({ type: 'Int16BE' })).toBe(-77);
    expect(reader.bufferRemaining().length).toBe(32);
    expect(reader.read({ type: 'UInt16BE' })).toBe(99);
    expect(reader.bufferRemaining().length).toBe(30);
    expect(reader.read({ type: 'Int32LE' })).toBe(-2045);
    expect(reader.bufferRemaining().length).toBe(26);
    expect(reader.read({ type: 'UInt32LE' })).toBe(1782);
    expect(reader.bufferRemaining().length).toBe(22);
    expect(reader.read({ type: 'Int32BE' })).toBe(-345);
    expect(reader.bufferRemaining().length).toBe(18);
    expect(reader.read({ type: 'UInt32BE' })).toBe(579);
    expect(reader.bufferRemaining().length).toBe(14);
    expect(reader.read({ type: 'Buffer', length: 3 })).toEqual(
      Buffer.from([0x01, 0x02, 0x03])
    );
    expect(reader.bufferRemaining().length).toBe(11);
    expect(reader.read({ type: 'StringNT' })).toBe('hello');
    expect(reader.bufferRemaining().length).toBe(5);
    expect(reader.read({ type: 'String', length: 2 })).toBe('wo');
    expect(reader.bufferRemaining().length).toBe(3);
    expect(reader.read({ type: 'String' })).toBe('rld');
    expect(reader.bufferRemaining().length).toBe(0);
  });

  test('read (out of bounds)', () => {
    expect(() =>
      new BufferReader(Buffer.alloc(0)).read({ type: 'UInt8' })
    ).toThrowError('Length out of bounds.');
    expect(() =>
      new BufferReader(Buffer.alloc(1)).read({ type: 'UInt16LE' })
    ).toThrowError('Length out of bounds.');
    expect(() =>
      new BufferReader(Buffer.alloc(3)).read({ type: 'UInt32LE' })
    ).toThrowError('Length out of bounds.');
    expect(() =>
      new BufferReader(Buffer.from('cool')).read({ type: 'String', length: 5 })
    ).toThrowError('Length out of bounds.');
    expect(() =>
      new BufferReader(Buffer.from('cool')).read({ type: 'StringNT' })
    ).toThrowError('Length out of bounds (null-terminator not found).');
    expect(() =>
      new BufferReader(Buffer.alloc(3)).read({ type: 'Buffer', length: 4 })
    ).toThrowError('Length out of bounds.');
  });

  test('read / write arrays', () => {
    const writer = new BufferWriter();
    writer.writeArray(
      [
        { key: 'a', value: 3 },
        { key: 'b', value: 2 },
        { key: 'c', value: 1 },
      ],
      (_, item) => {
        writer.write({ type: 'StringNT', value: item.key });
        writer.write({ type: 'Int8', value: item.value });
      }
    );

    const reader = new BufferReader(writer.buffer());
    const items = reader.readArray(() => {
      const key = reader.read({ type: 'StringNT' });
      const value = reader.read({ type: 'Int8' });
      return { key, value };
    });
    expect(items).toEqual([
      { key: 'a', value: 3 },
      { key: 'b', value: 2 },
      { key: 'c', value: 1 },
    ]);
  });

  test('read offset (in bounds)', () => {
    const buffer = new BufferWriter()
      .write({
        type: 'String',
        value: 'hello world!',
      })
      .buffer();
    const reader = new BufferReader(buffer);
    expect(reader.read({ type: 'String', length: 4 })).toBe('hell');
    reader.offset(2);
    expect(reader.read({ type: 'String', length: 5 })).toBe('world');
    reader.offset(0);
    expect(reader.read({ type: 'String', length: 1 })).toBe('!');
    reader.offset(0, true);
    expect(reader.read({ type: 'String', length: 5 })).toBe('hello');
    reader.offset(-2);
    expect(reader.read({ type: 'String', length: 2 })).toBe('lo');
    reader.offset(-1, true);
    expect(reader.read({ type: 'String', length: 1 })).toBe('!');
  });

  test('read offset (out of bounds)', () => {
    const buffer = new BufferWriter()
      .write({
        type: 'String',
        value: 'cool!',
      })
      .buffer();
    const reader = new BufferReader(buffer);
    expect(reader.read({ type: 'String', length: 4 })).toBe('cool');
    expect(() => reader.offset(10)).toThrowError('Offset out of bounds.');
    expect(() => reader.offset(-10)).toThrowError('Offset out of bounds.');
    expect(() => reader.offset(10, true)).toThrowError('Offset out of bounds.');
    expect(() => reader.offset(-10, true)).toThrowError(
      'Offset out of bounds.'
    );
  });

  test('write offset (in bounds)', () => {
    const writer = new BufferWriter();
    writer.write({ type: 'String', value: 'hello world!' });
    expect(new BufferReader(writer.buffer()).read({ type: 'String' })).toBe(
      'hello world!'
    );
    writer.offset(0);
    writer.write({ type: 'String', value: '?' });
    expect(new BufferReader(writer.buffer()).read({ type: 'String' })).toBe(
      'hello world!?'
    );
    writer.offset(-9);
    writer.write({ type: 'String', value: 'y' });
    expect(new BufferReader(writer.buffer()).read({ type: 'String' })).toBe(
      'helly world!?'
    );
    writer.offset(-1, true);
    writer.write({ type: 'String', value: '!' });
    expect(new BufferReader(writer.buffer()).read({ type: 'String' })).toBe(
      'helly world!!'
    );
    writer.offset(0, true);
    writer.write({ type: 'String', value: 'j' });
    expect(new BufferReader(writer.buffer()).read({ type: 'String' })).toBe(
      'jelly world!!'
    );
    writer.offset(3);
    writer.write({ type: 'String', value: 'o' });
    expect(new BufferReader(writer.buffer()).read({ type: 'String' })).toBe(
      'jello world!!'
    );
    writer.offset(7, true);
    writer.write({ type: 'String', value: 'alrus' });
    expect(new BufferReader(writer.buffer()).read({ type: 'String' })).toBe(
      'jello walrus!'
    );
  });

  test('write offset (out of bounds)', () => {
    const writer = new BufferWriter();
    writer.write({ type: 'String', value: 'cool' });
    expect(writer.buffer().length).toBe(4);
    writer.offset(3);
    expect(writer.buffer().length).toBe(7);
    writer.write({ type: 'String', value: 'wow' });
    expect(writer.buffer().length).toBe(10);
    writer.offset(-3);
    expect(writer.buffer().length).toBe(10);
    writer.offset(-10);
    expect(writer.buffer().length).toBe(13);
    writer.write({ type: 'String', value: '!' });
    expect(writer.buffer().length).toBe(13);
    writer.offset(15, true);
    expect(writer.buffer().length).toBe(15);
    writer.offset(-20, true);
    expect(writer.buffer().length).toBe(20);

    const reader = new BufferReader(writer.buffer());
    expect(reader.read({ type: 'Buffer', length: 5 })).toEqual(Buffer.alloc(5));
    expect(reader.read({ type: 'String', length: 1 })).toBe('!');
    expect(reader.read({ type: 'Buffer', length: 2 })).toEqual(Buffer.alloc(2));
    expect(reader.read({ type: 'String', length: 4 })).toBe('cool');
    expect(reader.read({ type: 'Buffer', length: 3 })).toEqual(Buffer.alloc(3));
    expect(reader.read({ type: 'String', length: 3 })).toBe('wow');
    expect(reader.read({ type: 'Buffer', length: 2 })).toEqual(Buffer.alloc(2));
  });
});
