
export default class PropertyEditor {

    #propertyGetter;

    constructor({ container, propertyGetter }) {
        this.container = document.getElementById(container) || container;
        this.input = this.container.querySelector('.property-input');
        this.button = this.container.querySelector('.property-apply-button');
        this.warning = this.container.querySelector('.missing-value-warning');
        this.#propertyGetter = propertyGetter;
        this._bindInputListener();
        this._bindApply();
    }

    init() {
        const value = this.readFromLevel();
        const disabled = this.isUnavailable();

        this.setValue(value);
        this.input.toggleAttribute('disabled', disabled);
        this.button.toggleAttribute('disabled', true);

        if (this.warning) {
            this.warning.style.display = disabled ? 'block' : 'none';
        }
    }

    _bindInputListener() {
        this.input.addEventListener('input', () => {
            this.button.disabled = this.getValue() === this.#getProperty().get();
        });
    }

    _bindApply() {
        this.button.addEventListener('click', () => {
            if (!this.isInputValueValid()) {
                return;
            }

            const value = this.getValue();

            try {
                this.writeToLevel(value);

                this.button.textContent = 'Applied';

                const listener = () => {
                    this.button.textContent = 'Apply';
                    this.button.disabled = true;

                    this.button.removeEventListener('mouseleave', listener);
                };

                this.button.addEventListener('mouseleave', listener);
            } catch (e) {
                alert(e.message);
            }
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
