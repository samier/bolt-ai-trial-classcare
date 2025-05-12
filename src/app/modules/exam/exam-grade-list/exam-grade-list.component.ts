import { Component,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TransportService } from 'src/app/modules/transport-management/transport.service';
import { ExamServiceService } from '../exam-service.service';
import { DataTableDirective } from 'angular-datatables';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-exam-grade-list',
  templateUrl: './exam-grade-list.component.html',
  styleUrls: ['./exam-grade-list.component.scss']
})
export class ExamGradeListComponent {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  
  isOpenByClick: boolean = true

  constructor(
    private transportService: TransportService,
    private examGradeService: ExamServiceService,
    public CommonService: CommonService,
    private _toaster : Toastr
  ) {}

  URLConstants = URLConstants;
  exam_grade: any = [];

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu : [50,100,200],
      serverSide: true,
      processing: true,
      searching: true,
      scrollCollapse:true,
      // scrollX:true,
      ajax: (dataTablesParameters: any, callback) => {
        this.getlist(dataTablesParameters,callback)
      },
      columns: [
        { data: 'name' }, 
        { data: 'class_name' },
        { data: 'status' },
        { data: 'action',orderable:false,searchable:false }
      ]
    };
  }

  getlist(dataTablesParameters?: any, callback?:any ){
    this.examGradeService.getExamGradeList(dataTablesParameters).subscribe((resp:any) => {
      this.exam_grade = resp.data;
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: []
      });
    });
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  remove(id:any): void{
    if(confirm('are you sure you want to delete this grade ?')){
      this.examGradeService.deleteExamGrade(id).subscribe((res) => {  
        this.reloadData(); 
      }); 
    }
  }
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  markAsDefault(id, isDefault) {
    const payload = {
      id : id
    }

    const serviceMethod = isDefault
      ? this.examGradeService.gradeRemoveAsDefault.bind(this.examGradeService)
      : this.examGradeService.gradeMarkAsDefault.bind(this.examGradeService);

    serviceMethod(payload).subscribe(
      (res: any) => {
        if (res.status) {
          this._toaster.showSuccess(res.message);
          this.reloadData();
        } else {
          this._toaster.showError(res.message);
        }
      },
      (error) => {
        this._toaster.showError(error.error?.message ?? error.message);
      }
    );
  }
}
