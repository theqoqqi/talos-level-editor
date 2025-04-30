import PropertyEditor from './PropertyEditor.js';

export default class FloatPropertyEditor extends PropertyEditor {

    constructor(opts) {
        super(opts);
    }

    isInputValueValid() {
        return !isNaN(this.getValue());
    }
}
