
export default function setupDragAndDrop(fileInput) {
    ['dragenter', 'dragover'].forEach(eventName => {
        fileInput.addEventListener(eventName, e => {
            e.preventDefault();
            e.stopPropagation();

            fileInput.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        fileInput.addEventListener(eventName, e => {
            e.preventDefault();
            e.stopPropagation();

            fileInput.classList.remove('dragover');
        });
    });

    fileInput.addEventListener('drop', e => {
        const files = e.dataTransfer.files;

        if (files.length) {
            fileInput.files = files;
            fileInput.dispatchEvent(new Event('change'));
        }
    });
}
