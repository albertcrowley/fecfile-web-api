import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { form99 } from '../../interfaces/FormsService/FormsService';
import { MessageService } from '../../services/MessageService/message.service';
import { FormsService } from '../../services/FormsService/forms.service';
import { DialogService } from '../../services/DialogService/dialog.service';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {

  @Output() status: EventEmitter<any> = new EventEmitter<any>();

  public committee_details: any = {};
  public confirmModal: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public type_selected: string = '';
  public form_type: string = '';
  public date_stamp: Date = new Date();
  public form_details: form99;
  public showValidateBar: boolean = false;

  private _subscription: Subscription;
  private _step: string = '';

  private filename: string ='';
  private fileurl: string ='';
  public org_filename:string='';
  public org_fileurl:string='';
  private _form_details: any = {}

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _messageService: MessageService,
    private _formsService: FormsService,
    private _dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.form_type = this._activatedRoute.snapshot.paramMap.get('form_id');
    /*this.filename = this._activatedRoute.snapshot.paramMap.get(`form_${this.form_type}_file`);*/
    
     this.org_filename=JSON.parse(localStorage.getItem('form_99_details.org_filename'));      
     this.org_fileurl = JSON.parse(localStorage.getItem('form_99_details.org_fileurl'));         

    console.log('On Preview Screen org_filename: ', this.org_filename);
    console.log('On Preview Screen org_fileurl: ', this.org_fileurl);


    this._subscription =
      this._messageService
        .getMessage()
        .subscribe(res => {
          this._step = res.step;

          this.form_details = res.data;

          this.committee_details = JSON.parse(localStorage.getItem('committee_details'));

          if(this.form_type === '99') {
            if(typeof this.form_details !== 'undefined') {
              if(typeof this.form_details.reason !== 'undefined') {
                this.type_selected = this.form_details.reason;
              }              
            }
          }
        });
  }

  ngDoCheck(): void {
    if(!this.form_details) {
      if(localStorage.getItem(`form_${this.form_type}_details`) !== null) {
        this.form_details = JSON.parse(localStorage.getItem(`form_${this.form_type}_details`));
        if(this.form_type === '99') {
          if(!this.type_selected) {
            this.type_selected = this.form_details.reason;
          } 
        }
      }
    }
  }

  /**
   * Determines ability for a person to leave a page with a form on it.
   *
   * @return     {boolean}  True if able to deactivate, False otherwise.
   */
  public async canDeactivate(): Promise<boolean> {
    if (this.hasUnsavedData()) {
      let result: boolean = null;

      result = await this._dialogService
        .confirm('', ConfirmModalComponent)
        .then(res => {
          let val: boolean = null;

          if(res === 'okay') {
            val = true;
          } else if(res === 'cancel') {
            val = false;
          }

          return val;
        });

      return result;
    } else {
      return true;
    }
  }

  /**
   * Determines if form has unsaved data.
   * TODO: Move to service.
   *
   * @return     {boolean}  True if has unsaved data, False otherwise.
   */
  public hasUnsavedData(): boolean {
    let formSaved: any = JSON.parse(localStorage.getItem(`form_${this.form_type}_saved`)); 

    if(formSaved !== null) {
      let formStatus: boolean = formSaved.saved;

      if(!formStatus) {
        return true;
      }      
    }

    return false;
  }    

  public goToPreviousStep(): void {
    setTimeout(() => {
      localStorage.setItem(`form_${this.form_type}_details`, JSON.stringify(this.form_details));
    }, 100);
        
    this.status.emit({
      form: {},
      direction: 'previous',
      step: 'step_2',
      previousStep: this._step
    });

    this.showValidateBar = false;

    this._messageService
    .sendMessage({
      'validateMessage': {
        'validate': {},
        'showValidateBar': false                  
      }            
    });          
  }

  public goToNextStep(): void {
    setTimeout(() => {
      localStorage.setItem(`form_${this.form_type}_details`, JSON.stringify(this.form_details));
    }, 100);

    this.status.emit({
      form: 'preview',
      direction: 'next',
      step: 'step_4',
      previousStep: this._step
    });

    this.showValidateBar = false;

    this._messageService
      .sendMessage({
        'validateMessage': {
          'validate': {},
          'showValidateBar': false                  
        }            
      });          
  }

  public validateForm(): void {
    this.showValidateBar = true;

    this._formsService
      .validateForm({}, this.form_type)
      .subscribe(res => {
        if(res) {
            this._messageService
              .sendMessage({
                'validateMessage': {
                  'validate': environment.validateSuccess,
                  'showValidateBar': true                  
                }
              });
        }
      },
      (error) => {
        this._messageService
          .sendMessage({
            'validateMessage': {
              'validate': error.error,
              'showValidateBar': true                  
            }            
          });
      });    
  }
  public printPriview(): void {
    this._form_details = JSON.parse(localStorage.getItem(`form_${this.form_type}_details`));

    localStorage.setItem(`form_${this.form_type}_details`, JSON.stringify(this._form_details));
     
     /*.saveForm({}, {}, this.form_type)*/
     console.log("Accessing Sign printPriview ...");
     this._formsService
       .PreviewForm_Preview_sign_Screen({}, this.form_type)
       .subscribe(res => {
         if(res) {
           console.log("Accessing Preview printPriview res ...",res);
         }
       },
       (error) => {
         console.log('error: ', error);
       });
 }
}
