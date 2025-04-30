import PropertyEditor from './PropertyEditor.js';

export default class DoublePropertyEditor extends PropertyEditor {

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
