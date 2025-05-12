import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-field-value',
  templateUrl: './field-value.component.html',
  styleUrls: ['./field-value.component.scss']
})
export class FieldValueComponent implements OnInit {
  //#region Public | Private Variables

  template:any;
  values:any = {};
  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(
    private modalRef: NgbActiveModal,
    private toastr: Toastr,
  ) { }
  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
  }
  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  closeModal(save = false) {
    if(save){
      try{
        this.template?.variables?.forEach((variable:any)=>{
          if(variable.includes('*') && !this.values[variable]){
            throw new Error('Please Enter '+this.decodeName(variable,true));
          }
        })
        this.modalRef.close({status:true,values:this.values});
      } catch (error:any){
        this.toastr.showError(error.message);    
      }
    }else{
      this.modalRef.close();
    }
  }

  decodeName(variable:any,placeHolder = false){
    let formatted = variable.replace(/[{}]/g, '');
    formatted = formatted.replace(/_/g, ' ');
    if(placeHolder){
      formatted = formatted.replace(/[*]/g, '');
    }
    formatted = formatted.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
    return formatted.trim();
  }
  //#endregion Public methods
}
