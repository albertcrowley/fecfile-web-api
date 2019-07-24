import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/of';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';
//import { TransactionModel } from '../model/report.model';
import { reportModel } from '../model/report.model';
import { OrderByPipe } from 'src/app/shared/pipes/order-by/order-by.pipe';
import { FilterPipe, FilterTypeEnum } from 'src/app/shared/pipes/filter/filter.pipe';
import { ReportFilterModel } from '../model/report-filter.model';
import { DatePipe } from '@angular/common';
import { ZipCodePipe } from 'src/app/shared/pipes/zip-code/zip-code.pipe';
import { ActiveView } from '../reportheader/reportheader.component';


export interface GetReportsResponse {
  reports: reportModel[];
  totalreportsCount: number;
}
@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  // only for mock data
  // only for mock data
  // only for mock data

  /** The array of items to show in the recycle bin. TODO rename it */
  private mockRestoreTrxArray = [];
  /** The array of items trashed from the transaction table to be added to the recyle bin */
  //private mockTrashedTrxArray: Array<TransactionModel> = [];
  /** The array of items restored from the recycle bin to be readded to the transactions table. TODO rename */
  private mockRecycleBinArray = [];
  private mockTransactionId = 'TID12345';
  private mockTransactionIdRecycle = 'TIDRECY';

  // only for mock data - end
  // only for mock data - end
  // only for mock data - end


  // May only be needed for mocking server
  private _orderByPipe: OrderByPipe;
  private _filterPipe: FilterPipe;
  private _zipCodePipe: ZipCodePipe;
  private _datePipe: DatePipe;

  constructor(
    private _http: HttpClient,
    private _cookieService: CookieService,
  ) {
    
    this._orderByPipe = new OrderByPipe();
    this._filterPipe = new FilterPipe();
    this._zipCodePipe = new ZipCodePipe();
    this._datePipe = new DatePipe('en-US');
  }


  public getFormTypes(): Observable<any> {
    const token: string = JSON.parse(this._cookieService.get('user'));
    let httpOptions =  new HttpHeaders();
    let url = '';
    let params = new HttpParams();

    url = '/core/get_FormTypes';

    httpOptions = httpOptions.append('Content-Type', 'application/json');
    httpOptions = httpOptions.append('Authorization', 'JWT ' + token);

    return this._http
       .get(
          `${environment.apiUrl}${url}`,
          {
            headers: httpOptions
          }
       );
  }

  public getReportTypes(): Observable<any> {
    const token: string = JSON.parse(this._cookieService.get('user'));
    let httpOptions =  new HttpHeaders();
    let url = '';
    let params = new HttpParams();

    url = '/core/get_ReportTypes';

    httpOptions = httpOptions.append('Content-Type', 'application/json');
    httpOptions = httpOptions.append('Authorization', 'JWT ' + token);

    return this._http
       .get(
          `${environment.apiUrl}${url}`,
          {
            headers: httpOptions
          }
       );
  }
  public getStatuss(): Observable<any> {
    const token: string = JSON.parse(this._cookieService.get('user'));
    let httpOptions =  new HttpHeaders();
    let url = '';
    let params = new HttpParams();

    url = '/core/get_Statuss';

    httpOptions = httpOptions.append('Content-Type', 'application/json');
    httpOptions = httpOptions.append('Authorization', 'JWT ' + token);

    return this._http
       .get(
          `${environment.apiUrl}${url}`,
          {
            headers: httpOptions
          }
       );
  }
  public getAmendmentIndicators(): Observable<any> {
    const token: string = JSON.parse(this._cookieService.get('user'));
    let httpOptions =  new HttpHeaders();
    let url = '';
    let params = new HttpParams();

    url = '/core/get_AmendmentIndicators';

    httpOptions = httpOptions.append('Content-Type', 'application/json');
    httpOptions = httpOptions.append('Authorization', 'JWT ' + token);

    return this._http
       .get(
          `${environment.apiUrl}${url}`,
          {
            headers: httpOptions
          }
       );
  }

  public getReports(view: string, page: number, itemsPerPage: number,
    sortColumnName: string, descending: boolean, filter: ReportFilterModel, reportId: number): Observable<any> {
  const token: string = JSON.parse(this._cookieService.get('user'));
  let httpOptions =  new HttpHeaders();
  let params = new HttpParams();
  
  const url ='/f99/get_form99list';   

  httpOptions = httpOptions.append('Content-Type', 'application/json');
  httpOptions = httpOptions.append('Authorization', 'JWT ' + token);
  
  params = params.append('view', view);
  params = params.append('reportId', reportId.toString());

  console.log("${environment.apiUrl}${url}", `${environment.apiUrl}${url}`);
  
  return this._http
  .get(
      `${environment.apiUrl}${url}`,
      {
        headers: httpOptions,
        params 
      }
    );
  
  
    }
  
  /**
   * Map server fields from the response to the model.
   */
  public mapFromServerFields(serverData: any) {
    if (!serverData || !Array.isArray(serverData)) {
      return;
    }

    const modelArray: any = [];
   
    for (const row of serverData) {
      const model = new reportModel({});
      model.form_type = row.form_type;
      model.status = row.status;
      model.report_id = row.report_id;
      model.fec_id = row.fec_id;
      model.amend_ind = row.amend_ind;
      model.cvg_start_date = row.cvg_start_date;
      model.cvg_end_date = row.cvg_end_date;
      model.last_update_date = row.last_update_date;
      model.report_type_desc = row.report_type_desc;
      model.filed_date = row.filed_date;
      modelArray.push(model);
    }

    return modelArray;
  }

  /**
   *
   * @param array
   * @param sortColumnName
   * @param descending
   */
  public sortReports(array: any, sortColumnName: string, descending: boolean) {

    const direction = descending ? -1 : 1;
    this._orderByPipe.transform(array, {property: sortColumnName, direction: direction});
    return array;
      
  }



    /**
   * Some data from the server is formatted for display in the UI.  Users will search
   * on the reformatted data.  For the search filter to work against the formatted data,
   * the server array must also contain the formatted data.  They will be added her.
   * 
   * @param response the server data
   */
  public mockAddUIFileds(response: any) {
    for (const trx of response.transactions) {
      trx.transaction_date_ui = this._datePipe.transform(trx.transaction_date, 'MM/dd/yyyy');
      trx.deleted_date_ui = this._datePipe.transform(trx.deleted_date, 'MM/dd/yyyy');
    }
  }


  /**
   * This method handles filtering the transactions array and will be replaced
   * by a backend API.
   */
  public mockApplyFilters(response: any, filters: ReportFilterModel){

    if (!response) {
      return;
    }

    if (!filters) {
      return;
    }

    let isFilter = false;

    if (filters.filterForms) {
       if (filters.filterForms.length > 0) {
        isFilter = true;
        const fields = ['form_type'];
        let filteredformArray = [];
        for (const form of filters.filterForms) {
          const filtered = this._filterPipe.transform(response.reports, fields, form);
          filteredformArray = filteredformArray.concat(filtered);
        }
        response.reports= filteredformArray;
      }
      
    }

    if (filters.filterReports) {
       if (filters.filterReports.length > 0) {
        isFilter = true;
        const fields = ['report_type'];
        let filteredreportArray = [];
        for (const report of filters.filterReports) {
          const filtered = this._filterPipe.transform(response.reports, fields, report);
          filteredreportArray = filteredreportArray.concat(filtered);
        }
        response.reports= filteredreportArray;
       }
      
    } 
    
    if (filters.filterStatuss) {
      if (filters.filterStatuss.length > 0) {
        isFilter = true;
        const fields = ['status'];
        let filteredStatusArray = [];
        for (const status of filters.filterStatuss) {
          const filtered = this._filterPipe.transform(response.reports, fields, status);
          filteredStatusArray = filteredStatusArray.concat(filtered);
        }
        response.reports= filteredStatusArray;
      }
      
    }  

    if (filters.filterAmendmentIndicators) {
      if (filters.filterAmendmentIndicators.length > 0) {
        isFilter = true;
        const fields = ['amend_ind'];
        let filteredAmendmentArray = [];
        for (const AmendmentIndicator of filters.filterAmendmentIndicators) {
          const filtered = this._filterPipe.transform(response.reports, fields, AmendmentIndicator);
          filteredAmendmentArray = filteredAmendmentArray.concat(filtered);
        }
        response.reports= filteredAmendmentArray;
      }
      
    }  


    if (filters.filterCvgDateFrom && filters.filterCvgDateTo) {
      const cvgFromDate = new Date(filters.filterCvgDateFrom);
      const cvgToDate = new Date(filters.filterCvgDateTo);
      const filteredCvgDateArray = [];
      for (const rep of response.reports) {
        if (rep.cvg_start_date) {
          const repDate = new Date(rep.cvg_start_date);
          if (repDate >= cvgFromDate &&
            repDate <= cvgToDate) {
            isFilter = true;
          }
          else { 
            isFilter = false;
          }
        }

        if (isFilter){
          if (rep.cvg_end_date) {
            const repDate = new Date(rep.cvg_end_date);
            if (repDate >= cvgFromDate &&
              repDate <= cvgToDate) {
              isFilter = true;
            }
            else { 
              isFilter = false;
            }
          }
        }

        if (isFilter){
          filteredCvgDateArray.push(rep);    
        }

      }
      response.reports = filteredCvgDateArray;
    }

    if (filters.filterFiledDateFrom && filters.filterFiledDateTo ) {
      const filedFromDate = this.getDateMMDDYYYYformat(new Date(filters.filterFiledDateFrom));
      const filedToDate =  this.getDateMMDDYYYYformat(new Date(filters.filterFiledDateTo));
      const filteredFiledDateArray = [];
      for (const rep of response.reports) {

        if (rep.status==='Filed') {
          if (rep.filed_date) {
            let d= new Date(rep.filed_date);
            d.setUTCHours(0,0,0,0);
            const repDate =  this.getDateMMDDYYYYformat(d);

            if (repDate >= filedFromDate && repDate <= filedToDate) {
              isFilter = true;
            }
            else { 
              isFilter = false;
            }
         }
        }
        else if (rep.status==='Saved') {
          if (rep.last_update_date) {
            //const repDate =  this.getDateMMDDYYYYformat(new Date(rep.last_update_date));
            let d= new Date(rep.last_update_date);
            d.setUTCHours(0,0,0,0);
            const repDate =  this.getDateMMDDYYYYformat(d);
            if (repDate >= filedFromDate && repDate <= filedToDate) {
              isFilter = true;
            }
            else { 
              isFilter = false;
            }
         }
        }

        if (isFilter){
          filteredFiledDateArray.push(rep);    
        }
      }
      
      response.reports = filteredFiledDateArray;
    }

    
  }
  private getDateMMDDYYYYformat(dateValue:Date):string{
    var year = dateValue.getUTCFullYear()+"";
    var month = (dateValue.getUTCMonth()+1)+"";
    var day = dateValue.getUTCDate()+"";
    return month + day  +year;
  }
  
  public getReportInfo(form_type: string, report_id: string): Observable<any> {
    let token: string = JSON.parse(this._cookieService.get('user'));
    let httpOptions =  new HttpHeaders();
    let params = new HttpParams();
    let url: string = '';
    
    
    console.log("form_type =",form_type);
    console.log("report_id =",report_id);

    if (form_type==='F99'){
      url = '/f99/get_f99_report_info';
    } else if (form_type==='F3X'){
      url = '/core/get_report_info';
    }
    
    httpOptions = httpOptions.append('Content-Type', 'application/json');
    httpOptions = httpOptions.append('Authorization', 'JWT ' + token);

    //params = params.append('committeeid', committee_id);
    params = params.append('reportid', report_id);
    console.log ("params =", params);
    console.log("${environment.apiUrl}${url} =",`${environment.apiUrl}${url}`);

    return this._http
     .get(
        `${environment.apiUrl}${url}`,
        {
          headers: httpOptions,
          params
        }
      )
  }
}
