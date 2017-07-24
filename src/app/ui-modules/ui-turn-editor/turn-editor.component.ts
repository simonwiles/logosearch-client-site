import { Component,
         EventEmitter,
         forwardRef,
         Input,
         NgModule,
         ViewChild,
         Output,
         Sanitizer,
         SecurityContext }      from '@angular/core';

import { CommonModule }         from '@angular/common';

import { DomSanitizer,
         SafeHtml}              from '@angular/platform-browser';

import { NG_VALUE_ACCESSOR,
         ControlValueAccessor } from '@angular/forms';


export const INPUT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => TurnEditorComponent),
  multi: true
};


@Component({
  selector: 'ui-turn-editor',
  template: `
  <div class="ui-turn-editor">
    <p #editable class="editable"
       contenteditable="true"
       (keydown)="onEditableKeyDown($event)"
       (focus)="onEditableFocus($event)"
       (blur)="onEditableBlur($event)"
       ></p>
  </div>


  <div #toolbar class="ui-turn-editor-toolbar">

    <button *ngFor="let action of objectKeys(punctuations)"
            (mousedown)="toolbarButtonClick($event, action)">
      <i *ngIf="punctuations[action].icon" [class]="'fa ' + punctuations[action].icon"></i>
    </button>

    <button *ngFor="let action of objectKeys(annotations)"
            (mousedown)="toolbarButtonClick($event, action)">
      <i *ngIf="annotations[action].icon" [class]="'fa ' + annotations[action].icon"></i>
      {{annotations[action].label}}
    </button>

    <button (mousedown)="toolbarButtonClick($event, 'clear')">clear</button>
  </div>
  `,
  styleUrls: ['./turn-editor.component.scss'],
  providers: [INPUT_VALUE_ACCESSOR]
})
export class TurnEditorComponent implements ControlValueAccessor {

  @Input() inputId: string;
  @Input() placeholder: string;
  @Input() tabindex: number;
  @Input() disabled: boolean;
  @Input() maxlength: number;

  @Input() inputStyleClass: string;

  @ViewChild('input') input;
  @ViewChild('overlay') overlay;
  @ViewChild('toolbar') toolbarElement;

  @ViewChild('editable') editable;

  @Output() turnEditorBlur: EventEmitter<any> = new EventEmitter();
  @Output() turnEditorChange: EventEmitter<any> = new EventEmitter();
  @Output() turnEditorFocus: EventEmitter<any> = new EventEmitter();


  annotations = {
    reading: {
      label: 'Reading Aloud',
      className: 'reading',
      icon: 'fa-eraser'
    },
    sentenceFrame: {
      label: 'Sentence Frame',
      className: 'sentence-frame',
      icon: 'fa-eraser'
    }
  }

  // fa-tag, fa-tags, fa-thumb-tack, fa-sticky-note, fa-sticky-note-o, fa-map-pin
  // fa-certificate, fa-exclamation, fa-exclamation-circle
  punctuations = {
    pause: {
      label: 'Pause',
      className: 'pause',
      icon: 'fa-pause'  // fa-pause-circle, fa-pause-circle-o
    },
    laughter: {
      label: 'Laughter',
      className: 'laughter',
      icon: 'fa-smile-o'
    },
    gesture: {
      label: 'Gesture',
      className: 'gesture',
      icon: 'fa-signing'
    },

  }

  value: string;

  objectKeys= Object.keys;
  _mutationObserver: MutationObserver;

  constructor(
    private sanitizer: Sanitizer,
    private domSanitizer: DomSanitizer) {


    this._mutationObserver = new MutationObserver(
      mutations => this.updateTurn()
    );
  }

  onEditableKeyDown($event) {
    if ($event.which === 13) {
      $event.preventDefault();
      this.editable.nativeElement.blur();
    }
  }

