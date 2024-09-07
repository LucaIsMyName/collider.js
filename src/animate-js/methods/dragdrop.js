export const dragdrop = {
  drag: function drag(element, options = {}) {
    element.setAttribute('draggable', true);

    const { onDragStart, onDrag, onDragEnd } = options;

    element.addEventListener('dragstart', (event) => {
      if (onDragStart) onDragStart(event);
      event.dataTransfer.effectAllowed = 'move'; 
    });

    element.addEventListener('drag', (event) => {
      if (onDrag) onDrag(event);
    });

    element.addEventListener('dragend', (event) => {
      if (onDragEnd) onDragEnd(event);
    });
  },

  drop: function drop(element, options = {}) {
    const { onDragOver, onDragEnter, onDragLeave, onDrop } = options;

    element.addEventListener('dragover', (event) => {
      event.preventDefault(); 
      if (onDragOver) onDragOver(event);
    });

    element.addEventListener('dragenter', (event) => {
      if (onDragEnter) onDragEnter(event);
    });

    element.addEventListener('dragleave', (event) => {
      if (onDragLeave) onDragLeave(event);
    });

    element.addEventListener('drop', (event) => {
      event.preventDefault(); 
      if (onDrop) onDrop(event);
    });
  },

  sort: function sort(container, options = {
    onDragStart: container => {
      container.classList.add('dragging');
    },
  }) {
    const { onSort } = options;
    let draggedElement = null;

    container.addEventListener('dragstart', (event) => {
      console.log('dragstart');
      draggedElement = event.target;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', ''); // Required for Firefox compatibility
    });

    container.addEventListener('dragover', (event) => {
      event.preventDefault();

      const targetElement = event.target;
      if (targetElement && targetElement !== draggedElement && targetElement.classList.contains('sortable-item')) {
        const bounding = targetElement.getBoundingClientRect();
        const offset = bounding.y + (bounding.height / 2);

        if (event.clientY > offset) {
          container.insertBefore(draggedElement, targetElement.nextSibling);
        } else {
          container.insertBefore(draggedElement, targetElement);
        }
      }
    });

    container.addEventListener('dragend', () => {
      draggedElement = null;
      if (onSort) onSort(container);
    });
  }
};
