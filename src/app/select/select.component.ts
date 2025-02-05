import { AsyncPipe, NgClass, NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  input,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { MatOptgroup, MatOption } from '@angular/material/core';
import {
  MatError,
  MatFormField,
  MatHint,
  MatLabel,
  MatSuffix,
} from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { map, Observable, of, startWith, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  standalone: true,
  imports: [
    MatFormField,
    NgClass,
    MatLabel,
    MatInput,
    FormsModule,
    MatAutocompleteTrigger,
    ReactiveFormsModule,
    MatIcon,
    MatSuffix,
    MatTooltip,
    MatAutocomplete,
    MatOptgroup,
    MatOption,
    NgTemplateOutlet,
    MatHint,
    MatError,
    AsyncPipe,
  ],
})
export class SelectComponent implements OnInit, OnDestroy, AfterViewInit {
  private renderer = inject(Renderer2);
  private cdr = inject(ChangeDetectorRef);
  @Input() fieldCtrl!: any;
  dropdownList: any[] = [];
  filteredList$: Observable<any[]> = of([]);
  @ViewChild('dummyInput') dummyInput!: ElementRef;
  @ViewChild(MatAutocompleteTrigger)
  autocompleteTrigger!: MatAutocompleteTrigger;
  @ViewChild('inputElement') inputElement!: ElementRef;
  @Input('dropdownList') set updateDropdownList(data: any[]) {
    if (data?.length) {
      this.dropdownList = data;
      this.filteredList$ = of(this.dropdownList);
      this.getFilteredList();
      if (
        this.valueProperty() &&
        this.inputElement &&
        this.fieldCtrl?.value !== null &&
        this.fieldCtrl?.value !== undefined
      ) {
        this.renderer.setProperty(
          this.inputElement?.nativeElement,
          'value',
          this.displayTemplate(this.fieldCtrl.value)
        );

        this.cdr.detectChanges();
      }
      setTimeout(() => {
        this.setSelectedDropdown();
      }, 0);
    } else {
      this.dropdownList = [];
      this.filteredList$ = of(this.dropdownList);
      if (this.renderer && this.inputElement) {
        this.renderer.setProperty(this.inputElement.nativeElement, 'value', '');
        this.cdr.detectChanges();
      }
      this.getFilteredList();
    }
  }
  selectedValue: any;

  isReadOnly = input<boolean>(false);
  showNoResultsFound = input<boolean>(true);
  appearance = input<'fill' | 'outline'>('fill');
  placeholder = input<string>('Select');
  className = input<string>('');
  panelWidth = input<string>('');
  hintText = input<string>('');
  errorText = input<string>('');
  errorType = input<string>('required');
  clearOnFocus = input<boolean>(true);
  hideUnderline = input<boolean>(false);
  multiSelect = input<boolean>(false);
  isGrouped = input<boolean>(false);
  groupLabel = input<string>('');
  groupKey = input<string>('');
  optionIconName = input<string>('');
  optionIconProperty = input<string>('');
  optionIconClassName = input<string>('');
  optionIconTooltip = input<string>('');
  valueProperty = input<string>('');
  isDefaultIcon = input<boolean>(false);
  defaultIconTooltip = input<string>('');
  defaultIconProperty = input<string>('isDefault');
  iconPosition = input<'before' | 'after'>('before');
  isRequired = input<boolean>(false);
  subscriptSizing = input<'dynamic' | 'fixed'>('fixed');
  itemTemplate = input<TemplateRef<any> | null>(null);
  displayProperty = input<string>('');

  public typingAllowed = false;

  _previousSelectedValue: any;
  public userStartedTyping = false;

  private _destroy$: Subject<boolean> = new Subject<boolean>();

  /**
   * The name of the Material Icon to be used. Default is an empty string.
   */

  @Input('selectedValue') set updateSelectedValue(selectedValue: any) {
    this.selectedValue = selectedValue;

    if (this.dropdownList.length > 0 && this.isValidValue()) {
      this._previousSelectedValue = selectedValue;
    }
  }

