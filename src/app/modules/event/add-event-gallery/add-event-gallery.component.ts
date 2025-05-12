import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EventService } from '../event.service';
import { TeacherDiaryService } from '../../teacher-diary/teacher-diary.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HomeworkService } from '../../homework/homework.service';
import moment from 'moment';

@Component({
  selector: 'app-add-event-gallery',
  templateUrl: './add-event-gallery.component.html',
  styleUrls: ['./add-event-gallery.component.scss']
})
export class AddEventGalleryComponent implements OnInit {

  //#region Public | Private Variables

  isEdit: any
  eventForm: FormGroup = new FormGroup({})
  batches: any = []
  employee: any = []
  isEvent: any
  attachments: any = []
  isEventAdd: any
  eventDetailId: any
  isSaving: boolean = false;
  @ViewChild('file') fileSelect!: ElementRef;
  selectedFiles: File[] = [];
  formSubmitted: boolean = false;
  CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
  private apiUrl = '';

  event_id: any = null;

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(
    public CommonService: CommonService,
    private _fb: FormBuilder,
    private modalRef: NgbActiveModal,
    private toaster: Toastr,
    private validationService: FormValidationService,
    private eventService: EventService,
    private teacherDiarySerice: TeacherDiaryService,
    private http: HttpClient,
    private homeworkService: HomeworkService,
  ) { }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // -------------------------------------------------------------------------------------------------------------- 

  ngOnInit(): void {
    this.initForm();
    // this.CHUNK_SIZE = (5 * 1024 * 1024)
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  async uploadFiles() {
    let data: any
    for (const file of this.selectedFiles) {
      let res: any = await this.uploadFileInChunks(file);
      data = res
      if (res?.status == false) {
        break;
      }
    }
    if (data.status) {
      this.toaster.showSuccess("Images uploaded successfully");
    } else {
      const msg = data?.errorMsg || 'Something went wrong';
      this.toaster.showError(msg);
    }

    this.modalRef.close({ status: true });
    this.isSaving = false;
  }

  async uploadFileInChunks(file: File) {
    const base64String = await this.convertToBase64(file);
    const [header, base64Data] = base64String.split(',')
    const totalChunks = Math.ceil(base64Data.length / this.CHUNK_SIZE);
    let start = 0;
    let partNumber = 0;

    while (start < base64Data.length) {
      const chunk = base64Data.slice(start, start + this.CHUNK_SIZE);
      const finalChunk = `${header},${chunk}`;
      const payload = {
        file: finalChunk, // Base64 string of the chunk
        fileName: file.name,
        partNumber: partNumber,
        totalChunks: totalChunks
      };

      try {
        let response;
        if (this.isEventAdd) {
          const eventImagepayload = {
            eventId: this.eventDetailId,
            attachment: payload,
          }
          response = await this.eventService.storeEventImages(eventImagepayload).toPromise();
        } else {
          const eventPayload = {
            attachment: payload,
            eventname: this.eventForm.value?.eventname,
            eventFor: this.eventForm.value?.eventFor,
            event_date: this.eventForm.value?.event_date,
            user_id: this.eventForm.value.user_id ? this.eventForm.value.user_id.map((ele) => ele?.id) : [],
            batch_id: this.eventForm.value.batch_id ? this.eventForm.value.batch_id.map((ele) => ele?.id) : [],
            event_id: this.event_id,
          }
          response = await this.eventService.storeEventGallery(eventPayload).toPromise();
          if (response.status) {
            this.event_id = response.data.original.event_id
          }
        }
      } catch (error: any) {
        console.error('Error uploading chunk', error);
        let data =
        {
          status: false,
          errorMsg: error?.error?.message
        };
        return data;
      }

      start += this.CHUNK_SIZE;
      partNumber++;
    }
    return {
      status: true,
    };
  }


  onFileSelected(event: any) {

    const input = event.target as HTMLInputElement;
    const files = input?.files as FileList;

    if (files && files.length > 0) {
      if (files.length > 20) {
        this.toaster.showError(`You uploaded ${files.length} files. You can upload 20 images at a time.`);
        this.eventForm.controls['attachment'].setValue(null);
        return;
      }

      let fileListArray: any[] = [];
      Array.from(files).forEach(file => {
        fileListArray.push(file);
      });

      const validFileTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      fileListArray = fileListArray.filter(file => !validFileTypes.includes(file.type));

      if (fileListArray.length > 0) {
        this.toaster.showError("Please upload only image files (jpg, jpeg, png, webp, gif).");
        input.value = '';
        return;
      }

      this.selectedFiles = Array.from(files);
    }
  }

  // Function to convert file to base64
  convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string); // resolve with base64 string
      };
      reader.onerror = reject; // handle any errors
      reader.readAsDataURL(file); // convert to base64
    });
  }




  changeEventFor(event: any) {
    this.isEvent = event
    if (this.isEvent == 2) {
      this.getBatchList();
    }
    else if (this.isEvent == 3) {
      this.getEmployeeList();
    }

  }

  getEmployeeList() {
    this.teacherDiarySerice.getAllFaculty().subscribe((res: any) => {
      this.employee = res?.data;
    });
  }

  getBatchList() {
    this.homeworkService.getBatchOnClass({}).subscribe((res: any) => {
      this.batches = res?.data;
    });
  }

  async handleSave(is_Save: boolean, eventAdd: any) {
    this.formSubmitted = true;
    if (!is_Save) {
      this.modalRef.close({ status: false });
      return;
    }

    if (!eventAdd) {
      this.eventForm.controls['eventname'].setValidators([Validators.required]);
      this.eventForm.controls['eventname'].updateValueAndValidity();
    }

    if (this.isEvent == 2) {
      this.eventForm.controls['batch_id'].setValidators([Validators.required]);
      this.eventForm.controls['batch_id'].updateValueAndValidity();
    }

    if (this.isEvent == 3) {
      this.eventForm.controls['user_id'].setValidators([Validators.required]);
      this.eventForm.controls['user_id'].updateValueAndValidity();
    }

    if (this.eventForm.invalid) {
      this.validationService.getFormTouchedAndValidation(this.eventForm)
      this.toaster.showError("Please fill all the required field")
      return
    }

    this.isSaving = true;

    await this.uploadFiles();
  }

  getDate(data: any, mode = 0) {
    const formattedDate = moment().format('YYYY-MM-DD');

    return formattedDate
  }
  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.eventForm = this._fb.group({
      attachment: [null, [Validators.required]],
      eventname: [null],
      eventFor: [1],
      batch_id: [null],
      user_id: [null],
      event_date: [this.getDate(null)],
      details: [null],
    })
  }

  //#endregion Private methods

}
