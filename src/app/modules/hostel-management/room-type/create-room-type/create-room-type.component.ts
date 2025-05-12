import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { HostelManagementService } from '../../hostel-management.service';
import { Toastr } from 'src/app/core/services/toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormArray, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-room-type',
  templateUrl: './create-room-type.component.html',
  styleUrls: ['./create-room-type.component.scss']
})
export class CreateRoomTypeComponent implements OnInit {

  @ViewChild('createroomTypeMdl') createroomTypeMdl: ElementRef | undefined;
  @Output() reloadRoomTypes = new EventEmitter<void>();
  @Input() roomType: any;
  @Input() type: any;
  @Input() months: any;
  constructor(
    private HostelManagementService: HostelManagementService,
    private toastr: Toastr,
    private modalService: NgbModal,
    private fb: FormBuilder, 
  ) { }
  validationError: any = [];
  hostels: any = [];
  params = {
    id: null,
    name: null
  };
  // months = [{month:'January', disable:false}, {month:'February', disable:false}, {month:'March', disable:false}, {month:'April', disable:false}, {month:'May', disable:false}, {month:'June', disable:false}, {month:'July', disable:false}, {month:'August', disable:false}, {month:'September', disable:false}, {month:'October', disable:false}, {month:'November', disable:false}, {month:'December', disable:false}]

  form:any = this.fb.group({
    id: [null],
    name: [null,[Validators.required]],
    // amount: [null,[Validators.required]],
    new_month_wise_rent: this.fb.array([
      this.fb.group({
        new_month: this.fb.control(null,[Validators.required]),
        new_amount: this.fb.control('',[Validators.required, Validators.pattern('[0-9]*$')]),
      })
    ]),
    old_month_wise_rent: this.fb.array([
      this.fb.group({
        old_month: this.fb.control(null,[Validators.required]),
        old_amount: this.fb.control('',[Validators.required, Validators.pattern('[0-9]*$')]),
      })
    ]),
  });
  ngOnInit(): void {  
    if(this.roomType){

      this.form.patchValue({
        id: this.roomType.id,
        name: this.roomType.type,
        // amount: this.roomType.amount,
      }); 
      let month_wise_rent = this.roomType.room_wise_fees;
      let len = month_wise_rent.length;
      if(len != 0){
        for(let i=0; i<len; i++) {
          this.newHostelFees.removeAt(i);
          this.oldHostelFees.removeAt(i);
          let newRowData = this.fb.group({
            new_month: this.fb.control(month_wise_rent[i].month,[Validators.required]),
            new_amount: this.fb.control(month_wise_rent[i].new_month_wise_fees,[Validators.required, Validators.pattern('[0-9]*$')]),
          });
          
          let oldRowData = this.fb.group({
            old_month: this.fb.control(month_wise_rent[i].month,[Validators.required]),
            old_amount: this.fb.control(month_wise_rent[i].old_month_wise_fees,[Validators.required, Validators.pattern('[0-9]*$')]),
          });
          this.newHostelFees.push(newRowData);
          this.oldHostelFees.push(oldRowData);
        }
      }else{
        this.newHostelFees.removeAt(0);
        this.oldHostelFees.removeAt(0);
        this.months.forEach((el:any, i:any) => {
          let newRowData = this.fb.group({
            new_month: this.fb.control(el,[Validators.required]),
            new_amount: this.fb.control(null,[Validators.required, Validators.pattern('[0-9]*$')]),
          });
          let oldRowData = this.fb.group({
            old_month: this.fb.control(el,[Validators.required]),
            old_amount: this.fb.control(null,[Validators.required, Validators.pattern('[0-9]*$')]),
          });
          this.newHostelFees.push(newRowData);
          this.oldHostelFees.push(oldRowData);
        });
      }
    }
    else{
      this.newHostelFees.removeAt(0);
      this.oldHostelFees.removeAt(0);
      this.months.forEach((el:any, i:any) => {
        let newRowData = this.fb.group({
          new_month: this.fb.control(el,[Validators.required]),
          new_amount: this.fb.control(null,[Validators.required, Validators.pattern('[0-9]*$')]),
        });
        let oldRowData = this.fb.group({
          old_month: this.fb.control(el,[Validators.required]),
          old_amount: this.fb.control(null,[Validators.required, Validators.pattern('[0-9]*$')]),
        });
        this.newHostelFees.push(newRowData);
        this.oldHostelFees.push(oldRowData);
      });
    }
  }

  submit() {
    this.HostelManagementService.createRoomType(this.form.value).subscribe(
      (resp: any) => {
        if (resp.status) {
          this.toastr.showSuccess(resp.message);
          this.clearForm();
          this.modalService.dismissAll();
          this.reloadRoomTypes.emit();
        } else {
          this.validationError = resp.error
          this.toastr.showError(resp.message)
        }
      }
    );
  }

  get newHostelFees(): any {
    return this.form.get('new_month_wise_rent') as FormArray;
  }

  get oldHostelFees(): any {
    return this.form.get('old_month_wise_rent') as FormArray;
  }

  new_get_month(i:number): any {
    return this.newHostelFees.controls?.[i]?.controls?.new_month;
  }

  old_get_month(i:number): any {
    return this.oldHostelFees.controls?.[i]?.controls?.old_month;
  }

  new_get_amount(i:number): any {
    return this.newHostelFees.controls?.[i]?.controls?.new_amount;
  }

  old_get_amount(i:number): any {
    return this.oldHostelFees.controls?.[i]?.controls?.old_amount;
  }


  // getGradeDetail(): any {
  //   return this.fb.group({
  //     month: this.fb.control(null,[Validators.required]),
  //     amount: this.fb.control('',[Validators.required, Validators.pattern('[0-9]*$')]),
  //   });
  // }

  // addRowControl(): void {
  //   this.newHostelFees.push(this.getGradeDetail());
  // }

  // remove(i: number): void {    
  //   let month = this.newHostelFees.at(i).value.month
  //   this.months.forEach(monthObj => {
  //     if (monthObj.month == month) {
  //         monthObj.disable = false;
  //     }
  // });
  //   this.newHostelFees.removeAt(i);
  // }
  

  handleMonth(){
    this.months.forEach(monthObj => {
      const foundMonth = this.form.value.month_wise_rent?.find(targetMonth => targetMonth.month === monthObj.month);
      monthObj.disable = foundMonth ? true : false;
  });
  }

  close() {
    this.modalService.dismissAll()
    this.clearForm()
  }

  clearForm() {
    this.params = {
      id: null,
      name: null
    };
  }

}