  @Output() optionSelected: EventEmitter<any> = new EventEmitter<any>();

  ngOnInit(): void {
    this.getFilteredList();
  }

  // implement _selectViaInteraction method to add check mark beside selected option based on multiple
  ngAfterViewInit() {
    this.setSelectedDropdown();
  }

  getFilteredList() {
    this.filteredList$ = this.fieldCtrl?.valueChanges.pipe(
      startWith(''),
      map((value) =>
        this.isGrouped() ? this.filterGroupList(value) : this.filterList(value)
      ),
      takeUntil(this._destroy$)
    );
  }

  private filterList(value: any) {
    return this.dropdownList.filter((option) =>
      (option[this.displayProperty()] ?? option)
        .toString()
        ?.toLowerCase()
        .includes(
          (typeof value === 'string' || typeof value === 'number' ? value : '')
            ?.toString()
            .toLowerCase()
        )
    );
  }

  private filterGroupList(value: unknown) {
    return this.dropdownList
      .map((group) => ({
        [this.groupLabel()]: group[this.groupLabel()],
        [this.groupKey()]: this._filter(group[this.groupKey()] ?? group, value),
        isDisabled: group?.isDisabled ?? false,
        toolTip: group?.toolTip ?? '',
      }))
      .filter((option) => option[this.groupKey()].length > 0);
  }

  _filter = (opt: any[], value: unknown): unknown[] => {
    return opt.filter((item) =>
      (item[this.displayProperty()] ?? item)
        .toLowerCase()
        .includes((typeof value === 'string' ? value : '').toLowerCase())
    );
  };

  onOptionSelected(event: any) {
    const selectedValue = event.option.value;
    this.selectedValue = selectedValue;
    this._previousSelectedValue = selectedValue;
    this.getFilteredList();
    if (this.selectedValue) {
      this.optionSelected.emit(this.selectedValue);
    }
  }

  get selectedObject() {
    return (
      this.dropdownList.find(
        (option) => option[this.valueProperty()] === this.fieldCtrl?.value
      ) || null
    );
  }

  displayTemplate = (value: any): string => {
    if (value === null || value === undefined) return '';

    if (this.valueProperty && typeof value !== 'object') {
      // If selectedProperty is provided, find the full object using the selected value
      let selectedObject: any;

      if (this.isGrouped()) {
        // When isGrouped is true, loop through the groups to find the selected object
        for (const group of this.dropdownList) {
          selectedObject = group[this.groupKey()]?.find(
            (option: any) => option[this.valueProperty()] === value
          );
          if (selectedObject) break; // Stop searching once the object is found
        }
      } else {
        // If not grouped, directly find the object in the dropdownList
        selectedObject = this.dropdownList.find(
          (option) => option[this.valueProperty()] === value
        );
      }

      return selectedObject?.[this.displayProperty()] ?? '';
    }
    return typeof value === 'object'
      ? value[this.displayProperty()] ?? ''
      : value.toString();
  };

  toggleDropdown() {
    if (this.typingAllowed) {
      setTimeout(() => {
        this.autocompleteTrigger.closePanel();
        this.dummyInput.nativeElement.focus();
      }, 100);
    } else {
      if (!this.isReadOnly) this.autocompleteTrigger.openPanel();
    }
  }

