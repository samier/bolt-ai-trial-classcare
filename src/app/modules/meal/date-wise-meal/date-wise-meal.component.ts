import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Injectable } from '@angular/core'; 
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from '../../../core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { MealService } from '../meal.service';
import { CommonService } from 'src/app/core/services/common.service';
import moment from 'moment';

@Injectable()

@Component({
  selector: 'app-date-wise-meal',
  templateUrl: './date-wise-meal.component.html',
  styleUrls: ['./date-wise-meal.component.scss']
})
export class DateWiseMealComponent {
  
  constructor(
      private fb: FormBuilder, 
      private activatedRouteService: ActivatedRoute,
      private router: Router,
      private toastr: Toastr,
      private mealService: MealService,
      public CommonService: CommonService
  ) {}

  URLConstants = URLConstants;
  saveBtn:string = 'Save';
  page:string = 'Add';
  id:any = null;
  meal: any = [];
  meal_types: any = [];
  isDatewiseMeal:boolean = false

  ngOnInit(): void {
    this.mealService.getMeals().subscribe((res) => { 
      this.meal_types = res;
    });

    this.id = this.activatedRouteService.snapshot.params['id'];
    if(this.id){
      this.saveBtn = 'Update';
      this.page = 'Edit';
      this.mealService.getDateWiseMealDetail(this.id).subscribe((res) => {       
        this.meal = res;
        this.meal_types.data?.push(this.meal.data.meal);
        this.meal_types.data = this.meal_types.data?.filter(
          (thing:any, i:any, arr:any) => arr.findIndex((t: any) => t.id === thing.id) === i
        );
        const selectedRange:any =   {
          startDate: moment(this.meal?.data?.date),
          endDate: moment(this.meal?.data?.end_date ?? this.meal?.data?.date)
        };
        this.form.patchValue({
            meal_id: this.meal.data.meal_id,
            selectedDate: selectedRange ?? null,
            status: this.meal.data.status,
        });
      });
    }
  }
// ng select 
//   student = [
//     {
//         id: 1,
//         name: 'Student 1',
//         avatar: '//www.gravatar.com/avatar/b0d8c6e5ea589e6fc3d3e08afb1873bb?d=retro&r=g&s=30 2x'
//     },
//     { id: 2, name: 'Student 2', avatar: '//www.gravatar.com/avatar/ddac2aa63ce82315b513be9dc93336e5?d=retro&r=g&s=15' },
//     {
//         id: 3,
//         name: 'Student 3',
//         avatar: '//www.gravatar.com/avatar/6acb7abf486516ab7fb0a6efa372042b?d=retro&r=g&s=15'
//     },
//     {
//         id: 4,
//         name: 'Student 4',
//         avatar: '//www.gravatar.com/avatar/b0d8c6e5ea589e6fc3d3e08afb1873bb?d=retro&r=g&s=30 2x'
//     },
// ];
// selectedStudent = this.student[0].name;

  form = this.fb.group({
    meal_id: ['',[Validators.required]],
    selectedDate: ['',[Validators.required]],
    status: ['active'],
  });

  submit(): void{
    this.isDatewiseMeal = true
    const payload:any = this.form.value
    payload.end_date = payload?.selectedDate?.endDate.format('YYYY-MM-DD')
    payload.date = payload?.selectedDate?.startDate.format('YYYY-MM-DD')

    delete payload.selectedDate
    if(this.id){
      // Object.assign(this.form.value, {id:this.id});
      var request = this.mealService.updateDateWiseMeal(payload,this.id)
    }else{
      var request = this.mealService.addDateWiseMeal(payload)
    }
    request.subscribe((res:any) => { 
      this.isDatewiseMeal = false 
      if(res.status) {
        this.toastr.showSuccess(res.message);
        this.router.navigate([this.setUrl(URLConstants.DATE_WISE_MEALS_LIST)]);  
      } else {
        this.toastr.showError(res.message);
      }
    },(err:any)=>{
      this.isDatewiseMeal = false
      this.toastr.showError(err.error.message);
    });
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
}
