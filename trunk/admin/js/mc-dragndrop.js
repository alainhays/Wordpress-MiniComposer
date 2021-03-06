/**
 * Last edit: 16.09.2016 14:45
 *
 * @param args
 * @constructor
 */

var McDragNDrop = function (args) {
  if (!$) $ = jQuery;

  var currentDrag,
    lastDragOver = Date.now();


  function initEvents() {
    $(document).on('dragstart', '.minicomposer-column, .minicomposer-row', startDrag);
    $(document).on('dragover', '.minicomposer-column:not(.minicomposer-column .minicomposer-column), .minicomposer-row', dragOver);
    $(document).on('dragend', '.minicomposer-column, .minicomposer-row', function (e) {
      finishDrag();
    });
  }

  /**
   * Start dragging
   *
   * @param e
   */
  function startDrag(e) {
    e.originalEvent.dataTransfer.setData('text/plain', 'dummy');
    $('.minicomposer-column, .minicomposer-row').removeClass('dragging');
    $(e.target).addClass('dragging');

    currentDrag = $(e.target);
    if (!currentDrag.is('.minicomposer-column, .minicomposer-row')) {
      currentDrag = currentDrag.closest('.minicomposer-column, .minicomposer-row');
    }
  }


  /**
   * Drag row or column over a column
   *
   * @param e
   */
  function dragOver(e) {
    if (lastDragOver + 5 > Date.now()) return;
    lastDragOver = Date.now();

    if (!currentDrag) {
      return;
    }

    var dropTarget = $(e.target);

    // dropTarget musst be a column or row
    if (!dropTarget.hasClass('minicomposer-column') && !dropTarget.hasClass('minicomposer-row')) {
      dropTarget = dropTarget.closest('.minicomposer-column, .minicomposer-row');
    }

    if (currentDrag.find(dropTarget).length || currentDrag.is(dropTarget)) {
      removeDragOverClasses();
      return;
    }

    if (dropTarget.hasClass('minicomposer-row')) {
      dragOverRow(e, dropTarget);
    } else {
      dragOverColumn(e, dropTarget);
    }

    return;
  }

  /**
   * Drag over a column
   *
   * @param e
   */
  function dragOverColumn(e, dropTarget) {
    var dragClass = 'dragover';

    if (currentDrag.is('.minicomposer-column')) {
      // column drag
      if (e.originalEvent.offsetX > dropTarget.width() / 2) {
        dragClass += ' dragover-right';
      } else {
        dragClass += ' dragover-left';
      }
    } else {
      // row drag
      dragClass += ' dragover-insert';
    }

    if (dropTarget.hasClass(dragClass)) {
      return;
    }

    removeDragOverClasses();
    dropTarget.addClass(dragClass);
  }

  /**
   * Drag over a row
   *
   * @param e
   */
  function dragOverRow(e, dropTarget) {
    var dragClass = 'dragover';

    if (!dropTarget.hasClass('minicomposer-row')) {
      dropTarget = dropTarget.closest('.minicomposer-row');
    }
    if (!dropTarget.length) {
      return;
    }

    if (currentDrag.is('.minicomposer-column')) {
      // is column
      dragClass += ' dragover-insert';
    } else {
      // is row, check if on top or bottom to drop before or after
      if (e.originalEvent.offsetY > dropTarget.height() / 2) {
        dragClass += ' dragover-bottom';
      } else {
        dragClass += ' dragover-top';
      }
    }
    if (dropTarget.hasClass(dragClass)) {
      return;
    }
    removeDragOverClasses();
    dropTarget.addClass(dragClass);
  }

  /**
   * Drop column or row
   *
   * @param e
   */
  function dropElement(e) {
    if (!currentDrag) {
      return;
    }

    if (currentDrag.hasClass('minicomposer-row')) {
      // drag is row
      dropRow(e);
    } else {
      // drag is column
      dropColumn(e);
    }

    recalcColumns();
    updateComposer();
  }

  /**
   * Drop a row
   *
   * @param e
   */
  function dropRow(e) {
    var dropTarget = $('#minicomposer').find('.dragover');

    if (dropTarget.hasClass('minicomposer-column')) {
      // append row to column
      dropTarget.append(currentDrag);
    } else if (dropTarget.hasClass('dragover-bottom')) {
      currentDrag.insertAfter(dropTarget);
    } else {
      currentDrag.insertBefore(dropTarget);
    }
  }

  /**
   * Drop a column
   *
   * @param e
   */
  function dropColumn(e) {
    var dropTarget = $('#minicomposer').find('.dragover'),
      currentParent = currentDrag.parent();

    try {
      if (dropTarget.hasClass('minicomposer-row')) {
        dropTarget.append(currentDrag);
      } else if (dropTarget.hasClass('dragover-right')) {
        currentDrag.insertAfter(dropTarget);
      } else {
        currentDrag.insertBefore(dropTarget);
      }
    } catch (e) {
      console.info('Fatal drop error');
      currentParent.append(currentDrag);
    }
  }


  /**
   * Remove all classes on all dragover-elements
   */
  function removeDragOverClasses() {
    $('.dragover').removeClass('dragover dragover-left dragover-right dragover-top dragover-bottom dragover-insert');
  }

  /**
   * Finish dragging
   */
  function finishDrag() {
    dropElement(null);
    $('.dragging').removeClass('dragging');

    removeDragOverClasses();
    currentDrag = null;
  }

  initEvents();
};