import { Component, OnInit } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ActivatedRoute, Router } from '@angular/router';
import { TodaysLectureService } from '../todays-lecture.service';
import {  ModalDismissReasons,  NgbDatepickerModule,  NgbModal,} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { enviroment } from '../../../../environments/environment.staging';
import * as moment from 'moment';

@Component({
  selector: 'app-todays-lecture-list',
  templateUrl: './todays-lecture-list.component.html',
  styleUrls: ['./todays-lecture-list.component.scss']
})
export class TodaysLectureListComponent implements OnInit {

  constructor(
    private TodaysLectureService: TodaysLectureService,
    private activatedRouteService: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal
  ) { 
    this.leavecreateform = new FormGroup({      
      create_at:new FormControl('',[Validators.required]), 
      faculty:new FormControl('',[Validators.required]), 
      start_time:new FormControl('',[Validators.required]), 
      end_time:new FormControl('',[Validators.required]), 
      schedule_topic:new FormControl(''), 
    });
  }
  leavecreateform: FormGroup;
  tbody:any;
  data:any;
  start_time:any;
  end_time:any;
  Faculties = [];
  start_time_;
  selectedFaculty=''
  symfonyHost = enviroment.symfonyHost;

  ngOnInit(): void {
    this.getList();
    this.getAllFaculty();
  }

  setsymfonyUrl(url:string) {
    return this.symfonyHost+window.localStorage.getItem("branch")+'/'+url;
  }

  getAllFaculty(){
    this.TodaysLectureService.getAllFaculty().subscribe((res:any) => {
     console.log('faculty',res);     
     this.Faculties=res.data;     
    }); 
  }

  getList()
  {
    this.TodaysLectureService.getList().subscribe((res: any) => {
      console.log('tbody',res);
      this.tbody = res?.data;
     });
  }

  update(data:any)
  {
    const payload = {
      "faculty_id":this.leavecreateform.value.faculty,
      "start_time": this.leavecreateform.value.start_time,
      "end_time": this.leavecreateform.value.end_time,
      "schedule_topic": this.leavecreateform.value.schedule_topic,     
    } 
    console.log('payload',payload);
    
    this.TodaysLectureService.updateTodaysLecture(data.id,payload).subscribe((res: any) => {
      console.log('update',res); 
      this.modalService.dismissAll()
      this.getList();
     });
  }

  open(content: any, id: any)
  {
    this.TodaysLectureService.getTodaysLectureById(id).subscribe((res: any) => {
      console.log('edit',res);

      this.data = res?.data; 
      this.leavecreateform.get('faculty')?.setValue(res?.data?.faculty?.id);
      this.leavecreateform.get('create_at')?.setValue(res?.data?.create_at);      
      this.leavecreateform.get('start_time')?.setValue(moment(res?.data?.start_time).format('hh:mm'));
      this.leavecreateform.get('end_time')?.setValue(moment(res?.data?.end_time).format('hh:mm'));
      this.leavecreateform.get('schedule_topic')?.setValue(res?.data?.schedule_topic);
      // this.start_time = moment(res?.data?.start_time).format("hh:mm a");
      // this.end_time = moment(res?.data?.end_time).format("hh:mm a");

      this.modalService
        .open(content, { ariaLabelledBy: 'modal-basic-title', size: 'xxl' })
        .result.then((result) => {
          
          console.log('modal');
          
        });
    });
    
  }

  delete(id:number)
  {
    this.TodaysLectureService.deleteTodaysLecture(id).subscribe((res: any) => {
      this.getList();
     });     
  }

  cancelLecture(id:number)
  {
    let c = confirm("Are you sure ? You want to cancel lecuture?");    
    if(c){
      this.TodaysLectureService.cancelLecture(id).subscribe((res: any) => {        
        this.getList(); 
       });       
    }   
  }

  markAttendance()
  {
    
  }

}
