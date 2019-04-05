/*import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-reportdetails',
  templateUrl: './reportdetails.component.html',
  styleUrls: ['./reportdetails.component.scss']
})
export class ReportdetailsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}*/
import { Component, Input, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { style, animate, transition, trigger } from '@angular/animations';
import { PaginationInstance } from 'ngx-pagination';
import { ModalDirective } from 'ngx-bootstrap/modal';
//import { reportModel } from '../report';
import { SortableColumnModel } from 'src/app/shared/services/TableService/sortable-column.model';
//import { TransactionsService, GetTransactionsResponse } from '../service/transactions.service';
import { TableService } from 'src/app/shared/services/TableService/table.service';
import { UtilService } from 'src/app/shared/utils/util.service';
import { ActiveView } from 'src/app/forms/transactions/transactions.component';
import { TransactionsMessageService } from 'src/app/forms/transactions/service/transactions-message.service';
import { Subscription } from 'rxjs/Subscription';
import { ConfirmModalComponent } from 'src/app/shared/partials/confirm-modal/confirm-modal.component';
import { DialogService } from 'src/app/shared/services/DialogService/dialog.service';
import { FormsService, GetReportsResponse } from 'src/app/shared/services/FormsService/forms.service';
import { reportModel} from 'src/app/shared/interfaces/FormsService/FormsService';


@Component({
  selector: 'app-reportdetails',
  templateUrl: './reportdetails.component.html',
  styleUrls: ['./reportdetails.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
		trigger('fadeInOut', [
			transition(':enter', [
				style({opacity:0}),
				animate(500, style({opacity:1})) 
      ]),
				transition(':leave', [
				animate(10, style({opacity:0})) 
			])
		])
	]
})
export class ReportdetailsComponent implements OnInit, OnDestroy {

  @ViewChild('columnOptionsModal')
  public columnOptionsModal: ModalDirective; 

  @Input()
  public formType: string;
  @Input()
  public tableType: string;  
  @Input()
  public view: string; 
  @Input()
  public existingReportId: number;

  public reportsModel: Array<reportModel>;
  public filterReportsModel: Array<reportModel>;
  public totalAmount: number;
  public reportsView = ActiveView.transactions;
  public recycleBinView = ActiveView.recycleBin;

 // Local Storage Keys
 private readonly reportSortableColumnsLSK =
 'reports.rpt.sortableColumn';
 private readonly recycleSortableColumnsLSK =
 'reports.recycle.sortableColumn';
 private readonly reportCurrentSortedColLSK =
 'reports.rpt.currentSortedColumn';
 private readonly recycleCurrentSortedColLSK =
 'reports.recycle.currentSortedColumn';
 private readonly transactionPageLSK =
 'reports.rpt.page';
 private readonly recyclePageLSK =
 'reports.recycle.page';



  /**.
	 * Array of columns to be made sortable.
	 */
  private sortableColumns: SortableColumnModel[] = [];
  
  /**
	 * A clone of the sortableColumns for reverting user
   * column options on a Cancel.
	 */
	private cloneSortableColumns: SortableColumnModel[] = [];  
	
	/**
	 * Identifies the column currently sorted by name. 
	 */
  private currentSortedColumnName: string;
  
  /**
   * Subscription for messags sent from the parent component to show the PIN Column
   * options.
   */
  private showPinColumnsSubscription: Subscription;

  // ngx-pagination config
  public maxItemsPerPage: number = 100;
  public directionLinks: boolean = false;
  public autoHide: boolean = true;	
  public config: PaginationInstance;
  public numberOfPages = 0;
  
  private columnOptionCount: number = 0;
  private readonly maxColumnOption = 7;
  private allTransactionsSelected: boolean;

  constructor(
   // private _formsService: TransactionsService,
    private _transactionsMessageService: TransactionsMessageService,
    private _tableService: TableService,
    private _utilService: UtilService,
    private _dialogService: DialogService,
    private _formsService: FormsService,

  ) {
    this.showPinColumnsSubscription = this._transactionsMessageService.getMessage().subscribe(
			message => { 
        this.showPinColumns();
			}
    );
    // commeented by Mahendra on 03/26/2019
  }


  /**
   * Initialize the component.
   */
  public ngOnInit(): void {

		const paginateConfig: PaginationInstance = {
      id: 'forms__trx-table-pagination',
      itemsPerPage: 30,
      currentPage: 1
    };
    this.config = paginateConfig;

    this.getCachedValues();
    this.cloneSortableColumns = this._utilService.deepClone(this.sortableColumns);

    for (const col of this.sortableColumns) {
      if (col.checked) {
        this.columnOptionCount++;
      }
    }
    this.getPage(this.config.currentPage);
  }


  /**
   * When component is destroyed, save off user column options to be applied upon return.
   */
  public ngOnDestroy(): void {
    this.setCachedValues();
    this.showPinColumnsSubscription.unsubscribe();
  }


  /**
	 * The Transactions for a given page.
	 * 
	 * @param page the page containing the transactions to get
	 */
	public getPage(page: number) : void {
    console.log ("getPage ...");
    console.log ("this.tableType = ", this.tableType);
    console.log ("this.reportsView = ", this.reportsView);

    switch (this.tableType) {
      case this.reportsView:
        console.log (" Accessing getReportsPage ");
        this.getReportsPage(page);
        break;
      case this.recycleBinView:
        //this.getRecyclingPage(page);
        break;                           
      default:
        break;                            
    }  
  }


  /**
	 * The Transactions for a given page.
	 * 
	 * @param page the page containing the transactions to get
	 */
	public getReportsPage(page: number) : void {
    console.log(" accessing getReportsPage ...")

    this.config.currentPage = page;

    const sortedCol: SortableColumnModel =
    this._tableService.getColumnByName(this.currentSortedColumnName, this.sortableColumns);

    
    console.log("this.formType", this.formType);
    console.log("page", page);
    console.log("this.config.itemsPerPage", this.config.itemsPerPage);
    console.log("this.currentSortedColumnName", this.currentSortedColumnName);
    console.log("sortedCol", sortedCol);
    console.log("SortableColumnModel", SortableColumnModel);
    console.log("view",this.view);
    console.log("existingReportId",this.existingReportId);
  
    this._formsService.getReports(this.formType, this.view, page, this.config.itemsPerPage,
      this.currentSortedColumnName, sortedCol.descending,this.existingReportId)
      .subscribe((res: GetReportsResponse) => {
        console.log("getReportsPage res", res);
        
        console.log("getReportsPage res.reports", res.reports);

        this.reportsModel = [];
        const reportsModel = this._formsService.mapFromServerFields(res,
           this.reportsModel);

        console.log("getReportsPage reportsModel", this.reportsModel);

        this.config.totalItems = this.reportsModel.length;

        this.reportsModel = this._formsService.sortTransactions(
          this.reportsModel, this.currentSortedColumnName, sortedCol.descending);
      
        this.allTransactionsSelected = false;
      });

  }  

  

	/**
	 * Wrapper method for the table service to set the class for sort column styling.
	 * 
	 * @param colName the column to apply the class
	 * @returns string of classes for CSS styling sorted/unsorted classes
	 */
  public getSortClass(colName: string): string {
		return this._tableService.getSortClass(colName, this.currentSortedColumnName, this.sortableColumns);
  }  


	/**
	 * Change the sort direction of the table column.
	 * 
	 * @param colName the column name of the column to sort
	 */
	public changeSortDirection(colName: string) : void {
		this.currentSortedColumnName = this._tableService.changeSortDirection(colName, this.sortableColumns);
    
    // TODO this could be done client side or server side.
    // call server for page data in new direction
    this.getPage(this.config.currentPage);
  }  
  

  /**
   * Get the SortableColumnModel by name.
   * 
   * @param colName the column name in the SortableColumnModel.
   * @returns the SortableColumnModel matching the colName.
   */
  public getSortableColumn(colName: string) : SortableColumnModel {
    for (let col of this.sortableColumns) {
			if (col.colName == colName) {
				return col;
			}
		}
		return new SortableColumnModel("", false, false, false, false);
  }


  /**
   * Determine if the column is to be visible in the table.
   * 
   * @param colName 
   * @returns true if visible
   */
  public isColumnVisible(colName: string) : boolean {
    let sortableCol = this.getSortableColumn(colName);
    if (sortableCol) {
      return sortableCol.visible;
    }
    else{
      return false;
    }
  }  


  /**
   * Set the visibility of a column in the table.
   * 
   * @param colName the name of the column to make shown
   * @param visible is true if the columns should be shown
   */
  public setColumnVisible(colName: string, visible: boolean) {
    let sortableCol = this.getSortableColumn(colName);
    if (sortableCol) {
      sortableCol.visible = visible;
    }
  }  


  /**
   * Set the checked property of a column in the table.
   * The checked is true if the column option settings
   * is checked for the column.
   * 
   * @param colName the name of the column to make shown
   * @param checked is true if the columns should be shown
   */
  private setColumnChecked(colName: string, checked: boolean) {
    let sortableCol = this.getSortableColumn(colName);
    if (sortableCol) {
      sortableCol.checked = checked;
    }
  }  


  /**
   * 
   * @param colName Determine if the checkbox column option should be disabled.
   */
  public disableOption(colName: string) : boolean {
    let sortableCol = this.getSortableColumn(colName);
    if (sortableCol) {
      if(!sortableCol.checked && this.columnOptionCount > 
          (this.maxColumnOption - 1)) {
        return true;
      } 
    }
    return false;
  }


  /**
   * Toggle the visibility of a column in the table.
   * 
   * @param colName the name of the column to toggle
   * @param e the click event 
   */
  public toggleVisibility(colName: string, e: any) {

    if (!this.sortableColumns) {
      return;
    }

    // only permit 5 checked at a time
    if (e.target.checked == true) {
      this.columnOptionCount = 0;
      for (let col of this.sortableColumns) {
        if (col.checked) {
          this.columnOptionCount++;
        }
        if (this.columnOptionCount > 5) {
          this.setColumnChecked(colName, false);
          e.target.checked = false;
          this.columnOptionCount--;
          return;
        }
      }
    }
    else {
      this.columnOptionCount--;
    }

    this.applyDisabledColumnOptions();
  }  


  /**
   * Disable the unchecked column options if the max is met.
   */
  private applyDisabledColumnOptions() {
    if (this.columnOptionCount > (this.maxColumnOption - 1)) {
      for (let col of this.sortableColumns) {
        col.disabled = !col.checked;
      }
    }
    else {
      for (let col of this.sortableColumns) {
        col.disabled = false;
      } 
    }
  }


  /**
   * Save the columns to show selected by the user. 
   */
  public saveColumnOptions() {

    for (let col of this.sortableColumns) {
      this.setColumnVisible(col.colName, col.checked);
    }
    this.cloneSortableColumns = this._utilService.deepClone(this.sortableColumns);
    this.columnOptionsModal.hide();
  }


  /**
   * Cancel the request to save columns options.
   */
  public cancelColumnOptions() {
    this.columnOptionsModal.hide();
    this.sortableColumns = this._utilService.deepClone(this.cloneSortableColumns);
  }
  

  /**
   * Toggle checking all types.
   * 
   * @param e the click event 
   */
  public toggleAllTypes(e: any) {
    let checked = (e.target.checked) ? true : false;
    for (let col of this.sortableColumns) {
      this.setColumnVisible(col.colName, checked);
    }    
  }


	/**
	 * Determine if pagination should be shown.
	 */
	public showPagination() : boolean {
		if (this.config.totalItems > this.config.itemsPerPage) {
			return true;
		}
		// otherwise, no show.
		return false;
  }  


  /**
   * Edit report selected by the user.
   */
  public viewReport(report: string) : void {
    alert("View report is not yet supported");
  } 

 /**
   * Edit report selected by the user.
   */
  public editReport(report: string) : void {
    alert("Edit report is not yet supported");
  } 

  /**
   * Amend report selected by the user.
   */
  public amendReport(report: string) : void {
    alert("Amend report is not yet supported");
  }  

  /**
   * Download report as PDF selected by the user.
   */
  public downloadReportAsJSON(report: string) : void {
    alert("Download report as JSON is not yet supported");
  } 

  /**
   * Download report as PDF selected by the user.
   */
  public downloadReportAsPDF(report: string) : void {
    alert("Download report as PDF is not yet supported");
  } 

  /**
   * Delete report selected by the user.
   */
  public trashReport(report: string) : void {
    alert("Delete report is not yet supported");
  } 


   
  

  /**
   * Restore a trashed transaction from the recyle bin.
   * 
   * @param trx the Transaction to restore
   */
  /*public restoreTransaction(report: reportsModel) : void {

    this._dialogService
      .confirm('You are about to restore report ' + report.report_id, ConfirmModalComponent,'Report already exist')
      .then(res => {
        if(res === 'okay') {
          this._formsService.restoreTransaction(report)
            .subscribe( (res:GetTransactionsResponse) => {
              this.getRecyclingPage(this.config.currentPage);
          });
        } 
        else if(res === 'cancel') {
        }
      });
  }*/


  /**
   * Determine the item range shown by the server-side pagination.
   */
  public determineItemRange() : string {

    let start = 0;
    let end = 0;
    this.numberOfPages = 0;
    this.config.currentPage = this._utilService.isNumber(this.config.currentPage) ? 
      this.config.currentPage : 1;

    if (!this.reportsModel) {
      return;
    }

    if (this.config.currentPage > 0 && this.config.itemsPerPage > 0
        && this.reportsModel.length > 0) {
      this.calculateNumberOfPages();

      if (this.config.currentPage == this.numberOfPages) {
        end = this.reportsModel.length;
        start = (this.config.currentPage -1) * this.config.itemsPerPage + 1;
      }
      else {
        end = this.config.currentPage * this.config.itemsPerPage;
        start = (end - this.config.itemsPerPage) + 1;
      }
    }
    return start + " - " + end;
  }


  /**
   * Show the option to select/deselect columns in the table.
   */
  public showPinColumns() {
    this.applyDisabledColumnOptions();
    this.columnOptionsModal.show();
  }


  /**
   * Check/Uncheck all transactions in the table.
   */
  public changeAllTransactionsSelected() {
    for (let t of this.reportsModel) {
      //t.selected = this.allTransactionsSelected;
      //MSM commented
    }
  } 


  /**
   * Check if the view to show is Transactions.
   */
  public isTransactionViewActive() {
    return this.tableType == this.reportsView ? true : false;
  }


  /**
   * Check if the view to show is Recycle Bin.
   */
  public isRecycleBinViewActive() {
    return this.tableType == this.recycleBinView ? true : false;
  }   


  /**
   * Get the current sorted column from the cache and apply it to the component.
   * @param key the key to the value in the local storage cache
   */
  private applyCurrentSortedColCache(key: string) {
    let currentSortedColumnJson: string|null = 
      localStorage.getItem(key);
    let currentSortedColumnL: SortableColumnModel = null;
    if (currentSortedColumnJson) {
      currentSortedColumnL = JSON.parse(currentSortedColumnJson);
      
      // sort by the column direction previously set
      this.currentSortedColumnName = this._tableService.setSortDirection(currentSortedColumnL.colName, 
        this.sortableColumns, currentSortedColumnL.descending);
    }
    else {
      this.setSortDefault();
    }
  }


  /**
   * Get the current page from the cache and apply it to the component.
   * @param key the key to the value in the local storage cache
   */
  private applyCurrentPageCache(key: string) {
    let currentPageCache: string = 
      localStorage.getItem(key);
    if (this._utilService.isNumber(currentPageCache)) {
      this.config.currentPage = this._utilService.toInteger(currentPageCache);
    }
    else {
      this.config.currentPage = 1;
    }
  }

  
  private setCachedValues() {
    switch (this.tableType) {
      case this.reportsView:
        this.setCacheValuesforView(this.reportSortableColumnsLSK,
          this.reportCurrentSortedColLSK, this.transactionPageLSK);
        break;
     /* case this.recycleBinView:
        this.setCacheValuesforView(this.recycleSortableColumnsLSK, 
          this.recycleCurrentSortedColLSK, this.recyclePageLSK);
        break;*/
      default:
        break;
    }
  }


  private setCacheValuesforView(columnsKey: string, sortedColKey: string,
    pageKey: string) {

  // shared between trx and recycle tables
  localStorage.setItem(columnsKey,
    JSON.stringify(this.sortableColumns));

  const currentSortedCol = this._tableService.getColumnByName(
    this.currentSortedColumnName, this.sortableColumns);
  localStorage.setItem(sortedColKey, JSON.stringify(this.sortableColumns));

  if (currentSortedCol) {
    localStorage.setItem(sortedColKey, JSON.stringify(currentSortedCol));
  }
  localStorage.setItem(pageKey, this.config.currentPage.toString());
}

  /**
   * Set the Table Columns model.
   */
  private setSortableColumns() : void {
    // sort column names must match the domain model names
    let defaultSortColumns = ['form_type', 'status', 'fec_id', 'amend_ind', 'cvg_start_date', 'cvg_end_date', 'report_type_desc','filed_date', 'last_update_date'];

    /*let otherSortColumns = ['street', 'city', 'state', 'zip', 'aggregate', 'purposeDescription',  
      'contributorEmployer', 'contributorOccupation', 'memoCode', 'memoText',];*/

    this.sortableColumns = [];
    for (let field of defaultSortColumns) {
      this.sortableColumns.push(new SortableColumnModel(field, false, true, true, false));
    }  
    /*for (let field of otherSortColumns) {
      this.sortableColumns.push(new SortableColumnModel(field, false, false, false, true));
    }*/

    console.log (" setSortableColumns this.sortableColumns = ", this.sortableColumns);
  }


  /**
   * Set the UI to show the default column sorted in the default direction.
   */
  private setSortDefault() : void {
    this.currentSortedColumnName = this._tableService.setSortDirection('form_type', 
      this.sortableColumns, false);
  }


  private calculateNumberOfPages() : void {

    if (this.config.currentPage > 0 && this.config.itemsPerPage > 0) {
      if (this.reportsModel && this.reportsModel.length > 0) {
        this.numberOfPages =  this.reportsModel.length / this.config.itemsPerPage;
        this.numberOfPages = Math.ceil(this.numberOfPages);
      }
    }
  }

  private getCachedValues() {
    switch (this.tableType) {
      case this.reportsView:
        this.applyColCache(this.reportSortableColumnsLSK);
        this.applyCurrentSortedColCache(this.reportCurrentSortedColLSK);
        this.applyCurrentPageCache(this.transactionPageLSK);
        break;
      default:
        break;
    }
  }
  private applyColCache(key: string) {
    const sortableColumnsJson: string | null = localStorage.getItem(key);
    if (localStorage.getItem(key) != null) {
      this.sortableColumns = JSON.parse(sortableColumnsJson);
    } else {
      // Just in case cache has an unexpected issue, use default.
      this.setSortableColumns();
    }
  }
}
