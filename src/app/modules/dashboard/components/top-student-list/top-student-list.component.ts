import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-top-student-list',
  templateUrl: './top-student-list.component.html',
  styleUrls: ['./top-student-list.component.scss']
})
export class TopStudentListComponent implements OnInit {
//#region Public | Private Variables  
$destroy: Subject<void> = new Subject<void>();
exammarklist : FormGroup = new FormGroup({})

//#endregion Public | Private Variables  
// --------------------------------------------------------------------------------------------------------------

// #region constructor
// --------------------------------------------------------------------------------------------------------------

constructor(public CommonService: CommonService,
    private _fb : FormBuilder,
    private _modalService: NgbModal,
) {}  

//#endregion constructor  
// --------------------------------------------------------------------------------------------------------------

// #region Lifecycle hooks
// --------------------------------------------------------------------------------------------------------------
ngOnInit(): void {
this.initForm();
} 

ngOnDestroy(): void {
  this.$destroy.next();
  this.$destroy.complete();
}  
//#endregion Lifecycle hooks  
// --------------------------------------------------------------------------------------------------------------

// #region Public methods

// --------------------------------------------------------------------------------------------------------------
//#endregion Public methods  
// --------------------------------------------------------------------------------------------------------------

// #region Private methods
// --------------------------------------------------------------------------------------------------------------

initForm() {
    this.exammarklist = this._fb.group({
      name: ['']
    })
  }

//#endregion Private methods

}
