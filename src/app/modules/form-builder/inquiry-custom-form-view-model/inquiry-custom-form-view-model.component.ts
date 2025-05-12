import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-inquiry-custom-form-view-model',
  templateUrl: './inquiry-custom-form-view-model.component.html',
  styleUrls: ['./inquiry-custom-form-view-model.component.scss']
})
export class InquiryCustomFormViewModelComponent implements OnInit {

  @Input() inquiryFormId

  constructor(private modalRef: NgbActiveModal) { }

  ngOnInit(): void {
  }

  closeModal() {
    this.modalRef.dismiss();
  }

}
