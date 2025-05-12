import { Injectable } from '@angular/core';
import { enviroment } from '../../../environments/environment.staging';
import { HttpClient } from '@angular/common/http';
import { callAPIConstants } from 'src/app/shared/constants/callAPI-constants';

@Injectable({
  providedIn: 'root'
})
export class MealService {

  private API_URL = enviroment.apiUrl;

  constructor(private httpRequest: HttpClient) { }

  //Meal Detail
  getMealList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/meal-datatable',params);
  }

  getPaginate(url:any){
    return this.httpRequest.get(url);
  }

  getMeals(){
    return this.httpRequest.post(this.API_URL+'api/meal-list',{});
  }

  getMealDetail(id:number){
    return this.httpRequest.post(this.API_URL+'api/meal/show/'+id, []);
  }

  addMeal(paraAddMeal:any) {       
    return this.httpRequest.post(this.API_URL+'api/meal',paraAddMeal);
  }

  saveMeal(paraSaveMeal:any,id:number){
    if(id == null){
      this.addMeal(paraSaveMeal);
    }else{
      this.updateMeal(paraSaveMeal,id);
    }
  }

  updateMeal(paraUpdateMeal:any,id:number){
    return this.httpRequest.put(this.API_URL+'api/meal/'+id,paraUpdateMeal);
  }

  deleteMeal(id:number){
    return this.httpRequest.post(this.API_URL+'api/meal/delete/'+id,id);
  }

  //Date Wise Meal
  getDateWiseMealList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/date-wise-meal-datatable',params);
  }

  getDateWiseMealDetail(id:number){
    return this.httpRequest.post(this.API_URL+'api/date-wise-meal/show/'+id,id);
  }

  addDateWiseMeal(paraAddDateWiseMeal:any) {       
    return this.httpRequest.post(this.API_URL+'api/date-wise-meal',paraAddDateWiseMeal);
  }

  updateDateWiseMeal(paraUpdateDateWiseMeal:any,id:number) {       
    return this.httpRequest.put(this.API_URL+'api/date-wise-meal/'+id,paraUpdateDateWiseMeal);
  }

  deleteDateWiseMeal(id:number) {       
    return this.httpRequest.post(this.API_URL+'api/date-wise-meal/'+id,id);
  }
}

class DataTablesResponse {
  data: any = [];
  draw: number = 0;
  recordsFiltered: number = 0;
  recordsTotal: number = 0;
}