  onEditableFocus($event) {
    this.showToolbar();
    this._mutationObserver.observe(
      this.editable.nativeElement,
      {
        subtree: true,
        attributes: true,
        childList: true,
        characterData: true,
        characterDataOldValue: true
      }
    );
    this.turnEditorFocus.emit($event);
  }

  onEditableBlur($event) {
    this.onModelTouched();
    this.hideToolbar();
    this._mutationObserver.disconnect()
    this.turnEditorBlur.emit($event);
  }

  showToolbar() {
    this.toolbarElement.nativeElement.style.display = 'block';
    setTimeout(_ => this.toolbarElement.nativeElement.style.opacity = 1, 0);
  }

  hideToolbar() {
    this.toolbarElement.nativeElement.style.opacity = 0;
    setTimeout(_ => this.toolbarElement.nativeElement.style.display = 'none', 300);
  }

  toolbarButtonClick($event, action) {

    if (this.punctuations.hasOwnProperty(action)) {
      this.insertPunctuation(this.punctuations[action]);
    }

    if (this.annotations.hasOwnProperty(action)) {
      this.insertAnnotation(this.annotations[action]);
    }

    if (action === 'clear') {
      this.clearMarkup();
    }

    $event.stopImmediatePropagation();
    $event.preventDefault();
  }

  updateTurn() {
    this.normalizeTurn()
    this.value = this.serializeTurn();
    this.onModelChange(this.value);
    this.turnEditorChange.emit(this);
  }

  normalizeTurn() {
    // clean up the markup in the contenteditable element
    const tagsToRemove = ['STYLE', 'SCRIPT'];
    const tagsToPreserve = ['MARK', 'I'];

    // 1) remove tagsToRemove completely, and strip all other tags
    //    except for tagsToPreserve
    this.editable.nativeElement.querySelectorAll('*').forEach(
      node => {
        if (tagsToRemove.indexOf(node.tagName) >= 0) {
          node.parentNode.removeChild(node);
        } else if (tagsToPreserve.indexOf(node.tagName) < 0 &&
                   // firefox inserts <br> to preserve trailing space -- don't remove it!
                   !(node.tagName === 'BR' && node.parentNode.lastChild === node)) {
          node.outerHTML = node.innerHTML;
        }
      }
    )

    // 2) remove empty mark elements
    this.editable.nativeElement.querySelectorAll('mark:empty').forEach(
      node => node.parentNode.removeChild(node)
    );

    // 3) remove nested mark elements (of the same class)
    this.editable.nativeElement.querySelectorAll('mark').forEach(
      node => {
        if (node.parentNode.tagName === 'MARK' && node.parentNode.className === node.className) {
          let text = document.createTextNode((<HTMLElement> node).innerText);
          node.parentNode.replaceChild(text, node);
        }
      }
    );

    // 4) merge adjacent mark elements (of the same type)
    this.editable.nativeElement.querySelectorAll('mark').forEach(
      node => {
        if (node.nextSibling &&
            node.nextSibling.nodeType === Node.ELEMENT_NODE &&
            node.nextSibling.className === node.className) {
          node.innerHTML = node.innerHTML + node.nextSibling.innerHTML;
          node.nextSibling.parentNode.removeChild(node.nextSibling);
        }
      }
    );

    // 5) merge adjacent text nodes, and remove empty text nodes
    this.editable.nativeElement.normalize();
  }

