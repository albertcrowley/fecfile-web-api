import { Component, EventEmitter, ElementRef, HostListener, OnInit, Input, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { form3x } from '../../../shared/interfaces/FormsService/FormsService';
import { MessageService } from '../../../shared/services/MessageService/message.service';
import { ValidateComponent } from '../../../shared/partials/validate/validate.component';
import { FormsService } from '../../../shared/services/FormsService/forms.service';
import { ReportTypeService } from './report-type.service';
import { form3x_data, Icommittee_form3x_reporttype, form3XReport} from '../../../shared/interfaces/FormsService/FormsService';


@Component({
  selector: 'f3x-report-type',
  templateUrl: './report-type.component.html',
  styleUrls: ['./report-type.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ReportTypeComponent implements OnInit {

  @Output() status: EventEmitter<any> = new EventEmitter<any>();
  @Input() committeeReportTypes: any = [];
  @Input() selectedReportInfo: any = {};

  public frmReportType: FormGroup;
  public fromDateSelected: boolean = false;
  public reportTypeSelected: string = '';
  public isValidType: boolean = false;
  public optionFailed: boolean = false;
  public screenWidth: number = 0;
  public reportType: string = null;
  public toDateSelected: boolean = false;
  public tooltipPosition: string = 'right';
  public tooltipLeft: string = 'auto';

  private _dueDate: string = null;
  private _formType: string = null;
  private _form3xReportTypeDetails: any = null;
  private _fromDateSelected: string = null;
  private _reportTypeDescripton: string = null;
  private _selectedElectionState: string = null;
  private _selectedElectionDate: string = null;
  private _toDateSelected: string = null;

  constructor(
    private _fb: FormBuilder,
    private _router: Router,
    private _messageService: MessageService,
    private _formService: FormsService,
    private _reportTypeService: ReportTypeService,
    private _activatedRoute: ActivatedRoute
  ) {
    this._messageService.clearMessage();
  }

  ngOnInit(): void {

    this._formType = this._activatedRoute.snapshot.paramMap.get('form_id');

    if (localStorage.getItem(`form_${this._formType}_saved`) === null) {
      localStorage.setItem(`form_${this._formType}_saved`, JSON.stringify(false));
    }

    this._messageService
      .clearMessage();

    this.screenWidth = window.innerWidth;

    if(this.screenWidth < 768) {
      this.tooltipPosition = 'bottom';
      this.tooltipLeft = '0';
    } else if (this.screenWidth >= 768) {
      this.tooltipPosition = 'right';
      this.tooltipLeft = 'auto';
    }

    this.frmReportType = this._fb.group({
      reportTypeRadio: ['', Validators.required]
    });

    this._form3xReportTypeDetails = {
      cmteId: '',
      reportId: '',
      formType: '3X',
      electionCode: '',
      reportType: '',
      reportTypeDescription: '',
      regularSpecialReportInd: '',
      stateOfElection: '',
      electionDate: '',
      cvgStartDate: '',
      cvgEndDate: '',
      dueDate: '',
      amend_Indicator: '',
      coh_bop: '0'
    };

    console.log('this.frmReportType: ', this.frmReportType);
  }

  ngDoCheck(): void {
    if (this.selectedReportInfo) {
      if (this.selectedReportInfo.hasOwnProperty('toDate')) {
        if (typeof this.selectedReportInfo.toDate === 'string') {
          if (this.selectedReportInfo.toDate.length >= 1) {
            this._toDateSelected = this.selectedReportInfo.toDate;
            this.toDateSelected = true;
          } else {
            this.toDateSelected = false;
          }
        } else {
          this.toDateSelected = false;
        }
      }

      if (this.selectedReportInfo.hasOwnProperty('fromDate')) {
        if (typeof this.selectedReportInfo.fromDate === 'string') {
          if (this.selectedReportInfo.fromDate.length >= 1) {
            this._fromDateSelected = this.selectedReportInfo.fromDate;
            this.fromDateSelected = true;
          } else {
            this.fromDateSelected = false;
          }
        } else {
          this.fromDateSelected = false;
        }
      }

      if (typeof this.selectedReportInfo.selectedState === 'string') {
        this._selectedElectionState = this.selectedReportInfo.selectedState;
      } else {
        this._selectedElectionState = null;
      }

      if (typeof this.selectedReportInfo.selectedElectionDate === 'string') {
        this._selectedElectionDate = this.selectedReportInfo.selectedElectionDate;
      } else {
        this._selectedElectionDate = null;
      }

      if (typeof this.selectedReportInfo.dueDate === 'string') {
        if (this.selectedReportInfo.dueDate.length >= 1) {
          this._dueDate = this.selectedReportInfo.dueDate;
        }
      } else {
        this._dueDate = null;
      }

      if (typeof this.selectedReportInfo.reportTypeDescription === 'string') {
        if (this.selectedReportInfo.reportTypeDescription.length >= 1) {
          this._reportTypeDescripton = this.selectedReportInfo.reportTypeDescription;
        }
      } else {
        this._reportTypeDescripton = null;
      }
    }
  }


  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screenWidth = event.target.innerWidth;

    if(this.screenWidth < 768) {
      this.tooltipPosition = 'bottom';
      this.tooltipLeft = '0';
    } else if (this.screenWidth >= 768) {
      this.tooltipPosition = 'right';
      this.tooltipLeft = 'auto';
    }
  }

  /**
   * Updates the type selected.
   *
   * @param      {Object}  e   The event object.
   */
  public updateTypeSelected(e): void {
    console.log('updateTypeSelected: ');
    console.log('e: ', e);
    console.log("this.frmReportType.get('reportTypeRadio').value: ", this.frmReportType.get('reportTypeRadio').value);
    if(e.target.checked) {
      console.log('checked: ');
      this.reportTypeSelected = this.frmReportType.get('reportTypeRadio').value;
      this.optionFailed = false;
      this.reportType = this.reportTypeSelected;
      let dataReportType: string = e.target.getAttribute('data-report-type');

      if (dataReportType !== 'S') {
        this.toDateSelected = true;
        this.fromDateSelected = true;
      } else {
        this.toDateSelected = false;
        this.fromDateSelected = false;
      }

      this.status.emit({
        'form': '3x',
        'reportTypeRadio': this.reportTypeSelected
      });
    } else {
      this.reportTypeSelected = '';
      this.optionFailed = true;
    }
  }

  /**
   * Validates the type selected form.
   *
   */
  public doValidateReportType() {
    if (this.frmReportType.get('reportTypeRadio').value) {
        this.optionFailed = false;
        this.isValidType = true;

        this._form3xReportTypeDetails.reportType = this.frmReportType.get('reportTypeRadio').value;

        if (this._selectedElectionState !== null) {
          this._form3xReportTypeDetails.stateOfElection = this._selectedElectionState;
        }

        this._form3xReportTypeDetails.cvgStartDate = this._formatDate(this._fromDateSelected);
        this._form3xReportTypeDetails.cvgEndDate = this._formatDate(this._toDateSelected);
        this._form3xReportTypeDetails.dueDate = this._dueDate;
        this._form3xReportTypeDetails.reportTypeDescription = this._reportTypeDescripton;

        console.log('this._form3xReportTypeDetails.dueDate: ', this._form3xReportTypeDetails.dueDate);

        localStorage.setItem('form_3X_report_type', JSON.stringify(this._form3xReportTypeDetails));

        this._reportTypeService
          .saveReport(this._formType)
          .subscribe(res => {
            if (res) {
              this.status.emit({
                form: this.frmReportType,
                direction: 'next',
                step: 'step_2',
                previousStep: 'step_1'
              });
            }
          });

        return 1;
    } else {
      this.optionFailed = true;
      this.isValidType = false;

      this.status.emit({
        form: this.frmReportType,
        direction: 'next',
        step: 'step_2',
        previousStep: ''
      });

      return 0;
    }
  }



  /**
   * Toggles the tooltip.
   *
   * @param      {Element}  tooltip  The tooltip
   */
  public toggleToolTip(tooltip): void {
    if (tooltip.isOpen()) {
      tooltip.close();
    } else {
      tooltip.open();
    }
  }

  public log(val) {
    console.log('val: ', val);
  }

  /**
   * Cancels form 3x.
   */
  public cancel(): void {
    this._router.navigateByUrl('/dashboard');
  }


  /**
   * Changes format of date from m/d/yyyy to yyyy-m-d.
   *
   * @param      {string}  date    The date
   * @return     {string}  The new formatted date.
   */
  private _formatDate(date: string): string {
    const today = new Date(date);
    const year: number = today.getFullYear();
    const month: string = (1 + today.getMonth()).toString().padStart(2, '0');
    const day: string = today.getDate().toString().padStart(2, '0')

    return `${year}-${month}-${day}`;
  }

}
