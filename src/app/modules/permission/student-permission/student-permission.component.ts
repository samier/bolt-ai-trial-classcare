import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-student-permission',
  templateUrl: './student-permission.component.html',
  styleUrls: ['./student-permission.component.scss']
})
export class StudentPermissionComponent implements OnInit {
//#region Public | Private Variables  
$destroy: Subject<void> = new Subject<void>();
PerssionStudent : FormGroup = new FormGroup({})

//#endregion Public | Private Variables  
// --------------------------------------------------------------------------------------------------------------

// #region constructor
// --------------------------------------------------------------------------------------------------------------

constructor(public CommonService: CommonService,
    private _fb : FormBuilder,
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
    this.PerssionStudent = this._fb.group({
      name: ['']
    })
  }

//#endregion Private methods

}
