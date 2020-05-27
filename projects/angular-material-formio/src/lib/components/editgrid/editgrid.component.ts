import {
  Component,
  ViewChild,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { MaterialNestedComponent } from '../MaterialNestedComponent';
import EditGridComponent from 'formiojs/components/editgrid/EditGrid.js';
import { FormioComponent } from '../../formio.component';
import Components from 'formiojs/components/Components';
import isString from 'lodash/isString';

enum EditRowState {
  NEW = 'new',
  EDITING ='editing',
  SAVED = 'saved',
  REMOVED = 'removed'
};

/* tslint:disable no-bitwise only-arrow-functions */
const hashCode = function(str) {
  let hash = 0;
  let i = 0;
  let chr;
  str = str.replace(/\s/g, '');
  if (str.length === 0) {
    return hash;
  }
  for (i = 0; i < str.length; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
/* tslint:enable no-bitwise only-arrow-functions */

// Do nothing to createRowComponents, let mat-formio handle it.
/* tslint:disable only-arrow-functions */
EditGridComponent.prototype.createRowComponents = function() {
  return [];
};

const checkRow = EditGridComponent.prototype.checkRow;
EditGridComponent.prototype.checkRow = function(data, editRow, flags: any = {}) {
  if (flags.checkRow) {
    return checkRow.call(this, data, editRow, flags);
  } else {
    return true;
  }
};
/* tslint:enable only-arrow-functions */

const DEFAULT_HEADER_TEMPLATES = [
  hashCode((EditGridComponent as any).defaultHeaderTemplate),
  hashCode(`<div class="row">
  {% util.eachComponent(components, function(component) { %}
    <div class="col-sm-2">
      {{ component.label }}
    </div>
  {% }) %}
</div>`)
];

const DEFAULT_ROW_TEMPLATES = [
  hashCode((EditGridComponent as any).defaultRowTemplate),
  hashCode(`<div class="row">
  {% util.eachComponent(components, function(component) { %}
    <div class="col-sm-2">
      {{ getView(component, row[component.key]) }}
    </div>
  {% }) %}
  {% if (!instance.options.readOnly) { %}
    <div class="col-sm-2">
      <div class="btn-group pull-right">
        <button class="btn btn-default btn-sm editRow">Edit</button>
        <button class="btn btn-danger btn-sm removeRow">Delete</button>
      </div>
    </div>
  {% } %}
</div>`)
];

@Component({
  selector: 'mat-formio-editgrid',
  styles: [':host .delete-button { margin-left: auto; order: 2; }'],
  template: `
    <mat-formio-form-field [instance]="instance"
                           [componentTemplate]="componentTemplate"
                           [labelTemplate]="labelTemplate"
    ></mat-formio-form-field>
    <ng-template #componentTemplate let-hasLabel>

      <span fxLayout="column" fxLayoutGap="1em" fxFill>
        <ng-container *ngIf="hasLabel">
            <ng-container *ngTemplateOutlet="labelTemplate"></ng-container>
        </ng-container>
        <mat-accordion>
          <mat-expansion-panel *ngIf="header" disabled="true">
            <mat-expansion-panel-header>
              <span #header fxFill></span>
            </mat-expansion-panel-header>
          </mat-expansion-panel>

          <mat-expansion-panel *ngFor="let row of instance.editRows; index as i;"
                               [expanded]="instance.isOpen(row)"
          >
            <mat-expansion-panel-header (click)="editRow(row, i)">
              <span *ngIf="row.state !== RowStates.NEW" #rows fxFill></span>
            </mat-expansion-panel-header>

            <mat-formio [form]="instance.component" #forms (change)="validate(i)"></mat-formio>

            <span fxLayout="row" fxLayoutGap="1em">
              <button mat-raised-button color="primary" [disabled]="!valid" (click)="saveRow(row, i)">Save</button>
              <button mat-raised-button color="secondary" (click)="cancelRow(i)">Cancel</button>
              <button mat-raised-button color="warn" (click)="instance.removeRow(i)" class="delete-button">
                <mat-icon>delete</mat-icon>
              </button>
            </span>
          </mat-expansion-panel>

          <mat-expansion-panel *ngIf="footer" disabled="true">
            <mat-expansion-panel-header>
              <span #footer></span>
            </mat-expansion-panel-header>
          </mat-expansion-panel>
        </mat-accordion>

        <span fxFill="none" *ngIf="instance.hasAddButton()">
          <button mat-raised-button color="primary" (click)="addAnother()">
            <mat-icon>add</mat-icon> Add Another
          </button>
        </span>
      </span>
    </ng-template>

    <ng-template #labelTemplate>
      <mat-card-title>
        <span [instance]="instance" matFormioLabel></span>
      </mat-card-title>
    </ng-template>
  `
})
export class MaterialEditGridComponent extends MaterialNestedComponent implements AfterViewInit {
  @ViewChild('header', { static: false }) headerElement: ElementRef;
  @ViewChild('footer', { static: false }) footerElement: ElementRef;
  @ViewChildren('rows') rowElements: QueryList<ElementRef>;
  @ViewChildren('forms') forms: QueryList<FormioComponent>;
  public header: string;
  public footer: string;
  public displayedColumns: string[];
  public columns: any = {};
  public colWidth = 0;
  public valid = true;
  public RowStates = EditRowState;

  getRowTemplate(content) {
    return `<mat-list style="display: flex;">
      {% util.eachComponent(components, function(component) { %}
        {% if (!component.hasOwnProperty('tableView') || component.tableView) { %}
          <mat-list-item style="width: {{ colWidth }}%;">${content}</mat-list-item>
        {% } %}
      {% }) %}
    </mat-list>`;
}

  validate(index) {
    if (!this.forms) {
      return;
    }
    const forms = this.forms.toArray();
    if (!forms[index]) {
      return;
    }
    const formioComponent = forms[index];
    const {data} = formioComponent.formio.submission;
    const isInvalid = Object.keys(data).some(
      value => isString(data[value]) && data[value].length === 0
    );

    if (isInvalid) {
      this.valid = false;
    } else {
      this.valid = true;
    }
  }

  setInstance(instance) {
    if (
      instance.component.templates.header &&
      (DEFAULT_HEADER_TEMPLATES.indexOf(hashCode(instance.component.templates.header)) !== -1)
    ) {
      instance.component.templates.header = this.getRowTemplate('{{ component.label }}');
    }

    if (instance.component.templates.row &&
      (DEFAULT_ROW_TEMPLATES.indexOf(hashCode(instance.component.templates.row)) !== -1)
    ) {
      instance.component.templates.row = this.getRowTemplate('{{ getView(component, row[component.key]) }}');
    }

    this.displayedColumns = instance.component.components.map((comp) => {
      if (comp.hasOwnProperty('tableView') && !comp.tableView) {
        return false;
      }

      this.columns[comp.key] = comp;
      return comp.key;
    }).filter(name => !!name);
    const dataValue = instance.dataValue || [];
    this.colWidth = instance.component.components.length ? Math.floor(100 / instance.component.components.length) : 100;
    if (instance.component.templates && instance.component.templates.header) {
      this.header = instance.renderString(instance.component.templates.header, {
        components: instance.component.components,
        value: dataValue,
        colWidth: this.colWidth
      });
    }
    if (instance.component.templates && instance.component.templates.footer) {
      this.footer = instance.renderString(instance.component.templates.footer, {
        components: instance.component.components,
        value: dataValue,
        colWidth: this.colWidth
      });
    }
    setTimeout(() => {
      this.renderTemplate(this.headerElement, this.header);
      this.renderTemplate(this.footerElement, this.footer);
    }, 0);
    super.setInstance(instance);
  }

  addAnother() {
    const row = this.instance.addRow();
  }

  editRow(row, index) {
    const { state } = row;
    const { NEW, REMOVED } = this.RowStates;

    if (state === NEW || state === REMOVED) {
      return;
    }
    this.instance.editRow(index);
    const forms = this.forms.toArray();
    if (forms[index]) {
      forms[index].formio.submission = {data: JSON.parse(JSON.stringify(row.data))};
    }
  }

  /**
   * Updates the row template.
   *
   * @param row
   * @param index
   */
  updateRowTemplate(rowElement: ElementRef, index, comps) {
    const self = this;
    const editRow: any = {...this.instance.editRows[index]};
    if (editRow.state !== this.RowStates.NEW) {
      this.renderTemplate(rowElement, this.instance.renderString(this.instance.component.templates.row, {
        row: this.instance.dataValue[index] || {},
        data: this.instance.data,
        rowIndex: index,
        colWidth: this.colWidth,
        components: this.instance.component.components,
        getView: function getView(component, data) {
          if (!comps[component.type]) {
            comps[component.type] = Components.create(component, {}, {}, true);
          }
          return comps[component.type] ? comps[component.type].getView(data) : '';
        }
      }));
    }
  }

  /**
   * Saves a row.
   *
   * @param row - The edit grid row.
   * @param index - The index for this row.
   */
  saveRow(row, index) {
    const forms = this.forms.toArray();
    if (forms[index]) {
      const formioComponent = forms[index];
      row.data = JSON.parse(JSON.stringify(formioComponent.formio.submission.data));
      this.instance.saveRow(index);
      const rows = this.rowElements.toArray();
      if (rows && rows[index]) {
        this.updateRowTemplate(rows[index], index, {});
      }
    }
  }

  cancelRow(index) {
    this.instance.cancelRow(index);
    this.valid = true;
  }

  renderTemplate(element: ElementRef, template) {
    if (!element || !element.nativeElement) {
      return;
    }
    element.nativeElement.innerHTML = template;
  }

  ngAfterViewInit() {
    this.rowElements.changes.subscribe((rows: QueryList<ElementRef>) => {
      const rowCache = {};
      rows.forEach((row: ElementRef, index) => this.updateRowTemplate(row, index, rowCache));
    });
  }
}
EditGridComponent.MaterialComponent = MaterialEditGridComponent;
export { EditGridComponent };
