import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { CommonService } from '../../common-components/common.service';
import { ActivatedRoute } from '@angular/router';
import { HomeworkService } from '../homework.service';
import { Directive, ElementRef, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Toastr } from 'src/app/core/services/toastr';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-view-homework',
  templateUrl: './view-homework.component.html',
  styleUrls: ['./view-homework.component.scss']
})
export class ViewHomeworkComponent implements OnInit {
  //#region Public | Private Variables

  id: any
  showData: any

  searchTextStudent: string = ''
  searchTextStudentTo: string = ''
  selectAllStudent: boolean = false
  total_student: number = 0
  Submitted_student: number = 0
  attachmentType : any
  attachment : any
  status : any = null
  remark : any = null
  read_status:any = ""

  remark_completed:number = 0;
  remark_incomplete:number = 0;
  remark_partially_completed:number = 0


  $destroy: Subject<void> = new Subject<void>();
  viewHomeworkForm: FormGroup = new FormGroup({})
  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  URLConstants = URLConstants;
  constructor(public CommonService: CommonService,
    private _fb: FormBuilder,
    private route: ActivatedRoute,
    public homeworkService: HomeworkService,
    private toastr: Toastr,
    public  dateFormateService : DateFormatService,
  ) {
    this.id = this.route.snapshot.paramMap.get('id');

    const params = this.route?.snapshot?.routeConfig?.path;
    let parts = params?.split('/')[0].split('-')[1];
    this.attachmentType = parts
  }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.initForm();
    this.showHomeWork(this.id)
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  showHomeWork(id: any) {
    this.homeworkService
      .showHomeWork(id)
      .subscribe((res: any) => {
        if (res.status) {
          this.showData = res?.data
          this.total_student = this.showData?.students_notes_status?.length
          if (this.showData.students_notes_status) {
            this.showData.students_notes_status.map(ele => ele.isSelect = false)
            this.Submitted_student = this.showData.students_notes_status.filter(student => student.pivot.is_submitted === 1).length;
            this.remark_completed = this.showData.students_notes_status.filter(student => student.pivot.homework_remark === 1).length;
            this.remark_incomplete = this.showData.students_notes_status.filter(student => student.pivot.homework_remark === 3).length;
            this.remark_partially_completed = this.showData.students_notes_status.filter(student => student.pivot.homework_remark === 2).length;
            this.selectAllStudent = false
            this.status = null
            this.remark = null
          }
        }
      });
  }
  download(url: string) {
    window.open(url, '_blank')
  }
  isPDF(filename: string): boolean {
    return filename.toLowerCase().endsWith('.pdf');
  }

  isImage(filename: string): boolean {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif']; // Add more extensions as needed
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return imageExtensions.includes(extension);
  }

  selectAll() {
    if (this.selectAllStudent) {
      this.showData?.students_notes_status.map(ele => ele.isSelect = true)
    } else {
      this.showData?.students_notes_status.map(ele => ele.isSelect = false)
    }
  }
  singleSelect() {
    const selectedValue = this.showData?.students_notes_status.map(ele => ele.isSelect)
    if (selectedValue.includes(false)) {
      this.selectAllStudent = false
    } else {
      this.selectAllStudent = true
    }
  }

  onStatusChange(status: any, id: number,note_id:number ,remark :any) {

    const payLoad = {
      note_id: note_id,
      student_assignment: [
        {
          student_id: id,
          status: status.value,
          homework_remark : +status.value == 0 ? null : remark
        }
      ]
    }
    this.updateStatusAPI(payLoad);
  }

  onRemarkChange(noteId:any ,studentId:any , status:any , remark:any, name:any){
    if(status == 0){
      this.toastr.showError(`${this.attachmentType} is pending for ${name}`)

      const remarkDropdown = document.getElementById(`remarkSelect${studentId}`) as HTMLSelectElement;
        if (remarkDropdown) {
          remarkDropdown.value = "";
        }

      return
    }

    const payLoad = {
      note_id: noteId,
      student_assignment: [
        {
          student_id: studentId ,
          status: status,
          homework_remark : +remark.value
 
        }
      ]
    }
    this.updateStatusAPI(payLoad);
  }

  statusChange(status: any) {

    const selected = this.showData?.students_notes_status.filter(obj => obj.isSelect==true)

    if(selected.length == 0){
      status.value = null
      this.status =null
      return this.toastr.showError("Please Select the Student")
    }

    let payLoad = {
      note_id: this.showData?.id,
      student_assignment: selected.map(obj => { 
        return { 
          student_id: obj.pivot?.student_id,
          status: status.value ,
          homework_remark : status.value == 1 ?  obj.pivot.homework_remark || null : null
         }
      } )
    }
    this.updateStatusAPI(payLoad)
    // this.selectAllStudent = false

  }
  remarkChange(status: any) {

    const selected = this.showData?.students_notes_status.filter(obj => obj.isSelect==true)

    if(selected.length == 0){
      status.value = null
      this.remark = null
      return this.toastr.showError("Please Select the Student")
    }

    let payLoad = {
      note_id: this.showData?.id,
      student_assignment: selected.map(obj => { 
        return { 
          student_id: obj.pivot?.student_id,
          status: obj.pivot.is_submitted ,
          homework_remark : status.value
         }
      } )
    }
    this.updateStatusAPI(payLoad)
    // this.selectAllStudent = false

  }

  onReadStatusChange(){
    let id = `${this.id}${this.read_status ? '?read_status=' + this.read_status : ''}`;
    this.showHomeWork(id)
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  private updateStatusAPI(status: any) {
    this.homeworkService.updateStatus(status).subscribe((res: any) => {
      if(res.status){
        this.toastr.showSuccess(res?.message)
        this.showHomeWork(this.id)
      }
    })
  }

  initForm() {
    this.viewHomeworkForm = this._fb.group({
      name: ['']
    })
  }

  //#endregion Private methods
}