  serializeTurn() {
    const serialized = [];

    const getText = function(parentNode) {
      parentNode.childNodes.forEach(
        node => {
          if (node.nodeType === Node.TEXT_NODE) { serialized.push(node.textContent); }
          if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'MARK') {
            serialized.push(`<${node.className}>`);
            getText(node);
            serialized.push(`</${node.className}>`);
          }
          if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'I') {
            serialized.push(`<${node.classList[0]}/>`);
          }
        }
      );
    };

    getText(this.editable.nativeElement);
    return serialized.join('').replace(/\s+/g, ' ').trim();
  }

  insertPunctuation(punctuation) {
    const selection = window.getSelection();
    // if there is a selection, collapse it to the last point (e.g. where the mouse
    // stopped selecting)
    // -- is this the right behaviour?  would it be better to have the 'punctuation'
    //    replace (overwrite, clobber) the selected text?
    selection.collapse(selection.focusNode, selection.focusOffset);
    const range = selection.getRangeAt(0);
    const frag = range.createContextualFragment(  //  no support for IE < 11!
      `<i class="${punctuation.className} fa ${punctuation.icon}" contenteditable="false"> </i>`
    );
    range.insertNode(frag);
  }

  insertAnnotation(annotation, selectPastedContent = false) {
    const selection = window.getSelection();
    let text = selection.toString();
    if (!selection.rangeCount || !text) { return; }

    let range = selection.getRangeAt(0);

    // // adjust selection to exclude leading and trailing white space
    // if (/^\s+/.exec(text)) {
    //   range.setStart(range.startContainer, range.startOffset + /^\s+/.exec(text)[0].length);
    //   text = selection.toString();
    // }

    // if (/\s+$/.exec(text)) {
    //   range.setEnd(range.endContainer, range.endOffset - /\s+$/.exec(text)[0].length);
    //   text = selection.toString();
    // }



    // range.deleteContents();

    // const frag = range.createContextualFragment(  //  no support for IE < 11!
    //   `<mark class="${annotation.className}" data-label="${annotation.label}">${text}</mark>`
    // );
    // range.insertNode(frag);


    let newNode = document.createElement('mark');
    newNode.className = annotation.className;
    newNode.setAttribute('data-label', annotation.label);
    // range.surroundContents(newNode);

    newNode.appendChild(range.extractContents());
    range.insertNode(newNode)

    // // Preserve the selection
    // let firstNode = frag.firstChild;
    // let lastNode = frag.lastChild;
    // if (lastNode) {
    //   range = range.cloneRange();
    //   range.setStartAfter(lastNode);
    //   if (selectPastedContent) {
    //     range.setStartBefore(firstNode);
    //   } else {
    //     range.collapse(true);
    //   }
    //   selection.removeAllRanges();
    //   selection.addRange(range);
    // }
  }

  clearMarkup() {
    const selection = window.getSelection();
    let node = selection.anchorNode;

    // find the closest parent <mark/> element
    while (node && node.nodeName !== 'MARK') {
      node = node.parentNode;
    }

    // if we've got one, strip the tag
    if (node) {
      let text = document.createTextNode((<HTMLElement> node).innerText);
      node.parentNode.replaceChild(text, node);
    }


    // now look through children of the selection for <mark/> tags
    // -- this is all rather cumbersome, but it can't be done in a nicer way
    //    because of IE's (up to and including 11) lack of support for
    //    Range.intersectsNode() and Selection.containsNode()
    const range = selection.getRangeAt(0);
    let overlapsSelection = false;
    let direction;

    for (let childNode of Array.from(range.commonAncestorContainer.childNodes)) {
      if (!overlapsSelection) {
        if (childNode === selection.anchorNode) {
          overlapsSelection = true;
          direction = 1;
        }
        if (childNode === selection.focusNode) {
          overlapsSelection = true;
          direction = -1;
        }
      }

      if (overlapsSelection && childNode.nodeType === Node.ELEMENT_NODE && childNode.nodeName === 'MARK') {
        let text = document.createTextNode((<HTMLElement> childNode).innerText);
        childNode.parentNode.replaceChild(text, childNode);
      }
      if ((direction === 1 && childNode === selection.focusNode) ||
          (direction === -1 && childNode === selection.anchorNode)) {
        break;
      }
    }

  }


  // ControlValueAccessor boiler-plate ///////
  onModelChange: Function = () => { return; };
  onModelTouched: Function = () => { return; };

  registerOnChange(fn: Function): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this.onModelTouched = fn;
  }

  writeValue(value: any): void {
    this.value = value;
  }
  ////////////////////////////////////////////
}


