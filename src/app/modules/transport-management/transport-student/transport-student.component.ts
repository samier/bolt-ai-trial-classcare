import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '../../common-components/common.service';
import { Subject } from 'rxjs';
import { TransportService } from '../transport.service';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';

@Component({
  selector: 'app-transport-student',
  templateUrl: './transport-student.component.html',
  styleUrls: ['./transport-student.component.scss']
})
export class TransportStudentComponent implements OnInit {
  //#region Public | Private Variables

  URLConstants = URLConstants;
  $destroy: Subject<void> = new Subject<void>();
  transportStudentForm : FormGroup = new FormGroup({})
  loading:any = false;
  transferLoading:any = false
  routes:any =[]
  from_stops:any = [];
  pickup_stops:any = [];
  drop_stops:any = [];

  from_all_students:any = [];
  from_students:any = [];
  to_all_students:any = [];
  to_students:any = [];

  selectAll:any = false;
  checked_students:any = [];

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(public CommonService: CommonService,
      private _fb : FormBuilder,
      private transportService: TransportService,
      private toastr: Toastr,
  ) {}

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.initForm();
    this.getTransportRouteList();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  getTransportRouteList(){
    this.transportService.getTransportRouteList().subscribe((resp:any) => {
      this.routes = resp.data
    })
  }

  handleStop(event:any, action:any, num?:any){
    if(event?.id){
      if(num == 0){
        this.transportStudentForm.patchValue({
          from_stop: null
        })
      }
      let data = {
        route_id: event.id
      }
      this.transportService.getTransportStopList(data).subscribe((resp:any) => {
        if(action == 'from'){
          this.from_stops = resp.data
        }
        if(action == 'to'){
          if(num == 1){
            this.pickup_stops = resp.data
            this.drop_stops = resp.data
              this.transportStudentForm.patchValue({
                pickup_stop: null
              })
              this.transportStudentForm.patchValue({
                drop_stop: null
              })
              
          }
          if(num == 2){
            this.drop_stops = resp.data
            this.transportStudentForm.patchValue({
              drop_stop: null
            })
          }
        }
      }) 
      if(num == 1){
        this.transportStudentForm.patchValue({
          drop_route: event.id
        })
      }
    }
  }

  handleStopChange(event:any, stop:any){
    if(event?.id && this.transportStudentForm.value.pickup_route == this.transportStudentForm.value.drop_route){
      this.transportStudentForm.patchValue({
        drop_stop: event.id
      })
    }
  }

  search(event:any, action:any){
    let search = ''
    search += event.target.value
    if(action == 'from'){
      this.from_students = this.from_all_students.filter((item:any) => {
        return item.student.full_name.toLowerCase().includes(search.toLowerCase());
      });
    }

    if(action == 'to'){
      this.to_students = this.to_all_students.filter((item:any) => {
        return item.student.full_name.toLowerCase().includes(search.toLowerCase());
      });
    }

    this.checkCheckBox();
  }

  show(){
    this.loading = true;
    this.transportService.getTransportStudentList(this.transportStudentForm.value).subscribe((resp:any) => {
      this.loading = false;
      if(resp.status){
        this.from_all_students = resp.data.from_students
        this.from_students = resp.data.from_students
        this.to_all_students = resp.data.to_students
        this.to_students = resp.data.to_students
      }else{
        this.toastr.showError(resp.message);
      }
    }, (error:any) => {
      console.log(error);
      this.loading = false;
    })
  }

  handleCheck(event:any){
    if(event.target.checked == true){
      this.checked_students.push(event.target.value)
    }else{
      this.checked_students = this.checked_students.filter((el:any) => {
        return el != event.target.value
      })
    }
    this.transportStudentForm.patchValue({
      students: this.checked_students
    })

    let main_checkbox:any = document.querySelector('.main_checkbox');
    if(this.checked_students.length == this.from_students.length){
      main_checkbox.checked = true;
    }else{
      main_checkbox.checked = false;
    }
  }

  handleCheckAll(){
    let checkBox:any = document.querySelectorAll('.student_check');
    
    if(this.selectAll == true){
      checkBox.forEach((x:any) => {
        x.checked = true;
      });
      this.transportStudentForm.patchValue({
        students: this.from_students.map((el:any) => el.student.id)
      })
      this.checked_students = this.from_students.map((el:any) => el.student.id)
    }else{
      checkBox.forEach((x:any) => {
        x.checked = false;
      });
      this.transportStudentForm.patchValue({
        students: null
      })
      this.checked_students = [];
    }
    
  }

  checkCheckBox(){
    setTimeout(() => {
    this.checked_students.forEach((element:any) => {
        let checkbox:any = document.querySelector('input[value="'+element+'"]');
        if(checkbox){
          checkbox.checked = true;
        }
      });
    }, 100);
  }
  
  transfer(){
    if(this.checked_students.length == 0){
      return this.toastr.showInfo('Please select at least one student to transfer.', 'INFO')
    }
    this.transferLoading = true;
    this.transportService.studentTransfer(this.transportStudentForm.value).subscribe((resp:any) => {
    this.transferLoading = false;
      this.clear();
      this.toastr.showSuccess(resp.message);
    })
    
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  clear(){
    this.transportStudentForm.reset();
    this.from_all_students = [];
    this.from_students = [];
    this.to_all_students = [];
    this.to_students = [];
    this.checked_students = [];
    let main_checkbox:any = document.querySelector('.main_checkbox');
    main_checkbox.checked = false;
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

    initForm() {
      this.transportStudentForm = this._fb.group({
        from_route: [null, [Validators.required]],
        from_stop: [null],
        pickup_route: [null, [Validators.required]],
        pickup_stop: [null, [Validators.required]],
        drop_route: [null, [Validators.required]],
        drop_stop: [null, [Validators.required]],
        students: [null]
      })
    }

  //#endregion Private methods
}
