
export default class PropertyEditor {

    #propertyGetter;

    constructor({ container, propertyGetter }) {
        this.container = document.getElementById(container) || container;
        this.input = this.container.querySelector('.property-input');
        this.button = this.container.querySelector('.property-apply-button');
        this.warning = this.container.querySelector('.missing-value-warning');
        this.#propertyGetter = propertyGetter;
        this._bindApply();
    }

    init() {
        const value = this.readFromLevel();
        const disabled = this.isUnavailable();

        this.setValue(value);
        this.input.toggleAttribute('disabled', disabled);
        this.button.toggleAttribute('disabled', disabled);

        if (this.warning) {
            this.warning.style.display = disabled ? 'block' : 'none';
        }
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
