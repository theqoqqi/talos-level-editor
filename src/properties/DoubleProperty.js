import Property from './Property.js';

export default class DoubleProperty extends Property {

    read(offset) {
        return this.file.readDouble(offset);
    }

    write(offset, value) {
        this.file.writeDouble(offset, value);
    }
}
