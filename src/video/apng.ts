const SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const CRC_TABLE = (() => {
	const table = new Uint32Array(256);
	for (let n = 0; n < 256; n++) {
		let c = n;
		for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		table[n] = c >>> 0;
	}
	return table;
})();

function crc32(buf: Buffer): number {
	let c = 0xffffffff;
	for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
	return (c ^ 0xffffffff) >>> 0;
}

type Chunk = { type: string; data: Buffer };

function chunk(type: string, data: Buffer): Buffer {
	const typeBuf = Buffer.from(type, 'ascii');
	const head = Buffer.alloc(4);
	head.writeUInt32BE(data.length);
	const sum = Buffer.alloc(4);
	sum.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
	return Buffer.concat([head, typeBuf, data, sum]);
}

function parsePng(buf: Buffer): Chunk[] {
	if (buf.length < 8 || !buf.subarray(0, 8).equals(SIG)) throw new Error('A video frame is not a PNG.');
	const chunks: Chunk[] = [];
	let off = 8;
	while (off + 12 <= buf.length) {
		const len = buf.readUInt32BE(off);
		const type = buf.toString('ascii', off + 4, off + 8);
		const data = Buffer.from(buf.subarray(off + 8, off + 8 + len));
		chunks.push({ type, data });
		off += 12 + len;
		if (type === 'IEND') break;
	}
	if (!chunks.some((item) => item.type === 'IHDR') || !chunks.some((item) => item.type === 'IDAT')) throw new Error('A video frame PNG is missing IHDR or IDAT.');
	return chunks;
}

const KEEP = new Set(['cHRM', 'gAMA', 'iCCP', 'sBIT', 'sRGB', 'bKGD', 'pHYs', 'sPLT', 'tRNS', 'PLTE']);

function u32(value: number): Buffer {
	const buf = Buffer.alloc(4);
	buf.writeUInt32BE(value);
	return buf;
}

function fcTL(sequence: number, width: number, height: number, fps: number): Buffer {
	const data = Buffer.alloc(26);
	data.writeUInt32BE(sequence, 0);
	data.writeUInt32BE(width, 4);
	data.writeUInt32BE(height, 8);
	data.writeUInt32BE(0, 12);
	data.writeUInt32BE(0, 16);
	data.writeUInt16BE(1, 20);
	data.writeUInt16BE(fps, 22);
	data.writeUInt8(0, 24);
	data.writeUInt8(0, 25);
	return chunk('fcTL', data);
}

/**
 * Mux full-frame PNGs into one APNG. Text and time chunks are dropped so a renderer timestamp cannot change the bytes.
 * Plays once. Each frame is the full picture (dispose none, blend source).
 */
export function encodeApng(frames: Buffer[], fps: number): Buffer {
	if (frames.length < 1) throw new Error('An APNG needs at least one frame.');
	const parsed = frames.map(parsePng);
	const ihdr = parsed[0].find((item) => item.type === 'IHDR')!;
	const width = ihdr.data.readUInt32BE(0);
	const height = ihdr.data.readUInt32BE(4);
	for (const frame of parsed) {
		const header = frame.find((item) => item.type === 'IHDR')!;
		if (!header.data.equals(ihdr.data)) throw new Error('Video frames do not share one pixel size.');
	}
	const parts: Buffer[] = [SIG, chunk('IHDR', ihdr.data)];
	const actl = Buffer.concat([u32(frames.length), u32(1)]);
	parts.push(chunk('acTL', actl));
	const firstIdat = parsed[0].findIndex((item) => item.type === 'IDAT');
	for (const item of parsed[0].slice(1, firstIdat)) if (KEEP.has(item.type)) parts.push(chunk(item.type, item.data));
	let sequence = 0;
	parts.push(fcTL(sequence, width, height, fps));
	for (const item of parsed[0].filter((chunk) => chunk.type === 'IDAT')) parts.push(chunk('IDAT', item.data));
	for (const frame of parsed.slice(1)) {
		sequence += 1;
		parts.push(fcTL(sequence, width, height, fps));
		sequence += 1;
		const idat = Buffer.concat(frame.filter((item) => item.type === 'IDAT').map((item) => item.data));
		parts.push(chunk('fdAT', Buffer.concat([u32(sequence), idat])));
	}
	parts.push(chunk('IEND', Buffer.alloc(0)));
	return Buffer.concat(parts);
}
