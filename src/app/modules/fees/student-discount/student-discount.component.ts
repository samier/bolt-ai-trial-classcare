import { Component, ViewChild, OnInit, Output, EventEmitter} from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { DataTableDirective } from 'angular-datatables';
import { FeesService } from '../fees.service';
import { FormControl, FormGroup } from '@angular/forms';
import { Toastr } from 'src/app/core/services/toastr';

interface FeesType {
  id: any;
  type_name: any;
}
interface StudentName {
  id: any;
  name: any;
}
@Component({
  selector: 'app-student-discount',
  templateUrl: './student-discount.component.html',
  styleUrls: ['./student-discount.component.scss']
})
export class StudentDiscountComponent implements OnInit{
  URLConstants = URLConstants;

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  tbody:any;
  class_list:any=[];
  batch_list:any=[];
  student_list:any=[];
  fees_type_list:any=[];
  discount_type_list:any=[];
  course_id:any='';
  selectedClass:any=[];
  studentDiscountForm:any;
  monthwise_discount:any=[];
  fees_type_name:any=[];
  selectedStudents: any = [];
  classDropdownSettings: IDropdownSettings = {};
  selectedFeesType: any = [];
  feesDropdownSettings:IDropdownSettings = {};
  @Output() clicked = new EventEmitter<{id:number}>();
  constructor(private feeSerivce:FeesService,private toastr: Toastr){

    this.studentDiscountForm = new FormGroup({
      class_id: new FormControl(''),
      batch_id: new FormControl(''),
      student_id: new FormControl(''),
      fees_type_id: new FormControl(''),
      month_list: new FormControl(''),
      discount_type_id: new FormControl(''),
      record_id:new FormControl(0),
    });

  }
  
  changePage(){
    console.log("before emmiting event");
    this.clicked.emit({id:1});
    console.log("after emmiting event");
  }

  dropdownList:any  = [];
  selectedItems:any = [];
  dropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  Authority: any = [
    {id:1,name:"Authority 1"},
    {id:2,name:"Authority 2"},
    {id:3,name:"Authority 3"},
  ];
  params:any = {   
    rte:[],
  };
  feesTypeArr: FeesType[] = [];
  studentArr: StudentName[] = [];

  ngOnInit() {
    this.getClassList();
    this.getDiscountTypeList();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
     columns: [
        { data: 'Sr.No.' }, 
        { data: 'Discount Type' }, 
        { data: 'Class' }, 
        { data: 'Batch' },
        { data: 'Student Name' },
        { data: 'Fees Type' },
        { data: 'Discount Value' },        
        { data: 'Month Wise' },        
        { data: 'action',orderable:false,searchable:false },
      ]
    };
    
