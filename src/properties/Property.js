
export default class Property {

    #offsetGetter;

    #existenceChecker;

    #shift;

    #reader;

    #writer;

    constructor(file, {
        header = null,
        offsetGetter = () => this.file.getValueOffset(header),
        shift = 0,
        existenceChecker = () => header ? this.file.containsHeader(header) : true,
        reader = () => { throw new Error('Not implemented') },
        writer = () => { throw new Error('Not implemented') },
        defaultValue = null,
    }) {
        this.file = file;

        if (!header && !offsetGetter) {
            throw new Error('Either header or offset must be specified');
        }

        this.#offsetGetter = offsetGetter;
        this.#existenceChecker = existenceChecker;
        this.#shift = shift ?? 0;
        this.#reader = reader;
        this.#writer = writer;
        this.defaultValue = defaultValue;
    }

    exists() {
        return this.#existenceChecker();
    }

    getValueOffset() {
        return this.#offsetGetter() + this.#shift;
    }

    get() {
        if (!this.exists()) {
            return this.defaultValue;
        }

        return this.read(this.getValueOffset());
    }

    set(value) {
        const offset = this.getValueOffset();

        this.write(offset, value);
    }

    read(offset) {
        return this.#reader(offset);
    }

    write(offset, value) {
        this.#writer(offset, value);
    }
}
