import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MaterialComponent } from '../MaterialComponent';
import HtmlComponent from 'formiojs/components/html/HTML.js';

@Component({
  selector: 'mat-formio-html',
  template: `<div #htmlBody></div>`
})
export class MaterialHtmlComponent extends MaterialComponent implements AfterViewInit {
  @ViewChild('htmlBody', {static: false}) htmlBody: ElementRef;

  ngAfterViewInit() {
    super.ngAfterViewInit();
    this.htmlBody.nativeElement.innerHTML = this.instance.renderContent();
  }

  setInstance(instance) {
    if (instance.component.refreshOnChange) {
      instance.checkRefreshOn = () => {
        this.htmlBody.nativeElement.innerHTML = instance.renderContent();
      };
    }
    return super.setInstance(instance);
  }
}
HtmlComponent.MaterialComponent = MaterialHtmlComponent;
export { HtmlComponent };
