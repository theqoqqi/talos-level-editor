import PropertyEditor from './PropertyEditor.js';

export default class FloatPropertyEditor extends PropertyEditor {

    constructor(opts) {
        super(opts);
    }

    getValue() {
        return +this.input.value;
    }

    isInputValueValid() {
        return !isNaN(this.getValue());
    }
}
