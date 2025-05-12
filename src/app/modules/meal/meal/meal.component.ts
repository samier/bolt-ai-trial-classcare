import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Injectable } from '@angular/core'; 
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from '../../../core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { MealService } from '../meal.service';
import { CommonService } from 'src/app/core/services/common.service';

@Injectable()

@Component({
  selector: 'app-meal',
  templateUrl: './meal.component.html',
  styleUrls: ['./meal.component.scss']
})
export class MealComponent {
  
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

  ngOnInit(): void {
    this.id = this.activatedRouteService.snapshot.params['id'];
    if(this.id){
      this.saveBtn = 'Update';
      this.page = 'Edit';
      this.mealService.getMealDetail(this.id).subscribe((res) => {  
        this.meal = res;
        this.form.patchValue({
            meal_type: this.meal.data.meal_type,
            meal_description: this.meal.data.meal_description,
            status: this.meal.data.status,
        });  
      });
    }
  }

  form = this.fb.group({
    meal_type: ['',[Validators.required]],
    meal_description: ['',[Validators.required]],
    status: ['active'],
  });

  submit(): void{
    if(this.id){
      Object.assign(this.form.value, {id:this.id});
      var request = this.mealService.updateMeal(this.form.value,this.id)
    }else{
      var request = this.mealService.addMeal(this.form.value)
    }
    request.subscribe((res:any) => {  
        this.toastr.showSuccess(res.message);
        this.router.navigate([this.setUrl(URLConstants.MEALS_LIST)]);  
      },(err:any)=>{
        this.toastr.showError(err.error.message);
      }); 
  }
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
}
