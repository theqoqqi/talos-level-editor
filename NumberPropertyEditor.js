import PropertyEditor from './PropertyEditor.js';

export default class NumberPropertyEditor extends PropertyEditor {

    constructor(opts) {
        super(opts);
    }

    getValue() {
        return parseFloat(this.input.value);
    }

    setValue(value) {
        this.input.value = value.toFixed(4);
    }

    isInputValueValid() {
        return !isNaN(this.getValue());
    }
}
