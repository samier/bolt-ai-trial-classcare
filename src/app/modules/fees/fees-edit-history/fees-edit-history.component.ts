import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-fees-edit-history',
  templateUrl: './fees-edit-history.component.html',
  styleUrls: ['./fees-edit-history.component.scss']
})
export class FeesEditHistoryComponent implements OnInit {

  fees:any;

  constructor(
    private modalRef: NgbActiveModal,
    public  dateFormateService : DateFormatService,
  ) { }

  ngOnInit(): void {
  }

  closeModal() {
    this.modalRef.close();
  }

  decodeString(string:any) {
    const txt = document.createElement('textarea');
    txt.innerHTML = string;
    return txt.value;
  }
}
