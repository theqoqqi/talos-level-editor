
export default class PropertyEditor {

    #propertyGetter;

    constructor({ input, button, propertyGetter }) {
        this.input = document.getElementById(input) || input;
        this.button = document.getElementById(button) || button;
        this.#propertyGetter = propertyGetter;
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
        return this.#getProperty().get();
    }

    writeToLevel(value) {
        this.#getProperty().set(value);
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
        return !this.#getProperty().exists();
    }

    #getProperty() {
        return this.#propertyGetter(this.levelFile);
    }
}
