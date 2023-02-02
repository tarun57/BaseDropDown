import { Component, HostListener, forwardRef, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef,ViewChild, ElementRef, OnInit } from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from "@angular/forms";
import { ListItem, IDropdownSettings } from "./multiselect.model";
import { ListFilterPipe } from "./list-filter.pipe";

export const DROPDOWN_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MultiSelectComponent),
  multi: true
};
const noop = () => {};

@Component({
  selector: "ng-multiselect-dropdown",
  templateUrl: "./multi-select.component.html",
  styleUrls: ["./multi-select.component.scss"],
  providers: [DROPDOWN_CONTROL_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiSelectComponent implements ControlValueAccessor, OnInit {
  public _settings: IDropdownSettings | any;
  public _data: Array<ListItem> | any = [];
  public selectedItems: Array<ListItem> | any = [];
  public isDropdownOpen:any = true;
  _placeholder = "Select";
  private _sourceDataType:any = null; // to keep note of the source data type. could be array of string/number/object
  private _sourceDataFields:any; // store source data fields names
  filter: ListItem = new ListItem(this.data);
  titleValue:any = null;
  defaultSettings: IDropdownSettings = {
    singleSelection: false,
    idField: "id",
    textField: "text",
    disabledField: "isDisabled",
    enableCheckAll: true,
    selectAllText: "Select All",
    unSelectAllText: "Unselect All",
    allowSearchFilter: false,
    limitSelection: -1,
    clearSearchFilter: true,
    maxHeight: 197,
    itemsShowLimit: 999999999999,
    searchPlaceholderText: "Search",
    noDataAvailablePlaceholderText: "No data available",
    noFilteredDataAvailablePlaceholderText: "No filtered data available",
    closeDropDownOnSelection: false,
    showSelectedItemsAtTop: false,
    defaultOpen: false,
    allowRemoteDataSearch: false
  };
  public itemsShowLimit :number = 999999999;
  CogId: any;
  rowId: any;
  LabelWidth: any;
  showAblelLable :any = [];
  expandCarret= false;
  firstItemWidth = 0;
  flex_width = 0;
  listVisible: boolean = false;
  @Input()
  public set placeholder(value: string) {
    if (value) {
      this._placeholder = value;
    } else {
      this._placeholder = "Select";
    }
  }
  @Input()
  disabled = false;

  @Input()
  multiSelectCogRowId:any;

  @Input()
  public set settings(value: IDropdownSettings) {
    if (value) {
      this._settings = Object.assign(this.defaultSettings, value);
    } else {
      this._settings = Object.assign(this.defaultSettings);
    }
  }

  @Input()
  public set data(value: Array<any>) {
    if (!value) {
      this._data = [];
    } else {
      const firstItem = value[0];
      this._sourceDataType = typeof firstItem;
      this._sourceDataFields = this.getFields(firstItem);
      this._data = value.map((item: any) =>
        typeof item === "string" || typeof item === "number"
          ? new ListItem(item)
          : new ListItem({
              id: item[this._settings.idField],
              text: item[this._settings.textField],
              isDisabled: item[this._settings.disabledField],
              showCog: item.showCog ? item.showCog : false,
              baseModelTableId : item.baseModelTableId ? item.baseModelTableId: '',
              recordState : item.recordState == "Archived" ? item.recordState : "Active",
              MainTableRecordId : item.MainTableRecordId  ? item.MainTableRecordId :'',
              idForUpdate : item.idForUpdate  ? item.idForUpdate :'',
              modelPropertyId : item.modelPropertyId  ? item.modelPropertyId :'',
              idAudit : item.idAudit  ? item.idAudit :'',
              linkerTableName : item.linkerTableName  ? item.linkerTableName :'',
              hyper : item.hyper  ? item.hyper :'',
              rowId : item.rowId  ? item.rowId :'',
            })
      );
    }
    this.textWidth()
    this.cdr.detectChanges()
  }

  @Output("onFilterChange")
  onFilterChange: EventEmitter<ListItem> = new EventEmitter<any>();
  @Output("onDropDownClose")
  onDropDownClose: EventEmitter<ListItem> = new EventEmitter<any>();

  @Output("onSelect")
  onSelect: EventEmitter<ListItem> = new EventEmitter<any>();

  @Output("onDeSelect")
  onDeSelect: EventEmitter<ListItem> = new EventEmitter<any>();

  @Output("onSelectAll")
  onSelectAll: EventEmitter<Array<ListItem>> = new EventEmitter<Array<any>>();

  @Output("onDeSelectAll")
  onDeSelectAll: EventEmitter<Array<ListItem>> = new EventEmitter<Array<any>>();
 @Output("updateState")
  updateState: EventEmitter<object> = new EventEmitter<any>();
  @Output("showCogMenu")
  showCogMenu: EventEmitter<object> = new EventEmitter<any>();

  @Output("menuOpen")
  menuOpen: EventEmitter<object> = new EventEmitter<any>();
  @Input() showCog = false;
  @Input() msId:any;
  @Input() selectedDataForCog = [] = [];
  @Input() dropDownCase = 'list';
  @Input() helpTextDropdown:any;
  @ViewChild("TextWidth") public TextWidth: ElementRef | any;
  @ViewChild("flexWidth") public flexWidth: ElementRef | any;
  private onTouchedCallback: () => void = noop;
  private onChangeCallback: (_: any) => void = noop;

  onFilterTextChange(event:any) {
    this.onFilterChange.emit(event);
  }

  constructor(
    private listFilterPipe?:ListFilterPipe,
    public cdr?: ChangeDetectorRef
  ) {
    this.textWidth();
  }

  ngOnInit() {
    this.textWidth();
    this.cdr.detectChanges()
    if(this.msId.includes('hc0')){
      setTimeout(() => {
        document.getElementById('myDIV').click()

      }, 50);
    }
  }

  onItemClick(item: ListItem):any {
    if (this.disabled || item.isDisabled ) {
      return false;
    }
    item['showCog']=false;

    const found = this.isSelected(item);
    const allowAdd = this._settings.limitSelection === -1 || (this._settings.limitSelection > 0 && this.selectedItems.length < this._settings.limitSelection);
    if (!found) {
      if (allowAdd) {
        this.addSelected(item);
      }
    } else {
      this.removeSelected(item);
    }
    if (this._settings.singleSelection && this._settings.closeDropDownOnSelection) {
      this.closeDropdown();
    }
    this.createTitle();
    this.textWidth();
  }

  writeValue(value: any) {
    if (value !== undefined && value !== null && value.length > 0) {
      if (this._settings.singleSelection) {
        try {
          if (value.length >= 1) {
            const firstItem = value[0];
            this.selectedItems = [
              typeof firstItem === "string" || typeof firstItem === "number"
                ? new ListItem(firstItem)
                : new ListItem({
                    id: firstItem[this._settings.idField],
                    text: firstItem[this._settings.textField],
                    isDisabled: firstItem[this._settings.disabledField]
                  })
            ];
          }
        } catch (e) {
          // console.error(e.body.msg);
        }
      } else {
        const _data = value.map((item: any) =>
          typeof item === "string" || typeof item === "number"
            ? new ListItem(item)
            : new ListItem({
                id: item[this._settings.idField],
                text: item[this._settings.textField],
                isDisabled: item[this._settings.disabledField],
                showCog: item.showCog ? item.showCog : false,
                baseModelTableId : item.baseModelTableId ? item.baseModelTableId: '',
                recordState : item.recordState == "Archived" ? item.recordState : "Active",
                MainTableRecordId : item.MainTableRecordId  ? item.MainTableRecordId :'',
                idForUpdate : item.idForUpdate  ? item.idForUpdate :'',
                modelPropertyId : item.modelPropertyId  ? item.modelPropertyId :'',
                idAudit : item.idAudit  ? item.idAudit :'',
                linkerTableName : item.linkerTableName  ? item.linkerTableName :'',
                hyper : item.hyper  ? item.hyper :'',
                rowId : item.rowId  ? item.rowId :'',
              })
        );
        if (this._settings.limitSelection > 0) {
          this.selectedItems = _data.splice(0, this._settings.limitSelection);
        } else {
          this.selectedItems = _data;
        }
      }
    } else {
      this.selectedItems = [];
    }
    this.onChangeCallback(value);

    this.cdr.markForCheck();
  }

  // From ControlValueAccessor interface
  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  // From ControlValueAccessor interface
  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }

  // Set touched on blur
  @HostListener("blur")
  public onTouched() {
    // this.closeDropdown();
    this.onTouchedCallback();
  }

  trackByFn(item:any) {
    return item.id;
  }

  isSelected(clickedItem: ListItem) {
    if(this.helpTextDropdown) {
      let found = false;
      this.selectedItems.forEach((item:any) => {
        if (clickedItem.id === item.id || item.id == "All Views") {
          if(item.id == "All Views" && clickedItem.id == "None") {
            found = false;
          } else {
          found = true;
          }
        }
      });
      return found;
    } else {
    let found = false;
    this.selectedItems.forEach((item:any) => {
      if (clickedItem.id === item.id || clickedItem.id === item) {
        found = true;
      }
    });
    return found;
  }
  }

  isLimitSelectionReached(): boolean {
    return this._settings.limitSelection === this.selectedItems.length;
  }

  isAllItemsSelected(): boolean {
    // get disabld item count
    const filteredItems = this.listFilterPipe.transform(this._data,this.filter);
    const itemDisabledCount = filteredItems.filter((item:any) => item.isDisabled).length;
    // take disabled items into consideration when checking
    if ((!this.data || this.data.length === 0) && this._settings.allowRemoteDataSearch) {
      return false;
    }
    return filteredItems.length === this.selectedItems.length + itemDisabledCount;
  }

  showButton(): boolean {
    if (!this._settings.singleSelection) {
      if (this._settings.limitSelection > 0) {
        return false;
      }
      // this._settings.enableCheckAll = this._settings.limitSelection === -1 ? true : false;
      return true; // !this._settings.singleSelection && this._settings.enableCheckAll && this._data.length > 0;
    } else {
      // should be disabled in single selection mode
      return false;
    }
  }

  itemShowRemaining(): number {
    this.itemsShowLimit = this._settings.itemsShowLimit == 10101010 ? 9999999999 : 9999999999
    return this.selectedItems.length - ( this.itemsShowLimit ==1 ? 1 : this.itemsShowLimit+1);
  }

  createTitle():any {
    this.titleValue = '';
    for (let index = 0; index < this.selectedItems.length; index++) {
      this.selectedItems[index]['titleValue'] = ''
      this.titleValue = this.titleValue + (index != 0 ? '; ' : '') + this.selectedItems[index].text;
      this.selectedItems[index]['titleValue'] =  this.selectedItems[index].text;
    }
    return '';
  }

  addSelected(item: ListItem) {
    if (this._settings.singleSelection) {
      this.selectedItems = [];
      this.selectedItems.push(item);
    } else {
      this.selectedItems.push(item);
    }
    this.onChangeCallback(this.emittedValue(this.selectedItems));
    this.onSelect.emit(this.emittedValue(item));
  }

  removeSelected(itemSel: ListItem) {
    this.selectedItems.forEach((item:any) => {
      if (itemSel.id === item.id) {
        this.selectedItems.splice(this.selectedItems.indexOf(item), 1);
      }
    });
    this.onChangeCallback(this.emittedValue(this.selectedItems));
    this.onDeSelect.emit(this.emittedValue(itemSel));
  }

  emittedValue(val: any): any {
    const selected:any = [];
    if (Array.isArray(val)) {
      val.map((item:any) => {
       // if(item.showCog == false){
          selected.push(this.objectify(item));
       // }
      });
    } else {
      if (val) {
        return this.objectify(val);
      }
    }
    return selected;
  }

  objectify(val: ListItem) {
    if (this._sourceDataType === 'object') {
      const obj:any = {};
      obj[this._settings.idField] = val.id;
      obj[this._settings.textField] = val.text;
      if (this._sourceDataFields.includes(this._settings.disabledField)) {
        obj[this._settings.disabledField] = val.isDisabled;
      }
      return obj;
    }
    if (this._sourceDataType === 'number') {
      return Number(val.id);
    } else {
      return val.text;
    }
  }

  toggleDropdown(evt:any) {
    this.CogId = '';
    this.rowId = '';
    evt.preventDefault();
    if (this.disabled && this._settings.singleSelection) {
      return;
    }
    if(this.dropDownCase == 'list'){
    this._settings.defaultOpen = !this._settings.defaultOpen;
    if (!this._settings.defaultOpen) {
      this.onDropDownClose.emit();
     }
    }
    this.textWidth();
  }

  closeDropdown() {
    this.CogId = '';
    this.rowId = '';
    this.menuOpen.emit(null);
    this._settings.defaultOpen = false;
    // clear search text
    if (this._settings.clearSearchFilter) {
      this.filter.text = "";
    }
    this.onDropDownClose.emit();
    this.expandCarret = false;
    this.textWidth();
  }

  toggleSelectAll():any {
    if (this.disabled) {
      return false;
    }
    if (!this.isAllItemsSelected()) {
      // filter out disabled item first before slicing
      // let tempData = this._data.filter((item:any)=>item.showCog == false);
      this.selectedItems = this.listFilterPipe.transform(this._data,this.filter).filter((item:any) => !item.isDisabled).slice();
      this.selectedItems.forEach((element:any) => {
        element['showCog'] = false;
      });
      this.onSelectAll.emit(this.emittedValue(this.selectedItems));
    } else {
       this.selectedItems = [];
     // this.selectedItems = this._data.filter((item:any)=>item.showCog == true);
      this.onDeSelectAll.emit(this.emittedValue(this.selectedItems));
    }
    this.onChangeCallback(this.emittedValue(this.selectedItems));
    this.createTitle();
    this.textWidth();
  }

  getFields(inputData:any) {
    const fields:any = [];
    if (typeof inputData !== "object") {
      return fields;
    }
    // tslint:disable-next-line:forin
    for (const prop in inputData) {
      fields.push(prop);
    }
    return fields;
  }

  onCogClick(event:any,data:any){
    // this.CogId = '';
    event.stopPropagation();
    this.showCogMenu.emit({event:true});
    this.rowId = data.rowId;
    this.CogId= data.id;
    this.listVisible = true
    this.menuOpen.emit(this.CogId);

  }
  closeSpaceCog(){
    this.showCogMenu.emit({event:false})
  }
  updateCogSate(event:any,state:any,data:any){
    data['authentication'] = '';
    this.showCogMenu.emit({event:false})
    this.updateState.emit({event:event, state:state, row:data, reasonforEdit:null});
    event.stopPropagation();
  }
  changeItemshow(){
    if(this.itemsShowLimit == (this._settings.itemsShowLimit + this.itemShowRemaining)){
    this.itemsShowLimit = this._settings.itemsShowLimit == 10101010 ? 1 : 2
    }else{
      this.itemsShowLimit =  this._settings.itemsShowLimit + this.itemShowRemaining
    }
  }
  textWidth() {
    setTimeout(() => {
      this.showAblelLable = [];
      let tempwidth = 0;
      if (this.TextWidth && this.TextWidth.nativeElement.innerHTML) {
        this.LabelWidth = this.TextWidth.nativeElement.offsetWidth + 4 ;
      //  console.log('ofset width is', this.LabelWidth );
      if (document.getElementById('item_'+this.msId+'_0')) {
        this.firstItemWidth = document.getElementById('item_'+this.msId+'_0').offsetWidth;
      }
      if (document.getElementById('flex_'+this.msId)) {
        this.flex_width = document.getElementById('flex_'+this.msId).offsetWidth;
      }
        this.cdr.detectChanges();
        for (let ci = 0; ci < this.selectedItems.length; ci++) {
          //  if (this.flexWidth && this.flexWidth.nativeElement.innerHTML) {
          if (document.getElementById('item_' + this.msId + '_' + ci.toString())) {
            const itemWidth: any = document.getElementById('item_' + this.msId + '_' + ci.toString()).offsetWidth;
            tempwidth = tempwidth + itemWidth;
            this.cdr.detectChanges();
            if (tempwidth <= this.LabelWidth) {
              this.showAblelLable.push(itemWidth);
              this.cdr.detectChanges();
            }
          }
       //  }
        }
        this.cdr.detectChanges();
       // console.log('this.showAblelLable', this.showAblelLable);
      } else {
        this.textWidth();
        this.cdr.detectChanges()
      }
    }, 50);
  }
  collapseExpand() {
    this.expandCarret = !this.expandCarret;
  }
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.textWidth();

  }
}
