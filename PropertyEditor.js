
export default class PropertyEditor {

    #reader;

    #writer;

    constructor({ input, button, reader, writer }) {
        this.input = document.getElementById(input) || input;
        this.button = document.getElementById(button) || button;
        this.#reader = reader;
        this.#writer = writer;
        this._bindApply();
    }

    init() {
        const value = this.readFromLevel();
        const disabled = this.isUnavailable();

        this.setValue(value);
        this.input.toggleAttribute('disabled', disabled);
        this.button.toggleAttribute('disabled', disabled);
    }

    _bindApply() {
        this.button.addEventListener('click', () => {
            if (!this.isInputValueValid()) {
                return;
            }

            const value = this.getValue();

            this.writeToLevel(value);
        });
    }

    attachLevel(levelFile) {
        this.levelFile = levelFile;
    }

    readFromLevel() {
        return this.#reader(this.levelFile);
    }

    writeToLevel(value) {
        this.#writer(this.levelFile, value);
    }

    getValue() {
        return this.input.value;
    }

    setValue(value) {
        this.input.value = value;
    }

    isInputValueValid() {
        return true;
    }

    isUnavailable() {
        return false;
    }
}
