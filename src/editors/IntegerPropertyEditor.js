import PropertyEditor from './PropertyEditor.js';

export default class IntegerPropertyEditor extends PropertyEditor {

    constructor(opts) {
        super(opts);
    }

    isInputValueValid() {
        return !isNaN(this.getValue());
    }
}
