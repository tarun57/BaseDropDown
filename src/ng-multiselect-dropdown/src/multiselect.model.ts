export interface IDropdownSettings {
  singleSelection?: boolean;
  idField?: string;
  textField?: string;
  disabledField?: string;
  enableCheckAll?: boolean;
  selectAllText?: string;
  unSelectAllText?: string;
  allowSearchFilter?: boolean;
  clearSearchFilter?: boolean;
  maxHeight?: number;
  itemsShowLimit?: number;
  limitSelection?: number;
  searchPlaceholderText?: string;
  noDataAvailablePlaceholderText?: string;
  noFilteredDataAvailablePlaceholderText?: string;
  closeDropDownOnSelection?: boolean;
  showSelectedItemsAtTop?: boolean;
  defaultOpen?: boolean;
  allowRemoteDataSearch?: boolean;
}

export class ListItem {
  id: String | number;
  text: String | number;
  isDisabled?: boolean;
  showCog?:boolean;
  baseModelTableId?:String | number;
  recordState?:String | number;
  MainTableRecordId?:String | number;
  modelPropertyId?:String | number;
  idForUpdate?:String | number;
  idAudit?:String | number;
  linkerTableName?:String | number;
  hyper?:String | number;
  rowId?:String | number;  

  public constructor(source: any) {
    if (typeof source === 'string' || typeof source === 'number') {
      this.id = this.text = source;
      this.isDisabled;
    }
    if (typeof source === 'object') {
      this.id = source.id;
      this.text = source.text;
      this.isDisabled = source.isDisabled;
      this.showCog = source.showCog ? source.showCog : false;
      this.baseModelTableId = source.baseModelTableId ? source.baseModelTableId :'';
      this.recordState = source.recordState ? source.recordState : '';
      this.MainTableRecordId = source.MainTableRecordId ? source.MainTableRecordId : '';
      this.idForUpdate = source.idForUpdate ? source.idForUpdate : '';
      this.modelPropertyId = source.modelPropertyId ? source.modelPropertyId : '';
      this.idAudit = source.idAudit ? source.idAudit : '';
      this.linkerTableName = source.linkerTableName ? source.linkerTableName : '';
      this.hyper = source.hyper ? source.hyper : '';
      this.rowId = source.rowId ? source.rowId : '';
    }
  }
}
