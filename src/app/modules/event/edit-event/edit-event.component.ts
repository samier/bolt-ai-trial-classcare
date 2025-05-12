import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { EventService } from '../event.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { DatePipe } from '@angular/common';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { CommonService } from 'src/app/core/services/common.service';
interface Batch {
  id: any;
  name: any;
}
@Component({
  selector: 'app-edit-event',
  templateUrl: './edit-event.component.html',
  styleUrls: ['./edit-event.component.scss']
})
export class EditEventComponent implements OnInit {

  public branch_id = window.localStorage?.getItem("branch");  
  submitted:any=false;
  public valid = true;
  public id:any;
  batches:any = [];
  selectedBatch:any = [];
  eventType = [];
  selectedEventType:any ='';
  color = [];
  assignTo:any;
  public batchees=false;
  public faculty=false;
  public all=false;
  batchesArr: Batch[] = [];

  constructor(private eventService: EventService,private router:Router,private toastr: Toastr,private route: ActivatedRoute, public datePipe: DatePipe, public CommonService: CommonService,) { 
    this.id = this.route.snapshot.paramMap.get('id');
    this.leavecreateform = new FormGroup({            
      assignTo: new FormControl('',[Validators.required]),       
      batch: new FormControl(''),
      event_name: new FormControl('',[Validators.required]),
      start_date: new FormControl('',[Validators.required]),
      end_date: new FormControl('',[Validators.required]),
      event_type_id: new FormControl('',[Validators.required]),
      color: new FormControl('',[Validators.required]),
      description: new FormControl('',[Validators.required]),       
    });
  }

  URLConstants = URLConstants;
  leavecreateform: FormGroup;
  classDropdownSettings: IDropdownSettings = {};
  ngOnInit(): void {
    this.getBatchList();  

    this.eventService.getEventTypeList().subscribe((res: any) => {
      this.eventType =res.data;
  });

    this.getData();
    this.classDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
  }

  getData()
  {
    this.eventService.getData(this.id).subscribe((res:any) => {  
      
      if(res.data[0].assignTo == 1){
        this.batchees = true;
      }else if(res.data[0].assignTo == 2){
        this.faculty = true;
      }else
      {
        this.all = true;
      }   
      
        
      for(let batchData of res?.data[1]) {
        const batch: Batch = {id:Number(batchData?.pivot?.batch_id), name:batchData?.name};
        this.batchesArr.push(batch);
      }      
      this.selectedBatch = this.batchesArr;
      
      this.leavecreateform.get('assignTo')?.setValue(res.data[0].assignTo);
      this.leavecreateform.get('batch')?.setValue(this.selectedBatch);
      this.leavecreateform.get('event_name')?.setValue(res.data[0].event_name);
      this.leavecreateform.get('start_date')?.setValue(this.datePipe.transform(res.data[0].start_date,'yyyy-MM-dd'));
      this.leavecreateform.get('end_date')?.setValue(this.datePipe.transform(res.data[0].end_date,'yyyy-MM-dd'));
      this.leavecreateform.get('event_type_id')?.setValue(res.data[0].event_type_id);
      this.leavecreateform.get('description')?.setValue(res.data[0].description);
      this.leavecreateform.get('color')?.setValue(res.data[0].color);
      
    });
  }

  getBatchList()
  {
    this.eventService.getBatchList(this.branch_id).subscribe((res: any) => {
      this.batches = res.data;
  });
  }

  eventTypeChange()
  { 
    this.color = [];
    this.eventService.getColorList(this.leavecreateform.value.event_type_id).subscribe((res: any) => {      
      this.leavecreateform.get('color')?.setValue(res.data.color);        
  });
  }

  fun2(id:any){
    if(id == 1){
      this.getBatchList();       
      this.batchees = true;
      this.faculty = false;
      this.all = false;           
    }else{
     this.selectedBatch = [];
     this.leavecreateform.value.batch = '';
     this.batchees = false;     
    }
  }
  batch_array:any = [];
  onSubmit() {
    this.submitted=true;
    this.valid=true;     
       
    if(this.leavecreateform.value.assignTo == 1)   
    {
      this.batch_array = this.selectedBatch;
      let ids = this.batch_array.map((item:any) => item.id); 
      
      Object.assign(this.leavecreateform.value, { 
        batches:ids,
    });
    }    
    if(this.valid){  
      this.eventService.updateEvent(this.leavecreateform.value,this.id).subscribe((res:any) => {
        
        if(res.status==false){
          this.toastr.showError(res.message);
        }else{
          this.router.navigate([this.setUrl(URLConstants.EVENT_LIST)]);
        } 
      });
    }
    
    return 0;
}

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  
  onBatchSelect()
  {
    
  }
}
