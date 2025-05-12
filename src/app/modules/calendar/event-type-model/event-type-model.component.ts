import { Component, Input, OnInit } from '@angular/core';
import { EventTypeServiceService } from '../../event-type/event-type-service.service';
import { Subject, takeUntil } from 'rxjs';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Toastr } from 'src/app/core/services/toastr';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-event-type-model',
  templateUrl: './event-type-model.component.html',
  styleUrls: ['./event-type-model.component.scss']
})
export class EventTypeModelComponent implements OnInit { 
  //#region Public | Private Variables
  @Input() selectedObj: any =[];
  eventType: any =[] ;
  isSaveLoading: boolean = false;
  $destroy: Subject<void> = new Subject<void>();
  eventTypeCreateForm: FormGroup = new FormGroup({});

  constructor(
    public CommonService: CommonService,
    private eventTypeService: EventTypeServiceService,
    private toastr: Toastr,
    private modalRef: NgbActiveModal,
    private _fb : FormBuilder,
    private validationService : FormValidationService
  ) {}
  
  ngOnInit(): void {
    this.initForm();
  }
  
  handleSave(is_Save: boolean) {
    if (!is_Save) {
      this.modalRef.close({ status: false });
      return;
    }

    if (this.eventTypeCreateForm.invalid) {

      this.validationService.getFormTouchedAndValidation(this.eventTypeCreateForm);
      this.toastr.showError("Please fill all required Fields");
      return;
    }
    const payload = {
      ...this.eventTypeCreateForm.value
    };
    
    const eventId = this.selectedObj ? this.selectedObj.id : undefined;
    this.isSaveLoading = true;
    this.eventTypeService.addEditEvent(payload, eventId).pipe(takeUntil(this.$destroy)).subscribe(
        (res: any) => {
          this.isSaveLoading = false;
          if (res.status) {
            this.toastr.showSuccess(res.message);
            this.modalRef.close({ status: true });
          } else {
            this.toastr.showError(res.name);
          }
        },
        (error: any) => {
          this.isSaveLoading = false;
          console.log(error.error.errors.name);
          
          this.toastr.showError(error?.error?.error?.name ||error.error.errors.name);
        }
      );
  }

  initForm() {
    
    this.eventTypeCreateForm = this._fb.group({
      name: [this.selectedObj?.name ?? null,[Validators.required]],
      color: [this.selectedObj?.color ?? "#000000" ], 
    })
  }
}
