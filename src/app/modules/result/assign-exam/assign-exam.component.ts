import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin, interval, Subject, switchMap, take, takeUntil, takeWhile, timer } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ResultService } from '../result.service';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-assign-exam',
    templateUrl: './assign-exam.component.html',
    styleUrls: ['./assign-exam.component.scss']
})
export class AssignExamComponent implements OnInit {


    //#region Public | Private Variables  
    $destroy: Subject<void> = new Subject<void>();
    assignExamForm: FormGroup = new FormGroup({})
    markSheetId: string | null = null
    isAssignMarkSheet: any 
    isDownloadMarkSheet: boolean = false
    isResultGenerate : any
    assignExamName : any

    get assignExamFormArry(): FormArray {
        return this.assignExamForm.get('assignExamArray') as FormArray;
    }

    multiSelectDropdownSettings: IDropdownSettings = {
        singleSelection: false,
        idField: 'id',
        textField: 'name',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        itemsShowLimit: 3,
        allowSearchFilter: true
    };

    multiSelectDropdownSettingsForBatch: IDropdownSettings = {
        singleSelection: false,
        idField: 'batch_id',
        textField: 'name',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        itemsShowLimit: 3,
        allowSearchFilter: true
    };

    assignExamData:any = [];
    URLConstants = URLConstants;
    selectedBatch:any = [];
    downloadSelectedBatch : any;
    publish_type: any = '1';
    selectedMarksheet: any;
    isPublishLoading: boolean = false;

    //#endregion Public | Private Variables  
    // --------------------------------------------------------------------------------------------------------------

    // #region constructor
    // --------------------------------------------------------------------------------------------------------------

    constructor(
        public CommonService: CommonService,
        private _fb: FormBuilder,
        private _activatedRoute: ActivatedRoute,
        public resultService: ResultService,
        private _toaster: Toastr,
        private _router : Router,
        private _modalService: NgbModal,

    ) { }

    //#endregion constructor  
    // --------------------------------------------------------------------------------------------------------------