  // TODO : Keyboard navigation for grouped not working
  onAutocompleteOpened() {
    this.typingAllowed = true;
    this.getFilteredList();
    setTimeout(() => {
      if (this.autocompleteTrigger.panelOpen) {
        let selectedOptionIndex = -1;
        let selectedOption: any = null;
        this.autocompleteTrigger.autocomplete.options
          .toArray()
          .some((ele: MatOption, index: number) => {
            let isMatch = false;
            if (this.valueProperty()) {
              isMatch = ele.value === this.selectedValue;
            } else {
              if (typeof ele.value !== 'object') {
                isMatch = ele.value === this.selectedValue;
              } else {
                isMatch =
                  (ele.value?.id && ele.value?.id === this.selectedValue?.id) ||
                  ele.value?.[this.displayProperty()] ===
                    this.selectedValue?.[this.displayProperty()];
              }
            }
            if (isMatch) {
              selectedOptionIndex = index;
              selectedOption = ele;
              setTimeout(() => {
                this.autocompleteTrigger.autocomplete._keyManager.setActiveItem(
                  selectedOption
                );
              }, 0);
              return true;
            }
            return false;
          });
        if (this.isGrouped() && selectedOptionIndex > -1) {
          const indexes = this.findIndexById(
            this.dropdownList,
            this.valueProperty() ? this.selectedValue : this.selectedValue?.id
          );
          if (indexes.objectIndex !== -1 && indexes.parentIndex !== -1) {
            this.autocompleteTrigger.autocomplete.panel.nativeElement.children[
              indexes.parentIndex
            ].children[indexes.objectIndex].scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }
        } else if (selectedOptionIndex > -1) {
          selectedOption
            ?._getHostElement()
            .scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 0);
  }

  findIndexById(groupData: any[], id: number) {
    for (let i = 0; i < groupData.length; i++) {
      for (let j = 0; j < groupData[i][this.groupKey()].length; j++) {
        if (groupData[i][this.groupKey()][j]?.id === id) {
          return { parentIndex: i, objectIndex: j };
        }
      }
    }
    return { parentIndex: -1, objectIndex: -1 };
  }

  private isValidValue() {
    if (
      this.fieldCtrl?.value === null ||
      this.fieldCtrl?.value === undefined ||
      !this.dropdownList.length
    ) {
      return false;
    }

    if (this.isGrouped()) {
      for (const group of this.dropdownList) {
        const foundInGroup = group[this.groupKey()].find(
          (option: any) =>
            this.fieldCtrl.value ===
            (this.valueProperty ? option[this.valueProperty()] : option)
        );
        if (foundInGroup) {
          return true;
        }
      }
      return false;
    }
    return (
      (this.displayProperty() &&
        this.fieldCtrl.value[this.displayProperty()]) ||
      this.dropdownList.findIndex(
        (ele: any) =>
          this.fieldCtrl.value ===
          (this.valueProperty ? ele[this.valueProperty()] : ele)
      ) > -1
    );
  }

  onAutocompleteClosed() {
    this.typingAllowed = false;
    this.userStartedTyping = false;
    if (!this.isValidValue() && this.dropdownList.length > 0) {
      this.fieldCtrl.setValue(this._previousSelectedValue);
      this.getFilteredList();
    }
    this.dummyInput.nativeElement.focus();
  }

  onEscapeKeyDown(event: Event) {
    event.stopPropagation();
    if (this.typingAllowed) {
      this.autocompleteTrigger.closePanel();
      this.dummyInput.nativeElement.focus();
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (
      event.code !== 'Escape' &&
      this.typingAllowed &&
      this.clearOnFocus() &&
      !this.userStartedTyping
    ) {
      this.fieldCtrl.setValue('');
      this.userStartedTyping = true;
      this.getFilteredList();
    }
  }

  // TODO : Remove this once the issue is closed https://github.com/angular/components/issues/7246
  setSelectedDropdown() {
    const selectedOption = this.autocompleteTrigger.autocomplete.options
      .toArray()
      .find((ele: MatOption) => {
        if (this.valueProperty()) {
          return ele.value === this.selectedValue;
        } else {
          return typeof ele.value !== 'object'
            ? ele.value === this.selectedValue
            : (ele.value?.id && ele.value?.id === this.selectedValue?.id) ||
                ele.value?.[this.displayProperty()] ===
                  this.selectedValue?.[this.displayProperty()];
        }
      });

    if (selectedOption) selectedOption?._selectViaInteraction();
  }

  ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }
}
