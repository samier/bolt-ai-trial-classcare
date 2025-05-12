import { Component } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ReportService } from 'src/app/modules/report/report.service';
import { Toastr } from '../../../core/services/toastr';

@Component({
  selector: 'app-send-message',
  templateUrl: './send-message.component.html',
  styleUrls: ['./send-message.component.scss']
})
export class SendMessageComponent {
  to:string = 'both';
  students:any = [];
  constructor(
    public modalRef: NgbActiveModal,
    private reportService:ReportService,
    private toastr: Toastr,
  ){
  }

  closeModal() {
    this.modalRef.dismiss();
  }

  send(){
    if(this.students.length == 0){
      alert('please select atleast one student');
      return;
    }
    const params = {
      'students':this.students,
      'to':this.to
    };
    this.reportService.sendMessage(params).subscribe((res: any) => {
      this.toastr.showSuccess(res.message);
      this.modalRef.dismiss();
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });
  }
}
