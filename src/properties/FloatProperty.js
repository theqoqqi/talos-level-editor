import Property from './Property.js';

export default class FloatProperty extends Property {

    read(offset) {
        return this.file.readFloat(offset);
    }

    write(offset, value) {
        this.file.writeFloat(offset, value);
    }
}