    this.classDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };

    this.feesDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'type_name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
  }

  
  loadData(dataTablesParameters?: any, callback?:any ){
    dataTablesParameters = {
      ...dataTablesParameters,
      ...this.params,
    };
    this.feeSerivce.getStudentDiscountList(dataTablesParameters).subscribe((resp:any) => {
      this.tbody = resp.data;   
      console.log(this.tbody);         
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

  onItemSelect(item: any) {
    this.feeMonthChange();
  }
  onSelectAll(items: any) {
    this.feeMonthChange();
  }

  getClassList(){
    this.feeSerivce.getClassList().subscribe((resp:any) => {
      this.class_list=resp.data;
      //console.log(resp.data);
    });
  }
  classChange(event:any){
    //this.studentDiscountForm.get('batch_id').value = '';
    this.studentDiscountForm.controls['batch_id'].setValue('');    
    this.studentDiscountForm.controls['student_id'].setValue('');    
    this.getBatchListByClassId(event.id);
    this.course_id = event.course_id;
 
    
    //clear everything
    this.selectedItems=[];
    this.feeMonthChange();
  }
  getBatchListByClassId(class_id:any){
    this.feeSerivce.getBatchListByClassId(class_id).subscribe((resp:any) => {
      this.batch_list=resp.data;
      //console.log(resp.data);
    });
  }
  batchChange(event:any){
    //console.log(event.id);
    this.studentDiscountForm.controls['student_id'].setValue('');    
    this.getStudentListByBatchId(event.id);
    this.selectedItems=[];
    this.feeMonthChange();
  }

  studentChange(event:any){
    this.studentDiscountForm.controls['fees_type_id'].reset();
    this.getFeesTypes(this.course_id,null,event.id,null);
  }
  getStudentListByBatchId(batch_id:any){
    this.feeSerivce.getStudentListByBatchId(batch_id).subscribe((resp:any) => {
      this.student_list=resp.data;
      console.log(this.student_list);
    });
  }

  getFeesTypes(course_id:any,fees_type_id=null,student_id=null,fees_type_name:any){    
    this.selectedFeesType = [];
    let data = {
      class_id: this.selectedClass,
      student_id : student_id
    }
    this.feeSerivce.getFeesTypes(data).subscribe((resp:any) => {
      this.fees_type_list=resp.data;      
      if(fees_type_id != null){ 
          
        const feesTypeId: FeesType = {id:fees_type_id, type_name:fees_type_name};       
        this.feesTypeArr = [];
        this.feesTypeArr.push(feesTypeId);
        this.selectedFeesType = this.feesTypeArr;
        // this.studentDiscountForm.controls['fees_type_id'].setValue(feesType); 
        //this.fees_type_name = this.studentDiscountForm.get("fees_type_id").value;
      }
    });
  }

  getMonthList(type:any,fees_type_id:any){  
    let student_id = this.studentDiscountForm.get("student_id").value;  
    this.feeSerivce.getFeesTypeMonths(type,this.selectedClass,fees_type_id,student_id).subscribe((resp:any) => {
      this.dropdownList=resp.data;      
      if(resp.status==false){
        this.toastr.showError(resp.message);
      }
    });
  }

  feesTypeChange(event:any){

    let student_id = this.studentDiscountForm.get("student_id").value;
    if(student_id == ''){
      alert("Please select student first");    
      this.studentDiscountForm.controls["fees_type_id"].reset();
    }else{
    //console.log(event);
    let type=1;
    this.fees_type_name=event.type_name;
    if(event.id != 0){
      type=2;      
    }    
    if(event.type_name=="Transport Fees"){
      type=3;
    }

    this.getMonthList(type,event.id);
    this.selectedItems=[];
    this.feeMonthChange();
    }
  }

  getDiscountTypeList(){    
    this.feeSerivce.getDiscountTypeListDropdown().subscribe((resp:any) => {
      this.discount_type_list=resp.data;      
    });
  }

  feeMonthChange(){
    this.studentDiscountForm.controls['discount_type_id'].setValue(''); 
    this.monthwise_discount=[];
  }
  discountTypeChange(event:any){
    let amount = event.discount_value;
    let lable  = "";
    let totalDiscount=0;
    let array:any=[];
    this.selectedItems.forEach(function (value:any){      
      let month_amount = [];

      if(value.item_text == undefined)
        month_amount = value.split("-");
      else
       month_amount  = value.item_text.split("-");

      let discount=0;
        if(event.discount_in == 1){
          let amount_monthly_fee = parseFloat(month_amount[1]);
          discount = amount_monthly_fee - amount;
          if(discount < 0){
            alert("Discount is more than actual amount for month "+month_amount[0]+". Please check.");
            discount=0;
          }
        }else{
          let amount_monthly_fee = parseFloat(month_amount[1]);
          let percentage = (amount_monthly_fee * amount)/100;
          discount = amount_monthly_fee - percentage;
          if(discount < 0){
            alert("Discount is more than actual amount for month "+month_amount[0]+". Please check.");
            discount=0;
          }
        }
        totalDiscount = totalDiscount + discount;
        lable =discount+'-'+month_amount[0];
        array.push(lable);       
      });
      this.monthwise_discount=array;
    //console.log(this.monthwise_discount);
  }


  onSubmit(){
    let payload = this.studentDiscountForm.value;
    Object.assign(payload)
    this.addDiscountType(payload);                    
  }    
  
  student_array:any = [];
  fees_type_id_array:any = [];
  fees_type_name_array:any = [];
  addDiscountType(payload:any)
  {
    this.student_array = this.selectedStudents;
    let ids = this.student_array.map((item:any) => item.id); 
    this.fees_type_id_array = this.selectedFeesType;
    let id = this.fees_type_id_array.map((item:any) => item.id); 
    this.fees_type_name_array = this.selectedFeesType;
    let name = this.fees_type_name_array.map((item:any) => item.type_name); 
      
      Object.assign(payload, { 
        students:ids,
        fees_type:id,
        fees_type_name:name,
      });
    this.feeSerivce.addStudentDiscountForm(payload).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.studentDiscountForm.reset();
        this.reloadData();
        this.toastr.showSuccess(res.message);        
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });    
  }  

  textWithNewline(item:any){
    return item.split(",").join("<br>")
  }

  delete(id:number){
    let c = confirm("Are you sure ? You want to delete it ?");
    if(c){
      this.feeSerivce.deleteStudentDiscount(id).subscribe((res:any) => {      
        //console.log(res); 
        if(res.status==false){
          this.toastr.showError(res.message);
        }else{
          this.toastr.showSuccess(res.message);        
        }    
        this.reloadData();
      });             
    }
  }

  show(id:any){  
    this.selectedStudents = [];
    this.selectedFeesType = [];
    this.studentDiscountForm.reset();    
    this.feeSerivce.getStudentDiscountDetail(id).subscribe((resp:any) => {
      let class_id = resp.data.student.batch_detail_with_class.class.id;
      let batch_id = resp.data.student.batch_detail_with_class.id;
      let course_id = resp.data.student.batch_detail_with_class.class.course_id;
      this.course_id=course_id;
      let fees_type_id = resp.data.fees_type;
      let fees_type_name = resp.data.fees_type_name;
      let student_id = resp.data.student.id;
      let student_name = resp.data.student.first_name+''+resp.data.student.last_name;
      let discount_type = resp.data.discount_type.discount_in;
      let amount = resp.data.discount_type.discount_value;
      let discount_type_id = resp.data.discount_type.id;
      let selected_months = resp.data.selected_months;    
      //console.log(selected_months); 
      this.studentDiscountForm.controls['class_id'].setValue(class_id); 
      this.studentDiscountForm.controls['record_id'].setValue(resp.data.id); 
           
      this.getBatchListByClassIdForEdit(class_id,batch_id);
      this.getStudentListByBatchIdForEdit(batch_id,student_id,student_name);           
      //this.discount_type_list=resp.data;  
      let fees_category_type_id:any = 2;
      if(resp.data.fees_type_name=="Transport Fees"){
         fees_category_type_id=3;
         this.fees_type_name="Transport Fees";
      }else if(resp.data.fees_type_name=="Main School Fees" || resp.data.fees_type_name=="Main School Fee"){
        fees_category_type_id=1;
      }
      this.getFeesTypes(course_id,fees_type_id,student_id,fees_type_name);   
      this.getMonthListForEdit(discount_type,fees_type_id,selected_months,discount_type_id,amount,student_id,fees_category_type_id);
    });
  }

  getBatchListByClassIdForEdit(class_id:any,batch_id:any){
    this.feeSerivce.getBatchListByClassId(class_id).subscribe((resp:any) => {
      this.batch_list=resp.data;
      this.studentDiscountForm.controls['batch_id'].setValue(batch_id); 
    });
  }

  getStudentListByBatchIdForEdit(batch_id:any,student_id:any,student_name:any){
    this.selectedStudents = [];
    this.feeSerivce.getStudentListByBatchId(batch_id).subscribe((resp:any) => {
      this.student_list=resp.data;      
      const studentId: StudentName = {id:student_id, name:student_name};   
      this.studentArr = [];
        this.studentArr.push(studentId);
        this.selectedStudents = this.studentArr;
      // this.studentDiscountForm.controls['student_id'].setValue(this.selectedStudents); 
    });
  }

  getMonthListForEdit(type:any,fees_type_id:any,selected_months:any,discount_type_id:any,amount:any,student_id=null,fees_category_type_id=null){       
    this.feeSerivce.getFeesTypeMonths(fees_category_type_id,this.course_id,fees_type_id,student_id).subscribe((resp:any) => {
      console.log(fees_category_type_id,this.course_id,fees_type_id,student_id);
      this.dropdownList=resp.data;  
      console.log("dropdownList:");
      console.log(resp);

      this.selectedItems = selected_months;  
      this.studentDiscountForm.controls['discount_type_id'].setValue(discount_type_id); 
    
      let lable  = "";
      let totalDiscount=0;
      let array:any=[];
      this.selectedItems.forEach(function (value:any){      
        let month_amount = value.item_text.split("-");
        let discount=0;
          if(type == 1){
            discount = parseFloat(month_amount[1]) - amount;
          }else{
            let percentage = (parseFloat(month_amount[1]) * amount)/100;
            discount = month_amount[1] - percentage;
          }
          totalDiscount = totalDiscount + discount;
          lable =discount+'-'+month_amount[0];
          array.push(lable);       
        });
        this.monthwise_discount=array;
    });
    window.scroll(0,0);
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
    cancel(){
      this.studentDiscountForm.reset();
      this.monthwise_discount = [];
    }

    onCheckboxChange(event:any)
    {
      const checkboxElement = event.target;
      const isChecked = checkboxElement.checked;    
      
      if (isChecked) {
        this.params.rte = isChecked;
        this.reloadData();
      } else {      
        this.params.rte = isChecked;      
        this.reloadData();
      }
    }

    onStudentEmployeeSelect()
    {

    }

    handleFeesType()
    {
      
    }
}
