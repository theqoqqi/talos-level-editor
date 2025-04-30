import Property from './Property.js';

export default class IntegerProperty extends Property {

    read(offset) {
        return this.file.readInteger(offset);
    }

    write(offset, value) {
        this.file.writeInteger(offset, value);
    }
}
