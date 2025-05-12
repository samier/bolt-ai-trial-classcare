import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { subjectService } from '../subject.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-subjects-list',
  templateUrl: './subjects-list.component.html',
  styleUrls: ['./subjects-list.component.scss']
})
export class SubjectsListComponent implements OnInit {

  //#region Public | Private Variables
  
  URLConstants = URLConstants;
  $destroy: Subject<void> = new Subject<void>();
  @Input() subjectData: any;
  
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    public commonService: CommonService,
    private subjectService: subjectService,
    private router: Router,
    private toastr: Toastr,
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.fetchSubjects();
  }
  
  ngOnDestroy(): void {
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  deleteSubject(subject: any){
    this.subjectService.deleteSubject(subject).subscribe(
      (res: any) => {
        if(res.status) {
          this.toastr.showSuccess(res?.message);
          this.fetchSubjects();
        }else {
          this.toastr.showError(res.message)
        }
      },
      (error:any) => {
        this.toastr.showError(error?.error?.message ?? error?.message);
      }
    )
  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  fetchSubjects(){
    this.subjectService.getSubjectList().subscribe(
      (res: any)  => {
        if(res?.status){
          this.subjectData = res?.data;
        }
        else{
          this.toastr.showError(res?.message)
        }
      },
      (error: any) => {
        this.toastr.showError(error?.error?.message ?? error?.message)
      }
    );
  }
  //#endregion Private methods
}