    // #region Lifecycle hooks
    // --------------------------------------------------------------------------------------------------------------
    ngOnInit(): void {
        this.markSheetId = this._activatedRoute.snapshot.paramMap.get('id') || null;
        localStorage.removeItem('action_tab_ind');
        this.getAssignExamData();
    }

    ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
    }
    //#endregion Lifecycle hooks  
    // --------------------------------------------------------------------------------------------------------------

    // #region Public methods

    showClassName(item: any) {
    let queryParams : NavigationExtras = {
        queryParams: {
                class: item.value.class_name,
                marksheetId: this.markSheetId
            }
         }
        this._router.navigate([this.CommonService.setUrl(URLConstants.ADD_SIDHI_GUN),item.value.mark_sheet_classes_id],queryParams);
    }

    saveAssign(data) {
        const oldData = this.assignExamData.find(ele => ele.mark_sheet_classes_id == data.mark_sheet_classes_id);
        const examNameIds = data.filter_exam_list.filter(ele => data.exam_name_ids.map(ele => ele.id).includes(ele.id));

        const payload = {
            marksheet_id : Number(this.markSheetId),
            class_id: data.class_id,
            batch_ids: data.batch_ids,
            exam_name_ids: examNameIds,
            exam_type_ids: data.exam_type_ids,
            subject_list: data.extra_activity_ids,
            skill_subject_list: data.skill_subject_ids,
            student_attendance_detail_id : data.student_attendance_detail_id ?? null,
            is_edit : oldData.selected_batch_ids.length > 0 ?  this.compareObjects(oldData,data) : false
        }
        
        if (payload.batch_ids.length == 0) {
            this._toaster.showError(`please select ${data.class_name} batch.`);
            return;
        } else if (payload.exam_type_ids.length == 0) {
            this._toaster.showError(`please select ${data.class_name} Exam Type.`);
            return;
        } else if (payload.exam_name_ids.length == 0) {
            this._toaster.showError(`please select ${data.class_name} Exam Name.`);
            return;
        } else if (!payload.student_attendance_detail_id && data.attendance == 1) {
            this._toaster.showError(`please select ${data.class_name} Attendence.`);
            return;
        }

        this.resultService.storeAssignMarksheet(payload).pipe(takeUntil(this.$destroy)).subscribe((res:any)=> {
            if (res.status) {
                this._toaster.showSuccess(res.message);
                let queryParams: NavigationExtras = {
                    queryParams: {
                        is_co_scholastic : payload.subject_list.length > 0 ? true : false,
                        skill_subjects : payload.skill_subject_list.length > 0 ? true : false,
                    }
                  };
                localStorage.setItem('marksheet_id',this.markSheetId ?? '');
                const url = URLConstants.MARKSHEET_ACTION
                this._router.navigate([this.resultService.setUrl(`${url}/${res.data.mark_sheet_class_id}`)],queryParams);
            } else {
                this._toaster.showError(res.message);
            }
        })
    }

    examTypeChange(event, data, index) {
        if (data) {
            this.assignExamFormArry.controls[index]['controls']['exam_name_ids'].patchValue([]);
            const examTypeids = event.map((ele) => ele.id)
            const filterData = data.filter((ele) => examTypeids.includes(ele.exam_type_id))
            this.assignExamFormArry.controls[index]['controls']['filter_exam_list'].patchValue(filterData ?? []);
        }
    }

    openDownloadModal(modalName, batches, marksheetData: any,isStudentWise : boolean = false ) {
        this.selectedMarksheet = marksheetData
        this.selectedBatch = batches

        if(isStudentWise && marksheetData.add_publish_type != 0 ) {

            this.redirectToUrl(marksheetData.add_publish_type)
            return
        }
        this._modalService.open(modalName);
    }

    closeModel() {
        this.selectedBatch = [];
        this.downloadSelectedBatch = null;
        this._modalService.dismissAll();
    }

    downloadMarksheet() {
        if(this.downloadSelectedBatch?.length > 0) {
            this.isDownloadMarkSheet = true
            const urlArray = this.selectedBatch.filter(ele => this.downloadSelectedBatch.map(ele => ele.batch_id).includes(ele.batch_id)).map(ele => ele.download_url);

            // { url: 'http://classcare.ap-south-1.linodeobjects.com/public/sav/1/ExamResult/26/ExamResult-26-1727090397.html' },

            const requests = urlArray.map(url => this.resultService.downlaodMarkSheet(url));
            forkJoin(requests).pipe(takeUntil(this.$destroy)).subscribe((res) => {
                this.isDownloadMarkSheet = false
                this.downloadFile(res, 'Marksheet-list', 'pdf');
                this.closeModel();
            }, (error) => {
                this.isDownloadMarkSheet = false
                console.error('Error occurred:', error);
            });
        } else {
            this._toaster.showError('Please select batch')
        }  
    }

    generateMarksheet (id,index) {
        const payload = {
            mark_sheet_classes_id : id
        }
        this.resultService.generateMarksheet(payload).pipe(takeUntil(this.$destroy)).subscribe((res:any)=> {
            if(res.status){
                this.assignExamFormArry.controls[index]['controls']['isGenerate'].patchValue(true);
                this._toaster.showSuccess(res.message);
                this.checkProgressOfBatch(res.data);
            } else {
                this.isAssignMarkSheet[id] = false
                this._toaster.showError(res.message);
            }
        })
    }

    checkProgressOfBatch (id) {
        interval(10000) 
        .pipe(
          switchMap(() => this.resultService.batchProgress(id)), 
          takeWhile((res: any) => (res.data.progress < 100 && !res.data.hasFailures)),
          takeUntil(timer(60000)), 
          takeUntil(this.$destroy) 
        )
        .subscribe({
          next: (res: any) => {
            // if (res.data.progress >= 100 && !res.data.hashasFailures) {
            //     this.getAssignExamData();
            // }
          },
          error: (error) => {
            this.isAssignMarkSheet = false
            this._toaster.showError(error?.error?.message ?? error?.message)
          },
          complete: () => {
            this.assignExamFormArry.controls = []
            this.getAssignExamData(1);
          }
        });
    }

    public getAssignExamData(count=0) {
        this.isAssignMarkSheet = true
        this.resultService.getAssignMarksheet(this.markSheetId).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
            this.isAssignMarkSheet = false
            if (res.status) {
                this.assignExamData = res.data.details_array;
                this.assignExamName = res.data.exam_mark_sheet_name;
                this.assignExamData.forEach((ele:any)=> {
                    if (ele.job_batch_id && ele.result_job_process === 0 && !count) {
                        this.checkProgressOfBatch(ele.job_batch_id)
                    }
                })
                this.initForm(this.assignExamData);
            } else {
                this._toaster.showError(res.message);
            }
        }, (error) => {
            this.isAssignMarkSheet = false
            this._toaster.showError(error?.error?.message ?? error?.message);
        })
    }

    public handleBatchChange(item:any,timeout:number = 0){
        setTimeout(()=>{
            item.controls['exam_type_ids'].patchValue([]);
            item.controls['exam_name_ids'].patchValue([]);
            item.controls['filter_exam_type_list'].patchValue([]);
            item.controls['filter_exam_list'].patchValue([]);
            const batchIds = item?.value?.batch_ids?.map((ele) => ele.id)
            if(batchIds?.length > 0){
                const filterData = item?.value?.exam_type_list?.filter((ele) => batchIds.every(item => ele?.batch_ids?.includes(item)) )
                item.controls['filter_exam_type_list'].patchValue(filterData ?? []);
            }
        },timeout);
    }

    studentWiseResultDownload(publish_type: any){
        const payload = {
            mark_sheet_classes_id: this.selectedMarksheet?.mark_sheet_classes_id,
            publish_type: publish_type
        }
        this.isPublishLoading = true;
        this.resultService.publishMarksheet(payload).subscribe((res: any) => {
            this.isPublishLoading = false;
            if(res?.status){
                this.redirectToUrl(publish_type)
                this.closeModel();
                this._toaster.showSuccess(res.message);
            }else{
                this._toaster.showError(res.message);
            }
        },
        (error: any) => {
            this.isPublishLoading = false;
            this._toaster.showError(error?.error?.message ?? error?.message)
        })
    }

    redirectToUrl(publish_type:any){
        let queryParams : NavigationExtras = {
            queryParams: {
                class: this.selectedMarksheet?.class_name,
                publish_type: publish_type
            }
        }
        this._router.navigate([this.CommonService.setUrl(URLConstants.STUDENT_WISE_RESULT+'/'+this.markSheetId)],queryParams);
    }

    // --------------------------------------------------------------------------------------------------------------
    //#endregion Public methods  
    // --------------------------------------------------------------------------------------------------------------

    // #region Private methods
    // --------------------------------------------------------------------------------------------------------------

    initForm(data) {
        this.assignExamForm = this._fb.group({
            assignExamArray: this._subFormArray(data)
        })
    }

    private _subFormArray(data) {
        const formArry: any = new FormArray([]);
        data.forEach((inv: any) => {
            formArry.controls.push(this._subArrayGroup(inv));
        });
        return formArry;
    }

    private _subArrayGroup(data: any) {
        let filterData =[]
        let filterExamType =[]
        if (data?.selected_batch_ids?.length > 0) {
            const batchIds = data?.selected_batch_ids?.map((ele) => ele.id)
            filterExamType = data?.exam_type_ids?.filter((ele) => batchIds.every(item => ele?.batch_ids?.includes(item)) )
        }
        if (data?.selected_exam_type_ids?.length > 0 && data?.exam_name_ids?.length > 0) {
            const examTypeids = data?.selected_exam_type_ids?.map((ele) => ele.id);
            filterData = data?.exam_name_ids.filter((ele) => examTypeids.includes(ele.exam_type_id))
        }
        const fa: FormGroup = this._fb.group({
            add_publish_type : [data?.add_publish_type ?? 0 ],
            class_name: [data?.class_name ?? '-'],
            class_id: [data?.class_id ?? '-'],
            is_completed: [data?.is_completed ? true : false],
            batch_ids: [data?.selected_batch_ids ?? []],
            batch_list: [data?.batch_ids ?? []],
            exam_type_ids: [data?.selected_exam_type_ids ?? '-'],
            exam_type_list: [data?.exam_type_ids ?? '-'],
            filter_exam_type_list: [filterExamType ?? []],
            exam_name_ids: [data?.selected_exam_name_ids ?? '-'],
            exam_list: [data?.exam_name_ids ?? '-'],
            filter_exam_list: [filterData ?? '-'],
            extra_activity_ids: [data?.selected_subject_list ?? '-'],
            extra_activity_list: [data?.subject_list ?? '-'],
            skill_subject_ids: [data?.selected_skill_subject_list ?? []],
            skill_subject_list: [data?.subject_list ?? '-'],
            mark_sheet_classes_id: [data?.mark_sheet_classes_id ?? 0],
            job_batch_id: [data?.job_batch_id ?? null],
            result_job_process: [data?.result_job_process ?? 0],
            batch_wise_download_link: [data?.batch_wise_download_link ?? []],
            student_attendance_detail_list: [data?.student_attendance_detail_id ?? []],
            student_attendance_detail_id: [data?.selected_student_attendance_detail_id ?? null],
            krupa_siddhi_gun : [data?.krupa_siddhi_gun ?? false],
            isGenerate: [false],
            attendance : [data?.attendance],
            system_settings_krupa_gun:  [data?.system_settings_krupa_gun] ,
            system_settings_krupa_gun_flow :  [data?.system_settings_krupa_gun_flow]
        });
        return fa;
    }


    downloadFile(res: any, file: any, format: any) {
        let fileName = file;
        let blob = res.map(ele => ele.body as Blob);
        const mergedBlob = new Blob(blob, { type: blob[0].type });
        let pdfSrc = window.URL.createObjectURL(mergedBlob);
        if (format == 'pdf') {
            let iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = pdfSrc;
            document.body.appendChild(iframe);
            setTimeout(() => {
                iframe.contentWindow?.print();
            }, 200);
            //iframe.contentWindow?.print();
        } else {
            let a = document.createElement('a');
            a.download = fileName;
            a.href = pdfSrc;
            a.click();
        }
    }

    // compareObjects(data1: any, data2: any): boolean {
    //     // Define the keys that need to be compared
    //     const keysToCompare = [
    //       { key1: 'selected_batch_ids', key2: 'batch_ids' },
    //       { key1: 'selected_exam_type_ids', key2: 'exam_type_ids' },
    //       { key1: 'selected_exam_name_ids', key2: 'exam_name_ids' },
    //       { key1: 'selected_subject_list', key2: 'extra_activity_ids' },
    //     //   { key1: 'selected_student_attendance_detail_id', key2: 'student_attendance_detail_id' }
    //     ];
      
    //     for (const item of keysToCompare) {
    //       const key1Value = data1[item.key1];
    //       const key2Value = data2[item.key2];
      
    //       // If the values are arrays, compare their content
    //       if (Array.isArray(key1Value) && Array.isArray(key2Value)) {
    //         if (!this.compareArrays(key1Value, key2Value)) {
    //           return true; // If any array is different, return true
    //         }
    //       } 
    //       // Compare the primitive values (non-array)
    //       else if (key1Value !== key2Value) {
    //         return true; // If any value is different, return true
    //       }
    //     }
      
    //     return false; // Return false if no differences were found
    //   }
      

    // compareArrays(arr1: any[], arr2: any[]): boolean {
    //     if (arr1.length !== arr2.length) {
    //       return false;
    //     }
      
    //     for (let i = 0; i < arr1.length; i++) {
    //       if (typeof arr1[i] === 'object') {
    //         // For objects, compare each key-value pair
    //         if (JSON.stringify(arr1[i]) !== JSON.stringify(arr2[i])) {
    //           return false;
    //         }
    //       } else {
    //         // For primitive values, directly compare
    //         if (arr1[i] !== arr2[i]) {
    //           return false;
    //         }
    //       }
    //     }
      
    //     return true;
    //   }


    compareObjects(data1: any, data2: any): boolean {
        // Helper function to compare arrays of objects by 'id'
        const compareArrayById = (arr1: any[], arr2: any[]): boolean => {
          if (arr1?.length !== arr2?.length) {
            return false;
          }
          for (let i = 0; i < arr1?.length; i++) {
            if (arr1[i].id !== arr2[i].id) {
              return false;
            }
          }
          return true;
        };
      
        // Compare selected_batch_ids with batch_ids
        if (!compareArrayById(data1.selected_batch_ids, data2.batch_ids)) {
          return true;
        }
      
        // Compare selected_exam_type_ids with exam_type_ids
        if (!compareArrayById(data1.selected_exam_type_ids, data2.exam_type_ids)) {
          return true;
        }
      
        // Compare selected_exam_name_ids with exam_name_ids
        if (!compareArrayById(data1.selected_exam_name_ids, data2.exam_name_ids)) {
          return true;
        }
      
        // Compare selected_subject_list with extra_activity_ids
        if (!compareArrayById(data1.selected_subject_list, data2.extra_activity_ids)) {
          return true;
        }
      
        // Compare selected_student_attendance_detail_id with student_attendance_detail_id
        if (data1.selected_student_attendance_detail_id !== data2.student_attendance_detail_id) {
          return true;
        }
      
        // If no differences found, return false
        return false;
      }

    //#endregion Private methods

}

