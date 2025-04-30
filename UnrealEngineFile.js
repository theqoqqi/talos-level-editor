
export default class UnrealEngineFile {

    constructor(arrayBuffer) {
        this.buffer = new Uint8Array(arrayBuffer);
        this.view = new DataView(this.buffer.buffer);
    }

    static parseBytes(hexString) {
        return new Uint8Array(
            hexString.trim().split(/\s+/).map(b => parseInt(b, 16))
        );
    }

    findOffsetOfAnyString(strings) {
        for (const string of strings) {
            const offset = this.findStringOffset(string);

            if (offset >= 0) {
                return offset;
            }
        }

        return null;
    }

    findStringOffset(string) {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(string + '\x00');

        return this.findOffset(bytes) - 4;
    }

    findOffset(pattern) {
        const buf = this.buffer;

        for (let i = 0; i <= buf.length - pattern.length; i++) {
            let match = true;

            for (let j = 0; j < pattern.length; j++) {
                if (buf[i + j] !== pattern[j]) {
                    match = false;
                    break;
                }
            }

            if (match) {
                return i;
            }
        }

        return -1;
    }

    getValueOffset(headerHex) {
        const headerBytes = UnrealEngineFile.parseBytes(headerHex);
        const pos = this.findOffset(headerBytes);

        if (pos < 0) {
            throw new Error(`Header not found: ${headerHex}`);
        }

        return pos + headerBytes.length;
    }

    readFloat(headerHex) {
        const offset = this.getValueOffset(headerHex);

        return this.view.getFloat32(offset, true);
    }

    writeFloat(headerHex, value) {
        const offset = this.getValueOffset(headerHex);

        this.view.setFloat32(offset, value, true);
    }

    readStringByHeader(headerHex, shift = 0) {
        const offset = this.getValueOffset(headerHex) + shift;

        return this.readString(offset);
    }

    readString(offset, defaultValue) {
        const len = this.view.getUint32(offset, true);
        const bytes = this.buffer.slice(offset + 4, offset + 4 + len);

        if (bytes[bytes.length - 1] === 0) {
            return new TextDecoder().decode(bytes).replace(/\x00$/, '');
        }

        if (defaultValue === undefined) {
            throw new Error('Invalid string: missing null terminator');
        }

        return defaultValue;
    }

    removeString(offset) {
        const len = this.view.getUint32(offset, true);
        const prefix = this.buffer.slice(0, offset);
        const suffix = this.buffer.slice(offset + 4 + len);

        this.buffer = new Uint8Array([...prefix, ...suffix]);
        this.view = new DataView(this.buffer.buffer);
    }

    insertString(offset, str) {
        const encoder = new TextEncoder();
        const strBytes = encoder.encode(str + '\0');
        const prefix = this.buffer.slice(0, offset);
        const suffix = this.buffer.slice(offset);
        const newBuf = new Uint8Array(prefix.length + 4 + strBytes.length + suffix.length);

        newBuf.set(prefix, 0);
        new DataView(newBuf.buffer).setUint32(prefix.length, strBytes.length, true);
        newBuf.set(strBytes, prefix.length + 4);
        newBuf.set(suffix, prefix.length + 4 + strBytes.length);

        this.buffer = newBuf;
        this.view = new DataView(this.buffer.buffer);
    }

    replaceString(offset, replacement) {
        this.removeString(offset);
        this.insertString(offset, replacement);
    }

    modifyInteger(pos, delta) {
        const old = this.view.getUint32(pos, true);

        this.view.setUint32(pos, old + delta, true);
    }

    getArrayBuffer() {
        return this.buffer.buffer;
    }
}
